'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Match, PlayerEvent, Player, Team } from "@/app/hooks/useAppData";

interface LiveTimelineProps {
  match: Match;
  goals: PlayerEvent[];
  assists: PlayerEvent[];
  yellowCards: PlayerEvent[];
  redCards: PlayerEvent[];
  players: Player[];
  homeTeam?: Team;
  awayTeam?: Team;
}

export function LiveTimeline({ match, goals, assists, yellowCards, redCards, players, homeTeam, awayTeam }: LiveTimelineProps) {
  const matchId = match?.id;

  // Parse commentary from keyMoments
  const commentaryMoments = useMemo(() => {
    if (!match?.keyMoments) return [];
    return match.keyMoments
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string, index: number) => {
        const minuteRegex = /^(\d+)'?\s*[-:]?\s*(.*)$/;
        const matchArr = line.match(minuteRegex);
        if (matchArr) {
          return {
            id: `commentary-${index}`,
            minute: parseInt(matchArr[1]),
            type: "commentary" as const,
            text: matchArr[2],
            teamId: null,
          };
        }
        return {
          id: `commentary-${index}`,
          minute: null,
          type: "commentary" as const,
          text: line,
          teamId: null,
        };
      });
  }, [match?.keyMoments]);

  // Build merged timeline from events + commentary
  const timeline = useMemo(() => {
    if (!matchId) return [];
    const events: {
      id: string;
      minute: number;
      type: 'goal' | 'assist' | 'yellow' | 'red' | 'commentary';
      text: string;
      playerName?: string;
      teamId?: string;
    }[] = [];

    goals.filter(g => g.matchId === matchId).forEach(g => {
      const p = players.find(pl => pl.id === g.playerId);
      events.push({
        id: `goal-${g.id}`,
        minute: (g as any).minute ?? 0,
        type: 'goal',
        text: `Goal! ${p?.name || "Unknown Player"}`,
        playerName: p?.name,
        teamId: g.teamId,
      });
    });

    assists.filter(a => a.matchId === matchId).forEach(a => {
      const p = players.find(pl => pl.id === a.playerId);
      events.push({
        id: `assist-${a.id}`,
        minute: (a as any).minute ?? 0,
        type: 'assist',
        text: `Assist by ${p?.name || "Unknown Player"}`,
        playerName: p?.name,
        teamId: a.teamId,
      });
    });

    yellowCards.filter(y => y.matchId === matchId).forEach(y => {
      const p = players.find(pl => pl.id === y.playerId);
      events.push({
        id: `yellow-${y.id}`,
        minute: (y as any).minute ?? 0,
        type: 'yellow',
        text: `Yellow card - ${p?.name || "Unknown Player"}`,
        playerName: p?.name,
        teamId: y.teamId,
      });
    });

    redCards.filter(r => r.matchId === matchId).forEach(r => {
      const p = players.find(pl => pl.id === r.playerId);
      events.push({
        id: `red-${r.id}`,
        minute: (r as any).minute ?? 0,
        type: 'red',
        text: `Red card! ${p?.name || "Unknown Player"} sent off`,
        playerName: p?.name,
        teamId: r.teamId,
      });
    });

    commentaryMoments.forEach(c => {
      events.push({
        id: c.id,
        minute: c.minute ?? 0,
        type: 'commentary',
        text: c.text,
      });
    });

    return events.sort((a, b) => b.minute - a.minute);
  }, [matchId, goals, assists, yellowCards, redCards, players, commentaryMoments]);

  const typeStyles: Record<string, { dot: string; bg: string; border: string; label: string }> = {
    goal: {
      dot: "bg-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      label: "Goal",
    },
    assist: {
      dot: "bg-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      label: "Assist",
    },
    yellow: {
      dot: "bg-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      label: "Yellow Card",
    },
    red: {
      dot: "bg-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      label: "Red Card",
    },
    commentary: {
      dot: "bg-muted-foreground",
      bg: "bg-secondary/20",
      border: "border-border/50",
      label: "Commentary",
    },
  };

  const isHome = (teamId?: string) => teamId && teamId === match?.homeTeamId;

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-muted-foreground">No Events Yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
          Match events and commentary will appear here as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Timeline</h3>
      <div className="relative pl-6 border-l-2 border-border/60 space-y-3 ml-2">
        {timeline.map((event, idx) => {
          const style = typeStyles[event.type];
          const home = isHome(event.teamId);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative"
            >
              <span className={cn(
                "absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center",
                style.dot
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
              </span>
              <div className={cn("p-3 rounded-xl border transition-all", style.bg, style.border)}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={cn(
                    "text-[9px] font-black px-1.5 py-0 rounded",
                    event.type === 'goal' ? 'bg-primary text-primary-foreground' :
                    event.type === 'assist' ? 'bg-blue-500 text-white' :
                    event.type === 'yellow' ? 'bg-yellow-500 text-black' :
                    event.type === 'red' ? 'bg-red-500 text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {event.minute}&prime;
                  </Badge>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {style.label}
                  </span>
                  {home !== undefined && (
                    <span className="text-[8px] font-medium text-muted-foreground ml-auto">
                      {home ? (homeTeam?.name || "Home") : (awayTeam?.name || "Away")}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
                  {event.text}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
