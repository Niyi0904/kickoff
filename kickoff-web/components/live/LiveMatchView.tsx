'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAppContext } from "@/app/context/AppDataContext";
import { useLivePolling } from "@/app/hooks/useLivePolling";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveScoreboard } from "./LiveScoreboard";
import { LiveStats } from "./LiveStats";
import { LiveTimeline } from "./LiveTimeline";
import { LiveCommentary } from "./LiveCommentary";
import { LiveLineups } from "./LiveLineups";
import { LiveMomentum } from "./LiveMomentum";
import { ChevronLeft, BarChart3, Clock, MessageSquare, Users, TrendingUp, Activity } from "lucide-react";
import type { Match } from "@/app/hooks/useAppData";

interface LiveMatchViewProps {
  matchId: string;
  onBack?: () => void;
}

export function LiveMatchView({ matchId, onBack }: LiveMatchViewProps) {
  const { teams, players, matches, goals, assists, yellowCards, redCards, attendance, loading } = useAppContext();
  const [activeTab, setActiveTab] = useState("timeline");

  const match = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId]);
  const homeTeam = useMemo(() => teams.find(t => t.id === match?.homeTeamId), [teams, match?.homeTeamId]);
  const awayTeam = useMemo(() => teams.find(t => t.id === match?.awayTeamId), [teams, match?.awayTeamId]);

  const isLive = match?.status === 'live';
  useLivePolling({ enabled: isLive, interval: 15000 });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Activity className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Match Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          This match doesn&apos;t exist or has been removed.
        </p>
        <Link href="/live">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Live
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 pb-10">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Live
        </button>
      )}

      {/* Hero Scoreboard */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 mb-6"
      >
        <LiveScoreboard match={match} homeTeam={homeTeam} awayTeam={awayTeam} />

        {/* Quick stat row */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex items-center justify-center gap-6 px-4 py-2.5 border-t border-white/5 bg-white/[0.02]"
          >
            <QuickStat label="Shots" home={match.homeShots ?? 0} away={match.awayShots ?? 0} />
            <div className="w-px h-4 bg-white/10" />
            <QuickStat label="SOT" home={match.homeShotsOnTarget ?? 0} away={match.awayShotsOnTarget ?? 0} />
            <div className="w-px h-4 bg-white/10" />
            <QuickStat label="Corners" home={match.homeCorners ?? 0} away={match.awayCorners ?? 0} />
            <div className="w-px h-4 bg-white/10" />
            <QuickStat label="Poss" home={match.homePossession ?? 0} away={match.awayPossession ?? 0} suffix="%" />
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-border mb-6 overflow-x-auto">
          <TabsList className="w-max bg-transparent border-none p-0 gap-4 sm:gap-6 h-12">
            {[
              { value: "timeline", label: "Timeline", icon: Clock },
              { value: "stats", label: "Stats", icon: BarChart3 },
              { value: "momentum", label: "Momentum", icon: TrendingUp },
              { value: "lineups", label: "Lineups", icon: Users },
              { value: "commentary", label: "Commentary", icon: MessageSquare },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="bg-transparent border-b-2 border-transparent rounded-none px-1 h-full font-black text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all whitespace-nowrap"
              >
                <tab.icon className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "timeline" && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                  <LiveTimeline
                    match={match}
                    goals={goals}
                    assists={assists}
                    yellowCards={yellowCards}
                    redCards={redCards}
                    players={players}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                  />
                </div>
              )}
              {activeTab === "stats" && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                  <LiveStats match={match} homeColor={homeTeam?.primaryColor} awayColor={awayTeam?.primaryColor} />
                </div>
              )}
              {activeTab === "momentum" && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                  <LiveMomentum match={match} homeColor={homeTeam?.primaryColor} awayColor={awayTeam?.primaryColor} />
                </div>
              )}
              {activeTab === "lineups" && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                  <LiveLineups
                    match={match}
                    players={players}
                    goals={goals}
                    assists={assists}
                    yellowCards={yellowCards}
                    redCards={redCards}
                    attendance={attendance}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                  />
                </div>
              )}
              {activeTab === "commentary" && (
                <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6">
                  <LiveCommentary match={match} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>

      {/* Navigation Links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NavCard href={`/teams/${match.homeTeamId}`} label="Home Team" value={homeTeam?.name || "Team"} />
        <NavCard href={`/teams/${match.awayTeamId}`} label="Away Team" value={awayTeam?.name || "Team"} />
        <NavCard href="/standings" label="League Table" value="Standings" />
        <NavCard href="/matches" label="All Fixtures" value="Match Week" />
      </div>
    </div>
  );
}

function QuickStat({ label, home, away, suffix = "" }: { label: string; home: number; away: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold">
      <span className="text-zinc-400 tabular-nums">{home}{suffix}</span>
      <span className="text-zinc-600 uppercase tracking-wider">{label}</span>
      <span className="text-zinc-400 tabular-nums">{away}{suffix}</span>
    </div>
  );
}

function NavCard({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link
      href={href}
      className="group block p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 transition-all"
    >
      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
        {label}
      </p>
      <p className="text-sm font-bold text-foreground truncate mt-0.5">{value}</p>
    </Link>
  );
}
