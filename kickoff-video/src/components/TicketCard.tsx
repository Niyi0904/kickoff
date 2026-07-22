import { BG, GREEN_DARK, GREEN_LIGHT, ORANGE, FONT_DISPLAY, FONT_BODY, WHITE_10, WHITE_15, WHITE_48, WHITE_45, WHITE_62, WHITE_70, WHITE_05, WHITE_50 } from '../styles';
import { type League, type Match, type Team } from '../data';
import { TeamAvatar } from './TeamAvatar';
import { ScoreboardDigit } from './ScoreboardDigit';

function teamDataFor(league: League): Map<string, { name: string }> {
  return new Map(league.teams.map((t) => [t.id, { name: t.name }]));
}

function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function LeagueCard({
  league,
  nextFixture,
  recentResult,
}: {
  league: League;
  nextFixture?: Match | null;
  recentResult?: Match | null;
}) {
  const data = teamDataFor(league);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 340,
        borderRadius: 6,
        border: `1px solid ${WHITE_10}`,
        backgroundColor: WHITE_05,
        padding: 20,
      }}
    >
      {/* Stamp */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 20,
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: '2px solid rgba(255,94,44,0.7)',
          backgroundColor: 'rgba(255,94,44,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-6deg)',
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 10,
            fontWeight: 700,
            color: ORANGE,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            textAlign: 'center',
          }}
        >
          KICKOFF
          {'\n'}LEAGUE
        </span>
      </div>

      {/* Identity */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 6,
            border: `1px solid ${WHITE_10}`,
            backgroundColor: GREEN_DARK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
            {league.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 26,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {league.name}
          </h2>
          <p
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 14,
              fontWeight: 600,
              color: WHITE_48,
              marginTop: 4,
              margin: '4px 0 0 0',
            }}
          >
            {league.seasonName}
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <MiniStat label="Teams" value={league.teams.length} />
            <MiniStat label="Played" value={league.matches.filter((m) => m.status === 'played').length} />
          </div>
        </div>
      </div>

      {/* Perforated divider */}
      <div style={{ position: 'relative', marginTop: 24 }}>
        <div style={{ borderTop: `2px dashed ${WHITE_15}` }} />
        <div
          style={{
            position: 'absolute',
            left: -8,
            right: -8,
            top: -9,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: BG }} />
          <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: BG }} />
        </div>
      </div>

      {/* Stub zone */}
      <div style={{ flex: 1, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Next Fixture */}
        <div>
          <SectionLabel icon="📅" label="Next Fixture" />
          {nextFixture ? (
            <FixtureBlock match={nextFixture} data={data} />
          ) : (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontStyle: 'italic', color: WHITE_50, margin: 0 }}>
              No upcoming fixture scheduled
            </p>
          )}
        </div>

        {/* Most Recent Result */}
        <div>
          <SectionLabel icon="🏆" label="Most Recent Result" />
          {recentResult ? (
            <ResultBlock match={recentResult} data={data} />
          ) : (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontStyle: 'italic', color: WHITE_50, margin: 0 }}>
              No completed result yet
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
          borderTop: `1px solid ${WHITE_10}`,
          paddingTop: 16,
        }}
      >
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600, color: WHITE_48 }}>
          {league.slug}
        </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 900, color: GREEN_LIGHT }}>
          Open →
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: WHITE_48,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function FixtureBlock({
  match,
  data,
}: {
  match: Match;
  data: Map<string, { name: string }>;
}) {
  const home = data.get(match.homeTeamId);
  const away = data.get(match.awayTeamId);
  return (
    <div
      style={{
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <TeamAvatar name={home?.name ?? 'Home'} size={28} />
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {home?.name ?? 'Home'}
        </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: WHITE_45 }}>VS</span>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'right',
          }}
        >
          {away?.name ?? 'Away'}
        </span>
        <TeamAvatar name={away?.name ?? 'Away'} size={28} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          fontFamily: FONT_BODY,
          fontSize: 10,
          fontWeight: 600,
          color: WHITE_45,
        }}
      >
        <span>📍</span>
        <span>{match.venue}</span>
        <span>·</span>
        <span>{formatDate(match.scheduledDate)}</span>
      </div>
    </div>
  );
}

function ResultBlock({
  match,
  data,
}: {
  match: Match;
  data: Map<string, { name: string }>;
}) {
  const home = data.get(match.homeTeamId);
  const away = data.get(match.awayTeamId);
  const hs = match.homeScore ?? 0;
  const as = match.awayScore ?? 0;
  const draw = hs === as;

  return (
    <div
      style={{
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamAvatar name={home?.name ?? 'Home'} size={28} />
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 900,
              color: '#ffffff',
            }}
          >
            {home?.name ?? 'Home'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ScoreboardDigit value={hs} highlight={!draw} size={32} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: WHITE_45 }}>:</span>
          <ScoreboardDigit value={as} highlight={!draw} size={32} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamAvatar name={away?.name ?? 'Away'} size={28} />
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 900,
              color: '#ffffff',
            }}
          >
            {away?.name ?? 'Away'}
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 10,
            fontWeight: 700,
            color: WHITE_45,
          }}
        >
          {formatDate(match.scheduledDate)}
        </span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 16,
          fontWeight: 700,
          color: '#ffffff',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 10,
          fontWeight: 600,
          color: WHITE_48,
        }}
      >
        {label}
      </span>
    </div>
  );
}
