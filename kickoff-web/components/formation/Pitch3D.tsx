"use client";

import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import type { Player } from "@/app/hooks/useAppData";
import { DEFAULT_FORMATION, FORMATIONS } from "@/lib/formation";

// Real pitch is 68m x 105m; SCALE maps metres into world units.
const SCALE = 0.14;
const W = 68 * SCALE;
const L = 105 * SCALE;
const MARGIN = 1.2;
const STRIPES = 10;

interface Pitch3DProps {
  players: Player[];
  /** Player id per slot (index-aligned with FORMATIONS[formation]). */
  lineup: string[];
  formation: string;
  /** Team primary colour, e.g. "#22c55e". */
  color: string;
}

function Pitch() {
  const hw = W / 2;
  const hl = L / 2;

  const outline: [number, number, number][] = useMemo(
    () => [
      [-hw, 0, -hl],
      [hw, 0, -hl],
      [hw, 0, hl],
      [-hw, 0, hl],
      [-hw, 0, -hl],
    ],
    [hw, hl]
  );

  const halfway: [number, number, number][] = [
    [-hw, 0, 0],
    [hw, 0, 0],
  ];

  const circle = useMemo(() => {
    const r = 9.15 * SCALE;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    return pts;
  }, []);

  const boxHalfW = (40.32 * SCALE) / 2;
  const boxDepth = 16.5 * SCALE;
  const sixHalfW = (18.32 * SCALE) / 2;
  const sixDepth = 5.5 * SCALE;

  const ends: [number, number, number][][] = useMemo(() => {
    const build = (dir: 1 | -1): [number, number, number][] => [
      [-boxHalfW, 0, dir * hl],
      [-boxHalfW, 0, dir * (hl - boxDepth)],
      [boxHalfW, 0, dir * (hl - boxDepth)],
      [boxHalfW, 0, dir * hl],
    ];
    return [build(-1), build(1)];
  }, [boxHalfW, boxDepth, hl]);

  const sixEnds: [number, number, number][][] = useMemo(() => {
    const build = (dir: 1 | -1): [number, number, number][] => [
      [-sixHalfW, 0, dir * hl],
      [-sixHalfW, 0, dir * (hl - sixDepth)],
      [sixHalfW, 0, dir * (hl - sixDepth)],
      [sixHalfW, 0, dir * hl],
    ];
    return [build(-1), build(1)];
  }, [sixHalfW, sixDepth, hl]);

  const lineStyle = { color: "#eafff3", lineWidth: 1.2, transparent: true, opacity: 0.85 } as const;

  return (
    <group>
      {/* Mowing stripes */}
      {Array.from({ length: STRIPES }).map((_, i) => (
        <mesh
          key={i}
          rotation-x={-Math.PI / 2}
          position={[0, 0.001, -L / 2 + (i + 0.5) * (L / STRIPES)]}
          receiveShadow
        >
          <planeGeometry args={[W, L / STRIPES]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#14532d" : "#166534"} roughness={0.95} />
        </mesh>
      ))}

      <Line points={outline} {...lineStyle} />
      <Line points={halfway} {...lineStyle} />
      <Line points={circle} {...lineStyle} />
      {ends.map((pts, i) => (
        <Line key={`box-${i}`} points={[...pts, pts[0]]} {...lineStyle} />
      ))}
      {sixEnds.map((pts, i) => (
        <Line key={`six-${i}`} points={[...pts, pts[0]]} {...lineStyle} />
      ))}
    </group>
  );
}

function PlayerMarker({
  position,
  player,
  color,
}: {
  position: [number, number, number];
  player: Player;
  color: string;
}) {
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.12, 32]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <Html center distanceFactor={16} position={[0, 1.15, 0]} zIndexRange={[20, 0]}>
        <div className="pointer-events-none flex select-none flex-col items-center gap-1">
          <div
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 bg-black/80 shadow-lg"
            style={{ borderColor: color }}
          >
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[11px] font-black text-white">{initials}</span>
            )}
          </div>
          <span className="whitespace-nowrap rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
            {player.number} · {player.name}
          </span>
        </div>
      </Html>
    </group>
  );
}

export default function Pitch3D({ players, lineup, formation, color }: Pitch3DProps) {
  const slots = FORMATIONS[formation] ?? FORMATIONS[DEFAULT_FORMATION];
  const playersById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl border border-border/50 bg-[#07130f] sm:aspect-[3/4]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 13, 15], fov: 42 }}>
        <color attach="background" args={["#07130f"]} />
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[8, 16, 8]}
          intensity={1.3}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={null}>
          <Pitch />
          {slots.map((slot, i) => {
            const player = playersById.get(lineup[i]);
            if (!player) return null;
            const x = slot.x * (W / 2 - MARGIN);
            const z = -slot.z * (L / 2 - MARGIN);
            return <PlayerMarker key={player.id} position={[x, 0, z]} player={player} color={color} />;
          })}
        </Suspense>
        <OrbitControls
          enablePan={false}
          target={[0, 0, 0]}
          minDistance={9}
          maxDistance={30}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.3}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
        {formation}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium text-white/70 sm:block">
        Drag to rotate · scroll to zoom
      </div>
    </div>
  );
}
