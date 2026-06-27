'use client';

import { motion } from "framer-motion";
import {
  Shield, Users, Target, AlertTriangle,
  Trophy, TrendingUp, Star, Activity,
  Calendar, Award, Swords, Clock, ChevronRight
} from "lucide-react";
import { useAppContext } from "../context/AppDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLeagueSettings } from "../hooks/use-leagueSettings";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: "primary" | "accent" | "destructive" | "warning" | "info";
  delay?: number;
  sublabel?: string;
}

const accentMap = {
  primary: {
    iconBg: "bg-primary/10 text-primary",
    border: "border-primary/10",
    hover: "hover:border-primary/30",
    badge: "bg-primary/10 text-primary",
  },
  accent: {
    iconBg: "bg-accent/10 text-accent",
    border: "border-accent/10",
    hover: "hover:border-accent/30",
    badge: "bg-accent/10 text-accent",
  },
  destructive: {
    iconBg: "bg-destructive/10 text-destructive",
    border: "border-destructive/10",
    hover: "hover:border-destructive/30",
    badge: "bg-destructive/10 text-destructive",
  },
  warning: {
    iconBg: "bg-yellow-500/10 text-yellow-500",
    border: "border-yellow-500/10",
    hover: "hover:border-yellow-500/30",
    badge: "bg-yellow-500/10 text-yellow-500",
  },
  info: {
    iconBg: "bg-sky-500/10 text-sky-500",
    border: "border-sky-500/10",
    hover: "hover:border-sky-500/30",
    badge: "bg-sky-500/10 text-sky-500",
  },
};

