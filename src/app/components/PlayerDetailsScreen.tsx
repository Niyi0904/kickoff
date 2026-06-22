import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Link2, Camera, CheckCircle2 } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { getPlayerById, getTeamById } from './data';
import { useApp } from './AppContext';

export function PlayerDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useApp();
  const [claimed, setClaimed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const player = id ? getPlayerById(id) : null;
  const team = player ? getTeamById(player.teamId) : null;

  if (!player || !team) return (
    <ScreenLayout title="Player" showBack showNav={false}>
      <div className="flex flex-col items-center py-16"><div style={{ fontSize: 14, color: '#5A6880' }}>Player not found</div></div>
    </ScreenLayout>
  );

  const isOwnProfile = user?.playerId === player.id;
  const canClaim = role === 'player' && !player.isClaimed && !claimed;

  const stats = [
    { label: 'Goals', value: player.goals, color: '#00E676' },
    { label: 'Assists', value: player.assists, color: '#4D7EFF' },
    { label: 'Apps', value: player.appearances, color: '#FFB800' },
    { label: 'Rating', value: player.rating.toFixed(1), color: '#A855F7' },
    { label: 'Yellows', value: player.yellowCards, color: '#FFB800' },
    { label: 'Reds', value: player.redCards, color: '#FF3D5A' },
    ...(player.position === 'GK' ? [{ label: 'Clean Sheets', value: player.cleanSheets || 0, color: '#00E676' }] : []),
  ];

  return (
    <ScreenLayout title="" showBack showNav={false} noPadding>
      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${team.color}20 0%, #09101E 65%)`, padding: '12px 20px 24px' }}>
        <div className="flex items-start gap-4">
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: `linear-gradient(135deg, ${team.color}30, rgba(77,126,255,0.15))`, border: `2px solid ${team.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👤</div>
            {(isOwnProfile || role === 'admin') && (
              <button style={{ position: 'absolute', bottom: -3, right: -3, width: 26, height: 26, borderRadius: '50%', backgroundColor: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={12} color="#09101E" />
              </button>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>{player.name}</div>
              {(player.isClaimed || claimed) && <div style={{ backgroundColor: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#00E676', fontWeight: 700 }}>CLAIMED</div>}
            </div>
            <button onClick={() => navigate(`/teams/${team.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: `${team.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{team.badge}</div>
              <span style={{ fontSize: 13, color: team.color, fontWeight: 600 }}>{team.name}</span>
            </button>
            <div className="flex gap-2 mt-2">
              <span style={{ fontSize: 11, color: '#5A6880', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px' }}>{player.position}</span>
              <span style={{ fontSize: 11, color: '#5A6880', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px' }}>#{player.number}</span>
              <span style={{ fontSize: 11, color: '#5A6880', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 8px' }}>Age {player.age}</span>
            </div>
          </div>
        </div>

        {/* Claim / Actions */}
        {canClaim && (
          <button
            onClick={() => setShowClaimModal(true)}
            style={{ width: '100%', marginTop: 16, height: 48, borderRadius: 13, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Link2 size={16} /> Claim This Profile
          </button>
        )}
      </div>

      <div style={{ padding: '16px 20px 24px', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {/* Stats grid */}
        <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Season Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ backgroundColor: '#131B2E', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Player Info</div>
          {[
            { label: 'Nationality', value: player.nationality },
            { label: 'Age', value: `${player.age} years` },
            { label: 'Squad Number', value: `#${player.number}` },
            { label: 'Position', value: player.position },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#5A6880' }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Rating bar */}
        <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Season Rating</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#A855F7' }}>{player.rating.toFixed(1)}</span>
          </div>
          <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(player.rating / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #A855F7, #6366F1)', borderRadius: 3 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: '#5A6880' }}>0</span>
            <span style={{ fontSize: 10, color: '#5A6880' }}>10</span>
          </div>
        </div>
      </div>

      {/* Claim modal */}
      {showClaimModal && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }} onClick={() => setShowClaimModal(false)}>
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div style={{ width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', marginBottom: 8 }}>Claim Profile</div>
            <p style={{ fontSize: 14, color: '#7A8699', marginBottom: 20, lineHeight: 1.6 }}>Claiming this profile will link it to your account. The league admin will review and approve your request.</p>
            <button
              onClick={() => { setClaimed(true); setShowClaimModal(false); }}
              style={{ width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C75A)', color: '#09101E', fontSize: 16, fontWeight: 700, marginBottom: 12 }}
            >
              <CheckCircle2 size={18} style={{ display: 'inline', marginRight: 8 }} />
              Submit Claim Request
            </button>
            <button onClick={() => setShowClaimModal(false)} style={{ width: '100%', height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', color: '#F0F4FF', fontSize: 15 }}>Cancel</button>
          </motion.div>
        </div>
      )}
    </ScreenLayout>
  );
}
