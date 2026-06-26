import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";
import { Scene8 } from "./scenes/Scene8";
import { Scene9 } from "./scenes/Scene9";
import { easing } from "./design-tokens";

// ── Configuration ──────────────────────────────────────────────────────

const CAPTION_DURATION = 100;
const FADE_DURATION = 20;
const ENDING_DURATION = 200;

// ── Voiceover audio mapping ────────────────────────────────────────────



// ── Flat timeline ──────────────────────────────────────────────────────

interface SceneEntry {
  kind: "scene";
  component: React.FC;
  duration: number;
}

interface CaptionEntry {
  kind: "caption";
  text: string;
  duration: number;
}

interface EndingEntry {
  kind: "ending";
  duration: number;
}

type Entry = SceneEntry | CaptionEntry | EndingEntry;

const SCENE_DEFS: { component: React.FC; duration: number; caption?: string; narration?: string }[] = [
  { component: Scene1, duration: 240, caption: "Professional League Management" },
  { component: Scene2, duration: 360 },
  { component: Scene3, duration: 360 },
  { component: Scene4, duration: 240, caption: "Organize Every Competition" },
  { component: Scene5, duration: 480, caption: "Manage Every Team" },
  { component: Scene6, duration: 510, caption: "Generate Fixtures Automatically" },
  { component: Scene7, duration: 540, caption: "Power Every Match" },
  { component: Scene8, duration: 540, caption: "Turn Data Into Insights" },
  { component: Scene9, duration: 540, caption: "Live. Every Moment. Every Match." },
];

function buildTimeline(defs: typeof SCENE_DEFS): { entries: Entry[]; totalDuration: number } {
  const entries: Entry[] = [];

  defs.forEach((d) => {
    entries.push({ kind: "scene", component: d.component, duration: d.duration });
    if (d.caption) {
      entries.push({ kind: "caption", text: d.caption, duration: CAPTION_DURATION });
    }
  });

  entries.push({ kind: "ending", duration: ENDING_DURATION });

  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
  return { entries, totalDuration };
}

const { entries: ENTRIES, totalDuration: TOTAL_DURATION } = buildTimeline(SCENE_DEFS);

const STARTS: number[] = [];
let running = 0;
ENTRIES.forEach((e) => {
  STARTS.push(running);
  running += e.duration;
});

export const LAUNCH_FILM_DURATION = TOTAL_DURATION;

// ── Easing ─────────────────────────────────────────────────────────────

const cinematic = Easing.bezier(0.16, 1, 0.3, 1);
const fadeEase = Easing.bezier(0.45, 0, 0.55, 1);

// ── Fade Overlays ──────────────────────────────────────────────────────

const FadeToBlack: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, FADE_DURATION], [0, 1], {
    easing: fadeEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: "#07130f", opacity, pointerEvents: "none" }} />;
};

const FadeFromBlack: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, FADE_DURATION], [1, 0], {
    easing: fadeEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: "#07130f", opacity, pointerEvents: "none" }} />;
};

// ── Light Sweep ─────────────────────────────────────────────────────────

