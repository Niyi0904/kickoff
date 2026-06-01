'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Clipboard,
  ClipboardCheck,
  type LucideIcon,
  Medal,
  Shield,
  Target,
  Trophy,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor: string;
};

type Player = {
  id: string;
  name: string;
  teamId: string;
  photo?: string | null;
};

type Match = {
  id: string;
  matchDay: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: "upcoming" | "played";
  scheduledDate?: string;
  time?: string;
  league?: string;
};

type Goal = {
  id: string;
  playerId: string;
  teamId: string;
  matchId?: string;
};

type StandingRow = {
  id: string;
  name: string;
  logo?: string | null;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

type LeagueSettings = {
  seasonName: string;
  leagueVenue: string;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
};

const DEFAULT_SETTINGS: LeagueSettings = {
  seasonName: "Current Season",
  leagueVenue: "",
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
};

const EMPTY_TEAMS: Team[] = [];
const EMPTY_PLAYERS: Player[] = [];
const EMPTY_MATCHES: Match[] = [];
const EMPTY_GOALS: Goal[] = [];

const tabs = [
  { id: "standings", label: "Standings", icon: Trophy },
  { id: "results", label: "Results", icon: CalendarDays },
  { id: "scorers", label: "Scorers", icon: Target },
] as const;

type PublicTab = (typeof tabs)[number]["id"];

async function fetchPublicLeagueData() {
  const [teamsSnap, playersSnap, matchesSnap, goalsSnap, settingsSnap] = await Promise.all([
    getDocs(collection(db, "teams")),
    getDocs(collection(db, "players")),
    getDocs(query(collection(db, "matches"), orderBy("matchDay", "desc"))),
    getDocs(collection(db, "goals")),
    getDoc(doc(db, "settings", "league")),
  ]);

  const teams: Team[] = teamsSnap.docs.map((d) => {
    const t = d.data();
    return {
      id: d.id,
      name: t.name ?? "Unnamed Team",
      logo: t.logo ?? null,
      primaryColor: t.primary_color ?? t.primaryColor ?? "#22c55e",
    };
  });

  const players: Player[] = playersSnap.docs.map((d) => {
    const p = d.data();
    return {
      id: d.id,
      name: p.name ?? "Unnamed Player",
      teamId: p.team_id ?? p.teamId ?? "",
      photo: p.photo ?? null,
    };
  });

  const matches: Match[] = matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
  const goals: Goal[] = goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Goal));
  const settings = settingsSnap.exists()
    ? ({ ...DEFAULT_SETTINGS, ...settingsSnap.data() } as LeagueSettings)
    : DEFAULT_SETTINGS;

  return { teams, players, matches, goals, settings };
}

function teamInitials(name = "") {
  return name.substring(0, 2).toUpperCase();
}

