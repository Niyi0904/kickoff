'use client';

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { usePublicLeagueData, useLeagueDefaults } from "@/app/hooks/usePublicLeagueData";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptySurface } from "@/components/public/EmptySurface";
import { cn } from "@/lib/utils";
import type { StandingRow, Team } from "@/lib/public-league-types";

function teamInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "FC";
}

function computeStandings(teams: Team[], matches: { homeTeamId: string; awayTeamId: string; homeScore?: number; awayScore?: number; status: string }[], settings: { pointsWin: number; pointsDraw: number; pointsLoss: number }) {
  const table = new Map<string, StandingRow>();
  teams.forEach((team) => {
    table.set(team.id, {
      id: team.id, name: team.name, logo: team.logo, color: team.primaryColor,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [],
    });
  });
  const played = matches.filter((m) => m.status === "played");
  played.forEach((match) => {
    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    if (!home || !away) return;
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    home.played += 1; away.played += 1;
    home.gf += homeScore; home.ga += awayScore;
    away.gf += awayScore; away.ga += homeScore;
    if (homeScore > awayScore) {
      home.won += 1; away.lost += 1;
      home.pts += settings.pointsWin; away.pts += settings.pointsLoss;
      home.form.push("W"); away.form.push("L");
    } else if (homeScore < awayScore) {
      away.won += 1; home.lost += 1;
      away.pts += settings.pointsWin; home.pts += settings.pointsLoss;
      away.form.push("W"); home.form.push("L");
    } else {
      home.drawn += 1; away.drawn += 1;
      home.pts += settings.pointsDraw; away.pts += settings.pointsDraw;
      home.form.push("D"); away.form.push("D");
    }
  });
  return Array.from(table.values())
    .map((row) => ({ ...row, gd: row.gf - row.ga, form: row.form.slice(-5).reverse() }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
}

function FormDots({ form }: { form: string[] }) {
  if (form.length === 0) return <span className="text-xs font-semibold text-white/35">—</span>;
  return (
    <div className="flex gap-1">
      {form.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-xs font-black",
            result === "W" && "bg-[#26c267] text-[#06110d]",
            result === "D" && "bg-[#f5c84b] text-[#102018]",
            result === "L" && "bg-white/12 text-white/70",
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

export default function PublicStandingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicLeagueData(slug);
  const { teams, matches, settings } = useLeagueDefaults(data);

  const base = `/public-league/${slug}`;
  const navItems = [
    { label: "Home", href: base },
    { label: "Matches", href: `${base}/matches` },
    { label: "Standings", href: `${base}/standings` },
    { label: "Teams", href: `${base}/teams` },
    { label: "Stats", href: `${base}/stats` },
  ];

  const standings = useMemo(() => computeStandings(teams, matches, settings), [teams, matches, settings]);

  return (
    <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
      <PublicHeader navItems={navItems} />

      <section className="px-4 py-24 sm:px-6 lg:px-8 min-w-0">
        <div className="mx-auto max-w-7xl min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#51d884]">
              <span className="h-2 w-2 rounded-full bg-[#51d884]" />
              Standings
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">League Table</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
              Season rankings, form, and performance tracking.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="h-96 animate-pulse rounded-md border border-white/10 bg-white/[0.05]" />
          ) : standings.length === 0 ? (
            <EmptySurface icon={Trophy} title="No standings yet" text="The table will update after results are recorded." />
          ) : (
            <>
              <div className="md:hidden space-y-2">
                {standings.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-md border border-white/10 bg-white/[0.05] p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 items-center justify-center font-black text-sm text-white/45 shrink-0">{index + 1}</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-8 w-8 rounded-md border border-white/10 shrink-0">
                            <AvatarImage src={team.logo ?? undefined} />
                            <AvatarFallback style={{ backgroundColor: team.color }} className="text-xs font-bold text-white">{teamInitials(team.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-white truncate">{team.name}</span>
                        </div>
                      </div>
                      <div className="rounded-md bg-[#26c267]/18 px-3 py-1 text-center shrink-0">
                        <span className="text-sm font-black text-[#51d884]">{team.pts}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className="bg-white/5 rounded p-2 text-center">
                        <p className="text-white/45 text-[10px] mb-1">Record</p>
                        <p className="font-bold text-white">{team.played}P {team.won}W {team.drawn}D {team.lost}L</p>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <p className="text-white/45 text-[10px] mb-1">Goals</p>
                        <p className="font-bold text-white">{team.gf}F {team.ga}A ({team.gd > 0 ? '+' : ''}{team.gd})</p>
                      </div>
                      <div className="bg-white/5 rounded p-2 text-center">
                        <p className="text-white/45 text-[10px] mb-1">Form</p>
                        <FormDots form={team.form.slice(0, 3)} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="hidden md:block overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.06] text-sm font-bold text-white/50">
                        <th className="w-12 px-4 py-4 text-center">#</th>
                        <th className="px-4 py-4">Team</th>
                        <th className="px-2 py-4 text-center">P</th>
                        <th className="px-2 py-4 text-center">W</th>
                        <th className="px-2 py-4 text-center">D</th>
                        <th className="px-2 py-4 text-center">L</th>
                        <th className="px-2 py-4 text-center">GD</th>
                        <th className="px-4 py-4">Form</th>
                        <th className="px-4 py-4 text-center text-[#51d884]">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {standings.map((team, index) => (
                        <tr key={team.id} className="transition hover:bg-white/[0.04]">
                          <td className="px-4 py-4 text-center font-black text-white/45">{index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-9 w-9 rounded-md border border-white/10 shrink-0">
                                <AvatarImage src={team.logo ?? undefined} />
                                <AvatarFallback style={{ backgroundColor: team.color }} className="text-xs font-bold text-white">{teamInitials(team.name)}</AvatarFallback>
                              </Avatar>
                              <span className="font-black text-white truncate">{team.name}</span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center font-semibold text-white/78">{team.played}</td>
                          <td className="px-2 py-4 text-center text-white/54">{team.won}</td>
                          <td className="px-2 py-4 text-center text-white/54">{team.drawn}</td>
                          <td className="px-2 py-4 text-center text-white/54">{team.lost}</td>
                          <td className="px-2 py-4 text-center font-mono text-sm text-white">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                          <td className="px-4 py-4"><FormDots form={team.form} /></td>
                          <td className="px-4 py-4 text-center">
                            <span className="rounded-md bg-[#26c267]/18 px-3 py-1 text-sm font-black text-[#51d884]">{team.pts}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <PublicFooter navItems={navItems} />
    </main>
  );
}
