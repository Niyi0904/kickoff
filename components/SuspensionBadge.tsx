'use client';
// components/SuspensionBadge.tsx
// Shows a suspended badge on player cards and profiles.
// Fetches suspension status independently — no prop drilling needed.

import { usePlayerSuspensionCheck } from '@/app/hooks/useSuspensions';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SuspensionBadgeProps {
  playerId: string;
  // compact = small pill for player cards
  // full    = larger badge for player profile page
  variant?: 'compact' | 'full';
  className?: string;
}

export function SuspensionBadge({
  playerId,
  variant   = 'compact',
  className,
}: SuspensionBadgeProps) {
  const { data, isLoading } = usePlayerSuspensionCheck(playerId);

  // Don't flash anything while loading
  if (isLoading || !data?.isSuspended) return null;

  const { matchesLeft, suspension } = data;

  if (variant === 'compact') {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
          'bg-destructive/15 text-destructive border border-destructive/30',
          className
        )}
      >
        <ShieldAlert className="w-3 h-3" />
        SUSPENDED
      </motion.span>
    );
  }

  // Full variant — used on player profile page
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl',
        'bg-destructive/10 border border-destructive/30',
        className
      )}
    >
      <div className="p-2 rounded-lg bg-destructive/20">
        <ShieldAlert className="w-5 h-5 text-destructive" />
      </div>
      <div>
        <p className="text-destructive font-bold text-sm">
          Player Suspended
        </p>
        <p className="text-destructive/70 text-xs mt-0.5">
          {matchesLeft === 1
            ? 'Sits out the next 1 match'
            : `Sits out the next ${matchesLeft} matches`}
          {suspension?.reason === 'red_card'
            ? ' · Red card ban'
            : ` · ${suspension?.matchesBanned === 1
                ? 'Yellow card accumulation ban'
                : `${suspension?.matchesBanned}-match ban`}`}
        </p>
      </div>
    </motion.div>
  );
}