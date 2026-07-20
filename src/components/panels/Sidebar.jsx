import React, { useState } from "react";
import { sldSchemas } from "../../schemas/sldSchemas";
import { DpsEntityTypes } from "../../dps/dpsSchema";
import SchemaTree from "./SchemaTree";
import DrawingTree from "./DrawingTree";

const componentList = [
  { type: "CircuitBreaker", label: "Circuit Breaker", color: "#16a34a", group: "SLD" },
  { type: "Transformer", label: "Transformer", color: "#2563eb", group: "SLD" },
  { type: "Busbar", label: "Busbar", color: "#7c3aed", group: "SLD" },
  { type: "Generator", label: "Generator", color: "#16a34a", group: "SLD" },
  { type: "Load", label: "Load", color: "#d97706", group: "SLD" },
  { type: "Switch", label: "Disconnector", color: "#dc2626", group: "SLD" },
  { type: "Capacitor", label: "Capacitor Bank", color: "#0891b2", group: "SLD" },
  { type: "Ground", label: "Ground", color: "#64748b", group: "SLD" },
];

const dpsComponents = Object.entries(DpsEntityTypes).map(([type, cfg]) => ({
  type: type === "ComputerSystem" ? "Load" : type === "PowerSupply" ? "Generator" : type === "PowerDistribution" ? "CircuitBreaker" : "Busbar",
  label: cfg.label,
  color: cfg.color,
  group: "DPS",
  dpsType: type,
  symbol: cfg.symbol,
}));

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
          {/* SLD Components */}
          <div style={{
            fontSize: "9px", color: "#94a3b8", padding: "4px 8px 6px",
            textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700,
          }}>
            IEC SLD Components
          </div>
          {componentList.map((comp) => {
            const schema = sldSchemas[comp.type];
            const propCount = Object.keys(schema.properties).length;
            return (
              <DragItem key={comp.type} comp={comp} onDragStart={onDragStart}
                subtitle={`${propCount} properties`} />
            );
          })}

          {/* DPS Components */}
          <div style={{
            fontSize: "9px", color: "#94a3b8", padding: "12px 8px 6px",
            textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700,
            borderTop: "1px solid #e2e8f0", marginTop: "8px", paddingTop: "12px",
          }}>
            NVIDIA DPS Entities
          </div>
          {dpsComponents.map((comp, i) => (
            <DragItem key={`dps-${i}`} comp={comp} onDragStart={onDragStart}
              subtitle={comp.symbol} />
          ))}
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

function DragItem({ comp, onDragStart, subtitle }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, comp.type)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "7px 10px", marginBottom: "2px", borderRadius: "5px",
        cursor: "grab", background: "#fff", border: "1px solid #e2e8f0",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = comp.color;
        e.currentTarget.style.background = `${comp.color}08`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div style={{
        width: "5px", height: "24px", borderRadius: "2px",
        background: comp.color, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#1e293b" }}>{comp.label}</div>
        <div style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
