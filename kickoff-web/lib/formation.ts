import type { Player, Team } from "@/app/hooks/useAppData";

export type PositionGroup = "GK" | "DF" | "MF" | "FW";

export interface FormationSlot {
  /** Positional group this slot belongs to. */
  group: PositionGroup;
  /** Normalized x across the pitch width: -1 (left) .. 1 (right). */
  x: number;
  /** Normalized z along the pitch length: -1 (own goal) .. 1 (opponent goal). */
  z: number;
}

export const DEFAULT_FORMATION = "4-3-3";

/** Evenly spread `count` values across a width, centered on 0. */
function spread(count: number, span = 0.72): number[] {
  if (count <= 1) return [0];
  const step = (span * 2) / (count - 1);
  return Array.from({ length: count }, (_, i) => -span + step * i);
}

function row(group: PositionGroup, count: number, z: number, span = 0.72): FormationSlot[] {
  return spread(count, span).map((x) => ({ group, x, z }));
}

export const FORMATIONS: Record<string, FormationSlot[]> = {
  "4-3-3": [
    { group: "GK", x: 0, z: -0.86 },
    ...row("DF", 4, -0.5),
    ...row("MF", 3, -0.02, 0.42),
    ...row("FW", 3, 0.52, 0.5),
  ],
  "4-4-2": [
    { group: "GK", x: 0, z: -0.86 },
    ...row("DF", 4, -0.5),
    ...row("MF", 4, 0.0),
    ...row("FW", 2, 0.54, 0.24),
  ],
  "3-5-2": [
    { group: "GK", x: 0, z: -0.86 },
    ...row("DF", 3, -0.56, 0.46),
    ...row("MF", 5, -0.02, 0.72),
    ...row("FW", 2, 0.54, 0.24),
  ],
  "4-2-3-1": [
    { group: "GK", x: 0, z: -0.86 },
    ...row("DF", 4, -0.56),
    ...row("MF", 2, -0.2, 0.34),
    ...row("MF", 3, 0.18, 0.5),
    { group: "FW", x: 0, z: 0.6 },
  ],
  "5-3-2": [
    { group: "GK", x: 0, z: -0.86 },
    ...row("DF", 5, -0.56, 0.78),
    ...row("MF", 3, -0.02, 0.42),
    ...row("FW", 2, 0.54, 0.24),
  ],
};

export const FORMATION_NAMES = Object.keys(FORMATIONS);

const ABBREVIATION_GROUP: Record<string, PositionGroup> = {
  GK: "GK",
  DF: "DF",
  CB: "DF",
  RB: "DF",
  LB: "DF",
  SW: "DF",
  MF: "MF",
  DM: "MF",
  CM: "MF",
  AM: "MF",
  FW: "FW",
  ST: "FW",
  CF: "FW",
  LW: "FW",
  RW: "FW",
};

/** Resolve a free-text position string to a normalized group. */
export function positionGroup(position?: string | null): PositionGroup {
  if (!position) return "MF";

  const abbreviation = position.match(/\(([A-Za-z]{2,3})\)/)?.[1]?.toUpperCase();
  if (abbreviation && ABBREVIATION_GROUP[abbreviation]) {
    return ABBREVIATION_GROUP[abbreviation];
  }

  const text = position.toLowerCase();
  if (text.includes("goal") || text.includes("keeper")) return "GK";
  if (text.includes("defen") || text.includes("back")) return "DF";
  if (text.includes("midfield")) return "MF";
  if (text.includes("forward") || text.includes("strik") || text.includes("wing")) return "FW";
  return "MF";
}

export interface ResolvedFormation {
  formation: string;
  /** Player id per slot (index-aligned with FORMATIONS[formation]). Empty string = vacant. */
  lineup: string[];
}

/** Assign the available squad to a formation's slots, filling by group then shirt number. */
export function autoLineup(players: Player[], formation: string): string[] {
  const slots = FORMATIONS[formation] ?? FORMATIONS[DEFAULT_FORMATION];

  const pools: Record<PositionGroup, Player[]> = { GK: [], DF: [], MF: [], FW: [] };
  players.forEach((p) => pools[positionGroup(p.position)].push(p));
  (Object.keys(pools) as PositionGroup[]).forEach((g) =>
    pools[g].sort((a, b) => (a.number || 0) - (b.number || 0))
  );

  const used = new Set<string>();
  return slots.map((slot) => {
    const pool = pools[slot.group];
    const chosen = pool.find((p) => !used.has(p.id)) ?? players.find((p) => !used.has(p.id));
    if (!chosen) return "";
    used.add(chosen.id);
    return chosen.id;
  });
}

/** A stored lineup is only usable if its shape matches the formation and every id is on the team. */
function isUsableLineup(lineup: string[] | null | undefined, formation: string, players: Player[]): lineup is string[] {
  const slots = FORMATIONS[formation];
  if (!slots || !lineup || lineup.length !== slots.length) return false;
  const ids = new Set(players.map((p) => p.id));
  return lineup.every((id) => id === "" || ids.has(id));
}

/** Resolve the effective formation + lineup for a team, falling back to an auto-derived XI. */
export function resolveFormation(team: Team, players: Player[]): ResolvedFormation {
  const formation = team.formation && FORMATIONS[team.formation] ? team.formation : DEFAULT_FORMATION;
  if (isUsableLineup(team.lineup, formation, players)) {
    return { formation, lineup: team.lineup };
  }
  return { formation, lineup: autoLineup(players, formation) };
}
