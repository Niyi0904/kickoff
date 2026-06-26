import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { easing } from "../design-tokens";

const TOTAL = 480;
const REVEAL_START = 0;
const REVEAL_END = 25;
const ZOOM_START = 15;
const ZOOM_END = 55;
const CARDS_START = 45;
const CARDS_END = 90;
const STATS_START = 80;
const STATS_END = 105;
const CURSOR_MOVE_START = 120;
const CLICK_FRAME = 155;
const MODAL_START = 150;
const FIELD1 = 165;
const FIELD2 = 180;
const FIELD3 = 195;
const FIELD4 = 210;
const FIELD5 = 220;
const FIELD6 = 230;
const FIELD7 = 240;
const MODAL_CONFIRM = 255;
const SETTINGS_START = 260;
const TOGGLE1 = 280;
const TOGGLE2 = 290;
const TOGGLE3 = 300;
const MORPH_START = 310;
const LIVING_START = 340;
const TYPO_START = 370;
const TYPO1_END = 395;
const TYPO2_START = 400;
const TYPO2_END = 425;
const TYPO3_START = 430;
const TYPO3_END = 450;

const TYPO_LINES = [
  { text: "Create leagues in minutes.", start: TYPO_START, end: TYPO1_END },
  { text: "Configure every competition.", start: TYPO2_START, end: TYPO2_END },
  { text: "Automate the hard work.", start: TYPO3_START, end: TYPO3_END },
  { text: "Focus on the game.", start: 455, end: 475 },
];

