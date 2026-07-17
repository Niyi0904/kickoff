'use client';
// app/my-profile/page.tsx
// Personalised dashboard shown in sidebar for linked players.

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/app/context/AuthContext';
import { useMyLinkedPlayer, useMyLinkRequest } from '@/app/hooks/usePlayerLinking';
import { useDataContext } from '@/app/context/DataContext';
import { usePlayerSuspensionCheck } from '@/app/hooks/useSuspensions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SuspensionBadge } from '@/components/SuspensionBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import {
  Clock, UserCheck, ArrowRight, Target,
  Shield, Activity, UserX, CreditCard, Loader2
} from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function MyProfilePage() {
  return (
    <ProtectedRoute>
      <MyProfileContent />
    </ProtectedRoute>
  );
}

function MyProfileContent() {
  const { user }                        = useAuthContext();
  const { players, teams, getPlayerStats, getPlayerRecords } = useDataContext();
  const { data: linkedPlayer, isLoading: playerLoading } = useMyLinkedPlayer();
  const { data: myRequest,    isLoading: reqLoading }    = useMyLinkRequest();
  const router = useRouter();

  const isLoading = playerLoading || reqLoading;

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 pb-20 max-w-3xl px-4 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-card rounded-3xl border border-border">
          <div className="w-20 h-20 rounded-2xl bg-secondary/40 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-secondary/50 animate-pulse rounded-lg" />
            <div className="h-4 w-32 bg-secondary/30 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-5 w-32 bg-secondary/40 animate-pulse rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-secondary/30 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-36 bg-secondary/40 animate-pulse rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-secondary/30 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Not linked yet ───────────────────────────────────────
  if (!linkedPlayer) {
    return (
      <div className="space-y-8 max-w-lg mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 p-10 bg-card rounded-3xl border border-border"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <UserX className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No profile linked yet</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To see your personal stats and receive match notifications, claim your
            player profile from the Players page.
          </p>

          {/* Show pending request status if exists */}
          {myRequest?.status === 'pending' && (
            <div className="flex items-center justify-center gap-2 text-amber-600 text-sm font-semibold bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20">
              <Clock className="w-4 h-4 animate-pulse" />
              Your claim request is pending admin review
            </div>
          )}

          {myRequest?.status === 'rejected' && (
            <div className="text-destructive text-sm bg-destructive/10 px-4 py-2.5 rounded-xl border border-destructive/20">
              Your previous request was rejected
              {myRequest.rejectNote && `: ${myRequest.rejectNote}`}
            </div>
          )}

          <Button onClick={() => router.push('/players')} className="gap-2 w-full">
            Browse Players <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Linked — show personalised dashboard ─────────────────
  const fullPlayer = players.find(p => p.id === linkedPlayer.id);
  const team       = teams.find(t => t.id === linkedPlayer.teamId);
  const stats      = fullPlayer ? getPlayerStats(fullPlayer.id) : null;
  const records    = fullPlayer ? getPlayerRecords(fullPlayer.id) : [];

  return (
    <div className="space-y-8 pb-20 max-w-3xl px-4 min-w-0">

      {/* ── Profile header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-card rounded-3xl border border-border"
      >
        <Avatar className="w-20 h-20 rounded-2xl border-4 border-background shadow-xl">
          <AvatarImage src={linkedPlayer.photo || ''} />
          <AvatarFallback
            style={{ backgroundColor: team?.primaryColor }}
            className="text-white font-bold text-2xl rounded-2xl"
          >
            {getInitials(linkedPlayer.name || '')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{linkedPlayer.name}</h1>
            <Badge variant="outline" className="text-xs font-bold">#{linkedPlayer.number}</Badge>
            {linkedPlayer.isManager && (
              <Badge className="bg-accent/15 text-accent border-accent/20 text-xs font-bold">Manager</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {linkedPlayer.position} · {team?.name}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            Linked to your account
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/players/${linkedPlayer.id}`)}
          className="gap-2 shrink-0"
        >
          Full Profile <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </motion.div>

      {/* ── Suspension status ──────────────────────────────── */}
      {fullPlayer && (
        <SuspensionBadge playerId={fullPlayer.id} variant="full" />
      )}

      {/* ── Registration fee status ─────────────────────────── */}
      {fullPlayer && (fullPlayer.registrationFeeStatus === 'unpaid' || fullPlayer.registrationFeeStatus === 'pending') && (
        <PayRegistrationFee
          playerId={fullPlayer.id}
          leagueId={fullPlayer.leagueId || linkedPlayer.leagueId || ''}
          status={fullPlayer.registrationFeeStatus}
        />
      )}

      {/* ── Season stats ───────────────────────────────────── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Season Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Goals',    value: stats.goals,       color: 'text-primary' },
              { label: 'Assists',  value: stats.assists,     color: 'text-blue-500' },
              { label: 'Matches',  value: stats.matches,     color: 'text-green-500' },
              { label: 'Yellows',  value: stats.yellowCards, color: 'text-yellow-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Match history ──────────────────────────────────── */}
      {records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Recent Matches
          </h2>
          <div className="space-y-2">
            {records.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">vs {record.opponent}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(record.matchDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  {record.goals > 0 && (
                    <span className="flex items-center gap-1 text-primary">⚽ {record.goals}</span>
                  )}
                  {record.assists > 0 && (
                    <span className="flex items-center gap-1 text-blue-500">👟 {record.assists}</span>
                  )}
                  {record.yellowCards > 0 && (
                    <span className="flex items-center gap-1 text-yellow-500">🟨 {record.yellowCards}</span>
                  )}
                  {record.redCards > 0 && (
                    <span className="flex items-center gap-1 text-red-500">🟥 {record.redCards}</span>
                  )}
                  {record.goals === 0 && record.assists === 0 && record.yellowCards === 0 && record.redCards === 0 && (
                    <span className="text-muted-foreground font-normal">No events</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {records.length > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-3 text-muted-foreground"
              onClick={() => router.push(`/players/${linkedPlayer.id}`)}
            >
              View all {records.length} matches <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}

function PayRegistrationFee({
  playerId,
  leagueId,
  status,
}: {
  playerId: string;
  leagueId: string;
  status: 'unpaid' | 'pending';
}) {
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    if (!leagueId || !playerId) return;
    setPaying(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leagueId, relatedPlayerId: playerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPaying(false);
        return;
      }

      const callbackUrl = `${window.location.origin}/payment/callback?reference=${data.reference}&leagueId=${leagueId}&playerId=${playerId}`;
      const paystackUrl = `${data.authorizationUrl}&redirect_url=${encodeURIComponent(callbackUrl)}`;

      window.location.href = paystackUrl;
    } catch {
      setPaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
          <CreditCard className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm">
            {status === 'pending' ? 'Registration Fee Processing' : 'Registration Fee Required'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {status === 'pending'
              ? 'Your payment is being processed. You will be updated once confirmed.'
              : 'Pay your registration fee to complete your enrollment.'}
          </p>
        </div>
        {status === 'unpaid' && (
          <Button
            onClick={handlePay}
            disabled={paying}
            size="sm"
            className="gap-2 shrink-0"
          >
            {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
            {paying ? 'Redirecting...' : 'Pay Now'}
          </Button>
        )}
        {status === 'pending' && (
          <div className="flex items-center gap-2 text-xs text-accent font-semibold shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Pending
          </div>
        )}
      </div>
    </motion.div>
  );
}