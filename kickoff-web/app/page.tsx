'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  MapPin,
  Menu,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { buildSeasonMetrics } from "@/lib/public-league-metrics";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type LeagueRecord = {
  id: string;
  leagueName?: string | null;
  slug?: string | null;
  logo?: string | null;
  logoUrl?: string | null;
};

type LeagueDirectoryItem = LeagueRecord & {
  teamCount: number;
  playerCount: number;
  goalCount: number;
  seasonName?: string | null;
  recentResult?: RecentResult | null;
  nextFixture?: MatchRecord | null;
  metrics: { label: string; value: number }[];
  teams: { id: string; logo?: string | null; name?: string | null }[];
};

type TeamRecord = {
  id: string;
  leagueId?: string | null;
  league_id?: string | null;
  name?: string | null;
  logo?: string | null;
};

type MatchRecord = {
  id: string;
  leagueId?: string | null;
  league_id?: string | null;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: string | null;
  scheduledDate?: string | null;
  matchDay?: number | null;
  venue?: string | null;
  time?: string | null;
};

type RecentResult = {
  homeId?: string | null;
  awayId?: string | null;
  homeName?: string | null;
  awayName?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  scheduledDate?: string | null;
  matchDay?: number | null;
};

const directoryNav = [
  { label: "Browse Leagues", href: "#browse-leagues" },
  { label: "Start a League", href: "/organizers" },
  { label: "Sign In", href: "/auth" },
];

function getLeagueId(data: TeamRecord | MatchRecord) {
  return data.leagueId ?? data.league_id ?? null;
}

function getLeagueLogo(league: LeagueRecord) {
  return league.logoUrl ?? league.logo ?? null;
}

function safeDateValue(date?: string | null) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatResultDate(result: RecentResult) {
  if (result.scheduledDate) {
    const parsed = new Date(result.scheduledDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }
  }

  return result.matchDay == null ? "Match date not published" : `Match Week ${result.matchDay}`;
}

function teamInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "FC";
}

