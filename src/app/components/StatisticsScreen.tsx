import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ScreenLayout } from './ScreenLayout';
import { PLAYERS, TEAMS, getTeamById } from './data';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const TABS = ['Scorers', 'Assists', 'Teams', 'Clean Sheets'] as const;
type Tab = typeof TABS[number];

export function StatisticsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Scorers');

  const scorers = [...PLAYERS].sort((a, b) => b.goals - a.goals).slice(0, 8);
  const assisters = [...PLAYERS].sort((a, b) => b.assists - a.assists).slice(0, 8);
  const gkPlayers = PLAYERS.filter(p => p.position === 'GK');
  const teamStats = [...TEAMS].sort((a, b) => b.goalsFor - a.goalsFor);

  const chartData = tab === 'Scorers'
    ? scorers.map(p => ({ name: p.name.split(' ')[0], value: p.goals }))
    : tab === 'Assists'
    ? assisters.map(p => ({ name: p.name.split(' ')[0], value: p.assists }))
    : teamStats.map(t => ({ name: t.shortName, value: t.goalsFor }));

  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <ScreenLayout title="Statistics" showNav>
      {/* Tabs */}
      <div className="px-4 flex gap-2 overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', backgroundColor: tab === t ? '#00E676' : 'rgba(255,255,255,0.06)', color: tab === t ? '#09101E' : '#7A8699', transition: 'all 0.15s' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      {tab !== 'Clean Sheets' && (
        <div className="px-4 mb-4">
          <div style={{ backgroundColor: '#131B2E', borderRadius: 16, padding: '16px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
              {tab === 'Scorers' ? 'Top Goal Scorers' : tab === 'Assists' ? 'Top Assisters' : 'Goals by Team'}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#5A6880', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5A6880', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.value === maxVal ? '#00E676' : `rgba(0,230,118,${0.3 + (entry.value / maxVal) * 0.5})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-4 flex flex-col gap-2">
        {tab === 'Scorers' && scorers.map((player, idx) => {
          const team = getTeamById(player.teamId)!;
          return (
            <button
              key={player.id}
              onClick={() => navigate(`/players/${player.id}`)}
              style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: idx === 0 ? '1px solid rgba(0,230,118,0.2)' : '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}
            >
              <div style={{ width: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: idx === 0 ? '#00E676' : '#5A6880', textAlign: 'center' }}>{idx + 1}</div>
              <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: `${team.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{player.name}</div>
                <div style={{ fontSize: 11, color: team.color, fontWeight: 600, marginTop: 1 }}>{team.shortName} · {player.position}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#00E676' }}>{player.goals}</div>
                <div style={{ fontSize: 10, color: '#5A6880' }}>goals</div>
              </div>
            </button>
          );
        })}

        {tab === 'Assists' && assisters.map((player, idx) => {
          const team = getTeamById(player.teamId)!;
          return (
            <button
              key={player.id}
              onClick={() => navigate(`/players/${player.id}`)}
              style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}
            >
              <div style={{ width: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: idx === 0 ? '#4D7EFF' : '#5A6880', textAlign: 'center' }}>{idx + 1}</div>
              <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: `${team.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{player.name}</div>
                <div style={{ fontSize: 11, color: team.color, fontWeight: 600, marginTop: 1 }}>{team.shortName} · {player.position}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#4D7EFF' }}>{player.assists}</div>
                <div style={{ fontSize: 10, color: '#5A6880' }}>assists</div>
              </div>
            </button>
          );
        })}

        {tab === 'Teams' && teamStats.map((team, idx) => (
          <button
            key={team.id}
            onClick={() => navigate(`/teams/${team.id}`)}
            style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}
          >
            <div style={{ width: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: idx === 0 ? '#00E676' : '#5A6880', textAlign: 'center' }}>{idx + 1}</div>
            <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: `${team.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{team.badge}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{team.name}</div>
              <div style={{ fontSize: 11, color: '#5A6880', marginTop: 1 }}>{team.played} games · {team.goalsAgainst} conceded</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: '#00E676' }}>{team.goalsFor}</div>
                <div style={{ fontSize: 9, color: '#5A6880' }}>scored</div>
              </div>
            </div>
          </button>
        ))}

        {tab === 'Clean Sheets' && (
          gkPlayers.length > 0 ? gkPlayers.map((player, idx) => {
            const team = getTeamById(player.teamId)!;
            return (
              <button key={player.id} onClick={() => navigate(`/players/${player.id}`)} style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}>
                <div style={{ width: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#FFB800', textAlign: 'center' }}>{idx + 1}</div>
                <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: `${team.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>{player.name}</div>
                  <div style={{ fontSize: 11, color: team.color, fontWeight: 600 }}>{team.shortName} · GK</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#FFB800' }}>{player.cleanSheets || 0}</div>
                  <div style={{ fontSize: 10, color: '#5A6880' }}>clean sheets</div>
                </div>
              </button>
            );
          }) : (
            <div className="flex flex-col items-center py-16 gap-3">
              <div style={{ fontSize: 40 }}>🧤</div>
              <div style={{ fontSize: 14, color: '#5A6880' }}>No goalkeeper data available</div>
            </div>
          )
        )}
      </div>
    </ScreenLayout>
  );
}
