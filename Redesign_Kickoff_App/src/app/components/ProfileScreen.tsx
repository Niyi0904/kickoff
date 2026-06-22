import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Edit2, LogOut, ChevronRight, Shield, BarChart2 } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { useApp } from './AppContext';
import { PLAYERS, getTeamById } from './data';

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  guest: { label: 'Guest', color: '#7A8699', bg: 'rgba(122,134,153,0.15)' },
  player: { label: 'Player', color: '#4D7EFF', bg: 'rgba(77,126,255,0.15)' },
  manager: { label: 'Team Manager', color: '#FFB800', bg: 'rgba(255,184,0,0.15)' },
  admin: { label: 'League Admin', color: '#00E676', bg: 'rgba(0,230,118,0.15)' },
};

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, role, logout, isAuthenticated, loginAsRole } = useApp();

  const playerData = user?.playerId ? PLAYERS.find(p => p.id === user.playerId) : null;
  const teamData = user?.teamId ? getTeamById(user.teamId) : null;
  const badge = ROLE_BADGE[role];

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  if (!isAuthenticated) {
    return (
      <ScreenLayout title="Profile" showNav>
        <div className="flex flex-col items-center px-6 py-10 gap-6">
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#1B2540', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase' }}>Sign In to Continue</div>
            <p style={{ fontSize: 14, color: '#7A8699', marginTop: 8 }}>Create an account or sign in to access your profile, stats, and more.</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button onClick={() => navigate('/login')} style={{ width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 16, fontWeight: 700 }}>Sign In</button>
            <button onClick={() => navigate('/register')} style={{ width: '100%', height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F4FF', fontSize: 16, fontWeight: 600 }}>Create Account</button>
          </div>

          {/* Demo quick-access */}
          <div style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 12, color: '#5A6880', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Browse as</div>
            <div className="flex flex-col gap-2">
              {(['player', 'manager', 'admin'] as const).map(r => (
                <button key={r} onClick={() => { loginAsRole(r); }} style={{ width: '100%', backgroundColor: '#1B2540', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: ROLE_BADGE[r].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{r === 'player' ? '👤' : r === 'manager' ? '🎯' : '⚙️'}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: ROLE_BADGE[r].color }}>{ROLE_BADGE[r].label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Profile" showNav rightElement={
      <button onClick={() => navigate('/profile/edit')} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0F4FF' }}>
        <Edit2 size={15} />
      </button>
    }>
      {/* Avatar & Info */}
      <div style={{ background: 'linear-gradient(180deg, #0D1830 0%, #09101E 100%)', padding: '8px 20px 24px' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,230,118,0.3), rgba(77,126,255,0.2))', border: '2px solid rgba(0,230,118,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
            <button onClick={() => navigate('/profile/edit')} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', backgroundColor: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit2 size={12} color="#09101E" />
            </button>
          </div>
          <div className="text-center">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', letterSpacing: '0.02em' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: '#7A8699' }}>{user?.email}</div>
            {teamData && <div style={{ fontSize: 13, color: '#5A6880', marginTop: 2 }}>{teamData.name}</div>}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: badge.bg, border: `1px solid ${badge.color}40`, borderRadius: 20, padding: '5px 14px' }}>
            <Shield size={12} color={badge.color} />
            <span style={{ fontSize: 13, fontWeight: 700, color: badge.color }}>{badge.label}</span>
          </div>
        </motion.div>
      </div>

      {/* Player stats (if player role) */}
      {role === 'player' && playerData && (
        <div className="px-4 mb-4">
          <div style={{ fontSize: 13, color: '#5A6880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>My Stats</div>
          <div className="flex gap-2.5">
            {[
              { label: 'Goals', value: playerData.goals, color: '#00E676' },
              { label: 'Assists', value: playerData.assists, color: '#4D7EFF' },
              { label: 'Apps', value: playerData.appearances, color: '#FFB800' },
              { label: 'Rating', value: playerData.rating.toFixed(1), color: '#A855F7' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, backgroundColor: '#131B2E', borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate(`/players/${playerData.id}`)} style={{ width: '100%', marginTop: 10, height: 44, borderRadius: 12, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.06)', color: '#00E676', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <BarChart2 size={16} /> View Full Profile
          </button>
        </div>
      )}

      {/* Menu items */}
      <div className="px-4 flex flex-col gap-2 mb-4">
        {[
          { icon: '📝', label: 'Edit Profile', path: '/profile/edit' },
          { icon: '🔔', label: 'Notifications', path: '/notifications' },
          { icon: '⚽', label: 'My Team', path: user?.teamId ? `/teams/${user.teamId}` : '/teams', show: role === 'player' || role === 'manager' },
          { icon: '⚙️', label: 'Settings', path: '/settings' },
          { icon: '🛡️', label: 'Admin Panel', path: '/admin', show: role === 'admin' },
        ].filter(i => i.show !== false).map(item => (
          <button key={item.label} onClick={() => navigate(item.path)} style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#1B2540', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: '#F0F4FF', textAlign: 'left' }}>{item.label}</span>
            <ChevronRight size={16} color="#5A6880" />
          </button>
        ))}
      </div>

      <div className="px-4 mb-8">
        <button onClick={handleLogout} style={{ width: '100%', height: 52, borderRadius: 14, backgroundColor: 'rgba(255,61,90,0.1)', border: '1px solid rgba(255,61,90,0.2)', color: '#FF3D5A', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </ScreenLayout>
  );
}
