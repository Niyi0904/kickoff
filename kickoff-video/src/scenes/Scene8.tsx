import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing } from "../design-tokens";

const TOTAL = 540;
const MATCH_END_START = 0;
const SCOREBOARD_LOCK = 12;
const BLUE_PULSE_START = 18;
const BLUE_PULSE_END = 38;
const CARD_LIFT_START = 22;
const CARD_LIFT_END = 45;
const DATA_DISSOLVE_START = 40;
const DATA_DISSOLVE_END = 85;
const DASHBOARD_START = 70;
const SIDEBAR_START = 75;
const HEADER_START = 78;
const QUICK_STATS_START = 85;
const TABLE_WIDGET_START = 100;
const SCORERS_WIDGET_START = 115;
const FORM_WIDGET_START = 130;
const POSSESSION_WIDGET_START = 145;
const CHARTS_START = 160;
const FOCUS_TABLE = 175;
const FOCUS_SCORERS = 210;
const FOCUS_FORM = 245;
const FOCUS_POSSESSION = 280;
const FOCUS_CHARTS = 315;
const LIVE_INTEL_START = 350;
const TREND_LINES_START = 360;
const COMPARISON_START = 375;
const TYPO_START = 405;

const TYPO_LINES = [
  { text: "Every match tells a story.", start: TYPO_START, end: TYPO_START + 27 },
  { text: "Every statistic reveals an insight.", start: TYPO_START + 31, end: TYPO_START + 58 },
  { text: "Make smarter decisions.", start: TYPO_START + 62, end: TYPO_START + 89 },
  { text: "Powered by real-time football intelligence.", start: TYPO_START + 93, end: TOTAL - 10 },
];

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Fixtures", active: false },
  { label: "Standings", active: false },
  { label: "Analytics", active: true },
  { label: "Teams", active: false },
  { label: "Players", active: false },
  { label: "Settings", active: false },
];

const LEAGUE_TABLE = [
  { pos: 1, team: "Arsenal", abbr: "ARS", color: "#EF0107", p: 4, w: 3, d: 1, l: 0, gd: "+4", pts: 10 },
  { pos: 2, team: "Chelsea", abbr: "CHE", color: "#034694", p: 4, w: 2, d: 2, l: 0, gd: "+1", pts: 8 },
  { pos: 3, team: "Liverpool", abbr: "LIV", color: "#C8102E", p: 4, w: 2, d: 1, l: 1, gd: "+2", pts: 7 },
  { pos: 4, team: "Man City", abbr: "MCI", color: "#6CABDD", p: 4, w: 2, d: 1, l: 1, gd: "+1", pts: 7 },
  { pos: 5, team: "Tottenham", abbr: "TOT", color: "#132257", p: 4, w: 1, d: 2, l: 1, gd: "+0", pts: 5 },
  { pos: 6, team: "Newcastle", abbr: "NEW", color: "#241F20", p: 4, w: 1, d: 1, l: 2, gd: "-1", pts: 4 },
];

const TOP_SCORERS = [
  { pos: 1, name: "K. Havertz", team: "ARS", goals: 8, matches: 4 },
  { pos: 2, name: "B. Saka", team: "ARS", goals: 6, matches: 4 },
  { pos: 3, name: "C. Palmer", team: "CHE", goals: 5, matches: 4 },
  { pos: 4, name: "N. Jackson", team: "CHE", goals: 4, matches: 4 },
  { pos: 5, name: "Gabriel Jesus", team: "ARS", goals: 4, matches: 3 },
  { pos: 6, name: "M. Salah", team: "LIV", goals: 3, matches: 3 },
];

const TEAM_FORM = [
  { team: "Arsenal", form: ["W", "W", "D", "W", "W"], color: "#EF0107" },
  { team: "Chelsea", form: ["D", "W", "W", "D", "D"], color: "#034694" },
  { team: "Liverpool", form: ["W", "L", "W", "W", "L"], color: "#C8102E" },
  { team: "Man City", form: ["W", "W", "L", "W", "D"], color: "#6CABDD" },
];

