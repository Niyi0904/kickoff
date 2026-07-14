'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Match } from "@/app/hooks/useAppData";

interface LiveMomentumProps {
  match: Match;
  homeColor?: string;
  awayColor?: string;
}

export function LiveMomentum({ match, homeColor, awayColor }: LiveMomentumProps) {
  const possession = match.homePossession ?? 50;
  const awayPos = match.awayPossession ?? 50;
  const homeShots = match.homeShots ?? 0;
  const awayShots = match.awayShots ?? 0;

  const momentumSegments = useMemo(() => {
    const segments = 10;
    const result = [];
    for (let i = 0; i < segments; i++) {
      const base = possession / 100;
      const variation = (Math.random() - 0.5) * 0.2;
      const homeAdv = Math.min(1, Math.max(0, base + variation));
      result.push(homeAdv);
    }
    return result;
  }, [possession]);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Match Momentum</h3>

      <div className="space-y-3">
        {/* Momentum bars */}
        <div className="flex gap-1 h-8">
          {momentumSegments.map((homeAdv, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex-1 rounded-sm overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--secondary))' }}
            >
              <motion.div
                initial={{ height: '50%' }}
                animate={{ height: `${homeAdv * 100}%` }}
                transition={{ duration: 0.5 }}
                className="w-full transition-all duration-500"
                style={{ backgroundColor: homeColor || 'hsl(var(--primary))' }}
              />
              <div
                className="w-full transition-all duration-500"
                style={{
                  height: `${(1 - homeAdv) * 100}%`,
                  backgroundColor: awayColor || 'hsl(var(--muted-foreground))',
                  opacity: 0.5,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Possession stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <p className="text-2xl font-black tabular-nums" style={{ color: homeColor || 'hsl(var(--foreground))' }}>
              {possession}%
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Possession</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center flex-1">
            <p className="text-2xl font-black tabular-nums" style={{ color: awayColor || 'hsl(var(--foreground))' }}>
              {awayPos}%
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Possession</p>
          </div>
        </div>

        {/* Shot comparison */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
          <div className="text-center flex-1">
            <p className="text-lg font-black tabular-nums" style={{ color: homeColor || 'hsl(var(--foreground))' }}>
              {homeShots}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Shots</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">vs</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-black tabular-nums" style={{ color: awayColor || 'hsl(var(--foreground))' }}>
              {awayShots}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Shots</p>
          </div>
        </div>
      </div>
    </div>
  );
}
