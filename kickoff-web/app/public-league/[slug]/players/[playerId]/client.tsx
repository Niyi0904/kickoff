'use client';

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Users, Trophy, TrendingUp, AlertTriangle, Calendar, Medal } from "lucide-react";
import { usePublicLeagueData, useLeagueDefaults } from "@/app/hooks/usePublicLeagueData";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptySurface } from "@/components/public/EmptySurface";
import { Button } from "@/components/ui/button";

export function PublicPlayerDetail({ slug, playerId }: { slug: string; playerId: string }) {
  const { data, isLoading } = usePublicLeagueData(slug);
  const { teams, players, matches, goals, assists, yellowCards, redCards } = useLeagueDefaults(data);

  const base = `/public-league/${slug}`;
  const navItems = [
    { label: "Home", href: base },
    { label: "Matches", href: `${base}/matches` },
    { label: "Standings", href: `${base}/standings` },
    { label: "Teams", href: `${base}/teams` },
    { label: "Stats", href: `${base}/stats` },
  ];

  const player = players.find((p) => p.id === playerId);
  const team = teams.find((t) => t.id === player?.teamId);

  const playerGoals = goals.filter((g) => g.playerId === playerId).length;
  const playerAssists = assists.filter((a) => a.playerId === playerId).length;
  const playerYellows = yellowCards.filter((y) => y.playerId === playerId).length;
  const playerReds = redCards.filter((r) => r.playerId === playerId).length;

  const playerMatches = useMemo(() => {
    const matchIds = new Set([
      ...goals.filter((g) => g.playerId === playerId).map((g) => g.matchId).filter(Boolean),
      ...assists.filter((a) => a.playerId === playerId).map((a) => a.matchId).filter(Boolean),
      ...yellowCards.filter((y) => y.playerId === playerId).map((y) => y.matchId).filter(Boolean),
      ...redCards.filter((r) => r.playerId === playerId).map((r) => r.matchId).filter(Boolean),
    ]);
    return matches.filter((m) => matchIds.has(m.id) && m.status === "played");
  }, [playerId, goals, assists, yellowCards, redCards, matches]);

  const statItems = [
    { label: "Goals", value: playerGoals, icon: Target, accent: "text-[#51d884]" },
    { label: "Assists", value: playerAssists, icon: TrendingUp, accent: "text-[#f5c84b]" },
    { label: "Matches", value: playerMatches.length, icon: Trophy, accent: "text-white" },
    { label: "Yellows", value: playerYellows, icon: AlertTriangle, accent: "text-[#f5c84b]" },
    { label: "Reds", value: playerReds, icon: AlertTriangle, accent: "text-red-500" },
  ];

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

  if (!player) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
        <PublicHeader navItems={navItems} />
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <EmptySurface icon={Users} title="Player not found" text="This player doesn't exist or belongs to a different league." />
            <div className="mt-6 text-center">
              <Button asChild className="bg-[#26c267] text-[#06110d] hover:bg-[#51d884]">
                <Link href={base}><ArrowLeft className="mr-2 h-4 w-4" /> Back to League</Link>
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
            <Link href={base} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/48 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to League
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-6 border-b border-white/10 mb-8"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 rounded-2xl border-4 border-white/10 shadow-xl shrink-0">
                <AvatarImage src={player.photo ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-[#26c267] text-2xl font-black text-[#06110d]">
                  {player.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "PL"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">{player.name}</h1>
                  {player.number != null && (
                    <span className="px-3 py-1 bg-white/[0.08] rounded-md text-lg font-bold text-[#f5c84b]">#{player.number}</span>
                  )}
                </div>
                <p className="text-white/58 text-base flex flex-wrap items-center gap-x-2 mt-2">
                  <span className="font-semibold text-white/80">{player.position ?? "Player"}</span>
                  {team && (
                    <>
                      <span>&bull;</span>
                      <Link href={`${base}/teams/${team.id}`} className="italic hover:text-[#51d884] transition-colors underline underline-offset-2">
                        {team.name}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-4 mb-8">
            {statItems.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-white/10 rounded-md p-5 flex-1 min-w-[140px] bg-white/[0.04] relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 p-2 opacity-10 ${s.accent}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <p className="text-[10px] text-white/45 uppercase font-black tracking-widest mb-1">{s.label}</p>
                  <p className={`text-3xl sm:text-4xl font-black tracking-tighter ${s.accent}`}>{s.value}</p>
                </motion.div>
              );
            })}
          </div>

          {playerMatches.length === 0 ? (
            <div className="border border-dashed border-white/12 rounded-md py-16 bg-white/[0.02] text-center">
              <Calendar className="mx-auto h-10 w-10 text-white/20 mb-4" />
              <h3 className="font-bold text-white">No Match History</h3>
              <p className="text-sm text-white/48">Stats will appear after the first recorded match.</p>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 bg-white/[0.05] overflow-hidden">
              <div className="border-b border-white/10 px-5 py-4">
                <h2 className="text-sm font-bold uppercase flex items-center gap-2">
                  <Medal className="h-4 w-4 text-[#f5c84b]" /> Recent Contributions
                </h2>
              </div>
              <div className="divide-y divide-white/8">
                {[...playerMatches].reverse().slice(0, 10).map((match) => {
                  const isHome = match.homeTeamId === player.teamId;
                  const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                  const opponent = teams.find((t) => t.id === opponentId);
                  const matchGoals = goals.filter((g) => g.playerId === playerId && g.matchId === match.id).length;
                  const matchAssists = assists.filter((a) => a.playerId === playerId && a.matchId === match.id).length;
                  const matchYellows = yellowCards.filter((y) => y.playerId === playerId && y.matchId === match.id).length;
                  const matchReds = redCards.filter((r) => r.playerId === playerId && r.matchId === match.id).length;

                  return (
                    <div key={match.id} className="p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white/45 uppercase tracking-wider">
                          {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                        </span>
                        <span className="font-bold">vs {opponent?.name ?? "Unknown"}</span>
                        <span className="text-[10px] font-black uppercase text-white/45">
                          {match.homeScore ?? 0} - {match.awayScore ?? 0} ({isHome ? "Home" : "Away"})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-black text-[#51d884]">{matchGoals}</p>
                          <p className="text-[10px] uppercase text-white/45 font-bold">G</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-[#f5c84b]">{matchAssists}</p>
                          <p className="text-[10px] uppercase text-white/45 font-bold">A</p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: matchYellows }).map((_, i) => (
                            <div key={`y-${i}`} className="h-4 w-1.5 rounded-sm bg-[#f5c84b]" />
                          ))}
                          {Array.from({ length: matchReds }).map((_, i) => (
                            <div key={`r-${i}`} className="h-4 w-1.5 rounded-sm bg-red-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <PublicFooter navItems={navItems} />
    </main>
  );
}
