'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Match, Team } from "@/app/hooks/useAppData";

interface LiveMatchCardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  index?: number;
}

const phaseLabels: Record<string, string> = {
  firstHalf: "1st Half",
  halftime: "HT",
  secondHalf: "2nd Half",
  fulltime: "FT",
};

export function LiveMatchCard({ match, homeTeam, awayTeam, index = 0 }: LiveMatchCardProps) {
  const isLive = match.status === 'live';
  const isPlayed = match.status === 'played';
  const isUpcoming = match.status === 'upcoming';
  const timer = match.matchTimer ?? 0;
  const stoppage = match.stoppageTime ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        href={`/live/${match.id}`}
        className={cn(
          "group block relative overflow-hidden rounded-2xl border transition-all duration-300",
          isLive && "border-primary/30 bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
          isPlayed && "border-border bg-card/80 hover:border-primary/20",
          isUpcoming && "border-dashed border-primary/20 bg-primary/[0.02] hover:border-primary/30"
        )}
      >
        {/* Team color glow */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${homeTeam?.primaryColor || 'transparent'} 0%, transparent 50%, ${awayTeam?.primaryColor || 'transparent'} 100%)`
          }}
        />

        <div className="relative p-4">
          <div className="flex items-center gap-3">
            {/* Home Team */}
            <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
              <span className="font-bold text-sm text-right truncate text-foreground group-hover:text-primary transition-colors">
                {homeTeam?.name}
              </span>
              <Avatar className="w-10 h-10 rounded-xl border-2 border-background shadow-sm shrink-0">
                <AvatarImage src={homeTeam?.logo || undefined} className="object-cover" />
                <AvatarFallback style={{ backgroundColor: homeTeam?.primaryColor }} className="text-sm font-bold text-white uppercase">
                  {homeTeam?.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Score / Status */}
            <div className="flex flex-col items-center shrink-0 min-w-[72px]">
              {isLive ? (
                <>
                  <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                    <span className="text-lg font-black tabular-nums text-primary">{match.homeScore}</span>
                    <span className="text-muted-foreground/50 text-sm">:</span>
                    <span className="text-lg font-black tabular-nums text-primary">{match.awayScore}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    <span className="text-[8px] font-black tabular-nums text-red-400">{timer}&prime;</span>
                  </div>
                </>
              ) : isPlayed ? (
                <>
                  <div className="flex items-center gap-1.5 bg-secondary/40 px-3 py-1 rounded-xl">
                    <span className="text-lg font-black tabular-nums">{match.homeScore}</span>
                    <span className="text-muted-foreground/50 text-sm">:</span>
                    <span className="text-lg font-black tabular-nums">{match.awayScore}</span>
                  </div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    FT
                  </span>
                </>
              ) : (
                <>
                  <div className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                      {match.time ? match.time.substring(0, 5) : "TBD"}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    MD {match.matchDay}
                  </span>
                </>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
              <Avatar className="w-10 h-10 rounded-xl border-2 border-background shadow-sm shrink-0">
                <AvatarImage src={awayTeam?.logo || undefined} className="object-cover" />
                <AvatarFallback style={{ backgroundColor: awayTeam?.primaryColor }} className="text-sm font-bold text-white uppercase">
                  {awayTeam?.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                {awayTeam?.name}
              </span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
            <span className="text-[9px] text-muted-foreground font-medium">
              {match.league || "Seasonal League"}
            </span>
            <div className="flex items-center gap-1.5">
              {isLive && (
                <Badge className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                  {phaseLabels[match.matchPhase || 'firstHalf']}
                </Badge>
              )}
              {isLive && (
                <Badge variant="outline" className="text-[8px] font-black tabular-nums px-1.5 py-0 border-zinc-500/30 text-zinc-400">
                  {timer}&prime;
                </Badge>
              )}
            </div>
          </div>

          {/* Live indicator pulse bar */}
          {isLive && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left"
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
