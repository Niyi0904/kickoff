'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Target, TrendingUp, AlertTriangle,
  Search, ChevronRight, Medal, ShieldAlert, Swords, Users
} from "lucide-react";
import { useAppContext } from "../context/AppDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RequirePaidPlayer } from "@/components/RequirePaidPlayer";
import { useLeagueSettings } from "../hooks/use-leagueSettings";

type StatTab = "goals" | "assists" | "cards";

const tabMeta = {
  goals: { icon: Target, label: "Goals", accent: "text-primary" as const },
  assists: { icon: TrendingUp, label: "Assists", accent: "text-accent" as const },
  cards: { icon: ShieldAlert, label: "Cards", accent: "text-destructive" as const },
};

const accentMap = {
  textPrimary: "text-primary",
  textAccent: "text-accent",
  textDestructive: "text-destructive",
};

function StatSummaryCard({ label, value, icon: Icon, accent, delay }: {
  label: string; value: number; icon: React.ElementType;
  accent: "primary" | "accent" | "destructive" | "warning"; delay: number;
}) {
  const iconBg = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-yellow-500/10 text-yellow-500",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl", iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-display text-3xl font-black tracking-tighter text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

export default function StatsPage() {
  return (
    <ProtectedRoute>
      <RequirePaidPlayer>
        <StatsContent />
      </RequirePaidPlayer>
    </ProtectedRoute>
  );
}

function StatsContent() {
  const { seasonName } = useLeagueSettings();
  const { teams, players, goals, assists, yellowCards, redCards } = useAppContext();
  const [activeTab, setActiveTab] = useState<StatTab>("goals");
  const [searchQuery, setSearchQuery] = useState("");

  const leaderboard = useMemo(() => players.map(player => ({
    player,
    stats: {
      goals: goals.filter(g => g.playerId === player.id).length,
      assists: assists.filter(a => a.playerId === player.id).length,
      yellowCards: yellowCards.filter(y => y.playerId === player.id).length,
      redCards: redCards.filter(r => r.playerId === player.id).length,
    }
  })).map(item => ({
    ...item,
    stats: {
      ...item.stats,
      totalCards: item.stats.yellowCards + item.stats.redCards
    }
  })), [players, goals, assists, yellowCards, redCards]);

  const filteredStats = useMemo(() => leaderboard
    .filter(item =>
      item.player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (activeTab === "goals") return b.stats.goals - a.stats.goals;
      if (activeTab === "assists") return b.stats.assists - a.stats.assists;
      return b.stats.totalCards - a.stats.totalCards;
    })
    .filter(item => {
      if (searchQuery !== "") return true;
      if (activeTab === "goals") return item.stats.goals > 0;
      if (activeTab === "assists") return item.stats.assists > 0;
      return item.stats.totalCards > 0;
    }), [leaderboard, searchQuery, activeTab]);

  const totalPlayersWithStats = players.length;
  const totalGoals = goals.length;
  const totalAssists = assists.length;
  const totalCards = yellowCards.length + redCards.length;
  const tab = tabMeta[activeTab];

  return (
    <div className="px-4 pb-20 min-w-0">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
      >
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">League Leaders</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">League Leaders</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Player performance tracking for the {seasonName} League
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search player..."
            className="pl-10 bg-secondary/30 border-border/50 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatSummaryCard label="Players" value={totalPlayersWithStats} icon={Users} accent="primary" delay={0} />
        <StatSummaryCard label="Total Goals" value={totalGoals} icon={Target} accent="primary" delay={0.05} />
        <StatSummaryCard label="Total Assists" value={totalAssists} icon={TrendingUp} accent="accent" delay={0.1} />
        <StatSummaryCard label="Total Cards" value={totalCards} icon={AlertTriangle} accent="warning" delay={0.15} />
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-secondary/30 rounded-xl mb-8 border border-border/50">
        {(Object.entries(tabMeta) as [StatTab, typeof tabMeta['goals']][]).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === key
                  ? "bg-background shadow-lg text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Stats List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {filteredStats.map((item, index) => {
            const team = teams.find(t => t.id === item.player.teamId);
            const value = activeTab === "goals" ? item.stats.goals
              : activeTab === "assists" ? item.stats.assists
              : item.stats.totalCards;

            const accentCls = activeTab === "goals" ? "text-primary"
              : activeTab === "assists" ? "text-accent"
              : "text-destructive";

            const medalCls = activeTab === "goals" ? (
              index === 0 ? "bg-yellow-500 text-black" :
              index === 1 ? "bg-slate-300 text-black" :
              index === 2 ? "bg-orange-400 text-black" :
              "bg-secondary/60 text-muted-foreground"
            ) : "bg-secondary/60 text-muted-foreground";

            return (
              <motion.div
                key={`${activeTab}-${item.player.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={`/players/${item.player.id}`}
                  className="group flex items-center justify-between p-4 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-xl font-display text-base font-black transition-all",
                      medalCls,
                      index < 3 && activeTab === "goals" ? "shadow-lg" : ""
                    )}>
                      {index + 1}
                    </div>

                    <Avatar className="w-12 h-12 rounded-xl border-2 border-secondary/50 shadow-sm">
                      <AvatarImage src={item.player.photo || ''} className="object-cover" />
                      <AvatarFallback className="bg-secondary text-xs font-bold">{item.player.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{item.player.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.primaryColor }} />
                        {team?.name || "Independent"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Card breakdown */}
                    {activeTab === "cards" && (
                      <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-3.5 bg-yellow-500 rounded-sm" />
                          <span className="text-xs font-bold">{item.stats.yellowCards}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-3.5 bg-red-600 rounded-sm" />
                          <span className="text-xs font-bold">{item.stats.redCards}</span>
                        </div>
                      </div>
                    )}

                    {/* Value */}
                    <div className="text-right min-w-[60px]">
                      <div className={cn("text-2xl font-black leading-none", accentCls)}>
                        {value}
                      </div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                        {tab.label}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredStats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-background/40 backdrop-blur-xl border border-dashed border-border/30 rounded-3xl"
          >
            <Medal className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No stats found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
