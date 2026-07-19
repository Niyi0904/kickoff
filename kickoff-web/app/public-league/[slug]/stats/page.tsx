'use client';

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, ShieldAlert, Search, Medal, Users } from "lucide-react";
import { usePublicLeagueData, useLeagueDefaults } from "@/app/hooks/usePublicLeagueData";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { EmptySurface } from "@/components/public/EmptySurface";
import { cn } from "@/lib/utils";

type StatTab = "goals" | "assists" | "cards";

const tabMeta: Record<StatTab, { icon: typeof Target; label: string; accent: string }> = {
  goals: { icon: Target, label: "Goals", accent: "text-[#51d884]" },
  assists: { icon: TrendingUp, label: "Assists", accent: "text-[#f5c84b]" },
  cards: { icon: ShieldAlert, label: "Cards", accent: "text-red-500" },
};

export default function PublicStatsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicLeagueData(slug);
  const { teams, players, goals, assists, yellowCards, redCards } = useLeagueDefaults(data);

  const [activeTab, setActiveTab] = useState<StatTab>("goals");
  const [searchQuery, setSearchQuery] = useState("");

  const base = `/public-league/${slug}`;
  const navItems = [
    { label: "Home", href: base },
    { label: "Matches", href: `${base}/matches` },
    { label: "Standings", href: `${base}/standings` },
    { label: "Teams", href: `${base}/teams` },
    { label: "Stats", href: `${base}/stats` },
  ];

  const leaderboard = useMemo(() =>
    players.map((player) => {
      const pGoals = goals.filter((g) => g.playerId === player.id).length;
      const pAssists = assists.filter((a) => a.playerId === player.id).length;
      const pYellows = yellowCards.filter((y) => y.playerId === player.id).length;
      const pReds = redCards.filter((r) => r.playerId === player.id).length;
      return {
        player,
        team: teams.find((t) => t.id === player.teamId),
        goals: pGoals,
        assists: pAssists,
        yellows: pYellows,
        reds: pReds,
        totalCards: pYellows + pReds,
      };
    }),
    [players, teams, goals, assists, yellowCards, redCards],
  );

  const filteredStats = useMemo(() =>
    leaderboard
      .filter((item) => item.player.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (activeTab === "goals") return b.goals - a.goals;
        if (activeTab === "assists") return b.assists - a.assists;
        return b.totalCards - a.totalCards;
      })
      .filter((item) => {
        if (searchQuery !== "") return true;
        if (activeTab === "goals") return item.goals > 0;
        if (activeTab === "assists") return item.assists > 0;
        return item.totalCards > 0;
      }),
    [leaderboard, searchQuery, activeTab],
  );

  const summary = [
    { label: "Players", value: players.length, icon: Users, accent: "text-[#51d884]" as const },
    { label: "Total Goals", value: goals.length, icon: Target, accent: "text-[#51d884]" as const },
    { label: "Total Assists", value: assists.length, icon: TrendingUp, accent: "text-[#f5c84b]" as const },
    { label: "Total Cards", value: yellowCards.length + redCards.length, icon: ShieldAlert, accent: "text-red-500" as const },
  ];

  const TabIcon = tabMeta[activeTab].icon;

  return (
    <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
      <PublicHeader navItems={navItems} />

      <section className="px-4 py-24 sm:px-6 lg:px-8 min-w-0">
        <div className="mx-auto max-w-7xl min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#51d884]">
              <span className="h-2 w-2 rounded-full bg-[#51d884]" />
              Statistics
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">League Leaders</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
              Top performers across goals, assists, and disciplinary records.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summary.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-md border border-white/10 bg-white/[0.05] p-5 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 p-2 opacity-10 ${item.accent}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-white">{item.value}</p>
                  <p className="text-[10px] text-white/45 mt-1 font-bold uppercase tracking-widest">{item.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex p-1 bg-white/[0.04] border border-white/10 rounded-md">
              {(Object.entries(tabMeta) as [StatTab, typeof tabMeta['goals']][]).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === key ? "bg-[#26c267] text-[#06110d]" : "text-white/48 hover:text-white",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.04] border-white/10 rounded-md text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md border border-white/10 bg-white/[0.05]" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {filteredStats.length > 0 ? (
                  filteredStats.map((item, index) => {
                    const value = activeTab === "goals" ? item.goals
                      : activeTab === "assists" ? item.assists
                      : item.totalCards;

                    const accentCls = activeTab === "goals" ? "text-[#51d884]"
                      : activeTab === "assists" ? "text-[#f5c84b]"
                      : "text-red-500";

                    const medalCls = activeTab === "goals"
                      ? (index === 0 ? "bg-yellow-500 text-black" : index === 1 ? "bg-slate-300 text-black" : index === 2 ? "bg-orange-400 text-black" : "bg-white/[0.08] text-white/45")
                      : "bg-white/[0.08] text-white/45";

                    return (
                      <motion.div
                        key={`${activeTab}-${item.player.id}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Link
                          href={`${base}/players/${item.player.id}`}
                          className="group flex items-center justify-between p-4 border border-white/10 bg-white/[0.04] rounded-md hover:border-[#51d884]/30 hover:bg-white/[0.07] transition-all duration-300"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-md font-black text-sm transition-all",
                              medalCls,
                            )}>
                              {index + 1}
                            </div>

                            <Avatar className="w-11 h-11 rounded-md border border-white/10 shrink-0">
                              <AvatarImage src={item.player.photo ?? undefined} className="object-cover" />
                              <AvatarFallback className="bg-[#102018] text-xs font-bold text-white">
                                {item.player.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <h3 className="font-black text-white group-hover:text-[#51d884] transition-colors truncate">{item.player.name}</h3>
                              <p className="text-xs text-white/45 flex items-center gap-1">
                                {item.team && (
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.team.primaryColor }} />
                                )}
                                {item.team?.name ?? "Independent"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {activeTab === "cards" && (
                              <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-3.5 bg-[#f5c84b] rounded-sm" />
                                  <span className="text-xs font-bold">{item.yellows}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
                                  <span className="text-xs font-bold">{item.reds}</span>
                                </div>
                              </div>
                            )}

                            <div className="text-right min-w-[60px]">
                              <div className={cn("text-2xl font-black leading-none", accentCls)}>{value}</div>
                              <p className="text-[10px] uppercase font-bold text-white/45 mt-1">{tabMeta[activeTab].label}</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 border border-dashed border-white/12 rounded-md"
                  >
                    <Medal className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/48 font-medium">No stats found matching your criteria.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <PublicFooter navItems={navItems} />
    </main>
  );
}