function formatMatchDate(match: Match) {
  if (!match.scheduledDate) return `Match Week ${match.matchDay ?? "-"}`;
  const parsed = new Date(match.scheduledDate);
  if (Number.isNaN(parsed.getTime())) return `Match Week ${match.matchDay ?? "-"}`;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function PublicLeaguePage() {
  const [activeTab, setActiveTab] = useState<PublicTab>("standings");
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-league"],
    queryFn: fetchPublicLeagueData,
    staleTime: 1000 * 60 * 2,
  });

  const teams = data?.teams ?? EMPTY_TEAMS;
  const players = data?.players ?? EMPTY_PLAYERS;
  const matches = data?.matches ?? EMPTY_MATCHES;
  const goals = data?.goals ?? EMPTY_GOALS;
  const settings = data?.settings ?? DEFAULT_SETTINGS;

  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const standings = useMemo(() => {
    const table = new Map<string, StandingRow>();

    teams.forEach((team) => {
      table.set(team.id, {
        id: team.id,
        name: team.name,
        logo: team.logo,
        color: team.primaryColor,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      });
    });

    matches.forEach((match) => {
      if (match.status !== "played") return;
      const home = table.get(match.homeTeamId);
      const away = table.get(match.awayTeamId);
      if (!home || !away) return;

      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;

      home.played += 1;
      away.played += 1;
      home.gf += homeScore;
      home.ga += awayScore;
      away.gf += awayScore;
      away.ga += homeScore;

      if (homeScore > awayScore) {
        home.won += 1;
        home.pts += settings.pointsWin;
        away.lost += 1;
        away.pts += settings.pointsLoss;
      } else if (homeScore < awayScore) {
        away.won += 1;
        away.pts += settings.pointsWin;
        home.lost += 1;
        home.pts += settings.pointsLoss;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.pts += settings.pointsDraw;
        away.pts += settings.pointsDraw;
      }
    });

    return Array.from(table.values())
      .map((row) => ({ ...row, gd: row.gf - row.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }, [matches, settings.pointsDraw, settings.pointsLoss, settings.pointsWin, teams]);

  const playedMatches = useMemo(
    () => matches.filter((match) => match.status === "played").slice(0, 8),
    [matches],
  );

  const topScorers = useMemo(() => {
    const goalCounts = new Map<string, number>();
    goals.forEach((goal) => goalCounts.set(goal.playerId, (goalCounts.get(goal.playerId) ?? 0) + 1));

    return players
      .map((player) => ({
        player,
        team: teamsById.get(player.teamId),
        goals: goalCounts.get(player.id) ?? 0,
      }))
      .filter((row) => row.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.player.name.localeCompare(b.player.name))
      .slice(0, 10);
  }, [goals, players, teamsById]);

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-sidebar">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-normal text-foreground sm:text-3xl">
                  {settings.seasonName}
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  {settings.leagueVenue || "League table, results, and scorers"}
                </p>
              </div>
            </div>

            <Button onClick={copyShareUrl} className="gap-2 self-start md:self-auto">
              {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile icon={Shield} label="Teams" value={teams.length} />
            <SummaryTile icon={CalendarDays} label="Played" value={matches.filter((m) => m.status === "played").length} />
            <SummaryTile icon={Target} label="Goals" value={goals.length} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-lg border border-border bg-secondary/30 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-md px-2 text-xs font-black uppercase transition-all sm:text-sm",
                  isActive
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <EmptyState
            icon={Trophy}
            title="League data is unavailable"
            message="The public page could not load right now."
          />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "standings" && (
              <motion.div
                key="standings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <StandingsTable standings={standings} />
              </motion.div>
            )}

            {activeTab === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid gap-3"
              >
                {playedMatches.length > 0 ? (
                  playedMatches.map((match) => (
                    <ResultCard key={match.id} match={match} teamsById={teamsById} />
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarDays}
                    title="No results yet"
                    message="Completed matches will appear here."
                  />
                )}
              </motion.div>
            )}

            {activeTab === "scorers" && (
              <motion.div
                key="scorers"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid gap-3"
              >
                {topScorers.length > 0 ? (
                  topScorers.map((row, index) => (
                    <ScorerRow key={row.player.id} row={row} index={index} />
                  ))
                ) : (
                  <EmptyState
                    icon={Medal}
                    title="No scorers yet"
                    message="Goal leaders will appear once goals are recorded."
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </main>
  );
}

function SummaryTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-2xl font-black tabular-nums">{value}</p>
      </div>
      <Icon className="h-5 w-5 text-primary" />
    </div>
  );
}

function StandingsTable({ standings }: { standings: StandingRow[] }) {
  if (standings.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No standings yet"
        message="The table will update after results are recorded."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="bg-secondary/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="w-12 px-4 py-4 text-center">#</th>
              <th className="px-4 py-4">Team</th>
              <th className="px-2 py-4 text-center">P</th>
              <th className="px-2 py-4 text-center">W</th>
              <th className="px-2 py-4 text-center">D</th>
              <th className="px-2 py-4 text-center">L</th>
              <th className="px-2 py-4 text-center">GD</th>
              <th className="px-4 py-4 text-center text-primary">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {standings.map((team, index) => (
              <tr key={team.id} className="transition-colors hover:bg-primary/5">
                <td className="px-4 py-4 text-center font-bold text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-md border border-border">
                      <AvatarImage src={team.logo ?? undefined} />
                      <AvatarFallback style={{ backgroundColor: team.color }} className="text-[10px] text-white">
                        {teamInitials(team.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-center font-medium">{team.played}</td>
                <td className="px-2 py-4 text-center text-muted-foreground">{team.won}</td>
                <td className="px-2 py-4 text-center text-muted-foreground">{team.drawn}</td>
                <td className="px-2 py-4 text-center text-muted-foreground">{team.lost}</td>
                <td className="px-2 py-4 text-center font-mono text-sm">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                <td className="px-4 py-4 text-center">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                    {team.pts}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultCard({ match, teamsById }: { match: Match; teamsById: Map<string, Team> }) {
  const homeTeam = teamsById.get(match.homeTeamId);
  const awayTeam = teamsById.get(match.awayTeamId);

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <span>Match Week {match.matchDay}</span>
        <span>{formatMatchDate(match)}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock team={homeTeam} align="right" />
        <div className="flex min-w-24 items-center justify-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-2">
          <span className="text-2xl font-black tabular-nums">{match.homeScore ?? 0}</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-2xl font-black tabular-nums">{match.awayScore ?? 0}</span>
        </div>
        <TeamBlock team={awayTeam} align="left" />
      </div>
    </article>
  );
}

function TeamBlock({ team, align }: { team?: Team; align: "left" | "right" }) {
  return (
    <div className={cn("flex items-center gap-3", align === "right" ? "justify-end text-right" : "justify-start")}>
      {align === "right" && <span className="hidden text-sm font-bold sm:block">{team?.name ?? "Team"}</span>}
      <Avatar className="h-10 w-10 rounded-lg border border-border">
        <AvatarImage src={team?.logo ?? undefined} />
        <AvatarFallback style={{ backgroundColor: team?.primaryColor }} className="text-xs text-white">
          {teamInitials(team?.name ?? "TM")}
        </AvatarFallback>
      </Avatar>
      {align === "left" && <span className="hidden text-sm font-bold sm:block">{team?.name ?? "Team"}</span>}
    </div>
  );
}

function ScorerRow({
  row,
  index,
}: {
  row: { player: Player; team?: Team; goals: number };
  index: number;
}) {
  return (
    <article className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex w-8 shrink-0 justify-center text-lg font-black text-muted-foreground/60">
          {index + 1}
        </div>
        <Avatar className="h-12 w-12 rounded-lg border border-border">
          <AvatarImage src={row.player.photo ?? undefined} className="object-cover" />
          <AvatarFallback className="bg-secondary text-xs font-bold">
            {teamInitials(row.player.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-normal">{row.player.name}</h2>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.team?.primaryColor ?? "#22c55e" }}
            />
            <span className="truncate">{row.team?.name ?? "Independent"}</span>
          </p>
        </div>
      </div>

      <div className="min-w-16 text-right">
        <div className="text-3xl font-black leading-none text-primary">{row.goals}</div>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Goals</p>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-lg border border-border bg-card" />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-secondary/20 px-4 py-16 text-center">
      <Icon className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
      <h2 className="text-xl font-black tracking-normal">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
