import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing } from "../design-tokens";

const TOTAL = 540;
const EXPAND_START = 0;
const EXPAND_END = 40;
const STATUS_MORPH_START = 18;
const BLUE_PULSE_START = 35;
const BLUE_PULSE_END = 55;
const DASHBOARD_START = 50;
const SCOREBOARD_START = 55;
const TIMER_START = 65;
const LINEUP_START = 75;
const LINEUP_END = 110;
const POSSESSION_START = 95;
const STATS_PANEL_START = 105;
const EVENTS_PANEL_START = 115;
const EVENT1_GOAL = 130;
const EVENT2_YC = 160;
const EVENT3_HT = 190;
const EVENT4_SUB = 215;
const EVENT5_GOAL = 245;
const EVENT6_RC = 275;
const EVENT7_GOAL = 305;
const EVENT8_FT = 335;
const INTEL_START = 365;
const TYPO_START = 405;

const HOME = { name: "Arsenal", abbr: "ARS", color: "#EF0107", darkColor: "#8B0000" };
const AWAY = { name: "Chelsea", abbr: "CHE", color: "#034694", darkColor: "#001B4D" };

const HOME_PLAYERS = [
  { num: 22, name: "Raya", pos: "GK", x: 50, y: 88 },
  { num: 4, name: "White", pos: "RB", x: 75, y: 72 },
  { num: 2, name: "Saliba", pos: "CB", x: 60, y: 68 },
  { num: 6, name: "Gabriel", pos: "CB", x: 40, y: 68 },
  { num: 12, name: "Timber", pos: "LB", x: 25, y: 72 },
  { num: 41, name: "Rice", pos: "CM", x: 55, y: 50 },
  { num: 8, name: "Odegaard", pos: "CM", x: 40, y: 45 },
  { num: 29, name: "Havertz", pos: "CAM", x: 50, y: 38 },
  { num: 7, name: "Saka", pos: "RW", x: 72, y: 32 },
  { num: 11, name: "Martinelli", pos: "LW", x: 28, y: 32 },
  { num: 9, name: "Jesus", pos: "ST", x: 50, y: 22 },
];

const AWAY_PLAYERS = [
  { num: 1, name: "Sanchez", pos: "GK", x: 50, y: 88 },
  { num: 24, name: "James", pos: "RB", x: 75, y: 72 },
  { num: 6, name: "Silva", pos: "CB", x: 60, y: 68 },
  { num: 26, name: "Colwill", pos: "CB", x: 40, y: 68 },
  { num: 21, name: "Chilwell", pos: "LB", x: 25, y: 72 },
  { num: 25, name: "Caicedo", pos: "CDM", x: 50, y: 55 },
  { num: 8, name: "Fernandez", pos: "CM", x: 38, y: 45 },
  { num: 20, name: "Palmer", pos: "CAM", x: 50, y: 38 },
  { num: 10, name: "Mudryk", pos: "LW", x: 28, y: 32 },
  { num: 15, name: "Jackson", pos: "ST", x: 50, y: 22 },
  { num: 7, name: "Sterling", pos: "RW", x: 72, y: 32 },
];

const SCORES: [number, number][] = [
  [0, 0], [1, 0], [1, 0], [1, 0], [1, 1], [1, 1], [2, 1], [2, 1],
];

interface LiveEvent {
  type: "goal" | "yellow" | "red" | "sub" | "ht" | "ft";
  team?: "home" | "away";
  player?: string;
  minute: number;
  detail: string;
  icon: string;
}

