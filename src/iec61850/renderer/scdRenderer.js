/**
 * SLD Auto-Renderer: converts parsed SCD model into React Flow nodes/edges.
 *
 * Walks: Substation → VoltageLevel → Bay → ConductingEquipment
 *        + ConnectivityNode junction points
 */

import { getEquipmentConfig } from "../model/sclTypes.js";

let idCounter = 0;
const uid = (prefix) => `${prefix}_${++idCounter}`;

/**
 * Map SCL equipment type to our React Flow node type.
 */
function sclTypeToNodeType(sclType) {
  const map = {
    CBR: "CircuitBreakerNode",
    DIS: "SwitchNode",
    VTR: "TransformerNode",
    CTR: "TransformerNode",
    TFL: "TransformerNode",
    GEN: "GeneratorNode",
    MOT: "LoadNode",
    CAP: "CapacitorNode",
    REA: "CapacitorNode",
    GRL: "GroundNode",
    BUS: "BusbarNode",
  };
  return map[sclType] || "CircuitBreakerNode";
}

/**
 * Map SCL equipment type to the data fields our node components expect.
 */
function sclDataToNodeData(equipment, voltageLevel) {
  const cfg = getEquipmentConfig(equipment.type);
  const base = {
    id: equipment.name,
    name: equipment.desc || equipment.name,
    sclType: equipment.type,
    category: cfg.category,
    pathName: equipment.pathName,
  };

  switch (equipment.type) {
    case "CBR":
      return { ...base, status: "closed", voltageRating: voltageLevel || 12, currentRating: 630, tripType: "thermal" };
    case "DIS":
      return { ...base, status: "open", switchType: "disconnector" };
    case "TFL":
      return { ...base, primaryVoltage: voltageLevel || 110, secondaryVoltage: 10, capacity: 50, phase: "three", coolingType: "ONAN" };
    case "VTR":
      return { ...base, primaryVoltage: voltageLevel || 110, secondaryVoltage: 100, capacity: 0.5, phase: "three", coolingType: "ONAN" };
    case "CTR":
      return { ...base, primaryVoltage: voltageLevel || 110, secondaryVoltage: 110, capacity: 0.5, phase: "three", coolingType: "ONAN" };
    case "GEN":
      return { ...base, power: 100, voltage: voltageLevel || 10.5, frequency: 50, fuelType: "diesel", status: "running" };
    case "MOT":
      return { ...base, power: 10, powerFactor: 0.85, loadType: "industrial" };
    case "CAP":
      return { ...base, capacitance: 100, voltage: voltageLevel || 10, status: "connected" };
    case "GRL":
      return { ...base, groundType: "solid", resistance: 0 };
    case "BUS":
      return { ...base, voltageLevel: voltageLevel || 110, busType: "single", ratedCurrent: 2000 };
    default:
      return { ...base, status: "closed", voltageRating: voltageLevel || 12, currentRating: 630, tripType: "thermal" };
  }
}

/**
 * Build edges from connectivity: if equipment A and equipment B
 * share a ConnectivityNode, they are connected.
 */
function buildEdges(nodes) {
  const edges = [];
  const eqNodes = nodes.filter((n) => n.data.pathName);

  // Group equipment by their connected connectivity nodes
  const nodeToEquipment = {};
  eqNodes.forEach((n) => {
    const path = n.data.pathName;
    // The equipment's bay prefix tells us what busbar/node it sits on
    const parts = path.split("/");
    if (parts.length >= 3) {
      const bayPrefix = parts.slice(0, 3).join("/");
      if (!nodeToEquipment[bayPrefix]) nodeToEquipment[bayPrefix] = [];
      nodeToEquipment[bayPrefix].push(n.id);
    }
  });

  // Connect equipment within the same bay sequentially
  Object.values(nodeToEquipment).forEach((eqIds) => {
    for (let i = 0; i < eqIds.length - 1; i++) {
      const existingEdge = edges.find(
        (e) => (e.source === eqIds[i] && e.target === eqIds[i + 1]) ||
               (e.source === eqIds[i + 1] && e.target === eqIds[i])
      );
      if (!existingEdge) {
        edges.push({
          id: uid("edge"),
          source: eqIds[i],
          target: eqIds[i + 1],
          type: "smoothstep",
          animated: false,
        });
      }
    }
  });

  // Also connect equipment across voltage levels via transformers
  const transformers = eqNodes.filter((n) =>
    ["TFL", "VTR", "CTR"].includes(n.data.sclType)
  );
  transformers.forEach((tf) => {
    const parts = (tf.data.pathName || "").split("/");
    if (parts.length >= 3) {
      // Find equipment in adjacent bays that might connect through this transformer
      const vlPrefix = parts.slice(0, 2).join("/");
      const otherBays = eqNodes.filter((n) => {
        const nParts = (n.data.pathName || "").split("/");
        return nParts.slice(0, 2).join("/") === vlPrefix && n.id !== tf.id;
      });

      // Connect transformer to nearest equipment in same bay
      const sameBay = eqNodes.filter((n) => {
        const nParts = (n.data.pathName || "").split("/");
        return nParts.slice(0, 3).join("/") === parts.slice(0, 3).join("/") && n.id !== tf.id;
      });

      sameBay.forEach((eq) => {
        const exists = edges.find(
          (e) => (e.source === tf.id && e.target === eq.id) ||
                 (e.source === eq.id && e.target === tf.id)
        );
        if (!exists) {
          edges.push({
            id: uid("edge"),
            source: tf.id,
            target: eq.id,
            type: "smoothstep",
            animated: false,
          });
        }
      });
    }
  });

  return edges;
}

