import { create } from "zustand";
import { getDefaultsByType } from "../schemas/sldSchemas";
import { layoutGraph } from "../utils/layout";
import { renderScdToFlow } from "../iec61850/renderer/scdRenderer";
import { parseDpsTopology } from "../dps/renderer/dpsRenderer";
import { liveEngine } from "../iec61850/live/liveEngine";
import { hasPermission, defaultUsers } from "../auth/roles";

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
  dpsTopology: null,
  dpsFileName: null,
  liveMode: false,
  liveStatuses: {},
  alarms: [],

  // ─── Auth / Roles ────────────────────────────────────────────
  currentUser: defaultUsers[0],
  users: defaultUsers,
  impersonating: false,

  switchUser: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) set({ currentUser: user, impersonating: user.id !== defaultUsers[0].id });
  },

  can: (permission) => {
    return hasPermission(get().currentUser.role, permission);
  },

  // ─── Core CRUD ───────────────────────────────────────────────
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  addNode: (type, position) => {
    if (!get().can("edit")) return null;
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
    if (!get().can("edit")) return;
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n
      ),
    });
  },

  deleteNode: (nodeId) => {
    if (!get().can("delete")) return;
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: null,
    });
  },

  addEdge: (edge) => {
    if (!get().can("edit")) return;
    const { edges } = get();
    const id = `e_${edge.source}_${edge.target}`;
    const newEdge = { ...edge, id, type: "smoothstep" };
    set({ edges: [...edges, newEdge] });
  },

  deleteEdge: (edgeId) => {
    if (!get().can("edit")) return;
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
    if (!get().can("import_scd")) return false;
    const { nodes: existingNodes, edges: existingEdges } = get();
    const { nodes: scdNodes, edges: scdEdges } = renderScdToFlow(scdModel);
    const allNodes = [...existingNodes, ...scdNodes];
    const allEdges = [...existingEdges, ...scdEdges];
    const laid = layoutGraph(allNodes, allEdges);
    liveEngine.stop();
    liveEngine.init(laid);
    set({
      nodes: laid, edges: allEdges, scdModel, scdFileName: fileName,
      liveMode: false, liveStatuses: {},
    });
    return true;
  },

  clearScd: () => {
    liveEngine.stop();
    set({ scdModel: null, scdFileName: null, liveMode: false, liveStatuses: {} });
  },

  // ─── DPS Import ───────────────────────────────────────────────

  importDps: (topology, fileName) => {
    if (!get().can("import_dps")) return false;
    const { nodes: existingNodes, edges: existingEdges } = get();
    const { nodes: dpsNodes, edges: dpsEdges } = parseDpsTopology(topology);
    const allNodes = [...existingNodes, ...dpsNodes];
    const allEdges = [...existingEdges, ...dpsEdges];
    const laid = layoutGraph(allNodes, allEdges);
    liveEngine.stop();
    liveEngine.init(laid);
    set({
      nodes: laid, edges: allEdges, dpsTopology: topology, dpsFileName: fileName,
      liveMode: false, liveStatuses: {},
    });
    return true;
  },

  clearDps: () => {
    liveEngine.stop();
    set({ dpsTopology: null, dpsFileName: null, liveMode: false, liveStatuses: {} });
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
      nodes.forEach((n) => {
        if (n.data.status !== undefined) {
          liveEngine.subscribe(n.id, (data) => {
            const { nodes: currentNodes, liveStatuses, alarms } = get();
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

            // Generate alarm on trip
            const newAlarms = [...alarms];
            if (data.stVal === 0 && data.q === "Good") {
              const existingAlarm = newAlarms.find(
                (a) => a.nodeId === n.id && !a.acknowledged
              );
              if (!existingAlarm) {
                newAlarms.push({
                  id: `alarm_${Date.now()}_${n.id}`,
                  nodeId: n.id,
                  nodeName: n.data.name,
                  type: "TRIP",
                  message: `${n.data.name} tripped`,
                  timestamp: data.t,
                  severity: "critical",
                  acknowledged: false,
                });
              }
            }

            set({
              nodes: updatedNodes,
              liveStatuses: {
                ...liveStatuses,
                [n.id]: { status: data.displayStatus, quality: data.q, timestamp: data.t, stVal: data.stVal },
              },
              alarms: newAlarms,
            });
          });
        }
      });
      set({ liveMode: true });
    }
  },

  controlNode: (nodeId, value) => {
    if (!get().can("control")) return;
    liveEngine.control(nodeId, value);
  },

  getLiveStatus: (nodeId) => get().liveStatuses[nodeId] || null,

  // ─── Alarms ────────────────────────────────────────────────────

  acknowledgeAlarm: (alarmId) => {
    if (!get().can("acknowledge_alarms")) return;
    set({
      alarms: get().alarms.map((a) =>
        a.id === alarmId ? { ...a, acknowledged: true } : a
      ),
    });
  },

  acknowledgeAllAlarms: () => {
    if (!get().can("acknowledge_alarms")) return;
    set({
      alarms: get().alarms.map((a) => ({ ...a, acknowledged: true })),
    });
  },

  clearAlarms: () => {
    if (!get().can("delete")) return;
    set({ alarms: [] });
  },

  getActiveAlarmCount: () => get().alarms.filter((a) => !a.acknowledged).length,
}));

export default useSldStore;
