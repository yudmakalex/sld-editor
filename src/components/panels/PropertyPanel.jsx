import React from "react";
import { getSchemaByType } from "../../schemas/sldSchemas";
import useSldStore from "../../store/useSldStore";

const typeLabels = {
  string: "String",
  number: "Number",
  integer: "Integer",
  boolean: "Boolean",
  array: "Array",
  object: "Object",
};

const typeColors = {
  string: "#2563eb",
  number: "#7c3aed",
  integer: "#7c3aed",
  boolean: "#d97706",
};

export default function PropertyPanel() {
  const selectedNodeId = useSldStore((s) => s.selectedNodeId);
  const nodes = useSldStore((s) => s.nodes);
  const updateNodeData = useSldStore((s) => s.updateNodeData);
  const deleteNode = useSldStore((s) => s.deleteNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div style={{
        width: "300px",
        background: "#fff",
        borderLeft: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontSize: "12px",
        flexDirection: "column",
        gap: "12px",
      }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="8" width="32" height="32" rx="6" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="24" cy="22" r="6" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M18 34c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div>Select a node to edit</div>
        <div style={{ fontSize: "10px", color: "#cbd5e1" }}>Click any element on the canvas</div>
      </div>
    );
  }

  const nodeType = selectedNode.type.replace("Node", "");
  const schema = getSchemaByType(nodeType);

  if (!schema) return null;

  const handleChange = (key, value, propType) => {
    let coerced = value;
    if (propType === "number" || propType === "integer") coerced = Number(value) || 0;
    if (propType === "boolean") coerced = value === "true" || value === true;
    updateNodeData(selectedNode.id, key, coerced);
  };

  const nodeTypeLabels = {
    CircuitBreaker: "Circuit Breaker",
    Transformer: "Transformer",
    Busbar: "Busbar",
    Generator: "Generator",
    Load: "Load",
    Switch: "Disconnector",
    Capacitor: "Capacitor Bank",
    Ground: "Ground",
  };

  return (
    <div style={{
      width: "300px",
      background: "#fff",
      borderLeft: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              Properties
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginTop: "2px" }}>
              {nodeTypeLabels[nodeType] || schema.title}
            </div>
          </div>
          <span style={{
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#94a3b8",
            background: "#f1f5f9",
            padding: "3px 8px",
            borderRadius: "4px",
          }}>
            {selectedNode.id}
          </span>
        </div>
      </div>

      {/* Properties form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {Object.entries(schema.properties).map(([key, prop]) => {
          if (key === "id") return null;
          const value = selectedNode.data[key] ?? prop.default ?? "";
          const isRequired = (schema.required || []).includes(key);

          return (
            <div key={key} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <label style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#334155",
                }}>
                  {prop.title || key}
                </label>
                {isRequired && (
                  <span style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#dc2626",
                    lineHeight: "10px",
                  }}>
                    *
                  </span>
                )}
                <span style={{
                  marginLeft: "auto",
                  fontSize: "9px",
                  fontWeight: 600,
                  color: typeColors[prop.type] || "#64748b",
                  background: `${typeColors[prop.type] || "#64748b"}10`,
                  padding: "1px 5px",
                  borderRadius: "3px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {typeLabels[prop.type] || prop.type}
                </span>
              </div>

              {prop.enum ? (
                <select
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value, prop.type)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#1e293b",
                    outline: "none",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  {prop.enum.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : prop.type === "boolean" ? (
                <select
                  value={String(value)}
                  onChange={(e) => handleChange(key, e.target.value, prop.type)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#1e293b",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : prop.type === "number" || prop.type === "integer" ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value, prop.type)}
                  step={prop.type === "integer" ? "1" : "any"}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#1e293b",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value, prop.type)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#1e293b",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              )}

              {prop.enum && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "4px" }}>
                  {prop.enum.map((v) => (
                    <span key={v} style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: value === v ? "#3b82f6" : "#f1f5f9",
                      color: value === v ? "#fff" : "#64748b",
                      cursor: "pointer",
                      transition: "all 0.1s",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onClick={() => handleChange(key, v, prop.type)}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#fff",
            background: "#dc2626",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
