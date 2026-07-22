'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAppContext } from "@/app/context/AppDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RequirePaidPlayer } from "@/components/RequirePaidPlayer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StatCardData {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface PossessionEntry {
  teamId: string;
  teamName: string;
  color: string;
  estimate: number;
}

interface MatchdayGoalDatum {
  matchDay: number;
  goals: number;
}

type FormResult = 'W' | 'D' | 'L';

interface TeamFormEntry {
  teamId: string;
  teamName: string;
  form: FormResult[];
}

interface StatCardsProps {
  cards: StatCardData[];
  animationDelay: number;
}

interface LeagueTableWidgetProps {
  standings: ReturnType<typeof useAppContext>['standings'];
  animationDelay: number;
}

interface TopScorersWidgetProps {
  topScorers: ReturnType<typeof useAppContext>['topScorers'];
  teams: ReturnType<typeof useAppContext>['teams'];
  animationDelay: number;
}

interface TeamFormWidgetProps {
  formEntries: TeamFormEntry[];
  winPct: number;
  drawPct: number;
  lossPct: number;
  animationDelay: number;
}

interface PossessionWidgetProps {
  entries: PossessionEntry[];
  animationDelay: number;
}

interface GoalsChartWidgetProps {
  data: MatchdayGoalDatum[];
  animationDelay: number;
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <RequirePaidPlayer>
        <AnalyticsContent />
      </RequirePaidPlayer>
    </ProtectedRoute>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="animate-pulse bg-secondary/50 rounded-xl h-10 w-64" />
        <div className="animate-pulse bg-secondary/50 rounded-xl h-5 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-secondary/50 rounded-xl h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-secondary/50 rounded-xl h-72" />
        <div className="animate-pulse bg-secondary/50 rounded-xl h-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-secondary/50 rounded-xl h-72" />
        <div className="animate-pulse bg-secondary/50 rounded-xl h-72" />
      </div>
      <div className="animate-pulse bg-secondary/50 rounded-xl h-64" />
    </div>
  );
}

