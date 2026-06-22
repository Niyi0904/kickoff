import { useParams, useNavigate } from 'react-router';
import { ScreenLayout } from './ScreenLayout';
import { getFixtureById, getTeamById } from './data';
import { MapPin, Users, Clock } from 'lucide-react';

export function MatchDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fixture = id ? getFixtureById(id) : null;

  if (!fixture) {
    return (
      <ScreenLayout title="Match Details" showBack showNav={false}>
        <div className="flex flex-col items-center py-16 gap-3">
          <div style={{ fontSize: 40 }}>❌</div>
          <div style={{ fontSize: 16, color: '#5A6880' }}>Fixture not found</div>
        </div>
      </ScreenLayout>
    );
  }

  const home = getTeamById(fixture.homeTeamId)!;
  const away = getTeamById(fixture.awayTeamId)!;
  const isCompleted = fixture.status === 'completed';
  const isUpcoming = fixture.status === 'upcoming';

  return (
    <ScreenLayout title="Match Details" showBack showNav={false} noPadding>
      {/* Hero score card */}
      <div style={{ background: 'linear-gradient(160deg, #0D1830 0%, #091525 100%)', padding: '16px 20px 28px' }}>
        {/* Status pill */}
        <div className="flex justify-center mb-5">
          <div style={{ backgroundColor: isCompleted ? 'rgba(0,230,118,0.12)' : 'rgba(255,184,0,0.12)', border: `1px solid ${isCompleted ? 'rgba(0,230,118,0.3)' : 'rgba(255,184,0,0.3)'}`, borderRadius: 20, padding: '5px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isCompleted ? '#00E676' : '#FFB800' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: isCompleted ? '#00E676' : '#FFB800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isCompleted ? 'Full Time' : fixture.status === 'live' ? 'Live' : `GW${fixture.gameweek} · ${fixture.date}`}
            </span>
          </div>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: `${home.color}20`, border: `2px solid ${home.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{home.badge}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F0F4FF', textAlign: 'center' }}>{home.name}</div>
            <div style={{ fontSize: 11, color: '#5A6880' }}>Home</div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1" style={{ flex: 1.2 }}>
            {isCompleted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, fontWeight: 700, color: fixture.homeScore! > fixture.awayScore! ? '#00E676' : '#F0F4FF', lineHeight: 1 }}>{fixture.homeScore}</span>
                <span style={{ fontSize: 24, color: '#253352', fontWeight: 300 }}>—</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, fontWeight: 700, color: fixture.awayScore! > fixture.homeScore! ? '#00E676' : '#F0F4FF', lineHeight: 1 }}>{fixture.awayScore}</span>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#F0F4FF', letterSpacing: '0.08em' }}>VS</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#FFB800' }}>{fixture.time}</div>
              </>
            )}
            {isCompleted && (
              <div style={{ fontSize: 11, color: '#5A6880' }}>
                {fixture.homeScore === fixture.awayScore ? 'Draw' : (fixture.homeScore! > fixture.awayScore! ? home.shortName : away.shortName) + ' Win'}
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: `${away.color}20`, border: `2px solid ${away.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{away.badge}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F0F4FF', textAlign: 'center' }}>{away.name}</div>
            <div style={{ fontSize: 11, color: '#5A6880' }}>Away</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Match info */}
        <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Match Info</div>
          <div className="flex flex-col gap-10px">
            {[
              { icon: <Clock size={14} />, label: 'Date & Time', value: `${fixture.date} · ${fixture.time}` },
              { icon: <MapPin size={14} />, label: 'Venue', value: fixture.venue },
              { icon: <Users size={14} />, label: 'Attendance', value: fixture.attendance ? fixture.attendance.toLocaleString() : 'TBD' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                <div style={{ color: '#5A6880' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#5A6880' }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: '#F0F4FF', fontWeight: 500, marginTop: 1 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal scorers */}
        {isCompleted && (fixture.homeScorers?.length || fixture.awayScorers?.length) && (
          <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Goals</div>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                {(fixture.homeScorers || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 12 }}>⚽</span>
                    <span style={{ fontSize: 13, color: '#F0F4FF' }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <div style={{ flex: 1 }}>
                {(fixture.awayScorers || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 justify-end">
                    <span style={{ fontSize: 13, color: '#F0F4FF' }}>{s}</span>
                    <span style={{ fontSize: 12 }}>⚽</span>
                  </div>
                ))}
                {(fixture.awayScorers || []).length === 0 && <div style={{ fontSize: 12, color: '#5A6880', textAlign: 'right' }}>—</div>}
              </div>
            </div>
          </div>
        )}

        {/* Head to head */}
        <div style={{ backgroundColor: '#131B2E', borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>Team Form</div>
          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F0F4FF', marginBottom: 6 }}>{home.shortName}</div>
              <div className="flex gap-1.5">
                {home.form.map((r, i) => {
                  const colors: Record<string, string> = { W: '#00E676', D: '#FFB800', L: '#FF3D5A' };
                  return <div key={i} style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: `${colors[r]}20`, border: `1px solid ${colors[r]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: colors[r] }}>{r}</div>;
                })}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F0F4FF', marginBottom: 6, textAlign: 'right' }}>{away.shortName}</div>
              <div className="flex gap-1.5 justify-end">
                {away.form.map((r, i) => {
                  const colors: Record<string, string> = { W: '#00E676', D: '#FFB800', L: '#FF3D5A' };
                  return <div key={i} style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: `${colors[r]}20`, border: `1px solid ${colors[r]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: colors[r] }}>{r}</div>;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to teams */}
        <div className="flex gap-3">
          <button onClick={() => navigate(`/teams/${home.id}`)} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: `${home.color}18`, border: `1px solid ${home.color}30`, color: '#F0F4FF', fontSize: 14, fontWeight: 600 }}>
            {home.badge} {home.shortName}
          </button>
          <button onClick={() => navigate(`/teams/${away.id}`)} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: `${away.color}18`, border: `1px solid ${away.color}30`, color: '#F0F4FF', fontSize: 14, fontWeight: 600 }}>
            {away.badge} {away.shortName}
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}
