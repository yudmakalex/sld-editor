import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/panels/Sidebar";
import PropertyPanel from "./components/panels/PropertyPanel";

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <header style={{
          height: "48px",
          background: "#1e293b",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "16px",
          borderBottom: "1px solid #334155",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
            }}>
              S
            </div>
            <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "15px" }}>
              SLD Editor
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
            Interactive Single Line Diagram Editor
          </span>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar />
          <Canvas />
          <PropertyPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