const EVENTS: LiveEvent[] = [
  { type: "goal", team: "home", player: "Havertz", minute: 23, detail: "Arsenal 1-0", icon: "⚽" },
  { type: "yellow", team: "away", player: "Caicedo", minute: 31, detail: "Yellow Card", icon: "🟡" },
  { type: "ht", minute: 45, detail: "Half Time 1-0", icon: "⏸" },
  { type: "sub", team: "home", player: "Trossard → Martinelli", minute: 46, detail: "Substitution", icon: "🔄" },
  { type: "goal", team: "away", player: "Palmer", minute: 52, detail: "Chelsea 1-1", icon: "⚽" },
  { type: "red", team: "home", player: "Gabriel", minute: 67, detail: "Red Card", icon: "🔴" },
  { type: "goal", team: "home", player: "Saka", minute: 78, detail: "Arsenal 2-1", icon: "⚽" },
  { type: "ft", minute: 94, detail: "Full Time 2-1", icon: "⏹" },
];

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Fixtures", active: false },
  { label: "Live", active: true },
  { label: "Standings", active: false },
  { label: "Teams", active: false },
  { label: "Players", active: false },
  { label: "Settings", active: false },
];

const TYPO_LINES = [
  { text: "Every match.", start: TYPO_START, end: TYPO_START + 25 },
  { text: "Live.", start: TYPO_START + 29, end: TYPO_START + 54 },
  { text: "Every event captured instantly.", start: TYPO_START + 58, end: TYPO_START + 88 },
  { text: "Real-time competition management.", start: TYPO_START + 92, end: TYPO_START + 122 },
  { text: "Built for modern football.", start: TYPO_START + 126, end: TOTAL },
];

// ── Background ────────────────────────────────────────────────

