import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing, typography } from "../design-tokens";

const TOTAL = 360;
const FREEZE_FRAME = 300;

const CHAOS_START = 30;
const CHAOS_PEAK = 270;
const LINE1_START = 90;
const LINE1_END = 125;
const LINE2_START = 160;
const LINE2_END = 185;
const LINE3_START = 195;
const LINE3_END = 220;
const LINE4_START = 230;
const LINE4_END = 255;
const LINE5_START = 265;
const LINE5_END = 295;

const LINES = [
  { text: "Running a league shouldn't feel like managing chaos.", start: LINE1_START, end: LINE1_END },
  { text: "Spreadsheets.", start: LINE2_START, end: LINE2_END },
  { text: "Paperwork.", start: LINE3_START, end: LINE3_END },
  { text: "Endless coordination.", start: LINE4_START, end: LINE4_END },
  { text: "Everything feels slightly disorganized.", start: LINE5_START, end: LINE5_END },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface SpreadsheetData {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  colWidths: number[];
  rowHeights: number[];
}

interface CalendarData {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  month: number;
}

interface DocumentData {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  height: number;
  lines: number;
}

interface FixtureData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  curve: number;
}

const spreadsheetData: SpreadsheetData[] = [
  { x: 10, y: 10, rotation: -2, scale: 1, delay: 0, colWidths: [40, 60, 50, 45, 55, 50], rowHeights: [20, 18, 18, 18, 18, 18, 18, 18] },
  { x: 35, y: 25, rotation: 3, scale: 0.92, delay: 10, colWidths: [50, 45, 60, 40, 50, 55], rowHeights: [20, 18, 18, 18, 18, 18, 18, 18] },
  { x: 55, y: 15, rotation: -4, scale: 0.85, delay: 20, colWidths: [45, 55, 40, 60, 50, 45], rowHeights: [20, 18, 18, 18, 18, 18, 18, 18] },
  { x: 70, y: 40, rotation: 2, scale: 0.78, delay: 30, colWidths: [55, 40, 50, 45, 60, 50], rowHeights: [20, 18, 18, 18, 18, 18, 18, 18] },
  { x: 15, y: 55, rotation: -5, scale: 0.75, delay: 40, colWidths: [50, 50, 50, 50, 50, 50], rowHeights: [20, 18, 18, 18, 18, 18, 18, 18] },
  { x: 45, y: 50, rotation: 4, scale: 0.82, delay: 15, colWidths: [60, 45, 55, 40, 50, 45], rowHeights: [20, 18, 18, 18, 18, 18, 18, 18] },
];

const calendarData: CalendarData[] = [
  { x: 5, y: 5, rotation: -1, scale: 1, delay: 0, month: 0 },
  { x: 30, y: 35, rotation: 5, scale: 0.88, delay: 15, month: 1 },
  { x: 60, y: 8, rotation: -3, scale: 0.82, delay: 25, month: 2 },
  { x: 75, y: 30, rotation: 2, scale: 0.76, delay: 35, month: 3 },
  { x: 20, y: 70, rotation: -4, scale: 0.7, delay: 45, month: 0 },
];

const documentData: DocumentData[] = [
  { x: 8, y: 25, rotation: -2, scale: 0.95, delay: 5, height: 90, lines: 5 },
  { x: 25, y: 10, rotation: 4, scale: 1, delay: 12, height: 85, lines: 4 },
  { x: 50, y: 45, rotation: -6, scale: 0.85, delay: 22, height: 95, lines: 6 },
  { x: 68, y: 18, rotation: 3, scale: 0.8, delay: 32, height: 80, lines: 4 },
  { x: 40, y: 65, rotation: -1, scale: 0.72, delay: 42, height: 88, lines: 5 },
  { x: 78, y: 52, rotation: -5, scale: 0.7, delay: 50, height: 92, lines: 5 },
  { x: 55, y: 28, rotation: 6, scale: 0.78, delay: 28, height: 75, lines: 3 },
];

const fixtureData: FixtureData[] = [
  { x1: 15, y1: 20, x2: 85, y2: 35, delay: 0, curve: 10 },
  { x1: 20, y1: 45, x2: 80, y2: 55, delay: 8, curve: -15 },
  { x1: 10, y1: 60, x2: 90, y2: 40, delay: 16, curve: 20 },
  { x1: 30, y1: 15, x2: 70, y2: 70, delay: 24, curve: -25 },
  { x1: 40, y1: 30, x2: 60, y2: 65, delay: 32, curve: 12 },
  { x1: 5, y1: 40, x2: 95, y2: 25, delay: 40, curve: -8 },
  { x1: 50, y1: 10, x2: 45, y2: 75, delay: 48, curve: 18 },
  { x1: 60, y1: 20, x2: 25, y2: 60, delay: 56, curve: -12 },
];

