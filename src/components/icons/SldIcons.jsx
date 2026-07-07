import React from "react";

// IEC 60617 / IEEE 315 standard SLD symbols
// All symbols drawn to standard proportions at 48x48 viewBox

export const CircuitBreakerIcon = ({ size = 48, status = "closed" }) => {
  const color = status === "closed" ? "#16a34a" : status === "open" ? "#dc2626" : "#d97706";
  const contactColor = status === "closed" ? color : "#94a3b8";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Lead lines */}
      <line x1="2" y1="24" x2="14" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Square body (IEC circuit breaker) */}
      <rect x="14" y="14" width="20" height="20" fill="none" stroke={contactColor} strokeWidth="2.5" />
      {/* X inside (breaker element) */}
      <line x1="18" y1="18" x2="30" y2="30" stroke={contactColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="18" x2="18" y2="30" stroke={contactColor} strokeWidth="2" strokeLinecap="round" />
      {/* Status indicator dot */}
      <circle cx="24" cy="8" r="3" fill={color} />
    </svg>
  );
};

export const TransformerIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Lead lines */}
    <line x1="2" y1="24" x2="12" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Primary winding (circle) */}
    <circle cx="19" cy="24" r="9" fill="none" stroke="#2563eb" strokeWidth="2.5" />
    {/* Secondary winding (circle, offset to overlap) */}
    <circle cx="29" cy="24" r="9" fill="none" stroke="#2563eb" strokeWidth="2.5" />
    {/* Delta symbol on primary */}
    <polygon points="16,20 22,20 19,26" fill="none" stroke="#2563eb" strokeWidth="1.2" />
    {/* Wye symbol on secondary */}
    <line x1="29" y1="19" x2="29" y2="25" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="29" y1="25" x2="26" y2="28" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="29" y1="25" x2="32" y2="28" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const BusbarIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Thick busbar (IEC standard: thick line) */}
    <rect x="4" y="18" width="40" height="12" rx="1" fill="#7c3aed" stroke="#5b21b6" strokeWidth="1.5" />
    {/* Tap-off lines (connection points) */}
    <line x1="10" y1="30" x2="10" y2="44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="30" x2="24" y2="44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="30" x2="38" y2="44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Connection dots */}
    <circle cx="10" cy="30" r="2.5" fill="#5b21b6" />
    <circle cx="24" cy="30" r="2.5" fill="#5b21b6" />
    <circle cx="38" cy="30" r="2.5" fill="#5b21b6" />
    {/* Incoming line */}
    <line x1="24" y1="4" x2="24" y2="18" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="18" r="2.5" fill="#5b21b6" />
  </svg>
);

export const GeneratorIcon = ({ size = 48, status = "running" }) => {
  const ringColor = status === "running" ? "#16a34a" : "#94a3b8";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Lead lines */}
      <line x1="2" y1="24" x2="10" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Circle (IEC generator symbol) */}
      <circle cx="24" cy="24" r="14" fill="none" stroke={ringColor} strokeWidth="2.5" />
      {/* G letter */}
      <text x="24" y="29" textAnchor="middle" fontSize="16" fontFamily="serif" fontWeight="bold" fill={ringColor}>G</text>
    </svg>
  );
};

export const LoadIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Lead line */}
    <line x1="2" y1="24" x2="16" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Arrow head (IEEE load symbol) */}
    <polygon points="16,16 38,24 16,32" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Fill for arrow */}
    <polygon points="16,16 38,24 16,32" fill="#d97706" fillOpacity="0.15" stroke="none" />
    {/* P label */}
    <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="bold" fill="#92400e">P</text>
  </svg>
);

export const SwitchIcon = ({ size = 48, status = "open" }) => {
  const angle = status === "closed" ? 0 : 35;
  const lineEndX = 30 + Math.cos((-angle * Math.PI) / 180) * 12;
  const lineEndY = 24 - Math.sin((-angle * Math.PI) / 180) * 12;
  const contactColor = status === "closed" ? "#16a34a" : "#dc2626";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Lead lines */}
      <line x1="2" y1="24" x2="14" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Fixed contacts (small circles per IEC) */}
      <circle cx="16" cy="24" r="2.5" fill="#1e293b" />
      <circle cx="34" cy="24" r="2.5" fill="#1e293b" />
      {/* Moving contact arm */}
      <line x1="16" y1="24" x2={lineEndX} y2={lineEndY} stroke={contactColor} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export const CapacitorIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Lead lines */}
    <line x1="2" y1="24" x2="17" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="31" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Capacitor plates (IEC: two parallel lines) */}
    <line x1="19" y1="10" x2="19" y2="38" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
    <line x1="29" y1="10" x2="29" y2="38" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const GroundIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Vertical lead */}
    <line x1="24" y1="2" x2="24" y2="16" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Ground lines (IEC 60617: 3 lines, decreasing width) */}
    <line x1="10" y1="16" x2="38" y2="16" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
    <line x1="15" y1="24" x2="33" y2="24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="32" x2="28" y2="32" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Ground potential symbol */}
    <line x1="22" y1="38" x2="26" y2="38" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MotorIcon = ({ size = 48, status = "running" }) => {
  const ringColor = status === "running" ? "#16a34a" : "#94a3b8";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Lead lines */}
      <line x1="2" y1="24" x2="10" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Circle */}
      <circle cx="24" cy="24" r="14" fill="none" stroke={ringColor} strokeWidth="2.5" />
      {/* M letter */}
      <text x="24" y="29" textAnchor="middle" fontSize="16" fontFamily="serif" fontWeight="bold" fill={ringColor}>M</text>
    </svg>
  );
};

export const FuseIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Lead lines */}
    <line x1="2" y1="24" x2="12" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Fuse body (IEC: rectangle) */}
    <rect x="12" y="16" width="24" height="16" rx="1" fill="none" stroke="#ea580c" strokeWidth="2" />
    {/* Fuse element line through center */}
    <line x1="12" y1="24" x2="36" y2="24" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 2" />
  </svg>
);

export const CTIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Primary line (through) */}
    <line x1="2" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* CT core (circle around primary) */}
    <circle cx="24" cy="24" r="10" fill="none" stroke="#7c3aed" strokeWidth="2" />
    {/* Secondary winding indicator */}
    <circle cx="24" cy="24" r="6" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Label */}
    <text x="24" y="28" textAnchor="middle" fontSize="8" fontFamily="serif" fontWeight="bold" fill="#7c3aed">CT</text>
  </svg>
);

export const CurrentTransformerIcon = CTIcon;

export const PotentialTransformerIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    {/* Primary line */}
    <line x1="2" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* PT body */}
    <circle cx="24" cy="24" r="10" fill="none" stroke="#2563eb" strokeWidth="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="8" fontFamily="serif" fontWeight="bold" fill="#2563eb">PT</text>
    {/* Tap line down */}
    <line x1="24" y1="34" x2="24" y2="44" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" />
  </svg>
);

export const MotorStarterIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="24" x2="12" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="24" x2="46" y2="24" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    {/* Contactor box */}
    <rect x="12" y="14" width="24" height="20" rx="2" fill="none" stroke="#0d9488" strokeWidth="2" />
    {/* Coil symbol */}
    <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="serif" fontWeight="bold" fill="#0d9488">MS</text>
  </svg>
);
