/**
 * IEC 61850 SCL (Substation Configuration Language) data model.
 * Based on IEC 61850-6 Edition 2.
 *
 * Maps directly to SCD/XML elements:
 *   <Substation> → SclSubstation
 *   <VoltageLevel> → SclVoltageLevel
 *   <Bay> → SclBay
 *   <ConductingEquipment> → SclConductingEquipment
 *   <ConnectivityNode> → SclConnectivityNode
 *   <IED> → SclIed
 *   <LN> → SclLn
 */

// ─── Substation topology ────────────────────────────────────────────

export const EquipmentTypes = {
  CBR: { label: "Circuit Breaker", symbol: "CBR", color: "#dc2626", category: "switching" },
  DIS: { label: "Disconnector", symbol: "DIS", color: "#dc2626", category: "switching" },
  VTR: { label: "Voltage Transformer", symbol: "VT", color: "#2563eb", category: "instrument" },
  CTR: { label: "Current Transformer", symbol: "CT", color: "#7c3aed", category: "instrument" },
  IFL: { label: "Power Line / Feeder", symbol: "FL", color: "#64748b", category: "conductor" },
  TFL: { label: "Transformer (power)", symbol: "T", color: "#2563eb", category: "transformer" },
  MOT: { label: "Motor", symbol: "M", color: "#16a34a", category: "load" },
  GEN: { label: "Generator", symbol: "G", color: "#16a34a", category: "source" },
  CAP: { label: "Capacitor Bank", symbol: "C", color: "#0891b2", category: "compensation" },
  REA: { label: "Reactor", symbol: "R", color: "#0891b2", category: "compensation" },
  GRL: { label: "Ground", symbol: "GND", color: "#64748b", category: "ground" },
  BUS: { label: "Busbar", symbol: "BUS", color: "#7c3aed", category: "bus" },
  loads: { label: "Load", symbol: "P", color: "#d97706", category: "load" },
};

export function getEquipmentConfig(lNodeType) {
  return EquipmentTypes[lNodeType] || { label: lNodeType, symbol: "?", color: "#64748b", category: "unknown" };
}

// ─── SCL XML element types ──────────────────────────────────────────

/**
 * @typedef {Object} SclConnectivityNode
 * @property {string} name
 * @property {string} pathName - e.g. "Q1/Q01/L1"
 * @property {string} [desc]
 */

/**
 * @typedef {Object} SclConductingEquipment
 * @property {string} name
 * @property {string} type - e.g. "CBR", "DIS", "TFL"
 * @property {string} [desc]
 * @property {string} [lnType] - reference to LN type
 * @property {string} pathName
 * @property {string[]} connectedNodes - pathNames of connected ConnectivityNodes
 */

/**
 * @typedef {Object} SclBay
 * @property {string} name
 * @property {string} [desc]
 * @property {SclConductingEquipment[]} conductingEquipment
 * @property {SclConnectivityNode[]} connectivityNodes
 */

/**
 * @typedef {Object} SclVoltageLevel
 * @property {string} name
 * @property {number} [voltage] - kV
 * @property {string} [desc]
 * @property {SclBay[]} bays
 */

/**
 * @typedef {Object} SclSubstation
 * @property {string} name
 * @property {string} [desc]
 * @property {SclVoltageLevel[]} voltageLevels
 */

// ─── IED model ──────────────────────────────────────────────────────

/**
 * @typedef {Object} SclDo
 * @property {string} name
 * @property {string} [fc] - Functional Constraint (ST, MX, CO, SP, SG, etc.)
 * @property {string} [value] - current value
 * @property {string} [q] - quality
 * @property {string} [t] - timestamp
 */

/**
 * @typedef {Object} SclLn
 * @property {string} lnClass - e.g. "XCBR", "XSWI", "MMXU", "CSWI"
 * @property {string} inst - instance number
 * @property {string} [desc]
 * @property {string} [prefix]
 * @property {SclDo[]} dataObjects
 */

/**
 * @typedef {Object} SclLDevice
 * @property {string} inst
 * @property {string} [desc]
 * @property {SclLn[]} logicalNodes
 */

/**
 * @typedef {Object} SclServer
 * @property {SclLDevice[]}
 */

/**
 * @typedef {Object} SclAccessPoint
 * @property {string} name
 * @property {string} [ip]
 * @property {SclServer} server
 */

/**
 * @typedef {Object} SclIed
 * @property {string} name
 * @property {string} [type]
 * @property {string} [manufacturer]
 * @property {string} [desc]
 * @property {SclAccessPoint[]} accessPoints
 */

// ─── Communication ──────────────────────────────────────────────────

/**
 * @typedef {Object} SclConnectedAp
 * @property {string} iedName
 * @property {string} apName
 * @property {string} [ip]
 * @property {number} [port]
 */

/**
 * @typedef {Object} SclSubnetwork
 * @property {string} name
 * @property {string} [type]
 * @property {SclConnectedAp[]} connectedAps
 */

// ─── Full parsed model ──────────────────────────────────────────────

/**
 * @typedef {Object} ScdModel
 * @property {SclSubstation[]} substations
 * @property {SclIed[]} ieds
 * @property {SclSubnetwork[]} subnetworks
 * @property {Object} raw - raw XML Document for reference
 */
