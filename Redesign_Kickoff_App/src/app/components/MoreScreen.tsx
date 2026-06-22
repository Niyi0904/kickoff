import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { useApp } from './AppContext';

interface MenuItem {
  icon: string;
  label: string;
  description: string;
  path: string;
  color: string;
  adminOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: '📊', label: 'Statistics', description: 'Top scorers, assists & team stats', path: '/statistics', color: '#00E676' },
  { icon: '👥', label: 'Players', description: 'Full player directory', path: '/players', color: '#4D7EFF' },
  { icon: '🔔', label: 'Notifications', description: 'Match alerts & updates', path: '/notifications', color: '#FFB800' },
  { icon: '⚙️', label: 'Settings', description: 'App preferences & account', path: '/settings', color: '#A855F7' },
  { icon: '📋', label: 'League Rules', description: 'Official league regulations', path: '/rules', color: '#5A6880' },
  { icon: 'ℹ️', label: 'About', description: 'Lagos Premier League info', path: '/about', color: '#5A6880' },
];

const ADMIN_ITEMS: MenuItem[] = [
  { icon: '🛡️', label: 'Admin Dashboard', description: 'Manage all league operations', path: '/admin', color: '#00E676', adminOnly: true },
  { icon: '👤', label: 'Manage Users', description: 'User accounts & permissions', path: '/admin/users', color: '#4D7EFF', adminOnly: true },
  { icon: '🔗', label: 'Link Requests', description: 'Pending profile claims', path: '/admin/link-requests', color: '#FFB800', adminOnly: true },
  { icon: '🚫', label: 'Suspensions', description: 'Player bans & disciplinary', path: '/admin/suspensions', color: '#FF3D5A', adminOnly: true },
];

export function MoreScreen() {
  const navigate = useNavigate();
  const { role, user } = useApp();

  return (
    <ScreenLayout title="More" showNav>
      {/* User card */}
      {user && (
        <div className="px-4 mb-5">
          <div style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.1), rgba(77,126,255,0.08))', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(0,230,118,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,230,118,0.3), rgba(77,126,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F0F4FF' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#7A8699', marginTop: 1 }}>{user.email}</div>
            </div>
            <div style={{ backgroundColor: role === 'admin' ? 'rgba(0,230,118,0.12)' : role === 'manager' ? 'rgba(255,184,0,0.12)' : 'rgba(77,126,255,0.12)', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: role === 'admin' ? '#00E676' : role === 'manager' ? '#FFB800' : '#4D7EFF', textTransform: 'capitalize' }}>{role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin section */}
      {role === 'admin' && (
        <div className="px-4 mb-5">
          <div style={{ fontSize: 12, color: '#00E676', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>Administration</div>
          <div style={{ backgroundColor: '#131B2E', borderRadius: 16, border: '1px solid rgba(0,230,118,0.15)', overflow: 'hidden' }}>
            {ADMIN_ITEMS.map((item, idx) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: idx < ADMIN_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', textAlign: 'left' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F0F4FF' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#5A6880', marginTop: 1 }}>{item.description}</div>
                </div>
                <ChevronRight size={16} color="#5A6880" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main menu */}
      <div className="px-4 mb-4">
        <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>Explore</div>
        <div style={{ backgroundColor: '#131B2E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {MENU_ITEMS.map((item, idx) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: idx < MENU_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', textAlign: 'left' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F0F4FF' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#5A6880', marginTop: 1 }}>{item.description}</div>
              </div>
              <ChevronRight size={16} color="#5A6880" />
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#3A4455' }}>Kickoff v1.0.0 · Lagos Premier League</div>
      </div>
    </ScreenLayout>
  );
}