const LightSweep: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [0, CAPTION_DURATION], [0, 1], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(progress, [0, 1], [-120, 220], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const opacity = interpolate(frame, [0, 12, CAPTION_DURATION - 12, CAPTION_DURATION], [0, 0.12, 0.12, 0], {
    easing: fadeEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: 0,
          width: "25%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.08), transparent)",
          transform: "skewX(-20deg)",
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Caption ────────────────────────────────────────────────────────────

const CaptionScene: React.FC<{ text: string; frame: number }> = ({ text, frame }) => {
  const opacity = interpolate(frame, [0, 15, CAPTION_DURATION - 15, CAPTION_DURATION], [0, 1, 1, 0], {
    easing: cinematic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 15], [14, 0], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 15], [0.97, 1], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#07130f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LightSweep frame={frame} />
      <div
        style={{
          opacity,
          translate: `0 ${translateY}px`,
          scale: `${scale}`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 300,
            color: "white",
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: "0.06em",
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Ending ─────────────────────────────────────────────────────────────

const Ending: React.FC<{ frame: number }> = ({ frame }) => {
  const logoOpacity = interpolate(frame, [0, 40, 140, 175], [0, 1, 1, 0], {
    easing: cinematic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagline1Opacity = interpolate(frame, [25, 50], [0, 1], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagline2Opacity = interpolate(frame, [40, 65], [0, 1], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowOpacity = interpolate(frame, [0, 40, 140, 175], [0, 0.25, 0.25, 0], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vignetteOpacity = interpolate(frame, [170, 200], [0, 1], {
    easing: fadeEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const particles = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 15 + ((i * 7) % 35);
      const delay = (i * 2) / 24;
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        delay,
        size: 1 + (i % 3),
      };
    });
  }, []);

  return (
    <AbsoluteFill style={{ background: "#07130f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(38, 194, 103, 0.08), transparent 70%)",
          opacity: glowOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "40%",
          height: "40%",
          background: "radial-gradient(ellipse at center, rgba(96, 165, 250, 0.06), transparent 70%)",
          opacity: glowOpacity,
        }}
      />

      {particles.map((p, i) => {
        const pOpacity = interpolate(frame, [0, 30 + p.delay * 40, 140, 175], [0, 0.5, 0.3, 0], {
          easing: easing.smooth,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "rgba(96, 165, 250, 0.5)",
              opacity: pOpacity,
            }}
          />
        );
      })}

      <div
        style={{
          opacity: logoOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Img
          src={staticFile("kickoff-logo-wordmark.png")}
          style={{ height: 44, filter: "brightness(1.1)" }}
        />
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.2em",
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            opacity: tagline1Opacity,
          }}
        >
          PROFESSIONAL LEAGUE MANAGEMENT SYSTEM
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.12em",
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            opacity: tagline2Opacity,
          }}
        >
          Built for Modern Football
        </div>
      </div>

      <AbsoluteFill style={{ background: "#07130f", opacity: vignetteOpacity, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// ── Segment Renderer ───────────────────────────────────────────────────

const SceneRenderer: React.FC<{
  entry: SceneEntry;
  start: number;
  globalFrame: number;
}> = ({ entry, start, globalFrame }) => {
  const localFrame = globalFrame - start;
  const inScene = localFrame >= 0 && localFrame < entry.duration;
  if (!inScene) return null;

  const SceneComponent = entry.component;
  const end = start + entry.duration;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Sequence from={start} durationInFrames={entry.duration}>
        <SceneComponent />
      </Sequence>
      {globalFrame >= end - FADE_DURATION && (
        <FadeToBlack frame={globalFrame - (end - FADE_DURATION)} />
      )}
      {globalFrame < start + FADE_DURATION && (
        <FadeFromBlack frame={localFrame} />
      )}
    </div>
  );
};

// ── Background Music ─────────────────────────────────────────────────

const BGM: React.FC = () => <Audio src={staticFile("soundtrack.wav")} volume={0.20} />;

// ── Launch Film ─────────────────────────────────────────────────────────

export const LaunchFilm: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#07130f", overflow: "hidden" }}>
      {ENTRIES.map((entry, i) => {
        const start = STARTS[i];

        if (entry.kind === "scene") {
          return (
            <SceneRenderer
              key={`seg-${i}`}
              entry={entry}
              start={start}

              globalFrame={frame}
            />
          );
        }

        if (entry.kind === "caption") {
          const localFrame = frame - start;
          if (localFrame < 0 || localFrame >= entry.duration) return null;
          return (
            <CaptionScene key={`seg-${i}`} text={entry.text} frame={localFrame} />
          );
        }

        if (entry.kind === "ending") {
          const localFrame = frame - start;
          if (localFrame < 0 || localFrame >= entry.duration) return null;
          return <Ending key={`seg-${i}`} frame={localFrame} />;
        }

        return null;
      })}

      <BGM />
    </AbsoluteFill>
  );
};
