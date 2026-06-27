import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  colors,
  easing,
  typography,
} from "../design-tokens";

const AMBIENT_START = 15;
const AMBIENT_END = 30;
const PARTICLE_START = 30;
const LOGO_START = 48;
const LOGO_END = 78;
const LINE1_START = 85;
const LINE1_END = 105;
const LINE2_START = 110;
const LINE2_END = 130;
const LINE3_START = 135;
const LINE3_END = 155;
const LINE4_START = 160;
const LINE4_END = 175;
const LINE5_START = 180;
const LINE5_END = 195;
const OUTRO_START = 205;
const PULSE_START = 215;
const TRANSITION_END = 240;

const LINES = [
  { text: "Professional League Management", start: LINE1_START, end: LINE1_END },
  { text: "Built for Modern Football.", start: LINE2_START, end: LINE2_END },
  { text: "Manage Every League.", start: LINE3_START, end: LINE3_END },
  { text: "Every Team.", start: LINE4_START, end: LINE4_END },
  { text: "Every Match.", start: LINE5_START, end: LINE5_END },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const AmbientGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [AMBIENT_START, AMBIENT_END], [0, 1], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [AMBIENT_START, 50], [0.4, 1.2], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cx = interpolate(frame, [0, 240], [50, 52], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        className="absolute"
        style={{
          top: "50%",
          left: `${cx}%`,
          width: "60%",
          height: "60%",
          translate: "-50% -50%",
          background: `
            radial-gradient(
              circle at center,
              rgba(60, 140, 255, ${0.12 * opacity}) 0%,
              rgba(60, 140, 255, ${0.05 * opacity}) 30%,
              transparent 70%
            )
          `,
          scale: `${scale}`,
          filter: "blur(40px)",
          willChange: "scale, filter, opacity",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "50%",
          left: `${50 + (cx - 50) * 0.5}%`,
          width: "40%",
          height: "40%",
          translate: "-50% -50%",
          background: `
            radial-gradient(
              circle at center,
              rgba(100, 180, 255, ${0.06 * opacity}) 0%,
              transparent 60%
            )
          `,
          filter: "blur(60px)",
          opacity,
          willChange: "opacity",
        }}
      />
    </AbsoluteFill>
  );
};

