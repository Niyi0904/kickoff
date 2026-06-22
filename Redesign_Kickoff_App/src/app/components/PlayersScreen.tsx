import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { ScreenLayout } from './ScreenLayout';
import { PLAYERS, getTeamById } from './data';

const POSITIONS = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'FW'];

export function PlayersScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All');

  const filtered = PLAYERS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === 'All' || p.position === posFilter;
    return matchSearch && matchPos;
  });

  const sorted = [...filtered].sort((a, b) => b.goals - a.goals);

  return (
    <ScreenLayout title="Players" showNav>
      <div className="px-4 mb-3">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5A6880' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            style={{ width: '100%', height: 44, backgroundColor: '#131B2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#F0F4FF', paddingLeft: 42, paddingRight: 16, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Position filter */}
      <div className="px-4 flex gap-2 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
        {POSITIONS.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', backgroundColor: posFilter === pos ? '#00E676' : 'rgba(255,255,255,0.06)', color: posFilter === pos ? '#09101E' : '#7A8699', transition: 'all 0.15s' }}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Players list */}
      <div className="px-4 flex flex-col gap-2">
        {sorted.map((player, idx) => {
          const team = getTeamById(player.teamId)!;
          return (
            <motion.button
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/players/${player.id}`)}
              style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}
            >
              {/* Rank */}
              <div style={{ width: 24, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: idx === 0 ? '#00E676' : '#5A6880', fontWeight: 700 }}>{idx + 1}</div>

              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg, ${team.color}30, ${team.color}15)`, border: `1px solid ${team.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                {player.isClaimed && (
                  <div style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✓</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span style={{ fontSize: 11, color: team.color, fontWeight: 600 }}>{team.shortName}</span>
                  <span style={{ fontSize: 11, color: '#5A6880' }}>·</span>
                  <span style={{ fontSize: 11, color: '#5A6880', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 5px' }}>{player.position}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#00E676' }}>{player.goals}</div>
                  <div style={{ fontSize: 9, color: '#5A6880', textTransform: 'uppercase' }}>Gls</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#4D7EFF' }}>{player.assists}</div>
                  <div style={{ fontSize: 9, color: '#5A6880', textTransform: 'uppercase' }}>Ast</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: '#A855F7' }}>{player.rating.toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: '#5A6880', textTransform: 'uppercase' }}>Rtg</div>
                </div>
              </div>
            </motion.button>
          );
        })}

        {sorted.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div style={{ fontSize: 40 }}>🔍</div>
            <div style={{ fontSize: 16, color: '#5A6880' }}>No players found</div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
