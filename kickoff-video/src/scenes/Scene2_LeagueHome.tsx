import { BG, WHITE_05, WHITE_10, GREEN_LIGHT, GREEN, GOLD, FONT_DISPLAY, FONT_BODY, WHITE_45, WHITE_50, WHITE_62, BG_CARD, BG_SECONDARY } from '../styles';
import { PublicHeader } from '../components/SceneHeader';
import { TextCallout } from '../components/TextCallout';
import { TeamAvatar } from '../components/TeamAvatar';
import { FOCUS_BALLER, FOCUS_STANDINGS } from '../data';
import { spring, interpolate, useCurrentFrame } from 'remotion';

function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function HeroReveal({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const pushIn = spring({
    frame,
    fps: 30,
    config: { damping: 20, mass: 1, stiffness: 200, overshootClamping: true },
  });
  const scale = interpolate(pushIn, [0, 1], [1.12, 1.0]);
  const blur = interpolate(pushIn, [0, 1], [3, 0]);
  const hold = interpolate(frame, [0, 90], [0, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        transformOrigin: 'center center',
        transition: 'none',
      }}
    >
      {children}
    </div>
  );
}

function ParallaxBg({ children }: { children: React.ReactNode }) {
  return <div style={{ transform: 'translateZ(-200px) scale(1.111)' }}>{children}</div>;
}

function ParallaxFg({ children }: { children: React.ReactNode }) {
  return <div style={{ transform: 'translateZ(0)' }}>{children}</div>;
}

export function Scene2_LeagueHome() {
  const playedMatches = FOCUS_BALLER.matches.filter((m) => m.status === 'played');
  const upcomingMatches = FOCUS_BALLER.matches.filter((m) => m.status === 'scheduled');
  const recent = playedMatches.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0];
  const next = upcomingMatches[0];

  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      <ParallaxBg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at top, rgba(38,194,103,0.07), transparent 60%)',
          }}
        />
      </ParallaxBg>

      <ParallaxFg>
        <PublicHeader activeNav="Home" />
      </ParallaxFg>

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
        {/* Season badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '8px 14px',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 16, color: GOLD }}>{'✨'}</span>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 600,
              color: '#a7f3d0',
            }}
          >
            {FOCUS_BALLER.seasonName}
          </span>
        </div>

        {/* League shield + name — hero reveal */}
        <HeroReveal>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                border: '2px solid rgba(245,200,75,0.4)',
                backgroundColor: BG_CARD,
                boxShadow: '0 0 0 4px #07130f, 0 0 0 6px rgba(245,200,75,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: 'rgba(245,200,75,0.6)' }}>
                🏆
              </span>
            </div>
            <p
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                marginTop: 12,
              }}
            >
              {FOCUS_BALLER.name}
            </p>
          </div>
        </HeroReveal>

        {/* Team avatars row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            marginBottom: 32,
          }}
        >
          {FOCUS_BALLER.teams.map((team) => (
            <div key={team.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <TeamAvatar name={team.name} color={team.color} size={40} />
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 10,
                  fontWeight: 600,
                  color: WHITE_45,
                  maxWidth: 70,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {team.name}
              </span>
            </div>
          ))}
        </div>

        {/* Recent + Next */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div
            style={{
              borderRadius: 6,
              border: `1px solid ${WHITE_10}`,
              backgroundColor: WHITE_05,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{'🏆'}</span>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: WHITE_50,
                }}
              >
                Most Recent Result
              </span>
            </div>
            {recent ? (
              <ScoreRow match={recent} />
            ) : (
              <p style={{ fontFamily: FONT_BODY, fontSize: 12, fontStyle: 'italic', color: WHITE_45 }}>
                No completed results yet
              </p>
            )}
          </div>
          <div
            style={{
              borderRadius: 6,
              border: `1px solid ${WHITE_10}`,
              backgroundColor: WHITE_05,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{'📅'}</span>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: WHITE_50,
                }}
              >
                Next Fixture
              </span>
            </div>
            {next ? (
              <FixtureRow match={next} />
            ) : (
              <p style={{ fontFamily: FONT_BODY, fontSize: 12, fontStyle: 'italic', color: WHITE_45 }}>
                No upcoming fixture
              </p>
            )}
          </div>
        </div>

        {/* Metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Active Teams', value: FOCUS_BALLER.teams.length, icon: '🛡️' },
            { label: 'Registered Players', value: FOCUS_BALLER.teams.length * 5, icon: '👥' },
            { label: 'Matches Played', value: playedMatches.length, icon: '📅' },
            { label: 'Goals Scored', value: playedMatches.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0), icon: '⚽' },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 6,
                border: `1px solid rgba(255,255,255,0.14)`,
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: WHITE_62 }}>
                  {metric.label}
                </span>
                <span style={{ fontSize: 20 }}>{metric.icon}</span>
              </div>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 40,
                  fontWeight: 900,
                  color: '#ffffff',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <TextCallout text="Your own public matchday hub" startFrame={80} />
    </div>
  );
}

function ScoreRow({ match }: { match: typeof FOCUS_BALLER.matches[0] }) {
  const home = FOCUS_BALLER.teams.find((t) => t.id === match.homeTeamId);
  const away = FOCUS_BALLER.teams.find((t) => t.id === match.awayTeamId);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <TeamAvatar name={home?.name ?? 'Home'} color={home?.color} size={28} />
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
          {home?.name ?? 'Home'}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 6,
          padding: '6px 12px',
        }}
      >
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
          {match.homeScore}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>:</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
          {match.awayScore}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
          {away?.name ?? 'Away'}
        </span>
        <TeamAvatar name={away?.name ?? 'Away'} color={away?.color} size={28} />
      </div>
    </div>
  );
}

function FixtureRow({ match }: { match: typeof FOCUS_BALLER.matches[0] }) {
  const home = FOCUS_BALLER.teams.find((t) => t.id === match.homeTeamId);
  const away = FOCUS_BALLER.teams.find((t) => t.id === match.awayTeamId);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <TeamAvatar name={home?.name ?? 'Home'} color={home?.color} size={28} />
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
          {home?.name ?? 'Home'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 800, color: GREEN_LIGHT, letterSpacing: '0.04em' }}>
          VS
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 9, color: WHITE_45 }}>
          {formatDate(match.scheduledDate)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
          {away?.name ?? 'Away'}
        </span>
        <TeamAvatar name={away?.name ?? 'Away'} color={away?.color} size={28} />
      </div>
    </div>
  );
}
