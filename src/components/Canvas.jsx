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
import { colors, typography, spacing } from "../design/tokens";

import {
  CircuitBreakerNode,
  TransformerNode,
  BusbarNode,
  GeneratorNode,
  LoadNode,
  SwitchNode,
  CapacitorNode,
  GroundNode,
} from "./nodes/SldNodes";

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

function ToolbarButton({ onClick, title, children, accent }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={accent ? "btn-brand" : "btn-secondary"}
      style={{ height: 32, fontSize: 12, padding: "0 12px" }}
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
  const sldAutoLayout = useSldStore((s) => s.sldAutoLayout);

  const onNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
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
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onConnect = useCallback((connection) => addEdge(connection), [addEdge]);
  const onNodeClick = useCallback((_, node) => selectNode(node.id), [selectNode]);
  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  const handleAutoLayout = useCallback(() => {
    autoLayout();
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
  }, [autoLayout, fitView]);

  const handleSldLayout = useCallback(() => {
    sldAutoLayout();
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [sldAutoLayout, fitView]);

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", background: colors.canvas }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.xs,
        padding: `${spacing.xs}px ${spacing.md}px`,
        background: colors.canvasSoft,
        borderBottom: `1px solid ${colors.hairlineSoft}`,
        flexShrink: 0,
      }}>
        <ToolbarButton onClick={handleSldLayout} title="Traditional SLD bus-and-bay layout" accent>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="3" x2="3" y2="7" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="3" x2="7" y2="7" stroke="currentColor" strokeWidth="1.3" />
            <line x1="11" y1="3" x2="11" y2="7" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1.5" y="7" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" />
            <rect x="5.5" y="7" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" />
            <rect x="9.5" y="7" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" />
          </svg>
          SLD Layout
        </ToolbarButton>

        <ToolbarButton onClick={handleAutoLayout} title="Topological tree layout">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="1" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1" y="8" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9" y="8" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.3" />
            <line x1="7" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Tree
        </ToolbarButton>

        <ToolbarButton onClick={() => fitView({ padding: 0.15, duration: 300 })} title="Fit all nodes">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 5V1h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 5V1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 9v4h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 9v4H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Fit
        </ToolbarButton>

        <div style={{ flex: 1 }} />

        <span style={{
          fontSize: 11,
          fontFamily: "'IBM Plex Mono', monospace",
          color: colors.mute,
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
          style={{ background: colors.canvas }}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { stroke: colors.connection, strokeWidth: 2 },
          }}
        >
          <Controls position="bottom-left" />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "BusbarNode": return colors.busbar;
                case "CircuitBreakerNode": return node.data.status === "closed" ? colors.breakerClosed : colors.breakerOpen;
                case "TransformerNode": return colors.transformer;
                case "GeneratorNode": return colors.generator;
                case "LoadNode": return colors.load;
                default: return colors.mute;
              }
            }}
            maskColor="rgba(11,11,11,0.8)"
            style={{ background: colors.canvasSoft, border: `1px solid ${colors.hairlineSoft}` }}
            position="bottom-right"
          />
          <Background gap={20} size={1} color={colors.hairlineSoft} />
        </ReactFlow>
      </div>
    </div>
  );
}
