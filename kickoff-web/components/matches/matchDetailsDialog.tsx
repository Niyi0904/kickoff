'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/app/context/AppDataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, Trophy, BookOpen, 
  MessageSquare, Users, AlertCircle, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime12h } from "@/lib/fixtures";

interface MatchDetailsDialogProps {
  match: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional props for public page usage where useAppContext isn't available/used
  teams?: any[];
  players?: any[];
  goals?: any[];
  assists?: any[];
  yellowCards?: any[];
  redCards?: any[];
  attendance?: any[];
}

export function MatchDetailsDialog({
  match,
  open,
  onOpenChange,
  teams: propTeams,
  players: propPlayers,
  goals: propGoals,
  assists: propAssists,
  yellowCards: propYellowCards,
  redCards: propRedCards,
  attendance: propAttendance
}: MatchDetailsDialogProps) {
  // Use context if props are not supplied (Admin view)
  const context = useAppContext();
  const teams = propTeams || context?.teams || [];
  const players = propPlayers || context?.players || [];
  const goals = propGoals || context?.goals || [];
  const assists = propAssists || context?.assists || [];
  const yellowCards = propYellowCards || context?.yellowCards || [];
  const redCards = propRedCards || context?.redCards || [];
  const attendance = propAttendance || context?.attendance || [];

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Filter events for this match
  const matchGoals = useMemo(
    () => (match ? goals.filter((g: any) => g.matchId === match.id) : []),
    [goals, match?.id]
  );
  const matchAssists = useMemo(
    () => (match ? assists.filter((a: any) => a.matchId === match.id) : []),
    [assists, match?.id]
  );
  const matchYellows = useMemo(
    () => (match ? yellowCards.filter((y: any) => y.matchId === match.id) : []),
    [yellowCards, match?.id]
  );
  const matchReds = useMemo(
    () => (match ? redCards.filter((r: any) => r.matchId === match.id) : []),
    [redCards, match?.id]
  );
  const matchAttendance = useMemo(
    () => (match ? attendance.filter((a: any) => a.matchId === match.id && a.present) : []),
    [attendance, match?.id]
  );

  // Parse commentary moments
  const timelineMoments = useMemo(() => {
    if (!match?.keyMoments) return [];
    return match.keyMoments
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string, index: number) => {
        // Look for minute formats like "45' - text" or "12' text"
        const minuteRegex = /^(\d+)'?\s*[-:]?\s*(.*)$/;
        const matchArr = line.match(minuteRegex);
        if (matchArr) {
          return {
            id: `moment-${index}`,
            minute: parseInt(matchArr[1]),
            type: "commentary",
            text: matchArr[2],
          };
        }
        return {
          id: `moment-${index}`,
          minute: null,
          type: "commentary",
          text: line,
        };
      });
  }, [match?.keyMoments]);

  const homeEvents = useMemo(() => {
    if (!match) return [];
    const events: any[] = [];
    matchGoals.filter((g: any) => g.teamId === match.homeTeamId).forEach((g: any) => {
      const p = players.find((pl: any) => pl.id === g.playerId);
      events.push({ type: 'goal', playerName: p?.name || "Unknown Player", minute: null });
    });
    matchYellows.filter((y: any) => y.teamId === match.homeTeamId).forEach((y: any) => {
      const p = players.find((pl: any) => pl.id === y.playerId);
      events.push({ type: 'yellow', playerName: p?.name || "Unknown Player", minute: null });
    });
    matchReds.filter((r: any) => r.teamId === match.homeTeamId).forEach((r: any) => {
      const p = players.find((pl: any) => pl.id === r.playerId);
      events.push({ type: 'red', playerName: p?.name || "Unknown Player", minute: null });
    });
    return events;
  }, [match, matchGoals, matchYellows, matchReds, players]);

  const awayEvents = useMemo(() => {
    if (!match) return [];
    const events: any[] = [];
    matchGoals.filter((g: any) => g.teamId === match.awayTeamId).forEach((g: any) => {
      const p = players.find((pl: any) => pl.id === g.playerId);
      events.push({ type: 'goal', playerName: p?.name || "Unknown Player", minute: null });
    });
    matchYellows.filter((y: any) => y.teamId === match.awayTeamId).forEach((y: any) => {
      const p = players.find((pl: any) => pl.id === y.playerId);
      events.push({ type: 'yellow', playerName: p?.name || "Unknown Player", minute: null });
    });
    matchReds.filter((r: any) => r.teamId === match.awayTeamId).forEach((r: any) => {
      const p = players.find((pl: any) => pl.id === r.playerId);
      events.push({ type: 'red', playerName: p?.name || "Unknown Player", minute: null });
    });
    return events;
  }, [match, matchGoals, matchYellows, matchReds, players]);

  const homeLineup = useMemo(() => {
    if (!match) return [];
    return players
      .filter((p: any) => p.teamId === match.homeTeamId && matchAttendance.some((a: any) => a.playerId === p.id))
      .map((p: any) => {
        const goalsCount = matchGoals.filter((g: any) => g.playerId === p.id).length;
        const assistsCount = matchAssists.filter((a: any) => a.playerId === p.id).length;
        const yellowsCount = matchYellows.filter((y: any) => y.playerId === p.id).length;
        const redsCount = matchReds.filter((r: any) => r.playerId === p.id).length;
        return { ...p, goalsCount, assistsCount, yellowsCount, redsCount };
      });
  }, [players, match?.homeTeamId, matchAttendance, matchGoals, matchAssists, matchYellows, matchReds]);

  const awayLineup = useMemo(() => {
    if (!match) return [];
    return players
      .filter((p: any) => p.teamId === match.awayTeamId && matchAttendance.some((a: any) => a.playerId === p.id))
      .map((p: any) => {
        const goalsCount = matchGoals.filter((g: any) => g.playerId === p.id).length;
        const assistsCount = matchAssists.filter((a: any) => a.playerId === p.id).length;
        const yellowsCount = matchYellows.filter((y: any) => y.playerId === p.id).length;
        const redsCount = matchReds.filter((r: any) => r.playerId === p.id).length;
        return { ...p, goalsCount, assistsCount, yellowsCount, redsCount };
      });
  }, [players, match?.awayTeamId, matchAttendance, matchGoals, matchAssists, matchYellows, matchReds]);

  if (!match) return null;

  const homeTeam = teams.find((t: any) => t.id === match.homeTeamId);
  const awayTeam = teams.find((t: any) => t.id === match.awayTeamId);
  const formattedTime = match.time ? formatTime12h(match.time) : "";
  const formattedDate = match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "Scheduled Date TBD";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background border-border/80">
        <DialogTitle className="sr-only">Match Details</DialogTitle>
        
        <div 
          className="relative px-6 py-8 border-b shrink-0 text-white overflow-hidden flex flex-col items-center justify-center bg-zinc-950"
        >
          {/* Background color gradient glow from Home to Away colors */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none filter blur-xl scale-110"
            style={{
              background: `radial-gradient(circle at 20% 50%, ${homeTeam?.primaryColor || '#1e3a8a'}, transparent 50%),
                           radial-gradient(circle at 80% 50%, ${awayTeam?.primaryColor || '#1e3a8a'}, transparent 50%)`
            }}
          />
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" />

          {/* Header Metadata */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 mb-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white/10 px-3 py-1 rounded-full text-zinc-300">
              Match Week {match.matchDay} • {match.league || "Seasonal League"}
            </span>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-semibold mt-1">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formattedDate}</span>
              {formattedTime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formattedTime}</span>}
            </div>
          </div>

          {/* Teams and Scores row */}
          <div className="relative z-10 w-full flex items-center justify-between gap-4 max-w-2xl px-4">
            {/* Home Team */}
            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 text-right">
              <span className="font-black text-base sm:text-xl tracking-tight order-2 sm:order-1 text-center sm:text-right w-full sm:w-auto uppercase">
                {homeTeam?.name}
              </span>
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 shadow-lg order-1 sm:order-2">
                <AvatarImage src={homeTeam?.logo || undefined} className="object-cover" />
                <AvatarFallback style={{ backgroundColor: homeTeam?.primaryColor }} className="text-xl font-bold text-white uppercase">
                  {homeTeam?.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center shrink-0 min-w-[100px]">
              {match.status === 'played' ? (
                <div className="flex items-center gap-4 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <span className="text-3xl sm:text-4xl font-black font-display tracking-tight tabular-nums">{match.homeScore}</span>
                  <span className="text-zinc-500 font-light text-2xl">:</span>
                  <span className="text-3xl sm:text-4xl font-black font-display tracking-tight tabular-nums">{match.awayScore}</span>
                </div>
              ) : (
                <Badge variant="outline" className="border-white/20 bg-white/5 text-zinc-300 font-bold uppercase tracking-widest text-[10px] px-3 py-1.5">
                  Scheduled
                </Badge>
              )}
              {match.status === 'played' && (
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2 bg-white/5 px-2 py-0.5 rounded">
                  {match.minutesPlayed}' Played
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-1 flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 text-left">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 shadow-lg">
                <AvatarImage src={awayTeam?.logo || undefined} className="object-cover" />
                <AvatarFallback style={{ backgroundColor: awayTeam?.primaryColor }} className="text-xl font-bold text-white uppercase">
                  {awayTeam?.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="font-black text-base sm:text-xl tracking-tight text-center sm:text-left w-full sm:w-auto uppercase">
                {awayTeam?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 border-b bg-muted/20 shrink-0 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-max bg-transparent border-none p-0 gap-6 h-12">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent border-b-2 border-transparent rounded-none px-1 h-full font-black text-xs uppercase tracking-widest text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 mr-2" /> Match Report
              </TabsTrigger>
              <TabsTrigger 
                value="commentary" 
                className="bg-transparent border-b-2 border-transparent rounded-none px-1 h-full font-black text-xs uppercase tracking-widest text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Timeline / Commentary
              </TabsTrigger>
              <TabsTrigger 
                value="lineups" 
                className="bg-transparent border-b-2 border-transparent rounded-none px-1 h-full font-black text-xs uppercase tracking-widest text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 mr-2" /> Squad Lineups
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full px-6 py-6">
            
            {/* Overview / Narrative Report */}
            {activeTab === "overview" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {match.report ? (
                  <article className="prose prose-zinc dark:prose-invert max-w-none">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">League Press Release</span>
                    </div>
                    {/* Render paragraph chunks split by double newlines */}
                    <div className="space-y-4 text-foreground/90 leading-relaxed text-sm md:text-base">
                      {match.report.split("\n\n").map((para: string, i: number) => (
                        <p key={i} className="whitespace-pre-line bg-secondary/10 p-4 rounded-xl border border-border/40">
                          {para}
                        </p>
                      ))}
                    </div>
                  </article>
                ) : (
                  <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-border">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h4 className="text-md font-bold text-foreground">No Match Report Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px] mx-auto mt-1">
                      The official match summary hasn&apos;t been written for this fixture.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Commentary Timeline */}
            {activeTab === "commentary" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative pl-6 border-l-2 border-border/85 space-y-6 py-2 ml-4"
              >
                {timelineMoments.length > 0 ? (
                  timelineMoments.map((moment: any, idx: number) => (
                    <motion.div 
                      key={moment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline Icon Point */}
                      <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </span>

                      {/* Content Card */}
                      <div className="bg-secondary/20 p-4 rounded-2xl border border-border/50 shadow-sm hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-2 mb-1.5">
                          {moment.minute !== null ? (
                            <Badge className="font-black text-[10px] tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground">
                              {moment.minute}&apos;
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-bold text-[9px] tracking-wider px-1.5 py-0">
                              Event
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
                          {moment.text}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5 border-border -ml-6">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h4 className="text-md font-bold text-foreground">No Commentary Logs</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px] mx-auto mt-1">
                      No minute-by-minute text events were logged for this match.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Squad Lineups */}
            {activeTab === "lineups" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Home Lineup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-black text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: homeTeam?.primaryColor }} />
                      {homeTeam?.name} Lineup
                    </h4>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {homeLineup.length} Players
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {homeLineup.length > 0 ? (
                      homeLineup.map((player: any) => (
                        <LineupPlayerRow key={player.id} player={player} />
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center italic">No roster data available.</p>
                    )}
                  </div>
                </div>

                {/* Away Lineup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-black text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: awayTeam?.primaryColor }} />
                      {awayTeam?.name} Lineup
                    </h4>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {awayLineup.length} Players
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {awayLineup.length > 0 ? (
                      awayLineup.map((player: any) => (
                        <LineupPlayerRow key={player.id} player={player} />
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center italic">No roster data available.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </ScrollArea>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// Subcomponent for Lineup Row with badges for match events
function LineupPlayerRow({ player }: { player: any }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card/50 hover:bg-secondary/30 transition-colors group">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-muted-foreground w-6 group-hover:text-primary transition-colors text-center">
          #{player.number}
        </span>
        <Avatar className="w-8 h-8 rounded-lg border border-border shrink-0">
          <AvatarImage src={player.photo || undefined} className="object-cover" />
          <AvatarFallback className="text-[10px] font-bold bg-secondary uppercase">
            {player.name?.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className="font-bold text-xs sm:text-sm block truncate">{player.name}</span>
          <span className="text-[9px] uppercase font-black text-muted-foreground block leading-none">{player.position}</span>
        </div>
      </div>

      {/* Badges for Goals/Cards in this match */}
      <div className="flex items-center gap-1 shrink-0">
        {player.goalsCount > 0 && (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 font-black text-[9px] px-1.5 py-0 flex items-center gap-0.5">
            ⚽ {player.goalsCount}
          </Badge>
        )}
        {player.assistsCount > 0 && (
          <Badge variant="outline" className="border-blue-500/20 text-blue-500 font-black text-[9px] px-1.5 py-0 flex items-center gap-0.5">
            👟 {player.assistsCount}
          </Badge>
        )}
        {player.yellowsCount > 0 && (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/10 font-black text-[9px] px-1 py-0">
            🟨
          </Badge>
        )}
        {player.redsCount > 0 && (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/10 font-black text-[9px] px-1 py-0 animate-pulse">
            🟥
          </Badge>
        )}
      </div>
    </div>
  );
}
