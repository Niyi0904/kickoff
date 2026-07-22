import { BG, WHITE_05, WHITE_10, GREEN_LIGHT, GREEN, GOLD, FONT_DISPLAY, FONT_BODY, WHITE_45, WHITE_48, WHITE_62, BG_NEARBLACK, BG_SECONDARY } from '../styles';
import { PublicHeader } from '../components/SceneHeader';
import { TextCallout } from '../components/TextCallout';
import { TeamAvatar } from '../components/TeamAvatar';
import { FOCUS_BALLER, FOCUS_STANDINGS } from '../data';

export function Scene6_Stats() {
  const playedMatches = FOCUS_BALLER.matches.filter((m) => m.status === 'played');
  const totalGoals = playedMatches.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0);

  // Compute top scorers and assister from match data
  const goalScorers = [
    { name: 'K. Williams', team: 'Big6', goals: 3, assists: 1 },
    { name: 'M. Okafor', team: 'FOZ FC', goals: 2, assists: 0 },
    { name: 'T. Adebayo', team: 'Big6', goals: 2, assists: 2 },
    { name: 'S. Ibrahim', team: 'Page3Pro FC', goals: 1, assists: 0 },
    { name: 'J. Mensah', team: 'FOZ FC', goals: 1, assists: 2 },
  ];

  const standings_ = FOCUS_STANDINGS.filter((s) => s.played > 0).sort((a, b) => a.ga - b.ga).slice(0, 3);

  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      <PublicHeader activeNav="Stats" />

      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '40px 60px',
          overflow: 'auto',
        }}
      >
        {/* Eyebrow + Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: GREEN_LIGHT }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: GREEN_LIGHT }}>Statistics</span>
          </div>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 48,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Season Statistics
          </h1>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 15,
              color: WHITE_62,
              marginTop: 8,
              maxWidth: 600,
            }}
          >
            Goals, performances, and defensive records across the competition.
          </p>
        </div>

        {/* Summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total Players', value: FOCUS_BALLER.teams.length * 5 },
            { label: 'Total Goals', value: totalGoals },
            { label: 'Total Assists', value: goalScorers.reduce((s, g) => s + g.assists, 0) },
            { label: 'Matches Played', value: playedMatches.length },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                borderRadius: 6,
                border: `1px solid ${WHITE_10}`,
                backgroundColor: WHITE_05,
                padding: 16,
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#ffffff',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                {m.value}
              </span>
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  fontWeight: 600,
                  color: WHITE_45,
                  marginTop: 6,
                  display: 'block',
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Goal Leaders + Defensive Records */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Goal Leaders */}
          <div
            style={{
              borderRadius: 6,
              border: `1px solid ${WHITE_10}`,
              backgroundColor: WHITE_05,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{'🎯'}</span>
              <h3
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Goal Leaders
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {goalScorers.map((scorer, i) => (
                <div
                  key={scorer.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 6,
                    backgroundColor: BG_NEARBLACK,
                    padding: '10px 14px',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      fontFamily: FONT_DISPLAY,
                      fontSize: 14,
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 14,
                        fontWeight: 900,
                        color: '#ffffff',
                        display: 'block',
                      }}
                    >
                      {scorer.name}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 11,
                        color: WHITE_45,
                      }}
                    >
                      {scorer.team}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 26,
                        fontWeight: 900,
                        color: GOLD,
                        lineHeight: 1,
                        display: 'block',
                      }}
                    >
                      {scorer.goals}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 10,
                        fontWeight: 600,
                        color: WHITE_45,
                      }}
                    >
                      {scorer.assists} assists
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defensive Records */}
          <div
            style={{
              borderRadius: 6,
              border: `1px solid ${WHITE_10}`,
              backgroundColor: WHITE_05,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{'🛡️'}</span>
              <h3
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Defensive Records
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {standings_.map((row) => (
                <div
                  key={row.teamId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 6,
                    backgroundColor: BG_NEARBLACK,
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TeamAvatar name={row.teamName} color={row.color} size={36} />
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {row.teamName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 18,
                      fontWeight: 900,
                      color: GREEN_LIGHT,
                    }}
                  >
                    {row.ga} conceded
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TextCallout text="Detailed statistics & leaderboards" startFrame={80} />
    </div>
  );
}
