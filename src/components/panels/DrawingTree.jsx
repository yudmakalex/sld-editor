import React, { useMemo, useState } from "react";
import useSldStore from "../../store/useSldStore";
import { useReactFlow } from "@xyflow/react";

const nodeTypeConfig = {
  GeneratorNode: { label: "Generator", color: "#16a34a", symbol: "G" },
  TransformerNode: { label: "Transformer", color: "#2563eb", symbol: "T" },
  BusbarNode: { label: "Busbar", color: "#7c3aed", symbol: "BUS" },
  CircuitBreakerNode: { label: "Circuit Breaker", color: "#dc2626", symbol: "CB" },
  LoadNode: { label: "Load", color: "#d97706", symbol: "P" },
  SwitchNode: { label: "Disconnector", color: "#dc2626", symbol: "SW" },
  CapacitorNode: { label: "Capacitor", color: "#0891b2", symbol: "C" },
  GroundNode: { label: "Ground", color: "#64748b", symbol: "GND" },
};

function getVoltage(node) {
  const d = node.data;
  if (d.voltageLevel) return `${d.voltageLevel} kV`;
  if (d.primaryVoltage && d.secondaryVoltage) return `${d.primaryVoltage}/${d.secondaryVoltage} kV`;
  if (d.voltage) return `${d.voltage} kV`;
  if (d.voltageRating) return `${d.voltageRating} kV`;
  return null;
}

function getStatus(node) {
  return node.data.status || null;
}

function getPower(node) {
  const d = node.data;
  if (d.power) return `${d.power} MW`;
  if (d.capacity) return `${d.capacity} MVA`;
  if (d.currentRating) return `${d.currentRating} A`;
  if (d.ratedCurrent) return `${d.ratedCurrent} A`;
  return null;
}

function buildGraph(nodes, edges) {
  const adj = {};
  const inDegree = {};
  nodes.forEach((n) => { adj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });
  return { adj, inDegree };
}

function findRoots(nodes, inDegree) {
  return nodes.filter((n) => (inDegree[n.id] || 0) === 0);
}

