import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing } from "../design-tokens";

const TOTAL = 540;
const NOTIF_START = 0;
const NOTIF_GLOW_PEAK = 20;
const NOTIF_FADE = 35;
const LINES_START = 25;
const LINES_END = 85;
const NETWORK_FORM_START = 45;
const MORPH_START = 75;
const MORPH_END = 115;
const DASHBOARD_START = 95;
const SIDEBAR_START = 100;
const HEADER_START = 105;
const CALENDAR_EXPAND_START = 115;
const FIXTURE_CARDS_START = 150;
const STATS_START = 185;
const STATS_END = 215;
const GENERATE_BTN_START = 200;
const GENERATE_GLOW_START = 230;
const CLICK_FRAME = 265;
const BLUE_PULSE_START = 265;
const BLUE_PULSE_END = 285;
const GEN_CONNECT_START = 270;
const GEN_CONNECT_END = 320;
const CARDS_GEN_START = 280;
const CALENDAR_FULL_END = 360;
const LIVE_START = 340;
const TYPO_START = 395;
const OUTRO_START = 510;

const TEAMS = [
  { name: "Arsenal", abbr: "ARS", color: "#EF0107" },
  { name: "Chelsea", abbr: "CHE", color: "#034694" },
  { name: "Liverpool", abbr: "LIV", color: "#C8102E" },
  { name: "Man City", abbr: "MCI", color: "#6CABDD" },
  { name: "Man United", abbr: "MUN", color: "#DA291C" },
  { name: "Tottenham", abbr: "TOT", color: "#132257" },
  { name: "Newcastle", abbr: "NEW", color: "#241F20" },
  { name: "Aston Villa", abbr: "AVL", color: "#670E36" },
];

const ROUNDS = [
  {
    label: "Matchday 1", date: "Aug 16",
    matches: [
      { home: 0, away: 1 }, { home: 2, away: 3 }, { home: 4, away: 5 }, { home: 6, away: 7 },
    ],
  },
  {
    label: "Matchday 2", date: "Aug 23",
    matches: [
      { home: 1, away: 2 }, { home: 3, away: 0 }, { home: 5, away: 6 }, { home: 7, away: 4 },
    ],
  },
  {
    label: "Matchday 3", date: "Aug 30",
    matches: [
      { home: 0, away: 2 }, { home: 3, away: 1 }, { home: 4, away: 6 }, { home: 5, away: 7 },
    ],
  },
  {
    label: "Matchday 4", date: "Sep 13",
    matches: [
      { home: 1, away: 0 }, { home: 2, away: 3 }, { home: 6, away: 4 }, { home: 7, away: 5 },
    ],
  },
  {
    label: "Matchday 5", date: "Sep 20",
    matches: [
      { home: 0, away: 3 }, { home: 2, away: 1 }, { home: 4, away: 7 }, { home: 6, away: 5 },
    ],
  },
  {
    label: "Matchday 6", date: "Sep 27",
    matches: [
      { home: 1, away: 4 }, { home: 3, away: 6 }, { home: 5, away: 0 }, { home: 7, away: 2 },
    ],
  },
  {
    label: "Matchday 7", date: "Oct 4",
    matches: [
      { home: 0, away: 5 }, { home: 2, away: 6 }, { home: 4, away: 1 }, { home: 3, away: 7 },
    ],
  },
  {
    label: "Matchday 8", date: "Oct 11",
    matches: [
      { home: 1, away: 6 }, { home: 3, away: 5 }, { home: 7, away: 0 }, { home: 2, away: 4 },
    ],
  },
];

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Leagues", active: false },
  { label: "Fixtures", active: true },
  { label: "Standings", active: false },
  { label: "Teams", active: false },
  { label: "Players", active: false },
  { label: "Settings", active: false },
];

// ── Phase 1: League Ready Notification ──────────────────────────