const Particles: React.FC<{ frame: number }> = ({ frame }) => {
  const particleOpacity = interpolate(frame, [PARTICLE_START, PARTICLE_START + 20], [0, 1], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const particles = useMemo(() => {
    const count = 30;
    return Array.from({ length: count }, (_, i) => ({
      x: seededRandom(i * 137 + 1) * 100,
      y: seededRandom(i * 137 + 2) * 100,
      size: seededRandom(i * 137 + 3) * 1.5 + 0.6,
      delay: seededRandom(i * 137 + 4) * 60,
      driftX: seededRandom(i * 137 + 5) * 60 - 30,
      driftY: seededRandom(i * 137 + 6) * 40 - 20,
      duration: seededRandom(i * 137 + 7) * 120 + 80,
      opacity: seededRandom(i * 137 + 8) * 0.3 + 0.1,
    }));
  }, []);

  return (
    <AbsoluteFill>
      {particles.map((p, i) => {
        const localFrame = Math.max(0, frame - p.delay - PARTICLE_START);
        const progress = localFrame / p.duration;
        if (progress < 0 || progress > 1) return null;

        const opacity = interpolate(
          progress,
          [0, 0.1, 0.6, 1],
          [0, p.opacity, p.opacity, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const xOffset = interpolate(progress, [0, 1], [0, p.driftX]);
        const yOffset = interpolate(progress, [0, 1], [0, p.driftY]);

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, rgba(150, 200, 255, ${opacity * 0.8}), rgba(60, 140, 255, ${opacity * 0.2}))`,
              translate: `${xOffset}px ${yOffset}px`,
              opacity: opacity * particleOpacity,
              filter: "blur(0.5px)",
              willChange: "translate, opacity",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const VolumetricLight: React.FC<{ frame: number; intensity: number }> = ({
  frame,
  intensity,
}) => {
  const opacity = interpolate(intensity, [0, 1], [0, 1], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beamX = interpolate(frame, [0, 240], [49, 53], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beamSpread = interpolate(frame, [0, 240], [28, 35], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div
        className="absolute top-0"
        style={{
          left: `${beamX}%`,
          width: `${beamSpread}%`,
          height: "100%",
          translate: "-50% 0",
          background:
            "linear-gradient(180deg, rgba(60, 140, 255, 0.04) 0%, transparent 70%)",
          filter: "blur(50px)",
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute top-0"
        style={{
          left: `${beamX + 3}%`,
          width: "18%",
          height: "100%",
          translate: "-50% 0",
          background:
            "linear-gradient(180deg, rgba(100, 180, 255, 0.025) 0%, transparent 60%)",
          filter: "blur(60px)",
          willChange: "transform, opacity",
        }}
      />
    </AbsoluteFill>
  );
};

const LightStreaks: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = Math.max(0, frame - 60) / 140;
  const opacity = interpolate(progress, [0, 0.1, 0.5, 1], [0, 0.5, 0.3, 0], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0, 1].map((i) => {
        const pos = ((progress + i * 0.35) * 1.4) % 1.4;
        const xPos = interpolate(pos, [0, 1], [-10, 110]);
        const yBase = 28 + i * 18;

        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${yBase}%`,
              left: `${xPos}%`,
              width: "220px",
              height: "1.5px",
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(100, 180, 255, ${opacity * 0.35}) 25%,
                rgba(60, 140, 255, ${opacity * 0.5}) 50%,
                rgba(100, 180, 255, ${opacity * 0.35}) 75%,
                transparent 100%
              )`,
              rotate: `${-20 + i * 8}deg`,
              opacity,
              filter: "blur(2px)",
              willChange: "translate, opacity",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const LogoLayer: React.FC<{
  frame: number;
  parallaxY: number;
}> = ({ frame, parallaxY }) => {
  const logoOpacity = interpolate(frame, [LOGO_START, LOGO_END], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [LOGO_START, LOGO_END], [0.92, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gentleFloat = interpolate(frame, [60, 150, 240], [0, -2, 0], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glareOpacity = interpolate(frame, [80, 130, 180], [0, 0.06, 0], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          opacity: logoOpacity,
          scale: `${logoScale}`,
          translate: `0 ${gentleFloat + parallaxY * 0.15}px`,
          willChange: "opacity, transform",
        }}
      >
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile("kickoff-logo-wordmark.png")}
            style={{
              height: 140,
              objectFit: "contain",
              filter: `
                drop-shadow(0 0 15px rgba(60, 140, 255, 0.08))
                drop-shadow(0 0 40px rgba(60, 140, 255, 0.04))
              `,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,${glareOpacity}) 45%, transparent 55%)`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SubtitleLine: React.FC<{
  text: string;
  start: number;
  end: number;
  currentFrame: number;
}> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;

  const opacity = interpolate(localFrame, [0, duration * 0.35, duration * 0.65, duration], [0, 1, 1, 0], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration * 0.35], [18, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      className="flex justify-center"
      style={{
        opacity,
        translate: `0 ${translateY}px`,
      }}
    >
      <span
        style={{
          ...typography.subtitle,
          fontSize: 28,
          color: "rgba(255, 255, 255, 0.88)",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const TypographyLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = LINES.some(
    (line) => frame >= line.start && frame < line.end + 10,
  );
  if (!anyVisible) return null;

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{
        top: "56%",
        height: 80,
        gap: 0,
      }}
    >
      {LINES.map((line) => (
        <SubtitleLine
          key={line.text}
          text={line.text}
          start={line.start}
          end={line.end}
          currentFrame={frame}
        />
      ))}
    </AbsoluteFill>
  );
};

const DepthOfField: React.FC<{ frame: number }> = ({ frame }) => {
  const blur = interpolate(
    frame,
    [0, 25, 60, 200, 220, 240],
    [8, 3, 0.4, 0.4, 1.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth },
  );

  return (
    <AbsoluteFill
      style={{
        filter: `blur(${blur}px)`,
        opacity: 0.55,
        pointerEvents: "none",
      }}
    />
  );
};

const DarknessOpen: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, AMBIENT_START + 5], [1, 0], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: colors.surface.black, opacity }} />
  );
};

const BluePulseTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const pulseOpacity = interpolate(
    frame,
    [PULSE_START, PULSE_START + 10, PULSE_START + 25],
    [0, 0.6, 0],
    { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const pulseScale = interpolate(
    frame,
    [PULSE_START, PULSE_START + 25],
    [0.2, 3],
    { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const expandOpacity = interpolate(
    frame,
    [OUTRO_START, TRANSITION_END],
    [0, 1],
    { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        className="absolute rounded-full"
        style={{
          top: "50%",
          left: "50%",
          width: 400,
          height: 400,
          translate: "-50% -50%",
          background: `radial-gradient(circle, rgba(60, 140, 255, ${pulseOpacity * 0.6}) 0%, transparent 60%)`,
          filter: "blur(30px)",
          scale: `${pulseScale}`,
          willChange: "scale, opacity",
        }}
      />
      <AbsoluteFill
        style={{
          background: "rgba(10, 15, 30, 1)",
          opacity: expandOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

const BackgroundGradient: React.FC<{
  frame: number;
  parallaxY: number;
}> = ({ frame, parallaxY }) => {
  const cx = interpolate(frame, [0, 240], [50, 52], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cy = interpolate(frame, [0, 240], [45, 48], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const warmTint = interpolate(frame, [0, 120, 240], [0, 0.3, 0], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse at ${cx}% ${cy + parallaxY * 0.05}%,
              rgba(8, 12, 24, 1) 0%,
              rgba(4, 8, 18, 1) 50%,
              rgba(0, 0, 0, 1) 100%
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
              ellipse at 70% 30%,
              rgba(20, 40, 80, ${0.15 * warmTint}) 0%,
              transparent 60%
            )
          `,
        }}
      />
    </AbsoluteFill>
  );
};

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraScale = interpolate(frame, [60, 240], [1, 1.06], {
    easing: easing.crisp,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const panX = interpolate(frame, [0, 240], [0, 4], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, 240], [0, -2], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const parallaxY = interpolate(frame, [0, 240], [0, -1.5], {
    easing: easing.smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const volumetricIntensity = interpolate(
    frame,
    [50, 100, 200],
    [0, 0.8, 0.4],
    { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const logoRevealGlow = interpolate(
    frame,
    [LOGO_START, LOGO_END, 140],
    [0, 1, 0.6],
    { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <div
        className="absolute inset-0"
        style={{
          scale: `${cameraScale}`,
          translate: `${panX}px ${panY}px`,
          willChange: "scale, translate",
        }}
      >
        <BackgroundGradient frame={frame} parallaxY={parallaxY} />

        <AmbientGlow frame={frame} />

        <VolumetricLight
          frame={frame}
          intensity={logoRevealGlow * volumetricIntensity}
        />

        <Particles frame={frame} />

        <LightStreaks frame={frame} />

        <LogoLayer frame={frame} parallaxY={parallaxY} />
      </div>

      <TypographyLayer frame={frame} />

      <DarknessOpen frame={frame} />

      <DepthOfField frame={frame} />

      <BluePulseTransition frame={frame} />
    </AbsoluteFill>
  );
};
