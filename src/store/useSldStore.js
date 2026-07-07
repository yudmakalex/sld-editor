import { create } from "zustand";
import { getDefaultsByType } from "../schemas/sldSchemas";
import { layoutGraph } from "../utils/layout";
import { renderScdToFlow } from "../iec61850/renderer/scdRenderer";
import { liveEngine } from "../iec61850/live/liveEngine";

let nodeIdCounter = 100;
const generateNodeId = () => `node_${++nodeIdCounter}`;

const initialNodes = [
  {
    id: "bus_1",
    type: "BusbarNode",
    position: { x: 300, y: 50 },
    data: { id: "BUS-001", name: "Main Bus 110kV", voltageLevel: 110, busType: "single", ratedCurrent: 2000 },
  },
  {
    id: "gen_1",
    type: "GeneratorNode",
    position: { x: 50, y: 200 },
    data: { id: "GEN-001", name: "Generator 1", power: 100, voltage: 10.5, frequency: 50, fuelType: "diesel", status: "running" },
  },
  {
    id: "tf_1",
    type: "TransformerNode",
    position: { x: 300, y: 200 },
    data: { id: "T-001", name: "Transformer 110/10kV", primaryVoltage: 110, secondaryVoltage: 10, capacity: 50, phase: "three", coolingType: "ONAN" },
  },
  {
    id: "cb_1",
    type: "CircuitBreakerNode",
    position: { x: 550, y: 200 },
    data: { id: "CB-001", name: "Feeder CB-1", status: "closed", voltageRating: 12, currentRating: 630, tripType: "thermal" },
  },
  {
    id: "load_1",
    type: "LoadNode",
    position: { x: 750, y: 200 },
    data: { id: "LOAD-001", name: "Industrial Load", power: 10, powerFactor: 0.85, loadType: "industrial" },
  },
];

const initialEdges = [
  { id: "e-gen1-bus1", source: "gen_1", target: "bus_1", type: "smoothstep", animated: true },
  { id: "e-bus1-tf1", source: "bus_1", target: "tf_1", type: "smoothstep" },
  { id: "e-tf1-cb1", source: "tf_1", target: "cb_1", type: "smoothstep" },
  { id: "e-cb1-load1", source: "cb_1", target: "load_1", type: "smoothstep" },
];

const laidInitial = layoutGraph(initialNodes, initialEdges);

const useSldStore = create((set, get) => ({
  nodes: laidInitial,
  edges: initialEdges,
  selectedNodeId: null,
  scdModel: null,
  scdFileName: null,
  liveMode: false,
  liveStatuses: {},

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  addNode: (type, position) => {
    const { nodes } = get();
    const id = generateNodeId();
    const defaults = getDefaultsByType(type);
    const newNode = {
      id,
      type: `${type}Node`,
      position,
      data: { ...defaults, id: defaults.id || id },
    };
    set({ nodes: [...nodes, newNode], selectedNodeId: id });
    return id;
  },

  updateNodeData: (nodeId, key, value) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n
      ),
    });
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: null,
    });
  },

  addEdge: (edge) => {
    const { edges } = get();
    const id = `e_${edge.source}_${edge.target}`;
    const newEdge = { ...edge, id, type: "smoothstep" };
    set({ edges: [...edges, newEdge] });
  },

  deleteEdge: (edgeId) => {
    const { edges } = get();
    set({ edges: edges.filter((e) => e.id !== edgeId) });
  },

  autoLayout: () => {
    const { nodes, edges } = get();
    const laid = layoutGraph(nodes, edges);
    set({ nodes: laid });
  },

  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find((n) => n.id === selectedNodeId) || null;
  },

  // ─── SCD Import ────────────────────────────────────────────────

  importScd: (scdModel, fileName) => {
    const { nodes: existingNodes, edges: existingEdges } = get();

    const { nodes: scdNodes, edges: scdEdges } = renderScdToFlow(scdModel);

    // Merge: keep existing manual nodes, add SCD nodes
    const allNodes = [...existingNodes, ...scdNodes];
    const allEdges = [...existingEdges, ...scdEdges];

    const laid = layoutGraph(allNodes, allEdges);

    liveEngine.stop();
    liveEngine.init(laid);

    set({
      nodes: laid,
      edges: allEdges,
      scdModel,
      scdFileName: fileName,
      liveMode: false,
      liveStatuses: {},
    });
  },

  clearScd: () => {
    liveEngine.stop();
    set({
      scdModel: null,
      scdFileName: null,
      liveMode: false,
      liveStatuses: {},
    });
  },

  // ─── Live Data ─────────────────────────────────────────────────

  toggleLiveMode: () => {
    const { liveMode, nodes } = get();
    if (liveMode) {
      liveEngine.stop();
      set({ liveMode: false, liveStatuses: {} });
    } else {
      liveEngine.init(nodes);
      liveEngine.start();

      // Subscribe to all nodes
      nodes.forEach((n) => {
        if (n.data.status !== undefined) {
          liveEngine.subscribe(n.id, (data) => {
            const { nodes: currentNodes, liveStatuses } = get();
            const updatedNodes = currentNodes.map((node) => {
              if (node.id !== n.id) return node;
              return {
                ...node,
                data: {
                  ...node.data,
                  status: data.displayStatus,
                  lastQuality: data.q,
                  lastTimestamp: data.t,
                },
              };
            });
            set({
              nodes: updatedNodes,
              liveStatuses: {
                ...liveStatuses,
                [n.id]: {
                  status: data.displayStatus,
                  quality: data.q,
                  timestamp: data.t,
                  stVal: data.stVal,
                },
              },
            });
          });
        }
      });

      set({ liveMode: true });
    }
  },

  controlNode: (nodeId, value) => {
    liveEngine.control(nodeId, value);
  },

  getLiveStatus: (nodeId) => {
    return get().liveStatuses[nodeId] || null;
  },
}));

export default useSldStore;
