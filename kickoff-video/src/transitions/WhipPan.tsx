import { spring, interpolate, useCurrentFrame } from 'remotion';

export const WHIP_DURATION = 30;

export function WhipPanTransition({
  outgoing,
  incoming,
  frame: localFrame,
}: {
  outgoing: React.ReactNode;
  incoming: React.ReactNode;
  frame: number;
}) {
  const springProgress = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 22, mass: 1, stiffness: 280, overshootClamping: true },
  });

  const outgoingX = interpolate(springProgress, [0, 1], [0, -1920]);
  const incomingX = interpolate(springProgress, [0, 1], [1920, 0]);

  const linearProgress = localFrame / WHIP_DURATION;
  const velocity = Math.sin(linearProgress * Math.PI);
  const blur = velocity * 15;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        perspective: 800,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${outgoingX}px)`,
          filter: `blur(${blur}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {outgoing}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${incomingX}px)`,
          filter: `blur(${blur}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {incoming}
      </div>
    </div>
  );
}
