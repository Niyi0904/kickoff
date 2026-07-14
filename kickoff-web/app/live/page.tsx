'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAppContext } from "@/app/context/AppDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLivePolling } from "@/app/hooks/useLivePolling";
import { LiveMatchCard } from "@/components/live/LiveMatchCard";
import { LiveMatchView } from "@/components/live/LiveMatchView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Radio, Activity, Calendar, ChevronRight,
  Zap, Clock, Trophy, AlertCircle, WifiOff
} from "lucide-react";

export default function LivePage() {
  return (
    <ProtectedRoute>
      <LivePageContent />
    </ProtectedRoute>
  );
}

function LivePageContent() {
  const { teams, matches, loading } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'live' | 'today' | 'upcoming' | 'played'>('live');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Check for matchId in URL hash for deep linking
  const hasLiveMatch = matches.some(m => m.status === 'live');

  useLivePolling({ enabled: hasLiveMatch, interval: 15000 });

  const todaysMatches = useMemo(() => {
    const today = new Date().toDateString();
    return matches.filter(m => {
      if (!m.scheduledDate) return false;
      return new Date(m.scheduledDate).toDateString() === today;
    });
  }, [matches]);

  const filteredMatches = useMemo(() => {
    switch (filter) {
      case 'live':
        return matches.filter(m => m.status === 'live');
      case 'today':
        return todaysMatches;
      case 'upcoming':
        return matches.filter(m => m.status === 'upcoming');
      case 'played':
        return matches.filter(m => m.status === 'played');
      default:
        return matches;
    }
  }, [matches, filter, todaysMatches]);

  const liveCount = matches.filter(m => m.status === 'live').length;

  if (selectedMatchId) {
    return (
      <LiveMatchView
        matchId={selectedMatchId}
        onBack={() => setSelectedMatchId(null)}
      />
    );
  }

  return (
    <div className="px-4 min-w-0 pb-20">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
      >
        <span>Live</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Match Centre</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Radio className="w-7 h-7 text-primary" />
            Live
          </h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Follow the action in real time
          </p>
        </div>
        {liveCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              {liveCount} Live Match{liveCount > 1 ? 'es' : ''}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-2 mb-6"
      >
        {[
          { value: 'live' as const, label: 'Live', icon: Zap },
          { value: 'today' as const, label: "Today", icon: Calendar },
          { value: 'upcoming' as const, label: 'Upcoming', icon: Clock },
          { value: 'played' as const, label: 'Played', icon: Trophy },
          { value: 'all' as const, label: 'All', icon: Activity },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-card text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground"
            )}
          >
            <f.icon className="w-3 h-3" />
            {f.label}
            {f.value === 'live' && liveCount > 0 && (
              <Badge className="ml-1 text-[8px] px-1 py-0 bg-white/20 text-white">
                {liveCount}
              </Badge>
            )}
          </button>
        ))}
      </motion.div>

      {/* Match Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </motion.div>
        ) : filteredMatches.length > 0 ? (
          <motion.div
            key="matches"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredMatches.map((match, index) => (
              <div key={match.id} onClick={() => setSelectedMatchId(match.id)} className="cursor-pointer">
                <LiveMatchCard
                  match={match}
                  homeTeam={teams.find(t => t.id === match.homeTeamId)}
                  awayTeam={teams.find(t => t.id === match.awayTeamId)}
                  index={index}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            {filter === 'live' ? (
              <>
                <Radio className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No Live Matches</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  There are no matches currently in progress. Check back on match day or browse upcoming fixtures.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setFilter('today')}>
                  <Calendar className="w-4 h-4 mr-2" /> See Today&apos;s Matches
                </Button>
              </>
            ) : (
              <>
                <Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No Matches Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No matches match the current filter.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setFilter('all')}>
                  <Activity className="w-4 h-4 mr-2" /> View All Matches
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
