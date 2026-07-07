import React, { useState } from "react";
import { sldSchemas } from "../../schemas/sldSchemas";
import SchemaTree from "./SchemaTree";
import DrawingTree from "./DrawingTree";

const componentList = [
  { type: "CircuitBreaker", label: "Circuit Breaker", color: "#16a34a" },
  { type: "Transformer", label: "Transformer", color: "#2563eb" },
  { type: "Busbar", label: "Busbar", color: "#7c3aed" },
  { type: "Generator", label: "Generator", color: "#16a34a" },
  { type: "Load", label: "Load", color: "#d97706" },
  { type: "Switch", label: "Disconnector", color: "#dc2626" },
  { type: "Capacitor", label: "Capacitor Bank", color: "#0891b2" },
  { type: "Ground", label: "Ground", color: "#64748b" },
];

const tabs = [
  { id: "palette", label: "Components" },
  { id: "drawing", label: "Topology" },
  { id: "schema", label: "Schema" },
];

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("palette");

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div style={{
      width: "280px",
      background: "#fff",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Tab bar */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "8px 4px",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.id ? "#3b82f6" : "#64748b",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "palette" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <div style={{
            fontSize: "10px",
            color: "#94a3b8",
            padding: "4px 8px 8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}>
            Drag to canvas
          </div>
          {componentList.map((comp) => {
            const schema = sldSchemas[comp.type];
            const propCount = Object.keys(schema.properties).length;

            return (
              <div
                key={comp.type}
                draggable
                onDragStart={(e) => onDragStart(e, comp.type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  marginBottom: "3px",
                  borderRadius: "6px",
                  cursor: "grab",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = comp.color;
                  e.currentTarget.style.background = `${comp.color}08`;
                  e.currentTarget.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{
                  width: "6px",
                  height: "28px",
                  borderRadius: "3px",
                  background: comp.color,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>{comp.label}</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                    {propCount} properties
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "drawing" && (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <DrawingTree />
        </div>
      )}

      {activeTab === "schema" && (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <SchemaTree />
        </div>
      )}
    </div>
  );
}
