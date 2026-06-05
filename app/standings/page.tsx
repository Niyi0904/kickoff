'use client';

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useAppContext } from "@/app/context/AppDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function StandingsPage() {
  return (
    <ProtectedRoute>
      <StandingsContent />
    </ProtectedRoute>
  );
}

function StandingsContent() {
  // const { getStandings } = useAppContext();
  // const standings = getStandings();

  const { standings } = useAppContext();


  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Standings</h1>
        <p className="text-muted-foreground mt-1">Season ranking and performance</p>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-xl min-w-0">
        {/* Mobile: Card List */}
        <div className="md:hidden space-y-2 p-4">
          {standings.map((team: any, index: number) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="min-w-0 bg-secondary/30 hover:bg-secondary/50 transition-colors rounded-lg border border-border/30 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center font-bold text-sm text-muted-foreground shrink-0">{index + 1}</span>
                  <div className="min-w-0 flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-md border border-border shrink-0">
                      <AvatarImage src={team.logo} />
                      <AvatarFallback style={{ backgroundColor: team.color }} className="text-[10px] text-white font-bold">
                        {team.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm truncate text-foreground">{team.name}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold text-sm">
                    {team.pts}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-background/50 rounded p-2 text-center">
                  <p className="text-muted-foreground text-[10px] mb-1">Record</p>
                  <p className="font-bold text-foreground">{team.played}P {team.won}W {team.drawn}D {team.lost}L</p>
                </div>
                <div className="bg-background/50 rounded p-2 text-center">
                  <p className="text-muted-foreground text-[10px] mb-1">Goals</p>
                  <p className="font-bold text-foreground">{team.gf}F {team.ga}A ({team.gd > 0 ? '+' : ''}{team.gd})</p>
                </div>
                <div className="bg-background/50 rounded p-2 text-center">
                  <p className="text-muted-foreground text-[10px] mb-1">GD</p>
                  <p className="font-bold text-foreground">{team.gd > 0 ? '+' : ''}{team.gd}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                <th className="px-4 py-4 text-center w-12">#</th>
                <th className="px-4 py-4">Team</th>
                <th className="px-2 py-4 text-center">P</th>
                <th className="px-2 py-4 text-center hidden lg:table-cell">W</th>
                <th className="px-2 py-4 text-center hidden lg:table-cell">D</th>
                <th className="px-2 py-4 text-center hidden lg:table-cell">L</th>
                <th className="px-2 py-4 text-center">GD</th>
                <th className="px-4 py-4 text-center text-primary">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {standings.map((team: any, index: number) => (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  <td className="px-4 py-4 text-center font-display font-bold text-muted-foreground group-hover:text-primary">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-md border border-border shrink-0">
                        <AvatarImage src={team.logo} />
                        <AvatarFallback style={{ backgroundColor: team.color }} className="text-[10px] text-white font-bold">
                          {team.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-sm md:text-base truncate">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center font-medium">{team.played}</td>
                  <td className="px-2 py=4 text-center hidden lg:table-cell text-mutedForeground">{team.won}</td>
                  <td className="px-2 py=4 text-center hidden lg:table-cell text-mutedForeground">{team.drawn}</td>
                  <td className="px-2 py=4 text-center hidden lg:table-cell text-mutedForeground">{team.lost}</td>
                  <td className="px-2 py=4 text-center font-mono text-sm">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                  <td className="px-4 py=4 text-center">
                    <span className="bg-primary/20 text-primary px=3 py=1 rounded-full font-bold	text-sm">
                      {team.pts}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {standings.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No matches played yet. The table will update once results are recorded.
        </div>
      )}
    </div>
  );
}