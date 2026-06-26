import { Easing, type EasingFunction } from "remotion";

// ── Brand Palette ──────────────────────────────────────────────
export const colors = {
  brand: {
    green: "#26c267",
    greenDark: "#1a7a3e",
    gold: "#f5c84b",
    goldDark: "#c8960e",
  },
  surface: {
    black: "#000000",
    deep: "#050a08",
    dark: "#080d0a",
    forest: "#0f1f18",
    card: "#0c1d14",
  },
  glass: {
    border: "rgba(255,255,255,0.06)",
    bg: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
    highlight: "inset 0 1px 0 rgba(255,255,255,0.06)",
    shadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  white: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
};

// ── Easing Curves ──────────────────────────────────────────────
export const easing: Record<string, EasingFunction> = {
  crisp: Easing.bezier(0.16, 1, 0.3, 1),
  smooth: Easing.bezier(0.45, 0, 0.55, 1),
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
  decelerated: Easing.bezier(0.22, 1, 0.36, 1),
};

// ── Camera Movements ──────────────────────────────────────────
export const camera = {
  slowPush: { start: 1, end: 1.1 },
  gentlePan: { x: { start: 0, end: 5 }, y: { start: 0, end: -3 } },
  parallax: { start: 0, end: -2 },
  rotateY: { start: -10, end: 10 },
  rotateX: { start: 5, end: -3 },
};

// ── Effects ─────────────────────────────────────────────────────
export const effects = {
  bloom: {
    maxOpacity: 0.25,
    blur: "60px",
    color: "rgba(38,194,103,0.12)",
    scale: 1.4,
    size: 300,
  },
  volumetric: {
    beamWidth: { start: 25, end: 30 },
    beamOpacity: 0.05,
    blur: "50px",
    secondaryBlur: "60px",
  },
  lightStreaks: {
    primaryWidth: 280,
    primaryHeight: 1.5,
    secondaryWidth: 160,
    secondaryHeight: 1,
    primaryBlur: "2px",
    secondaryBlur: "3px",
    primaryRotate: -22,
    secondaryRotate: 12,
  },
  glow: {
    green: (intensity: number) => `0 0 ${20 * intensity}px rgba(38, 194, 103, ${0.3 * intensity})`,
    blue: (intensity: number) => `0 0 ${60 * intensity}px rgba(60, 160, 255, ${0.15 * intensity})`,
  },
  reflections: {
    maxOpacity: 0.08,
  },
  particles: {
    count: 45,
    maxSize: 2.6,
    minSize: 0.8,
    maxDrift: 55,
    baseOpacity: 0.5,
  },
  glassmorphism: {
    borderRadius: 12,
    backdropBlur: "12px",
  },
};

// ── Timing ──────────────────────────────────────────────────────
export const timing = {
  fps: 30,
  totalFrames: 180,
  darknessExit: 8,
  logoStart: 28,
  logoEnd: 68,
  subtitleStart: 72,
  subtitleEnd: 110,
  outroStart: 148,
  dof: {
    startBlur: 6,
    midBlur: 0.5,
    endBlur: 4,
    entrance: 18,
    exitStart: 130,
    exitEnd: 145,
  },
};

// ── Typography ──────────────────────────────────────────────────
export const typography = {
  display: {
    fontFamily: "Oswald, 'Arial Black', Impact, sans-serif",
    fontWeight: 900,
    letterSpacing: "0.1em",
  },
  subtitle: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontWeight: 400,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
  },
};

// ── Grid ────────────────────────────────────────────────────────
export const grid = {
  size: 50,
  color: "rgba(38, 194, 103, 0.03)",
};

// ── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  text: (opacity: number) => `0 0 20px rgba(38, 194, 103, ${opacity * 0.2})`,
  svg: "0 0 4px rgba(245, 200, 75, 0.15)",
};
