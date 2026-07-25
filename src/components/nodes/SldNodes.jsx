import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { colors, rounded } from "../../design/tokens";
import useSldStore from "../../store/useSldStore";

function SldNode({ id, data, selected, children, handlePositions = { target: Position.Left, source: Position.Right } }) {
  const selectNode = useSldStore((s) => s.selectNode);
  const liveStatus = useSldStore((s) => s.liveStatuses[id]);
  const liveMode = useSldStore((s) => s.liveMode);

  const statusColor = liveMode && liveStatus
    ? (liveStatus.status === "closed" || liveStatus.status === "running" ? colors.breakerClosed : colors.breakerOpen)
    : null;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`sld-node ${selected ? "selected" : ""}`}
      style={{
        padding: "10px 14px",
        borderRadius: rounded.marketing,
        border: `1.5px solid ${selected ? colors.brand : colors.hairlineSoft}`,
        background: colors.canvasSoft,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "100px",
        position: "relative",
        transition: "all 0.15s ease",
      }}
    >
      <Handle type="target" position={handlePositions.target}
        style={{
          width: 10, height: 10,
          background: colors.canvasSoft,
          border: `2px solid ${statusColor || colors.ash}`,
          borderRadius: "50%",
        }}
      />

      {/* Status glow */}
      {statusColor && (
        <div style={{
          position: "absolute",
          top: -2, right: -2,
          width: 8, height: 8,
          borderRadius: "50%",
          background: statusColor,
          boxShadow: `0 0 6px ${statusColor}`,
        }} />
      )}

      {children}

      {/* Name label */}
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        color: colors.onPrimary,
        marginTop: 6,
        textAlign: "center",
        maxWidth: 100,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {data.name}
      </div>

      {/* Status / value */}
      <div style={{
        fontSize: 9,
        fontFamily: "'IBM Plex Mono', monospace",
        color: statusColor || colors.mute,
        marginTop: 2,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        {liveMode && liveStatus ? liveStatus.status : (data.status || data.sclType || "")}
      </div>

      <Handle type="source" position={handlePositions.source}
        style={{
          width: 10, height: 10,
          background: colors.canvasSoft,
          border: `2px solid ${colors.ash}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

// ─── Circuit Breaker ────────────────────────────────────────────────
export const CircuitBreakerNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <line x1="4" y1="24" x2="14" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="24" x2="44" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="14" width="20" height="20" rx="2" fill="none"
        stroke={data.status === "closed" ? colors.breakerClosed : colors.breakerOpen} strokeWidth="2.5" />
      <line x1="18" y1="18" x2="30" y2="30" stroke={data.status === "closed" ? colors.breakerClosed : colors.breakerOpen} strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="18" x2="18" y2="30" stroke={data.status === "closed" ? colors.breakerClosed : colors.breakerOpen} strokeWidth="2" strokeLinecap="round" />
    </svg>
  </SldNode>
));
CircuitBreakerNode.displayName = "CircuitBreakerNode";

// ─── Transformer ────────────────────────────────────────────────────
export const TransformerNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <line x1="4" y1="24" x2="12" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="24" x2="44" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <circle cx="19" cy="24" r="9" fill="none" stroke={colors.transformer} strokeWidth="2.5" />
      <circle cx="29" cy="24" r="9" fill="none" stroke={colors.transformer} strokeWidth="2.5" />
      <polygon points="16,20 22,20 19,26" fill="none" stroke={colors.transformer} strokeWidth="1.2" />
      <line x1="29" y1="19" x2="29" y2="25" stroke={colors.transformer} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="29" y1="25" x2="26" y2="28" stroke={colors.transformer} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="29" y1="25" x2="32" y2="28" stroke={colors.transformer} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </SldNode>
));
TransformerNode.displayName = "TransformerNode";

// ─── Busbar ─────────────────────────────────────────────────────────
export const BusbarNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}
    handlePositions={{ target: Position.Top, source: Position.Bottom }}>
    <svg width="60" height="32" viewBox="0 0 60 32">
      <rect x="2" y="8" width="56" height="16" rx="2" fill={colors.busbar} opacity="0.9" />
      <line x1="12" y1="24" x2="12" y2="32" stroke={colors.busbar} strokeWidth="2" />
      <line x1="30" y1="24" x2="30" y2="32" stroke={colors.busbar} strokeWidth="2" />
      <line x1="48" y1="24" x2="48" y2="32" stroke={colors.busbar} strokeWidth="2" />
      <circle cx="12" cy="24" r="2.5" fill={colors.brand} />
      <circle cx="30" cy="24" r="2.5" fill={colors.brand} />
      <circle cx="48" cy="24" r="2.5" fill={colors.brand} />
    </svg>
    <div style={{
      fontSize: 10,
      fontFamily: "'IBM Plex Mono', monospace",
      color: colors.brand,
      fontWeight: 600,
      marginTop: 4,
    }}>
      {data.voltageLevel ? `${data.voltageLevel} kV` : "BUS"}
    </div>
  </SldNode>
));
BusbarNode.displayName = "BusbarNode";

// ─── Generator ──────────────────────────────────────────────────────
export const GeneratorNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <line x1="4" y1="24" x2="10" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="24" x2="44" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="14" fill="none"
        stroke={data.status === "running" ? colors.generator : colors.mute} strokeWidth="2.5" />
      <text x="24" y="29" textAnchor="middle" fontSize="16" fontFamily="serif" fontWeight="bold"
        fill={data.status === "running" ? colors.generator : colors.mute}>G</text>
    </svg>
  </SldNode>
));
GeneratorNode.displayName = "GeneratorNode";

// ─── Load ───────────────────────────────────────────────────────────
export const LoadNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <line x1="4" y1="24" x2="14" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <polygon points="14,16 38,24 14,32" fill={colors.load} fillOpacity="0.2" stroke={colors.load} strokeWidth="2.5" strokeLinejoin="round" />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="bold" fill={colors.load}>P</text>
    </svg>
  </SldNode>
));
LoadNode.displayName = "LoadNode";

// ─── Switch ─────────────────────────────────────────────────────────
export const SwitchNode = memo(({ id, data, selected }) => {
  const angle = data.status === "closed" ? 0 : 35;
  const lineEndX = 30 + Math.cos((-angle * Math.PI) / 180) * 12;
  const lineEndY = 24 - Math.sin((-angle * Math.PI) / 180) * 12;
  const contactColor = data.status === "closed" ? colors.breakerClosed : colors.breakerOpen;

  return (
    <SldNode id={id} data={data} selected={selected}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <line x1="4" y1="24" x2="14" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="24" x2="44" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="24" r="2.5" fill={colors.ash} />
        <circle cx="34" cy="24" r="2.5" fill={colors.ash} />
        <line x1="16" y1="24" x2={lineEndX} y2={lineEndY} stroke={contactColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </SldNode>
  );
});
SwitchNode.displayName = "SwitchNode";

// ─── Capacitor ──────────────────────────────────────────────────────
export const CapacitorNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <line x1="4" y1="24" x2="17" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <line x1="31" y1="24" x2="44" y2="24" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="10" x2="19" y2="38" stroke={colors.capacitor} strokeWidth="3" strokeLinecap="round" />
      <line x1="29" y1="10" x2="29" y2="38" stroke={colors.capacitor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  </SldNode>
));
CapacitorNode.displayName = "CapacitorNode";

// ─── Ground ─────────────────────────────────────────────────────────
export const GroundNode = memo(({ id, data, selected }) => (
  <SldNode id={id} data={data} selected={selected}
    handlePositions={{ target: Position.Top, source: Position.Bottom }}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <line x1="24" y1="2" x2="24" y2="16" stroke={colors.ash} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="16" x2="38" y2="16" stroke={colors.ground} strokeWidth="3" strokeLinecap="round" />
      <line x1="15" y1="24" x2="33" y2="24" stroke={colors.ground} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="32" x2="28" y2="32" stroke={colors.ground} strokeWidth="2" strokeLinecap="round" />
    </svg>
  </SldNode>
));
GroundNode.displayName = "GroundNode";