const DashboardBg: React.FC<{ frame: number }> = ({ frame }) => {
  const blueIntensity = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 40], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div className="absolute inset-0" style={{ background: "#07130f" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(38,194,103,0.015) 0%, transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(60,160,255,${0.008 + blueIntensity * 0.015}) 0%, transparent 50%)` }} />
    </AbsoluteFill>
  );
};

// ── Phase 1: Expanding Card ──────────────────────────────────

const ExpandingFixtureCard: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame > EXPAND_END + 15) return null;
  const progress = interpolate(frame, [EXPAND_START, EXPAND_END], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(progress, [0, 1], [1, 6], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [EXPAND_END, EXPAND_END + 15], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statusProg = interpolate(frame, [STATUS_MORPH_START, STATUS_MORPH_START + 12], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statusBg = statusProg < 0.5 ? "rgba(245, 200, 75, 0.12)" : "rgba(60, 160, 255, 0.15)";
  const statusColor = statusProg < 0.5 ? "#f5c84b" : "#60a5fa";
  const statusLabel = statusProg < 0.5 ? "Scheduled" : "Live";

  return (
    <div className="absolute flex items-center justify-center" style={{ top: "50%", left: "50%", translate: "-50% -50%", zIndex: 180, opacity }}>
      <div
        className="flex flex-col rounded-xl"
        style={{
          scale: `${scale}`,
          width: 280,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 26, 20, 0.96)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          padding: 24,
          transformOrigin: "center center",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>MD 1 · AUG 16</span>
          <div className="rounded-full px-3 py-1" style={{ background: statusBg }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl font-black" style={{ background: `${HOME.color}20`, color: HOME.color, fontSize: 22, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{HOME.abbr}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{HOME.name}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "rgba(255,255,255,0.3)", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>vs</div>
          <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl font-black" style={{ background: `${AWAY.color}20`, color: AWAY.color, fontSize: 22, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{AWAY.abbr}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{AWAY.name}</span>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          Emirates Stadium · London
        </div>
      </div>
    </div>
  );
};

// ── Blue Pulse Effect ────────────────────────────────────────

const BluePulse: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < BLUE_PULSE_START || frame > BLUE_PULSE_END + 25) return null;
  const progress = interpolate(frame, [BLUE_PULSE_START, BLUE_PULSE_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.2, 0.6, 1], [0, 0.25, 0.15, 0], { easing: easing.smooth });
  const scale = interpolate(progress, [0, 1], [0.05, 3], { easing: easing.smooth });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, zIndex: 170 }}>
      <div className="absolute" style={{ top: "50%", left: "50%", width: 300, height: 300, translate: "-50% -50%", scale: `${scale}`, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,160,255,0.1) 0%, rgba(60,160,255,0.03) 30%, transparent 60%)", filter: "blur(30px)" }} />
      <div className="absolute" style={{ top: "50%", left: "50%", width: 150, height: 150, translate: "-50% -50%", scale: `${scale}`, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,160,255,0.06) 0%, transparent 50%)", filter: "blur(50px)" }} />
    </AbsoluteFill>
  );
};

// ── Sidebar ──────────────────────────────────────────────────

const Sidebar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [DASHBOARD_START + 5, DASHBOARD_START + 25], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [DASHBOARD_START + 5, DASHBOARD_START + 25], [-24, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 200, opacity, translate: `${translateX}px 0`, borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(10, 26, 20, 0.95)", backdropFilter: "blur(20px)", padding: "20px 12px" }}>
      <div className="flex items-center gap-2.5" style={{ padding: "0 8px", marginBottom: 32 }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: "#26c267" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 6 12 8.5V4l8 6-8 6v-4.5C9 11 7 13 4.5 13a2.5 2.5 0 0 1 0-5H6" />
          </svg>
        </div>
        <span style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 16, fontWeight: 900, color: "white", letterSpacing: "0.05em" }}>KICKOFF</span>
      </div>
      {NAV_ITEMS.map((item, i) => {
        const itemOpacity = interpolate(frame, [DASHBOARD_START + 8 + i * 3, DASHBOARD_START + 25 + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const itemY = interpolate(frame, [DASHBOARD_START + 8 + i * 3, DASHBOARD_START + 25 + i * 3], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-md px-3 py-2.5" style={{ opacity: itemOpacity, translate: `0 ${itemY}px`, background: item.active ? "rgba(60, 160, 255, 0.08)" : "transparent", marginBottom: 2 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.active ? "#60a5fa" : "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 12, fontWeight: item.active ? 700 : 500, color: item.active ? "white" : "rgba(255,255,255,0.55)" }}>{item.label}</span>
            {item.active && <div style={{ marginLeft: "auto", padding: "1px 5px", borderRadius: 4, background: "rgba(60, 160, 255, 0.15)", fontSize: 9, fontWeight: 600, color: "#60a5fa" }}>1</div>}
          </div>
        );
      })}
    </div>
  );
};

// ── Scoreboard ───────────────────────────────────────────────

const Scoreboard: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [SCOREBOARD_START, SCOREBOARD_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [SCOREBOARD_START, SCOREBOARD_START + 15], [-12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const liveOpacity = interpolate(frame, [TIMER_START, TIMER_START + 10], [0, 1], { easing: easing.crisp });
  const pulseLive = interpolate(frame, [TIMER_START, TIMER_START + 20, TIMER_START + 40], [0.4, 1, 0.4], { easing: easing.smooth });

  const eventIndex = frame < EVENT2_YC ? 0 : frame < EVENT5_GOAL ? 1 : frame < EVENT7_GOAL ? 2 : frame < EVENT8_FT ? 3 : 4;
  const safeIdx = Math.min(eventIndex, SCORES.length - 1);
  const s = SCORES[safeIdx];

  const homePulse = interpolate(frame, [EVENT1_GOAL, EVENT1_GOAL + 8, EVENT1_GOAL + 30], [1, 0.6, 1], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const homePulse2 = interpolate(frame, [EVENT7_GOAL, EVENT7_GOAL + 8, EVENT7_GOAL + 30], [1, 0.6, 1], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const awayPulse = interpolate(frame, [EVENT5_GOAL, EVENT5_GOAL + 8, EVENT5_GOAL + 30], [1, 0.6, 1], { easing: easing.smooth, extrapolateLeft: "clamp" });

  const homeScale = Math.min(homePulse, homePulse2) * (1 - (frame >= EVENT5_GOAL && frame < EVENT5_GOAL + 15 ? 0.15 * interpolate(frame, [EVENT5_GOAL, EVENT5_GOAL + 15], [0, 1], { easing: easing.smooth }) : 0));
  const awayScale = awayPulse;

  return (
    <div className="absolute" style={{ left: 200, right: 0, top: 0, height: 80, opacity, translate: `0 ${translateY}px`, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(10, 26, 20, 0.6)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", padding: "0 28px", zIndex: 100 }}>
      <div className="flex items-center gap-2" style={{ marginRight: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", opacity: pulseLive * liveOpacity }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.1em", opacity: liveOpacity }}>LIVE</span>
      </div>

      <div className="flex items-center justify-center gap-5" style={{ flex: 1 }}>
        <div className="flex items-center gap-3" style={{ textAlign: "right" }}>
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg font-black" style={{ background: `${HOME.color}20`, color: HOME.color, fontSize: 16, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", scale: `${homeScale}` }}>{HOME.abbr}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{HOME.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ fontSize: 34, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", letterSpacing: "0.02em", minWidth: 40, textAlign: "right" }}>{s[0]}</div>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ fontSize: 34, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", letterSpacing: "0.02em", minWidth: 40, textAlign: "left" }}>{s[1]}</div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{AWAY.name}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg font-black" style={{ background: `${AWAY.color}20`, color: AWAY.color, fontSize: 16, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", scale: `${awayScale}` }}>{AWAY.abbr}</div>
        </div>
      </div>

      <MatchTimer frame={frame} />
    </div>
  );
};

// ── Match Timer ──────────────────────────────────────────────

const MatchTimer: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [TIMER_START, TIMER_START + 12], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < TIMER_START) return null;

  let matchMinute: number;
  if (frame < EVENT2_YC) matchMinute = interpolate(frame, [TIMER_START, EVENT2_YC], [0, 23], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  else if (frame < EVENT5_GOAL) matchMinute = interpolate(frame, [EVENT2_YC, EVENT5_GOAL], [23, 52], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  else if (frame < EVENT7_GOAL) matchMinute = interpolate(frame, [EVENT5_GOAL, EVENT7_GOAL], [52, 78], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  else matchMinute = interpolate(frame, [EVENT7_GOAL, EVENT8_FT], [78, 94], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const displayMinute = Math.min(Math.max(0, Math.round(matchMinute)), 99);
  const ftActive = frame >= EVENT8_FT;
  const timerColor = ftActive ? "#26c267" : displayMinute >= 90 ? "#f5c84b" : "white";

  return (
    <div className="flex items-center gap-2" style={{ marginLeft: 20, opacity }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      <span style={{ fontSize: 18, fontWeight: 900, color: timerColor, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", letterSpacing: "0.03em", minWidth: 40 }}>
        {ftActive ? "FT" : `${displayMinute}'`}
      </span>
    </div>
  );
};

