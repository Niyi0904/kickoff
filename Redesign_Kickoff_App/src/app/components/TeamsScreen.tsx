import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { TEAMS } from './data';

export function TeamsScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = TEAMS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.shortName.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenLayout title="Teams" showNav>
      {/* Search */}
      <div className="px-4 mb-4">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search teams..."
            style={{ width: '100%', height: 44, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#F0F4FF', paddingLeft: 42, paddingRight: 16, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Teams grid */}
      <div className="px-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map((team, idx) => (
          <motion.button
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/teams/${team.id}`)}
            style={{ backgroundColor: '#131B2E', borderRadius: 16, padding: '16px 14px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            {/* Position badge */}
            <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 6, backgroundColor: team.position <= 2 ? 'rgba(0,230,118,0.15)' : team.position >= TEAMS.length ? 'rgba(255,61,90,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: team.position <= 2 ? '#00E676' : team.position >= TEAMS.length ? '#FF3D5A' : '#7A8699' }}>{team.position}</span>
            </div>

            {/* Badge */}
            <div style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: `${team.color}20`, border: `1.5px solid ${team.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 10px', boxShadow: `0 4px 20px ${team.color}20` }}>{team.badge}</div>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF', marginBottom: 2 }}>{team.name}</div>
            <div style={{ fontSize: 11, color: '#5A6880', marginBottom: 10 }}>{team.shortName}</div>

            {/* Stats row */}
            <div className="flex justify-around" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
              {[
                { label: 'Pts', value: team.points, color: '#00E676' },
                { label: 'W', value: team.wins, color: '#F0F4FF' },
                { label: 'GF', value: team.goalsFor, color: '#F0F4FF' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <div style={{ fontSize: 40 }}>🔍</div>
          <div style={{ fontSize: 16, color: '#5A6880' }}>No teams found</div>
        </div>
      )}
    </ScreenLayout>
  );
}
