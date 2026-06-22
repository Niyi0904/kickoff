import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, ChevronRight, Flame, Star } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { useApp } from './AppContext';
import { TEAMS, FIXTURES, PLAYERS, LEAGUE, getTeamById } from './data';

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors: Record<string, string> = { W: '#00E676', D: '#FFB800', L: '#FF3D5A' };
  return <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: colors[result] }} />;
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: 1, backgroundColor: '#131B2E', borderRadius: 12, padding: '14px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#F0F4FF', fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 11, color: '#5A6880', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, role } = useApp();
  const topTeam = TEAMS[0];
  const nextFixture = FIXTURES.find(f => f.status === 'upcoming');
  const recentResult = FIXTURES.find(f => f.status === 'completed');
  const topScorer = PLAYERS[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScreenLayout showNav>
      {/* Hero header */}
      <div style={{ background: 'linear-gradient(180deg, #0D1830 0%, #09101E 100%)', padding: '8px 20px 20px' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontSize: 13, color: '#5A6880' }}>{greeting()},</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1 }}>
              {user ? user.name.split(' ')[0] : 'Fan'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gameweek</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: '#00E676' }}>{LEAGUE.currentGameweek}</div>
          </div>
        </div>

        {/* League banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.12) 0%, rgba(77,126,255,0.08) 100%)', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(0,230,118,0.15)', marginBottom: 4 }}>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 12, color: '#00E676', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{LEAGUE.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#F0F4FF', marginTop: 2 }}>{LEAGUE.season} Season</div>
              <div style={{ fontSize: 13, color: '#7A8699', marginTop: 2 }}>{LEAGUE.currentGameweek} of {LEAGUE.totalGameweeks} gameweeks played</div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚽</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-4 flex gap-2.5" style={{ marginTop: 16 }}>
        <StatCard label="Teams" value={`${TEAMS.length}`} />
        <StatCard label="Matches" value={FIXTURES.filter(f => f.status === 'completed').length.toString()} />
        <StatCard label="Goals" value={FIXTURES.filter(f => f.status === 'completed').reduce((a, f) => a + (f.homeScore || 0) + (f.awayScore || 0), 0).toString()} color="#00E676" />
      </div>

      {/* Role-specific quick action */}
      {role !== 'guest' && (
        <div className="px-4 mt-4">
          <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 12, color: '#00E676', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {role === 'player' ? 'My Profile' : role === 'manager' ? 'My Team' : 'Admin Panel'}
                </div>
                <div style={{ fontSize: 15, color: '#F0F4FF', marginTop: 2, fontWeight: 600 }}>
                  {role === 'player' ? 'View your stats & update profile' : role === 'manager' ? 'Manage squad & view fixtures' : 'Manage league operations'}
                </div>
              </div>
              <button onClick={() => navigate(role === 'admin' ? '/admin' : '/profile')} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,230,118,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E676' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next fixture */}
      {nextFixture && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} color="#5A6880" />
              <span style={{ fontSize: 13, color: '#5A6880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next Fixture</span>
            </div>
            <button onClick={() => navigate('/fixtures')} style={{ fontSize: 12, color: '#00E676' }}>See all</button>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/fixtures/${nextFixture.id}`)}
            style={{ width: '100%', background: 'linear-gradient(135deg, #131B2E, #1A2540)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}
          >
            <div style={{ fontSize: 11, color: '#FFB800', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              GW{nextFixture.gameweek} · {nextFixture.date} · {nextFixture.time}
            </div>
            <div className="flex items-center justify-between">
              {[nextFixture.homeTeamId, nextFixture.awayTeamId].map((tid, i) => {
                const t = getTeamById(tid)!;
                return (
                  <div key={tid} className="flex flex-col items-center gap-1.5" style={{ flex: 1, textAlign: i === 0 ? 'left' : 'right', alignItems: i === 0 ? 'flex-start' : 'flex-end' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${t.color}20`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{t.badge}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>{t.shortName}</div>
                    <div style={{ fontSize: 11, color: '#5A6880' }}>{t.name}</div>
                  </div>
                );
              })}
              <div className="flex flex-col items-center gap-1" style={{ flex: 0.8 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: '#F0F4FF', lineHeight: 1 }}>VS</div>
                <div style={{ fontSize: 11, color: '#5A6880', textAlign: 'center' }}>{nextFixture.venue.split(' ').slice(0,2).join(' ')}</div>
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Latest result */}
      {recentResult && (
        <div className="px-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} color="#5A6880" />
            <span style={{ fontSize: 13, color: '#5A6880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latest Result</span>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate(`/fixtures/${recentResult.id}`)}
            style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}
          >
            <div className="flex items-center justify-between">
              {[recentResult.homeTeamId, recentResult.awayTeamId].map((tid, i) => {
                const t = getTeamById(tid)!;
                const score = i === 0 ? recentResult.homeScore : recentResult.awayScore;
                return (
                  <div key={tid} className="flex items-center gap-2" style={{ flex: 1, justifyContent: i === 0 ? 'flex-start' : 'flex-end', flexDirection: i === 0 ? 'row' : 'row-reverse' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${t.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.badge}</div>
                    <div style={{ textAlign: i === 0 ? 'left' : 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>{t.shortName}</div>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: score! > (i === 0 ? recentResult.awayScore! : recentResult.homeScore!) ? '#00E676' : score === (i === 0 ? recentResult.awayScore : recentResult.homeScore) ? '#FFB800' : '#F0F4FF' }}>
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#5A6880', textAlign: 'center', marginTop: 8 }}>GW{recentResult.gameweek} · FT</div>
          </motion.button>
        </div>
      )}

      {/* Top of table */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} color="#5A6880" />
            <span style={{ fontSize: 13, color: '#5A6880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top of Table</span>
          </div>
          <button onClick={() => navigate('/standings')} style={{ fontSize: 12, color: '#00E676' }}>Full table</button>
        </div>
        <div className="flex flex-col gap-2">
          {TEAMS.slice(0, 3).map((team, idx) => (
            <motion.button whileTap={{ scale: 0.98 }} key={team.id} onClick={() => navigate(`/teams/${team.id}`)}
              style={{ width: '100%', backgroundColor: '#131B2E', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: idx === 0 ? '#00E676' : '#5A6880', width: 16, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>{idx + 1}</div>
              <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: `${team.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{team.badge}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FF' }}>{team.name}</div>
                <div className="flex gap-1 mt-1">{team.form.map((r, i) => <FormDot key={i} result={r} />)}</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: '#00E676' }}>{team.points}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Top scorer */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} color="#5A6880" />
          <span style={{ fontSize: 13, color: '#5A6880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Scorer</span>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate(`/players/${topScorer.id}`)}
          style={{ width: '100%', background: 'linear-gradient(135deg, #131B2E, #1A2540)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,230,118,0.2), rgba(77,126,255,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F0F4FF' }}>{topScorer.name}</div>
            <div style={{ fontSize: 12, color: '#5A6880' }}>{getTeamById(topScorer.teamId)?.name} · {topScorer.position}</div>
          </div>
          <div className="text-right">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: '#00E676', lineHeight: 1 }}>{topScorer.goals}</div>
            <div style={{ fontSize: 11, color: '#5A6880' }}>goals</div>
          </div>
        </motion.button>
      </div>
    </ScreenLayout>
  );
}