function StatCard({ label, value, icon: Icon, accent = "primary", delay = 0, sublabel }: StatCardProps) {
  const s = accentMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "bg-background/60 backdrop-blur-xl border rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all duration-300",
        s.border, s.hover, "hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl", s.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-display text-3xl font-black tracking-tighter text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">{label}</p>
      {sublabel && (
        <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-medium">{sublabel}</p>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { seasonName } = useLeagueSettings();
  const { teams, players, goals, assists, yellowCards, redCards, matches, topScorers, standings, attendance } = useAppContext();

  const playedMatches = matches.filter(m => m.status === 'played');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const totalGoals = goals.length;
  const avgGoals = playedMatches.length > 0 ? (totalGoals / playedMatches.length).toFixed(1) : "0";
  const totalAssists = assists.length;
  const totalMinutes = playedMatches.reduce((s, m) => s + (Number(m.minutesPlayed) || 0), 0);
  const managers = players.filter(p => p.isManager);
  const approvedTeams = teams.filter(t => t.approved);
  const totalPresent = attendance.filter(a => a.present).length;

  const recentActivity = [
    ...goals.map(g => ({ ...g, type: 'goal' as const })),
    ...yellowCards.map(y => ({ ...y, type: 'yellow' as const })),
    ...redCards.map(r => ({ ...r, type: 'red' as const })),
    ...assists.map(a => ({ ...a, type: 'assist' as const })),
  ]
    .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    .slice(0, 6);

  const topStandings = standings.slice(0, 5);

  return (
    <div className="px-4 min-w-0 pb-20">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
      >
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Overview</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Season Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Live overview for the {seasonName} League
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-secondary/30 rounded-xl border border-border/50">
            <div className="px-4 py-1.5 rounded-lg bg-background text-primary shadow-sm text-[10px] font-black uppercase tracking-widest">
              <span className="hidden sm:inline">{playedMatches.length} </span>Played
            </div>
            <div className="px-4 py-1.5 rounded-lg text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              {upcomingMatches.length} Upcoming
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Teams" value={teams.length} icon={Shield} accent="primary" delay={0}
          sublabel={`${approvedTeams.length} approved`} />
        <StatCard label="Players" value={players.length} icon={Users} accent="accent" delay={0.05}
          sublabel={`${managers.length} managers`} />
        <StatCard label="Matches Played" value={playedMatches.length} icon={Swords} accent="info" delay={0.1}
          sublabel={`${upcomingMatches.length} upcoming`} />
        <StatCard label="Goals Scored" value={totalGoals} icon={Target} accent="primary" delay={0.15}
          sublabel={`${avgGoals} per game`} />
        <StatCard label="Yellow Cards" value={yellowCards.length} icon={AlertTriangle} accent="warning" delay={0.2}
          sublabel={`${yellowCards.length > 0 ? (yellowCards.length / playedMatches.length).toFixed(1) : '0'} per game`} />
        <StatCard label="Red Cards" value={redCards.length} icon={AlertTriangle} accent="destructive" delay={0.25}
          sublabel={`${redCards.length} issued`} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column — Golden Boot + Standings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Golden Boot Race */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="font-display text-xl font-black uppercase tracking-tight">Golden Boot Race</h2>
              </div>
              <Link href="/stats" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {topScorers.slice(0, 5).map((entry, i) => {
                const team = teams.find((t) => t.id === entry.player.teamId);
                return (
                  <Link
                    href={`/players/${entry.player.id}`}
                    key={entry.player.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all border border-transparent hover:border-primary/20 group"
                  >
                    <div className="relative">
                      <span className={cn(
                        "absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-lg",
                        i === 0 ? "bg-yellow-500 text-black" :
                        i === 1 ? "bg-slate-300 text-black" :
                        i === 2 ? "bg-orange-400 text-black" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <Avatar className="w-11 h-11 rounded-xl border-2 border-background shadow-md">
                        <AvatarImage src={entry.player.photo || ''} className="object-cover" />
                        <AvatarFallback className="bg-primary text-white font-bold text-sm">
                          {entry.player.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {entry.player.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {team?.name || "Independent"}
                      </p>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-center">
                        <p className="font-display text-xl font-black text-primary">{entry.stats.goals}</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">G</p>
                      </div>
                      <div className="text-center w-8">
                        <p className="font-display text-sm font-bold text-muted-foreground">{entry.stats.assists}</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold">A</p>
                      </div>
                      <div className="text-center w-8">
                        <p className="font-display text-sm font-bold text-muted-foreground">{entry.stats.matches}</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-bold">M</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {topScorers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No goals scored yet
                </div>
              )}
            </div>
          </motion.div>

          {/* Compact Standings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-black uppercase tracking-tight">League Standings</h2>
              </div>
              <Link href="/standings" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                Full Table
              </Link>
            </div>

            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    <th className="pb-3 text-center w-8">#</th>
                    <th className="pb-3">Team</th>
                    <th className="pb-3 text-center">P</th>
                    <th className="pb-3 text-center hidden lg:table-cell">W</th>
                    <th className="pb-3 text-center hidden lg:table-cell">D</th>
                    <th className="pb-3 text-center hidden lg:table-cell">L</th>
                    <th className="pb-3 text-center">GD</th>
                    <th className="pb-3 text-center text-primary">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {topStandings.map((team: any, i: number) => (
                    <tr
                      key={team.id}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="py-3 text-center font-display font-bold text-muted-foreground group-hover:text-primary text-sm">
                        {i + 1}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-7 h-7 rounded-md border border-border shrink-0">
                            <AvatarImage src={team.logo} />
                            <AvatarFallback style={{ backgroundColor: team.color }} className="text-[9px] text-white font-bold">
                              {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-sm truncate">{team.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-sm font-medium">{team.played}</td>
                      <td className="py-3 text-center hidden lg:table-cell text-sm text-muted-foreground">{team.won}</td>
                      <td className="py-3 text-center hidden lg:table-cell text-sm text-muted-foreground">{team.drawn}</td>
                      <td className="py-3 text-center hidden lg:table-cell text-sm text-muted-foreground">{team.lost}</td>
                      <td className={cn(
                        "py-3 text-center text-sm font-mono font-bold",
                        team.gd > 0 ? "text-emerald-500" : team.gd < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </td>
                      <td className="py-3 text-center">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-sm">
                          {team.pts}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile standings */}
            <div className="md:hidden space-y-2">
              {topStandings.map((team: any, i: number) => (
                <div key={team.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/20">
                  <span className="w-6 text-center font-bold text-sm text-muted-foreground">{i + 1}</span>
                  <Avatar className="w-8 h-8 rounded-md border border-border shrink-0">
                    <AvatarImage src={team.logo} />
                    <AvatarFallback style={{ backgroundColor: team.color }} className="text-[9px] text-white font-bold">
                      {team.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{team.name}</p>
                    <p className="text-[10px] text-muted-foreground">{team.played}P · {team.won}W {team.drawn}D {team.lost}L</p>
                  </div>
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-sm">{team.pts}</span>
                </div>
              ))}
            </div>

            {topStandings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No matches played yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column — Live Feed + Quick Stats */}
        <div className="space-y-6">
          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-black uppercase tracking-tight">Live Feed</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.map((event: any) => {
                const player = players.find(p => p.id === event.playerId);
                const team = teams.find(t => t.id === event.teamId);
                return (
                  <div key={event.id} className="relative pl-4 border-l-2 border-border py-1.5">
                    <div className={cn(
                      "absolute -left-[5px] top-2 w-2 h-2 rounded-full",
                      event.type === 'goal' ? 'bg-primary' :
                      event.type === 'yellow' ? 'bg-yellow-500' :
                      event.type === 'red' ? 'bg-red-500' : 'bg-accent'
                    )} />
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate leading-none">
                          {player?.name || "Unknown"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate">
                          {team?.name}
                        </p>
                      </div>
                      <span className={cn(
                        "shrink-0 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider",
                        event.type === 'goal' ? 'bg-primary/10 text-primary' :
                        event.type === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' :
                        event.type === 'red' ? 'bg-red-500/10 text-red-500' :
                        'bg-accent/10 text-accent'
                      )}>
                        {event.type === 'goal' ? '⚽ Goal' :
                         event.type === 'yellow' ? 'YC' :
                         event.type === 'red' ? 'RC' : '🎯 Ast'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Events will appear once matches are played</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
          >
            <Award className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <h3 className="font-display text-base font-black uppercase tracking-tight">Season at a Glance</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-black">{totalMinutes.toLocaleString()}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Minutes</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{avgGoals}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Avg Goals/Game</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{totalAssists}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Assists</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{totalPresent}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Attendances</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Match Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-display text-base font-black uppercase tracking-tight">Upcoming Fixtures</h3>
            </div>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.slice(0, 3).map((match) => {
                  const home = teams.find(t => t.id === match.homeTeamId);
                  const away = teams.find(t => t.id === match.awayTeamId);
                  return (
                    <div key={match.id} className="flex items-center gap-3 p-2.5 bg-secondary/20 rounded-xl border border-border/20">
                      <div className="flex-1 text-right min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{home?.name || "?"}</p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">vs</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{away?.name || "?"}</p>
                      </div>
                    </div>
                  );
                })}
                {upcomingMatches.length > 3 && (
                  <Link href="/matches" className="block text-center text-[10px] font-black uppercase tracking-widest text-primary hover:underline pt-1">
                    +{upcomingMatches.length - 3} more fixtures
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">No upcoming fixtures</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
