import { BG, GREEN_LIGHT, FONT_DISPLAY, FONT_BODY } from '../styles';
import { DirectoryNav } from '../components/SceneHeader';
import { LeagueCard } from '../components/TicketCard';
import { TextCallout } from '../components/TextCallout';
import { FOCUS_BALLER, NIDAV_BALLER } from '../data';

function ParallaxBg({ children }: { children: React.ReactNode }) {
  return <div style={{ transform: 'translateZ(-200px) scale(1.111)' }}>{children}</div>;
}

function ParallaxFg({ children }: { children: React.ReactNode }) {
  return <div style={{ transform: 'translateZ(0)' }}>{children}</div>;
}

export function Scene1_Directory() {
  const focusNext = FOCUS_BALLER.matches.find((m) => m.status === 'scheduled');
  const focusRecent = FOCUS_BALLER.matches.filter((m) => m.status === 'played').sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )[0];

  const nidavNext = NIDAV_BALLER.matches.find((m) => m.status === 'scheduled');
  const nidavRecent = NIDAV_BALLER.matches.filter((m) => m.status === 'played').sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )[0];

  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: BG, position: 'relative', overflow: 'hidden' }}>
      <ParallaxBg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top left, rgba(38,194,103,0.18), transparent 34%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 256,
            background: 'linear-gradient(180deg, rgba(245,200,75,0.08), transparent)',
          }}
        />
      </ParallaxBg>

      <ParallaxFg>
        <DirectoryNav />
      </ParallaxFg>

      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '40px 60px',
          overflow: 'hidden',
        }}
      >
        {/* Eyebrow */}
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: GREEN_LIGHT,
            }}
          >
            League Directory
          </span>
        </div>

        {/* Title + Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 42,
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Browse leagues
          </h1>
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: 8,
              backdropFilter: 'blur(8px)',
            }}
          >
            {[
              { label: 'Leagues', value: 2 },
              { label: 'Teams', value: 10 },
              { label: 'With Results', value: 2 },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: 'rgba(7,19,15,0.7)',
                  borderRadius: 6,
                  padding: '10px 20px',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#ffffff',
                    fontVariantNumeric: 'tabular-nums',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.42)',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* League cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <LeagueCard
            league={FOCUS_BALLER}
            nextFixture={focusNext}
            recentResult={focusRecent}
          />
          <LeagueCard
            league={NIDAV_BALLER}
            nextFixture={nidavNext}
            recentResult={nidavRecent}
          />
        </div>
      </div>

      <TextCallout text="Browse every league" startFrame={90} />
    </div>
  );
}
