'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
  Goal,
  MapPin,
  Shield,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Team, Player, Match, EventRecord, StandingRow, LeagueSettings } from "@/lib/public-league-types";

// ====== HELPERS ======

function teamInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "FC";
}

function safeDateValue(date?: string) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatMatchDate(match: Match) {
  if (!match.scheduledDate) return `MW ${match.matchDay ?? "-"}`;
  const parsed = new Date(match.scheduledDate);
  if (Number.isNaN(parsed.getTime())) return `MW ${match.matchDay ?? "-"}`;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time?: string) {
  if (!time) return "";
  const [hourValue, minuteValue = "00"] = time.split(":");
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteValue.padStart(2, "0")} ${suffix}`;
}

// ====== IS TODAY / IS SOON ======

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isWithinHour(dateStr?: string, timeStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (
    d.getFullYear() !== now.getFullYear() ||
    d.getMonth() !== now.getMonth() ||
    d.getDate() !== now.getDate()
  )
    return false;
  if (!timeStr) return true;
  const [h, m = "0"] = timeStr.split(":");
  const matchTime = new Date();
  matchTime.setHours(Number(h), Number(m), 0, 0);
  const diff = matchTime.getTime() - now.getTime();
  return diff >= 0 && diff <= 3600000;
}

// ====== MAIN CARD COMPONENT ======

export interface TeamTicketCardProps {
  team: Team;
  standings: StandingRow[];
  matches: Match[];
  goals: EventRecord[];
  players: Player[];
  settings: LeagueSettings;
  teamsById: Map<string, Team>;
}

export function TeamTicketCard({
  team,
  standings,
  matches,
  goals,
  players,
  settings,
  teamsById,
}: TeamTicketCardProps) {
  const standing = standings.find((s) => s.id === team.id);

  const teamMatches = useMemo(
    () =>
      matches
        .filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id)
        .sort(
          (a, b) =>
            safeDateValue(b.scheduledDate) - safeDateValue(a.scheduledDate)
        ),
    [matches, team.id]
  );

  const mostRecentResult = teamMatches.find((m) => m.status === "played");
  const nextFixture = [...teamMatches]
    .reverse()
    .find((m) => m.status !== "played");

  const squadCount = players.filter((p) => p.teamId === team.id).length;

  const goalsFor = teamMatches
    .filter((m) => m.status === "played")
    .reduce((acc, m) => {
      if (m.homeTeamId === team.id) return acc + (m.homeScore ?? 0);
      return acc + (m.awayScore ?? 0);
    }, 0);

  const isUrgent =
    nextFixture &&
    (isToday(nextFixture.scheduledDate) ||
      isWithinHour(nextFixture.scheduledDate, nextFixture.time));

  return (
    <article
      className={cn(
        "relative w-full max-w-sm overflow-visible",
        "bg-white dark:bg-[#0c1b14]",
        "border border-[#102018]/15 dark:border-white/10",
        "shadow-sm"
      )}
      style={{ borderRadius: 0 }}
    >
      {/* Notch cutout at perforation line — left side */}
      <div
        className="absolute left-0 z-10 h-5 w-5 rounded-full bg-[#f4f7f1] dark:bg-[#07130f]"
        style={{
          top: "calc(50% - 10px)",
          transform: "translateX(-10px)",
        }}
      />
      {/* Notch cutout at perforation line — right side */}
      <div
        className="absolute right-0 z-10 h-5 w-5 rounded-full bg-[#f4f7f1] dark:bg-[#07130f]"
        style={{
          top: "calc(50% - 10px)",
          transform: "translateX(10px)",
        }}
      />

      {/* ========== TOP ZONE — TICKET BODY (Team Identity) ========== */}
      <div className="relative px-6 pb-4 pt-6">
        {/* Stamp Mark — top right, rotated */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute right-5 top-5 z-20"
          style={{ transform: "rotate(-6deg)" }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ff5e2c]/70 bg-[#ff5e2c]/10">
            <span className="font-display text-[10px] font-bold uppercase leading-tight tracking-wider text-[#ff5e2c]">
              LAGOS
              <br />
              NPL
            </span>
          </div>
        </motion.div>

        {/* Team Crest + Identity */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 rounded-sm border-2 border-[#102018]/15 dark:border-white/10">
            <AvatarImage src={team.logo ?? undefined} />
            <AvatarFallback
              style={{ backgroundColor: team.primaryColor ?? "#2a7b4f" }}
              className="font-display text-xl font-bold text-white"
            >
              {teamInitials(team.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-[#102018] dark:text-white">
              {team.name}
            </h3>
            <p className="mt-1.5 font-body text-xs font-semibold uppercase tracking-wider text-[#526357] dark:text-white/48">
              {settings.seasonName} · {settings.leagueVenue || "Lagos"}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <MiniStatCompact icon={Users} label="Squad" value={squadCount} />
              <MiniStatCompact icon={Shield} label="Played" value={standing?.played ?? 0} />
              <MiniStatCompact icon={Goal} label="Goals" value={goalsFor} />
            </div>
          </div>
        </div>
      </div>

      {/* ========== PERFORATED DIVIDER ========== */}
      <div className="relative">
        <div className="border-t-2 border-dashed border-[#102018]/20 dark:border-white/15" />
      </div>

      {/* ========== BOTTOM ZONE — THE STUB ========== */}
      <div className="space-y-4 px-6 pb-6 pt-4">
        {/* Next Fixture */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <CalendarClock
              className={cn(
                "h-3.5 w-3.5",
                isUrgent
                  ? "text-[#ff5e2c]"
                  : "text-[#2a7b4f] dark:text-[#51d884]"
              )}
            />
            <span
              className={cn(
                "font-display text-[11px] font-semibold uppercase tracking-widest",
                isUrgent
                  ? "text-[#ff5e2c]"
                  : "text-[#526357] dark:text-white/48"
              )}
            >
              {isUrgent ? "● LIVE / TODAY" : "Next Fixture"}
            </span>
          </div>
          {nextFixture ? (
            <div className="flex items-center justify-between rounded-sm border border-[#102018]/10 bg-[#102018]/5 p-3 dark:border-white/8 dark:bg-white/[0.04]">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 rounded-sm border border-[#102018]/10 dark:border-white/10">
                  <AvatarImage
                    src={teamsById.get(nextFixture.homeTeamId)?.logo ?? undefined}
                  />
                  <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">
                    {teamInitials(teamsById.get(nextFixture.homeTeamId)?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-body text-xs font-bold text-[#102018] dark:text-white">
                  {teamsById.get(nextFixture.homeTeamId)?.name ?? "Home"}
                </span>
              </div>
              <span className="font-body text-[10px] font-bold text-[#526357] dark:text-white/45">
                VS
              </span>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs font-bold text-[#102018] dark:text-white">
                  {teamsById.get(nextFixture.awayTeamId)?.name ?? "Away"}
                </span>
                <Avatar className="h-7 w-7 rounded-sm border border-[#102018]/10 dark:border-white/10">
                  <AvatarImage
                    src={teamsById.get(nextFixture.awayTeamId)?.logo ?? undefined}
                  />
                  <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">
                    {teamInitials(teamsById.get(nextFixture.awayTeamId)?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          ) : (
            <p className="font-body text-xs italic text-[#526357] dark:text-white/40">
              No upcoming fixture
            </p>
          )}
          {nextFixture && (
            <div className="mt-1.5 flex items-center gap-2 font-body text-[10px] font-semibold text-[#526357] dark:text-white/45">
              <MapPin className="h-3 w-3" />
              <span>{nextFixture.venue || settings.leagueVenue || "Lagos"}</span>
              <span>·</span>
              <Clock className="h-3 w-3" />
              <span>
                {formatMatchDate(nextFixture)}
                {nextFixture.time ? ` ${formatTime(nextFixture.time)}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Most Recent Result — Scoreboard Style */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-[#2a7b4f] dark:text-[#51d884]" />
            <span className="font-display text-[11px] font-semibold uppercase tracking-widest text-[#526357] dark:text-white/48">
              Most Recent Result
            </span>
          </div>
          {mostRecentResult ? (
            <ScoreboardResult match={mostRecentResult} teamsById={teamsById} teamId={team.id} />
          ) : (
            <p className="font-body text-xs italic text-[#526357] dark:text-white/40">
              No results yet this season
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// ====== SCOREBOARD-STYLE RESULT ======

function ScoreboardResult({
  match,
  teamsById,
  teamId,
}: {
  match: Match;
  teamsById: Map<string, Team>;
  teamId: string;
}) {
  const homeTeam = teamsById.get(match.homeTeamId);
  const awayTeam = teamsById.get(match.awayTeamId);
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const isHome = match.homeTeamId === teamId;
  const isWin = isHome ? homeScore > awayScore : awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  return (
    <div className="rounded-sm border border-[#102018]/10 bg-[#102018]/5 p-3 dark:border-white/8 dark:bg-white/[0.04]">
      {/* Team 1 (Home) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 rounded-sm border border-[#102018]/10 dark:border-white/10">
            <AvatarImage src={homeTeam?.logo ?? undefined} />
            <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">
              {teamInitials(homeTeam?.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <span className="font-body text-xs font-bold text-[#102018] dark:text-white">
            {homeTeam?.name ?? "Home"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ScoreboardDigit value={homeScore} highlight={isHome && isWin && !isDraw} />
          <span className="mx-1 font-display text-sm font-bold text-[#526357] dark:text-white/45">
            :
          </span>
          <ScoreboardDigit value={awayScore} highlight={!isHome && isWin && !isDraw} />
        </div>
      </div>
      {/* Team 2 (Away) */}
      <div className="mt-2 flex items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 rounded-sm border border-[#102018]/10 dark:border-white/10">
            <AvatarImage src={awayTeam?.logo ?? undefined} />
            <AvatarFallback className="bg-[#2a7b4f] text-[10px] font-bold text-white">
              {teamInitials(awayTeam?.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <span className="font-body text-xs font-bold text-[#102018] dark:text-white">
            {awayTeam?.name ?? "Away"}
          </span>
        </div>
      </div>
      {/* Match details */}
      <div className="mt-2 flex items-center gap-2 font-body text-[10px] font-semibold text-[#526357] dark:text-white/45">
        <span>{formatMatchDate(match)}</span>
        {match.time && (
          <>
            <span>·</span>
            <span>{formatTime(match.time)}</span>
          </>
        )}
        {match.venue && (
          <>
            <span>·</span>
            <span>{match.venue}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ====== SCOREBOARD TILE DIGIT ======

function ScoreboardDigit({
  value,
  highlight = false,
}: {
  value: number;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center",
        "font-display text-lg font-bold leading-none",
        "tabular-nums",
        highlight
          ? "bg-[#26c267] text-[#06110d]"
          : "bg-[#102018] text-white dark:bg-black dark:text-white",
        "shadow-[inset_0_-2px_0_rgba(0,0,0,0.3)]"
      )}
      style={{ borderRadius: 2 }}
    >
      {value}
    </span>
  );
}

// ====== COMPACT STAT ======

function MiniStatCompact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-[#526357] dark:text-white/40" />
      <span className="font-display text-sm font-bold leading-none text-[#102018] dark:text-white tabular-nums">
        {value}
      </span>
      <span className="font-body text-[10px] font-semibold text-[#526357] dark:text-white/40">
        {label}
      </span>
    </div>
  );
}