const LEAGUES = [
  { name: "Premier League", season: "2024/25", teams: 20, status: "Active", color: "#26c267" },
  { name: "Championship", season: "2024/25", teams: 24, status: "Active", color: "#f5c84b" },
  { name: "League One", season: "2024/25", teams: 24, status: "Draft", color: "#60a5fa" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid" },
  { label: "Leagues", icon: "trophy", active: true },
  { label: "Fixtures", icon: "calendar" },
  { label: "Standings", icon: "bar" },
  { label: "Teams", icon: "users" },
  { label: "Players", icon: "person" },
  { label: "Settings", icon: "gear" },
];

const DashboardBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const cx = interpolate(frame, [0, TOTAL], [50, 51.5], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div className="absolute inset-0" style={{ background: "#07130f" }} />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 60% at ${cx}% 30%,
              rgba(38, 194, 103, 0.02) 0%,
              transparent 60%
            )
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 50% 40% at 60% 70%,
              rgba(60, 140, 255, 0.015) 0%,
              transparent 50%
            )
          `,
        }}
      />
    </AbsoluteFill>
  );
};

const Sidebar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [REVEAL_START + 5, REVEAL_END + 5], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [REVEAL_START + 5, REVEAL_END + 5], [-20, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="absolute"
      style={{
        left: 0, top: 0, bottom: 0, width: 220,
        opacity, translate: `${translateX}px 0`,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10, 26, 20, 0.95)",
        backdropFilter: "blur(20px)",
        padding: "20px 12px",
        willChange: "translate, opacity",
      }}
    >
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
        const itemY = interpolate(frame, [REVEAL_START + 10 + i * 3, REVEAL_END + 10 + i * 3], [8, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-md px-3 py-2.5"
            style={{
              opacity: itemOpacity,
              translate: `0 ${itemY}px`,
              background: item.active ? "rgba(38, 194, 103, 0.1)" : "transparent",
              marginBottom: 2,
            }}
          >
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.active ? "#26c267" : "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 13, fontWeight: item.active ? 700 : 500, color: item.active ? "white" : "rgba(255,255,255,0.55)" }}>
              {item.label}
            </span>
            {item.active && (
              <div style={{ marginLeft: "auto", padding: "1px 6px", borderRadius: 4, background: "rgba(38, 194, 103, 0.2)", fontSize: 10, fontWeight: 600, color: "#26c267" }}>
                3
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MainHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [ZOOM_START, ZOOM_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [ZOOM_START, ZOOM_END], [-10, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="absolute"
      style={{
        left: 220, right: 0, top: 0, height: 60,
        opacity, translate: `0 ${translateY}px`,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        willChange: "translate, opacity",
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>Leagues</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>All Leagues</span>
      </div>
      <div className="flex items-center gap-3">
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(38, 194, 103, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const LeagueCard: React.FC<{
  league: typeof LEAGUES[0];
  index: number;
  frame: number;
  isZoomed: boolean;
}> = ({ league, index, frame, isZoomed }) => {
  const CARD_START = CARDS_START + index * 8;
  const opacity = interpolate(frame, [CARD_START, CARD_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [CARD_START, CARD_START + 20], [24, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = interpolate(frame, [CARD_START + 30, TOTAL], [0, -1.5 + index * 1.2], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(frame, [CARD_START + 12, CARD_START + 22], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const teamsCount = Math.round(interpolate(frame, [CARD_START + 18, CARD_START + 35], [0, league.teams], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const zoomScale = isZoomed ? interpolate(frame, [ZOOM_START, ZOOM_END], [1, 0.85], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        opacity,
        translate: `0 ${translateY + floatY}px`,
        scale: `${zoomScale}`,
        border: `1px solid rgba(255,255,255,${isZoomed ? 0.1 : 0.06})`,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        willChange: "transform, opacity",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: `${league.color}20` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={league.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{league.name}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{league.season}</div>
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1"
          style={{
            opacity: badgeOpacity,
            background: league.status === "Active" ? "rgba(38, 194, 103, 0.15)" : "rgba(96, 165, 250, 0.15)",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: league.status === "Active" ? "#26c267" : "#60a5fa" }}>
            {league.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4" style={{ marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{teamsCount}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Teams</div>
        </div>
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{league.status === "Active" ? "38" : "—"}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Matches</div>
        </div>
      </div>
    </div>
  );
};

const CreateLeagueButton: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [CARDS_END - 10, CARDS_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [CURSOR_MOVE_START, CLICK_FRAME], [0, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const clickScale = interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 4], [1, 0.93], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickRestore = interpolate(frame, [CLICK_FRAME + 4, CLICK_FRAME + 10], [0.93, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 4 ? clickScale : frame >= CLICK_FRAME + 4 ? clickRestore : 1;

  return (
    <div
      className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl font-bold"
      style={{
        opacity,
        scale: `${scale}`,
        background: "linear-gradient(135deg, #26c267, #1a8a4a)",
        color: "#06110d",
        fontSize: 14,
        fontWeight: 700,
        boxShadow: glow > 0 ? `0 0 ${12 + glow * 20}px rgba(38, 194, 103, ${0.2 + glow * 0.3})` : "none",
        willChange: "transform, opacity",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06110d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
      </svg>
      Create League
    </div>
  );
};

const LeagueGrid: React.FC<{ frame: number; isZoomed: boolean }> = ({ frame, isZoomed }) => {
  const sectionOpacity = interpolate(frame, [CARDS_START - 10, CARDS_START], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      className="absolute"
      style={{
        left: 220, right: 0, top: 60, bottom: 0,
        opacity: sectionOpacity,
        padding: "20px 28px",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "0.02em" }}>
          League Management
        </h2>
      </div>

      <div
        className="grid gap-4"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {LEAGUES.map((league, i) => (
          <LeagueCard key={league.name} league={league} index={i} frame={frame} isZoomed={isZoomed} />
        ))}
        <CreateLeagueButton frame={frame} />
      </div>

      <StatsBar frame={frame} />
    </div>
  );
};

const StatsBar: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [STATS_START, STATS_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [STATS_START, STATS_END], [12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const stats = [
    { label: "Active Leagues", value: 3, icon: "trophy" },
    { label: "Total Teams", value: 68, icon: "users" },
    { label: "Matches Today", value: 12, icon: "calendar" },
    { label: "Active Players", value: 1842, icon: "person" },
  ];

  return (
    <div
      className="flex gap-3"
      style={{ opacity, translate: `0 ${translateY}px` }}
    >
      {stats.map((stat, i) => {
        const statOpacity = interpolate(frame, [STATS_START + i * 4, STATS_END + i * 4], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const count = Math.round(interpolate(frame, [STATS_START + 8 + i * 4, STATS_END + 8 + i * 4], [0, stat.value], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

        return (
          <div
            key={stat.label}
            className="flex flex-1 items-center gap-3 rounded-lg p-4"
            style={{
              opacity: statOpacity,
              border: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: "rgba(38, 194, 103, 0.1)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {i === 0 && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
                {i === 1 && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>}
                {i === 2 && <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>}
                {i === 3 && <><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></>}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{count}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CreateModal: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [MODAL_START, MODAL_START + 12], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(appear, [0, 1], [0.9, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const backdropOpacity = interpolate(appear, [0, 1], [0, 1], { easing: easing.smooth });

  if (frame < MODAL_START) return null;

  const confirmProgress = Math.max(0, frame - MODAL_CONFIRM) / 15;
  const confirmOpacity = interpolate(confirmProgress, [0, 1], [0, 1], { easing: easing.crisp });
  const exitProgress = Math.max(0, frame - MODAL_CONFIRM - 30) / 20;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { easing: easing.crisp });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], { easing: easing.smooth });

  if (frame > MODAL_CONFIRM + 50) return null;

  const fields = [
    { label: "League Name", value: "Premier League", start: FIELD1 },
    { label: "Season", value: "2024/25", start: FIELD2 },
    { label: "Competition Format", value: "Round Robin", start: FIELD3 },
    { label: "Number of Teams", value: "20", start: FIELD4 },
    { label: "Start Date", value: "Aug 16, 2024", start: FIELD5 },
    { label: "End Date", value: "May 25, 2025", start: FIELD6 },
    { label: "Registration Settings", value: "Open", start: FIELD7 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.5 * backdropOpacity * exitOpacity})`, backdropFilter: "blur(4px)" }} />
      <div
        className="absolute flex flex-col"
        style={{
          top: "50%", left: "50%",
          translate: "-50% -50%",
          width: 420,
          opacity: appear * exitOpacity,
          scale: `${scale * (exitScale || 1)}`,
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 26, 20, 0.95)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          padding: 28,
          willChange: "transform, opacity",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>Create League</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#26c267" : "rgba(255,255,255,0.1)" }} />
            ))}
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
              <div
                key={field.label}
                style={{ opacity, translate: `${translateX}px 0` }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 4, letterSpacing: "0.05em" }}>
                  {field.label}
                </div>
                <div
                  className="flex items-center justify-between rounded-lg px-4 py-2.5"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: "white" }}>
                    {valueDisplay}
                    {fieldProgress < 1 && fieldProgress > 0 && (
                      <span style={{ color: "#26c267", fontWeight: 700 }}>|</span>
                    )}
                  </span>
                  {fieldProgress >= 1 && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: checkOpacity }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center justify-center rounded-lg py-3"
          style={{
            marginTop: 20,
            background: "#26c267",
            color: "#06110d",
            opacity: confirmOpacity,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {confirmProgress < 1 ? "Processing..." : "League Created ✓"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CompetitionSettings: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [SETTINGS_START, SETTINGS_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [SETTINGS_START, SETTINGS_START + 15], [30, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (frame < SETTINGS_START) return null;

  const fades = {
    toggle1: interpolate(frame, [TOGGLE1, TOGGLE1 + 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    toggle2: interpolate(frame, [TOGGLE2, TOGGLE2 + 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    toggle3: interpolate(frame, [TOGGLE3, TOGGLE3 + 8], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };

  const toggles = [
    { label: "Fixture Rules", desc: "Auto-generate match schedule", progress: fades.toggle1 },
    { label: "Registration", desc: "Open team enrollment", progress: fades.toggle2 },
    { label: "Statistics Tracking", desc: "Track goals, cards, assists", progress: fades.toggle3 },
  ];

  const statusProgress = interpolate(frame, [MORPH_START, MORPH_START + 20], [0, 1], { easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statusWidth = interpolate(statusProgress, [0, 1], [40, 70], { easing: easing.smooth });

  const statusBg = statusProgress < 0.5
    ? "rgba(96, 165, 250, 0.15)"
    : "rgba(38, 194, 103, 0.15)";
  const statusColor = statusProgress < 0.5 ? "#60a5fa" : "#26c267";
  const statusLabel = statusProgress < 0.5 ? "Draft" : "Active";

  return (
    <div
      className="absolute flex flex-col"
      style={{
        left: 220, right: 0, top: 60, bottom: 0,
        opacity: appear,
        translate: `${translateX}px 0`,
        padding: "20px 28px",
        willChange: "translate, opacity",
      }}
    >
      <h2 style={{ fontFamily: "Oswald, 'Arial Black', Impact, sans-serif", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "0.02em", marginBottom: 24 }}>
        Competition Settings
      </h2>

      <div className="flex gap-6">
        <div className="flex flex-col gap-4" style={{ flex: 1 }}>
          <div className="rounded-xl p-5" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>League Status</span>
              <div
                className="rounded-full px-4 py-1.5 text-center"
                  style={{
                    width: statusWidth,
                    background: statusBg,
                  }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {toggles.map((t, i) => {
                const toggleX = interpolate(frame, [TOGGLE1 + i * 10, TOGGLE1 + i * 10 + 10], [0, 18], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const r = interpolate(t.progress, [0, 1], [255, 38], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const g = interpolate(t.progress, [0, 1], [255, 194], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const b = interpolate(t.progress, [0, 1], [255, 103], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const a = interpolate(t.progress, [0, 1], [0.08, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const toggleBg = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

                return (
                  <div key={t.label} className="flex items-center justify-between" style={{ opacity: t.progress }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{t.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{t.desc}</div>
                    </div>
                    <div
                      className="rounded-full flex items-center"
                        style={{
                          width: 36, height: 20,
                          background: toggleBg,
                          padding: 2,
                        }}
                    >
                      <div
                        style={{
                          width: 16, height: 16, borderRadius: "50%",
                          background: "white",
                          translate: `${toggleX}px 0`,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{
            width: 240,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>League Badge</div>
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 80, height: 80,
              background: "rgba(38, 194, 103, 0.1)",
              margin: "0 auto 12px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#26c267" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", textAlign: "center" }}>Premier League</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>2024/25 Season</div>
        </div>
      </div>
    </div>
  );
};

const LivingUpdates: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [LIVING_START, LIVING_START + 15], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < LIVING_START) return null;

  const counter1 = Math.round(interpolate(frame, [LIVING_START + 5, LIVING_START + 25], [68, 88], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const counter2 = Math.round(interpolate(frame, [LIVING_START + 10, LIVING_START + 30], [0, 6], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const progressWidth = interpolate(frame, [LIVING_START + 15, LIVING_START + 35], [0, 68], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const notifications = [
    { text: "Premier League is now active", time: "2m ago", delay: 0 },
    { text: "12 new teams registered", time: "1m ago", delay: 8 },
    { text: "Match schedule generated", time: "30s ago", delay: 16 },
  ];

  return (
    <div
      className="absolute flex gap-4"
      style={{
        left: 248, right: 28, bottom: 20,
        opacity,
        willChange: "opacity",
      }}
    >
      <div
        className="rounded-xl p-4"
        style={{
          flex: 1,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>League Activity</div>
        <div className="flex gap-6">
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{counter1}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Total Teams</div>
            <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 8 }}>
              <div style={{ width: `${(counter1 / 100) * 100}`, height: "100%", borderRadius: 2, background: "#26c267" }} />
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{counter2}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Upcoming Fixtures</div>
            <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 8 }}>
              <div style={{ width: `${(counter2 / 10) * 100}`, height: "100%", borderRadius: 2, background: "#26c267" }} />
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "white", fontFamily: "Oswald, 'Arial Black', Impact, sans-serif" }}>{Math.round(progressWidth)}%</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Season Complete</div>
            <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginTop: 8 }}>
              <div style={{ width: `${progressWidth}`, height: "100%", borderRadius: 2, background: "#26c267" }} />
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          width: 220,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Activity Feed</div>
        <div className="flex flex-col gap-3">
          {notifications.map((n, i) => {
            const itemOpacity = interpolate(frame, [LIVING_START + 15 + n.delay, LIVING_START + 25 + n.delay], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const translateX = interpolate(frame, [LIVING_START + 15 + n.delay, LIVING_START + 25 + n.delay], [12, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ opacity: itemOpacity, translate: `${translateX}px 0`, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#26c267", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "white" }}>{n.text}</div>
                  <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const KineticLine: React.FC<{
  text: string; start: number; end: number; currentFrame: number;
}> = ({ text, start, end, currentFrame }) => {
  const localFrame = currentFrame - start;
  const duration = end - start;
  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, duration * 0.35, duration * 0.6, duration], [0, 1, 1, 0], {
    easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration * 0.35], [18, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, translate: `0 ${translateY}px`, display: "flex", justifyContent: "center" }}>
      <span style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 26, fontWeight: 400, color: "white", textAlign: "center", lineHeight: 1.4, letterSpacing: "0.02em" }}>
        {text}
      </span>
    </div>
  );
};

const KineticTypography: React.FC<{ frame: number }> = ({ frame }) => {
  const anyVisible = TYPO_LINES.some((l) => frame >= l.start && frame < l.end + 15);
  if (!anyVisible) return null;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center" style={{ top: "44%", height: "auto", zIndex: 160 }}>
      <div
        className="flex flex-col items-center rounded-2xl px-10 py-6"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {TYPO_LINES.map((line) => (
          <KineticLine key={line.text} text={line.text} start={line.start} end={line.end} currentFrame={frame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const MouseCursorSection: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [CURSOR_MOVE_START, CURSOR_MOVE_START + 6], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const disappear = interpolate(frame, [CLICK_FRAME + 15, CLICK_FRAME + 30], [1, 0], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const moveToButton = interpolate(frame, [CURSOR_MOVE_START, CLICK_FRAME], [0, 1], { easing: Easing.bezier(0.45, 0, 0.55, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = interpolate(moveToButton, [0, 1], [1280, 1050]);
  const cy = interpolate(moveToButton, [0, 1], [200, 155]);

  const clickScale = interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 3], [1, 0.85], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const restoreScale = interpolate(frame, [CLICK_FRAME + 3, CLICK_FRAME + 8], [0.85, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = frame >= CLICK_FRAME && frame < CLICK_FRAME + 3 ? clickScale : frame >= CLICK_FRAME + 3 ? restoreScale : 1;

  const opacity = appear * disappear;
  if (opacity < 0.01) return null;

  return (
    <div className="absolute" style={{ left: cx, top: cy, opacity, scale: `${scale}`, pointerEvents: "none", zIndex: 200, translate: "-50% -50%" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      </svg>
    </div>
  );
};

const LightSweep: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = (frame % 240) / 240;
  const opacity = interpolate(frame, [REVEAL_START, REVEAL_END], [0, 0.4], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const xPos = interpolate(progress, [0, 1], [-10, 110]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: opacity * 0.15 }}>
      <div
        className="absolute top-0"
        style={{
          left: `${xPos}%`,
          width: "30%",
          height: "100%",
          translate: "-50% 0",
          background: "linear-gradient(90deg, transparent, rgba(60, 140, 255, 0.03), transparent)",
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

const DepthOfField: React.FC<{ frame: number }> = ({ frame }) => {
  const blur = interpolate(frame, [0, 10, 30, 50, TOTAL], [4, 2, 0.3, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.smooth });
  return <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.4, pointerEvents: "none" }} />;
};

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraScale = interpolate(frame, [ZOOM_START, ZOOM_END], [1.06, 1], { easing: easing.smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [ZOOM_END, ZOOM_END + 60], [0, -2], { easing: easing.smooth, extrapolateLeft: "clamp" });
  const revealOpacity = interpolate(frame, [REVEAL_START, REVEAL_END], [0, 1], { easing: easing.crisp, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const showSettings = frame >= SETTINGS_START && frame < LIVING_START + 60;
  const showGrid = frame < SETTINGS_START || frame >= LIVING_START + 60;

  return (
    <AbsoluteFill className="overflow-hidden" style={{ background: "#000" }}>
      <div
        className="absolute inset-0"
        style={{
          scale: `${cameraScale}`,
          translate: `0 ${panY}px`,
          opacity: revealOpacity,
          willChange: "transform, opacity",
        }}
      >
        <DashboardBackground frame={frame} />
        <LightSweep frame={frame} />

        <Sidebar frame={frame} />
        <MainHeader frame={frame} />

        {showGrid && <LeagueGrid frame={frame} isZoomed={true} />}
        {showSettings && <CompetitionSettings frame={frame} />}

        <LivingUpdates frame={frame} />
      </div>

      <CreateModal frame={frame} />
      <MouseCursorSection frame={frame} />
      <KineticTypography frame={frame} />
      <DepthOfField frame={frame} />
    </AbsoluteFill>
  );
};
