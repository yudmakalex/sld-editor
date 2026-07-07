import React, { useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/panels/Sidebar";
import PropertyPanel from "./components/panels/PropertyPanel";
import useSldStore from "./store/useSldStore";
import { parseScdFile } from "./iec61850/parser/scdParser";

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <AppHeader />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar />
          <Canvas />
          <PropertyPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

function AppHeader() {
  const fileInputRef = useRef(null);
  const scdFileName = useSldStore((s) => s.scdFileName);
  const scdModel = useSldStore((s) => s.scdModel);
  const liveMode = useSldStore((s) => s.liveMode);
  const importScd = useSldStore((s) => s.importScd);
  const clearScd = useSldStore((s) => s.clearScd);
  const toggleLiveMode = useSldStore((s) => s.toggleLiveMode);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { model, errors } = await parseScdFile(file);
      if (errors.length > 0) {
        console.error("SCD parse errors:", errors);
        alert(`SCD parse errors:\n${errors.join("\n")}`);
        return;
      }
      if (!model) {
        alert("Failed to parse SCD file");
        return;
      }
      importScd(model, file.name);
    } catch (err) {
      alert(`Error reading SCD: ${err.message}`);
    }
    e.target.value = "";
  };

  return (
    <header style={{
      height: "48px",
      background: "#1e293b",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      gap: "12px",
      borderBottom: "1px solid #334155",
    }}>
      {/* Logo */}
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

      {/* Separator */}
      <div style={{ width: "1px", height: "24px", background: "#334155" }} />

      {/* SCD Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".scd,.scl,.xml"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <HeaderButton onClick={() => fileInputRef.current?.click()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M3 5l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Import SCD
      </HeaderButton>

      {/* SCD status */}
      {scdFileName && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "10px",
            background: "#166534",
            color: "#bbf7d0",
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            SCD
          </span>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{scdFileName}</span>
          <button
            onClick={clearScd}
            style={{
              fontSize: "9px",
              color: "#f87171",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
            }}
            title="Clear SCD"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live mode toggle */}
      {scdModel && (
        <>
          <div style={{ width: "1px", height: "24px", background: "#334155" }} />
          <button
            onClick={toggleLiveMode}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 700,
              color: liveMode ? "#000" : "#f8fafc",
              background: liveMode ? "#22c55e" : "transparent",
              border: liveMode ? "none" : "1px solid #475569",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: liveMode ? "#fff" : "#94a3b8",
              animation: liveMode ? "pulse 1.5s infinite" : "none",
            }} />
            {liveMode ? "LIVE" : "Go Live"}
          </button>

          {scdModel.ieds && (
            <span style={{
              fontSize: "10px",
              color: "#64748b",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {scdModel.ieds.length} IEDs
            </span>
          )}
        </>
      )}

      <div style={{ flex: 1 }} />

      <span style={{ color: "#64748b", fontSize: "11px" }}>
        IEC 61850 SLD Editor
      </span>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}

function HeaderButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#cbd5e1",
        background: "transparent",
        border: "1px solid #475569",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3b82f6";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#475569";
        e.currentTarget.style.color = "#cbd5e1";
      }}
    >
      {children}
    </button>
  );
}
