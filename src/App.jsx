import React, { useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/panels/Sidebar";
import PropertyPanel from "./components/panels/PropertyPanel";
import useSldStore from "./store/useSldStore";
import { parseScdFile } from "./iec61850/parser/scdParser";
import { parseDpsFile } from "./dps/renderer/dpsRenderer";
import { Roles } from "./auth/roles";
import { colors, typography, spacing, rounded } from "./design/tokens";

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        background: colors.canvas,
        color: colors.onPrimary,
      }}>
        <NavBar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar />
          <Canvas />
          <PropertyPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

function NavBar() {
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
    <nav style={{
      height: "64px",
      background: colors.canvas,
      display: "flex",
      alignItems: "center",
      padding: `0 ${spacing.lg}px`,
      gap: spacing.lg,
      borderBottom: `1px solid ${colors.hairlineSoft}`,
      flexShrink: 0,
      position: "relative",
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexShrink: 0 }}>
        <span className="brand-dot" />
        <span style={{
          fontSize: 18,
          fontWeight: 700,
          color: colors.onPrimary,
          letterSpacing: "-0.36px",
        }}>
          SLD Editor
        </span>
      </div>

      {/* Center nav items */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.lg,
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      }}>
        <NavItem label="Canvas" active />
        <NavItem label="Topology" />
        <NavItem label="Schemas" />
      </div>

      {/* Right cluster */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: spacing.md }}>
        {/* Import inputs */}
        <input ref={scdInputRef} type="file" accept=".scd,.scl,.xml" onChange={handleScdImport} style={{ display: "none" }} />
        <input ref={dpsInputRef} type="file" accept=".json" onChange={handleDpsImport} style={{ display: "none" }} />

        {/* File badges */}
        {scdFileName && (
          <span className="badge badge-success" style={{ cursor: can("import_scd") ? "pointer" : "default" }}
            onClick={() => can("import_scd") && clearScd()}>
            SCD: {scdFileName} {can("import_scd") && "×"}
          </span>
        )}
        {dpsFileName && (
          <span className="badge badge-success" style={{ cursor: can("import_dps") ? "pointer" : "default" }}
            onClick={() => can("import_dps") && clearDps()}>
            DPS: {dpsFileName} {can("import_dps") && "×"}
          </span>
        )}

        {/* Import buttons */}
        {can("import_scd") && (
          <button className="btn-secondary" onClick={() => scdInputRef.current?.click()}>
            Import SCD
          </button>
        )}
        {can("import_dps") && (
          <button className="btn-secondary" onClick={() => dpsInputRef.current?.click()}>
            Import DPS
          </button>
        )}

        {/* Live mode */}
        {(scdModel || dpsTopology) && (
          <button
            className={liveMode ? "btn-brand" : "btn-secondary"}
            onClick={toggleLiveMode}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: liveMode ? colors.onPrimary : colors.mute,
              animation: liveMode ? "pulse 1.5s infinite" : "none",
            }} />
            {liveMode ? "LIVE" : "Go Live"}
          </button>
        )}

        {/* Alarms */}
        {activeAlarms.length > 0 && (
          <button className="btn-brand" onClick={acknowledgeAllAlarms}
            style={{ animation: "pulse 1s infinite", background: colors.error }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L1 11h10L6 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="6" cy="9" r="0.6" fill="currentColor"/>
            </svg>
            {activeAlarms.length} ALARM{activeAlarms.length > 1 ? "S" : ""}
          </button>
        )}

        {/* User switcher */}
        <select
          value={currentUser.id}
          onChange={(e) => switchUser(e.target.value)}
          style={{
            padding: "4px 8px",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            background: colors.canvasSoft,
            color: colors.ash,
            border: `1px solid ${colors.hairlineSoft}`,
            borderRadius: rounded.appSm,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({Roles[u.role]?.label})</option>
          ))}
        </select>
      </div>
    </nav>
  );
}

function NavItem({ label, active }) {
  return (
    <span style={{
      fontSize: 16,
      fontWeight: active ? 500 : 400,
      color: active ? colors.onPrimary : colors.ash,
      cursor: "pointer",
      padding: `${spacing.xs}px 0`,
      borderBottom: active ? `2px solid ${colors.brand}` : "2px solid transparent",
      transition: "all 0.15s",
    }}>
      {label}
    </span>
  );
}
