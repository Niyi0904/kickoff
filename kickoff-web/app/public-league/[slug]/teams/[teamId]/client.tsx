'use client';

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Users, Trophy, Calendar, Target, TrendingUp, Crown, ArrowLeft, MapPin } from "lucide-react";
import { usePublicLeagueData, useLeagueDefaults } from "@/app/hooks/usePublicLeagueData";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptySurface } from "@/components/public/EmptySurface";
import { Button } from "@/components/ui/button";

function teamInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "FC";
}

export function PublicTeamDetail({ slug, teamId }: { slug: string; teamId: string }) {
  const { data, isLoading } = usePublicLeagueData(slug);
  const { teams, players, matches, goals, assists } = useLeagueDefaults(data);

  const base = `/public-league/${slug}`;
  const navItems = [
    { label: "Home", href: base },
    { label: "Matches", href: `${base}/matches` },
    { label: "Standings", href: `${base}/standings` },
    { label: "Teams", href: `${base}/teams` },
    { label: "Stats", href: `${base}/stats` },
  ];

  const team = teams.find((t) => t.id === teamId);
  const teamPlayers = players.filter((p) => p.teamId === teamId);
  const teamMatches = matches.filter(
    (m) => (m.homeTeamId === teamId || m.awayTeamId === teamId) && m.status === "played",
  );

  const totalGoals = goals.filter((g) => teamPlayers.some((p) => p.id === g.playerId)).length;
  const totalAssists = assists.filter((a) => teamPlayers.some((p) => p.id === a.playerId)).length;

  const getMatchResult = (match: typeof matches[0]) => {
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const oppScore = isHome ? match.awayScore : match.homeScore;
    if (teamScore == null || oppScore == null) return { label: "-", color: "bg-white/12" };
    if (teamScore > oppScore) return { label: "W", color: "bg-[#26c267]" };
    if (teamScore < oppScore) return { label: "L", color: "bg-white/12" };
    return { label: "D", color: "bg-[#f5c84b]" };
  };

  const playerStats = useMemo(
    () =>
      teamPlayers.map((p) => ({
        ...p,
        goals: goals.filter((g) => g.playerId === p.id).length,
        assists: assists.filter((a) => a.playerId === p.id).length,
      })),
    [teamPlayers, goals, assists],
  );

  const topScorer = [...playerStats].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...playerStats].sort((a, b) => b.assists - a.assists)[0];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
        <PublicHeader navItems={navItems} />
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="h-64 animate-pulse rounded-md border border-white/10 bg-white/[0.05]" />
          </div>
        </section>
        <PublicFooter navItems={navItems} />
      </main>
    );
  }

  if (!team) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
        <PublicHeader navItems={navItems} />
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <EmptySurface icon={Shield} title="Team not found" text="This team doesn't exist or belongs to a different league." />
            <div className="mt-6 text-center">
              <Button asChild className="bg-[#26c267] text-[#06110d] hover:bg-[#51d884]">
                <Link href={`${base}/teams`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams</Link>
              </Button>
            </div>
          </div>
        </section>
        <PublicFooter navItems={navItems} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
      <PublicHeader navItems={navItems} />

      <section className="px-4 py-24 sm:px-6 lg:px-8 min-w-0">
        <div className="mx-auto max-w-7xl min-w-0">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <Link href={`${base}/teams`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/48 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Teams
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-6 py-8 border-b border-white/10 mb-8"
          >
            <Avatar className="h-24 w-24 rounded-2xl border-4 border-white/10 shadow-xl">
              <AvatarImage src={team.logo ?? undefined} className="object-cover" />
              <AvatarFallback style={{ backgroundColor: team.primaryColor }} className="text-3xl font-bold text-white">
                {teamInitials(team.name)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl font-black uppercase tracking-tighter">{team.name}</h1>
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: team.primaryColor }} />
              </div>
              <p className="text-white/58 flex items-center justify-center md:justify-start gap-2 mt-1">
                <MapPin className="h-4 w-4" /> {team.stadium ?? "Venue TBA"}
                {team.founded && <> &bull; <Calendar className="h-4 w-4" /> Est. {team.founded}</>}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="text-center border border-white/10 rounded-md p-4 min-w-[100px] bg-white/[0.04]">
                <p className="text-[10px] uppercase font-black text-white/45">Matches</p>
                <p className="text-2xl font-black">{teamMatches.length}</p>
              </div>
              <div className="text-center border border-white/10 rounded-md p-4 min-w-[100px] bg-white/[0.04]">
                <p className="text-[10px] uppercase font-black text-[#51d884]">Goals</p>
                <p className="text-2xl font-black text-[#51d884]">{totalGoals}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="rounded-md border border-white/10 bg-white/[0.05] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#f5c84b]" />
                  <h2 className="text-lg font-black text-white">Squad ({teamPlayers.length})</h2>
                </div>
                <div className="space-y-1">
                  {teamPlayers.length > 0 ? (
                    teamPlayers.map((p) => (
                      <Link
                        key={p.id}
                        href={`${base}/players/${p.id}`}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-white/[0.06] transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-white/45 w-6 shrink-0">#{p.number ?? "-"}</span>
                          <span className="font-bold truncate group-hover:text-[#51d884] transition-colors">{p.name}</span>
                        </div>
                        <span className="text-[10px] uppercase bg-white/[0.06] px-2 py-1 rounded font-black text-white/45">{p.position ?? "N/A"}</span>
                      </Link>
                    ))
                  ) : (
                    <EmptySurface icon={Users} title="No players" text="Squad list will appear when players are registered." />
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-md border border-white/10 bg-white/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase font-black text-white/45">
                    <Trophy className="h-3 w-3 text-[#f5c84b]" /> Top Scorer
                  </div>
                  <p className="text-xl font-black truncate">{topScorer?.goals > 0 ? topScorer.name : "N/A"}</p>
                  <p className="text-sm text-white/48 font-semibold">{topScorer?.goals ?? 0} Goals</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase font-black text-white/45">
                    <Target className="h-3 w-3 text-[#51d884]" /> Top Assister
                  </div>
                  <p className="text-xl font-black truncate">{topAssister?.assists > 0 ? topAssister.name : "N/A"}</p>
                  <p className="text-sm text-white/48 font-semibold">{topAssister?.assists ?? 0} Assists</p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase font-black text-white/45">
                    <TrendingUp className="h-3 w-3 text-[#26c267]" /> Recent Form
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {teamMatches.slice(-5).reverse().map((m, i) => {
                      const res = getMatchResult(m);
                      return (
                        <div key={i} className={`h-7 w-7 rounded-md ${res.color} flex items-center justify-center text-[10px] font-black text-[#06110d] shadow-sm`}>
                          {res.label}
                        </div>
                      );
                    })}
                    {teamMatches.length === 0 && <span className="text-xs text-white/48 italic">No data</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-white/[0.05]">
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-sm font-bold uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#f5c84b]" /> Match Results
                  </h2>
                </div>
                <div className="divide-y divide-white/8">
                  {teamMatches.length > 0 ? (
                    [...teamMatches].reverse().map((match) => {
                      const isHome = match.homeTeamId === teamId;
                      const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                      const opponent = teams.find((t) => t.id === opponentId);
                      const result = getMatchResult(match);

                      return (
                        <div key={match.id} className="p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white/45 uppercase tracking-wider">
                              {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${result.color}`} />
                              <span className="font-black text-lg">vs {opponent?.name ?? "Unknown"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                              <div className="text-2xl font-black font-mono tracking-tighter">
                                {match.homeScore ?? 0} - {match.awayScore ?? 0}
                              </div>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isHome ? "bg-[#26c267]/18 text-[#51d884]" : "bg-white/[0.06] text-white/58"}`}>
                                {isHome ? "Home" : "Away"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center">
                      <Shield className="mx-auto mb-4 h-8 w-8 text-white/20" />
                      <p className="text-white/48 text-sm italic">No matches played yet this season.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter navItems={navItems} />
    </main>
  );
}
