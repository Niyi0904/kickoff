import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { ScreenLayout } from './ScreenLayout';
import { getTeamById, getPlayersByTeam, FIXTURES } from './data';
import { motion } from 'motion/react';

const POS_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'FW'];

export function TeamDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'squad' | 'fixtures'>('overview');

  const team = id ? getTeamById(id) : null;
  const players = id ? getPlayersByTeam(id) : [];
  const teamFixtures = FIXTURES.filter(f => f.homeTeamId === id || f.awayTeamId === id).slice(0, 5);

  if (!team) return (
    <ScreenLayout title="Team" showBack showNav={false}>
      <div className="flex flex-col items-center py-16"><div style={{ fontSize: 14, color: '#5A6880' }}>Team not found</div></div>
    </ScreenLayout>
  );

  const tabs = ['overview', 'squad', 'fixtures'] as const;

  return (
    <ScreenLayout title="" showBack showNav={false} noPadding>
      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${team.color}25 0%, #09101E 60%)`, padding: '12px 20px 24px' }}>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: `${team.color}20`, border: `2px solid ${team.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, boxShadow: `0 0 30px ${team.color}30` }}>{team.badge}</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1 }}>{team.name}</div>
            <div style={{ fontSize: 13, color: '#7A8699', marginTop: 3 }}>Manager: {team.manager}</div>
            <div style={{ fontSize: 12, color: '#5A6880', marginTop: 1 }}>Founded {team.founded}</div>
          </div>
        </div>

        {/* Key stats */}
        <div className="flex gap-2.5">
          {[
            { label: 'Position', value: `#${team.position}`, color: team.position <= 2 ? '#00E676' : '#F0F4FF' },
            { label: 'Points', value: team.points, color: '#00E676' },
            { label: 'Goals', value: team.goalsFor, color: '#4D7EFF' },
            { label: 'W/D/L', value: `${team.wins}/${team.draws}/${team.losses}`, color: '#F0F4FF' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '10px 6px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: s.color as string }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', backgroundColor: '#0E1525', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, height: 44, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: tab === t ? '#00E676' : '#5A6880', borderBottom: `2px solid ${tab === t ? '#00E676' : 'transparent'}`, transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '16px 20px 20px' }}>
        {tab === 'overview' && (
          <div className="flex flex-col gap-4">
            <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>About</div>
              <p style={{ fontSize: 14, color: '#B8C4D8', lineHeight: 1.6 }}>{team.description}</p>
            </div>
            <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>Stadium</div>
              <div style={{ fontSize: 14, color: '#F0F4FF', fontWeight: 600 }}>{team.stadium}</div>
            </div>
            <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>Form (Last 5)</div>
              <div className="flex gap-2">
                {team.form.map((r, i) => {
                  const cfg: Record<string, { bg: string; color: string; label: string }> = {
                    W: { bg: 'rgba(0,230,118,0.15)', color: '#00E676', label: 'Win' },
                    D: { bg: 'rgba(255,184,0,0.15)', color: '#FFB800', label: 'Draw' },
                    L: { bg: 'rgba(255,61,90,0.15)', color: '#FF3D5A', label: 'Loss' },
                  };
                  return (
                    <div key={i} style={{ flex: 1, backgroundColor: cfg[r].bg, borderRadius: 10, padding: '10px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: cfg[r].color, fontFamily: "'Barlow Condensed', sans-serif" }}>{r}</div>
                      <div style={{ fontSize: 10, color: cfg[r].color, opacity: 0.7 }}>{cfg[r].label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'squad' && (
          <div className="flex flex-col gap-2">
            {POS_ORDER.filter(pos => players.some(p => p.position === pos)).map(pos => (
              <div key={pos}>
                <div style={{ fontSize: 11, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, marginTop: 4 }}>{pos === 'GK' ? 'Goalkeeper' : pos === 'FW' ? 'Forward' : pos === 'CM' || pos === 'CAM' || pos === 'CDM' ? 'Midfield' : 'Defence'}</div>
                {players.filter(p => p.position === pos).map(player => (
                  <motion.button
                    key={player.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/players/${player.id}`)}
                    style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,230,118,0.2), rgba(77,126,255,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: '#5A6880', width: 24 }}>#{player.number}</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FF' }}>{player.name}</div>
                      <div style={{ fontSize: 11, color: '#5A6880' }}>{player.position} · {player.nationality}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#00E676' }}>{player.goals}</div>
                        <div style={{ fontSize: 9, color: '#5A6880' }}>G</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#4D7EFF' }}>{player.assists}</div>
                        <div style={{ fontSize: 9, color: '#5A6880' }}>A</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'fixtures' && (
          <div className="flex flex-col gap-3">
            {teamFixtures.map(f => {
              const isHome = f.homeTeamId === id;
              const opponent = isHome ? getTeamById(f.awayTeamId)! : getTeamById(f.homeTeamId)!;
              const completed = f.status === 'completed';
              const homeScore = isHome ? f.homeScore : f.awayScore;
              const awayScore = isHome ? f.awayScore : f.homeScore;
              const won = completed && homeScore! > awayScore!;
              const lost = completed && homeScore! < awayScore!;
              return (
                <button key={f.id} onClick={() => navigate(`/fixtures/${f.id}`)} style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.04)', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: completed ? (won ? 'rgba(0,230,118,0.15)' : lost ? 'rgba(255,61,90,0.15)' : 'rgba(255,184,0,0.15)') : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: completed ? (won ? '#00E676' : lost ? '#FF3D5A' : '#FFB800') : '#5A6880' }}>
                    {completed ? (won ? 'W' : lost ? 'L' : 'D') : isHome ? 'H' : 'A'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF' }}>vs {opponent.name}</div>
                    <div style={{ fontSize: 11, color: '#5A6880', marginTop: 2 }}>GW{f.gameweek} · {f.date}</div>
                  </div>
                  {completed ? (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: won ? '#00E676' : lost ? '#FF3D5A' : '#FFB800' }}>
                      {homeScore}–{awayScore}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#5A6880' }}>{f.time}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
