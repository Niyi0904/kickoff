import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Plus, RefreshCw } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { useApp } from './AppContext';
import { TEAMS, PLAYERS, LINK_REQUESTS, SUSPENSIONS, getPlayerById, getTeamById } from './data';

// Admin Dashboard
export function AdminScreen() {
  const navigate = useNavigate();
  const { role } = useApp();

  if (role !== 'admin') {
    return (
      <ScreenLayout title="Admin" showBack showNav={false}>
        <div className="flex flex-col items-center py-16 gap-4 px-6">
          <div style={{ fontSize: 50 }}>🔒</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase' }}>Access Denied</div>
          <p style={{ fontSize: 14, color: '#7A8699', textAlign: 'center' }}>You need League Admin privileges to access this area.</p>
        </div>
      </ScreenLayout>
    );
  }

  const stats = [
    { label: 'Teams', value: TEAMS.length, color: '#4D7EFF', icon: '⚽' },
    { label: 'Players', value: PLAYERS.length, color: '#00E676', icon: '👤' },
    { label: 'Pending Requests', value: LINK_REQUESTS.filter(r => r.status === 'pending').length, color: '#FFB800', icon: '🔗' },
    { label: 'Suspensions', value: SUSPENSIONS.filter(s => s.matchesServed < s.matchesBanned).length, color: '#FF3D5A', icon: '🚫' },
  ];

  const actions = [
    { icon: '👥', label: 'Manage Users', desc: 'View & manage user accounts', path: '/admin/users', color: '#4D7EFF' },
    { icon: '🔗', label: 'Link Requests', desc: 'Review profile claim requests', path: '/admin/link-requests', color: '#FFB800', badge: LINK_REQUESTS.filter(r => r.status === 'pending').length },
    { icon: '🚫', label: 'Suspensions', desc: 'Manage player bans', path: '/admin/suspensions', color: '#FF3D5A' },
    { icon: '📅', label: 'Generate Fixtures', desc: 'Auto-schedule match fixtures', path: '/admin/fixtures', color: '#00E676' },
    { icon: '⚙️', label: 'League Settings', desc: 'Configure league parameters', path: '/admin/settings', color: '#A855F7' },
    { icon: '📊', label: 'Season Stats', desc: 'League-wide analytics', path: '/statistics', color: '#20B2AA' },
  ];

  return (
    <ScreenLayout title="Admin Panel" showNav>
      {/* Stats grid */}
      <div className="px-4 mb-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px', border: `1px solid ${s.color}20` }}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: s.color, marginTop: 8, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#5A6880', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4">
        <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>Quick Actions</div>
        <div style={{ backgroundColor: '#131B2E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {actions.map((action, idx) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: idx < actions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', textAlign: 'left' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${action.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{action.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F0F4FF' }}>{action.label}</div>
                <div style={{ fontSize: 12, color: '#5A6880', marginTop: 1 }}>{action.desc}</div>
              </div>
              {action.badge ? (
                <div style={{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#09101E', padding: '0 6px' }}>{action.badge}</div>
              ) : (
                <div style={{ color: '#5A6880' }}>›</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </ScreenLayout>
  );
}

// Admin Users
export function AdminUsersScreen() {
  const users = [
    { id: 'u1', name: 'Chukwuemeka Obi', email: 'emeka@lfc.ng', role: 'player', team: 'Lagos FC', status: 'active' },
    { id: 'u2', name: 'Emeka Eze', email: 'emeka.eze@lfc.ng', role: 'manager', team: 'Lagos FC', status: 'active' },
    { id: 'u3', name: 'Mahmud Yusuf', email: 'mahmud@abu.ng', role: 'player', team: 'Abuja United', status: 'active' },
    { id: 'u4', name: 'Babatunde A.', email: 'baba@lfc.ng', role: 'player', team: 'Lagos FC', status: 'suspended' },
    { id: 'u5', name: 'Guest User', email: 'guest@example.com', role: 'guest', team: '—', status: 'active' },
  ];

  const roleColor: Record<string, string> = { admin: '#00E676', manager: '#FFB800', player: '#4D7EFF', guest: '#5A6880' };

  return (
    <ScreenLayout title="Manage Users" showBack showNav={false}>
      <div className="px-4 flex flex-col gap-2">
        {users.map(u => (
          <div key={u.id} style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${roleColor[u.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#5A6880' }}>{u.email}</div>
                <div className="flex gap-2 mt-1.5">
                  <span style={{ fontSize: 11, backgroundColor: `${roleColor[u.role]}18`, color: roleColor[u.role], borderRadius: 6, padding: '2px 8px', fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</span>
                  <span style={{ fontSize: 11, color: '#5A6880' }}>{u.team}</span>
                  {u.status === 'suspended' && <span style={{ fontSize: 11, backgroundColor: 'rgba(255,61,90,0.15)', color: '#FF3D5A', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Suspended</span>}
                </div>
              </div>
              <button style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6880', fontSize: 14 }}>⋯</button>
            </div>
          </div>
        ))}
      </div>
    </ScreenLayout>
  );
}

// Admin Link Requests
export function AdminLinkRequestsScreen() {
  const [requests, setRequests] = useState(LINK_REQUESTS);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests(r => r.map(req => req.id === id ? { ...req, status: action } : req));
  };

  const statusCfg: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#FFB800', bg: 'rgba(255,184,0,0.15)', label: 'Pending' },
    approved: { color: '#00E676', bg: 'rgba(0,230,118,0.15)', label: 'Approved' },
    rejected: { color: '#FF3D5A', bg: 'rgba(255,61,90,0.15)', label: 'Rejected' },
  };

  return (
    <ScreenLayout title="Link Requests" showBack showNav={false}>
      <div className="px-4 flex flex-col gap-3">
        {requests.map(req => {
          const player = getPlayerById(req.playerId);
          const team = player ? getTeamById(player.teamId) : null;
          const cfg = statusCfg[req.status];
          return (
            <div key={req.id} style={{ backgroundColor: '#131B2E', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-start gap-3 mb-3">
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(77,126,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔗</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{req.userName}</div>
                  <div style={{ fontSize: 12, color: '#5A6880', marginTop: 1 }}>Claiming: {player?.name || 'Unknown'}</div>
                  {team && <div style={{ fontSize: 11, color: team.color, marginTop: 1 }}>{team.name}</div>}
                  <div style={{ fontSize: 11, color: '#5A6880', marginTop: 2 }}>Requested: {req.requestedAt}</div>
                </div>
                <div style={{ backgroundColor: cfg.bg, borderRadius: 8, padding: '4px 10px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                </div>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'approved')} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.25)', color: '#00E676', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button onClick={() => handleAction(req.id, 'rejected')} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,61,90,0.1)', border: '1px solid rgba(255,61,90,0.2)', color: '#FF3D5A', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div style={{ fontSize: 40 }}>✅</div>
            <div style={{ fontSize: 16, color: '#5A6880' }}>No pending requests</div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

// Admin Suspensions
export function AdminSuspensionsScreen() {
  const [suspensions, setSuspensions] = useState(SUSPENSIONS);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <ScreenLayout title="Suspensions" showBack showNav={false} rightElement={
      <button onClick={() => setShowAdd(true)} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,230,118,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E676' }}>
        <Plus size={18} />
      </button>
    }>
      <div className="px-4 flex flex-col gap-3">
        {suspensions.map(sus => {
          const player = getPlayerById(sus.playerId);
          const team = player ? getTeamById(player.teamId) : null;
          const isActive = sus.matchesServed < sus.matchesBanned;
          return (
            <div key={sus.id} style={{ backgroundColor: '#131B2E', borderRadius: 16, padding: '14px 16px', border: `1px solid ${isActive ? 'rgba(255,61,90,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
              <div className="flex items-start gap-3">
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: isActive ? 'rgba(255,61,90,0.12)' : 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {isActive ? '🚫' : '✅'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{player?.name || 'Unknown Player'}</div>
                  {team && <div style={{ fontSize: 12, color: team.color, fontWeight: 600, marginTop: 1 }}>{team.name}</div>}
                  <div style={{ fontSize: 12, color: '#7A8699', marginTop: 4 }}>{sus.reason}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Period</div>
                      <div style={{ fontSize: 12, color: '#F0F4FF', fontWeight: 500 }}>{sus.startDate} — {sus.endDate}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Matches</div>
                      <div style={{ fontSize: 12, color: '#F0F4FF', fontWeight: 600 }}>{sus.matchesServed}/{sus.matchesBanned}</div>
                    </div>
                  </div>
                  {/* Progress */}
                  <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(sus.matchesServed / sus.matchesBanned) * 100}%`, backgroundColor: isActive ? '#FF3D5A' : '#00E676', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div style={{ backgroundColor: isActive ? 'rgba(255,61,90,0.12)' : 'rgba(0,230,118,0.1)', borderRadius: 8, padding: '4px 10px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#FF3D5A' : '#00E676' }}>{isActive ? 'ACTIVE' : 'SERVED'}</span>
                </div>
              </div>
            </div>
          );
        })}
        {suspensions.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div style={{ fontSize: 40 }}>✅</div>
            <div style={{ fontSize: 16, color: '#5A6880' }}>No active suspensions</div>
          </div>
        )}
      </div>

      {/* Add Suspension Sheet */}
      {showAdd && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }} onClick={() => setShowAdd(false)}>
          <motion.div initial={{ y: 300 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()}
            style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', marginBottom: 16 }}>Add Suspension</div>
            <p style={{ fontSize: 14, color: '#7A8699', marginBottom: 20 }}>Select a player and fill in suspension details.</p>
            <button onClick={() => setShowAdd(false)} style={{ width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              <Plus size={18} style={{ display: 'inline', marginRight: 8 }} /> Add Suspension
            </button>
            <button onClick={() => setShowAdd(false)} style={{ width: '100%', height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', color: '#F0F4FF', fontSize: 15 }}>Cancel</button>
          </motion.div>
        </div>
      )}
    </ScreenLayout>
  );
}

// League Settings
export function AdminLeagueSettingsScreen() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);
    setGenerated(true);
  };

  const settingsGroups = [
    {
      title: 'League Configuration',
      items: [
        { label: 'League Name', value: 'Lagos Premier League', type: 'text' },
        { label: 'Season', value: '2024/25', type: 'text' },
        { label: 'Total Gameweeks', value: '22', type: 'number' },
        { label: 'Teams', value: '8', type: 'number' },
      ],
    },
    {
      title: 'Scoring Rules',
      items: [
        { label: 'Points per Win', value: '3', type: 'number' },
        { label: 'Points per Draw', value: '1', type: 'number' },
        { label: 'Points per Loss', value: '0', type: 'number' },
      ],
    },
  ];

  return (
    <ScreenLayout title="League Settings" showBack showNav={false}>
      {settingsGroups.map(group => (
        <div key={group.title} className="px-4 mb-5">
          <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>{group.title}</div>
          <div style={{ backgroundColor: '#131B2E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {group.items.map((item, idx) => (
              <div key={item.label} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < group.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: 14, color: '#B8C4D8' }}>{item.label}</span>
                <input
                  defaultValue={item.value}
                  type={item.type}
                  style={{ width: 120, height: 36, backgroundColor: '#1B2540', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F0F4FF', textAlign: 'right', paddingRight: 12, fontSize: 14, outline: 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Generate fixtures */}
      <div className="px-4 mb-8">
        <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>Generate Fixtures</div>
        <div style={{ backgroundColor: '#131B2E', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#B8C4D8', marginBottom: 4 }}>Auto-generate fixture schedule for the season based on the number of teams and gameweeks.</div>
          {generated && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}><CheckCircle2 size={14} color="#00E676" /><span style={{ fontSize: 13, color: '#00E676' }}>Fixtures generated successfully!</span></div>}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{ width: '100%', height: 52, borderRadius: 14, background: generating ? '#1B2540' : 'linear-gradient(135deg, #00E676, #00C75A)', color: generating ? '#5A6880' : '#09101E', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
        >
          {generating ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : '📅 Generate Fixture Schedule'}
        </button>
        <button style={{ width: '100%', marginTop: 10, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #4D7EFF, #3B6FE8)', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          💾 Save Settings
        </button>
      </div>
    </ScreenLayout>
  );
}
