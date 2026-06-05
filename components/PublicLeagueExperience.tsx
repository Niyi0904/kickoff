'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Clipboard,
  ClipboardCheck,
  Clock,
  Goal,
  LayoutDashboard,
  Loader2,
  MapPin,
  Medal,
  Menu,
  Megaphone,
  Play,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor: string;
  stadium?: string | null;
  founded?: string | null;
};

type Player = {
  id: string;
  name: string;
  teamId: string;
  photo?: string | null;
  number?: string | number | null;
  position?: string | null;
};

type MatchStatus = "upcoming" | "played";

type Match = {
  id: string;
  matchDay: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  scheduledDate?: string;
  time?: string;
  league?: string;
  venue?: string;
  minutesPlayed?: number;
};

type EventRecord = {
  id: string;
  playerId: string;
  teamId: string;
  matchId?: string;
  timestamp?: { seconds?: number };
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
  form: string[];
};

type LeagueSettings = {
  seasonName: string;
  leagueVenue: string;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  matchDay?: string;
  defaultTime?: string;
};

type PublicLeagueData = {
  teams: Team[];
  players: Player[];
  matches: Match[];
  goals: EventRecord[];
  assists: EventRecord[];
  yellowCards: EventRecord[];
  redCards: EventRecord[];
  settings: LeagueSettings;
};

type PublicNavItem = {
  label: string;
  href: string;
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
const EMPTY_EVENTS: EventRecord[] = [];

const navItems: PublicNavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Leagues", href: "#leagues" },
  { label: "Fixtures", href: "#fixtures" },
  { label: "Standings", href: "#standings" },
  { label: "Teams", href: "#teams" },
  { label: "Players", href: "#players" },
  { label: "Statistics", href: "#statistics" },
  { label: "About", href: "#about" },
];

const platformFeatures = [
  { title: "League Management", text: "Season setup, clubs, managers, and role-aware league control.", icon: Trophy },
  { title: "Fixture Scheduling", text: "Organize match weeks, kickoff times, venues, and generated schedules.", icon: CalendarClock },
  { title: "Match Reporting", text: "Capture scores, discipline, attendance, goals, assists, and final reports.", icon: Clipboard },
  { title: "Statistics Tracking", text: "Public tables, leaders, form, scorers, assists, and performance stories.", icon: Activity },
  { title: "Team Management", text: "Club profiles, squad lists, team branding, managers, and player links.", icon: ShieldCheck },
  { title: "Player Registration", text: "Invite-based accounts with profile linking and player dashboard access.", icon: UserRound },
];

const testimonials = [
  {
    quote: "The league table, fixtures, and scorer race are easy for everyone to follow.",
    name: "League Organizer",
    role: "Competition Admin",
  },
  {
    quote: "Players can see the season story without waiting for a group chat update.",
    name: "Team Captain",
    role: "Club Representative",
  },
  {
    quote: "Sponsors and supporters get a polished public view of the competition.",
    name: "Community Partner",
    role: "Local Sponsor",
  },
];

const faqs = [
  {
    question: "Can visitors browse league information without logging in?",
    answer: "Yes. Public standings, fixtures, teams, results, and statistics are available before authentication.",
  },
  {
    question: "When is login required?",
    answer: "Login is required for private dashboards, administration, team management, account actions, and protected workflows.",
  },
  {
    question: "How does the Profile Dashboard button work?",
    answer: "Signed-in users go directly to the dashboard. Guests are sent to login and then returned to the dashboard.",
  },
  {
    question: "Can teams and players be featured here?",
    answer: "Yes. Public team, player, fixture, and performance data is surfaced automatically as the season progresses.",
  },
];

