'use client';
// app/admin/transfers/page.tsx
// Read-only audit trail of every player transfer.

import { motion } from 'framer-motion';
import { ArrowRightLeft, ShieldAlert, History } from 'lucide-react';
import { useDataContext } from '@/app/context/DataContext';
import { useAuthContext } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { firestoreTimeToMillis, type Transfer, type FirestoreTime } from '@/lib/transfers';

export default function TransfersPage() {
  return (
    <ProtectedRoute>
      <TransfersContent />
    </ProtectedRoute>
  );
}

function formatTransferDate(ts: FirestoreTime): string {
  const ms = firestoreTimeToMillis(ts);
  if (!ms) return '—';
  return new Date(ms).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TransfersContent() {
  const { isAdmin } = useAuthContext();
  const { transfers, players, teams } = useDataContext();

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

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const getTeamName = (id: string) => teams.find((t) => t.id === id)?.name ?? '—';

  return (
    <div className="space-y-8 pb-20 max-w-5xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Transfers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Audit trail of every player move between teams
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-primary/10 border-primary/30 text-primary text-sm font-semibold">
          <ArrowRightLeft className="w-4 h-4" />
          {transfers.length} total
        </div>
      </motion.div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {transfers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-secondary/5 rounded-3xl border-2 border-dashed border-border"
        >
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="font-bold text-foreground text-lg">No transfers yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Transfers you approve will appear here.
          </p>
        </motion.div>
      )}

      {/* ── Table (desktop) ─────────────────────────────────────── */}
      {transfers.length > 0 && (
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="text-left py-4 px-6">Player</th>
                <th className="text-left py-4 px-4">From</th>
                <th className="text-left py-4 px-4">To</th>
                <th className="text-left py-4 px-4">Date</th>
                <th className="text-left py-4 px-4">Approved By</th>
                <th className="text-left py-4 px-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transfers.map((t: Transfer) => {
                const player = getPlayer(t.playerId);
                const team = teams.find((tm) => tm.id === (player?.teamId));
                return (
                  <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-border">
                          <AvatarImage src={player?.photo || ''} />
                          <AvatarFallback
                            style={{ backgroundColor: team?.primaryColor }}
                            className="text-white text-xs font-bold"
                          >
                            {getInitials(player?.name || '?')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold">{player?.name ?? 'Unknown player'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{getTeamName(t.fromTeamId)}</td>
                    <td className="py-4 px-4 font-semibold text-primary">{getTeamName(t.toTeamId)}</td>
                    <td className="py-4 px-4 text-muted-foreground">{formatTransferDate(t.transferDate)}</td>
                    <td className="py-4 px-4 text-muted-foreground font-mono text-xs">{t.approvedBy}</td>
                    <td className="py-4 px-6 text-muted-foreground">{t.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Cards (mobile) ──────────────────────────────────────── */}
      {transfers.length > 0 && (
        <div className="md:hidden space-y-3">
          {transfers.map((t: Transfer, i: number) => {
            const player = getPlayer(t.playerId);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{player?.name ?? 'Unknown player'}</span>
                  <span className="text-[11px] text-muted-foreground">{formatTransferDate(t.transferDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{getTeamName(t.fromTeamId)}</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-primary">{getTeamName(t.toTeamId)}</span>
                </div>
                {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
