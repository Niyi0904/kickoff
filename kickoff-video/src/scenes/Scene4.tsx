import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing } from "../design-tokens";

const TOTAL = 240;
const FLASH_START = 0;
const FLASH_END = 20;
const STREAM_START = 8;
const STREAM_END = 75;
const NETWORK_START = 55;
const NETWORK_FORM_END = 120;
const GEO_START = 80;
const LINE1_START = 115;
const LINE1_END = 135;
const LINE2_START = 140;
const LINE2_END = 160;
const LINE3_START = 165;
const LINE3_END = 185;
const CONVERGE_START = 200;

const TYPO_LINES = [
  { text: "Every competition begins with structure.", start: LINE1_START, end: LINE1_END },
  { text: "Every match begins with organization.", start: LINE2_START, end: LINE2_END },
  { text: "Every league deserves a better system.", start: LINE3_START, end: LINE3_END },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  level: number;
  connections: number[];
}

interface Connection {
  from: number;
  to: number;
}

interface ParticleStream {
  x: number;
  y: number;
  z: number;
  delay: number;
  speed: number;
  size: number;
  driftX: number;
  driftY: number;
}

const NODES: NetworkNode[] = [
  { id: "l1", label: "Premier League", x: 30, y: 35, z: 60, level: 0, connections: [3, 4] },
  { id: "l2", label: "Championship", x: 50, y: 30, z: 65, level: 0, connections: [4, 5] },
  { id: "l3", label: "League One", x: 70, y: 35, z: 60, level: 0, connections: [5, 6] },
  { id: "t1", label: "Arsenal", x: 20, y: 45, z: 45, level: 1, connections: [7, 8] },
  { id: "t2", label: "Chelsea", x: 35, y: 42, z: 48, level: 1, connections: [8, 9] },
  { id: "t3", label: "Liverpool", x: 50, y: 40, z: 50, level: 1, connections: [9, 10] },
  { id: "t4", label: "Man City", x: 65, y: 42, z: 48, level: 1, connections: [10, 11] },
  { id: "f1", label: "MD 1", x: 15, y: 55, z: 35, level: 2, connections: [12] },
  { id: "f2", label: "MD 2", x: 33, y: 52, z: 38, level: 2, connections: [12] },
  { id: "f3", label: "MD 3", x: 50, y: 50, z: 40, level: 2, connections: [13] },
  { id: "f4", label: "MD 4", x: 67, y: 52, z: 38, level: 2, connections: [13] },
  { id: "f5", label: "MD 5", x: 85, y: 55, z: 35, level: 2, connections: [14] },
  { id: "m1", label: "Match 1", x: 25, y: 62, z: 25, level: 3, connections: [15] },
  { id: "m2", label: "Match 2", x: 50, y: 60, z: 28, level: 3, connections: [15] },
  { id: "m3", label: "Match 3", x: 75, y: 62, z: 25, level: 3, connections: [15] },
  { id: "s1", label: "Statistics", x: 50, y: 72, z: 15, level: 4, connections: [] },
];

const CONNECTIONS: Connection[] = NODES.flatMap((node) =>
  node.connections.map((to) => ({ from: NODES.indexOf(node), to })),
);

const STREAM_COUNT = 180;
const ACCENT_COUNT = 30;

function makeParticles(count: number, seedOffset: number, maxDelay: number, maxSize: number, minSize: number, maxDrift: number, speedBase: number): ParticleStream[] {
  return Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 100 + 1 + seedOffset) * 100,
    y: seededRandom(i * 100 + 2 + seedOffset) * 100,
    z: seededRandom(i * 100 + 3 + seedOffset) * 80 + 10,
    delay: seededRandom(i * 100 + 4 + seedOffset) * maxDelay,
    speed: seededRandom(i * 100 + 5 + seedOffset) * 0.6 + speedBase,
    size: seededRandom(i * 100 + 6 + seedOffset) * (maxSize - minSize) + minSize,
    driftX: (seededRandom(i * 100 + 7 + seedOffset) - 0.5) * maxDrift,
    driftY: (seededRandom(i * 100 + 8 + seedOffset) - 0.5) * maxDrift,
  }));
}

const particleStreams = makeParticles(STREAM_COUNT, 0, 40, 2.5, 0.5, 40, 0.3);
const accentParticles = makeParticles(ACCENT_COUNT, 1000, 30, 5, 2, 30, 0.2);

