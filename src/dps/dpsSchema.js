/**
 * NVIDIA DPS (Data Center Power Services) topology schema.
 * Based on: https://docs.nvidia.com/guides/concepts/topologies/
 */

export const DpsEntityTypes = {
  PowerDomain: {
    label: "Power Domain",
    symbol: "PD",
    color: "#7c3aed",
    category: "power",
    description: "DPS power domain definition — base operating power cap",
  },
  PowerDistribution: {
    label: "Power Distribution",
    symbol: "PDU",
    color: "#2563eb",
    category: "distribution",
    description: "PDU, busway, or power distribution unit",
  },
  PowerSupply: {
    label: "Power Supply",
    symbol: "PSU",
    color: "#16a34a",
    category: "supply",
    description: "AC/DC power supply unit",
  },
  ComputerSystem: {
    label: "Computer System",
    symbol: "GPU",
    color: "#d97706",
    category: "compute",
    description: "Server, GPU node, or compute system",
  },
};

export const PolicyElementTypes = ["Node", "GPU", "CPU", "Memory"];

export const PowerUnits = { W: "Watts", kW: "kW" };

/**
 * Validate a DPS topology JSON against the schema rules.
 * @param {Object} topology
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDpsTopology(topology) {
  const errors = [];

  if (!topology || typeof topology !== "object") {
    errors.push("Topology must be a JSON object");
    return { valid: false, errors };
  }

  // Must have Entities
  if (!Array.isArray(topology.Entities)) {
    errors.push("Missing 'Entities' array");
  } else {
    const names = new Set();
    topology.Entities.forEach((entity, i) => {
      if (!entity.Type) errors.push(`Entity[${i}]: missing 'Type'`);
      if (!entity.Name) errors.push(`Entity[${i}]: missing 'Name'`);
      if (entity.Name && names.has(entity.Name)) {
        errors.push(`Entity[${i}]: duplicate name '${entity.Name}'`);
      }
      if (entity.Name) names.add(entity.Name);

      if (entity.Type && !DpsEntityTypes[entity.Type]) {
        errors.push(`Entity[${i}]: unknown type '${entity.Type}'`);
      }

      if (entity.OperatingLimit?.PowerValue) {
        const pv = entity.OperatingLimit.PowerValue;
        if (pv.Value <= 0) errors.push(`Entity[${i}]: PowerValue.Value must be > 0`);
        if (!["W", "kW"].includes(pv.Type)) errors.push(`Entity[${i}]: PowerValue.Type must be 'W' or 'kW'`);
      }
    });
  }

  // Must have Topology
  if (!topology.Topology || typeof topology.Topology !== "object") {
    errors.push("Missing 'Topology' object");
  } else {
    if (!topology.Topology.Name) errors.push("Topology: missing 'Name'");
    if (Array.isArray(topology.Topology.Entities)) {
      topology.Topology.Entities.forEach((te, i) => {
        if (!te.Name && !te.Type) {
          errors.push(`Topology.Entities[${i}]: must have 'Name' or inline entity`);
        }
      });
    }
  }

  // Policies (optional)
  if (Array.isArray(topology.Policies)) {
    topology.Policies.forEach((policy, i) => {
      if (!policy.Name) errors.push(`Policies[${i}]: missing 'Name'`);
      if (!Array.isArray(policy.Limits)) {
        errors.push(`Policies[${i}]: missing 'Limits' array`);
      } else {
        policy.Limits.forEach((limit, j) => {
          if (!limit.ElementType) errors.push(`Policies[${i}].Limits[${j}]: missing 'ElementType'`);
          if (!limit.PowerLimit) errors.push(`Policies[${i}].Limits[${j}]: missing 'PowerLimit'`);
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
