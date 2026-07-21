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
  Menu,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  seasonName?: string | null;
  recentResult?: RecentResult | null;
  formGuide: LeagueFormMark[];
};

type TeamRecord = {
  id: string;
  leagueId?: string | null;
  league_id?: string | null;
  name?: string | null;
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
};

type RecentResult = {
  homeName?: string | null;
  awayName?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  scheduledDate?: string | null;
  matchDay?: number | null;
};

type LeagueFormMark = {
  id: string;
  result: "W" | "D" | "L" | null;
  label: string;
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

function getResultMark(match: MatchRecord): LeagueFormMark["result"] {
  if (match.homeScore == null || match.awayScore == null) return null;
  if (match.homeScore === match.awayScore) return "D";
  return match.homeScore > match.awayScore ? "W" : "L";
}

async function fetchLeagueDirectory(): Promise<LeagueDirectoryItem[]> {
  const [leaguesSnap, teamsSnap, matchesSnap] = await Promise.all([
    getDocs(collection(db, "leagues")),
    getDocs(collection(db, "teams")),
    getDocs(collection(db, "matches")),
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

  const teamsByLeague = new Map<string, TeamRecord[]>();
  teams.forEach((team) => {
    const leagueId = getLeagueId(team);
    if (!leagueId) return;
    teamsByLeague.set(leagueId, [...(teamsByLeague.get(leagueId) ?? []), team]);
  });

  const teamNames = new Map(teams.map((team) => [team.id, team.name ?? null]));

  const resultsByLeague = new Map<string, MatchRecord[]>();
  matches
    .filter((match) => match.status === "played")
    .forEach((match) => {
      const leagueId = getLeagueId(match);
      if (!leagueId) return;
      resultsByLeague.set(leagueId, [...(resultsByLeague.get(leagueId) ?? []), match]);
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

      const recentResult: RecentResult | null = recentMatch
        ? {
            homeName: recentMatch.homeTeamId ? teamNames.get(recentMatch.homeTeamId) ?? null : null,
            awayName: recentMatch.awayTeamId ? teamNames.get(recentMatch.awayTeamId) ?? null : null,
            homeScore: recentMatch.homeScore ?? null,
            awayScore: recentMatch.awayScore ?? null,
            scheduledDate: recentMatch.scheduledDate ?? null,
            matchDay: recentMatch.matchDay ?? null,
          }
        : null;

      const formGuide = playedMatches.slice(0, 5).map((match) => {
        const homeName = match.homeTeamId ? teamNames.get(match.homeTeamId) ?? "Home team name missing" : "Home team name missing";
        const awayName = match.awayTeamId ? teamNames.get(match.awayTeamId) ?? "Away team name missing" : "Away team name missing";
        return {
          id: match.id,
          result: getResultMark(match),
          label: `${homeName} vs ${awayName}`,
        };
      });

      return {
        ...league,
        teamCount: teamsByLeague.get(league.id)?.length ?? 0,
        seasonName: seasonNames.get(league.id) ?? null,
        recentResult,
        formGuide,
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
  const content = (
    <article className="group flex h-full min-h-[310px] flex-col rounded-md border border-white/10 bg-white/[0.05] p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#51d884]/35 hover:bg-white/[0.075]">
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
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <SnapshotTile icon={Users} label="Teams" value={league.teamCount} />
      </div>

      <FormGuide marks={league.formGuide} />

      <div className="mt-4 flex-1 rounded-md border border-white/8 bg-[#07130f]/70 p-4">
        <RecentResultDisplay result={league.recentResult} />
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

function SnapshotTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/8 bg-white/[0.04] p-3">
      <Icon className="mb-2 h-4 w-4 text-[#51d884]" />
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-xs font-semibold text-white/42">{label}</p>
    </div>
  );
}

function FormGuide({ marks }: { marks: LeagueFormMark[] }) {
  return (
    <div className="mt-4 rounded-md border border-white/8 bg-white/[0.04] p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50">
        <CalendarDays className="h-4 w-4 text-[#51d884]" />
        Last 5 Form
      </div>
      {marks.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {marks.map((mark) => (
            <span
              key={mark.id}
              title={mark.result ? mark.label : `${mark.label} - score missing`}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-black",
                mark.result === "W" && "bg-[#51d884] text-[#06110d]",
                mark.result === "D" && "bg-[#f5c84b] text-[#102018]",
                mark.result === "L" && "bg-white/14 text-white",
                mark.result == null && "border border-white/14 bg-transparent text-white/45",
              )}
            >
              {mark.result ?? "?"}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold text-white/42">No completed matches are available for a form guide.</p>
      )}
    </div>
  );
}

function RecentResultDisplay({ result }: { result?: RecentResult | null }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/72">
        <Trophy className="h-4 w-4 text-[#f5c84b]" />
        Most Recent Result
      </div>
      {result ? <RecentResultBlock result={result} /> : <p className="text-sm font-semibold text-white/42">No completed result has been published for this league.</p>}
    </div>
  );
}

function RecentResultBlock({ result }: { result: RecentResult }) {
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="truncate text-right text-sm font-black text-white">{result.homeName?.trim() || "Home team name missing"}</p>
        <div className="rounded-md bg-white/10 px-3 py-2 text-center font-mono text-lg font-black text-white">
          {result.homeScore == null || result.awayScore == null ? "Score missing" : `${result.homeScore}-${result.awayScore}`}
        </div>
        <p className="truncate text-sm font-black text-white">{result.awayName?.trim() || "Away team name missing"}</p>
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-white/42">{formatResultDate(result)}</p>
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
        <div key={index} className="h-[310px] animate-pulse rounded-md border border-white/8 bg-white/[0.05]" />
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
