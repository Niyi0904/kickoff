'use client';
// app/admin/suspensions/page.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, ShieldCheck, RefreshCw, CheckCircle2,
  AlertTriangle, ChevronRight, Clock, Gavel
} from 'lucide-react';
import { useActiveSuspensions, useOverrideSuspension } from '@/app/hooks/useSuspensions';
import { useDataContext } from '@/app/context/DataContext';
import { useAuthContext } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getInitials, cn } from '@/lib/utils';
import { Suspension } from '@/lib/suspensions';
import { formatDistanceToNow } from 'date-fns';

export default function SuspensionsPage() {
  return (
    <ProtectedRoute>
      <SuspensionsContent />
    </ProtectedRoute>
  );
}

function SuspensionsContent() {
  const { isAdmin } = useAuthContext();
  const { players, teams } = useDataContext();
  const { data: suspensions = [], isLoading } = useActiveSuspensions();
  const overrideMutation = useOverrideSuspension();

  const [overrideTarget, setOverrideTarget] = useState<Suspension | null>(null);
  const [overrideNote, setOverrideNote]     = useState('');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-card rounded-2xl border border-border">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="font-bold text-foreground">Admin access required.</p>
        </div>
      </div>
    );
  }

  const getPlayer = (id: string) => players.find(p => p.id === id);
  const getTeam   = (teamId: string) => teams.find(t => t.id === teamId);

  const handleOverride = async () => {
    if (!overrideTarget || !overrideNote.trim()) return;
    await overrideMutation.mutateAsync({
      suspensionId: overrideTarget.id,
      note:         overrideNote.trim(),
    });
    setOverrideTarget(null);
    setOverrideNote('');
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Suspensions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Active bans — automatically enforced from card accumulation
          </p>
        </div>

        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold',
          suspensions.length > 0
            ? 'bg-destructive/10 border-destructive/30 text-destructive'
            : 'bg-green-500/10 border-green-500/30 text-green-600'
        )}>
          {suspensions.length > 0
            ? <><ShieldAlert className="w-4 h-4" /> {suspensions.length} Active</>
            : <><ShieldCheck className="w-4 h-4" /> All Clear</>
          }
        </div>
      </motion.div>

      {/* ── Loading ─────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!isLoading && suspensions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-secondary/5 rounded-3xl border-2 border-dashed border-border"
        >
          <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-60" />
          <p className="font-bold text-foreground text-lg">No active suspensions</p>
          <p className="text-muted-foreground text-sm mt-1">
            All players are available for selection.
          </p>
        </motion.div>
      )}

      {/* ── Suspension cards ─────────────────────────────────────── */}
      <div className="space-y-4">
        <AnimatePresence>
          {suspensions.map((susp, i) => {
            const player    = getPlayer(susp.playerId);
            const team      = player ? getTeam(player.teamId) : null;
            const matchesLeft = susp.matchesBanned - susp.matchesServed;

            return (
              <motion.div
                key={susp.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-destructive/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                {/* Player avatar */}
                <Avatar className="w-14 h-14 rounded-xl border-2 border-background shadow">
                  <AvatarImage src={player?.photo || ''} />
                  <AvatarFallback
                    style={{ backgroundColor: team?.primaryColor }}
                    className="text-white font-bold text-lg rounded-xl"
                  >
                    {getInitials(player?.name || '?')}
                  </AvatarFallback>
                </Avatar>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-base">
                      {player?.name ?? 'Unknown Player'}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                      {team?.name ?? '—'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {/* Reason badge */}
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
                      susp.reason === 'red_card'
                        ? 'bg-red-500/10 border-red-500/30 text-red-600'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600'
                    )}>
                      {susp.reason === 'red_card' ? (
                        <><div className="w-2 h-3 bg-red-500 rounded-sm" /> Red card ban</>
                      ) : (
                        <><div className="w-2 h-3 bg-yellow-400 rounded-sm" /> Yellow accumulation</>
                      )}
                    </span>

                    {/* Matches left */}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {matchesLeft} match{matchesLeft !== 1 ? 'es' : ''} remaining
                    </span>

                    {/* Progress */}
                    <span className="text-xs text-muted-foreground">
                      {susp.matchesServed}/{susp.matchesBanned} served
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 h-1.5 bg-secondary rounded-full overflow-hidden w-48">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(susp.matchesServed / susp.matchesBanned) * 100}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.6 }}
                      className="h-full bg-destructive rounded-full"
                    />
                  </div>
                </div>

                {/* Override button */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOverrideTarget(susp)}
                    className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500 shrink-0"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    Override
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Override dialog ─────────────────────────────────────── */}
      <ConfirmDialog
        open={overrideTarget !== null}
        onOpenChange={(open) => {
          if (!open) { setOverrideTarget(null); setOverrideNote(''); }
        }}
        title="Override Suspension"
        description={
          <div className="space-y-4">
            <p>
              You are about to lift the suspension for{' '}
              <span className="font-semibold text-foreground">
                {getPlayer(overrideTarget?.playerId ?? '')?.name ?? 'this player'}
              </span>
              . Please provide a reason — this is recorded for audit purposes.
            </p>
            <Input
              placeholder="Reason for override (e.g. Appeal granted)"
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              className="bg-background"
            />
          </div>
        }
        confirmLabel="Lift Suspension"
        onConfirm={handleOverride}
        loading={overrideMutation.isPending}
        variant="default"
      />

    </div>
  );
}