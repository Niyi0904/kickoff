import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing } from "../design-tokens";

const TOTAL = 510;
const REVEAL_START = 0;
const REVEAL_END = 25;
const CARDS_START = 20;
const CARDS_END = 65;
const SEARCH_START = 40;
const SEARCH_END = 55;
const GLIDE_START = 60;
const GLIDE_END = 110;
const ADD_START = 110;
const CLICK_FRAME = 130;
const MODAL_START = 128;
const FIELD1 = 140;
const FIELD2 = 150;
const FIELD3 = 160;
const FIELD4 = 170;
const MODAL_CONFIRM = 185;
const TEAM_APPEAR = 200;
const COUNTERS_START = 205;
const ORG_START = 230;
const LIVING_START = 280;
const TYPO_START = 350;
const READY_START = 440;
const FIXTURE_TRANSITION = 470;

const TYPO_LINES = [
  { text: "Every club welcomed.", start: TYPO_START, end: TYPO_START + 25 },
  { text: "Every player organized.", start: TYPO_START + 30, end: TYPO_START + 55 },
  { text: "Every team competition-ready.", start: TYPO_START + 60, end: TYPO_START + 85 },
  { text: "Built for leagues of every size.", start: TYPO_START + 90, end: TYPO_START + 115 },
];

const TEAMS_DATA = [
  { name: "Arsenal", abbr: "ARS", color: "#EF0107", players: 25, status: "Approved" as const, manager: "Mikel Arteta" },
  { name: "Chelsea", abbr: "CHE", color: "#034694", players: 24, status: "Approved" as const, manager: "Enzo Maresca" },
  { name: "Liverpool", abbr: "LIV", color: "#C8102E", players: 26, status: "Approved" as const, manager: "Arne Slot" },
  { name: "Man City", abbr: "MCI", color: "#6CABDD", players: 25, status: "Approved" as const, manager: "Pep Guardiola" },
  { name: "Man United", abbr: "MUN", color: "#DA291C", players: 24, status: "Approved" as const, manager: "Ruben Amorim" },
  { name: "Tottenham", abbr: "TOT", color: "#132257", players: 23, status: "Approved" as const, manager: "Ange Postecoglou" },
  { name: "Newcastle", abbr: "NEW", color: "#241F20", players: 24, status: "Pending" as const, manager: "Eddie Howe" },
  { name: "Aston Villa", abbr: "AVL", color: "#670E36", players: 25, status: "Pending" as const, manager: "Unai Emery" },
];

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Leagues", active: false },
  { label: "Fixtures", active: false },
  { label: "Standings", active: false },
  { label: "Teams", active: true },
  { label: "Players", active: false },
  { label: "Settings", active: false },
];

const DashboardBg: React.FC = () => (
  <AbsoluteFill>
    <div className="absolute inset-0" style={{ background: "#07130f" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(38,194,103,0.015) 0%, transparent 60%)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 65% 70%, rgba(60,140,255,0.015) 0%, transparent 50%)" }} />
  </AbsoluteFill>
);

const Sidebar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [REVEAL_START + 5, REVEAL_END + 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [REVEAL_START + 5, REVEAL_END + 5], [-20, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
        const itemOpacity = interpolate(frame, [REVEAL_START + 10 + i * 3, REVEAL_END + 10 + i * 3], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const translateY = interpolate(frame, [REVEAL_START + 10 + i * 3, REVEAL_END + 10 + i * 3], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-md px-3 py-2.5" style={{ opacity: itemOpacity, translate: `0 ${translateY}px`, background: item.active ? "rgba(38, 194, 103, 0.1)" : "transparent", marginBottom: 2 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.active ? "#26c267" : "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 13, fontWeight: item.active ? 700 : 500, color: item.active ? "white" : "rgba(255,255,255,0.55)" }}>{item.label}</span>
            {item.active && <div style={{ marginLeft: "auto", padding: "1px 6px", borderRadius: 4, background: "rgba(38, 194, 103, 0.2)", fontSize: 10, fontWeight: 600, color: "#26c267" }}>{TEAMS_DATA.length}</div>}
          </div>
        );
      })}
    </div>
  );
};

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [REVEAL_START + 10, REVEAL_END + 10], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [REVEAL_START + 10, REVEAL_END + 10], [-10, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className="absolute" style={{ left: 220, right: 0, top: 0, height: 60, opacity, translate: `0 ${translateY}px`, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px" }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>Teams</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Premier League</span>
      </div>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
};

const SearchBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [SEARCH_START, SEARCH_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [SEARCH_START, SEARCH_END], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 20, opacity, translate: `0 ${translateY}px` }}>
      <div className="flex items-center gap-3" style={{ flex: 1 }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ flex: 1, maxWidth: 320, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>Search teams...</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>All Teams</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    </div>
  );
};

