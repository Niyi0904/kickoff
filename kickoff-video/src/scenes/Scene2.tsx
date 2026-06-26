import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { colors, easing, typography } from "../design-tokens";

const TOTAL = 360;

const REVEAL_START = 0;
const REVEAL_END = 25;
const HEADER_START = 15;
const HEADER_END = 40;
const CONTENT_START = 35;
const TILES_START = 55;
const TILES_END = 90;
const GLOW_START = 100;
const GLOW_END = 180;
const MOUSE_START = 150;
const CLICK_FRAME = 210;
const KINETIC_START = 195;
const BUTTON_ZOOM_START = 310;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Leagues", href: "#leagues" },
  { label: "Fixtures", href: "#fixtures" },
  { label: "Standings", href: "#standings" },
  { label: "Teams", href: "#teams" },
];

const METRICS = [
  { label: "Active Teams", value: 24 },
  { label: "Registered Players", value: 586 },
  { label: "Matches Played", value: 142 },
  { label: "Goals Scored", value: 387 },
];

const KINETIC_LINES = [
  "Manage Every League.",
  "Every Team.",
  "Every Match.",
  "One Platform.",
];

const KINETIC_TIMING = [
  { start: KINETIC_START, end: KINETIC_START + 25 },
  { start: KINETIC_START + 30, end: KINETIC_START + 55 },
  { start: KINETIC_START + 60, end: KINETIC_START + 85 },
  { start: KINETIC_START + 90, end: KINETIC_START + 115 },
];

const PageBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const cx = interpolate(frame, [0, TOTAL], [50, 53], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(frame, [0, TOTAL], [40, 44], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 120% 80% at ${cx}% ${cy}%,
              #0a1a14 0%,
              #07130f 40%,
              #040a08 100%
            )
          `,
          willChange: "background",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 60% 50% at 55% 25%,
              rgba(38, 194, 103, 0.03) 0%,
              transparent 70%
            )
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 50% 30% at 40% 60%,
              rgba(60, 140, 255, 0.02) 0%,
              transparent 60%
            )
          `,
        }}
      />
      <div className="absolute inset-x-0 bottom-0" style={{ height: "20%", background: "linear-gradient(to top, #07130f 0%, transparent 100%)" }} />
    </AbsoluteFill>
  );
};

const HeaderBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [HEADER_START, HEADER_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [HEADER_START, HEADER_END], [-12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoFloat = interpolate(frame, [0, TOTAL], [0, -0.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="absolute"
      style={{
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        opacity,
        translate: `0 ${translateY}px`,
      }}
    >
      <div
        className="absolute inset-x-0"
        style={{ top: 0, height: 80, borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(7, 19, 15, 0.88)", backdropFilter: "blur(24px)" }}
      />
      <div
        className="relative mx-auto flex h-20 items-center justify-between"
        style={{ maxWidth: 1200, padding: "0 24px" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: colors.brand.green }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 6 12 8.5V4l8 6-8 6v-4.5C9 11 7 13 4.5 13a2.5 2.5 0 0 1 0-5H6" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-black leading-none text-white" style={{ fontFamily: typography.display.fontFamily, fontWeight: 900, letterSpacing: "0.02em", translate: `0 ${logoFloat}px` }}>KICKOFF</div>
            <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>League Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item, i) => {
            const itemOpacity = interpolate(frame, [HEADER_START + i * 3, HEADER_END + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span
                key={item.label}
                className="rounded-md px-3 py-2 text-sm font-semibold"
                style={{ color: "rgba(255,255,255,0.7)", opacity: itemOpacity }}
              >
                {item.label}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex h-10 items-center gap-2 rounded-md px-4 font-bold"
            style={{ background: colors.brand.gold, color: "#102018" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#102018" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" />
            </svg>
            <span style={{ fontSize: 14 }}>Profile Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeasonBadge: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [CONTENT_START, CONTENT_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CONTENT_START, CONTENT_START + 15], [12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sparkleRotate = interpolate(frame, [0, TOTAL], [0, 360], { easing: Easing.linear, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5"
      style={{
        opacity,
        translate: `0 ${translateY}px`,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ rotate: `${sparkleRotate}deg` }}>
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
      </svg>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#a7f3d0" }}>Current Season</span>
    </div>
  );
};

const Headline: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [CONTENT_START + 5, CONTENT_START + 25], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CONTENT_START + 5, CONTENT_START + 25], [16, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <h1
      style={{
        opacity,
        translate: `0 ${translateY}px`,
        fontFamily: typography.display.fontFamily,
        fontSize: 64,
        fontWeight: 900,
        lineHeight: 0.95,
        color: "white",
        maxWidth: 820,
        letterSpacing: "0.01em",
      }}
    >
      Football league management<br />with a live matchday pulse.
    </h1>
  );
};

const Subtitle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [CONTENT_START + 12, CONTENT_START + 30], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CONTENT_START + 12, CONTENT_START + 30], [12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <p
      style={{
        opacity,
        translate: `0 ${translateY}px`,
        fontSize: 20,
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.78)",
        maxWidth: 600,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 400,
      }}
    >
      Explore clubs, fixtures, tables, results, and top performers from one polished public home for the season.
    </p>
  );
};

const CTAButtons: React.FC<{ frame: number; isHovered: boolean }> = ({ frame, isHovered }) => {
  const opacity = interpolate(frame, [CONTENT_START + 18, CONTENT_START + 35], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CONTENT_START + 18, CONTENT_START + 35], [16, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const primaryGlow = interpolate(frame, [GLOW_START, GLOW_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hoverGlow = isHovered ? 1 : interpolate(frame, [GLOW_START, GLOW_END], [0, 0.6], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buttonGlow = Math.max(hoverGlow, primaryGlow * 0.4);

  const clickScale = interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 4], [1, 0.95], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickRestore = interpolate(frame, [CLICK_FRAME + 4, CLICK_FRAME + 10], [0.95, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buttonScale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 4 ? clickScale : frame >= CLICK_FRAME + 4 ? clickRestore : 1;

  const arrowRight = interpolate(frame, [CLICK_FRAME + 8, CLICK_FRAME + 18], [0, 6], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="flex gap-3"
      style={{ opacity, translate: `0 ${translateY}px` }}
    >
      <div
        className="flex h-12 items-center gap-2 rounded-md px-5 font-bold"
        style={{
          background: colors.brand.green,
          color: "#06110d",
          scale: `${buttonScale}`,
          boxShadow: buttonGlow > 0
            ? `0 0 ${12 + buttonGlow * 20}px rgba(38, 194, 103, ${0.2 + buttonGlow * 0.3}), inset 0 0 ${buttonGlow * 8}px rgba(255,255,255,0.1)`
            : "none",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700 }}>Explore League</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ translate: `${arrowRight}px 0` }}>
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      </div>
      <div
        className="flex h-12 items-center gap-2 rounded-md px-5 font-bold"
        style={{
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(255,255,255,0.1)",
          color: "white",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" />
        </svg>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Profile Dashboard</span>
      </div>
    </div>
  );
};

const MetricTiles: React.FC<{ frame: number }> = ({ frame }) => {
  const totalOpacity = interpolate(frame, [TILES_START, TILES_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ICONS = [
    <svg key="shield" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    <svg key="users" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    <svg key="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    <svg key="goal" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
  ];

  return (
    <div
      className="grid"
      style={{
        opacity: totalOpacity,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginTop: 40,
      }}
    >
      {METRICS.map((metric, i) => {
        const cardOpacity = interpolate(frame, [TILES_START + i * 6, TILES_END + i * 6], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const cardTranslateY = interpolate(frame, [TILES_START + i * 6, TILES_END + i * 6], [16, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const floatY = interpolate(frame, [TILES_END + i * 10, TOTAL], [0, -1.5 + seededRandom(i * 999) * 3], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div
            key={metric.label}
            className="rounded-md p-4"
            style={{
              opacity: cardOpacity,
              translate: `0 ${cardTranslateY + floatY}px`,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{metric.label}</span>
              {ICONS[i]}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: "white", fontFamily: typography.display.fontFamily }}>
              {metric.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MouseCursor: React.FC<{ frame: number }> = ({ frame }) => {
  const appearOpacity = interpolate(frame, [MOUSE_START, MOUSE_START + 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [CLICK_FRAME + 20, CLICK_FRAME + 40], [1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const moveProgress = interpolate(
    frame,
    [MOUSE_START, CLICK_FRAME],
    [0, 1],
    { easing: Easing.bezier(0.45, 0, 0.55, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const startX = 1280;
  const startY = 360;
  const endX = 220;
  const endY = 400;

  const cx = interpolate(moveProgress, [0, 1], [startX, endX]);
  const cy = interpolate(moveProgress, [0, 1], [startY, endY]);

  const clickScale = interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 3], [1, 0.85], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickRestore = interpolate(frame, [CLICK_FRAME + 3, CLICK_FRAME + 8], [0.85, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 3 ? clickScale : frame >= CLICK_FRAME + 3 ? clickRestore : 1;

  const opacity = appearOpacity * fadeOut;

  return (
    <div
      className="absolute"
      style={{
        left: cx,
        top: cy,
        opacity,
        scale: `${scale}`,
        pointerEvents: "none",
        zIndex: 100,
        translate: "-50% -50%",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      </svg>
    </div>
  );
};

const KineticLine: React.FC<{
  text: string;
  start: number;
  end: number;
  currentFrame: number;
}> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;

  const opacity = interpolate(localFrame, [0, duration * 0.35, duration * 0.6, duration], [0, 1, 1, 0], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration * 0.35], [20, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        translate: `0 ${translateY}px`,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: typography.display.fontFamily,
          fontSize: 36,
          fontWeight: 700,
          color: "white",
          textAlign: "center",
          lineHeight: 1.3,
          textShadow: "0 0 30px rgba(38, 194, 103, 0.15), 0 0 60px rgba(38, 194, 103, 0.05)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const KineticTypography: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = KINETIC_TIMING.some((t) => frame >= t.start && frame < t.end + 10);
  if (!anyVisible) return null;

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{
        top: "40%",
        height: "auto",
        zIndex: 50,
      }}
    >
      <div
        className="flex flex-col items-center rounded-2xl px-10 py-8"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {KINETIC_LINES.map((line, i) => (
          <KineticLine
            key={line}
            text={line}
            start={KINETIC_TIMING[i].start}
            end={KINETIC_TIMING[i].end}
            currentFrame={frame}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const RippleEffect: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < CLICK_FRAME || frame > CLICK_FRAME + 40) return null;

  const localFrame = frame - CLICK_FRAME;
  const opacity = interpolate(localFrame, [0, 10, 40], [0.6, 0.4, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(localFrame, [0, 40], [0.5, 3], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="absolute rounded-full"
      style={{
        top: 400,
        left: 220,
        width: 40,
        height: 40,
        translate: "-50% -50%",
        background: `radial-gradient(circle, rgba(38, 194, 103, ${opacity * 0.5}) 0%, transparent 60%)`,
        scale: `${scale}`,
        opacity,
        pointerEvents: "none",
        zIndex: 99,
      }}
    />
  );
};

const ZoomTransition: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < BUTTON_ZOOM_START) return null;

  const progress = interpolate(frame, [BUTTON_ZOOM_START, TOTAL], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const clipProgress = interpolate(progress, [0, 0.5], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const darkProgress = interpolate(progress, [0.5, 1], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cx = interpolate(clipProgress, [0, 1], [640, 220]);
  const cy = interpolate(clipProgress, [0, 1], [360, 400]);
  const clipSize = interpolate(clipProgress, [0, 1], [1920, 40]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 200 }}>
      <div
        className="absolute inset-0"
        style={{
          clipPath: `circle(${clipSize}px at ${cx}px ${cy}px)`,
          background: "rgba(7, 19, 15, 1)",
          opacity: 1,
        }}
      />
      <AbsoluteFill
        style={{
          background: "rgba(0,0,0,1)",
          opacity: darkProgress,
        }}
      />
    </AbsoluteFill>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraScale = interpolate(frame, [CONTENT_START, TOTAL], [1, 1.08], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panX = interpolate(frame, [0, TOTAL], [0, 3], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, TOTAL], [0, -2], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const contentOpacity = interpolate(frame, [REVEAL_START, REVEAL_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const isButtonHovered = frame >= CLICK_FRAME - 8 && frame < CLICK_FRAME + 30;

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          scale: `${cameraScale}`,
          translate: `${panX}px ${panY}px`,
          opacity: contentOpacity,
          willChange: "scale, translate, opacity",
        }}
      >
        <PageBackground frame={frame} />

        <HeaderBar frame={frame} />

        <div
          className="relative mx-auto flex w-full flex-1 flex-col justify-center"
          style={{
            maxWidth: 1200,
            padding: "80px 24px 24px",
          }}
        >
          <SeasonBadge frame={frame} />
          <Headline frame={frame} />
          <Subtitle frame={frame} />
          <CTAButtons frame={frame} isHovered={isButtonHovered} />
          <MetricTiles frame={frame} />
        </div>
      </div>

      <KineticTypography frame={frame} />
      <MouseCursor frame={frame} />
      <RippleEffect frame={frame} />
      <ZoomTransition frame={frame} />

      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "30%",
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
          opacity: interpolate(frame, [TOTAL - 40, TOTAL], [0, 0.6], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
