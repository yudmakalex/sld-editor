import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useSldStore from "../store/useSldStore";

import CircuitBreakerNode from "./nodes/CircuitBreakerNode";
import TransformerNode from "./nodes/TransformerNode";
import BusbarNode from "./nodes/BusbarNode";
import GeneratorNode from "./nodes/GeneratorNode";
import LoadNode from "./nodes/LoadNode";
import SwitchNode from "./nodes/SwitchNode";
import CapacitorNode from "./nodes/CapacitorNode";
import GroundNode from "./nodes/GroundNode";

const nodeTypes = {
  CircuitBreakerNode,
  TransformerNode,
  BusbarNode,
  GeneratorNode,
  LoadNode,
  SwitchNode,
  CapacitorNode,
  GroundNode,
};

function ToolbarButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#475569",
        background: "#fff",
        border: "1px solid #d1d5db",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3b82f6";
        e.currentTarget.style.color = "#3b82f6";
        e.currentTarget.style.background = "#eff6ff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#d1d5db";
        e.currentTarget.style.color = "#475569";
        e.currentTarget.style.background = "#fff";
      }}
    >
      {children}
    </button>
  );
}

export default function Canvas() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const nodes = useSldStore((s) => s.nodes);
  const edges = useSldStore((s) => s.edges);
  const setNodes = useSldStore((s) => s.setNodes);
  const setEdges = useSldStore((s) => s.setEdges);
  const addNode = useSldStore((s) => s.addNode);
  const addEdge = useSldStore((s) => s.addEdge);
  const selectNode = useSldStore((s) => s.selectNode);
  const autoLayout = useSldStore((s) => s.autoLayout);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onConnect = useCallback(
    (connection) => {
      addEdge(connection);
    },
    [addEdge]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleAutoLayout = useCallback(() => {
    autoLayout();
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [autoLayout, fitView]);

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        flexShrink: 0,
      }}>
        <ToolbarButton onClick={handleAutoLayout} title="Auto-arrange nodes top-to-bottom">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="1" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1" y="8" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9" y="8" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Auto Layout
        </ToolbarButton>

        <ToolbarButton onClick={() => fitView({ padding: 0.2, duration: 300 })} title="Fit all nodes in view">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 5V1h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 5V1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 9v4h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 9v4H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Fit View
        </ToolbarButton>

        <div style={{ flex: 1 }} />

        <span style={{
          fontSize: "10px",
          color: "#94a3b8",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          style={{ background: "#f1f5f9" }}
          defaultEdgeOptions={{ type: "smoothstep", animated: false }}
        >
          <Controls position="bottom-left" />
          <MiniMap
            nodeColor="#64748b"
            maskColor="rgba(0,0,0,0.08)"
            position="bottom-right"
          />
          <Background gap={15} size={1} color="#cbd5e1" />
        </ReactFlow>
      </div>
    </div>
  );
}
