/**
 * Traditional SLD (Single Line Diagram) layout engine.
 * Converts topology into bus-and-bay format:
 *
 *   ┌─────────────── Generator ──────────────┐
 *   │                                         │
 *   ════════════ Busbar 110kV ═══════════════
 *   │                    │                    │
 *   │               Transformer               │
 *   │                    │                    │
 *   ════════════ Busbar 10kV ════════════════
 *   │         │         │         │           │
 *   CB        CB        CB        CB
 *   │         │         │         │
 *  Load      Load      Load      Load
 */

const NODE_W = 120;
const NODE_H = 70;
const BAY_W = 160;
const BAY_GAP = 40;
const LEVEL_GAP = 220;
const VERT_GAP = 100;

/**
 * Classify nodes by their role in the SLD.
 */
function classifyNodes(nodes) {
  const busbars = [];
  const generators = [];
  const transformers = [];
  const loads = [];
  const breakers = [];
  const switches = [];
  const others = [];

  nodes.forEach((n) => {
    const type = n.type?.replace("Node", "") || "";
    const dpsType = n.data?.dpsType;
    const category = n.data?.category;
    const sclType = n.data?.sclType;

    if (type === "Busbar" || dpsType === "PowerDomain" || sclType === "BUS") {
      busbars.push(n);
    } else if (type === "Generator" || dpsType === "PowerSupply" || sclType === "GEN") {
      generators.push(n);
    } else if (type === "Transformer" || dpsType === "PowerDistribution" || sclType === "TFL" || sclType === "VTR" || sclType === "CTR") {
      transformers.push(n);
    } else if (type === "Load" || dpsType === "ComputerSystem" || sclType === "MOT") {
      loads.push(n);
    } else if (type === "CircuitBreaker" || dpsType === "PowerDistribution" || sclType === "CBR") {
      breakers.push(n);
    } else if (type === "Switch" || sclType === "DIS") {
      switches.push(n);
    } else {
      others.push(n);
    }
  });

  return { busbars, generators, transformers, loads, breakers, switches, others };
}

/**
 * Group nodes by voltage level (for busbar hierarchy).
 * Uses voltageLevel, primaryVoltage, or voltage from data.
 */
function groupByVoltage(nodes) {
  const groups = {};
  nodes.forEach((n) => {
    const v = n.data?.voltageLevel || n.data?.primaryVoltage || n.data?.voltage || n.data?.voltageRating || 0;
    if (!groups[v]) groups[v] = [];
    groups[v].push(n);
  });
  // Sort levels descending (highest voltage on top)
  const sorted = Object.entries(groups)
    .sort((a, b) => Number(b[0]) - Number(a[0]));
  return sorted;
}

/**
 * Find what equipment is connected to each busbar.
 * Uses edges to determine connectivity.
 */
function findConnectedEquipment(busbarId, nodes, edges) {
  const connected = [];
  edges.forEach((e) => {
    if (e.source === busbarId) {
      const target = nodes.find((n) => n.id === e.target);
      if (target) connected.push(target);
    }
    if (e.target === busbarId) {
      const source = nodes.find((n) => n.id === e.source);
      if (source) connected.push(source);
    }
  });
  return connected;
}

/**
 * Check if a node is a transformer connecting two voltage levels.
 */
function isCrossVoltageTransformer(node, edges, allNodes) {
  const type = node.type?.replace("Node", "") || "";
  const dpsType = node.data?.dpsType || "";
  const sclType = node.data?.sclType || "";

  return type === "Transformer" || dpsType === "PowerSupply" ||
         ["TFL", "VTR", "CTR"].includes(sclType);
}

/**
 * Traditional SLD layout algorithm.
 *
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {{ nodes: Array, layoutInfo: Object }}
 */