const LeagueReadyNotification: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame > NOTIF_FADE + 15) return null;

  const appear = interpolate(frame, [NOTIF_START, NOTIF_START + 12], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [NOTIF_FADE, NOTIF_FADE + 15], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(appear, [0, 1], [0.85, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const glowIntensity = interpolate(frame, [NOTIF_START, NOTIF_GLOW_PEAK, NOTIF_FADE], [0, 1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowPulse = interpolate(frame, [NOTIF_START + 5, NOTIF_START + 18, NOTIF_START + 30], [0.2, 0.8, 0.2], { easing: easing.smooth });

  return (
    <div className="absolute flex items-center justify-center" style={{ top: "50%", left: "50%", translate: "-50% -50%", zIndex: 200, opacity: appear * fadeOut, scale: `${scale}` }}>
      <div
        className="flex flex-col items-center rounded-2xl px-14 py-10"
        style={{
          border: `1px solid rgba(60, 160, 255, ${0.1 + glowPulse * 0.2})`,
          background: "rgba(10, 26, 20, 0.96)",
          backdropFilter: "blur(24px)",
          boxShadow: `
            0 0 ${30 + glowIntensity * 40}px rgba(60, 160, 255, ${0.08 + glowPulse * 0.15}),
            0 0 ${60 + glowIntensity * 60}px rgba(60, 160, 255, ${0.04 + glowPulse * 0.08}),
            0 24px 80px rgba(0,0,0,0.5)
          `,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, filter: `blur(${glowPulse * 1}px)` }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
        </svg>
        <span style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 38, fontWeight: 900, color: "white", letterSpacing: "0.08em" }}>LEAGUE READY</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginTop: 8, letterSpacing: "0.02em" }}>All teams registered — scheduling begins</span>
      </div>
    </div>
  );
};

// ── Phase 1→2: Network Connection Lines ─────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const NetworkLines: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [LINES_START, LINES_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [MORPH_START, MORPH_END], [1, 0], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (progress <= 0 || fadeOut <= 0) return null;

  const cx = 640;
  const cy = 360;
  const radius = 220;

  const nodes = TEAMS.map((team, i) => {
    const angle = (i / TEAMS.length) * Math.PI * 2 - Math.PI / 2;
    const r = radius + (i % 3 - 1) * 25;
    return {
      abbr: team.abbr,
      color: team.color,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * 0.7,
      angle,
    };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 150, opacity: fadeOut }}>
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(60, 160, 255, 0.08)" />
            <stop offset="50%" stopColor="rgba(60, 160, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(38, 194, 103, 0.08)" />
          </linearGradient>
        </defs>

        {nodes.map((node, i) => {
          const next = (i + 1) % nodes.length;
          const formProg = interpolate(frame, [NETWORK_FORM_START + i * 2, NETWORK_FORM_START + 8 + i * 2], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const drawLen = interpolate(formProg, [0, 1], [0, 1], { easing: easing.smooth });

          return (
            <line
              key={`ring-${i}`}
              x1={node.x}
              y1={node.y}
              x2={node.x + (nodes[next].x - node.x) * drawLen}
              y2={node.y + (nodes[next].y - node.y) * drawLen}
              stroke="url(#lineGrad)"
              strokeWidth="0.6"
            />
          );
        })}

        {[...Array(4)].map((_, roundIdx) => {
          const round = ROUNDS[roundIdx];
          if (!round) return null;
          const roundProg = interpolate(frame, [NETWORK_FORM_START + 15 + roundIdx * 6, NETWORK_FORM_START + 30 + roundIdx * 6], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return round.matches.map((match, mIdx) => {
            const from = nodes[match.home];
            const to = nodes[match.away];
            const draw = interpolate(roundProg, [0, 1], [0, 1], { easing: easing.smooth });
            const mx = from.x + (to.x - from.x) * draw;
            const my = from.y + (to.y - from.y) * draw;
            const dashOffset = interpolate(draw, [0, 1], [200, 0], { easing: easing.smooth });

            return (
              <line
                key={`match-${roundIdx}-${mIdx}`}
                x1={from.x}
                y1={from.y}
                x2={mx}
                y2={my}
                stroke="rgba(60, 160, 255, 0.12)"
                strokeWidth="1"
                strokeDasharray="4 3"
                strokeDashoffset={dashOffset}
              />
            );
          });
        })}
      </svg>

      {nodes.map((node, i) => {
        const nodeProg = interpolate(frame, [LINES_START + 10 + i * 3, LINES_START + 20 + i * 3], [0, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const s = interpolate(nodeProg, [0, 1], [0, 1], { easing: easing.crisp });

        return (
          <div
            key={node.abbr}
            className="absolute flex items-center justify-center rounded-xl font-black"
            style={{
              left: node.x - 24, top: node.y - 24, width: 48, height: 48,
              scale: `${s}`,
              opacity: nodeProg * fadeOut,
              background: `${node.color}18`,
              border: `1px solid ${node.color}30`,
              color: node.color,
              fontSize: 16,
              fontFamily: "Oswald, 'Arial Black', Impact, sans-serif",
              letterSpacing: "0.02em",
              boxShadow: `0 0 20px ${node.color}10`,
            }}
          >
            {node.abbr}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Phase 2→3: Dashboard ────────────────────────────────────────

const DashboardBg: React.FC<{ frame: number }> = ({ frame }) => {
  const cx = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 120], [55, 52], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blueIntensity = interpolate(frame, [NOTIF_START, NOTIF_FADE, DASHBOARD_START, DASHBOARD_START + 60], [0, 0.3, 0.5, 0.15], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div className="absolute inset-0" style={{ background: "#07130f" }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 55% at ${cx}% 28%, rgba(38,194,103,0.018) 0%, transparent 60%)` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 60%, rgba(60,160,255,${0.01 + blueIntensity * 0.02}) 0%, transparent 50%)` }} />
    </AbsoluteFill>
  );
};

const Sidebar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [SIDEBAR_START, SIDEBAR_START + 20], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [SIDEBAR_START, SIDEBAR_START + 20], [-24, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 220, opacity, translate: `${translateX}px 0`, borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(10, 26, 20, 0.95)", backdropFilter: "blur(20px)", padding: "20px 12px" }}>
      <div className="flex items-center gap-2.5" style={{ padding: "0 8px", marginBottom: 32 }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: "#26c267" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 6 12 8.5V4l8 6-8 6v-4.5C9 11 7 13 4.5 13a2.5 2.5 0 0 1 0-5H6" />
          </svg>
        </div>
        <span style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 18, fontWeight: 900, color: "white", letterSpacing: "0.05em" }}>KICKOFF</span>
      </div>
      {NAV_ITEMS.map((item, i) => {
        const itemOpacity = interpolate(frame, [SIDEBAR_START + 6 + i * 3, SIDEBAR_START + 20 + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const itemY = interpolate(frame, [SIDEBAR_START + 6 + i * 3, SIDEBAR_START + 20 + i * 3], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-md px-3 py-2.5" style={{ opacity: itemOpacity, translate: `0 ${itemY}px`, background: item.active ? "rgba(60, 160, 255, 0.08)" : "transparent", marginBottom: 2 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.active ? "#60a5fa" : "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 13, fontWeight: item.active ? 700 : 500, color: item.active ? "white" : "rgba(255,255,255,0.55)" }}>{item.label}</span>
            {item.active && <div style={{ marginLeft: "auto", padding: "1px 6px", borderRadius: 4, background: "rgba(60, 160, 255, 0.15)", fontSize: 10, fontWeight: 600, color: "#60a5fa" }}>8</div>}
          </div>
        );
      })}
    </div>
  );
};

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [HEADER_START, HEADER_START + 18], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [HEADER_START, HEADER_START + 18], [-10, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className="absolute" style={{ left: 220, right: 0, top: 0, height: 56, opacity, translate: `0 ${translateY}px`, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px" }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>Premier League</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Fixtures & Scheduling</span>
      </div>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
};

// ── Phase 3→4: Calendar Expansion ───────────────────────────────

const CalendarExpanding: React.FC<{ frame: number; totalRounds: number }> = ({ frame, totalRounds }) => {
  const opacity = interpolate(frame, [CALENDAR_EXPAND_START, CALENDAR_EXPAND_START + 10], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CALENDAR_EXPAND_START, CALENDAR_EXPAND_START + 12], [14, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const visibleRounds = Math.min(totalRounds, Math.floor(interpolate(frame, [CALENDAR_EXPAND_START, CALENDAR_FULL_END], [1, 8], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  return (
    <div style={{ opacity, translate: `0 ${translateY}px`, marginBottom: 18 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <h2 style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 20, fontWeight: 900, color: "white", letterSpacing: "0.02em" }}>
          Season Calendar
        </h2>
        <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
          {visibleRounds} ROUNDS SCHEDULED
        </div>
      </div>
      <div className="flex gap-2.5" style={{ overflow: "hidden" }}>
        {ROUNDS.slice(0, visibleRounds).map((round, i) => {
          const mdOpacity = interpolate(frame, [CALENDAR_EXPAND_START + 8 + i * 5, CALENDAR_EXPAND_START + 20 + i * 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const mdY = interpolate(frame, [CALENDAR_EXPAND_START + 8 + i * 5, CALENDAR_EXPAND_START + 20 + i * 5], [10, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const active = i < 4;
          return (
            <div key={round.label} className="flex flex-1 flex-col items-center rounded-lg py-2.5 px-2" style={{ opacity: mdOpacity, translate: `0 ${mdY}px`, border: `1px solid ${active ? "rgba(60, 160, 255, 0.1)" : "rgba(255,255,255,0.03)"}`, background: active ? "rgba(60, 160, 255, 0.04)" : "transparent" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)", letterSpacing: "0.04em", marginBottom: 2 }}>{round.label.toUpperCase()}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", marginBottom: 6 }}>{round.date}</div>
              <div className="flex gap-1">
                {round.matches.map((m, j) => {
                  const dotProg = interpolate(frame, [CALENDAR_EXPAND_START + 20 + i * 5 + j * 3, CALENDAR_EXPAND_START + 28 + i * 5 + j * 3], [0, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
                  return (
                    <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", scale: `${dotProg}`, background: active ? "#60a5fa" : "rgba(255,255,255,0.08)" }} />
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

// ── Phase 4: Fixture Cards ──────────────────────────────────────

const FixtureCard: React.FC<{
  homeIdx: number; awayIdx: number; roundLabel: string; date: string;
  index: number; frame: number; phaseStart: number;
}> = ({ homeIdx, awayIdx, roundLabel, date, index, frame, phaseStart }) => {
  const home = TEAMS[homeIdx];
  const away = TEAMS[awayIdx];
  const cardStart = phaseStart + index * 5;
  const cardEnd = cardStart + 16;

  const opacity = interpolate(frame, [cardStart, cardEnd], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [cardStart, cardEnd], [22, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = interpolate(frame, [cardEnd + 30, TOTAL], [0, -0.6 + (index % 4) * 0.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const homeScale = interpolate(frame, [cardStart + 4, cardEnd - 4], [0.7, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const awayScale = interpolate(frame, [cardStart + 8, cardEnd], [0.7, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });

  return (
    <div
      className="flex flex-col rounded-xl p-3.5"
      style={{
        opacity, translate: `0 ${translateY + floatY}px`,
        border: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        willChange: "transform, opacity",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{roundLabel.toUpperCase()} · {date}</span>
      </div>
      <div className="flex items-center gap-2.5" style={{ marginBottom: 4, scale: `${homeScale}` }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg font-black" style={{ background: `${home.color}18`, color: home.color, fontSize: 12, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{home.abbr}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{home.name}</span>
      </div>
      <div className="flex items-center gap-2.5" style={{ scale: `${awayScale}` }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg font-black" style={{ background: `${away.color}18`, color: away.color, fontSize: 12, fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{away.abbr}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{away.name}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>vs</span>
      </div>
    </div>
  );
};

const FixtureGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const visibleRounds = 2;
  const initialMatches = ROUNDS.slice(0, visibleRounds).flatMap((r) => r.matches);
  const genStarted = frame >= CARDS_GEN_START;
  const genRounds = genStarted ? Math.min(Math.floor((frame - CARDS_GEN_START) / 20) + 1, ROUNDS.length - visibleRounds) : 0;
  const genMatches = ROUNDS.slice(visibleRounds, visibleRounds + genRounds).flatMap((r) => r.matches);

  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>UPCOMING FIXTURES</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>{visibleRounds + genRounds} of {ROUNDS.length} rounds</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        {initialMatches.map((m, i) => (
          <FixtureCard
            key={`init-${i}`}
            homeIdx={m.home} awayIdx={m.away}
            roundLabel={ROUNDS[Math.floor(i / 4)].label}
            date={ROUNDS[Math.floor(i / 4)].date}
            index={i} frame={frame}
            phaseStart={FIXTURE_CARDS_START}
          />
        ))}
        {genMatches.map((m, i) => {
          const globalGenIndex = initialMatches.length + i;
          return (
            <FixtureCard
              key={`gen-${i}`}
              homeIdx={m.home} awayIdx={m.away}
              roundLabel={ROUNDS[visibleRounds + Math.floor(i / 4)].label}
              date={ROUNDS[visibleRounds + Math.floor(i / 4)].date}
              index={globalGenIndex} frame={frame}
              phaseStart={CARDS_GEN_START}
            />
          );
        })}
      </div>
    </div>
  );
};

// ── Stats ───────────────────────────────────────────────────────

const FixtureStats: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [STATS_START, STATS_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const genActive = frame >= CARDS_GEN_START;
  const genProg = genActive ? interpolate(frame, [CARDS_GEN_START, CARDS_GEN_START + 60], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const stats = [
    { label: "Matches Scheduled", value: 32, base: 8, icon: "calendar" },
    { label: "Rounds Complete", value: 8, base: 2, icon: "layers" },
    { label: "Teams", value: 8, base: 8, icon: "users" },
    { label: "Matchdays", value: 8, base: 2, icon: "clock" },
  ];

  return (
    <div className="flex gap-2.5" style={{ opacity, marginBottom: 14 }}>
      {stats.map((stat, i) => {
        const stOpacity = interpolate(frame, [STATS_START + i * 3, STATS_END + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const countActive = Math.round(interpolate(frame, [STATS_START + 6 + i * 3, STATS_END + 6 + i * 3], [0, stat.base], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
        const finalCount = genActive
          ? Math.round(interpolate(genProg, [0.1 + i * 0.1, 0.6 + i * 0.1], [stat.base, stat.value], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
          : countActive;
        const count = genActive && genProg > 0.1 + i * 0.1 ? finalCount : countActive;

        return (
          <div key={stat.label} className="flex flex-1 items-center gap-2.5 rounded-lg p-2.5" style={{ opacity: stOpacity, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(60, 160, 255, 0.08)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {i === 0 && <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>}
                {i === 1 && <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>}
                {i === 2 && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                {i === 3 && <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{count}</div>
              <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Generate Button ─────────────────────────────────────────────

const GenerateButton: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [GENERATE_BTN_START, GENERATE_BTN_START + 14], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [GENERATE_GLOW_START, CLICK_FRAME], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickScale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 4
    ? interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 4], [1, 0.93], { easing: easing.crisp })
    : frame >= CLICK_FRAME + 4
      ? interpolate(frame, [CLICK_FRAME + 4, CLICK_FRAME + 10], [0.93, 1], { easing: easing.crisp })
      : 1;

  if (frame > CLICK_FRAME + 20) return null;

  return (
    <div
      className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl font-bold"
      style={{
        opacity, scale: `${clickScale}`,
        background: "linear-gradient(135deg, #26c267, #1a8a4a)",
        color: "#06110d", fontSize: 13, fontWeight: 700,
        boxShadow: `0 0 ${12 + glow * 24}px rgba(38, 194, 103, ${0.15 + glow * 0.3}), 0 0 ${glow * 40}px rgba(60, 160, 255, ${glow * 0.1})`,
        willChange: "transform, opacity",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" x2="12" y1="18" y2="12" /><line x1="9" x2="15" y1="15" y2="15" />
      </svg>
      Generate Full Schedule
    </div>
  );
};

// ── Blue Pulse Effect ──────────────────────────────────────────

const BluePulse: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < BLUE_PULSE_START || frame > BLUE_PULSE_END + 20) return null;
  const progress = interpolate(frame, [BLUE_PULSE_START, BLUE_PULSE_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.3, 0.8, 1], [0, 0.3, 0.15, 0], { easing: easing.smooth });
  const scale = interpolate(progress, [0, 1], [0.1, 2.5], { easing: easing.smooth });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, zIndex: 100 }}>
      <div
        className="absolute"
        style={{
          top: "50%", left: "38%",
          width: 200, height: 200,
          translate: "-50% -50%",
          scale: `${scale}`,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(60, 160, 255, 0.12) 0%, rgba(60, 160, 255, 0.04) 30%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "50%", left: "38%",
          width: 100, height: 100,
          translate: "-50% -50%",
          scale: `${scale}`,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(60, 160, 255, 0.08) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Generation Connection Lines ─────────────────────────────────

const GenerationLines: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < GEN_CONNECT_START) return null;
  const progress = interpolate(frame, [GEN_CONNECT_START, GEN_CONNECT_END], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 0.4, 0.3, 0], { easing: easing.smooth });

  const teamXPositions = [280, 380, 480, 580, 680, 780, 880, 980];
  const centerY = 360;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90, opacity }}>
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {[...Array(12)].map((_, i) => {
          const from = Math.floor(seededRandom(i * 7) * 8);
          let to = Math.floor(seededRandom(i * 7 + 3) * 8);
          if (to === from) to = (from + 1) % 8;
          const draw = interpolate(progress, [0.05 + i * 0.02, 0.2 + i * 0.02], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x1 = teamXPositions[from];
          const y1 = centerY + (from - 3.5) * 30;
          const x2 = teamXPositions[to];
          const y2 = centerY + (to - 3.5) * 30;
          const mx = x1 + (x2 - x1) * draw;
          const my = y1 + (y2 - y1) * draw;
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={mx} y2={my}
              stroke="rgba(60, 160, 255, 0.08)"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              strokeDashoffset={interpolate(draw, [0, 1], [100, 0])}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── Live Activity ──────────────────────────────────────────────

const LiveActivity: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [LIVE_START, LIVE_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < LIVE_START) return null;

  const items = [
    { text: "32 fixtures scheduled across 8 matchdays", time: "just now", delay: 0 },
    { text: "Round 4 — Sep 13: Tottenham vs Newcastle", time: "30s ago", delay: 14 },
    { text: "Round 5 — Sep 20: Arsenal vs Man City", time: "1m ago", delay: 28 },
    { text: "Schedule generation complete", time: "2m ago", delay: 42 },
  ];

  return (
    <div style={{ opacity }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>SCHEDULING ACTIVITY</span>
        <div className="flex items-center gap-1.5" style={{ fontSize: 9, fontWeight: 600, color: "#60a5fa" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#60a5fa" }} />
          Live
        </div>
      </div>
      <div className="flex flex-col gap-1.5" style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        {items.map((item, i) => {
          const itemOpacity = interpolate(frame, [LIVE_START + 8 + item.delay, LIVE_START + 18 + item.delay], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const translateX = interpolate(frame, [LIVE_START + 8 + item.delay, LIVE_START + 18 + item.delay], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} className="flex items-center gap-2" style={{ opacity: itemOpacity, translate: `${translateX}px 0` }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: i === 0 ? "#60a5fa" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{item.text}</span>
              <span style={{ fontSize: 8, fontWeight: 500, color: "rgba(255,255,255,0.2)", marginLeft: "auto", flexShrink: 0 }}>{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Kinetic Typography ──────────────────────────────────────────

const TYPO_LINES = [
  { text: "Fixtures generated automatically.", start: TYPO_START, end: TYPO_START + 30 },
  { text: "Every match perfectly scheduled.", start: TYPO_START + 34, end: TYPO_START + 64 },
  { text: "Every competition stays organized.", start: TYPO_START + 68, end: TYPO_START + 98 },
  { text: "Spend less time planning.", start: TYPO_START + 102, end: TYPO_START + 125 },
  { text: "More time growing the game.", start: TYPO_START + 129, end: TOTAL - 10 },
];

const KineticLine: React.FC<{ text: string; start: number; end: number; currentFrame: number }> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;
  if (localFrame < 0) return null;
  const opacity = interpolate(localFrame, [0, duration * 0.25, duration * 0.7, duration], [0, 1, 1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(localFrame, [0, duration * 0.25], [16, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ── Mouse Cursor ────────────────────────────────────────────────

const MouseCursor: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [GENERATE_GLOW_START, GENERATE_GLOW_START + 6], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const disappear = interpolate(frame, [CLICK_FRAME + 15, CLICK_FRAME + 30], [1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const move = interpolate(frame, [GENERATE_GLOW_START, CLICK_FRAME], [0, 1], { easing: Easing.bezier(0.45, 0, 0.55, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = interpolate(move, [0, 1], [1280, 1050]);
  const cy = interpolate(move, [0, 1], [180, 575]);
  const clickScale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 3
    ? interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 3], [1, 0.85], { easing: easing.crisp })
    : frame >= CLICK_FRAME + 3
      ? interpolate(frame, [CLICK_FRAME + 3, CLICK_FRAME + 8], [0.85, 1], { easing: easing.crisp })
      : 1;
  const opacity = appear * disappear;
  if (opacity < 0.01) return null;
  return (
    <div className="absolute" style={{ left: cx, top: cy, opacity, scale: `${clickScale}`, pointerEvents: "none", zIndex: 200, translate: "-50% -50%" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /></svg>
    </div>
  );
};

// ── Light Sweep ────────────────────────────────────────────────

const LightSweep: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = (frame % 300) / 300;
  const opacity = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 20, DASHBOARD_START + 100], [0, 0.3, 0.15], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const xPos = interpolate(progress, [0, 1], [-10, 110]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacity * 0.12 }}>
      <div className="absolute top-0" style={{ left: `${xPos}%`, width: "30%", height: "100%", translate: "-50% 0", background: "linear-gradient(90deg, transparent, rgba(60, 160, 255, 0.025), transparent)", filter: "blur(40px)" }} />
    </AbsoluteFill>
  );
};

// ── Depth of Field ─────────────────────────────────────────────

const DOF: React.FC<{ frame: number }> = ({ frame }) => {
  const blur = interpolate(frame, [0, 12, NOTIF_FADE, NOTIF_FADE + 20, DASHBOARD_START + 40, OUTRO_START, TOTAL], [4, 3, 1, 0.4, 0.4, 0.2, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth });
  return <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.3, pointerEvents: "none" }} />;
};

// ── Glowing Notification (outro) ───────────────────────────────

const LeagueStatus: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [LIVE_START + 30, LIVE_START + 45], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < LIVE_START + 30) return null;
  return (
    <div className="absolute flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ right: 28, bottom: 20, opacity, border: "1px solid rgba(38, 194, 103, 0.12)", background: "rgba(38, 194, 103, 0.06)" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#26c267" }}>Schedule Active — {ROUNDS.length} Rounds</span>
    </div>
  );
};

// ── Main Scene ─────────────────────────────────────────────────

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraScale = interpolate(frame, [NOTIF_FADE, DASHBOARD_START + 40, DASHBOARD_START + 120, GENERATE_BTN_START + 40], [1.1, 1, 1.02, 1.04], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 80], [0, -2], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const orbitX = interpolate(frame, [DASHBOARD_START + 60, DASHBOARD_START + 200], [0, 3], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dashFade = interpolate(frame, [DASHBOARD_START, DASHBOARD_START + 20, MORPH_END + 20, MORPH_END + 40], [0, 1, 1, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const totalVisibleRounds = Math.floor(interpolate(frame, [CALENDAR_EXPAND_START, CALENDAR_FULL_END], [1, 8], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      {/* Background */}
      <DashboardBg frame={frame} />

      {/* Phase 1: League Ready Notification */}
      <LeagueReadyNotification frame={frame} />

      {/* Phase 1→2: Network Lines */}
      <NetworkLines frame={frame} />

      {/* Dashboard Content */}
      <div
        className="absolute inset-0"
        style={{
          scale: `${cameraScale}`,
          translate: `${orbitX}px ${panY}px`,
          opacity: dashFade,
          willChange: "transform, opacity",
        }}
      >
        <Sidebar frame={frame} />
        <Header frame={frame} />

        <div className="absolute" style={{ left: 220, right: 0, top: 56, bottom: 0, padding: "18px 28px", overflow: "hidden" }}>
          <CalendarExpanding frame={frame} totalRounds={totalVisibleRounds} />
          <FixtureGrid frame={frame} />
          <FixtureStats frame={frame} />
          <GenerateButton frame={frame} />
          <LiveActivity frame={frame} />
          <LeagueStatus frame={frame} />
        </div>
      </div>

      {/* Generation Effects */}
      <BluePulse frame={frame} />
      <GenerationLines frame={frame} />

      {/* UI Overlays */}
      <MouseCursor frame={frame} />
      <KineticTypography frame={frame} />

      {/* Ambient Effects */}
      <LightSweep frame={frame} />
      <DOF frame={frame} />
    </AbsoluteFill>
  );
};