async function fetchLeagueDirectory(): Promise<LeagueDirectoryItem[]> {
  const [leaguesSnap, teamsSnap, matchesSnap, playersSnap, goalsSnap] = await Promise.all([
    getDocs(collection(db, "leagues")),
    getDocs(collection(db, "teams")),
    getDocs(collection(db, "matches")),
    getDocs(collection(db, "players")),
    getDocs(collection(db, "goals")),
  ]);

  const leagues: LeagueRecord[] = leaguesSnap.docs.map((leagueDoc) => {
    const data = leagueDoc.data();
    return {
      id: leagueDoc.id,
      leagueName: typeof data.leagueName === "string" ? data.leagueName : null,
      slug: typeof data.slug === "string" ? data.slug : null,
      logo: typeof data.logo === "string" ? data.logo : null,
      logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : null,
    };
  });

  const teams: TeamRecord[] = teamsSnap.docs.map((teamDoc) => ({ id: teamDoc.id, ...teamDoc.data() } as TeamRecord));
  const matches: MatchRecord[] = matchesSnap.docs.map((matchDoc) => ({ id: matchDoc.id, ...matchDoc.data() } as MatchRecord));
  const players: { id: string; teamId?: string | null }[] = playersSnap.docs.map((d) => {
    const p = d.data();
    return { id: d.id, teamId: p.team_id ?? p.teamId ?? null };
  });
  const goals: { id: string; teamId?: string | null }[] = goalsSnap.docs.map((goalDoc) => ({ id: goalDoc.id, ...goalDoc.data() }));

  const teamsByLeague = new Map<string, TeamRecord[]>();
  teams.forEach((team) => {
    const leagueId = getLeagueId(team);
    if (!leagueId) return;
    teamsByLeague.set(leagueId, [...(teamsByLeague.get(leagueId) ?? []), team]);
  });

  const teamNames = new Map(teams.map((team) => [team.id, team.name ?? null]));
  const teamLogos = new Map(teams.map((team) => [team.id, team.logo ?? null]));

  const resultsByLeague = new Map<string, MatchRecord[]>();
  const upcomingByLeague = new Map<string, MatchRecord[]>();
  matches.forEach((match) => {
    const leagueId = getLeagueId(match);
    if (!leagueId) return;
    if (match.status === "played") {
      resultsByLeague.set(leagueId, [...(resultsByLeague.get(leagueId) ?? []), match]);
    } else {
      upcomingByLeague.set(leagueId, [...(upcomingByLeague.get(leagueId) ?? []), match]);
    }
  });

  const playersByLeague = new Map<string, { id: string; teamId?: string | null }[]>();
  players.forEach((player) => {
    const team = teams.find((t) => t.id === player.teamId);
    const leagueId = team ? getLeagueId(team) : null;
    if (!leagueId) return;
    playersByLeague.set(leagueId, [...(playersByLeague.get(leagueId) ?? []), player]);
  });

  const settingsByLeague = await Promise.all(
    leagues.map(async (league) => {
      const settingsSnap = await getDoc(doc(db, "settings", league.id));
      const settings = settingsSnap.exists() ? settingsSnap.data() : null;
      return [league.id, typeof settings?.seasonName === "string" ? settings.seasonName : null] as const;
    }),
  );

  const seasonNames = new Map(settingsByLeague);

  return leagues
    .map((league) => {
      const playedMatches = [...(resultsByLeague.get(league.id) ?? [])].sort(
        (a, b) => safeDateValue(b.scheduledDate) - safeDateValue(a.scheduledDate) || (b.matchDay ?? 0) - (a.matchDay ?? 0),
      );
      const recentMatch = playedMatches[0];

      const upcomingMatches = [...(upcomingByLeague.get(league.id) ?? [])]
        .sort((a, b) => safeDateValue(a.scheduledDate) - safeDateValue(b.scheduledDate) || (a.matchDay ?? 0) - (b.matchDay ?? 0));
      const nextFixture = upcomingMatches[0] ?? null;

      const recentResult: RecentResult | null = recentMatch
        ? {
            homeId: recentMatch.homeTeamId,
            awayId: recentMatch.awayTeamId,
            homeName: recentMatch.homeTeamId ? teamNames.get(recentMatch.homeTeamId) ?? null : null,
            awayName: recentMatch.awayTeamId ? teamNames.get(recentMatch.awayTeamId) ?? null : null,
            homeScore: recentMatch.homeScore ?? null,
            awayScore: recentMatch.awayScore ?? null,
            scheduledDate: recentMatch.scheduledDate ?? null,
            matchDay: recentMatch.matchDay ?? null,
          }
        : null;

      const teamObjects = teamsByLeague.get(league.id) ?? [];
      const playerObjects = playersByLeague.get(league.id) ?? [];
      const leagueGoals = goals.filter((goal) => {
        if (!goal.teamId) return false;
        const team = teams.find((t) => t.id === goal.teamId);
        if (!team) return false;
        return getLeagueId(team) === league.id;
      });

      const metrics = buildSeasonMetrics({
        teams: teamObjects,
        players: playerObjects,
        matches: playedMatches,
        goals: leagueGoals,
      });

      return {
        ...league,
        teamCount: teamObjects.length,
        playerCount: playerObjects.length,
        goalCount: leagueGoals.length,
        seasonName: seasonNames.get(league.id) ?? null,
        recentResult,
        nextFixture,
        metrics,
        teams: teamObjects.map((t) => ({ id: t.id, logo: t.logo ?? null, name: t.name ?? null })),
      };
    })
    .sort((a, b) => {
      const aName = a.leagueName?.trim();
      const bName = b.leagueName?.trim();
      if (aName && bName) return aName.localeCompare(bName);
      if (aName) return -1;
      if (bName) return 1;
      return a.id.localeCompare(b.id);
    });
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: leagues = [], isLoading, isError } = useQuery({
    queryKey: ["league-directory"],
    queryFn: fetchLeagueDirectory,
    staleTime: 1000 * 60 * 2,
  });

  const totalTeams = useMemo(() => leagues.reduce((sum, league) => sum + league.teamCount, 0), [leagues]);
  const playedLeagues = useMemo(() => leagues.filter((league) => league.recentResult).length, [leagues]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07130f] text-white">
      <DirectoryNav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <section id="browse-leagues" className="relative min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(38,194,103,0.18),transparent_34%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(245,200,75,0.08),transparent)]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#51d884]">League Directory</p>
              <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Browse leagues</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-md border border-white/10 bg-white/[0.05] p-2 backdrop-blur md:min-w-[420px]">
              <DirectoryStat label="Leagues" value={leagues.length} loading={isLoading} />
              <DirectoryStat label="Teams" value={totalTeams} loading={isLoading} />
              <DirectoryStat label="With Results" value={playedLeagues} loading={isLoading} />
            </div>
          </motion.div>

          {isLoading ? <LeagueGridSkeleton /> : null}
          {isError ? <DirectoryError /> : null}
          {!isLoading && !isError && leagues.length > 0 ? <LeagueGrid leagues={leagues} /> : null}
          {!isLoading && !isError && leagues.length === 0 ? <ZeroLeaguesState /> : null}
        </div>
      </section>
    </main>
  );
}

