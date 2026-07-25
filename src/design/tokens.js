/**
 * Saniti Design System Tokens
 * Applied to SLD Editor
 */

export const colors = {
  // Brand
  brand: "#f36458",
  brandDeep: "#dd0000",

  // Core
  primary: "#0b0b0b",
  onPrimary: "#ffffff",

  // Canvas (dark)
  canvas: "#0b0b0b",
  canvasSoft: "#212121",
  canvasLight: "#ffffff",
  canvasPaper: "#ededed",

  // Hairlines
  hairlineSoft: "#353535",
  hairline: "#ededed",

  // Text
  ink: "#0b0b0b",
  inkSoft: "#212121",
  graphite: "#353535",
  slate: "#3c4758",
  slateSoft: "#505b6c",
  mute: "#797979",
  ash: "#b9b9b9",

  // Semantic
  linkBlue: "#0052ef",
  linkBlueSoft: "#55beff",
  success: "#37cd84",
  error: "#dd0000",
  surfaceBlueBg: "#afe3ff",

  // SLD-specific
  busbar: "#f36458",
  busbarGlow: "rgba(243, 100, 88, 0.15)",
  breakerClosed: "#37cd84",
  breakerOpen: "#dd0000",
  breakerTripped: "#f59e0b",
  transformer: "#55beff",
  generator: "#37cd84",
  load: "#f59e0b",
  ground: "#797979",
  capacitor: "#afe3ff",
  connection: "#353535",
  connectionLive: "#37cd84",
};

export const typography = {
  displayMega: { fontSize: 112, fontWeight: 400, lineHeight: 1.0, letterSpacing: "-4.48px" },
  displayXl: { fontSize: 72, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-2.88px" },
  displayLg: { fontSize: 60, fontWeight: 400, lineHeight: 0.8, letterSpacing: "0" },
  displayMd: { fontSize: 48, fontWeight: 400, lineHeight: 1.08, letterSpacing: "-1.68px" },
  displaySm: { fontSize: 38, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-1.14px" },
  headingMd: { fontSize: 32, fontWeight: 425, lineHeight: 1.13, letterSpacing: "-0.32px" },
  headingSm: { fontSize: 24, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.24px" },
  subtitle: { fontSize: 18, fontWeight: 400, lineHeight: 1.5, letterSpacing: "-0.18px" },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0" },
  bodySm: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, letterSpacing: "-0.15px" },
  caption: { fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0" },
  captionTight: { fontSize: 13, fontWeight: 500, lineHeight: 1.3, letterSpacing: "-0.13px" },
  meta: { fontSize: 12, fontWeight: 400, lineHeight: 1.5, letterSpacing: "-0.12px" },
  monoEyebrow: { fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0", fontFamily: "'IBM Plex Mono', monospace" },
  monoCaps: { fontSize: 11, fontWeight: 400, lineHeight: 1.5, letterSpacing: "0", fontFamily: "'IBM Plex Mono', monospace" },
  monoMicro: { fontSize: 10, fontWeight: 400, lineHeight: 1.3, letterSpacing: "0", fontFamily: "'IBM Plex Mono', monospace" },
  buttonLg: { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: "0" },
  buttonSm: { fontSize: 13, fontWeight: 500, lineHeight: 1.3, letterSpacing: "-0.13px" },
  buttonUppercase: { fontSize: 11, fontWeight: 600, lineHeight: 1.5, letterSpacing: "0", textTransform: "uppercase" },
};

export const spacing = {
  xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, section: 64, sectionLg: 96,
};

export const rounded = {
  none: 0, appXs: 3, appSm: 4, appMd: 5, appLg: 6, marketing: 12, full: 99999,
};
