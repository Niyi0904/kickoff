import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Filter } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { FIXTURES, getTeamById } from './data';

type FilterType = 'all' | 'upcoming' | 'completed';

function FixtureCard({ fixture }: { fixture: typeof FIXTURES[0] }) {
  const navigate = useNavigate();
  const home = getTeamById(fixture.homeTeamId)!;
  const away = getTeamById(fixture.awayTeamId)!;
  const isCompleted = fixture.status === 'completed';
  const isLive = fixture.status === 'live';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/fixtures/${fixture.id}`)}
      style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 16, padding: '14px 16px', border: isLive ? '1px solid rgba(255,184,0,0.4)' : '1px solid rgba(255,255,255,0.05)', textAlign: 'left', marginBottom: 10 }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3">
        <div style={{ fontSize: 11, color: '#5A6880', fontWeight: 500 }}>GW{fixture.gameweek} · {fixture.venue.split(' ').slice(0,3).join(' ')}</div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isLive ? '#FFB800' : isCompleted ? '#00E676' : '#5A6880', backgroundColor: isLive ? 'rgba(255,184,0,0.15)' : isCompleted ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 8px' }}>
          {isLive ? '● LIVE' : isCompleted ? 'FT' : fixture.time}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: `${home.color}18`, border: `1px solid ${home.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{home.badge}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', textAlign: 'center' }}>{home.shortName}</div>
        </div>

        <div className="flex flex-col items-center gap-1" style={{ flex: 1.2 }}>
          {isCompleted || isLive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 700, color: fixture.homeScore! > fixture.awayScore! ? '#00E676' : '#F0F4FF' }}>{fixture.homeScore}</span>
              <span style={{ fontSize: 18, color: '#5A6880' }}>-</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 700, color: fixture.awayScore! > fixture.homeScore! ? '#00E676' : '#F0F4FF' }}>{fixture.awayScore}</span>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: '#F0F4FF', letterSpacing: '0.05em' }}>VS</div>
              <div style={{ fontSize: 12, color: '#5A6880' }}>{fixture.date}</div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: `${away.color}18`, border: `1px solid ${away.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{away.badge}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', textAlign: 'center' }}>{away.shortName}</div>
        </div>
      </div>

      {/* Scorers preview */}
      {isCompleted && fixture.homeScorers && fixture.homeScorers.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8, fontSize: 11, color: '#5A6880', justifyContent: 'center' }}>
          <span>⚽ {fixture.homeScorers[0]}</span>
        </div>
      )}
    </motion.button>
  );
}

export function FixturesScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showGW, setShowGW] = useState<number | null>(null);

  const allGW = [...new Set(FIXTURES.map(f => f.gameweek))].sort((a, b) => b - a);
  const filtered = FIXTURES.filter(f => {
    if (filter === 'upcoming') return f.status === 'upcoming';
    if (filter === 'completed') return f.status === 'completed';
    return true;
  }).filter(f => showGW === null || f.gameweek === showGW).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped = filtered.reduce((acc, f) => {
    const key = `GW${f.gameweek}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, typeof FIXTURES>);

  const filterBtnStyle = (active: boolean) => ({
    padding: '7px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: active ? '#00E676' : 'rgba(255,255,255,0.06)',
    color: active ? '#09101E' : '#7A8699',
    transition: 'all 0.15s',
  });

  return (
    <ScreenLayout title="Fixtures" showNav rightElement={
      <button style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0F4FF' }}>
        <Filter size={16} />
      </button>
    }>
      {/* Filter tabs */}
      <div className="px-4 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', marginBottom: 8 }}>
        {(['all', 'upcoming', 'completed'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={filterBtnStyle(filter === f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {allGW.map(gw => (
          <button key={gw} onClick={() => setShowGW(showGW === gw ? null : gw)} style={filterBtnStyle(showGW === gw)}>
            GW{gw}
          </button>
        ))}
      </div>

      <div className="px-4">
        {Object.entries(grouped).sort(([a], [b]) => parseInt(b.replace('GW','')) - parseInt(a.replace('GW',''))).map(([gw, fixtures]) => (
          <div key={gw}>
            <div style={{ fontSize: 12, color: '#5A6880', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, marginTop: 4 }}>{gw}</div>
            {fixtures.map(f => <FixtureCard key={f.id} fixture={f} />)}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div style={{ fontSize: 40 }}>📅</div>
            <div style={{ fontSize: 16, color: '#5A6880' }}>No fixtures found</div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
