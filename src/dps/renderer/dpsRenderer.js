/**
 * DPS Topology Parser & Renderer.
 * Converts DPS JSON topology → React Flow nodes + edges.
 */

import { DpsEntityTypes } from "../dpsSchema.js";

let idCounter = 200;
const uid = (prefix) => `${prefix}_${++idCounter}`;

/**
 * Format power value for display.
 */
function formatPower(powerValue) {
  if (!powerValue) return null;
  return `${powerValue.Value} ${powerValue.Type}`;
}

/**
 * Create a React Flow node from a DPS entity.
 */
function entityToNode(entity, depth, index) {
  const cfg = DpsEntityTypes[entity.Type] || { symbol: "?", color: "#64748b" };
  const nodeId = uid(entity.Type.toLowerCase());

  const baseData = {
    id: entity.Name,
    name: entity.Name,
    dpsType: entity.Type,
    category: cfg.category,
    model: entity.Model,
    telemetryId: entity.TelemetryId,
    redfish: entity.Redfish,
    policy: entity.Policy,
  };

  // Type-specific data
  if (entity.OperatingLimit) {
    baseData.operatingLimit = formatPower(entity.OperatingLimit.PowerValue);
    baseData.powerFactor = entity.OperatingLimit.PowerFactor;
    baseData.overProvisioning = entity.OverProvisioningPercentage;
  }

  if (entity.Properties) {
    baseData.properties = entity.Properties;
  }

  // Map to our existing node types for rendering
  let nodeType;
  switch (entity.Type) {
    case "PowerDomain":
      nodeType = "BusbarNode"; // domain = bus
      break;
    case "PowerDistribution":
      nodeType = "CircuitBreakerNode"; // PDU = switching
      break;
    case "PowerSupply":
      nodeType = "GeneratorNode"; // PSU = source
      break;
    case "ComputerSystem":
      nodeType = "LoadNode"; // compute = load
      break;
    default:
      nodeType = "CircuitBreakerNode";
  }

  return {
    id: nodeId,
    type: nodeType,
    position: { x: 100 + index * 250, y: depth * 160 },
    data: baseData,
  };
}

/**
 * Parse a DPS topology JSON and render to React Flow.
 * @param {Object} topology - parsed DPS topology JSON
 * @returns {{ nodes: Array, edges: Array }}
 */
export function parseDpsTopology(topology) {
  idCounter = 200;
  const nodes = [];
  const edges = [];

  if (!topology) return { nodes, edges };

  // Build entity lookup
  const entityMap = {};
  if (Array.isArray(topology.Entities)) {
    topology.Entities.forEach((e) => {
      if (e.Name) entityMap[e.Name] = e;
    });
  }

  // Process topology tree
  if (topology.Topology?.Entities) {
    const processEntity = (te, depth, parentFlowId) => {
      // Inline entity or reference
      const entity = te.Type ? te : entityMap[te.Name];
      if (!entity && te.Name) {
        // Reference only — create placeholder
        const node = {
          id: uid("ref"),
          type: "BusbarNode",
          position: { x: 100, y: depth * 160 },
          data: {
            id: te.Name,
            name: te.Name,
            dpsType: "Reference",
            category: "reference",
          },
        };
        nodes.push(node);

        if (parentFlowId) {
          edges.push({
            id: uid("edge"),
            source: parentFlowId,
            target: node.id,
            type: "smoothstep",
            animated: false,
          });
        }

        // Process children
        if (Array.isArray(te.Children)) {
          te.Children.forEach((childRef, i) => {
            const childTe = topology.Topology.Entities.find(
              (e) => (e.Name || e.Type) === childRef || e.Name === childRef
            );
            if (childTe) {
              processEntity(childTe, depth + 1, node.id);
            }
          });
        }
        return;
      }

      if (!entity) return;

      const node = entityToNode(entity, depth, nodes.length);
      nodes.push(node);

      if (parentFlowId) {
        edges.push({
          id: uid("edge"),
          source: parentFlowId,
          target: node.id,
          type: "smoothstep",
          animated: false,
        });
      }

      // Process children
      if (Array.isArray(te.Children)) {
        te.Children.forEach((childRef) => {
          const childTe = topology.Topology.Entities.find(
            (e) => (e.Name || e.Type) === childRef || e.Name === childRef
          );
          if (childTe) {
            processEntity(childTe, depth + 1, node.id);
          } else if (entityMap[childRef]) {
            // Direct entity reference
            const childNode = entityToNode(entityMap[childRef], depth + 1, nodes.length);
            nodes.push(childNode);
            edges.push({
              id: uid("edge"),
              source: node.id,
              target: childNode.id,
              type: "smoothstep",
              animated: false,
            });
          }
        });
      }
    };

    topology.Topology.Entities.forEach((te, i) => {
      processEntity(te, 0, null);
    });
  }

  // If no topology tree, just render all entities
  if (nodes.length === 0 && Array.isArray(topology.Entities)) {
    topology.Entities.forEach((entity, i) => {
      const node = entityToNode(entity, 0, i);
      nodes.push(node);
    });

    // Try to infer connections from entity types
    const pdus = nodes.filter((n) => n.data.dpsType === "PowerDistribution");
    const psus = nodes.filter((n) => n.data.dpsType === "PowerSupply");
    const domains = nodes.filter((n) => n.data.dpsType === "PowerDomain");
    const systems = nodes.filter((n) => n.data.dpsType === "ComputerSystem");

    // Connect PSU → PDU → Domain → System
    psus.forEach((psu, i) => {
      if (pdus[i]) {
        edges.push({ id: uid("edge"), source: psu.id, target: pdus[i].id, type: "smoothstep", animated: false });
      }
    });
    pdus.forEach((pdu, i) => {
      if (domains[i]) {
        edges.push({ id: uid("edge"), source: pdu.id, target: domains[i].id, type: "smoothstep", animated: false });
      }
      if (systems[i]) {
        edges.push({ id: uid("edge"), source: pdu.id, target: systems[i].id, type: "smoothstep", animated: false });
      }
    });
  }

  return { nodes, edges };
}

/**
 * Parse DPS topology JSON string.
 */
export function parseDpsJsonString(jsonString) {
  try {
    const topology = JSON.parse(jsonString);
    return { topology, errors: [] };
  } catch (err) {
    return { topology: null, errors: [`JSON parse error: ${err.message}`] };
  }
}

/**
 * Parse a DPS topology File object.
 */
export function parseDpsFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const { topology, errors } = parseDpsJsonString(e.target.result);
      resolve({ topology, errors });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
