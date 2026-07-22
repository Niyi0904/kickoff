import { BG, WHITE_05, WHITE_10, GREEN_LIGHT, GREEN, GOLD, FONT_DISPLAY, FONT_BODY, WHITE_45, WHITE_48, WHITE_62, WHITE_12 } from '../styles';
import { PublicHeader } from '../components/SceneHeader';
import { TextCallout } from '../components/TextCallout';
import { TeamAvatar } from '../components/TeamAvatar';
import { FOCUS_BALLER } from '../data';

function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(time?: string) {
  if (!time) return '';
  const [h, m = '00'] = time.split(':');
  const hour = parseInt(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m.padStart(2, '0')} ${suffix}`;
}

export function Scene3_Matches() {
  const played = FOCUS_BALLER.matches.filter((m) => m.status === 'played')
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  const upcoming = FOCUS_BALLER.matches.filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      <PublicHeader activeNav="Matches" />

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
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: GREEN_LIGHT }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: GREEN_LIGHT }}>Fixtures</span>
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
            Matches & Results
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
            Upcoming fixtures and recent results from the season.
          </p>
        </div>

        {/* Filter pills */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: `1px solid ${WHITE_10}`,
            borderRadius: 6,
            marginBottom: 24,
            width: 'fit-content',
          }}
        >
          {['All', 'Played', 'Upcoming'].map((f) => (
            <span
              key={f}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 900,
                fontFamily: FONT_DISPLAY,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                backgroundColor: f === 'All' ? GREEN : 'transparent',
                color: f === 'All' ? '#06110d' : WHITE_48,
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Upcoming */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{'📅'}</span>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Upcoming
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.map((match) => {
                const home = FOCUS_BALLER.teams.find((t) => t.id === match.homeTeamId);
                const away = FOCUS_BALLER.teams.find((t) => t.id === match.awayTeamId);
                return (
                  <div
                    key={match.id}
                    style={{
                      borderRadius: 6,
                      border: `1px dashed ${WHITE_12}`,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 10,
                        fontFamily: FONT_BODY,
                        fontSize: 12,
                        fontWeight: 600,
                        color: WHITE_45,
                      }}
                    >
                      <span>Match Week {match.matchDay}</span>
                      <span>{formatDate(match.scheduledDate)} · {formatTime(match.time)}</span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                        <span
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#ffffff',
                          }}
                        >
                          {home?.name ?? 'Home'}
                        </span>
                        <TeamAvatar name={home?.name ?? 'Home'} color={home?.color} size={36} />
                      </div>
                      <div
                        style={{
                          borderRadius: 6,
                          border: '1px solid rgba(245,200,75,0.2)',
                          backgroundColor: 'rgba(245,200,75,0.08)',
                          padding: '10px 20px',
                          textAlign: 'center',
                        }}
                      >
                        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 800, color: GOLD }}>
                          Scheduled
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TeamAvatar name={away?.name ?? 'Away'} color={away?.color} size={36} />
                        <span
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#ffffff',
                          }}
                        >
                          {away?.name ?? 'Away'}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 10,
                        fontSize: 11,
                        color: WHITE_45,
                        fontFamily: FONT_BODY,
                        fontWeight: 600,
                      }}
                    >
                      <span>📍</span>
                      <span>{match.venue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{'▶️'}</span>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Results
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {played.map((match) => {
                const home = FOCUS_BALLER.teams.find((t) => t.id === match.homeTeamId);
                const away = FOCUS_BALLER.teams.find((t) => t.id === match.awayTeamId);
                return (
                  <div
                    key={match.id}
                    style={{
                      borderRadius: 6,
                      border: `1px solid ${WHITE_10}`,
                      backgroundColor: WHITE_05,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 10,
                        fontFamily: FONT_BODY,
                        fontSize: 12,
                        fontWeight: 600,
                        color: WHITE_45,
                      }}
                    >
                      <span>Match Week {match.matchDay}</span>
                      <span>{formatDate(match.scheduledDate)}</span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                        <span
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#ffffff',
                          }}
                        >
                          {home?.name ?? 'Home'}
                        </span>
                        <TeamAvatar name={home?.name ?? 'Home'} color={home?.color} size={36} />
                      </div>
                      <div
                        style={{
                          borderRadius: 6,
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          padding: '10px 20px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontFamily: FONT_DISPLAY,
                              fontSize: 24,
                              fontWeight: 900,
                              color: '#ffffff',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {match.homeScore}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>:</span>
                          <span
                            style={{
                              fontFamily: FONT_DISPLAY,
                              fontSize: 24,
                              fontWeight: 900,
                              color: '#ffffff',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {match.awayScore}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TeamAvatar name={away?.name ?? 'Away'} color={away?.color} size={36} />
                        <span
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: 14,
                            fontWeight: 900,
                            color: '#ffffff',
                          }}
                        >
                          {away?.name ?? 'Away'}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 10,
                        fontSize: 11,
                        color: WHITE_45,
                        fontFamily: FONT_BODY,
                        fontWeight: 600,
                      }}
                    >
                      <span>📍</span>
                      <span>{match.venue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <TextCallout text="Full fixture schedule & results" startFrame={80} />
    </div>
  );
}
