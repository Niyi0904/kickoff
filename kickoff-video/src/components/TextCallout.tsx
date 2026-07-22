import { interpolate, useCurrentFrame, spring } from 'remotion';

export function TextCallout({
  text,
  startFrame,
  duration = 120,
}: {
  text: string;
  startFrame: number;
  duration?: number;
}) {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  const opacity = interpolate(localFrame, [0, 15, duration - 20, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(localFrame, [0, 15], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scaleProgress = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 18, mass: 1, stiffness: 280, overshootClamping: true },
  });
  const scale = interpolate(scaleProgress, [0, 1], [1.08, 1.0]);

  const blurProgress = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 15, mass: 1, stiffness: 200, overshootClamping: true },
  });
  const blur = interpolate(blurProgress, [0, 1], [4, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 140,
        left: '50%',
        transform: `translateX(-50%)`,
        opacity,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'rgba(245,200,75,0.12)',
          border: '1px solid rgba(245,200,75,0.3)',
          borderRadius: 8,
          padding: '16px 32px',
          backdropFilter: 'blur(8px)',
          transform: `translateY(${y}px) scale(${scale})`,
          filter: `blur(${blur}px)`,
          transformOrigin: 'center center',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f5c84b' }} />
        <span
          style={{
            fontFamily: '"Teko", "Oswald", sans-serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#f5c84b',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