function TreeNode({ nodeId, nodes, adj, visited, depth = 0, selectedId, onSelect }) {
  const [expanded, setExpanded] = useState(true);
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const children = adj[nodeId] || [];
  const hasChildren = children.length > 0;
  const isSelected = selectedId === nodeId;
  const config = nodeTypeConfig[node.type] || { label: node.type, color: "#64748b", symbol: "?" };
  const voltage = getVoltage(node);
  const status = getStatus(node);
  const power = getPower(node);

  const visitedNext = new Set(visited);
  visitedNext.add(nodeId);

  return (
    <div>
      <div
        onClick={() => onSelect(nodeId)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 8px",
          paddingLeft: `${depth * 18 + 8}px`,
          cursor: "pointer",
          borderRadius: "4px",
          background: isSelected ? `${config.color}12` : "transparent",
          borderLeft: isSelected ? `3px solid ${config.color}` : "3px solid transparent",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Expand toggle */}
        <span
          onClick={(e) => { e.stopPropagation(); if (hasChildren) setExpanded(!expanded); }}
          style={{
            width: "14px",
            fontSize: "8px",
            color: "#94a3b8",
            textAlign: "center",
            flexShrink: 0,
            cursor: hasChildren ? "pointer" : "default",
          }}
        >
          {hasChildren ? (expanded ? "▾" : "▸") : " "}
        </span>

        {/* Type badge */}
        <span style={{
          fontSize: "9px",
          fontWeight: 800,
          color: config.color,
          background: `${config.color}15`,
          padding: "1px 5px",
          borderRadius: "3px",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.03em",
          flexShrink: 0,
        }}>
          {config.symbol}
        </span>

        {/* Name */}
        <span style={{
          fontSize: "12px",
          fontWeight: isSelected ? 700 : 500,
          color: "#1e293b",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {node.data.name}
        </span>

        {/* Status dot */}
        {status && (
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: status === "open" || status === "stopped" ? "#dc2626"
              : status === "tripped" || status === "maintenance" ? "#d97706"
              : "#16a34a",
            flexShrink: 0,
          }} />
        )}
      </div>

      {/* Expanded children */}
      {hasChildren && expanded && (
        <div>
          {children.map((childId) => {
            if (visitedNext.has(childId)) {
              const child = nodes.find((n) => n.id === childId);
              return (
                <div
                  key={childId}
                  style={{
                    paddingLeft: `${(depth + 1) * 18 + 8}px`,
                    fontSize: "11px",
                    color: "#94a3b8",
                    padding: "4px 8px",
                    fontStyle: "italic",
                  }}
                >
                  ↳ {child?.data.name || childId} (loop)
                </div>
              );
            }
            return (
              <TreeNode
                key={childId}
                nodeId={childId}
                nodes={nodes}
                adj={adj}
                visited={visitedNext}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DrawingTree() {
  const nodes = useSldStore((s) => s.nodes);
  const edges = useSldStore((s) => s.edges);
  const selectedNodeId = useSldStore((s) => s.selectedNodeId);
  const selectNode = useSldStore((s) => s.selectNode);
  const autoLayout = useSldStore((s) => s.autoLayout);
  const { fitView } = useReactFlow();

  const handleLayout = () => {
    autoLayout();
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  };

  const { adj, inDegree } = useMemo(() => buildGraph(nodes, edges), [nodes, edges]);
  const roots = useMemo(() => findRoots(nodes, inDegree), [nodes, inDegree]);

  const orphanNodes = useMemo(() => {
    const rootIds = new Set(roots.map((r) => r.id));
    return nodes.filter((n) => !rootIds.has(n.id) && (inDegree[n.id] || 0) > 0 && adj[n.id]?.length === 0);
  }, [nodes, roots, inDegree, adj]);

  const [showDetails, setShowDetails] = useState(true);

  // Summary stats
  const stats = useMemo(() => {
    const typeCounts = {};
    nodes.forEach((n) => {
      const cfg = nodeTypeConfig[n.type];
      const label = cfg?.label || n.type;
      typeCounts[label] = (typeCounts[label] || 0) + 1;
    });
    return typeCounts;
  }, [nodes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Summary bar */}
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>Drawing Topology</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={handleLayout}
              style={{
                fontSize: "9px",
                padding: "2px 6px",
                border: "1px solid #3b82f6",
                borderRadius: "3px",
                background: "#eff6ff",
                color: "#3b82f6",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ↕ Layout
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                fontSize: "9px",
                padding: "2px 6px",
                border: "1px solid #d1d5db",
                borderRadius: "3px",
                background: "#fff",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              {showDetails ? "Compact" : "Details"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {Object.entries(stats).map(([label, count]) => (
            <span key={label} style={{
              fontSize: "9px",
              color: "#64748b",
              background: "#e2e8f0",
              padding: "1px 6px",
              borderRadius: "3px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {count}× {label}
            </span>
          ))}
          <span style={{
            fontSize: "9px",
            color: "#64748b",
            background: "#e2e8f0",
            padding: "1px 6px",
            borderRadius: "3px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {edges.length} connections
          </span>
        </div>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {roots.length === 0 && nodes.length === 0 && (
          <div style={{
            padding: "20px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
          }}>
            No nodes on canvas
          </div>
        )}

        {roots.map((root) => (
          <div key={root.id}>
            {/* Root header */}
            <div style={{
              padding: "6px 12px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="4" fill="#16a34a" />
              </svg>
              Source
            </div>
            <TreeNode
              nodeId={root.id}
              nodes={nodes}
              adj={adj}
              visited={new Set()}
              depth={0}
              selectedId={selectedNodeId}
              onSelect={selectNode}
            />
          </div>
        ))}

        {/* Orphan nodes (not connected) */}
        {nodes.filter((n) => (inDegree[n.id] || 0) === 0 && adj[n.id]?.length === 0).length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <div style={{
              padding: "6px 12px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#d97706",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="4" fill="#d97706" />
              </svg>
              Unconnected
            </div>
            {nodes.filter((n) => (inDegree[n.id] || 0) === 0 && adj[n.id]?.length === 0).map((n) => {
              const config = nodeTypeConfig[n.type] || { symbol: "?", color: "#64748b" };
              return (
                <div
                  key={n.id}
                  onClick={() => selectNode(n.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 8px 5px 26px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    background: selectedNodeId === n.id ? `${config.color}12` : "transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = selectedNodeId === n.id ? `${config.color}12` : "transparent"; }}
                >
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: config.color,
                    background: `${config.color}15`,
                    padding: "1px 5px",
                    borderRadius: "3px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {config.symbol}
                  </span>
                  <span style={{ fontSize: "12px", color: "#1e293b" }}>{n.data.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Voltage path summary */}
        {roots.length > 0 && (
          <div style={{
            margin: "12px 8px",
            padding: "8px 10px",
            background: "#f1f5f9",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
              Power Flow Path
            </div>
            {(() => {
              const path = [];
              const traverse = (nodeId, visited) => {
                const node = nodes.find((n) => n.id === nodeId);
                if (!node) return;
                const cfg = nodeTypeConfig[node.type] || { symbol: "?", color: "#64748b" };
                const v = getVoltage(node);
                path.push(
                  <span key={nodeId} style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: cfg.color,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {cfg.symbol}
                    </span>
                    <span style={{ fontSize: "10px", color: "#1e293b" }}>
                      {node.data.name}
                    </span>
                    {v && (
                      <span style={{ fontSize: "9px", color: "#7c3aed", fontFamily: "'JetBrains Mono', monospace" }}>
                        [{v}]
                      </span>
                    )}
                  </span>
                );
                const children = adj[nodeId] || [];
                children.forEach((childId, i) => {
                  if (!visited.has(childId)) {
                    path.push(
                      <span key={`arrow-${nodeId}-${i}`} style={{ color: "#94a3b8", fontSize: "10px", padding: "0 2px" }}>
                        →
                      </span>
                    );
                    traverse(childId, new Set(visited).add(nodeId));
                  }
                });
              };
              roots.forEach((r) => traverse(r.id, new Set()));
              return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px" }}>{path}</div>;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
