import { BG, WHITE_10, WHITE_70, FONT_DISPLAY } from '../styles';

interface NavItem {
  label: string;
  active?: boolean;
}

export function DirectoryNav() {
  return (
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
            fontFamily: '"Teko", "Oswald", sans-serif',
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
        {['Browse Leagues', 'Start a League', 'Sign In'].map((item) => (
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
      </nav>
    </div>
  );
}

export function PublicHeader({ activeNav = 'Home' }: { activeNav?: string }) {
  const items: NavItem[] = [
    { label: 'Home' },
    { label: 'Matches' },
    { label: 'Standings' },
    { label: 'Teams' },
    { label: 'Stats' },
  ];

  return (
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
            fontFamily: '"Teko", "Oswald", sans-serif',
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
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {items.map((item) => (
          <span
            key={item.label}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: item.label === activeNav ? '#ffffff' : 'rgba(255,255,255,0.7)',
              fontFamily: FONT_DISPLAY,
              letterSpacing: '0.02em',
              ...(item.label === activeNav
                ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                : {}),
            }}
          >
            {item.label}
          </span>
        ))}
      </nav>
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          backgroundColor: '#f5c84b',
          fontSize: 13,
          fontWeight: 700,
          color: '#102018',
          fontFamily: FONT_DISPLAY,
          letterSpacing: '0.02em',
        }}
      >
        Profile Dashboard
      </div>
    </div>
  );
}
