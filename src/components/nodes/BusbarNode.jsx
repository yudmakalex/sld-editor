import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { BusbarIcon } from "../icons/SldIcons";
import useSldStore from "../../store/useSldStore";

const BusbarNode = memo(({ id, data, selected }) => {
  const selectNode = useSldStore((s) => s.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      style={{
        padding: "8px",
        borderRadius: "8px",
        border: `2px solid ${selected ? "#3b82f6" : "#d1d5db"}`,
        background: selected ? "#eff6ff" : "#fff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "80px",
      }}
    >
      <Handle type="target" position={Position.Top} id="top" style={{ background: "#6b7280", width: 10, height: 10 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: "#6b7280", width: 10, height: 10 }} />
      <BusbarIcon size={40} />
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#1f2937", marginTop: 4 }}>{data.name}</div>
      <div style={{ fontSize: "9px", color: "#6b7280" }}>{data.voltageLevel} kV</div>
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: "#6b7280", width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: "#6b7280", width: 10, height: 10 }} />
    </div>
  );
});

BusbarNode.displayName = "BusbarNode";
export default BusbarNode;
