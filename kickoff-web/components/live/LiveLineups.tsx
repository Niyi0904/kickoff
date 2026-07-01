'use client';

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import type { Match, Player, PlayerEvent, MatchAttendance, Team } from "@/app/hooks/useAppData";

interface LiveLineupsProps {
  match: Match;
  players: Player[];
  goals: PlayerEvent[];
  assists: PlayerEvent[];
  yellowCards: PlayerEvent[];
  redCards: PlayerEvent[];
  attendance: MatchAttendance[];
  homeTeam?: Team;
  awayTeam?: Team;
}

function LineupPlayerRow({ player, goalsCount, assistsCount, yellowsCount, redsCount }: {
  player: Player;
  goalsCount: number;
  assistsCount: number;
  yellowsCount: number;
  redsCount: number;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card/50 hover:bg-secondary/30 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[11px] font-bold text-muted-foreground w-6 group-hover:text-primary transition-colors text-center shrink-0">
          #{player.number}
        </span>
        <Avatar className="w-7 h-7 rounded-lg border border-border shrink-0">
          <AvatarImage src={player.photo || undefined} className="object-cover" />
          <AvatarFallback className="text-[9px] font-bold bg-secondary uppercase">
            {player.name?.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className="font-bold text-xs block truncate">{player.name}</span>
          <span className="text-[8px] uppercase font-bold text-muted-foreground block leading-none">{player.position}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {goalsCount > 0 && (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 font-black text-[8px] px-1.5 py-0">
            ⚽ {goalsCount}
          </Badge>
        )}
        {assistsCount > 0 && (
          <Badge variant="outline" className="border-blue-500/20 text-blue-500 font-black text-[8px] px-1.5 py-0">
            👟 {assistsCount}
          </Badge>
        )}
        {yellowsCount > 0 && (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-black text-[8px] px-1 py-0">
            🟨
          </Badge>
        )}
        {redsCount > 0 && (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-black text-[8px] px-1 py-0">
            🟥
          </Badge>
        )}
      </div>
    </div>
  );
}

export function LiveLineups({ match, players, goals, assists, yellowCards, redCards, attendance, homeTeam, awayTeam }: LiveLineupsProps) {
  const matchId = match?.id;
  const [showHomeSubs, setShowHomeSubs] = useState(false);
  const [showAwaySubs, setShowAwaySubs] = useState(false);

  const matchGoals = useMemo(
    () => (matchId ? goals.filter(g => g.matchId === matchId) : []),
    [goals, matchId]
  );
  const matchAssists = useMemo(
    () => (matchId ? assists.filter(a => a.matchId === matchId) : []),
    [assists, matchId]
  );
  const matchYellows = useMemo(
    () => (matchId ? yellowCards.filter(y => y.matchId === matchId) : []),
    [yellowCards, matchId]
  );
  const matchReds = useMemo(
    () => (matchId ? redCards.filter(r => r.matchId === matchId) : []),
    [redCards, matchId]
  );
  const matchAttendance = useMemo(
    () => (matchId ? attendance.filter(a => a.matchId === matchId && a.present) : []),
    [attendance, matchId]
  );

  const homeLineup = useMemo(() => {
    if (!match) return [];
    return players
      .filter(p => p.teamId === match.homeTeamId && matchAttendance.some(a => a.playerId === p.id))
      .map(p => ({
        ...p,
        goalsCount: matchGoals.filter(g => g.playerId === p.id).length,
        assistsCount: matchAssists.filter(a => a.playerId === p.id).length,
        yellowsCount: matchYellows.filter(y => y.playerId === p.id).length,
        redsCount: matchReds.filter(r => r.playerId === p.id).length,
      }));
  }, [players, match?.homeTeamId, matchAttendance, matchGoals, matchAssists, matchYellows, matchReds]);

  const awayLineup = useMemo(() => {
    if (!match) return [];
    return players
      .filter(p => p.teamId === match.awayTeamId && matchAttendance.some(a => a.playerId === p.id))
      .map(p => ({
        ...p,
        goalsCount: matchGoals.filter(g => g.playerId === p.id).length,
        assistsCount: matchAssists.filter(a => a.playerId === p.id).length,
        yellowsCount: matchYellows.filter(y => y.playerId === p.id).length,
        redsCount: matchReds.filter(r => r.playerId === p.id).length,
      }));
  }, [players, match?.awayTeamId, matchAttendance, matchGoals, matchAssists, matchYellows, matchReds]);

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Squad Lineups</h3>

      {/* Home Team Lineup */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: homeTeam?.primaryColor }} />
            {homeTeam?.name}
          </h4>
          <Badge variant="outline" className="text-[9px] font-bold">
            {homeLineup.length} Players
          </Badge>
        </div>
        <div className="grid gap-1.5">
          {homeLineup.length > 0 ? (
            homeLineup.map(player => (
              <LineupPlayerRow key={player.id} {...player} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center italic">No lineup data available.</p>
          )}
        </div>
      </div>

      {/* Away Team Lineup */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h4 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: awayTeam?.primaryColor }} />
            {awayTeam?.name}
          </h4>
          <Badge variant="outline" className="text-[9px] font-bold">
            {awayLineup.length} Players
          </Badge>
        </div>
        <div className="grid gap-1.5">
          {awayLineup.length > 0 ? (
            awayLineup.map(player => (
              <LineupPlayerRow key={player.id} {...player} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center italic">No lineup data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
