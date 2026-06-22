import { useNavigate, useLocation } from 'react-router';
import { Home, Calendar, Trophy, Users, User, MoreHorizontal } from 'lucide-react';
import { useApp } from './AppContext';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Fixtures', icon: Calendar, path: '/fixtures' },
  { label: 'Standings', icon: Trophy, path: '/standings' },
  { label: 'Teams', icon: Users, path: '/teams' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'More', icon: MoreHorizontal, path: '/more' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useApp();

  const items = isAuthenticated ? NAV_ITEMS : NAV_ITEMS.filter(i => i.path !== '/profile' || i.path === '/profile');

  return (
    <div
      style={{
        backgroundColor: '#0E1525',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <div className="flex items-center justify-around" style={{ height: 60 }}>
        {items.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path || (path !== '/home' && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 transition-all relative"
              style={{
                minWidth: 52,
                minHeight: 44,
                color: isActive ? '#00E676' : '#5A6880',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: '0.02em' }}>
                {label}
              </span>
              {isActive && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#00E676', marginTop: 1 }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