/**
 * Convert a full SCD model to React Flow nodes + edges.
 * @param {import("../model/sclTypes.js").ScdModel} scdModel
 * @returns {{ nodes: Array, edges: Array }}
 */
export function renderScdToFlow(scdModel) {
  idCounter = 0;
  const nodes = [];
  const edges = [];

  if (!scdModel || !scdModel.substations) return { nodes, edges };

  scdModel.substations.forEach((sub) => {
    sub.voltageLevels.forEach((vl) => {
      const voltage = vl.voltage || 110;

      vl.bays.forEach((bay, bayIdx) => {
        // Create a bay header node (acts as busbar)
        const bayNodeId = uid("bay");
        const bayY = bayIdx * 180;

        // Add busbar-style node for the bay
        nodes.push({
          id: bayNodeId,
          type: "BusbarNode",
          position: { x: 100, y: bayY },
          data: {
            id: bay.name || `BAY-${bayIdx}`,
            name: bay.desc || bay.name || `Bay ${bayIdx + 1}`,
            voltageLevel: voltage,
            busType: "single",
            ratedCurrent: 2000,
            sclPath: bay.pathName,
          },
        });

        // Add each conducting equipment
        const bayEquipment = bay.conductingEquipment;
        bayEquipment.forEach((eq, eqIdx) => {
          const nodeId = uid("eq");
          const nodeType = sclTypeToNodeType(eq.type);
          const x = 300 + eqIdx * 200;
          const y = bayY;

          nodes.push({
            id: nodeId,
            type: nodeType,
            position: { x, y },
            data: sclDataToNodeData(eq, voltage),
          });

          // Connect first equipment to bay busbar
          if (eqIdx === 0) {
            edges.push({
              id: uid("edge"),
              source: bayNodeId,
              target: nodeId,
              type: "smoothstep",
              animated: false,
            });
          }
        });

        // Connect sequential equipment in the bay
        for (let i = 0; i < bayEquipment.length - 1; i++) {
          const sourceNode = nodes.find(
            (n) => n.data.pathName === bayEquipment[i].pathName ||
                   n.data.id === bayEquipment[i].name
          );
          const targetNode = nodes.find(
            (n) => n.data.pathName === bayEquipment[i + 1].pathName ||
                   n.data.id === bayEquipment[i + 1].name
          );
          if (sourceNode && targetNode) {
            const exists = edges.find(
              (e) => e.source === sourceNode.id && e.target === targetNode.id
            );
            if (!exists) {
              edges.push({
                id: uid("edge"),
                source: sourceNode.id,
                target: targetNode.id,
                type: "smoothstep",
                animated: false,
              });
            }
          }
        }
      });
    });
  });

  // If no substations defined, create nodes from IEDs
  if (nodes.length === 0 && scdModel.ieds && scdModel.ieds.length > 0) {
    scdModel.ieds.forEach((ied, iedIdx) => {
      const nodeId = uid("ied");
      nodes.push({
        id: nodeId,
        type: "CircuitBreakerNode",
        position: { x: 100 + iedIdx * 250, y: 100 },
        data: {
          id: ied.name,
          name: ied.desc || ied.name,
          status: "closed",
          voltageRating: 12,
          currentRating: 630,
          tripType: "thermal",
          manufacturer: ied.manufacturer,
          iedType: ied.type,
        },
      });

      // Connect IEDs sequentially
      if (iedIdx > 0) {
        edges.push({
          id: uid("edge"),
          source: `ied_${iedIdx}`,
          target: nodeId,
          type: "smoothstep",
          animated: false,
        });
      }
    });
  }

  return { nodes, edges };
}
