'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Match } from "@/app/hooks/useAppData";

interface StatBarProps {
  label: string;
  home: number;
  away: number;
  homeColor?: string;
  awayColor?: string;
  format?: 'number' | 'percentage';
}

function StatBar({ label, home, away, homeColor, awayColor, format = 'number' }: StatBarProps) {
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;
  const awayPercent = total > 0 ? (away / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold tabular-nums" style={{ color: homeColor }}>
          {format === 'percentage' ? `${home}%` : home}
        </span>
        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: awayColor }}>
          {format === 'percentage' ? `${away}%` : away}
        </span>
      </div>
      <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${homePercent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: homeColor || 'hsl(var(--primary))' }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-full"
          style={{
            width: `${awayPercent}%`,
            backgroundColor: awayColor || 'hsl(var(--muted-foreground))',
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
}

interface LiveStatsProps {
  match: Match;
  homeColor?: string;
  awayColor?: string;
}

export function LiveStats({ match, homeColor, awayColor }: LiveStatsProps) {
  const stats = [
    { label: "Possession", home: match.homePossession ?? 50, away: match.awayPossession ?? 50, format: 'percentage' as const },
    { label: "Shots", home: match.homeShots ?? 0, away: match.awayShots ?? 0 },
    { label: "Shots on Target", home: match.homeShotsOnTarget ?? 0, away: match.awayShotsOnTarget ?? 0 },
    { label: "Corners", home: match.homeCorners ?? 0, away: match.awayCorners ?? 0 },
    { label: "Offsides", home: match.homeOffsides ?? 0, away: match.awayOffsides ?? 0 },
    { label: "Fouls", home: match.homeFouls ?? 0, away: match.awayFouls ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Match Statistics</h3>
      <div className="space-y-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatBar
              label={stat.label}
              home={stat.home}
              away={stat.away}
              homeColor={homeColor}
              awayColor={awayColor}
              format={stat.format}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