const POSSESSION_DATA = [
  { team: "Arsenal", pct: 55, color: "#EF0107" },
  { team: "Liverpool", pct: 52, color: "#C8102E" },
  { team: "Man City", pct: 50, color: "#6CABDD" },
  { team: "Chelsea", pct: 48, color: "#034694" },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ── Background ────────────────────────────────────────────────

const DashboardBg: React.FC<{ frame: number }> = ({ frame }) => {
  const bluePulse = interpolate(frame, [BLUE_PULSE_START, BLUE_PULSE_END, DASHBOARD_START, DASHBOARD_START + 60], [0, 0.3, 0.5, 0.12], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div className="absolute inset-0" style={{ background: "#07130f" }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 50% at 52% 28%, rgba(38,194,103,0.015) 0%, transparent 60%)` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(60,160,255,${0.008 + bluePulse * 0.02}) 0%, transparent 50%)` }} />
    </AbsoluteFill>
  );
};

// ── Phase 1: Match End Transition ────────────────────────────

const MatchEndTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const endOpacity = interpolate(frame, [MATCH_END_START, SCOREBOARD_LOCK], [1, 1], { easing: easing.smooth });
  const fadeOut = interpolate(frame, [CARD_LIFT_END - 10, CARD_LIFT_END + 10], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const liftY = interpolate(frame, [CARD_LIFT_START, CARD_LIFT_END], [0, -30], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const liftOpacity = interpolate(frame, [CARD_LIFT_START, CARD_LIFT_END, CARD_LIFT_END + 10], [1, 1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [CARD_LIFT_START, CARD_LIFT_END], [1, 0.97], { easing: easing.smooth });

  if (frame > CARD_LIFT_END + 15) return null;

  return (
    <div className="absolute flex items-center justify-center" style={{ top: "50%", left: "50%", translate: "-50% -50%", zIndex: 180, opacity: endOpacity * fadeOut }}>
      <div
        className="flex flex-col rounded-2xl"
        style={{
          opacity: liftOpacity, translate: `0 ${liftY}px`, scale: `${scale}`,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 26, 20, 0.96)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          padding: 32,
          width: 320,
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>MATCHDAY 1 · FULL TIME</span>
          <div className="rounded-full px-3 py-1" style={{ background: "rgba(38, 194, 103, 0.12)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#26c267" }}>Final</span>
          </div>
        </div>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex flex-col items-center" style={{ flex: 1 }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl font-black" style={{ background: "#EF010720", color: "#EF0107", fontSize: 22, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", marginBottom: 6 }}>ARS</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Arsenal</span>
          </div>
          <div className="flex flex-col items-center" style={{ padding: "0 16px" }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", letterSpacing: "0.05em" }}>2 - 1</div>
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>90:00</span>
          </div>
          <div className="flex flex-col items-center" style={{ flex: 1 }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl font-black" style={{ background: "#03469420", color: "#034694", fontSize: 22, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", marginBottom: 6 }}>CHE</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Chelsea</span>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          Havertz 23' · Palmer 52' · Saka 78'
        </div>
      </div>
    </div>
  );
};

// ── Blue Pulse ────────────────────────────────────────────────

const BluePulse: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < BLUE_PULSE_START || frame > BLUE_PULSE_END + 20) return null;
  const progress = interpolate(frame, [BLUE_PULSE_START, BLUE_PULSE_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.2, 0.7, 1], [0, 0.2, 0.1, 0], { easing: easing.smooth });
  const scale = interpolate(progress, [0, 1], [0.05, 3], { easing: easing.smooth });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, zIndex: 170 }}>
      <div className="absolute" style={{ top: "50%", left: "50%", width: 300, height: 300, translate: "-50% -50%", scale: `${scale}`, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,160,255,0.08) 0%, rgba(60,160,255,0.02) 30%, transparent 60%)", filter: "blur(30px)" }} />
    </AbsoluteFill>
  );
};

// ── Data Particles ──────────────────────────────────────────

const DataParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [DATA_DISSOLVE_START, DATA_DISSOLVE_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 0.6, 0.4, 0], { easing: easing.smooth });
  if (progress <= 0 || opacity <= 0) return null;

  const categories = [
    { label: "Goals", count: 5, color: "#60a5fa" },
    { label: "Assists", count: 3, color: "#26c267" },
    { label: "Possession", count: 4, color: "#f5c84b" },
    { label: "Cards", count: 3, color: "#ef4444" },
    { label: "Shots", count: 7, color: "#a78bfa" },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 150, opacity }}>
      {categories.map((cat, cIdx) => (
        Array.from({ length: cat.count }).map((_, pIdx) => {
          const seed = cIdx * 100 + pIdx;
          const angle = seededRandom(seed) * Math.PI * 2;
          const radius = 40 + seededRandom(seed + 1) * 300 * progress;
          const x = 640 + Math.cos(angle) * radius;
          const y = 360 + Math.sin(angle) * radius * 0.6;
          const size = 2 + seededRandom(seed + 2) * 3;
          const particleOpacity = interpolate(progress, [0.1 + pIdx * 0.05, 0.4 + pIdx * 0.05], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const fadeEnd = interpolate(progress, [0.6, 0.9], [1, 0], { easing: easing.smooth });
          return (
            <div
              key={`${cIdx}-${pIdx}`}
              className="absolute rounded-full"
              style={{
                left: x, top: y, width: size, height: size,
                background: cat.color,
                opacity: particleOpacity * fadeEnd,
                boxShadow: `0 0 ${4 + size * 2}px ${cat.color}40`,
                willChange: "transform, opacity",
              }}
            />
          );
        })
      ))}
      <div className="absolute flex gap-6" style={{ top: "48%", left: "50%", translate: "-50% -50%" }}>
        {categories.map((cat, i) => {
          const catOpacity = interpolate(progress, [0.3 + i * 0.08, 0.5 + i * 0.08], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const catFade = interpolate(progress, [0.7, 0.85], [1, 0], { easing: easing.smooth });
          const translateY = interpolate(progress, [0.3 + i * 0.08, 0.6 + i * 0.08], [10, -20], { easing: easing.smooth });
          return (
            <div key={cat.label} className="flex flex-col items-center" style={{ opacity: catOpacity * catFade, translate: `0 ${translateY}px` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, letterSpacing: "0.05em" }}>{cat.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Sidebar ──────────────────────────────────────────────────

const Sidebar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [SIDEBAR_START, SIDEBAR_START + 20], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [SIDEBAR_START, SIDEBAR_START + 20], [-24, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
        const itemOpacity = interpolate(frame, [SIDEBAR_START + 6 + i * 3, SIDEBAR_START + 20 + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const itemY = interpolate(frame, [SIDEBAR_START + 6 + i * 3, SIDEBAR_START + 20 + i * 3], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-md px-3 py-2.5" style={{ opacity: itemOpacity, translate: `0 ${itemY}px`, background: item.active ? "rgba(60, 160, 255, 0.08)" : "transparent", marginBottom: 2 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.active ? "#60a5fa" : "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 12, fontWeight: item.active ? 700 : 500, color: item.active ? "white" : "rgba(255,255,255,0.55)" }}>{item.label}</span>
            {item.active && <div style={{ marginLeft: "auto", padding: "1px 5px", borderRadius: 4, background: "rgba(60, 160, 255, 0.15)", fontSize: 9, fontWeight: 600, color: "#60a5fa" }}>6</div>}
          </div>
        );
      })}
    </div>
  );
};

// ── Header ──────────────────────────────────────────────────

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [HEADER_START, HEADER_START + 16], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [HEADER_START, HEADER_START + 16], [-10, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className="absolute" style={{ left: 200, right: 0, top: 0, height: 52, opacity, translate: `0 ${translateY}px`, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>Premier League</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Analytics & Insights</span>
      </div>
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>SEASON 2024/25</span>
      </div>
    </div>
  );
};

// ── Quick Stat Cards ────────────────────────────────────────

const StatCards: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [QUICK_STATS_START, QUICK_STATS_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [QUICK_STATS_START, QUICK_STATS_START + 15], [12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < QUICK_STATS_START) return null;

  const stats = [
    { label: "Total Goals", value: 52, change: "+12.4%", icon: "goal", color: "#60a5fa" },
    { label: "Total Assists", value: 38, change: "+8.2%", icon: "assist", color: "#26c267" },
    { label: "Cards", value: 24, change: "-15.3%", icon: "card", color: "#f5c84b" },
    { label: "Clean Sheets", value: 8, change: "+4", icon: "shield", color: "#a78bfa" },
  ];

  return (
    <div className="flex gap-2.5" style={{ opacity, translate: `0 ${translateY}px`, marginBottom: 14 }}>
      {stats.map((stat, i) => {
        const stOpacity = interpolate(frame, [QUICK_STATS_START + 4 + i * 3, QUICK_STATS_START + 14 + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const count = Math.round(interpolate(frame, [QUICK_STATS_START + 8 + i * 3, QUICK_STATS_START + 22 + i * 3], [0, stat.value], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
        const isPositive = stat.change.startsWith("+");
        return (
          <div key={stat.label} className="flex flex-1 flex-col rounded-xl p-3.5" style={{ opacity: stOpacity, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{stat.label}</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: stat.color, opacity: 0.6 }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", letterSpacing: "0.02em" }}>{count}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: isPositive ? "#26c267" : "#ef4444", marginTop: 4 }}>{stat.change}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── League Table Widget ────────────────────────────────────

const LeagueTableWidget: React.FC<{ frame: number; isFocused: boolean }> = ({ frame, isFocused }) => {
  const opacity = interpolate(frame, [TABLE_WIDGET_START, TABLE_WIDGET_START + 18], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [TABLE_WIDGET_START, TABLE_WIDGET_START + 18], [14, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < TABLE_WIDGET_START) return null;
  const focusScale = isFocused ? interpolate(frame, [FOCUS_TABLE, FOCUS_TABLE + 15], [0.97, 1.02], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const borderColor = isFocused ? "rgba(60, 160, 255, 0.15)" : "rgba(255,255,255,0.04)";

  return (
    <div className="flex flex-col rounded-xl p-4" style={{ opacity, translate: `0 ${translateY}px`, scale: `${focusScale}`, border: `1px solid ${borderColor}`, background: isFocused ? "rgba(60, 160, 255, 0.03)" : "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>LEAGUE TABLE</span>
        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>TOP 6</span>
      </div>
      <div className="flex items-center gap-2" style={{ padding: "0 2px", marginBottom: 4 }}>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 14 }}>#</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", flex: 1 }}>TEAM</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 14, textAlign: "center" }}>P</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 14, textAlign: "center" }}>W</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 14, textAlign: "center" }}>D</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 14, textAlign: "center" }}>L</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 20, textAlign: "right" }}>GD</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 18, textAlign: "right" }}>PTS</span>
      </div>
      <div className="flex flex-col gap-1">
        {LEAGUE_TABLE.slice(0, 6).map((row, i) => {
          const rowOpacity = interpolate(frame, [TABLE_WIDGET_START + 10 + i * 3, TABLE_WIDGET_START + 20 + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={row.team} className="flex items-center gap-2 rounded px-2 py-1" style={{ opacity: rowOpacity, background: i < 3 ? "rgba(60, 160, 255, 0.03)" : "transparent" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: i < 3 ? "#60a5fa" : "rgba(255,255,255,0.3)", width: 14 }}>{row.pos}</span>
              <div className="flex items-center gap-1.5" style={{ flex: 1 }}>
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: row.color }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{row.team}</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.45)", width: 14, textAlign: "center" }}>{row.p}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.45)", width: 14, textAlign: "center" }}>{row.w}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.45)", width: 14, textAlign: "center" }}>{row.d}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.45)", width: 14, textAlign: "center" }}>{row.l}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: row.gd.startsWith("+") ? "#26c267" : "rgba(255,255,255,0.45)", width: 20, textAlign: "right" }}>{row.gd}</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", width: 18, textAlign: "right" }}>{row.pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Top Scorers Widget ─────────────────────────────────────

const TopScorersWidget: React.FC<{ frame: number; isFocused: boolean }> = ({ frame, isFocused }) => {
  const opacity = interpolate(frame, [SCORERS_WIDGET_START, SCORERS_WIDGET_START + 16], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [SCORERS_WIDGET_START, SCORERS_WIDGET_START + 16], [14, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < SCORERS_WIDGET_START) return null;
  const focusScale = isFocused ? interpolate(frame, [FOCUS_SCORERS, FOCUS_SCORERS + 15], [0.97, 1.02], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const borderColor = isFocused ? "rgba(60, 160, 255, 0.15)" : "rgba(255,255,255,0.04)";

  const maxGoals = TOP_SCORERS[0].goals;

  return (
    <div className="flex flex-col rounded-xl p-4" style={{ opacity, translate: `0 ${translateY}px`, scale: `${focusScale}`, border: `1px solid ${borderColor}`, background: isFocused ? "rgba(60, 160, 255, 0.03)" : "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", marginBottom: 10 }}>TOP SCORERS</span>
      <div className="flex flex-col gap-2">
        {TOP_SCORERS.map((scorer, i) => {
          const sOpacity = interpolate(frame, [SCORERS_WIDGET_START + 8 + i * 4, SCORERS_WIDGET_START + 18 + i * 4], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barWidth = interpolate(frame, [SCORERS_WIDGET_START + 12 + i * 4, SCORERS_WIDGET_START + 28 + i * 4], [0, (scorer.goals / maxGoals) * 100], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const medal = i === 0 ? "#f5c84b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "transparent";
          return (
            <div key={scorer.name} className="flex items-center gap-2" style={{ opacity: sOpacity }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: medal !== "transparent" ? medal : "rgba(255,255,255,0.3)", width: 12 }}>{i + 1}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", width: 100 }}>{scorer.name}</span>
              <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.3)", width: 24 }}>{scorer.team}</span>
              <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #60a5fa, #26c267)" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", width: 18, textAlign: "right" }}>{scorer.goals}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Team Form Widget ────────────────────────────────────────

const TeamFormWidget: React.FC<{ frame: number; isFocused: boolean }> = ({ frame, isFocused }) => {
  const opacity = interpolate(frame, [FORM_WIDGET_START, FORM_WIDGET_START + 16], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [FORM_WIDGET_START, FORM_WIDGET_START + 16], [14, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < FORM_WIDGET_START) return null;
  const focusScale = isFocused ? interpolate(frame, [FOCUS_FORM, FOCUS_FORM + 15], [0.97, 1.02], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const borderColor = isFocused ? "rgba(60, 160, 255, 0.15)" : "rgba(255,255,255,0.04)";
  const winPct = interpolate(frame, [TREND_LINES_START, TREND_LINES_START + 20], [0, 75], { easing: easing.crisp, extrapolateLeft: "clamp" });
  const drawPct = interpolate(frame, [TREND_LINES_START + 5, TREND_LINES_START + 25], [0, 15], { easing: easing.crisp, extrapolateLeft: "clamp" });
  const lossPct = interpolate(frame, [TREND_LINES_START + 10, TREND_LINES_START + 30], [0, 10], { easing: easing.crisp, extrapolateLeft: "clamp" });

  return (
    <div className="flex flex-col rounded-xl p-4" style={{ opacity, translate: `0 ${translateY}px`, scale: `${focusScale}`, border: `1px solid ${borderColor}`, background: isFocused ? "rgba(60, 160, 255, 0.03)" : "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", marginBottom: 10 }}>TEAM FORM</span>
      <div className="flex flex-col gap-2.5">
        {TEAM_FORM.map((tf, i) => {
          const fOpacity = interpolate(frame, [FORM_WIDGET_START + 8 + i * 5, FORM_WIDGET_START + 18 + i * 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={tf.team} className="flex items-center gap-2" style={{ opacity: fOpacity }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: tf.color }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", width: 60 }}>{tf.team}</span>
              <div className="flex gap-1">
                {tf.form.map((result, j) => {
                  const rOpacity = interpolate(frame, [FORM_WIDGET_START + 12 + i * 5 + j * 2, FORM_WIDGET_START + 18 + i * 5 + j * 2], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  const bg = result === "W" ? "rgba(38, 194, 103, 0.2)" : result === "D" ? "rgba(245, 200, 75, 0.2)" : "rgba(239, 68, 68, 0.2)";
                  const color = result === "W" ? "#26c267" : result === "D" ? "#f5c84b" : "#ef4444";
                  return (
                    <div key={j} className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-black" style={{ opacity: rOpacity, background: bg, color }}>{result}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4" style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#26c267" }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: "#26c267" }}>{Math.round(winPct)}%</span>
          <span style={{ fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>Win</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5c84b" }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: "#f5c84b" }}>{Math.round(drawPct)}%</span>
          <span style={{ fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>Draw</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: "#ef4444" }}>{Math.round(lossPct)}%</span>
          <span style={{ fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>Loss</span>
        </div>
      </div>
    </div>
  );
};

// ── Possession Widget ──────────────────────────────────────

const PossessionWidget: React.FC<{ frame: number; isFocused: boolean }> = ({ frame, isFocused }) => {
  const opacity = interpolate(frame, [POSSESSION_WIDGET_START, POSSESSION_WIDGET_START + 16], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [POSSESSION_WIDGET_START, POSSESSION_WIDGET_START + 16], [14, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < POSSESSION_WIDGET_START) return null;
  const focusScale = isFocused ? interpolate(frame, [FOCUS_POSSESSION, FOCUS_POSSESSION + 15], [0.97, 1.02], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const borderColor = isFocused ? "rgba(60, 160, 255, 0.15)" : "rgba(255,255,255,0.04)";

  return (
    <div className="flex flex-col rounded-xl p-4" style={{ opacity, translate: `0 ${translateY}px`, scale: `${focusScale}`, border: `1px solid ${borderColor}`, background: isFocused ? "rgba(60, 160, 255, 0.03)" : "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", marginBottom: 10 }}>POSSESSION</span>
      <div className="flex flex-col gap-2.5">
        {POSSESSION_DATA.map((pd, i) => {
          const pOpacity = interpolate(frame, [POSSESSION_WIDGET_START + 8 + i * 5, POSSESSION_WIDGET_START + 18 + i * 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={pd.team} className="flex items-center gap-2" style={{ opacity: pOpacity }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", width: 60 }}>{pd.team}</span>
              <div className="flex-1" style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${pd.pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${pd.color}, ${pd.color}80)` }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", width: 28, textAlign: "right" }}>{pd.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Charts Section ──────────────────────────────────────────

const ChartsSection: React.FC<{ frame: number; isFocused: boolean }> = ({ frame, isFocused }) => {
  const opacity = interpolate(frame, [CHARTS_START, CHARTS_START + 16], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CHARTS_START, CHARTS_START + 16], [14, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < CHARTS_START) return null;
  const focusScale = isFocused ? interpolate(frame, [FOCUS_CHARTS, FOCUS_CHARTS + 15], [0.97, 1.02], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const borderColor = isFocused ? "rgba(60, 160, 255, 0.15)" : "rgba(255,255,255,0.04)";

  const matchdayLabels = ["MD1", "MD2", "MD3", "MD4"];
  const goalsData = [5, 3, 7, 4];
  const barProgress = interpolate(frame, [CHARTS_START + 12, CHARTS_START + 40], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const maxGoals = Math.max(...goalsData);
  const avgGoals = interpolate(frame, [CHARTS_START + 25, CHARTS_START + 45], [0, 2.4], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gp = interpolate(frame, [COMPARISON_START, COMPARISON_START + 20], [0, 75], { easing: easing.crisp, extrapolateLeft: "clamp" });

  return (
    <div className="flex flex-col rounded-xl p-4" style={{ opacity, translate: `0 ${translateY}px`, scale: `${focusScale}`, border: `1px solid ${borderColor}`, background: isFocused ? "rgba(60, 160, 255, 0.03)" : "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", marginBottom: 8 }}>GOALS PER MATCHDAY</span>
      <div className="flex items-end gap-3" style={{ marginBottom: 12, height: 60 }}>
        {goalsData.map((g, i) => {
          const barH = interpolate(barProgress, [0, 1], [0, (g / maxGoals) * 50], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp" });
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa" }}>{Math.round(g * Math.min(1, barProgress / ((i + 1) / goalsData.length)))}</span>
              <div className="w-full" style={{ height: 50, borderRadius: 3, background: "rgba(255,255,255,0.03)", overflow: "hidden", position: "relative" }}>
                <div className="absolute bottom-0 w-full" style={{ height: `${barH}px`, borderRadius: 3, background: "linear-gradient(180deg, #60a5fa, #26c267)" }} />
              </div>
              <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>{matchdayLabels[i]}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between" style={{ paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Avg</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{avgGoals.toFixed(1)}</span>
          <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>goals/match</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Win %</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#26c267", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{Math.round(gp)}%</span>
        </div>
      </div>
    </div>
  );
};

// ── Activity Feed ──────────────────────────────────────────

const ActivityFeed: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [LIVE_INTEL_START, LIVE_INTEL_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < LIVE_INTEL_START) return null;

  const items = [
    { text: "Matchday 4 complete — 8 fixtures played", delay: 0 },
    { text: "Arsenal top the table with 10 points", delay: 12 },
    { text: "Havertz extends lead in Golden Boot race", delay: 24 },
    { text: "Possession averages updated across all teams", delay: 36 },
    { text: "Season statistics refreshed", delay: 48 },
  ];

  return (
    <div className="flex flex-col rounded-xl p-3.5" style={{ opacity, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 8 }}>LIVE INTELLIGENCE</span>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => {
          const itemOpacity = interpolate(frame, [LIVE_INTEL_START + 8 + item.delay, LIVE_INTEL_START + 18 + item.delay], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const translateX = interpolate(frame, [LIVE_INTEL_START + 8 + item.delay, LIVE_INTEL_START + 18 + item.delay], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} className="flex items-center gap-1.5" style={{ opacity: itemOpacity, translate: `${translateX}px 0` }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{item.text}</span>
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
  const blur = interpolate(frame, [0, SCOREBOARD_LOCK + 5, CARD_LIFT_END + 10, DASHBOARD_START + 50, TOTAL], [3, 1.5, 0.4, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth });
  return <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.3, pointerEvents: "none" }} />;
};

// ── Light Sweep ─────────────────────────────────────────────

const LightSweep: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = (frame % 300) / 300;
  const opacity = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 30], [0, 0.12], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xPos = interpolate(progress, [0, 1], [-10, 110]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacity * 0.12 }}>
      <div className="absolute top-0" style={{ left: `${xPos}%`, width: "25%", height: "100%", translate: "-50% 0", background: "linear-gradient(90deg, transparent, rgba(60, 160, 255, 0.025), transparent)", filter: "blur(40px)" }} />
    </AbsoluteFill>
  );
};

// ── Main Scene ──────────────────────────────────────────────

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraScale = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 50, DASHBOARD_START + 250], [1.08, 1.02, 1.05], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [DASHBOARD_START + 20, DASHBOARD_START + 100], [0, -1.5], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const orbitX = interpolate(frame, [DASHBOARD_START + 40, DASHBOARD_START + 180], [0, 2.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const focusPhase = frame >= FOCUS_CHARTS ? "charts" : frame >= FOCUS_POSSESSION ? "possession" : frame >= FOCUS_FORM ? "form" : frame >= FOCUS_SCORERS ? "scorers" : frame >= FOCUS_TABLE ? "table" : "none";

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <DashboardBg frame={frame} />

      {/* Phase 1: Match End Transition */}
      <MatchEndTransition frame={frame} />
      <BluePulse frame={frame} />
      <DataParticles frame={frame} />

      {/* Dashboard */}
      <div className="absolute inset-0" style={{ scale: `${cameraScale}`, translate: `${orbitX}px ${panY}px`, willChange: "transform" }}>
        <Sidebar frame={frame} />
        <Header frame={frame} />

        <div className="absolute" style={{ left: 200, right: 0, top: 52, bottom: 0, padding: "14px 24px", overflow: "hidden" }}>
          <StatCards frame={frame} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <LeagueTableWidget frame={frame} isFocused={focusPhase === "table"} />
            <TopScorersWidget frame={frame} isFocused={focusPhase === "scorers"} />
            <TeamFormWidget frame={frame} isFocused={focusPhase === "form"} />
            <PossessionWidget frame={frame} isFocused={focusPhase === "possession"} />
            <div style={{ gridColumn: "span 2" }}>
              <ChartsSection frame={frame} isFocused={focusPhase === "charts"} />
            </div>
          </div>

          <ActivityFeed frame={frame} />
        </div>
      </div>

      {/* Overlays */}
      <KineticTypography frame={frame} />
      <LightSweep frame={frame} />
      <DOF frame={frame} />
    </AbsoluteFill>
  );
};
