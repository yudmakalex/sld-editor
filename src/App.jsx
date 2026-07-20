import React, { useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/panels/Sidebar";
import PropertyPanel from "./components/panels/PropertyPanel";
import useSldStore from "./store/useSldStore";
import { parseScdFile } from "./iec61850/parser/scdParser";
import { parseDpsFile } from "./dps/renderer/dpsRenderer";
import { Roles } from "./auth/roles";

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
  const scdInputRef = useRef(null);
  const dpsInputRef = useRef(null);

  const scdFileName = useSldStore((s) => s.scdFileName);
  const scdModel = useSldStore((s) => s.scdModel);
  const dpsFileName = useSldStore((s) => s.dpsFileName);
  const dpsTopology = useSldStore((s) => s.dpsTopology);
  const liveMode = useSldStore((s) => s.liveMode);
  const currentUser = useSldStore((s) => s.currentUser);
  const users = useSldStore((s) => s.users);
  const alarms = useSldStore((s) => s.alarms);
  const importScd = useSldStore((s) => s.importScd);
  const importDps = useSldStore((s) => s.importDps);
  const clearScd = useSldStore((s) => s.clearScd);
  const clearDps = useSldStore((s) => s.clearDps);
  const toggleLiveMode = useSldStore((s) => s.toggleLiveMode);
  const switchUser = useSldStore((s) => s.switchUser);
  const acknowledgeAllAlarms = useSldStore((s) => s.acknowledgeAllAlarms);
  const can = useSldStore((s) => s.can);

  const activeAlarms = alarms.filter((a) => !a.acknowledged);

  const handleScdImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { model, errors } = await parseScdFile(file);
      if (errors.length > 0) { alert(`SCD errors:\n${errors.join("\n")}`); return; }
      if (model) importScd(model, file.name);
    } catch (err) { alert(`Error: ${err.message}`); }
    e.target.value = "";
  };

  const handleDpsImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { topology, errors } = await parseDpsFile(file);
      if (errors.length > 0) { alert(`DPS errors:\n${errors.join("\n")}`); return; }
      if (topology) importDps(topology, file.name);
    } catch (err) { alert(`Error: ${err.message}`); }
    e.target.value = "";
  };

  return (
    <header style={{
      height: "48px",
      background: "#1e293b",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: "8px",
      borderBottom: "1px solid #334155",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <div style={{
          width: "26px", height: "26px", borderRadius: "6px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: "13px",
        }}>S</div>
        <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "14px" }}>SLD</span>
      </div>

      <Sep />

      {/* Import buttons */}
      <input ref={scdInputRef} type="file" accept=".scd,.scl,.xml" onChange={handleScdImport} style={{ display: "none" }} />
      <input ref={dpsInputRef} type="file" accept=".json" onChange={handleDpsImport} style={{ display: "none" }} />

      {can("import_scd") && (
        <HdrBtn onClick={() => scdInputRef.current?.click()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4.5L6 1.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 8.5v1.5a1 1 0 001 1h8a1 1 0 001-1V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          SCD
        </HdrBtn>
      )}

      {can("import_dps") && (
        <HdrBtn onClick={() => dpsInputRef.current?.click()}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4.5L6 1.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 8.5v1.5a1 1 0 001 1h8a1 1 0 001-1V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          DPS
        </HdrBtn>
      )}

      {/* File status badges */}
      {scdFileName && (
        <Badge color="#166534" bg="#bbf7d0" onClose={clearScd} closeable={can("import_scd")}>
          SCD: {scdFileName}
        </Badge>
      )}
      {dpsFileName && (
        <Badge color="#1e40af" bg="#bfdbfe" onClose={clearDps} closeable={can("import_dps")}>
          DPS: {dpsFileName}
        </Badge>
      )}

      <Sep />

      {/* Live mode */}
      {(scdModel || dpsTopology) && (
        <button
          onClick={toggleLiveMode}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "4px 10px", fontSize: "11px", fontWeight: 700,
            color: liveMode ? "#000" : "#f8fafc",
            background: liveMode ? "#22c55e" : "transparent",
            border: liveMode ? "none" : "1px solid #475569",
            borderRadius: "4px", cursor: "pointer",
          }}
        >
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: liveMode ? "#fff" : "#94a3b8",
            animation: liveMode ? "pulse 1.5s infinite" : "none",
          }} />
          {liveMode ? "LIVE" : "Go Live"}
        </button>
      )}

      {/* Alarms */}
      {activeAlarms.length > 0 && (
        <button
          onClick={acknowledgeAllAlarms}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "4px 8px", fontSize: "11px", fontWeight: 700,
            color: "#fff", background: "#dc2626",
            border: "none", borderRadius: "4px", cursor: "pointer",
            animation: "pulse 1s infinite",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L1 11h10L6 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="9" r="0.6" fill="currentColor"/>
          </svg>
          {activeAlarms.length} ALARM{activeAlarms.length > 1 ? "S" : ""}
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* User switcher */}
      <select
        value={currentUser.id}
        onChange={(e) => switchUser(e.target.value)}
        style={{
          padding: "3px 8px", fontSize: "10px", fontWeight: 600,
          border: `1px solid ${Roles[currentUser.role]?.color || "#475569"}`,
          borderRadius: "4px", background: "#0f172a",
          color: Roles[currentUser.role]?.color || "#94a3b8",
          cursor: "pointer", outline: "none",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({Roles[u.role]?.label})
          </option>
        ))}
      </select>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </header>
  );
}

function Sep() {
  return <div style={{ width: "1px", height: "22px", background: "#334155", flexShrink: 0 }} />;
}

function HdrBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "4px 8px", fontSize: "10px", fontWeight: 600,
        color: "#94a3b8", background: "transparent",
        border: "1px solid #475569", borderRadius: "4px", cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#475569"; e.currentTarget.style.color = "#94a3b8"; }}
    >
      {children}
    </button>
  );
}

function Badge({ color, bg, children, onClose, closeable }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "9px", padding: "2px 6px", borderRadius: "10px",
      background: bg, color, fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {children}
      {closeable && (
        <span onClick={onClose} style={{ cursor: "pointer", marginLeft: "2px", opacity: 0.7 }}>✕</span>
      )}
    </span>
  );
}
