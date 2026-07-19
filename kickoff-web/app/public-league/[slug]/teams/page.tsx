'use client';

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Users, Swords, MapPin } from "lucide-react";
import { usePublicLeagueData, useLeagueDefaults } from "@/app/hooks/usePublicLeagueData";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptySurface } from "@/components/public/EmptySurface";

function teamInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "FC";
}

export default function PublicTeamsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicLeagueData(slug);
  const { teams, players, matches } = useLeagueDefaults(data);

  const base = `/public-league/${slug}`;

  const navItems = [
    { label: "Home", href: base },
    { label: "Matches", href: `${base}/matches` },
    { label: "Standings", href: `${base}/standings` },
    { label: "Teams", href: `${base}/teams` },
    { label: "Stats", href: `${base}/stats` },
  ];

  const teamCards = useMemo(() =>
    teams.map((team) => {
      const teamPlayers = players.filter((p) => p.teamId === team.id);
      const teamMatches = matches.filter(
        (m) => m.homeTeamId === team.id || m.awayTeamId === team.id,
      );
      return { ...team, playerCount: teamPlayers.length, matchCount: teamMatches.length };
    }),
    [teams, players, matches],
  );

  return (
    <main className="min-h-screen bg-[#07130f] text-white overflow-x-hidden">
      <PublicHeader navItems={navItems} />

      <section className="px-4 py-24 sm:px-6 lg:px-8 min-w-0">
        <div className="mx-auto max-w-7xl min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#51d884]">
              <span className="h-2 w-2 rounded-full bg-[#51d884]" />
              Teams
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">League Clubs</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
              {teams.length} registered {teams.length === 1 ? "club" : "clubs"} competing this season.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-md border border-white/10 bg-white/[0.05]" />
              ))}
            </div>
          ) : teamCards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamCards.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={`${base}/teams/${team.id}`}
                    className="block rounded-md border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-0.5 hover:border-[#51d884]/30 hover:shadow-lg hover:shadow-[#26c267]/5 group"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-14 w-14 rounded-md border border-white/10">
                          <AvatarImage src={team.logo ?? undefined} />
                          <AvatarFallback style={{ backgroundColor: team.primaryColor }} className="font-black text-white">
                            {teamInitials(team.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-black text-white group-hover:text-[#51d884] transition-colors">
                            {team.name}
                          </h3>
                          {team.stadium && (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/48">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{team.stadium}</span>
                            </p>
                          )}
                          {team.founded && (
                            <p className="text-xs text-white/38">Est. {team.founded}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: team.primaryColor }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                      <div className="rounded-md bg-white/[0.04] p-3 text-center">
                        <Users className="mx-auto mb-1 h-4 w-4 text-[#f5c84b]" />
                        <p className="text-lg font-black text-white">{team.playerCount}</p>
                        <p className="text-xs font-semibold text-white/48">Players</p>
                      </div>
                      <div className="rounded-md bg-white/[0.04] p-3 text-center">
                        <Swords className="mx-auto mb-1 h-4 w-4 text-[#51d884]" />
                        <p className="text-lg font-black text-white">{team.matchCount}</p>
                        <p className="text-xs font-semibold text-white/48">Matches</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptySurface icon={Shield} title="No teams yet" text="Teams will appear when public team records are available." />
          )}
        </div>
      </section>

      <PublicFooter navItems={navItems} />
    </main>
  );
}
