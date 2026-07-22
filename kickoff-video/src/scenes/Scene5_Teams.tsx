import { BG, WHITE_05, WHITE_10, GREEN_LIGHT, GREEN_DARK, FONT_DISPLAY, FONT_BODY, WHITE_45, WHITE_48, WHITE_62 } from '../styles';
import { PublicHeader } from '../components/SceneHeader';
import { TextCallout } from '../components/TextCallout';
import { TeamAvatar } from '../components/TeamAvatar';
import { FOCUS_BALLER, FOCUS_STANDINGS } from '../data';

export function Scene5_Teams() {
  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      <PublicHeader activeNav="Teams" />

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
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: GREEN_LIGHT }}>Teams</span>
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
            Competition Clubs
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
            Club profiles, branding, and season performance at a glance.
          </p>
        </div>

        {/* Team grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FOCUS_BALLER.teams.map((team) => {
            const standing = FOCUS_STANDINGS.find((s) => s.teamId === team.id);
            return (
              <div
                key={team.id}
                style={{
                  borderRadius: 6,
                  border: `1px solid ${WHITE_10}`,
                  backgroundColor: WHITE_05,
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <TeamAvatar name={team.name} color={team.color} size={56} border={true} />
                  <div>
                    <h3
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 22,
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {team.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 11,
                        fontWeight: 600,
                        color: WHITE_48,
                        margin: '6px 0 0 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {FOCUS_BALLER.seasonName} · {FOCUS_BALLER.venue}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                  <MiniStat label="Squad" value={5} />
                  <MiniStat label="Played" value={standing?.played ?? 0} />
                  <MiniStat label="Goals" value={(standing?.gf ?? 0)} />
                </div>

                {/* Perforated divider */}
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <div style={{ borderTop: '2px dashed rgba(255,255,255,0.15)' }} />
                </div>

                {/* Latest form */}
                <div>
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: WHITE_48,
                    }}
                  >
                    Recent Form
                  </span>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {(standing?.form ?? []).slice(-4).map((r, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'flex',
                          width: 28,
                          height: 28,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          fontFamily: FONT_DISPLAY,
                          fontSize: 13,
                          fontWeight: 800,
                          backgroundColor:
                            r === 'W' ? '#26c267' :
                            r === 'D' ? '#f5c84b' :
                            'rgba(255,255,255,0.12)',
                          color:
                            r === 'W' ? '#06110d' :
                            r === 'D' ? '#102018' :
                            'rgba(255,255,255,0.7)',
                        }}
                      >
                        {r}
                      </span>
                    ))}
                    {(standing?.form ?? []).length === 0 && (
                      <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontStyle: 'italic', color: WHITE_45 }}>
                        No results yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: `1px solid ${WHITE_10}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, color: WHITE_48 }}>
                    Position #{standing?.position ?? '-'}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 20,
                      fontWeight: 900,
                      color: GREEN_LIGHT,
                    }}
                  >
                    {standing?.pts ?? 0} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TextCallout text="All teams at a glance" startFrame={80} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 700,
          color: '#ffffff',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 10,
          fontWeight: 600,
          color: WHITE_48,
        }}
      >
        {label}
      </span>
    </div>
  );
}
