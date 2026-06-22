import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ScreenLayout } from './ScreenLayout';
import { TEAMS, getGoalDiff } from './data';

function FormBadge({ r }: { r: 'W' | 'D' | 'L' }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    W: { bg: 'rgba(0,230,118,0.15)', color: '#00E676' },
    D: { bg: 'rgba(255,184,0,0.15)', color: '#FFB800' },
    L: { bg: 'rgba(255,61,90,0.15)', color: '#FF3D5A' },
  };
  return (
    <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: cfg[r].bg, color: cfg[r].color, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {r}
    </div>
  );
}

export function StandingsScreen() {
  const navigate = useNavigate();
  const [highlight, setHighlight] = useState<string | null>(null);
  const sorted = [...TEAMS].sort((a, b) => b.points - a.points || getGoalDiff(b) - getGoalDiff(a));

  const getZoneColor = (pos: number) => {
    if (pos <= 2) return '#00E676';
    if (pos <= 4) return '#4D7EFF';
    if (pos >= sorted.length - 1) return '#FF3D5A';
    return 'transparent';
  };

  return (
    <ScreenLayout title="Standings" showNav>
      {/* Zone legend */}
      <div className="px-4 flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Top 2 (Champions)', color: '#00E676' },
          { label: 'Top 4 (Promotion)', color: '#4D7EFF' },
          { label: 'Relegation', color: '#FF3D5A' },
        ].map(z => (
          <div key={z.label} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: z.color, opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: '#5A6880' }}>{z.label}</span>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div className="px-4">
        <div style={{ backgroundColor: '#0E1525', borderRadius: '12px 12px 0 0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, fontSize: 10, color: '#5A6880', fontWeight: 700, textTransform: 'uppercase' }}>#</div>
          <div style={{ flex: 1, fontSize: 10, color: '#5A6880', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Team</div>
          {['P', 'W', 'D', 'L', 'GD', 'Pts'].map(h => (
            <div key={h} style={{ width: h === 'Pts' ? 34 : 22, textAlign: 'center', fontSize: 10, color: h === 'Pts' ? '#00E676' : '#5A6880', fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
      </div>

      {/* Team rows */}
      <div className="px-4">
        {sorted.map((team, idx) => {
          const pos = idx + 1;
          const zoneColor = getZoneColor(pos);
          const isHighlighted = highlight === team.id;

          return (
            <motion.button
              key={team.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setHighlight(isHighlighted ? null : team.id); navigate(`/teams/${team.id}`); }}
              style={{
                width: '100%',
                backgroundColor: isHighlighted ? '#1A2540' : idx % 2 === 0 ? '#131B2E' : '#111728',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderLeft: `3px solid ${zoneColor === 'transparent' ? 'transparent' : zoneColor}`,
                borderRight: 'none',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                borderBottom: 'none',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ width: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: pos <= 2 ? '#00E676' : pos >= sorted.length ? '#FF3D5A' : '#7A8699', textAlign: 'center' }}>{pos}</div>
              <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: `${team.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{team.badge}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</div>
                <div className="flex gap-0.5 mt-1">{team.form.slice(-5).map((r, i) => <FormBadge key={i} r={r} />)}</div>
              </div>
              {[team.played, team.wins, team.draws, team.losses].map((v, i) => (
                <div key={i} style={{ width: 22, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#B8C4D8' }}>{v}</div>
              ))}
              <div style={{ width: 22, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: getGoalDiff(team) > 0 ? '#00E676' : getGoalDiff(team) < 0 ? '#FF3D5A' : '#B8C4D8' }}>
                {getGoalDiff(team) > 0 ? '+' : ''}{getGoalDiff(team)}
              </div>
              <div style={{ width: 34, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: '#00E676' }}>{team.points}</div>
            </motion.button>
          );
        })}

        {/* Bottom border */}
        <div style={{ height: 12, backgroundColor: '#131B2E', borderRadius: '0 0 12px 12px', marginBottom: 16 }} />
      </div>

      {/* Stats summary */}
      <div className="px-4 mb-4">
        <div style={{ fontSize: 13, color: '#5A6880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Season at a Glance</div>
        <div className="flex gap-3">
          {[
            { label: 'Total Goals', value: TEAMS.reduce((a, t) => a + t.goalsFor, 0).toString() },
            { label: 'Avg per Game', value: (TEAMS.reduce((a, t) => a + t.goalsFor, 0) / Math.max(1, TEAMS.reduce((a, t) => a + t.played, 0) / 2)).toFixed(1) },
            { label: 'Leaders', value: sorted[0].shortName },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, backgroundColor: '#131B2E', borderRadius: 12, padding: '12px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: '#00E676' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#5A6880', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  );
}