const BackgroundGradient: React.FC<{ frame: number }> = ({ frame }) => {
  const warmIntensity = interpolate(frame, [0, CHAOS_PEAK, TOTAL], [0, 0.4, 0.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 100% 80% at 50% 40%,
              rgba(30, 15, 10, ${0.4 + warmIntensity * 0.3}) 0%,
              rgba(10, 8, 12, ${0.6 + warmIntensity * 0.2}) 40%,
              rgba(5, 5, 8, 1) 100%
            )
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 40% 40% at 30% 20%,
              rgba(180, 100, 40, ${0.03 * warmIntensity}) 0%,
              transparent 60%
            )
          `,
        }}
      />
    </AbsoluteFill>
  );
};

const SpreadsheetCell: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  isHeader: boolean;
  chaosProgress: number;
}> = ({ x, y, w, h, isHeader, chaosProgress }) => {
  const driftX = (seededRandom(x * 100 + y) - 0.5) * chaosProgress * 60;
  const driftY = (seededRandom(x * 200 + y) - 0.5) * chaosProgress * 40;
  const opacity = 1 - chaosProgress * 0.3;

  return (
    <div
      className="absolute"
      style={{
        left: x + driftX,
        top: y + driftY,
        width: w - 1,
        height: h - 1,
        background: isHeader ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
        borderRight: "0.5px solid rgba(255,255,255,0.06)",
        borderBottom: "0.5px solid rgba(255,255,255,0.04)",
        opacity,
      }}
    />
  );
};

const Spreadsheet: React.FC<{
  data: SpreadsheetData;
  chaosProgress: number;
}> = ({ data, chaosProgress }) => {
  const driftX = (seededRandom(data.x * 100) - 0.5) * chaosProgress * 80;
  const driftY = (seededRandom(data.y * 100) - 0.5) * chaosProgress * 60;
  const rotation = data.rotation + chaosProgress * (seededRandom(data.x * 50) - 0.5) * 8;
  const opacity = interpolate(chaosProgress, [0, 0.4, 1], [0.7, 0.5, 0.35], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const totalW = data.colWidths.reduce((a, b) => a + b, 0);
  const totalH = data.rowHeights.reduce((a, b) => a + b, 0);

  return (
    <div
      className="absolute rounded-md overflow-hidden"
      style={{
        left: `${data.x + driftX}%`,
        top: `${data.y + driftY}%`,
        width: totalW,
        height: totalH,
        rotate: `${rotation}deg`,
        scale: `${data.scale}`,
        opacity,
        border: "0.5px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(2px)",
        willChange: "transform, opacity",
      }}
    >
      {data.colWidths.map((w, ci) =>
        data.rowHeights.map((h, ri) => {
          let x = 0;
          for (let c = 0; c < ci; c++) x += data.colWidths[c];
          let y = 0;
          for (let r = 0; r < ri; r++) y += data.rowHeights[r];
          return (
            <SpreadsheetCell
              key={`${ci}-${ri}`}
              x={x}
              y={y}
              w={w}
              h={h}
              isHeader={ri === 0}
              chaosProgress={chaosProgress}
            />
          );
        }),
      )}
    </div>
  );
};

const CalendarGrid: React.FC<{
  data: CalendarData;
  chaosProgress: number;
}> = ({ data, chaosProgress }) => {
  const driftX = (seededRandom(data.x * 200) - 0.5) * chaosProgress * 70;
  const driftY = (seededRandom(data.y * 200) - 0.5) * chaosProgress * 50;
  const rotation = data.rotation + chaosProgress * (seededRandom(data.x * 100) - 0.5) * 10;
  const opacity = interpolate(chaosProgress, [0, 0.5, 1], [0.6, 0.4, 0.25], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const MONTHS = ["JAN", "FEB", "MAR", "APR"];
  const days = 28;

  return (
    <div
      className="absolute rounded-md p-2"
      style={{
        left: `${data.x + driftX}%`,
        top: `${data.y + driftY}%`,
        width: 140,
        rotate: `${rotation}deg`,
        scale: `${data.scale}`,
        opacity,
        border: "0.5px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: "0.1em", textAlign: "center" }}>
        {MONTHS[data.month]}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, 1fr)`, gap: 1 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={`h-${i}`} style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>{d}</div>
        ))}
        {Array.from({ length: days }, (_, i) => {
          const cellChaos = (seededRandom(data.x * 300 + i) - 0.5) * chaosProgress * 10;
          const highlight = seededRandom(data.y * 400 + i) > 0.85;
          return (
            <div
              key={i}
              style={{
                fontSize: 7,
                color: highlight ? "rgba(245, 200, 75, 0.6)" : "rgba(255,255,255,0.45)",
                textAlign: "center",
                translate: `${cellChaos}px ${cellChaos * 0.5}px`,
                background: highlight ? "rgba(245, 200, 75, 0.05)" : "transparent",
                borderRadius: 1,
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Document: React.FC<{
  data: DocumentData;
  chaosProgress: number;
}> = ({ data, chaosProgress }) => {
  const driftX = (seededRandom(data.x * 150) - 0.5) * chaosProgress * 90;
  const driftY = (seededRandom(data.y * 150) - 0.5) * chaosProgress * 60;
  const rotation = data.rotation + chaosProgress * (seededRandom(data.x * 80) - 0.5) * 12;
  const opacity = interpolate(chaosProgress, [0, 0.3, 1], [0.8, 0.5, 0.3], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stackOffset = chaosProgress * seededRandom(data.x * 50) * 6;

  return (
    <div
      className="absolute rounded-sm"
      style={{
        left: `${data.x + driftX}%`,
        top: `${data.y + driftY - stackOffset}%`,
        width: 70,
        height: data.height,
        rotate: `${rotation}deg`,
        scale: `${data.scale}`,
        opacity,
        border: "0.5px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(1px)",
        padding: 8,
        willChange: "transform, opacity",
      }}
    >
      <div style={{ width: "60%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 1, marginBottom: 6 }} />
      <div style={{ width: "40%", height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1, marginBottom: 8 }} />
      {Array.from({ length: data.lines }, (_, i) => (
        <div
          key={i}
          style={{
            width: `${40 + seededRandom(data.x * 500 + i) * 50}%`,
            height: 2,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 1,
            marginBottom: 4,
            translate: `${(seededRandom(i * 100) - 0.5) * chaosProgress * 8}px 0`,
          }}
        />
      ))}
    </div>
  );
};

const FixtureLine: React.FC<{
  data: FixtureData;
  chaosProgress: number;
  frame: number;
}> = ({ data, chaosProgress, frame }) => {
  const localProgress = Math.max(0, frame - data.delay) / 120;
  const drawProgress = interpolate(localProgress, [0, 1], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineOpacity = interpolate(chaosProgress, [0, 0.5, 1], [0.15, 0.25, 0.12], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const x1 = data.x1 + (seededRandom(data.x1 * 100) - 0.5) * chaosProgress * 8;
  const y1 = data.y1 + (seededRandom(data.y1 * 100) - 0.5) * chaosProgress * 8;
  const x2 = data.x2 + (seededRandom(data.x2 * 100) - 0.5) * chaosProgress * 8;
  const y2 = data.y2 + (seededRandom(data.y2 * 100) - 0.5) * chaosProgress * 8;

  const homeLabel = ["ARS", "CHE", "LIV", "MCI", "TOT", "MUN", "NEW", "AVL"][seededRandom(data.x1 * 50) * 8 | 0];
  const awayLabel = ["EVE", "LEI", "BHA", "FUL", "BRE", "WOL", "CRY", "SOU"][seededRandom(data.y1 * 50) * 8 | 0];
  const labelChaos = (seededRandom(data.x1 * 300) - 0.5) * chaosProgress * 20;

  return (
    <div className="absolute inset-0" style={{ opacity: drawProgress * lineOpacity, pointerEvents: "none" }}>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <line
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
          strokeDasharray={chaosProgress > 0.6 ? "2 3" : "none"}
        />
      </svg>
      <div
        className="absolute flex items-center gap-1"
        style={{
          left: `${(x1 + x2) / 2 + labelChaos}%`,
          top: `${(y1 + y2) / 2 - 2}%`,
          translate: "-50% -50%",
        }}
      >
        <span style={{ fontSize: 6, fontWeight: 600, color: "rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.4)", padding: "1px 3px", borderRadius: 2 }}>
          {homeLabel} vs {awayLabel}
        </span>
      </div>
    </div>
  );
};

const AdminOverload: React.FC<{
  frame: number;
  chaosProgress: number;
}> = ({ frame, chaosProgress }) => {
  const items = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      label: ["Registration", "Scheduling", "Results", "Stats", "Reports", "Fees", "Rosters", "Permits"][i % 8],
      x: seededRandom(i * 200) * 100,
      delay: i * 6,
      height: seededRandom(i * 50) * 20 + 10,
    })), []);

  return (
    <AbsoluteFill>
      {items.map((item, i) => {
        const appearFrame = Math.max(0, frame - item.delay - 80);
        const opacity = interpolate(appearFrame, [0, 20], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const driftX = (seededRandom(i * 300) - 0.5) * chaosProgress * 100;
        const driftY = (seededRandom(i * 400) - 0.5) * chaosProgress * 60 - appearFrame * 0.15;
        const rotation = (seededRandom(i * 500) - 0.5) * chaosProgress * 15;

        return (
          <div
            key={i}
            className="absolute rounded-sm flex items-center"
            style={{
              left: `${item.x + driftX}%`,
              top: `${70 + driftY}%`,
              height: item.height,
              padding: "0 8px",
              opacity: opacity * (1 - chaosProgress * 0.4),
              rotate: `${rotation}deg`,
              border: "0.5px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const ChaosTypography: React.FC<{
  text: string;
  start: number;
  end: number;
  currentFrame: number;
}> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, duration * 0.35, duration * 0.6, duration], [0, 1, 1, 0], {
    easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration * 0.35], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const isEmphasis = text.length < 20;
  const fontSize = isEmphasis ? 40 : 30;

  return (
    <div style={{ opacity, translate: `0 ${translateY}px`, display: "flex", justifyContent: "center" }}>
      <span
        style={{
          fontFamily: isEmphasis ? typography.display.fontFamily : "system-ui, -apple-system, sans-serif",
          fontSize,
          fontWeight: isEmphasis ? 800 : 400,
          color: "white",
          textAlign: "center",
          lineHeight: 1.3,
          letterSpacing: isEmphasis ? "0.04em" : "0.02em",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const TypographyLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = LINES.some((l) => frame >= l.start && frame < l.end + 15);
  if (!anyVisible) return null;

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{ top: "44%", height: "auto", zIndex: 50 }}
    >
      <div
        className="flex flex-col items-center rounded-2xl px-10 py-6"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {LINES.map((line) => (
          <ChaosTypography
            key={line.text}
            text={line.text}
            start={line.start}
            end={line.end}
            currentFrame={frame}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FreezeOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < FREEZE_FRAME) return null;

  const progress = interpolate(frame, [FREEZE_FRAME, FREEZE_FRAME + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const vignetteSize = interpolate(progress, [0, 1], [100, 85]);
  const tintOpacity = interpolate(progress, [0, 1], [0, 0.15]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 60 }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent ${vignetteSize}%, rgba(0,0,0,0.4) 100%)`,
          opacity: 1,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(180, 100, 40, 0.06)",
          opacity: tintOpacity,
        }}
      />
      <div className="absolute inset-x-0" style={{ top: "50%", height: 1, background: "rgba(255,255,255,0.04)", opacity: progress }} />
    </AbsoluteFill>
  );
};

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  const chaosProgress = interpolate(frame, [CHAOS_START, CHAOS_PEAK], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cameraSway = interpolate(frame, [0, TOTAL], [0, 2], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <div
        className="absolute inset-0"
        style={{
          translate: `${cameraSway}px 0`,
          willChange: "translate",
        }}
      >
        <BackgroundGradient frame={frame} />

        {spreadsheetData.map((s, i) => (
          <Spreadsheet key={`s-${i}`} data={s} chaosProgress={frame >= FREEZE_FRAME ? 1 : chaosProgress} />
        ))}

        {calendarData.map((c, i) => (
          <CalendarGrid key={`c-${i}`} data={c} chaosProgress={frame >= FREEZE_FRAME ? 1 : chaosProgress} />
        ))}

        {documentData.map((d, i) => (
          <Document key={`d-${i}`} data={d} chaosProgress={frame >= FREEZE_FRAME ? 1 : chaosProgress} />
        ))}

        {fixtureData.map((f, i) => (
          <FixtureLine key={`f-${i}`} data={f} chaosProgress={frame >= FREEZE_FRAME ? 1 : chaosProgress} frame={frame} />
        ))}

        <AdminOverload frame={frame} chaosProgress={frame >= FREEZE_FRAME ? 1 : chaosProgress} />
      </div>

      <TypographyLayer frame={frame} />
      <FreezeOverlay frame={frame} />
    </AbsoluteFill>
  );
};