async function fetchPublicLeagueData(): Promise<PublicLeagueData> {
  const [teamsSnap, playersSnap, matchesSnap, goalsSnap, assistsSnap, yellowsSnap, redsSnap, settingsSnap] =
    await Promise.all([
      getDocs(collection(db, "teams")),
      getDocs(collection(db, "players")),
      getDocs(query(collection(db, "matches"), orderBy("matchDay", "desc"))),
      getDocs(collection(db, "goals")),
      getDocs(collection(db, "assists")),
      getDocs(collection(db, "yellow_cards")),
      getDocs(collection(db, "red_cards")),
      getDoc(doc(db, "settings", "league")),
    ]);

  const teams: Team[] = teamsSnap.docs.map((d) => {
    const team = d.data();
    return {
      id: d.id,
      name: team.name ?? "Unnamed Team",
      logo: team.logo ?? null,
      primaryColor: team.primary_color ?? team.primaryColor ?? "#22c55e",
      stadium: team.stadium ?? null,
      founded: team.founded ?? null,
    };
  });

  const players: Player[] = playersSnap.docs.map((d) => {
    const player = d.data();
    return {
      id: d.id,
      name: player.name ?? "Unnamed Player",
      teamId: player.team_id ?? player.teamId ?? "",
      photo: player.photo ?? null,
      number: player.number ?? null,
      position: player.position ?? null,
    };
  });

  const matches: Match[] = matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
  const goals: EventRecord[] = goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const assists: EventRecord[] = assistsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const yellowCards: EventRecord[] = yellowsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const redCards: EventRecord[] = redsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const settings = settingsSnap.exists()
    ? ({ ...DEFAULT_SETTINGS, ...settingsSnap.data() } as LeagueSettings)
    : DEFAULT_SETTINGS;

  return { teams, players, matches, goals, assists, yellowCards, redCards, settings };
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

function safeDateValue(date?: string) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatMatchDate(match: Match) {
  if (!match.scheduledDate) return `Match Week ${match.matchDay ?? "-"}`;
  const parsed = new Date(match.scheduledDate);
  if (Number.isNaN(parsed.getTime())) return `Match Week ${match.matchDay ?? "-"}`;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(time?: string) {
  if (!time) return "";
  const [hourValue, minuteValue = "00"] = time.split(":");
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteValue.padStart(2, "0")} ${suffix}`;
}

function countByPlayer(records: EventRecord[]) {
  const counts = new Map<string, number>();
  records.forEach((record) => counts.set(record.playerId, (counts.get(record.playerId) ?? 0) + 1));
  return counts;
}

export function PublicLeagueExperience() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-league"],
    queryFn: fetchPublicLeagueData,
    staleTime: 1000 * 60 * 2,
  });

  const teams = data?.teams ?? EMPTY_TEAMS;
  const players = data?.players ?? EMPTY_PLAYERS;
  const matches = data?.matches ?? EMPTY_MATCHES;
  const goals = data?.goals ?? EMPTY_EVENTS;
  const assists = data?.assists ?? EMPTY_EVENTS;
  const yellowCards = data?.yellowCards ?? EMPTY_EVENTS;
  const redCards = data?.redCards ?? EMPTY_EVENTS;
  const settings = data?.settings ?? DEFAULT_SETTINGS;

  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const playersById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const goalCounts = useMemo(() => countByPlayer(goals), [goals]);
  const assistCounts = useMemo(() => countByPlayer(assists), [assists]);

  const playedMatches = useMemo(
    () =>
      matches
        .filter((match) => match.status === "played")
        .sort((a, b) => safeDateValue(b.scheduledDate) - safeDateValue(a.scheduledDate) || (b.matchDay ?? 0) - (a.matchDay ?? 0)),
    [matches],
  );

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((match) => match.status !== "played")
        .sort((a, b) => safeDateValue(a.scheduledDate) - safeDateValue(b.scheduledDate) || (a.matchDay ?? 0) - (b.matchDay ?? 0)),
    [matches],
  );

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
        form: [],
      });
    });

    [...playedMatches].reverse().forEach((match) => {
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
        away.lost += 1;
        home.pts += settings.pointsWin;
        away.pts += settings.pointsLoss;
        home.form.push("W");
        away.form.push("L");
      } else if (homeScore < awayScore) {
        away.won += 1;
        home.lost += 1;
        away.pts += settings.pointsWin;
        home.pts += settings.pointsLoss;
        away.form.push("W");
        home.form.push("L");
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.pts += settings.pointsDraw;
        away.pts += settings.pointsDraw;
        home.form.push("D");
        away.form.push("D");
      }
    });

    return Array.from(table.values())
      .map((row) => ({ ...row, gd: row.gf - row.ga, form: row.form.slice(-5).reverse() }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
  }, [playedMatches, settings.pointsDraw, settings.pointsLoss, settings.pointsWin, teams]);

  const topScorers = useMemo(
    () =>
      players
        .map((player) => ({
          player,
          team: teamsById.get(player.teamId),
          goals: goalCounts.get(player.id) ?? 0,
          assists: assistCounts.get(player.id) ?? 0,
        }))
        .filter((row) => row.goals > 0 || row.assists > 0)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.player.name.localeCompare(b.player.name))
        .slice(0, 6),
    [assistCounts, goalCounts, players, teamsById],
  );

  const defensiveLeaders = useMemo(
    () =>
      standings
        .filter((team) => team.played > 0)
        .sort((a, b) => a.ga - b.ga || b.pts - a.pts)
        .slice(0, 3),
    [standings],
  );

  const featuredTeams = useMemo(
    () =>
      standings.slice(0, 6).map((row) => ({
        ...row,
        team: teamsById.get(row.id),
        players: players.filter((player) => player.teamId === row.id).length,
      })),
    [players, standings, teamsById],
  );

  const activityFeed = useMemo(() => {
    const goalEvents = goals.map((event) => ({ ...event, type: "Goal" }));
    const assistEvents = assists.map((event) => ({ ...event, type: "Assist" }));
    const yellowEvents = yellowCards.map((event) => ({ ...event, type: "Yellow Card" }));
    const redEvents = redCards.map((event) => ({ ...event, type: "Red Card" }));

    return [...goalEvents, ...assistEvents, ...yellowEvents, ...redEvents]
      .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
      .slice(0, 6);
  }, [assists, goals, redCards, yellowCards]);

  const metrics = [
    { label: "Active Teams", value: teams.length, icon: Shield },
    { label: "Registered Players", value: players.length, icon: Users },
    { label: "Matches Played", value: playedMatches.length, icon: CalendarDays },
    { label: "Goals Scored", value: goals.length, icon: Goal },
  ];

  const profileHref = user ? "/dashboard" : "/auth?redirect=/dashboard";
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
      <PublicHeader
        navItems={navItems}
        profileHref={profileHref}
        authLoading={authLoading}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <section id="home" className="relative min-h-[88vh] overflow-hidden pt-20 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1800&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#03120d]/75" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,13,0.96),rgba(3,18,13,0.62),rgba(3,18,13,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07130f] to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(88vh-5rem)] max-w-7xl flex-col justify-center px-4 pb-12 pt-10 sm:px-6 lg:px-8 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#f5c84b]" />
              {settings.seasonName}
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              Football league management with a live matchday pulse.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              Explore clubs, fixtures, tables, results, and top performers from one polished public home for the season.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-md bg-[#26c267] px-5 font-bold text-[#06110d] hover:bg-[#51d884]">
                <Link href="#leagues">
                  Explore League
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-md border-white/25 bg-white/10 px-5 font-bold text-white hover:bg-white/18 hover:text-white">
                <Link href={profileHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Profile Dashboard
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.4 }}
              >
                <MetricTile {...metric} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatusStrip
        isLoading={isLoading}
        isError={isError}
        settings={settings}
        nextMatch={upcomingMatches[0]}
        teamsById={teamsById}
      />

      <section id="leagues" className="bg-[#07130f] px-4 py-16 sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto max-w-7xl min-w-0">
          <SectionHeader
            eyebrow="League Overview"
            title="A complete public season hub"
            text="Every public section is powered by live league data so visitors can understand the competition before signing in."
          />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] min-w-0">
            <LeagueCard settings={settings} teams={teams} players={players} matches={matches} goals={goals} />
            <ActivityPanel
              activityFeed={activityFeed}
              teamsById={teamsById}
              playersById={playersById}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>

      <section id="fixtures" className="bg-[#f4f7f1] px-4 py-16 text-[#102018] sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto max-w-7xl min-w-0">
          <SectionHeader
            eyebrow="Fixtures"
            title="Upcoming matches and recent results"
            text="Match cards highlight kickoff context, team identity, venue details, and the latest scorelines."
            light
          />
          <div className="grid gap-4 lg:grid-cols-2 min-w-0">
            <FixtureColumn title="Next Fixtures" icon={CalendarClock} matches={upcomingMatches.slice(0, 4)} teamsById={teamsById} empty="No upcoming fixtures yet." />
            <FixtureColumn title="Recent Results" icon={Play} matches={playedMatches.slice(0, 4)} teamsById={teamsById} empty="Completed matches will appear here." />
          </div>
        </div>
      </section>

      <section id="standings" className="bg-[#07130f] px-4 py-16 sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_0.65fr] min-w-0">
          <div className="min-w-0">
            <SectionHeader
              eyebrow="Standings Preview"
              title="The title race at a glance"
              text="A compact public table gives visitors the core league story without entering the protected dashboard."
            />
            <StandingsTable standings={standings.slice(0, 8)} />
          </div>
          <div id="statistics" className="space-y-4 min-w-0">
            <SectionHeader
              eyebrow="Statistics"
              title="Top performers"
              text="Goals, assists, defensive records, and public leaders keep the season discoverable."
            />
            <TopPerformers rows={topScorers} defensiveLeaders={defensiveLeaders} />
          </div>
        </div>
      </section>

      <section id="teams" className="bg-[#f4f7f1] px-4 py-16 text-[#102018] sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto max-w-7xl min-w-0">
          <SectionHeader
            eyebrow="Featured Teams"
            title="Clubs with form, identity, and momentum"
            text="Team cards combine branding, squad size, points, recent form, and season performance."
            light
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {featuredTeams.length > 0 ? (
              featuredTeams.map((team) => <TeamFeatureCard key={team.id} row={team} />)
            ) : (
              <EmptySurface icon={Shield} title="No teams yet" text="Teams will appear when public team records are available." light />
            )}
          </div>
        </div>
      </section>

      <section id="players" className="bg-[#07130f] px-4 py-16 sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto max-w-7xl min-w-0">
          <SectionHeader
            eyebrow="Player Spotlight"
            title="Golden boot race and playmakers"
            text="A public performance layer turns recorded match events into a season narrative for fans, clubs, and players."
          />
          <PlayerSpotlight rows={topScorers} />
        </div>
      </section>

      <section id="about" className="bg-[#f4f7f1] px-4 py-16 text-[#102018] sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto max-w-7xl min-w-0">
          <SectionHeader
            eyebrow="Platform Features"
            title="Built for organizers, teams, players, and supporters"
            text="Public discovery and protected operations work together so the league feels credible before login and powerful after it."
            light
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {platformFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07130f] px-4 py-16 sm:px-6 lg:px-8 min-w-0 overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] min-w-0">
          <div className="min-w-0">
            <SectionHeader
              eyebrow="Community"
              title="A public face for the whole league"
              text="The experience supports visitors, clubs, players, organizers, and partners with a professional view of the competition."
            />
            <div className="grid gap-4 min-w-0">
              {testimonials.map((item) => (
                <TestimonialCard key={item.name} item={item} />
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <SectionHeader
              eyebrow="FAQ"
              title="Clear answers before sign in"
              text="Public browsing stays separate from protected account actions."
            />
            <div className="grid gap-3 min-w-0">
              {faqs.map((faq) => (
                <FaqCard key={faq.question} faq={faq} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7f1] px-4 py-16 text-[#102018] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-y border-[#102018]/12 py-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-black leading-tight sm:text-5xl">Ready to step into the league?</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#526357]">
                Explore the public competition layer, then move into your dashboard when it is time to manage teams, profiles, or administration.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild className="h-12 rounded-md bg-[#102018] px-5 font-bold text-white hover:bg-[#1d3428]">
                <Link href={profileHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Profile Dashboard
                </Link>
              </Button>
              <Button onClick={copyShareUrl} variant="outline" className="h-12 rounded-md border-[#102018]/20 px-5 font-bold text-[#102018] hover:bg-[#102018]/5">
                {copied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                {copied ? "Link Copied" : "Share League"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter navItems={navItems} profileHref={profileHref} />
    </main>
  );
}

function PublicHeader({
  navItems,
  profileHref,
  authLoading,
  mobileOpen,
  setMobileOpen,
}: {
  navItems: PublicNavItem[];
  profileHref: string;
  authLoading: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07130f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#26c267] text-[#06110d]">
            <Trophy className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xl font-black leading-none text-white">KICKOFF</span>
            <span className="text-xs font-semibold text-white/55">League Platform</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild className="h-10 rounded-md bg-[#f5c84b] px-4 font-bold text-[#102018] hover:bg-[#ffd869]">
            <Link href={profileHref}>
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutDashboard className="mr-2 h-4 w-4" />}
              Profile Dashboard
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white lg:hidden"
          aria-label="Toggle public navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#07130f] px-4 py-4 lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white/78 hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button asChild className="mt-4 h-11 w-full rounded-md bg-[#f5c84b] font-bold text-[#102018] hover:bg-[#ffd869]">
            <Link href={profileHref} onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Profile Dashboard
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}

function MetricTile({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-white/14 bg-white/10 p-4 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-white/65">{label}</span>
        <Icon className="h-5 w-5 text-[#f5c84b]" />
      </div>
      <div className="text-4xl font-black tabular-nums text-white">{value}</div>
    </div>
  );
}

function StatusStrip({
  isLoading,
  isError,
  settings,
  nextMatch,
  teamsById,
}: {
  isLoading: boolean;
  isError: boolean;
  settings: LeagueSettings;
  nextMatch?: Match;
  teamsById: Map<string, Team>;
}) {
  const home = nextMatch ? teamsById.get(nextMatch.homeTeamId) : null;
  const away = nextMatch ? teamsById.get(nextMatch.awayTeamId) : null;

  return (
    <section className="border-y border-white/10 bg-[#0c1b14] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        <StripItem icon={BadgeCheck} label="Season" value={settings.seasonName} />
        <StripItem icon={MapPin} label="Venue" value={settings.leagueVenue || "Venue to be announced"} />
        <StripItem
          icon={Clock}
          label="Next Kickoff"
          value={
            isLoading
              ? "Loading fixtures"
              : isError
                ? "Public data unavailable"
                : nextMatch
                  ? `${home?.name ?? "Home"} vs ${away?.name ?? "Away"} - ${formatMatchDate(nextMatch)}`
                  : "Fixture schedule pending"
          }
        />
      </div>
    </section>
  );
}

function StripItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-[#26c267]" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white/45">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text: string; light?: boolean }) {
  return (
    <div className="mb-8 max-w-3xl">
      <div className={cn("mb-3 flex items-center gap-2 text-sm font-bold", light ? "text-[#2a7b4f]" : "text-[#51d884]")}>
        <span className={cn("h-2 w-2 rounded-full", light ? "bg-[#2a7b4f]" : "bg-[#51d884]")} />
        {eyebrow}
      </div>
      <h2 className={cn("text-3xl font-black leading-tight sm:text-4xl", light ? "text-[#102018]" : "text-white")}>{title}</h2>
      <p className={cn("mt-3 text-base leading-7", light ? "text-[#526357]" : "text-white/62")}>{text}</p>
    </div>
  );
}

function LeagueCard({
  settings,
  teams,
  players,
  matches,
  goals,
}: {
  settings: LeagueSettings;
  teams: Team[];
  players: Player[];
  matches: Match[];
  goals: EventRecord[];
}) {
  const played = matches.filter((match) => match.status === "played").length;
  const upcoming = matches.filter((match) => match.status !== "played").length;
  const seasonMetrics = [
    { label: "Teams", value: teams.length },
    { label: "Players", value: players.length },
    { label: "Played", value: played },
    { label: "Upcoming", value: upcoming },
    { label: "Goals", value: goals.length },
  ];

  return (
    <article className="overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-6">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#26c267]/15 px-3 py-2 text-sm font-bold text-[#51d884]">
            <Trophy className="h-4 w-4" />
            Active Competition
          </div>
          <h3 className="text-3xl font-black text-white">{settings.seasonName}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
            A public league layer for standings, fixtures, recent activity, team profiles, and player performance.
          </p>
        </div>
        <div className="flex h-24 w-24 items-center justify-center rounded-md border border-[#f5c84b]/30 bg-[#f5c84b]/12">
          <Medal className="h-12 w-12 text-[#f5c84b]" />
        </div>
      </div>
      <div className="grid border-t border-white/10 sm:grid-cols-5">
        {seasonMetrics.map((metric) => (
          <div key={metric.label} className="border-white/10 p-4 sm:border-r last:sm:border-r-0">
            <p className="text-sm font-semibold text-white/48">{metric.label}</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ActivityPanel({
  activityFeed,
  teamsById,
  playersById,
  isLoading,
}: {
  activityFeed: (EventRecord & { type: string })[];
  teamsById: Map<string, Team>;
  playersById: Map<string, Player>;
  isLoading: boolean;
}) {
  return (
    <aside className="rounded-md border border-white/10 bg-white/[0.05] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white">Recent Activity</h3>
          <p className="text-sm text-white/50">Latest public match events</p>
        </div>
        <Megaphone className="h-5 w-5 text-[#f5c84b]" />
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <SkeletonLine key={index} />)
        ) : activityFeed.length > 0 ? (
          activityFeed.map((event) => {
            const player = playersById.get(event.playerId);
            const team = teamsById.get(event.teamId);
            return (
              <div key={`${event.type}-${event.id}`} className="flex items-center gap-3 rounded-md border border-white/8 bg-[#07130f]/70 p-3">
                <span className={cn("h-3 w-3 rounded-full", event.type === "Red Card" ? "bg-red-500" : event.type === "Yellow Card" ? "bg-[#f5c84b]" : "bg-[#26c267]")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{player?.name ?? "Unknown player"}</p>
                  <p className="truncate text-xs text-white/48">{event.type} - {team?.name ?? "Independent"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/28" />
              </div>
            );
          })
        ) : (
          <EmptySurface icon={Activity} title="No activity yet" text="Goals, assists, and cards will appear as match events are recorded." />
        )}
      </div>
    </aside>
  );
}

function FixtureColumn({
  title,
  icon: Icon,
  matches,
  teamsById,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  matches: Match[];
  teamsById: Map<string, Team>;
  empty: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#2a7b4f]" />
        <h3 className="text-xl font-black text-[#102018]">{title}</h3>
      </div>
      <div className="grid gap-3">
        {matches.length > 0 ? (
          matches.map((match) => <MatchCard key={match.id} match={match} teamsById={teamsById} />)
        ) : (
          <EmptySurface icon={CalendarDays} title={empty} text="Check back as the league schedule develops." light />
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, teamsById }: { match: Match; teamsById: Map<string, Team> }) {
  const homeTeam = teamsById.get(match.homeTeamId);
  const awayTeam = teamsById.get(match.awayTeamId);
  const played = match.status === "played";

  return (
    <article className="rounded-md border border-[#102018]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2a7b4f]/30 hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-[#526357]">
        <span>Match Week {match.matchDay ?? "-"}</span>
        <span>{formatMatchDate(match)} {match.time ? `- ${formatTime(match.time)}` : ""}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamIdentity team={homeTeam} align="right" />
        <div className={cn("min-w-24 rounded-md px-4 py-3 text-center", played ? "bg-[#102018] text-white" : "border border-[#2a7b4f]/20 bg-[#2a7b4f]/8 text-[#2a7b4f]")}>
          {played ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-black tabular-nums">{match.homeScore ?? 0}</span>
              <span className="text-white/40">:</span>
              <span className="text-2xl font-black tabular-nums">{match.awayScore ?? 0}</span>
            </div>
          ) : (
            <div className="text-xs font-black">Scheduled</div>
          )}
        </div>
        <TeamIdentity team={awayTeam} align="left" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#526357]">
        <MapPin className="h-3.5 w-3.5 text-[#2a7b4f]" />
        {match.venue || match.league || "League venue"}
      </div>
    </article>
  );
}

function TeamIdentity({ team, align }: { team?: Team; align: "left" | "right" }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", align === "right" ? "justify-end text-right" : "justify-start")}>
      {align === "right" && <span className="hidden truncate text-sm font-black text-[#102018] sm:block">{team?.name ?? "Team"}</span>}
      <Avatar className="h-10 w-10 rounded-md border border-[#102018]/10">
        <AvatarImage src={team?.logo ?? undefined} />
        <AvatarFallback style={{ backgroundColor: team?.primaryColor ?? "#2a7b4f" }} className="text-xs font-bold text-white">
          {teamInitials(team?.name ?? "Team")}
        </AvatarFallback>
      </Avatar>
      {align === "left" && <span className="hidden truncate text-sm font-black text-[#102018] sm:block">{team?.name ?? "Team"}</span>}
    </div>
  );
}

function StandingsTable({ standings }: { standings: StandingRow[] }) {
  if (standings.length === 0) {
    return <EmptySurface icon={Trophy} title="No standings yet" text="The table will update after results are recorded." />;
  }

  return (
    <>
      {/* Mobile: Card List */}
      <div className="md:hidden space-y-2">
        {standings.map((team, index) => (
          <div key={team.id} className="min-w-0 rounded-md border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.08]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center font-black text-sm text-white/45 shrink-0">{index + 1}</span>
                <div className="min-w-0 flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-md border border-white/10 shrink-0">
                    <AvatarImage src={team.logo ?? undefined} />
                    <AvatarFallback style={{ backgroundColor: team.color }} className="text-xs font-bold text-white">
                      {teamInitials(team.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-white truncate">{team.name}</span>
                </div>
              </div>
              <div className="rounded-md bg-[#26c267]/18 px-3 py-1 text-center shrink-0">
                <span className="text-sm font-black text-[#51d884]">{team.pts}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-white/45 text-[10px] mb-1">Record</p>
                <p className="font-bold text-white">{team.played}P {team.won}W {team.drawn}D {team.lost}L</p>
              </div>
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-white/45 text-[10px] mb-1">Goals</p>
                <p className="font-bold text-white">{team.gf}F {team.ga}A ({team.gd > 0 ? '+' : ''}{team.gd})</p>
              </div>
              <div className="bg-white/5 rounded p-2 text-center">
                <p className="text-white/45 text-[10px] mb-1">Form</p>
                <FormDots form={team.form.slice(0, 3)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block min-w-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] text-sm font-bold text-white/50">
                <th className="w-12 px-4 py-4 text-center">#</th>
                <th className="px-4 py-4">Team</th>
                <th className="px-2 py-4 text-center">P</th>
                <th className="px-2 py-4 text-center">W</th>
                <th className="px-2 py-4 text-center">D</th>
                <th className="px-2 py-4 text-center">L</th>
                <th className="px-2 py-4 text-center">GD</th>
                <th className="px-4 py-4">Form</th>
                <th className="px-4 py-4 text-center text-[#51d884]">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {standings.map((team, index) => (
                <tr key={team.id} className="transition hover:bg-white/[0.04]">
                  <td className="px-4 py-4 text-center font-black text-white/45">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-md border border-white/10 shrink-0">
                        <AvatarImage src={team.logo ?? undefined} />
                        <AvatarFallback style={{ backgroundColor: team.color }} className="text-xs font-bold text-white">
                          {teamInitials(team.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-black text-white truncate">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center font-semibold text-white/78">{team.played}</td>
                  <td className="px-2 py-4 text-center text-white/54">{team.won}</td>
                  <td className="px-2 py-4 text-center text-white/54">{team.drawn}</td>
                  <td className="px-2 py-4 text-center text-white/54">{team.lost}</td>
                  <td className="px-2 py-4 text-center font-mono text-sm text-white">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                  <td className="px-4 py-4">
                    <FormDots form={team.form} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-md bg-[#26c267]/18 px-3 py-1 text-sm font-black text-[#51d884]">{team.pts}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function FormDots({ form }: { form: string[] }) {
  if (form.length === 0) return <span className="text-xs font-semibold text-white/35">No form</span>;
  return (
    <div className="flex gap-1">
      {form.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-xs font-black",
            result === "W" && "bg-[#26c267] text-[#06110d]",
            result === "D" && "bg-[#f5c84b] text-[#102018]",
            result === "L" && "bg-white/12 text-white/70",
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function TopPerformers({
  rows,
  defensiveLeaders,
}: {
  rows: { player: Player; team?: Team; goals: number; assists: number }[];
  defensiveLeaders: StandingRow[];
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-white/10 bg-white/[0.05] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-[#f5c84b]" />
          <h3 className="text-lg font-black text-white">Goal Leaders</h3>
        </div>
        <div className="grid gap-3">
          {rows.length > 0 ? rows.slice(0, 4).map((row, index) => <PerformerRow key={row.player.id} row={row} index={index} />) : <EmptySurface icon={Medal} title="No leaders yet" text="Top scorers will appear when goals are recorded." />}
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.05] p-4">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#51d884]" />
          <h3 className="text-lg font-black text-white">Defensive Records</h3>
        </div>
        <div className="grid gap-2">
          {defensiveLeaders.length > 0 ? (
            defensiveLeaders.map((team) => (
              <div key={team.id} className="flex items-center justify-between rounded-md bg-[#07130f]/70 p-3">
                <span className="font-bold text-white">{team.name}</span>
                <span className="text-sm font-black text-[#51d884]">{team.ga} conceded</span>
              </div>
            ))
          ) : (
            <EmptySurface icon={ShieldCheck} title="No records yet" text="Defensive leaders appear after played matches." />
          )}
        </div>
      </div>
    </div>
  );
}

function PerformerRow({ row, index }: { row: { player: Player; team?: Team; goals: number; assists: number }; index: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[#07130f]/70 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/8 text-sm font-black text-white/55">{index + 1}</span>
        <Avatar className="h-10 w-10 rounded-md border border-white/10">
          <AvatarImage src={row.player.photo ?? undefined} className="object-cover" />
          <AvatarFallback className="bg-[#102018] text-xs font-bold text-white">{teamInitials(row.player.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-black text-white">{row.player.name}</p>
          <p className="truncate text-xs text-white/45">{row.team?.name ?? "Independent"}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-[#f5c84b]">{row.goals}</p>
        <p className="text-xs font-semibold text-white/42">{row.assists} assists</p>
      </div>
    </div>
  );
}

function TeamFeatureCard({ row }: { row: StandingRow & { team?: Team; players: number } }) {
  return (
    <article className="rounded-md border border-[#102018]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-12 w-12 rounded-md border border-[#102018]/10">
            <AvatarImage src={row.logo ?? undefined} />
            <AvatarFallback style={{ backgroundColor: row.color }} className="font-black text-white">
              {teamInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black text-[#102018]">{row.name}</h3>
            <p className="truncate text-sm font-semibold text-[#526357]">{row.team?.stadium || "Home ground pending"}</p>
          </div>
        </div>
        <span className="rounded-md bg-[#2a7b4f]/10 px-3 py-1 text-sm font-black text-[#2a7b4f]">{row.pts} pts</span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-[#102018]/10 pt-4 text-center">
        <MiniStat label="Squad" value={row.players} />
        <MiniStat label="Played" value={row.played} />
        <MiniStat label="GD" value={row.gd > 0 ? `+${row.gd}` : row.gd} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#526357]">Recent form</span>
        <div className="flex gap-1">
          {row.form.length > 0 ? row.form.map((result, index) => (
            <span key={`${row.id}-${result}-${index}`} className={cn("flex h-6 w-6 items-center justify-center rounded-md text-xs font-black", result === "W" && "bg-[#2a7b4f] text-white", result === "D" && "bg-[#f5c84b] text-[#102018]", result === "L" && "bg-[#102018]/10 text-[#526357]")}>{result}</span>
          )) : <span className="text-sm font-semibold text-[#526357]">No form</span>}
        </div>
      </div>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-[#102018]/5 p-3">
      <p className="text-lg font-black text-[#102018]">{value}</p>
      <p className="text-xs font-semibold text-[#526357]">{label}</p>
    </div>
  );
}

function PlayerSpotlight({ rows }: { rows: { player: Player; team?: Team; goals: number; assists: number }[] }) {
  if (rows.length === 0) {
    return <EmptySurface icon={Users} title="No player highlights yet" text="Player spotlights will appear after recorded match events." />;
  }

  const leader = rows[0];
  const supporting = rows.slice(1, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <article className="overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
        <div className="relative h-52 bg-[#102018]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(38,194,103,0.45),transparent_45%)]" />
          <div className="absolute bottom-5 left-5 flex items-end gap-4">
            <Avatar className="h-24 w-24 rounded-md border-2 border-white/20">
              <AvatarImage src={leader.player.photo ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-[#26c267] text-2xl font-black text-[#06110d]">{teamInitials(leader.player.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-[#f5c84b]">Featured Player</p>
              <h3 className="text-3xl font-black text-white">{leader.player.name}</h3>
              <p className="text-sm font-semibold text-white/55">{leader.team?.name ?? "Independent"}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-white/10">
          <PlayerStat label="Goals" value={leader.goals} />
          <PlayerStat label="Assists" value={leader.assists} />
          <PlayerStat label="No." value={leader.player.number ?? "-"} />
        </div>
      </article>

      <div className="grid gap-3">
        {supporting.map((row, index) => <PerformerRow key={row.player.id} row={row} index={index + 1} />)}
      </div>
    </div>
  );
}

function PlayerStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-r border-white/10 p-4 last:border-r-0">
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-sm font-semibold text-white/45">{label}</p>
    </div>
  );
}

function FeatureCard({ feature }: { feature: { title: string; text: string; icon: LucideIcon } }) {
  const Icon = feature.icon;
  return (
    <article className="rounded-md border border-[#102018]/10 bg-white p-5 shadow-sm">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-[#2a7b4f]/10 text-[#2a7b4f]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-black text-[#102018]">{feature.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#526357]">{feature.text}</p>
    </article>
  );
}

function TestimonialCard({ item }: { item: { quote: string; name: string; role: string } }) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.05] p-5">
      <Star className="mb-4 h-5 w-5 fill-[#f5c84b] text-[#f5c84b]" />
      <p className="text-base leading-7 text-white/76">&ldquo;{item.quote}&rdquo;</p>
      <div className="mt-5">
        <p className="font-black text-white">{item.name}</p>
        <p className="text-sm text-white/45">{item.role}</p>
      </div>
    </article>
  );
}

function FaqCard({ faq }: { faq: { question: string; answer: string } }) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.05] p-5">
      <div className="mb-3 flex items-start gap-3">
        <CircleHelp className="mt-1 h-5 w-5 shrink-0 text-[#51d884]" />
        <h3 className="text-lg font-black text-white">{faq.question}</h3>
      </div>
      <p className="text-sm leading-7 text-white/58">{faq.answer}</p>
    </article>
  );
}

function PublicFooter({ navItems, profileHref }: { navItems: PublicNavItem[]; profileHref: string }) {
  return (
    <footer className="border-t border-white/10 bg-[#07130f] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.5fr_auto]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#26c267] text-[#06110d]">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-black text-white">KICKOFF</p>
              <p className="text-sm text-white/45">Football league management</p>
            </div>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-semibold text-white/58 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <Button asChild className="h-11 rounded-md bg-[#f5c84b] font-bold text-[#102018] hover:bg-[#ffd869]">
          <Link href={profileHref}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Profile Dashboard
          </Link>
        </Button>
      </div>
    </footer>
  );
}

function EmptySurface({
  icon: Icon,
  title,
  text,
  light = false,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  light?: boolean;
}) {
  return (
    <div className={cn("rounded-md border border-dashed p-6 text-center", light ? "border-[#102018]/18 bg-white text-[#102018]" : "border-white/12 bg-white/[0.04] text-white")}>
      <Icon className={cn("mx-auto mb-3 h-8 w-8", light ? "text-[#2a7b4f]/55" : "text-white/32")} />
      <h3 className="font-black">{title}</h3>
      <p className={cn("mt-2 text-sm leading-6", light ? "text-[#526357]" : "text-white/48")}>{text}</p>
    </div>
  );
}

function SkeletonLine() {
  return <div className="h-16 animate-pulse rounded-md border border-white/8 bg-white/[0.05]" />;
}
