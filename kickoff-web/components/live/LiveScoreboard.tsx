'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Match, Team } from "@/app/hooks/useAppData";

interface LiveScoreboardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  compact?: boolean;
}

const phaseLabels: Record<string, string> = {
  firstHalf: "1st Half",
  halftime: "Half Time",
  secondHalf: "2nd Half",
  fulltime: "Full Time",
};

export function LiveScoreboard({ match, homeTeam, awayTeam, compact }: LiveScoreboardProps) {
  const isLive = match.status === 'live';
  const isPlayed = match.status === 'played';
  const isUpcoming = match.status === 'upcoming';
  const timer = match.matchTimer ?? 0;
  const stoppage = match.stoppageTime ?? 0;
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const phase = match.matchPhase ?? 'firstHalf';

  return (
    <div className={cn(
      "relative overflow-hidden",
      compact ? "px-3 py-3" : "px-4 py-5 sm:px-6 sm:py-8"
    )}>
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 25% 50%, ${homeTeam?.primaryColor || '#1e3a8a'}, transparent 60%),
                       radial-gradient(circle at 75% 50%, ${awayTeam?.primaryColor || '#1e3a8a'}, transparent 60%)`
        }}
      />
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
        {!compact && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <span>Match Week {match.matchDay}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>{match.league || "Seasonal League"}</span>
          </div>
        )}

        {isLive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-red-400">LIVE</span>
          </motion.div>
        )}

        {/* Teams + Score */}
        <div className={cn(
          "flex items-center justify-between w-full",
          compact ? "gap-2" : "gap-3 sm:gap-6 max-w-2xl"
        )}>
          {/* Home Team */}
          <div className={cn(
            "flex items-center gap-2 sm:gap-3 flex-1",
            compact ? "justify-end" : "flex-col sm:flex-row justify-end"
          )}>
            <Avatar className={cn(
              "rounded-xl border-2 border-white/20 shadow-lg shrink-0",
              compact ? "w-10 h-10" : "w-12 h-12 sm:w-16 sm:h-16"
            )}>
              <AvatarImage src={homeTeam?.logo || undefined} className="object-cover" />
              <AvatarFallback style={{ backgroundColor: homeTeam?.primaryColor }} className="text-lg sm:text-xl font-bold text-white uppercase">
                {homeTeam?.name?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "font-black tracking-tight text-white uppercase leading-tight",
              compact ? "text-xs text-right" : "text-sm sm:text-xl text-center sm:text-right"
            )}>
              {homeTeam?.name}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center shrink-0">
            <div className={cn(
              "flex items-center bg-white/10 border border-white/10 backdrop-blur-sm",
              compact ? "gap-2 px-3 py-1 rounded-xl" : "gap-3 sm:gap-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl"
            )}>
              <span className={cn(
                "font-black tabular-nums tracking-tight text-white",
                compact ? "text-xl" : "text-2xl sm:text-4xl"
              )}>
                {homeScore}
              </span>
              <span className="text-zinc-500 font-light text-xl sm:text-2xl">:</span>
              <span className={cn(
                "font-black tabular-nums tracking-tight text-white",
                compact ? "text-xl" : "text-2xl sm:text-4xl"
              )}>
                {awayScore}
              </span>
            </div>
            {isLive && (
              <motion.div
                key={`${phase}-${timer}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 mt-1.5"
              >
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/10 text-zinc-300 border-white/10">
                  {phaseLabels[phase] || phase}
                </Badge>
                <Badge className="text-[9px] font-black tabular-nums px-2 py-0.5 bg-primary/20 text-primary border-primary/30">
                  {timer}&prime;{stoppage > 0 && <span className="text-[8px] text-zinc-400 ml-0.5">+{stoppage}</span>}
                </Badge>
              </motion.div>
            )}
            {isPlayed && (
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 bg-white/5 px-2 py-0.5 rounded">
                {match.minutesPlayed}&prime; Played
              </span>
            )}
            {isUpcoming && (
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">
                {match.time || "TBD"} &middot; {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString() : "Scheduled"}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className={cn(
            "flex items-center gap-2 sm:gap-3 flex-1",
            compact ? "justify-start" : "flex-col sm:flex-row justify-start"
          )}>
            <Avatar className={cn(
              "rounded-xl border-2 border-white/20 shadow-lg shrink-0",
              compact ? "w-10 h-10" : "w-12 h-12 sm:w-16 sm:h-16"
            )}>
              <AvatarImage src={awayTeam?.logo || undefined} className="object-cover" />
              <AvatarFallback style={{ backgroundColor: awayTeam?.primaryColor }} className="text-lg sm:text-xl font-bold text-white uppercase">
                {awayTeam?.name?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "font-black tracking-tight text-white uppercase leading-tight",
              compact ? "text-xs" : "text-sm sm:text-xl text-center sm:text-left"
            )}>
              {awayTeam?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
