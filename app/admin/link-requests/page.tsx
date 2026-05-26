'use client';
// app/admin/link-requests/page.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Clock, CheckCircle2, XCircle,
  RefreshCw, Shield, ChevronDown, Inbox
} from 'lucide-react';
import {
  useAllLinkRequests,
  useApproveLinkRequest,
  useRejectLinkRequest,
} from '@/app/hooks/usePlayerLinking';
import { useAuthContext } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { LinkRequest } from '@/lib/playerLinking';

export default function LinkRequestsPage() {
  return (
    <ProtectedRoute>
      <LinkRequestsContent />
    </ProtectedRoute>
  );
}

function StatusBadge({ status }: { status: LinkRequest['status'] }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
      status === 'pending'  && 'bg-amber-500/10 border-amber-500/30 text-amber-600',
      status === 'approved' && 'bg-green-500/10 border-green-500/30 text-green-600',
      status === 'rejected' && 'bg-destructive/10 border-destructive/30 text-destructive',
    )}>
      {status === 'pending'  && <Clock        className="w-3 h-3" />}
      {status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'rejected' && <XCircle      className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LinkRequestsContent() {
  const { isAdmin } = useAuthContext();
  const { data: requests = [], isLoading } = useAllLinkRequests();
  const approveMutation = useApproveLinkRequest();
  const rejectMutation  = useRejectLinkRequest();

  const [rejectTarget, setRejectTarget]   = useState<LinkRequest | null>(null);
  const [rejectNote,   setRejectNote]     = useState('');
  const [approveTarget, setApproveTarget] = useState<LinkRequest | null>(null);
  const [statusFilter,  setStatusFilter]  = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-card rounded-2xl border">
          <Shield className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="font-bold">Admin access required.</p>
        </div>
      </div>
    );
  }

  const filtered = requests.filter(r =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleApprove = async () => {
    if (!approveTarget) return;
    await approveMutation.mutateAsync({
      requestId: approveTarget.id,
      playerId:  approveTarget.playerId,
      userId:    approveTarget.userId,
    });
    setApproveTarget(null);
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectNote.trim()) return;
    await rejectMutation.mutateAsync({ requestId: rejectTarget.id, note: rejectNote.trim() });
    setRejectTarget(null);
    setRejectNote('');
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Profile Link Requests
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review and approve player profile claims
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 text-sm font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            {pendingCount} pending
          </div>
        )}
      </motion.div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex p-1 bg-secondary/30 rounded-xl border border-border/50 w-fit">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
              statusFilter === f
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Loading ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {!isLoading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-secondary/5 rounded-3xl border-2 border-dashed"
        >
          <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="font-bold text-foreground">No {statusFilter === 'all' ? '' : statusFilter} requests</p>
          <p className="text-muted-foreground text-sm mt-1">
            {statusFilter === 'pending'
              ? 'All requests have been reviewed.'
              : 'Nothing to show here yet.'}
          </p>
        </motion.div>
      )}

      {/* ── Request cards ────────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'bg-card border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4',
                req.status === 'pending' && 'border-amber-500/20',
                req.status === 'approved' && 'border-green-500/20',
                req.status === 'rejected' && 'border-border',
              )}
            >
              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">{req.userName}</span>
                  <span className="text-muted-foreground text-xs">{req.userEmail}</span>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Claiming{' '}
                  <span className="font-semibold text-foreground">{req.playerName}</span>
                  {' '}·{' '}
                  <span>{req.teamName}</span>
                </p>
                {req.status === 'rejected' && req.rejectNote && (
                  <p className="text-xs text-destructive/70 italic">
                    Rejected: {req.rejectNote}
                  </p>
                )}
              </div>

              {/* Actions — only for pending */}
              {req.status === 'pending' && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectTarget(req)}
                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setApproveTarget(req)}
                    className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Approve dialog ───────────────────────────────────── */}
      <ConfirmDialog
        open={approveTarget !== null}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve this claim?"
        description={
          <>
            <span className="font-semibold text-foreground">{approveTarget?.userName}</span>{' '}
            will be permanently linked to the player profile of{' '}
            <span className="font-semibold text-foreground">{approveTarget?.playerName}</span>.
            They will be able to receive notifications for their match events.
          </>
        }
        confirmLabel="Approve & Link"
        variant="default"
        loading={approveMutation.isPending}
        onConfirm={handleApprove}
      />

      {/* ── Reject dialog ────────────────────────────────────── */}
      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectNote(''); } }}
        title="Reject this claim?"
        description={
          <div className="space-y-3">
            <p>
              You are rejecting{' '}
              <span className="font-semibold text-foreground">{rejectTarget?.userName}</span>'s
              claim on{' '}
              <span className="font-semibold text-foreground">{rejectTarget?.playerName}</span>.
              Please provide a reason — it will be shown to the user.
            </p>
            <Input
              placeholder="Reason (e.g. Not the correct player)"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="bg-background"
            />
          </div>
        }
        confirmLabel="Reject Request"
        loading={rejectMutation.isPending}
        onConfirm={handleReject}
      />

    </div>
  );
}