// ── Player Lineups ──────────────────────────────────────────

const PlayerLineups: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [LINEUP_START, LINEUP_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [LINEUP_START, LINEUP_END], [16, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < LINEUP_START) return null;

  return (
    <div className="absolute" style={{ left: 200, right: 0, top: 80, height: 140, opacity, translate: `0 ${translateY}px`, padding: "10px 28px", overflow: "hidden" }}>
      <div className="flex gap-4" style={{ height: "100%" }}>
        {[HOME, AWAY].map((team, tIdx) => {
          const players = tIdx === 0 ? HOME_PLAYERS : AWAY_PLAYERS;
          return (
            <div key={team.name} className="flex flex-col flex-1 rounded-lg p-2" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6, padding: "0 2px" }}>
                <div className="flex h-5 w-5 items-center justify-center rounded font-black" style={{ background: `${team.color}20`, color: team.color, fontSize: 8, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{team.abbr}</div>
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>{tIdx === 0 ? "4-3-3" : "4-2-3-1"}</span>
              </div>
              <div className="flex gap-1.5" style={{ flexWrap: "wrap" }}>
                {players.slice(0, 6).map((p, i) => {
                  const pDelay = interpolate(frame, [LINEUP_START + 8 + i * 3 + tIdx * 20, LINEUP_START + 18 + i * 3 + tIdx * 20], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div key={p.name} className="flex items-center gap-1 rounded px-1.5 py-0.5" style={{ opacity: pDelay, background: "rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: team.color, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", minWidth: 12 }}>{p.num}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{p.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Possession Bar ──────────────────────────────────────────

const PossessionBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [POSSESSION_START, POSSESSION_START + 12], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < POSSESSION_START) return null;
  const homePos = interpolate(frame, [POSSESSION_START, POSSESSION_START + 20], [50, 55], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div className="flex items-center gap-3" style={{ position: "absolute", left: 228, right: 28, top: 222, opacity }}>
      <span style={{ fontSize: 9, fontWeight: 900, color: HOME.color, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", minWidth: 28, textAlign: "right" }}>{Math.round(homePos)}%</span>
      <div className="flex-1" style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${homePos}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #60a5fa, #26c267)" }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 900, color: AWAY.color, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", minWidth: 28 }}>{Math.round(100 - homePos)}%</span>
    </div>
  );
};

// ── Events Panel ────────────────────────────────────────────

const EventsPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [EVENTS_PANEL_START, EVENTS_PANEL_START + 12], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < EVENTS_PANEL_START) return null;

  const visibleCount = frame < EVENT2_YC ? 1 : frame < EVENT3_HT ? 2 : frame < EVENT4_SUB ? 3 : frame < EVENT5_GOAL ? 4 : frame < EVENT6_RC ? 5 : frame < EVENT7_GOAL ? 6 : frame < EVENT8_FT ? 7 : 8;

  return (
    <div className="absolute" style={{ left: 200, width: 340, top: 235, bottom: 0, opacity, padding: "0 28px 12px 28px", overflow: "hidden" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 8 }}>MATCH EVENTS</div>
      <div className="flex flex-col gap-1.5">
        {EVENTS.slice(0, visibleCount).map((evt, i) => {
          const evtOpacity = interpolate(frame, [EVENTS_PANEL_START + 8 + i * 8, EVENTS_PANEL_START + 18 + i * 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const translateX = interpolate(frame, [EVENTS_PANEL_START + 8 + i * 8, EVENTS_PANEL_START + 18 + i * 8], [-8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isGoal = evt.type === "goal";
          const isRed = evt.type === "red";
          const bgColor = isGoal ? "rgba(38, 194, 103, 0.06)" : isRed ? "rgba(239, 68, 68, 0.06)" : "rgba(255,255,255,0.02)";
          const borderColor = isGoal ? "rgba(38, 194, 103, 0.12)" : isRed ? "rgba(239, 68, 68, 0.12)" : "rgba(255,255,255,0.04)";

          if (evt.type === "ht" || evt.type === "ft") {
            const htBg = evt.type === "ft" ? "rgba(38, 194, 103, 0.1)" : "rgba(245, 200, 75, 0.08)";
            const htColor = evt.type === "ft" ? "#26c267" : "#f5c84b";
            return (
              <div key={i} className="flex items-center justify-center gap-2 rounded-lg py-2" style={{ opacity: evtOpacity, translate: `${translateX}px 0`, background: htBg, border: `1px solid ${htColor}15` }}>
                <span style={{ fontSize: 12 }}>{evt.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: htColor, letterSpacing: "0.04em" }}>{evt.detail.toUpperCase()}</span>
              </div>
            );
          }

          return (
            <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ opacity: evtOpacity, translate: `${translateX}px 0`, background: bgColor, border: `1px solid ${borderColor}` }}>
              <span style={{ fontSize: 12, width: 20, textAlign: "center" }}>{evt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{evt.player || evt.detail}</div>
                <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{evt.type === "goal" ? evt.detail : evt.type === "sub" ? evt.detail : `${evt.minute}'`}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{evt.minute}'</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Stats Panel ─────────────────────────────────────────────

const StatsPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [STATS_PANEL_START, STATS_PANEL_START + 14], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < STATS_PANEL_START) return null;

  const statsRows = [
    { label: "Shots", home: 4, away: 3 },
    { label: "On Target", home: 3, away: 2 },
    { label: "Corners", home: 2, away: 1 },
    { label: "Fouls", home: 8, away: 6 },
    { label: "Cards", home: 1, away: 1 },
  ];

  const homeCards = frame >= EVENT6_RC ? 2 : 1;

  return (
    <div className="absolute" style={{ left: 540, right: 28, top: 235, bottom: 0, opacity, overflow: "hidden" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 8 }}>MATCH STATISTICS</div>
      <div className="flex flex-col gap-2 rounded-xl p-3" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        {statsRows.map((stat, i) => {
          const statOpacity = interpolate(frame, [STATS_PANEL_START + 8 + i * 5, STATS_PANEL_START + 18 + i * 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const homeVal = stat.label === "Cards" ? homeCards : stat.home;
          const awayVal = stat.away;
          const total = homeVal + awayVal;
          const homePct = total > 0 ? (homeVal / total) * 100 : 50;
          return (
            <div key={stat.label} className="flex items-center gap-2" style={{ opacity: statOpacity }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: HOME.color, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", minWidth: 18, textAlign: "right" }}>{homeVal}</span>
              <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${homePct}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #60a5fa, #26c267)" }} />
              </div>
              <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.4)", minWidth: 32, textAlign: "center" }}>{stat.label}</span>
              <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${100 - homePct}%`, height: "100%", borderRadius: 2, marginLeft: `${homePct}%`, background: AWAY.color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: AWAY.color, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", minWidth: 18 }}>{awayVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Standings Update ────────────────────────────────────────

const StandingsUpdate: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [INTEL_START, INTEL_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < INTEL_START) return null;

  const rows = [
    { pos: 1, team: "Arsenal", played: 4, won: 3, drawn: 1, lost: 0, gd: "+4", pts: 10 },
    { pos: 2, team: "Chelsea", played: 4, won: 2, drawn: 2, lost: 0, gd: "+1", pts: 8 },
    { pos: 3, team: "Liverpool", played: 4, won: 2, drawn: 1, lost: 1, gd: "+2", pts: 7 },
    { pos: 4, team: "Man City", played: 4, won: 2, drawn: 1, lost: 1, gd: "+1", pts: 7 },
  ];

  return (
    <div className="absolute" style={{ left: 200, width: 420, bottom: 12, opacity, padding: "0 28px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 6 }}>LIVE STANDINGS</div>
      <div className="flex flex-col gap-1 rounded-lg p-2.5" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2" style={{ padding: "0 4px", marginBottom: 2 }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 16 }}>#</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", flex: 1 }}>TEAM</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 16, textAlign: "center" }}>P</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 16, textAlign: "center" }}>W</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 16, textAlign: "center" }}>D</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 16, textAlign: "center" }}>L</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 24, textAlign: "right" }}>GD</span>
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.2)", width: 20, textAlign: "right" }}>PTS</span>
        </div>
        {rows.map((row, i) => {
          const rowOpacity = interpolate(frame, [INTEL_START + 10 + i * 5, INTEL_START + 20 + i * 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isHome = row.team === "Arsenal" || row.team === "Chelsea";
          return (
            <div key={row.team} className="flex items-center gap-2 rounded px-2 py-1" style={{ opacity: rowOpacity, background: isHome ? "rgba(60, 160, 255, 0.04)" : "transparent" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", width: 16 }}>{row.pos}</span>
              <div className="flex items-center gap-1.5" style={{ flex: 1 }}>
                {isHome && <div style={{ width: 3, height: 3, borderRadius: "50%", background: row.team === "Arsenal" ? HOME.color : AWAY.color }} />}
                <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{row.team}</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 16, textAlign: "center" }}>{row.played}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 16, textAlign: "center" }}>{row.won}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 16, textAlign: "center" }}>{row.drawn}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", width: 16, textAlign: "center" }}>{row.lost}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: row.gd.startsWith("+") ? "#26c267" : "rgba(255,255,255,0.5)", width: 24, textAlign: "right" }}>{row.gd}</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", width: 20, textAlign: "right" }}>{row.pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Activity Feed ───────────────────────────────────────────

const ActivityFeed: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [INTEL_START + 10, INTEL_START + 25], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < INTEL_START + 10) return null;

  const items = [
    { text: "⚽ Goal: Havertz (23') — Arsenal 1-0", delay: 0 },
    { text: "🟡 Yellow Card: Caicedo (31')", delay: 12 },
    { text: "🔄 Substitution: Trossard in (46')", delay: 24 },
    { text: "⚽ Goal: Palmer (52') — 1-1", delay: 36 },
    { text: "🔴 Red Card: Gabriel (67')", delay: 48 },
    { text: "⚽ Goal: Saka (78') — Arsenal 2-1", delay: 60 },
    { text: "⏹ Full Time: Arsenal 2-1 Chelsea", delay: 72 },
  ];

  return (
    <div className="absolute" style={{ right: 28, width: 240, bottom: 12, opacity }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 6 }}>LIVE ACTIVITY</div>
      <div className="flex flex-col gap-1 rounded-lg p-2.5" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        {items.map((item, i) => {
          const itemOpacity = interpolate(frame, [INTEL_START + 20 + item.delay, INTEL_START + 30 + item.delay], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} className="flex items-center gap-1.5" style={{ opacity: itemOpacity }}>
              <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Kinetic Typography ──────────────────────────────────────

const KineticLine: React.FC<{ text: string; start: number; end: number; currentFrame: number }> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;
  if (localFrame < 0) return null;
  const opacity = interpolate(localFrame, [0, duration * 0.2, duration * 0.7, duration], [0, 1, 1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(localFrame, [0, duration * 0.2], [16, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity, translate: `0 ${translateY}px`, display: "flex", justifyContent: "center" }}>
      <span style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 24, fontWeight: 400, color: "white", textAlign: "center", lineHeight: 1.5, letterSpacing: "0.03em" }}>{text}</span>
    </div>
  );
};

const KineticTypography: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = TYPO_LINES.some((l) => frame >= l.start && frame < l.end + 10);
  if (!anyVisible) return null;
  return (
    <AbsoluteFill className="flex flex-col items-center justify-center" style={{ top: "44%", height: "auto", zIndex: 160 }}>
      <div className="flex flex-col items-center rounded-2xl px-10 py-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {TYPO_LINES.map((line) => <KineticLine key={line.text} text={line.text} start={line.start} end={line.end} currentFrame={frame} />)}
      </div>
    </AbsoluteFill>
  );
};

// ── Depth of Field ──────────────────────────────────────────

const DOF: React.FC<{ frame: number }> = ({ frame }) => {
  const blur = interpolate(frame, [0, EXPAND_END, EXPAND_END + 20, DASHBOARD_START + 60, TOTAL], [3, 1, 0.4, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth });
  return <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.3, pointerEvents: "none" }} />;
};

// ── Light Sweep ─────────────────────────────────────────────

const LightSweep: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = (frame % 300) / 300;
  const opacity = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 30], [0, 0.15], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xPos = interpolate(progress, [0, 1], [-10, 110]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacity * 0.12 }}>
      <div className="absolute top-0" style={{ left: `${xPos}%`, width: "25%", height: "100%", translate: "-50% 0", background: "linear-gradient(90deg, transparent, rgba(60, 160, 255, 0.025), transparent)", filter: "blur(40px)" }} />
    </AbsoluteFill>
  );
};

// ── Main Scene ──────────────────────────────────────────────

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraScale = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 60, DASHBOARD_START + 180], [1.06, 1, 1.02], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [DASHBOARD_START + 20, DASHBOARD_START + 120], [0, -2], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const orbitX = interpolate(frame, [DASHBOARD_START + 40, DASHBOARD_START + 160], [0, 2.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <DashboardBg frame={frame} />

      {/* Phase 1: Expanding Card → Live */}
      <ExpandingFixtureCard frame={frame} />
      <BluePulse frame={frame} />

      {/* Dashboard */}
      <div className="absolute inset-0" style={{ scale: `${cameraScale}`, translate: `${orbitX}px ${panY}px`, willChange: "transform" }}>
        <Sidebar frame={frame} />
        <Scoreboard frame={frame} />
        <PlayerLineups frame={frame} />
        <PossessionBar frame={frame} />
        <EventsPanel frame={frame} />
        <StatsPanel frame={frame} />
        <StandingsUpdate frame={frame} />
        <ActivityFeed frame={frame} />
      </div>

      {/* Overlays */}
      <KineticTypography frame={frame} />
      <LightSweep frame={frame} />
      <DOF frame={frame} />
    </AbsoluteFill>
  );
};