function StatCards({ cards, animationDelay }: StatCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card rounded-2xl border border-border/50 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function LeagueTableWidget({ standings, animationDelay }: LeagueTableWidgetProps) {
  const display = standings.slice(0, 6);
  const fmtGd = (gd: number) => gd > 0 ? `+${gd}` : String(gd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="glass-card rounded-2xl border border-border/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-black uppercase tracking-tight">League Table</h3>
        <Link href="/standings" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
          View Full Table
        </Link>
      </div>

      {display.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">No matches played yet</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              <th className="pb-2 text-center w-8">#</th>
              <th className="pb-2">Team</th>
              <th className="pb-2 text-center">P</th>
              <th className="pb-2 text-center">W</th>
              <th className="pb-2 text-center hidden sm:table-cell">D</th>
              <th className="pb-2 text-center hidden sm:table-cell">L</th>
              <th className="pb-2 text-center">GD</th>
              <th className="pb-2 text-center text-primary">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {display.map((team: any, i: number) => (
              <tr key={team.id} className="hover:bg-primary/5 transition-colors group">
                <td className={cn(
                  "py-2.5 text-center font-display font-bold text-sm",
                  i < 3 ? "text-primary" : "text-muted-foreground"
                )}>
                  {i + 1}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="w-6 h-6 rounded-md border border-border shrink-0">
                      <AvatarImage src={team.logo} />
                      <AvatarFallback style={{ backgroundColor: team.color }} className="text-[8px] text-white font-bold">
                        {team.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm truncate">{team.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-center text-sm">{team.played}</td>
                <td className="py-2.5 text-center text-sm">{team.won}</td>
                <td className="py-2.5 text-center text-sm hidden sm:table-cell text-muted-foreground">{team.drawn}</td>
                <td className="py-2.5 text-center text-sm hidden sm:table-cell text-muted-foreground">{team.lost}</td>
                <td className={cn(
                  "py-2.5 text-center text-sm font-mono font-bold",
                  team.gd > 0 ? "text-emerald-500" : team.gd < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {fmtGd(team.gd)}
                </td>
                <td className="py-2.5 text-center">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-sm">{team.pts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}

function TopScorersWidget({ topScorers, teams, animationDelay }: TopScorersWidgetProps) {
  const safe = topScorers ?? [];
  const display = safe.slice(0, 5);
  const maxGoals = display[0]?.stats.goals ?? 1;
  const hasData = display.length > 0 && display.some(s => s.stats.goals > 0);

  const rankStyle = (rank: number): { bg: string; text: string } | null => {
    if (rank === 1) return { bg: '#F5C842', text: '#000' };
    if (rank === 2) return { bg: '#94A3B8', text: '#000' };
    if (rank === 3) return { bg: '#CD7F32', text: '#000' };
    return null;
  };

  const teamAbbr = (teamId?: string) => {
    if (!teamId) return '';
    const t = teams.find(t => t.id === teamId);
    return t?.abbreviation ?? '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="glass-card rounded-2xl border border-border/50 p-5"
    >
      <h3 className="font-display text-lg font-black uppercase tracking-tight mb-4">Top Scorers</h3>

      {!hasData ? (
        <p className="text-center py-8 text-muted-foreground text-sm">No goals recorded yet</p>
      ) : (
        <div className="space-y-3">
          {display.map((entry, i) => {
            const barPct = (entry.stats.goals / maxGoals) * 100;
            const rank = rankStyle(i);
            return (
              <div key={entry.player.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0",
                        !rank && "bg-muted text-muted-foreground"
                      )}
                      style={rank ? { backgroundColor: rank.bg, color: rank.text } : undefined}
                    >
                      {i + 1}
                    </span>
                    <Link href={`/players/${entry.player.id}`} className="font-bold text-sm text-foreground hover:text-primary truncate">
                      {entry.player.name}
                    </Link>
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                      {teamAbbr(entry.player.teamId)}
                    </span>
                  </div>
                  <span className="font-display text-lg font-black text-primary shrink-0">{entry.stats.goals}</span>
                </div>
                <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(barPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function TeamFormWidget({ formEntries, winPct, drawPct, lossPct, animationDelay }: TeamFormWidgetProps) {
  const formBadge = (result: FormResult) => {
    const map = {
      W: 'bg-green-500/20 text-green-400',
      D: 'bg-yellow-500/20 text-yellow-400',
      L: 'bg-red-500/20 text-red-400',
    };
    return map[result];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="glass-card rounded-2xl border border-border/50 p-5"
    >
      <h3 className="font-display text-lg font-black uppercase tracking-tight mb-4">Team Form</h3>

      {formEntries.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">No matches played yet</p>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {formEntries.map(entry => (
            <div key={entry.teamId} className="flex items-center gap-3">
              <span className="font-bold text-sm text-foreground w-28 truncate shrink-0">{entry.teamName}</span>
              <div className="flex gap-1">
                {entry.form.map((result, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                      formBadge(result)
                    )}
                  >
                    {result}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {formEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-muted-foreground">League</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-green-500/60" />
              <span className="text-green-400">{winPct}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-yellow-500/60" />
              <span className="text-yellow-400">{drawPct}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-red-500/60" />
              <span className="text-red-400">{lossPct}%</span>
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PossessionWidget({ entries, animationDelay }: PossessionWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="glass-card rounded-2xl border border-border/50 p-5"
    >
      <h3 className="font-display text-lg font-black uppercase tracking-tight mb-1">Possession</h3>
      <p className="text-muted-foreground text-xs mb-4">Estimated &mdash; possession data not tracked</p>

      {entries.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">No data available yet</p>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {entries.map(entry => (
            <div key={entry.teamId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-foreground truncate">{entry.teamName}</span>
                <span className="font-mono text-muted-foreground font-bold">{entry.estimate}%</span>
              </div>
              <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${entry.estimate}%`,
                    backgroundColor: entry.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function GoalsChartWidget({ data, animationDelay }: GoalsChartWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="glass-card rounded-2xl border border-border/50 p-5"
    >
      <h3 className="font-display text-lg font-black uppercase tracking-tight mb-4">Goals Per Matchday</h3>

      {data.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground text-sm">No match data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="matchDay"
              tickFormatter={(v: number) => `MD ${v}`}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(v: number) => Number.isInteger(v) ? String(v) : ''}
              allowDecimals={false}
              width={30}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value} goals`, 'Goals']}
              labelFormatter={(label: number) => `Matchday ${label}`}
            />
            <Bar
              dataKey="goals"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

function AnalyticsContent() {
  const {
    teams, players, matches, goals, assists,
    yellowCards, redCards, standings, topScorers, loading,
  } = useAppContext();

  const playedMatches = useMemo(
    () => matches.filter(m => m.status === 'played'),
    [matches]
  );

  const playedMatchIds = useMemo(
    () => new Set(playedMatches.map(m => m.id)),
    [playedMatches]
  );

  const totalGoals = useMemo(
    () => playedMatches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0),
    [playedMatches]
  );

  const totalAssists = useMemo(
    () => assists.filter(a => playedMatchIds.has(a.matchId)).length,
    [assists, playedMatchIds]
  );

  const totalCards = useMemo(
    () =>
      yellowCards.filter(y => playedMatchIds.has(y.matchId)).length +
      redCards.filter(r => playedMatchIds.has(r.matchId)).length,
    [yellowCards, redCards, playedMatchIds]
  );

  const totalCleanSheets = useMemo(
    () =>
      playedMatches.reduce((sum, m) => {
        let cs = 0;
        if (m.awayScore === 0) cs++;
        if (m.homeScore === 0) cs++;
        return sum + cs;
      }, 0),
    [playedMatches]
  );

  const statCards: StatCardData[] = [
    { label: 'Total Goals',   value: totalGoals,       icon: Target        },
    { label: 'Total Assists', value: totalAssists,     icon: TrendingUp    },
    { label: 'Cards',         value: totalCards,       icon: AlertTriangle },
    { label: 'Clean Sheets',  value: totalCleanSheets, icon: Shield        },
  ];

  const goalsPerMatchday: MatchdayGoalDatum[] = useMemo(() => {
    const map = new Map<number, number>();
    playedMatches.forEach(m => {
      map.set(m.matchDay, (map.get(m.matchDay) ?? 0) + m.homeScore + m.awayScore);
    });
    return Array.from(map.entries())
      .map(([matchDay, goals]) => ({ matchDay, goals }))
      .sort((a, b) => a.matchDay - b.matchDay);
  }, [playedMatches]);

  const teamFormEntries: TeamFormEntry[] = useMemo(() => {
    return teams
      .map(team => {
        const teamMatches = playedMatches
          .filter(m =>
            (m.homeTeamId === team.id || m.awayTeamId === team.id) &&
            m.homeScore != null &&
            m.awayScore != null
          )
          .sort((a, b) => a.matchDay - b.matchDay || a.id.localeCompare(b.id))
          .slice(-5);

        const form: FormResult[] = teamMatches.map(m => {
          const isHome = m.homeTeamId === team.id;
          const teamScore = isHome ? m.homeScore : m.awayScore;
          const oppScore  = isHome ? m.awayScore : m.homeScore;
          if (teamScore > oppScore) return 'W';
          if (teamScore < oppScore) return 'L';
          return 'D';
        });

        return { teamId: team.id, teamName: team.name, form };
      })
      .filter(entry => entry.form.length > 0)
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  }, [teams, playedMatches]);

  const leagueSummary = useMemo(() => {
    const total = playedMatches.length * 2;
    if (total === 0) return { winPct: 0, drawPct: 0, lossPct: 0 };
    const draws    = playedMatches.filter(m => m.homeScore === m.awayScore).length * 2;
    const decisive = playedMatches.filter(m => m.homeScore !== m.awayScore).length * 2;
    return {
      winPct:  Math.round((decisive / total) * 100),
      drawPct: Math.round((draws    / total) * 100),
      lossPct: Math.round((decisive / total) * 100),
    };
  }, [playedMatches]);

  const possessionEntries: PossessionEntry[] = useMemo(() => {
    if (standings.length === 0) return [];

    const maxPlayed = Math.max(...standings.map(t => t.played), 0);

    const teamMatchGoals = new Map<string, number>();
    teams.forEach(team => {
      const total = playedMatches
        .filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id)
        .reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
      teamMatchGoals.set(team.id, total);
    });

    const rawScores = standings.map(team => {
      const totalGoalsInTeamMatches = teamMatchGoals.get(team.id) ?? 0;
      const gfShare = totalGoalsInTeamMatches === 0
        ? 50
        : (team.gf / totalGoalsInTeamMatches) * 50;
      const playedShare = maxPlayed === 0
        ? 50
        : 50 * (team.played / maxPlayed);
      const raw = gfShare + playedShare;
      return { team, raw };
    });

    const sumRaw = rawScores.reduce((s, r) => s + r.raw, 0);
    const n = standings.length;

    return rawScores
      .map(({ team, raw }) => {
        const estimate = sumRaw === 0
          ? Math.round(100 / n)
          : Math.round((raw / sumRaw) * 50 * n);

        const teamData = teams.find(t => t.id === team.id);
        const color = teamData?.primaryColor || 'hsl(var(--primary))';

        return {
          teamId:   team.id,
          teamName: team.name,
          color,
          estimate,
        };
      })
      .sort((a, b) =>
        b.estimate - a.estimate ||
        a.teamName.localeCompare(b.teamName)
      );
  }, [standings, playedMatches, teams]);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-8 overflow-x-hidden pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Analytics &amp; Insights</h1>
        <p className="text-muted-foreground mt-1">League-wide performance overview</p>
      </motion.div>

      <StatCards cards={statCards} animationDelay={0} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeagueTableWidget standings={standings} animationDelay={0.1} />
        <TopScorersWidget topScorers={topScorers} teams={teams} animationDelay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamFormWidget
          formEntries={teamFormEntries}
          winPct={leagueSummary.winPct}
          drawPct={leagueSummary.drawPct}
          lossPct={leagueSummary.lossPct}
          animationDelay={0.3}
        />
        <PossessionWidget entries={possessionEntries} animationDelay={0.4} />
      </div>

      <GoalsChartWidget data={goalsPerMatchday} animationDelay={0.5} />
    </div>
  );
}