const TeamCard: React.FC<{
  team: typeof TEAMS_DATA[0];
  index: number;
  frame: number;
  glideOffset: number;
  isNew: boolean;
}> = ({ team, index, frame, glideOffset, isNew }) => {
  const baseDelay = isNew ? 400 : CARDS_START;
  const cardStart = isNew ? baseDelay + (index % 2) * 6 : baseDelay + index * 6;
  const cardEnd = cardStart + 18;

  const opacity = interpolate(frame, [cardStart, cardEnd], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [cardStart, cardEnd], [24, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = interpolate(frame, [cardEnd + 20, TOTAL], [0, -1 + (index % 3) * 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glideX = isNew ? 0 : interpolate(frame, [GLIDE_START + glideOffset, GLIDE_END + glideOffset], [0, 3 - (index % 3) * 1.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoScale = interpolate(frame, [cardStart + 6, cardEnd], [0.6, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const playersCount = isNew ? 25 : Math.round(interpolate(frame, [cardStart + 12, cardEnd + 8], [0, team.players], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const liftHover = interpolate(frame, [GLIDE_START + index * 8, GLIDE_START + index * 8 + 15], [0, -2], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="rounded-xl p-5"
      style={{
        opacity,
        translate: `${glideX}px ${translateY + floatY + liftHover}px`,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        willChange: "transform, opacity",
      }}
    >
      <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl font-black"
          style={{
            scale: `${logoScale}`,
            background: `${team.color}20`,
            color: team.color,
            fontSize: 22,
            fontFamily: "Oswald, 'Arial Black', Impact, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {team.abbr}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{team.name}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{team.manager}</div>
        </div>
      </div>

      <div className="flex items-center gap-4" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{playersCount}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Players</div>
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.06)" }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>12</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Matches</div>
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div
          className="rounded-full px-2.5 py-0.5"
          style={{
            background: team.status === "Approved" ? "rgba(38, 194, 103, 0.12)" : "rgba(245, 200, 75, 0.12)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: team.status === "Approved" ? "#26c267" : "#f5c84b" }}>{team.status}</span>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-md px-2 py-1"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>Squad</span>
        </div>
      </div>
    </div>
  );
};

const AddTeamButton: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [CARDS_END - 5, CARDS_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [ADD_START, CLICK_FRAME], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickScale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 4
    ? interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 4], [1, 0.93], { easing: easing.crisp })
    : frame >= CLICK_FRAME + 4
      ? interpolate(frame, [CLICK_FRAME + 4, CLICK_FRAME + 10], [0.93, 1], { easing: easing.crisp })
      : 1;

  return (
    <div
      className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl font-bold"
      style={{
        opacity,
        scale: `${clickScale}`,
        background: "linear-gradient(135deg, #26c267, #1a8a4a)",
        color: "#06110d",
        fontSize: 14,
        fontWeight: 700,
        gridColumn: "span 2",
        boxShadow: glow > 0 ? `0 0 ${12 + glow * 20}px rgba(38, 194, 103, ${0.2 + glow * 0.3})` : "none",
        willChange: "transform, opacity",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
      Add Team
    </div>
  );
};

const TeamGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const sectionOpacity = interpolate(frame, [CARDS_START - 10, CARDS_START], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showNew = frame >= TEAM_APPEAR;
  const visibleTeams = showNew ? TEAMS_DATA : TEAMS_DATA.slice(0, 6);

  return (
    <div className="absolute" style={{ left: 220, right: 0, top: 60, bottom: 0, opacity: sectionOpacity, padding: "20px 28px", overflow: "hidden" }}>
      <h2 style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "0.02em", marginBottom: 16 }}>
        Team Management
      </h2>
      <SearchBar frame={frame} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {visibleTeams.map((team, i) => (
          <TeamCard key={team.name} team={team} index={i} frame={frame} glideOffset={i * 5} isNew={showNew && i >= 6} />
        ))}
        <AddTeamButton frame={frame} />
      </div>
      <StatsRow frame={frame} />
      <ActivityFeed frame={frame} />
    </div>
  );
};

const StatsRow: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [CARDS_END + 10, CARDS_END + 30], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const regCount = Math.round(interpolate(frame, [COUNTERS_START, COUNTERS_START + 30], [6, 8], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const regProgress = interpolate(frame, [COUNTERS_START, COUNTERS_START + 30], [30, 40], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const approvedCount = Math.round(interpolate(frame, [COUNTERS_START + 5, COUNTERS_START + 25], [4, 6], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <div className="flex gap-3" style={{ opacity }}>
      <div className="flex flex-1 items-center gap-3 rounded-lg p-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(38, 194, 103, 0.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{regCount}/20</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Teams Registered</div>
          <div style={{ width: 120, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 6 }}>
            <div style={{ width: `${regProgress}`, height: "100%", borderRadius: 2, background: "#26c267" }} />
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-3 rounded-lg p-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(38, 194, 103, 0.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{approvedCount}/8</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Approved</div>
          <div style={{ width: 120, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 6 }}>
            <div style={{ width: `${(approvedCount / 8) * 100}`, height: "100%", borderRadius: 2, background: "#26c267" }} />
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-3 rounded-lg p-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(245, 200, 75, 0.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>198</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Total Players</div>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [LIVING_START, LIVING_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < LIVING_START) return null;

  const items = [
    { text: "Newcastle United registration approved", time: "5m ago", delay: 0 },
    { text: "Aston Villa squad submitted (25 players)", time: "3m ago", delay: 10 },
    { text: "Premier League registration 40% complete", time: "1m ago", delay: 20 },
    { text: "Match schedule ready for generation", time: "30s ago", delay: 30 },
  ];

  return (
    <div style={{ opacity, marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Recent Activity</div>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const itemOpacity = interpolate(frame, [LIVING_START + 15 + item.delay, LIVING_START + 25 + item.delay], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const translateX = interpolate(frame, [LIVING_START + 15 + item.delay, LIVING_START + 25 + item.delay], [12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} className="flex items-center gap-3" style={{ opacity: itemOpacity, translate: `${translateX}px 0` }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#26c267", flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{item.text}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddTeamModal: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [MODAL_START, MODAL_START + 12], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(appear, [0, 1], [0.9, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const backdropOpacity = interpolate(appear, [0, 1], [0, 1], { easing: easing.smooth });
  if (frame < MODAL_START) return null;

  const confirmProgress = Math.max(0, frame - MODAL_CONFIRM) / 15;
  const confirmOpacity = interpolate(confirmProgress, [0, 1], [0, 1], { easing: easing.crisp });
  const exitProgress = Math.max(0, frame - MODAL_CONFIRM - 25) / 20;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { easing: easing.crisp });
  if (frame > MODAL_CONFIRM + 45) return null;

  const fields = [
    { label: "Club Name", value: "Aston Villa FC", start: FIELD1 },
    { label: "Club Abbreviation", value: "AVL", start: FIELD2 },
    { label: "Manager", value: "Unai Emery", start: FIELD3 },
    { label: "Home Stadium", value: "Villa Park", start: FIELD4 },
  ];

  const logoAppear = interpolate(frame, [FIELD1 - 5, FIELD1 + 5], [0, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const logoRotate = interpolate(frame, [FIELD1 - 5, FIELD1 + 10], [-30, 0], { easing: easing.smooth });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.5 * backdropOpacity * exitOpacity})`, backdropFilter: "blur(4px)" }} />
      <div
        className="absolute flex flex-col"
        style={{
          top: "50%", left: "50%", translate: "-50% -50%", width: 420,
          opacity: appear * exitOpacity, scale: `${scale * (exitProgress < 1 ? 1 - exitProgress * 0.05 : 0.95)}`,
          borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 26, 20, 0.95)", backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          padding: 28,
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>Register Club</span>
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 48, height: 48,
              background: "#670E3620",
              scale: `${logoAppear}`,
              rotate: `${logoRotate}deg`,
            }}
          >
            <span style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 20, fontWeight: 900, color: "#670E36" }}>AVL</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {fields.map((field) => {
            const fieldProgress = Math.max(0, frame - field.start) / 12;
            const opacity = interpolate(fieldProgress, [0, 0.5, 1], [0, 0.3, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const translateX = interpolate(fieldProgress, [0, 1], [-8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const checkOpacity = interpolate(fieldProgress, [0.7, 1], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const valueDisplay = fieldProgress >= 1 ? field.value : field.value.slice(0, Math.floor(fieldProgress * field.value.length));
            return (
              <div key={field.label} style={{ opacity, translate: `${translateX}px 0` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 4, letterSpacing: "0.05em" }}>{field.label}</div>
                <div className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "white" }}>
                    {valueDisplay}
                    {fieldProgress < 1 && fieldProgress > 0 && <span style={{ color: "#26c267", fontWeight: 700 }}>|</span>}
                  </span>
                  {fieldProgress >= 1 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: checkOpacity }}><path d="M20 6 9 17l-5-5" /></svg>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center rounded-lg py-3" style={{ marginTop: 20, background: "#26c267", color: "#06110d", opacity: confirmOpacity, fontWeight: 700, fontSize: 14 }}>
          {confirmProgress < 1 ? "Registering..." : "Club Registered ✓"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OrgLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [ORG_START, ORG_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < ORG_START || frame > ORG_START + 80) return null;

  const actions = [
    { label: "Team Registration", progress: 0, detail: "Newcastle United — Approved" },
    { label: "Team Approval", progress: 15, detail: "Aston Villa — Pending review" },
    { label: "Squad Submission", progress: 30, detail: "25 players registered" },
    { label: "Badge Upload", progress: 38, detail: "Club crests verified" },
  ];

  return (
    <div className="absolute" style={{ left: 248, right: 28, bottom: 20, opacity }}>
      <div className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Organization Progress</div>
        <div className="flex gap-6">
          {actions.map((action, i) => {
            const actOpacity = interpolate(frame, [ORG_START + 10 + i * 8, ORG_START + 20 + i * 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fillX = interpolate(frame, [ORG_START + 15 + i * 8, ORG_START + 35 + i * 8], [0, action.progress], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={action.label} className="flex flex-1 flex-col items-center" style={{ opacity: actOpacity }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(38, 194, 103, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, position: "relative" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: fillX >= action.progress ? 1 : 0.3 }}>
                    {i === 0 && <><path d="M5 12h14" /><path d="M12 5v14" /></>}
                    {i === 1 && <path d="M20 6 9 17l-5-5" />}
                    {i === 2 && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>}
                    {i === 3 && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>}
                  </svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>{action.label}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{action.detail}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ReadyNotification: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < READY_START) return null;
  const progress = interpolate(frame, [READY_START, READY_START + 20], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(progress, [0, 1], [0.8, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const opacity = interpolate(progress, [0, 1], [0, 1], { easing: easing.smooth });
  const glowPulse = interpolate(frame, [READY_START + 10, READY_START + 30, READY_START + 50], [0.3, 1, 0.3], { easing: easing.smooth });

  const fadeOut = interpolate(frame, [FIXTURE_TRANSITION - 15, FIXTURE_TRANSITION], [1, 0], { easing: easing.crisp });

  return (
    <div className="absolute flex items-center justify-center" style={{ top: "50%", left: "50%", translate: "-50% -50%", zIndex: 120, opacity: opacity * fadeOut, scale: `${scale}` }}>
      <div className="flex flex-col items-center rounded-2xl px-12 py-8" style={{ border: "1px solid rgba(38, 194, 103, 0.2)", background: "rgba(10, 26, 20, 0.95)", backdropFilter: "blur(24px)", boxShadow: `0 0 ${30 + glowPulse * 20}px rgba(38, 194, 103, ${0.1 + glowPulse * 0.15})` }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
        </svg>
        <span style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 32, fontWeight: 900, color: "white", letterSpacing: "0.05em" }}>League Ready</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>All teams registered · Ready for fixtures</span>
      </div>
    </div>
  );
};

const FixtureTransitionLines: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < FIXTURE_TRANSITION) return null;
  const progress = interpolate(frame, [FIXTURE_TRANSITION, TOTAL], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.3, 0.8, 1], [0, 0.5, 0.4, 0], { easing: easing.smooth });

  const pairs = [
    { x1: 10, y1: 20, x2: 90, y2: 40 },
    { x1: 15, y1: 50, x2: 85, y2: 60 },
    { x1: 20, y1: 70, x2: 80, y2: 30 },
    { x1: 30, y1: 15, x2: 70, y2: 80 },
    { x1: 40, y1: 35, x2: 60, y2: 65 },
    { x1: 5, y1: 60, x2: 95, y2: 45 },
    { x1: 25, y1: 75, x2: 75, y2: 25 },
    { x1: 50, y1: 10, x2: 50, y2: 90 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 110, opacity }}>
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {pairs.map((p, i) => {
          const draw = interpolate(progress, [0.05 + i * 0.02, 0.3 + i * 0.02], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x1 = interpolate(draw, [0, 1], [50, p.x1]);
          const y1 = interpolate(draw, [0, 1], [45, p.y1]);
          const x2 = interpolate(draw, [0, 1], [50, p.x2]);
          const y2 = interpolate(draw, [0, 1], [45, p.y2]);
          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgba(38, 194, 103, 0.12)"
              strokeWidth="0.8"
              strokeDasharray={i % 2 === 0 ? "none" : "4 4"}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const KineticLine: React.FC<{ text: string; start: number; end: number; currentFrame: number }> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;
  if (localFrame < 0) return null;
  const opacity = interpolate(localFrame, [0, duration * 0.35, duration * 0.6, duration], [0, 1, 1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(localFrame, [0, duration * 0.35], [18, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity, translate: `0 ${translateY}px`, display: "flex", justifyContent: "center" }}>
      <span style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 26, fontWeight: 400, color: "white", textAlign: "center", lineHeight: 1.4, letterSpacing: "0.02em" }}>{text}</span>
    </div>
  );
};

const KinTypography: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = TYPO_LINES.some((l) => frame >= l.start && frame < l.end + 15);
  if (!anyVisible) return null;
  return (
    <AbsoluteFill className="flex flex-col items-center justify-center" style={{ top: "44%", height: "auto", zIndex: 160 }}>
      <div className="flex flex-col items-center rounded-2xl px-10 py-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {TYPO_LINES.map((line) => <KineticLine key={line.text} text={line.text} start={line.start} end={line.end} currentFrame={frame} />)}
      </div>
    </AbsoluteFill>
  );
};

const MouseCursor: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [ADD_START, ADD_START + 6], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const disappear = interpolate(frame, [CLICK_FRAME + 15, CLICK_FRAME + 30], [1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const move = interpolate(frame, [ADD_START, CLICK_FRAME], [0, 1], { easing: Easing.bezier(0.45, 0, 0.55, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = interpolate(move, [0, 1], [1280, 1030]);
  const cy = interpolate(move, [0, 1], [200, 310]);
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

const DOF: React.FC<{ frame: number }> = ({ frame }) => {
  const blur = interpolate(frame, [0, 10, 25, TOTAL], [4, 1.5, 0.3, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth });
  return <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.35, pointerEvents: "none" }} />;
};

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const cameraScale = interpolate(frame, [REVEAL_START, REVEAL_END], [1.04, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [REVEAL_END, REVEAL_END + 60], [0, -1.5], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const revealOpacity = interpolate(frame, [REVEAL_START, REVEAL_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <div className="absolute inset-0" style={{ scale: `${cameraScale}`, translate: `0 ${panY}px`, opacity: revealOpacity }}>
        <DashboardBg />
        <Sidebar frame={frame} />
        <Header frame={frame} />
        <TeamGrid frame={frame} />
        <OrgLayer frame={frame} />
      </div>
      <AddTeamModal frame={frame} />
      <MouseCursor frame={frame} />
      <KinTypography frame={frame} />
      <ReadyNotification frame={frame} />
      <FixtureTransitionLines frame={frame} />
      <DOF frame={frame} />
    </AbsoluteFill>
  );
};
