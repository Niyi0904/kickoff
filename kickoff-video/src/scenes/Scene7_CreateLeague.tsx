import { BG, WHITE_05, WHITE_10, GREEN_LIGHT, GREEN, GOLD, FONT_DISPLAY, FONT_BODY, WHITE_45, WHITE_48, WHITE_62, BG_SECONDARY } from '../styles';
import { TextCallout } from '../components/TextCallout';
import { FOCUS_BALLER, NIDAV_BALLER } from '../data';

const teams = [
  { name: FOCUS_BALLER.name, teams: FOCUS_BALLER.teams.length, color: GREEN_LIGHT },
  { name: NIDAV_BALLER.name, teams: NIDAV_BALLER.teams.length, color: GOLD },
];

const features = [
  'League Management',
  'Fixture Scheduling',
  'Match Reporting',
  'Statistics Tracking',
  'Team Management',
  'Player Registration',
];

export function Scene7_CreateLeague() {
  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center bottom, rgba(38,194,103,0.12), transparent 50%)',
        }}
      />

      {/* Nav bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(7,19,15,0.88)',
          backdropFilter: 'blur(12px)',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 32,
              fontWeight: 700,
              color: '#51d884',
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}
          >
            KICKOFF
          </span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['Features', 'Pricing', 'Sign In'].map((item) => (
            <span
              key={item}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.02em',
              }}
            >
              {item}
            </span>
          ))}
          <div
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              backgroundColor: GOLD,
              fontSize: 13,
              fontWeight: 700,
              color: '#102018',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.02em',
            }}
          >
            Start a League
          </div>
        </nav>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 0,
        }}
      >
        {/* Left: Hero content */}
        <div
          style={{
            padding: '60px 60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
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
              width: 'fit-content',
            }}
          >
            <span style={{ fontSize: 16, color: GOLD }}>{'🚀'}</span>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 600,
                color: '#a7f3d0',
              }}
            >
              Get started in minutes
            </span>
          </div>

          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 64,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              lineHeight: 0.95,
              letterSpacing: '-0.01em',
            }}
          >
            Create Your
            <br />
            <span style={{ color: GOLD }}>Own League</span>
          </h1>

          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 16,
              color: WHITE_62,
              marginTop: 20,
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            Launch your competition with public standings, fixtures, team profiles,
            and live statistics — no technical setup required.
          </p>

          {/* Existing leagues */}
          <div style={{ marginTop: 32 }}>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: 12,
                fontWeight: 600,
                color: WHITE_48,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Already on the platform
            </span>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {teams.map((t) => (
                <div
                  key={t.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: WHITE_05,
                    padding: '12px 16px',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 4,
                      backgroundColor: t.color === GOLD ? '#f5c84b' : GREEN_LIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.3,
                    }}
                  >
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: BG }}>
                      {t.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#ffffff',
                        display: 'block',
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 10,
                        color: WHITE_45,
                      }}
                    >
                      {t.teams} teams
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginTop: 32,
            }}
          >
            {features.map((f) => (
              <div
                key={f}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: FONT_BODY,
                  fontSize: 13,
                  color: WHITE_62,
                }}
              >
                <span style={{ color: GREEN_LIGHT, fontSize: 16 }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form card */}
        <div
          style={{
            padding: '60px 60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${WHITE_10}`,
              backgroundColor: WHITE_05,
              padding: 36,
              backdropFilter: 'blur(12px)',
            }}
          >
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 28,
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 6px 0',
                lineHeight: 1,
              }}
            >
              Start Your League
            </h2>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: 13,
                color: WHITE_45,
                marginTop: 6,
                marginBottom: 24,
              }}
            >
              Fill in the details to launch your public league.
            </p>

            {/* League Name */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  fontWeight: 600,
                  color: WHITE_48,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                League Name
              </label>
              <div
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 6,
                  border: `1px solid ${WHITE_10}`,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                }}
              >
                e.g. Premier League
              </div>
            </div>

            {/* URL Slug */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  fontWeight: 600,
                  color: WHITE_48,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                URL Slug
              </label>
              <div
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 6,
                  border: `1px solid ${WHITE_10}`,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: FONT_BODY,
                  fontSize: 14,
                }}
              >
                my-league
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 6,
                backgroundColor: GREEN,
                color: '#06110d',
                fontFamily: FONT_DISPLAY,
                fontSize: 18,
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '0.02em',
                cursor: 'pointer',
              }}
            >
              Start Setup
            </div>

            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: 11,
                color: WHITE_45,
                textAlign: 'center',
                marginTop: 12,
              }}
            >
              Free to start · No credit card required
            </p>
          </div>
        </div>
      </div>

      <TextCallout text="Start your own league in minutes" startFrame={100} />
    </div>
  );
}