function DirectoryNav({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07130f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex h-14 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-[150px] w-[170px]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {directoryNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild className="hidden h-10 rounded-md bg-[#f5c84b] px-4 font-bold text-[#102018] hover:bg-[#ffd869] lg:inline-flex">
          <Link href="/organizers">Start a League</Link>
        </Button>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-[#07130f] px-4 py-4 lg:hidden">
          <nav className="grid gap-1">
            {directoryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white/78 hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LeagueGrid({ leagues }: { leagues: LeagueDirectoryItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {leagues.map((league, index) => (
        <motion.div
          key={league.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.35 }}
        >
          <LeagueCard league={league} />
        </motion.div>
      ))}
    </div>
  );
}

function LeagueCard({ league }: { league: LeagueDirectoryItem }) {
  const logo = getLeagueLogo(league);
  const data = teamDataFor(league);
  const content = (
    <article className="relative flex h-full min-h-[360px] flex-col rounded-md border border-white/10 bg-white/[0.05] p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#51d884]/35 hover:bg-white/[0.075]">
      {/* Stamp Mark — top right, rotated */}
      <div
        className="absolute right-5 top-5 z-20 h-16 w-16 rotate-[-6deg] rounded-full border-2 border-[#ff5e2c]/70 bg-[#ff5e2c]/10"
        aria-hidden="true"
      >
        <span className="flex h-full w-full items-center justify-center font-display text-[10px] font-bold uppercase leading-tight tracking-wider text-[#ff5e2c]">
          KICKOFF
          <br />
          LEAGUE
        </span>
      </div>

      {/* Identity zone */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[#102018]">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={league.leagueName ? `${league.leagueName} logo` : "League logo"} className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs font-black text-white/38">No logo</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black text-white">{league.leagueName?.trim() || "League name missing"}</h2>
          <p className="mt-1 truncate text-sm font-semibold text-white/48">
            {league.seasonName?.trim() || "Season settings not published"}
          </p>
          <div className="mt-3 flex items-center gap-4">
            {league.metrics
              .filter((metric) => ["Teams", "Players", "Played", "Goals"].includes(metric.label))
              .map((metric) => (
                <MiniStatCompact key={metric.label} label={metric.label} value={metric.value} />
              ))}
          </div>
        </div>
      </div>

      {/* Perforated divider */}
      <div className="relative mt-6">
        <div className="border-t-2 border-dashed border-white/15" />
        <div className="absolute -left-2 -right-2 top-[-9px] flex justify-between">
          <span className="h-4 w-4 rounded-full bg-[#07130f]" />
          <span className="h-4 w-4 rounded-full bg-[#07130f]" />
        </div>
      </div>

      {/* Stub zone */}
      <div className="mt-5 space-y-5 flex-1">
        {/* Next Fixture */}
        <StubSectionHeading icon={CalendarDays} label="Next Fixture" />
        {league.nextFixture ? (
          <div className="rounded-md border border-white/8 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-2">
              {league.nextFixture.homeTeamId ? (
                <TeamOrFallback teamId={league.nextFixture.homeTeamId} teamData={data} />
              ) : (
                <p className="truncate text-right text-xs font-black text-white">Home</p>
              )}
              <span className="font-display text-sm font-bold text-white/45">VS</span>
              {league.nextFixture.awayTeamId ? (
                <TeamOrFallback teamId={league.nextFixture.awayTeamId} teamData={data} />
              ) : (
                <p className="truncate text-left text-xs font-black text-white">Away</p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 font-body text-[10px] font-semibold text-white/45">
              <MapPin className="h-3 w-3" />
              <span>{league.nextFixture.venue || "Venue not announced"}</span>
              <span>·</span>
              <span>{formatResultDate({ ...league.nextFixture })}</span>
            </div>
          </div>
        ) : (
          <p className="font-body text-xs italic text-white/42">No upcoming fixture scheduled</p>
        )}

        {/* Most Recent Result */}
        <div>
          <StubSectionHeading icon={Trophy} label="Most Recent Result" />
          {league.recentResult ? (
            <ScoreboardResult result={league.recentResult} teamData={data} />
          ) : (
            <p className="font-body text-xs italic text-white/42">No completed result has been published for this league.</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="truncate text-sm font-semibold text-white/42">{league.slug?.trim() || "Public link slug missing"}</span>
        <span className={cn("inline-flex items-center text-sm font-black", league.slug ? "text-[#51d884] group-hover:text-[#7df0a2]" : "text-white/32")}>
          Open
          <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      </div>
    </article>
  );

  if (!league.slug?.trim()) {
    return <div aria-disabled="true">{content}</div>;
  }

  return <Link href={`/public-league/${league.slug}`}>{content}</Link>;
}

function teamDataFor(league: LeagueDirectoryItem): Map<string, { name: string; logo: string | null }> {
  return new Map(league.teams.map((t) => [t.id, { name: t.name?.trim() || t.id, logo: t.logo ?? null }]));
}

function TeamOrFallback({ teamId, teamData }: { teamId: string; teamData: Map<string, { name: string; logo: string | null }> }) {
  const info = teamData.get(teamId);
  const teamName = info?.name ?? teamId;
  const logo = info?.logo ?? null;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7 rounded-sm border border-white/10">
        <AvatarImage src={logo ?? undefined} />
        <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">{teamInitials(teamName)}</AvatarFallback>
      </Avatar>
      <span className="truncate text-xs font-black text-white">{teamName || "TBD"}</span>
    </div>
  );
}

function StubSectionHeading({ icon: Icon, label }: { icon: typeof CalendarDays; label: string }) {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-[#51d884]" />
      <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
    </div>
  );
}

function ScoreboardResult({ result, teamData }: { result: RecentResult; teamData: Map<string, { name: string; logo: string | null }> }) {
  const homeInfo = result.homeId ? teamData.get(result.homeId) : null;
  const awayInfo = result.awayId ? teamData.get(result.awayId) : null;
  const homeLogo = homeInfo?.logo ?? null;
  const awayLogo = awayInfo?.logo ?? null;
  const homeName = result.homeName?.trim() || "Home";
  const awayName = result.awayName?.trim() || "Away";
  const homeScore = result.homeScore ?? 0;
  const awayScore = result.awayScore ?? 0;
  const draw = homeScore === awayScore;

  return (
    <div className="rounded-md border border-white/8 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 rounded-sm border border-white/10">
            <AvatarImage src={homeLogo ?? undefined} />
            <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">{teamInitials(homeName)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-black text-white">{homeName}</span>
        </div>
        <div className="flex items-center gap-1">
          <ScoreboardDigit value={homeScore} highlight={!draw} />
          <span className="mx-1 font-display text-sm font-bold text-white/45">:</span>
          <ScoreboardDigit value={awayScore} highlight={!draw} />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 rounded-sm border border-white/10">
            <AvatarImage src={awayLogo ?? undefined} />
            <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">{teamInitials(awayName)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-black text-white">{awayName}</span>
        </div>
        <span className="font-body text-[10px] font-bold text-white/40">{formatResultDate(result)}</span>
      </div>
    </div>
  );
}

function ScoreboardDigit({ value, highlight = false }: { value: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center font-display text-lg font-bold leading-none tabular-nums",
        highlight ? "bg-[#26c267] text-[#06110d]" : "bg-[#102018] text-white dark:bg-black dark:text-white",
        "shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]"
      )}
      style={{ borderRadius: 2 }}
    >
      {value}
    </span>
  );
}

function MiniStatCompact({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-sm font-bold leading-none text-white tabular-nums">{value}</span>
      <span className="font-body text-[10px] font-semibold text-white/40">{label}</span>
    </div>
  );
}

function DirectoryStat({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="rounded-md bg-[#07130f]/70 p-3 text-center">
      <p className="text-2xl font-black text-white tabular-nums">{loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-white/45" /> : value}</p>
      <p className="text-xs font-semibold text-white/42">{label}</p>
    </div>
  );
}

function LeagueGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[360px] animate-pulse rounded-md border border-white/8 bg-white/[0.05]" />
      ))}
    </div>
  );
}

function DirectoryError() {
  return (
    <div className="rounded-md border border-red-300/20 bg-red-500/10 p-6 text-center">
      <Shield className="mx-auto mb-3 h-8 w-8 text-red-200/70" />
      <h2 className="text-xl font-black text-white">League directory could not load</h2>
      <p className="mt-2 text-sm font-semibold text-white/55">The public league collection is allowed by rules, so check the client Firestore request or project configuration.</p>
    </div>
  );
}

function ZeroLeaguesState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grid gap-4 lg:grid-cols-[1fr_0.75fr]"
    >
      <div className="rounded-md border border-white/10 bg-white/[0.05] p-6 backdrop-blur sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f5c84b]">No leagues yet</p>
        <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Start the first public league</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">
          Fans will see the league directory here once a league has been created. Until then, organizers can create the first competition and publish the public fan page.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-md bg-[#26c267] px-5 font-bold text-[#06110d] hover:bg-[#51d884]">
            <Link href="/organizers">
              Start a League
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-md border-white/25 bg-white/10 px-5 font-bold text-white hover:bg-white/18 hover:text-white">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-md border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-[#f5c84b]/15 text-[#f5c84b]">
          <Trophy className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-black text-white">What appears here next</h3>
        <div className="mt-5 grid gap-3">
          <EmptyPreviewRow label="League name" value="Shown from the league document" />
          <EmptyPreviewRow label="Season" value="Shown from settings/{leagueId}" />
          <EmptyPreviewRow label="Teams" value="Counted from public team records" />
          <EmptyPreviewRow label="Results" value="Shown after completed matches exist" />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyPreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/8 bg-[#07130f]/70 p-3">
      <p className="text-sm font-black text-white">{label}</p>
      <p className="mt-1 text-xs font-semibold text-white/42">{value}</p>
    </div>
  );
}
