import React, { useState, useCallback } from "react";
import { sldSchemas } from "../../schemas/sldSchemas";

const typeColors = {
  string: "#2563eb",
  number: "#7c3aed",
  integer: "#7c3aed",
  boolean: "#d97706",
  array: "#0891b2",
  object: "#64748b",
};

const typeBadges = {
  string: "str",
  number: "num",
  integer: "int",
  boolean: "bool",
  array: "arr",
  object: "obj",
};

function TreeNode({ name, schema, depth = 0, required = false, isLast = true }) {
  const [expanded, setExpanded] = useState(depth < 2);

  const isObject = schema.type === "object" && schema.properties;
  const isArray = schema.type === "array" && schema.items;
  const hasChildren = isObject || isArray;

  const toggle = () => setExpanded(!expanded);

  const indent = depth * 16;

  return (
    <div>
      <div
        onClick={hasChildren ? toggle : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 8px",
          paddingLeft: `${indent + 8}px`,
          cursor: hasChildren ? "pointer" : "default",
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: "22px",
          borderRadius: "3px",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Expand/collapse arrow */}
        <span style={{
          width: "14px",
          fontSize: "8px",
          color: "#94a3b8",
          textAlign: "center",
          flexShrink: 0,
        }}>
          {hasChildren ? (expanded ? "▼" : "▶") : "·"}
        </span>

        {/* Property name */}
        <span style={{ color: "#1e293b", fontWeight: 600 }}>{name}</span>

        {/* Required badge */}
        {required && (
          <span style={{
            fontSize: "8px",
            fontWeight: 700,
            color: "#dc2626",
            background: "#fef2f2",
            padding: "0 4px",
            borderRadius: "3px",
            lineHeight: "14px",
            letterSpacing: "0.03em",
          }}>
            REQ
          </span>
        )}

        {/* Colon */}
        <span style={{ color: "#94a3b8" }}>:</span>

        {/* Type badge */}
        <span style={{
          fontSize: "9px",
          fontWeight: 700,
          color: typeColors[schema.type] || "#64748b",
          background: `${typeColors[schema.type] || "#64748b"}15`,
          padding: "0 5px",
          borderRadius: "3px",
          lineHeight: "14px",
          letterSpacing: "0.02em",
        }}>
          {typeBadges[schema.type] || schema.type}
        </span>

        {/* Enum indicator */}
        {schema.enum && (
          <span style={{
            fontSize: "9px",
            color: "#d97706",
            background: "#fef9c3",
            padding: "0 4px",
            borderRadius: "3px",
            lineHeight: "14px",
          }}>
            enum({schema.enum.length})
          </span>
        )}

        {/* Default value */}
        {schema.default !== undefined && (
          <span style={{
            fontSize: "9px",
            color: "#6b7280",
            fontStyle: "italic",
          }}>
            = {JSON.stringify(schema.default)}
          </span>
        )}

        {/* Title */}
        {schema.title && schema.title !== name && (
          <span style={{
            fontSize: "10px",
            color: "#94a3b8",
            marginLeft: "auto",
          }}>
            {schema.title}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {isObject && Object.entries(schema.properties).map(([key, prop], i, arr) => (
            <TreeNode
              key={key}
              name={key}
              schema={prop}
              depth={depth + 1}
              required={(schema.required || []).includes(key)}
              isLast={i === arr.length - 1}
            />
          ))}
          {isArray && schema.items && (
            <TreeNode
              name="[]"
              schema={schema.items}
              depth={depth + 1}
              required={false}
              isLast={true}
            />
          )}
        </div>
      )}
    </div>
  );
}

function EnumValues({ values }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", paddingLeft: "20px", paddingBottom: "4px" }}>
      {values.map((v) => (
        <span key={v} style={{
          fontSize: "9px",
          padding: "1px 6px",
          borderRadius: "3px",
          background: "#f1f5f9",
          color: "#475569",
          border: "1px solid #e2e8f0",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {v}
        </span>
      ))}
    </div>
  );
}

export default function SchemaTree() {
  const [activeSchema, setActiveSchema] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const schemaEntries = Object.entries(sldSchemas).filter(([type]) =>
    !searchTerm || type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
        <input
          type="text"
          placeholder="Search schema..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "5px 8px",
            fontSize: "11px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            outline: "none",
            fontFamily: "'JetBrains Mono', monospace",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {schemaEntries.map(([type, schema]) => {
          const isActive = activeSchema === type;
          const requiredCount = (schema.required || []).length;
          const propCount = Object.keys(schema.properties).length;

          return (
            <div key={type}>
              <div
                onClick={() => setActiveSchema(isActive ? null : type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: isActive ? "#1e293b" : "#475569",
                  background: isActive ? "#f1f5f9" : "transparent",
                  borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "8px", color: "#94a3b8" }}>
                  {isActive ? "▼" : "▶"}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{schema.title}</span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: "9px",
                  color: "#94a3b8",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {propCount}p · {requiredCount}r
                </span>
              </div>

              {isActive && (
                <div style={{
                  background: "#fafbfc",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "4px",
                }}>
                  <TreeNode name={type} schema={schema} depth={0} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
