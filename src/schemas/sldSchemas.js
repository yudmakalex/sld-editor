export const sldSchemas = {
  CircuitBreaker: {
    type: "object",
    title: "Circuit Breaker",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "CB-001" },
      status: { type: "string", title: "Status", enum: ["open", "closed", "tripped"], default: "closed" },
      voltageRating: { type: "number", title: "Voltage Rating (kV)", default: 12 },
      currentRating: { type: "number", title: "Current Rating (A)", default: 630 },
      tripType: { type: "string", title: "Trip Type", enum: ["thermal", "magnetic", "electronic"], default: "thermal" },
    },
    required: ["id", "name", "status"],
  },

  Transformer: {
    type: "object",
    title: "Transformer",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "T-001" },
      primaryVoltage: { type: "number", title: "Primary Voltage (kV)", default: 110 },
      secondaryVoltage: { type: "number", title: "Secondary Voltage (kV)", default: 10 },
      capacity: { type: "number", title: "Capacity (MVA)", default: 50 },
      phase: { type: "string", title: "Phase", enum: ["single", "three"], default: "three" },
      coolingType: { type: "string", title: "Cooling Type", enum: ["ONAN", "ONAF", "OFAF"], default: "ONAN" },
    },
    required: ["id", "name"],
  },

  Busbar: {
    type: "object",
    title: "Busbar",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "BUS-001" },
      voltageLevel: { type: "number", title: "Voltage Level (kV)", default: 10 },
      busType: { type: "string", title: "Bus Type", enum: ["single", "double", "ring"], default: "single" },
      ratedCurrent: { type: "number", title: "Rated Current (A)", default: 2000 },
    },
    required: ["id", "name"],
  },

  Generator: {
    type: "object",
    title: "Generator",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "GEN-001" },
      power: { type: "number", title: "Power (MW)", default: 100 },
      voltage: { type: "number", title: "Voltage (kV)", default: 10.5 },
      frequency: { type: "number", title: "Frequency (Hz)", default: 50 },
      fuelType: { type: "string", title: "Fuel Type", enum: ["diesel", "gas", "hydro", "nuclear", "wind", "solar"], default: "diesel" },
      status: { type: "string", title: "Status", enum: ["running", "stopped", "maintenance"], default: "running" },
    },
    required: ["id", "name"],
  },

  Load: {
    type: "object",
    title: "Load",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "LOAD-001" },
      power: { type: "number", title: "Power (MW)", default: 10 },
      powerFactor: { type: "number", title: "Power Factor", default: 0.85 },
      loadType: { type: "string", title: "Load Type", enum: ["residential", "commercial", "industrial"], default: "residential" },
    },
    required: ["id", "name"],
  },

  Switch: {
    type: "object",
    title: "Switch / Disconnector",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "SW-001" },
      status: { type: "string", title: "Status", enum: ["open", "closed"], default: "open" },
      switchType: { type: "string", title: "Switch Type", enum: ["disconnector", "load_break", "fuse"], default: "disconnector" },
    },
    required: ["id", "name", "status"],
  },

  Capacitor: {
    type: "object",
    title: "Capacitor Bank",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "CAP-001" },
      capacitance: { type: "number", title: "Capacitance (μF)", default: 100 },
      voltage: { type: "number", title: "Voltage (kV)", default: 10 },
      status: { type: "string", title: "Status", enum: ["connected", "disconnected"], default: "connected" },
    },
    required: ["id", "name"],
  },

  Ground: {
    type: "object",
    title: "Ground Connection",
    properties: {
      id: { type: "string", title: "ID" },
      name: { type: "string", title: "Name", default: "GND-001" },
      groundType: { type: "string", title: "Ground Type", enum: ["solid", "resistance", "reactance"], default: "solid" },
      resistance: { type: "number", title: "Resistance (Ω)", default: 0 },
    },
    required: ["id", "name"],
  },
};

export const getSchemaByType = (type) => sldSchemas[type] || null;

export const getDefaultsByType = (type) => {
  const schema = sldSchemas[type];
  if (!schema) return {};
  const defaults = {};
  Object.entries(schema.properties).forEach(([key, prop]) => {
    if (prop.default !== undefined) defaults[key] = prop.default;
  });
  return defaults;
};