const BackgroundGradient: React.FC<{ phase: number }> = ({ phase }) => {
  const baseColor = interpolate(phase, [0, 0.3, 0.7, 1], [0, 0.2, 0.4, 0.3], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 100% 100% at 50% 45%,
              rgba(8, 15, 30, 1) 0%,
              rgba(4, 8, 18, 1) 60%,
              rgba(0, 0, 0, 1) 100%
            )
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 50% 50% at 50% 45%,
              rgba(40, 100, 200, ${0.04 + baseColor * 0.06}) 0%,
              transparent 60%
            )
          `,
        }}
      />
    </AbsoluteFill>
  );
};

const FlashTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const flash = interpolate(frame, [FLASH_START, FLASH_START + 5, FLASH_END], [0, 1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const whiteOut = interpolate(frame, [FLASH_START + 3, FLASH_START + 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const whiteFade = interpolate(frame, [FLASH_START + 8, FLASH_START + 18], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const compositeWhite = Math.max(flash, whiteOut * whiteFade);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 200 }}>
      <AbsoluteFill style={{ background: `rgba(60, 140, 255, ${compositeWhite * 0.3})` }} />
      <AbsoluteFill style={{ background: `rgba(255, 255, 255, ${whiteFade * 0.15})` }} />
    </AbsoluteFill>
  );
};

const ParticleLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const streamOpacity = interpolate(frame, [STREAM_START, STREAM_START + 15, STREAM_END, STREAM_END + 20], [0, 1, 1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const forwardProgress = interpolate(frame, [STREAM_START, STREAM_START + 60], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cameraPush = interpolate(forwardProgress, [0, 0.5, 1], [0, -200, -600]);

  return (
    <AbsoluteFill style={{ opacity: streamOpacity, pointerEvents: "none" }}>
      {particleStreams.map((p, i) => {
        const localFrame = Math.max(0, frame - p.delay - STREAM_START);
        const progress = (localFrame / 60) * p.speed;
        if (progress > 1) return null;
        if (progress < 0) return null;

        const opacity = interpolate(progress, [0, 0.1, 0.8, 1], [0, 0.7, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        const xPos = interpolate(progress, [0, 1], [p.x, p.x + p.driftX]);
        const yPos = interpolate(progress, [0, 1], [p.y, p.y + p.driftY]);
        const zPos = p.z + progress * 80 + cameraPush * (1 - p.z / 100);

        const scale = interpolate(zPos, [0, 100], [2.5, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              width: p.size,
              height: p.size,
              scale: `${scale}`,
              background: `radial-gradient(circle, rgba(100, 180, 255, ${opacity * 0.8}), rgba(60, 140, 255, ${opacity * 0.2}))`,
              boxShadow: `0 0 ${p.size * 4}px rgba(60, 140, 255, ${opacity * 0.3})`,
              opacity,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {accentParticles.map((p, i) => {
        const localFrame = Math.max(0, frame - p.delay - STREAM_START - 10);
        const progress = (localFrame / 80) * p.speed;
        if (progress > 1 || progress < 0) return null;

        const opacity = interpolate(progress, [0, 0.1, 0.7, 1], [0, 1, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        const xPos = interpolate(progress, [0, 1], [p.x, p.x + p.driftX]);
        const yPos = interpolate(progress, [0, 1], [p.y, p.y + p.driftY]);
        const zPos = p.z + progress * 60;
        const scale = interpolate(zPos, [0, 100], [3, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div
            key={`accent-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              width: p.size,
              height: p.size,
              scale: `${scale}`,
              background: `radial-gradient(circle, rgba(180, 220, 255, ${opacity}), rgba(60, 140, 255, ${opacity * 0.3}))`,
              boxShadow: `0 0 ${p.size * 8}px rgba(60, 140, 255, ${opacity * 0.5}), 0 0 ${p.size * 16}px rgba(60, 140, 255, ${opacity * 0.2})`,
              opacity,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ConnectionLine: React.FC<{
  from: NetworkNode;
  to: NetworkNode;
  appearProgress: number;
  glowIntensity: number;
}> = ({ from, to, appearProgress, glowIntensity }) => {
  const drawProgress = interpolate(appearProgress, [0, 1], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const x1 = from.x;
  const y1 = from.y + from.z * 0.05;
  const x2 = to.x;
  const y2 = to.y + to.z * 0.05;

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  const opacity = drawProgress * (0.2 + glowIntensity * 0.3);

  return (
    <div
      className="absolute"
      style={{
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${length * drawProgress}%`,
        height: 1.5,
        rotate: `${angle}deg`,
        transformOrigin: "0 50%",
        opacity,
        background: `linear-gradient(90deg, rgba(60, 140, 255, ${0.2 + glowIntensity * 0.3}), rgba(100, 180, 255, ${0.3 + glowIntensity * 0.3}))`,
        filter: glowIntensity > 0.5 ? `blur(${(glowIntensity - 0.5) * 2}px)` : "none",
        boxShadow: glowIntensity > 0.5 ? `0 0 ${glowIntensity * 6}px rgba(60, 140, 255, ${glowIntensity * 0.2})` : "none",
        pointerEvents: "none",
        willChange: "transform, opacity",
      }}
    />
  );
};

const NetworkNodeElement: React.FC<{
  node: NetworkNode;
  appearProgress: number;
  glowIntensity: number;
  isHighlighted: boolean;
}> = ({ node, appearProgress, glowIntensity, isHighlighted }) => {
  const opacity = interpolate(appearProgress, [0, 1], [0, 1], { easing: easing.crisp });
  const scale = interpolate(appearProgress, [0, 1], [0.5, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });

  const zOffset = node.z * 0.03;
  const glowOpacity = glowIntensity * 0.6 + (isHighlighted ? 0.4 : 0);
  const pulseSize = isHighlighted ? 8 : 4;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${node.x}%`,
        top: `${node.y + zOffset}%`,
        translate: "-50% -50%",
        opacity: opacity * (0.5 + glowIntensity * 0.5),
        scale: `${scale * (1 - node.z / 200)}`,
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          width: 6 + glowIntensity * 4,
          height: 6 + glowIntensity * 4,
          borderRadius: "50%",
          background: isHighlighted
            ? "radial-gradient(circle, rgba(180, 220, 255, 0.9), rgba(60, 140, 255, 0.5))"
            : "radial-gradient(circle, rgba(100, 180, 255, 0.6), rgba(60, 140, 255, 0.2))",
          boxShadow: `0 0 ${pulseSize + glowOpacity * 10}px rgba(60, 140, 255, ${0.3 + glowOpacity * 0.4})`,
        }}
      />
      <span
        style={{
          fontSize: 6 + glowIntensity,
          fontWeight: 600,
          color: isHighlighted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
          marginTop: 4,
          whiteSpace: "nowrap",
          opacity: 0.7 + glowIntensity * 0.3,
          letterSpacing: "0.05em",
        }}
      >
        {node.label}
      </span>
    </div>
  );
};

const NetworkLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const networkAppear = interpolate(frame, [NETWORK_START, NETWORK_FORM_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const networkGlow = interpolate(frame, [NETWORK_FORM_END - 20, NETWORK_FORM_END + 30, CONVERGE_START], [0, 0.6, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const convergeProgress = frame >= CONVERGE_START ? interpolate(frame, [CONVERGE_START, TOTAL], [0, 1], { easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const highlightIndex = frame >= 140 ? Math.min(Math.floor((frame - 140) / 30), NODES.length - 1) : -1;

  const xMid = NODES.reduce((s, n) => s + n.x, 0) / NODES.length;
  const yMid = NODES.reduce((s, n) => s + n.y, 0) / NODES.length;

  const convergeScale = interpolate(convergeProgress, [0, 1], [1, 0.01], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const convergeOpacity = interpolate(convergeProgress, [0, 0.6], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: convergeOpacity,
        scale: `${convergeScale}`,
        transformOrigin: `${xMid}% ${yMid}%`,
        pointerEvents: "none",
      }}
    >
      {CONNECTIONS.map((conn, i) => {
        const connAppear = interpolate(frame, [NETWORK_START + i * 2, NETWORK_START + i * 2 + 30], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <ConnectionLine
            key={`conn-${i}`}
            from={NODES[conn.from]}
            to={NODES[conn.to]}
            appearProgress={connAppear * networkAppear}
            glowIntensity={networkGlow}
          />
        );
      })}

      {NODES.map((node, i) => {
        const nodeAppear = interpolate(frame, [NETWORK_START + 10 + i * 3, NETWORK_START + 30 + i * 3], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <NetworkNodeElement
            key={node.id}
            node={node}
            appearProgress={nodeAppear * networkAppear}
            glowIntensity={networkGlow}
            isHighlighted={highlightIndex === i}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const PitchGrid: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < GEO_START) return null;

  const appear = interpolate(frame, [GEO_START, GEO_START + 30], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [CONVERGE_START, TOTAL], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rotateX = interpolate(frame, [GEO_START, GEO_START + 40], [10, 5], { easing: easing.smooth, extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: appear * fadeOut, pointerEvents: "none" }}>
      <svg
        viewBox="0 0 1280 720"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <g style={{ transform: `perspective(800px) rotateX(${rotateX}deg)` }}>
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1={180}
              y1={60 + i * 75}
              x2={1100}
              y2={60 + i * 75}
              stroke="rgba(60, 140, 255, 0.04)"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={180 + i * 153}
              y1={60}
              x2={180 + i * 153}
              y2={660}
              stroke="rgba(60, 140, 255, 0.04)"
              strokeWidth="0.5"
            />
          ))}
          <rect
            x={220}
            y={90}
            width={840}
            height={540}
            fill="none"
            stroke="rgba(60, 140, 255, 0.04)"
            strokeWidth="0.5"
            rx={4}
          />
          <line x1={640} y1={90} x2={640} y2={630} stroke="rgba(60, 140, 255, 0.04)" strokeWidth="0.5" />
          <circle cx={640} cy={360} r={60} fill="none" stroke="rgba(60, 140, 255, 0.03)" strokeWidth="0.5" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const TacticalLines: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < GEO_START + 15) return null;

  const appear = interpolate(frame, [GEO_START + 15, GEO_START + 45], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [CONVERGE_START, TOTAL], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: appear * fadeOut, pointerEvents: "none" }}>
      <svg viewBox="0 0 1280 720" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        {[
          { x1: 200, y1: 600, x2: 350, y2: 400, cx: 250, cy: 550 },
          { x1: 400, y1: 580, x2: 550, y2: 350, cx: 500, cy: 500 },
          { x1: 600, y1: 590, x2: 750, y2: 380, cx: 700, cy: 520 },
          { x1: 800, y1: 600, x2: 950, y2: 400, cx: 880, cy: 550 },
          { x1: 300, y1: 300, x2: 500, y2: 200, cx: 380, cy: 240 },
          { x1: 600, y1: 280, x2: 850, y2: 200, cx: 720, cy: 220 },
        ].map((arc, i) => (
          <path
            key={i}
            d={`M ${arc.x1} ${arc.y1} Q ${arc.cx} ${arc.cy} ${arc.x2} ${arc.y2}`}
            fill="none"
            stroke="rgba(60, 140, 255, 0.04)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const CompetitionBracket: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < GEO_START + 25) return null;

  const appear = interpolate(frame, [GEO_START + 25, GEO_START + 55], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [CONVERGE_START, TOTAL], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: appear * fadeOut * 0.6, pointerEvents: "none" }}>
      <svg viewBox="0 0 400 300" style={{ position: "absolute", left: "5%", top: "10%", width: "30%" }}>
        {[
          { y1: 20, y2: 50, mid: 100 },
          { y1: 20, y2: 50, mid: 200 },
          { y1: 80, y2: 110, mid: 100 },
          { y1: 80, y2: 110, mid: 200 },
          { y1: 140, y2: 170, mid: 150 },
        ].map((b, i) => (
          <g key={i}>
            <line x1={b.mid - 20} y1={b.y1} x2={b.mid} y2={b.y1} stroke="rgba(60, 140, 255, 0.06)" strokeWidth="0.5" />
            <line x1={b.mid} y1={b.y1} x2={b.mid} y2={b.y2} stroke="rgba(60, 140, 255, 0.06)" strokeWidth="0.5" />
            <line x1={b.mid} y1={b.y2} x2={b.mid + 20} y2={b.y2} stroke="rgba(60, 140, 255, 0.06)" strokeWidth="0.5" />
          </g>
        ))}
        <line x1={100} y1={50} x2={200} y2={50} stroke="rgba(60, 140, 255, 0.06)" strokeWidth="0.5" />
        <line x1={100} y1={110} x2={200} y2={110} stroke="rgba(60, 140, 255, 0.06)" strokeWidth="0.5" />
        <line x1={150} y1={170} x2={150} y2={130} stroke="rgba(60, 140, 255, 0.06)" strokeWidth="0.5" />
      </svg>
    </AbsoluteFill>
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
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, duration * 0.35, duration * 0.6, duration], [0, 1, 1, 0], {
    easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration * 0.35], [18, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, translate: `0 ${translateY}px`, display: "flex", justifyContent: "center" }}>
      <span
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 28,
          fontWeight: 400,
          color: "white",
          textAlign: "center",
          lineHeight: 1.4,
          letterSpacing: "0.02em",
          textShadow: "0 0 30px rgba(60, 140, 255, 0.1)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const TypographyLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = TYPO_LINES.some((l) => frame >= l.start && frame < l.end + 15);
  if (!anyVisible) return null;

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{ top: "44%", height: "auto", zIndex: 50 }}
    >
      <div
        className="flex flex-col items-center rounded-2xl px-10 py-6"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {TYPO_LINES.map((line) => (
          <KineticLine
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

const ConvergePoint: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < CONVERGE_START) return null;

  const progress = interpolate(frame, [CONVERGE_START, TOTAL], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const glowOpacity = interpolate(progress, [0, 0.3, 0.6], [0, 1, 0.8], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const expandScale = interpolate(progress, [0.4, 1], [0.5, 15], { easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lightOpacity = interpolate(progress, [0.3, 0.7, 1], [0, 0.6, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 150 }}>
      <div
        className="absolute rounded-full"
        style={{
          top: "45%",
          left: "50%",
          width: 20,
          height: 20,
          translate: "-50% -50%",
          background: "radial-gradient(circle, rgba(180, 220, 255, 0.8), rgba(60, 140, 255, 0.4))",
          scale: `${expandScale}`,
          opacity: glowOpacity,
          filter: "blur(4px)",
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "45%",
          left: "50%",
          width: 10,
          height: 10,
          translate: "-50% -50%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(180, 220, 255, 0.4))",
          scale: `${expandScale * 0.5}`,
          opacity: glowOpacity,
          filter: "blur(8px)",
          willChange: "transform, opacity",
        }}
      />
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(
              ellipse at 50% 45%,
              rgba(60, 140, 255, ${lightOpacity * 0.08}) 0%,
              transparent 60%
            )
          `,
        }}
      />
    </AbsoluteFill>
  );
};

const DepthOfField: React.FC<{ frame: number }> = ({ frame }) => {
  const blur = interpolate(
    frame,
    [STREAM_START, STREAM_START + 30, NETWORK_START, NETWORK_FORM_END, CONVERGE_START, TOTAL],
    [6, 1.5, 0.5, 0.5, 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth },
  );

  return (
    <AbsoluteFill
      style={{
        filter: `blur(${blur}px)`,
        opacity: 0.5,
        pointerEvents: "none",
      }}
    />
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  const streamProgress = interpolate(frame, [STREAM_START, STREAM_START + 60], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pushDepth = interpolate(streamProgress, [0, 0.5, 1], [0, -300, -500], { easing: Easing.bezier(0.22, 1, 0.36, 1) });

  const networkPanX = interpolate(frame, [NETWORK_START + 40, NETWORK_FORM_END + 40], [0, 2], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const networkPanY = interpolate(frame, [NETWORK_START + 40, NETWORK_FORM_END + 40], [0, -1], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const orbitRotate = interpolate(frame, [NETWORK_FORM_END, CONVERGE_START], [0, 1.5], { easing: easing.smooth, extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <BackgroundGradient phase={interpolate(frame, [0, TOTAL], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp" })} />

      <div
        className="absolute inset-0"
        style={{
          scale: `${1 + pushDepth / 2000}`,
          translate: `${networkPanX}px ${networkPanY}px`,
          rotate: `${orbitRotate}deg`,
          willChange: "transform",
        }}
      >
        <NetworkLayer frame={frame} />
        <PitchGrid frame={frame} />
        <TacticalLines frame={frame} />
        <CompetitionBracket frame={frame} />
      </div>

      <ParticleLayer frame={frame} />
      <FlashTransition frame={frame} />
      <TypographyLayer frame={frame} />
      <ConvergePoint frame={frame} />
      <DepthOfField frame={frame} />
    </AbsoluteFill>
  );
};
