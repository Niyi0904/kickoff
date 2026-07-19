'use client';

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Play, CalendarDays, MapPin } from "lucide-react";
import { usePublicLeagueData, useLeagueDefaults } from "@/app/hooks/usePublicLeagueData";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptySurface } from "@/components/public/EmptySurface";
import { cn } from "@/lib/utils";

function teamInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "FC";
}

function formatMatchDate(match: { scheduledDate?: string; matchDay?: number }) {
  if (!match.scheduledDate) return `Match Week ${match.matchDay ?? "-"}`;
  const parsed = new Date(match.scheduledDate);
  if (Number.isNaN(parsed.getTime())) return `Match Week ${match.matchDay ?? "-"}`;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

function safeDateValue(date?: string) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function PublicMatchesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicLeagueData(slug);
  const { teams, matches } = useLeagueDefaults(data);

  const [filter, setFilter] = useState<"all" | "played" | "upcoming">("all");

  const base = `/public-league/${slug}`;
  const navItems = [
    { label: "Home", href: base },
    { label: "Matches", href: `${base}/matches` },
    { label: "Standings", href: `${base}/standings` },
    { label: "Teams", href: `${base}/teams` },
    { label: "Stats", href: `${base}/stats` },
  ];

  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const playedMatches = useMemo(
    () =>
      matches
        .filter((m) => m.status === "played")
        .sort((a, b) => safeDateValue(b.scheduledDate) - safeDateValue(a.scheduledDate) || (b.matchDay ?? 0) - (a.matchDay ?? 0)),
    [matches],
  );

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((m) => m.status !== "played")
        .sort((a, b) => safeDateValue(a.scheduledDate) - safeDateValue(b.scheduledDate) || (a.matchDay ?? 0) - (b.matchDay ?? 0)),
    [matches],
  );

  const filteredPlayed = filter === "all" || filter === "played" ? playedMatches : [];
  const filteredUpcoming = filter === "all" || filter === "upcoming" ? upcomingMatches : [];

  return (
    <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
      <PublicHeader navItems={navItems} />

      <section className="px-4 py-24 sm:px-6 lg:px-8 min-w-0">
        <div className="mx-auto max-w-7xl min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#51d884]">
              <span className="h-2 w-2 rounded-full bg-[#51d884]" />
              Fixtures
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Matches & Results</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
              Upcoming fixtures and recent results from the season.
            </p>
          </motion.div>

          <div className="flex p-1 bg-white/[0.04] border border-white/10 rounded-md mb-8 w-fit">
            {(["all", "played", "upcoming"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-[#26c267] text-[#06110d]" : "text-white/48 hover:text-white",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-md border border-white/10 bg-white/[0.05]" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <EmptySurface icon={CalendarDays} title="No fixtures yet" text="Match schedule will appear when fixtures are generated." />
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {filteredUpcoming.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-[#f5c84b]" />
                    <h2 className="text-xl font-black text-white">Upcoming</h2>
                  </div>
                  <AnimatePresence mode="popLayout">
                    <div className="grid gap-3">
                      {filteredUpcoming.map((match, i) => {
                        const home = teamsById.get(match.homeTeamId);
                        const away = teamsById.get(match.awayTeamId);
                        return (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="rounded-md border border-dashed border-white/12 bg-white/[0.03] p-4"
                          >
                            <div className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold text-white/45">
                              <span>Match Week {match.matchDay ?? "-"}</span>
                              <span>{formatMatchDate(match)} {match.time ? `- ${formatTime(match.time)}` : ""}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                              <div className="flex min-w-0 items-center justify-end gap-3 text-right">
                                <span className="hidden sm:block truncate text-sm font-black text-white">{home?.name ?? "Home"}</span>
                                <Avatar className="h-10 w-10 rounded-md border border-white/10 shrink-0">
                                  <AvatarImage src={home?.logo ?? undefined} />
                                  <AvatarFallback style={{ backgroundColor: home?.primaryColor ?? "#26c267" }} className="text-xs font-bold text-white">{teamInitials(home?.name)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="min-w-20 rounded-md border border-[#f5c84b]/20 bg-[#f5c84b]/8 px-4 py-3 text-center">
                                <div className="text-xs font-black text-[#f5c84b]">Scheduled</div>
                              </div>
                              <div className="flex min-w-0 items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-md border border-white/10 shrink-0">
                                  <AvatarImage src={away?.logo ?? undefined} />
                                  <AvatarFallback style={{ backgroundColor: away?.primaryColor ?? "#26c267" }} className="text-xs font-bold text-white">{teamInitials(away?.name)}</AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block truncate text-sm font-black text-white">{away?.name ?? "Away"}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-white/45">
                              <MapPin className="h-3.5 w-3.5 text-[#f5c84b]" />
                              {match.venue || match.league || "League venue"}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                </div>
              )}

              {filteredPlayed.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Play className="h-5 w-5 text-[#51d884]" />
                    <h2 className="text-xl font-black text-white">Results</h2>
                  </div>
                  <AnimatePresence mode="popLayout">
                    <div className="grid gap-3">
                      {filteredPlayed.slice(0, 20).map((match, i) => {
                        const home = teamsById.get(match.homeTeamId);
                        const away = teamsById.get(match.awayTeamId);
                        return (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="rounded-md border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.08]"
                          >
                            <div className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold text-white/45">
                              <span>Match Week {match.matchDay ?? "-"}</span>
                              <span>{formatMatchDate(match)} {match.time ? `- ${formatTime(match.time)}` : ""}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                              <div className="flex min-w-0 items-center justify-end gap-3 text-right">
                                <span className="hidden sm:block truncate text-sm font-black text-white">{home?.name ?? "Home"}</span>
                                <Avatar className="h-10 w-10 rounded-md border border-white/10 shrink-0">
                                  <AvatarImage src={home?.logo ?? undefined} />
                                  <AvatarFallback style={{ backgroundColor: home?.primaryColor ?? "#26c267" }} className="text-xs font-bold text-white">{teamInitials(home?.name)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="min-w-24 rounded-md bg-white/[0.08] px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <span className="text-2xl font-black tabular-nums text-white">{match.homeScore ?? 0}</span>
                                  <span className="text-white/40">:</span>
                                  <span className="text-2xl font-black tabular-nums text-white">{match.awayScore ?? 0}</span>
                                </div>
                              </div>
                              <div className="flex min-w-0 items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-md border border-white/10 shrink-0">
                                  <AvatarImage src={away?.logo ?? undefined} />
                                  <AvatarFallback style={{ backgroundColor: away?.primaryColor ?? "#26c267" }} className="text-xs font-bold text-white">{teamInitials(away?.name)}</AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block truncate text-sm font-black text-white">{away?.name ?? "Away"}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-white/45">
                              <MapPin className="h-3.5 w-3.5 text-[#51d884]" />
                              {match.venue || match.league || "League venue"}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                </div>
              )}

              {filter !== "all" && (
                <>
                  {filter === "upcoming" && filteredUpcoming.length === 0 && (
                    <EmptySurface icon={CalendarClock} title="No upcoming fixtures" text="All matches have been played this season." />
                  )}
                  {filter === "played" && filteredPlayed.length === 0 && (
                    <EmptySurface icon={Play} title="No results yet" text="Completed matches will appear here." />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <PublicFooter navItems={navItems} />
    </main>
  );
}