export function sldLayout(nodes, edges) {
  if (nodes.length === 0) return { nodes: [], layoutInfo: {} };

  const classified = classifyNodes(nodes);
  const voltageGroups = groupByVoltage(classified.busbars);

  // If no busbars found, create virtual busbars from voltage levels
  let busbars = classified.busbars;
  if (busbars.length === 0) {
    // No busbars — create one virtual busbar per voltage level
    const voltageLevels = new Set();
    nodes.forEach((n) => {
      const v = n.data?.voltageLevel || n.data?.primaryVoltage || n.data?.voltage || 0;
      if (v > 0) voltageLevels.add(v);
    });

    if (voltageLevels.size === 0) voltageLevels.add(0);

    busbars = Array.from(voltageLevels).sort((a, b) => b - a).map((v, i) => ({
      id: `virtual_bus_${v}`,
      type: "BusbarNode",
      data: {
        id: `BUS-${v}kV`,
        name: `${v > 0 ? v + " kV" : "Bus"} Bus`,
        voltageLevel: v,
        busType: "single",
        ratedCurrent: 2000,
      },
      position: { x: 0, y: 0 },
    }));
  }

  // Re-group by voltage after ensuring busbars exist
  const sortedBusbars = groupByVoltage(busbars);

  const result = [];
  const layoutInfo = {
    busbarPositions: {},
    bayPositions: {},
    voltageLevels: sortedBusbars.map(([v]) => Number(v)),
  };

  let currentY = 60;

  sortedBusbars.forEach(([voltageLevel, busbarNodes], levelIdx) => {
    const busY = currentY;
    const voltage = Number(voltageLevel);

    // Place busbars horizontally
    const busWidth = Math.max(busbarNodes.length * 300, 600);
    busbarNodes.forEach((busNode, bi) => {
      const bx = 100 + bi * (busWidth + 80);
      result.push({
        ...busNode,
        position: { x: bx, y: busY },
      });
      layoutInfo.busbarPositions[busNode.id] = { x: bx, y: busY };
    });

    currentY += 50; // space below busbar

    // Find equipment connected to these busbars
    const connectedEquipment = [];
    busbarNodes.forEach((busNode) => {
      const eq = findConnectedEquipment(busNode.id, nodes, edges);
      connectedEquipment.push(...eq);
    });

    // Separate transformers (they connect to next level) from other equipment
    const localEquipment = connectedEquipment.filter((eq) => !isCrossVoltageTransformer(eq));
    const crossTransformers = connectedEquipment.filter((eq) => isCrossVoltageTransformer(eq));

    // Place local equipment in bays below busbar
    const totalBays = Math.max(localEquipment.length, 3);
    const bayStartX = 100;

    localEquipment.forEach((eq, eqIdx) => {
      const bayX = bayStartX + eqIdx * BAY_W;
      const eqY = currentY;

      result.push({
        ...eq,
        position: { x: bayX, y: eqY },
      });

      // Connect to busbar with vertical edge
      // (edges will be rebuilt separately)

      layoutInfo.bayPositions[eq.id] = { x: bayX, y: eqY, bay: eqIdx, level: levelIdx };
    });

    currentY += VERT_GAP;

    // Place transformers between levels
    if (crossTransformers.length > 0 && levelIdx < sortedBusbars.length - 1) {
      crossTransformers.forEach((tf, tfIdx) => {
        const tx = bayStartX + tfIdx * BAY_W + BAY_W / 2;
        const ty = currentY;

        result.push({
          ...tf,
          position: { x: tx, y: ty },
        });

        layoutInfo.bayPositions[tf.id] = { x: tx, y: ty, bay: tfIdx, level: levelIdx, isTransformer: true };
      });

      currentY += VERT_GAP;
    }
  });

  // Place any remaining nodes that weren't placed
  const placedIds = new Set(result.map((n) => n.id));
  const unplaced = nodes.filter((n) => !placedIds.has(n.id));

  unplaced.forEach((n, i) => {
    result.push({
      ...n,
      position: { x: 100 + i * BAY_W, y: currentY },
    });
  });

  // Rebuild edges based on new positions
  const newEdges = [];
  const nodePositions = {};
  result.forEach((n) => { nodePositions[n.id] = n.position; });

  // Connect busbar to its bays
  sortedBusbars.forEach(([voltageLevel, busbarNodes]) => {
    busbarNodes.forEach((busNode) => {
      const connected = findConnectedEquipment(busNode.id, nodes, edges);
      connected.forEach((eq) => {
        if (nodePositions[eq.id]) {
          newEdges.push({
            id: `sld_e_${busNode.id}_${eq.id}`,
            source: busNode.id,
            target: eq.id,
            type: "smoothstep",
            animated: false,
          });
        }
      });
    });
  });

  // Also keep any edges between non-busbar nodes
  edges.forEach((e) => {
    if (nodePositions[e.source] && nodePositions[e.target]) {
      const exists = newEdges.find(
        (ne) => (ne.source === e.source && ne.target === e.target) ||
               (ne.source === e.target && ne.target === e.source)
      );
      if (!exists) {
        newEdges.push({
          ...e,
          id: `sld_${e.id}`,
          type: "smoothstep",
          animated: false,
        });
      }
    }
  });

  return {
    nodes: result,
    edges: newEdges,
    layoutInfo,
  };
}
