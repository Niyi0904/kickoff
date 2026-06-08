'use client';
// components/ClaimProfileButton.tsx
// Shown on the player profile page (/players/[id]).
// Lets a logged-in user claim the profile if it's unclaimed,
// or shows their current request status if they've already submitted.

import { motion } from 'framer-motion';
import { UserCheck, Clock, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useState } from 'react';
import { useAuthContext } from '@/app/context/AuthContext';
import { useMyLinkRequest, useSubmitLinkRequest } from '@/app/hooks/usePlayerLinking';
import { cn } from '@/lib/utils';

interface ClaimProfileButtonProps {
  playerId:        string;
  playerName:      string;
  teamName:        string;
  linkedUserId?:   string | null; // already set on the player doc if claimed
}

export function ClaimProfileButton({
  playerId,
  playerName,
  teamName,
  linkedUserId,
}: ClaimProfileButtonProps) {
  const { user }          = useAuthContext();
  const { data: myReq }   = useMyLinkRequest();
  const submitMutation    = useSubmitLinkRequest();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Not logged in — show nothing
  if (!user) return null;

  // This profile is linked to the current user already
  if (linkedUserId === user.uid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 text-sm font-semibold"
      >
        <CheckCircle2 className="w-4 h-4" />
        This is your profile
      </motion.div>
    );
  }

  // Profile is already claimed by someone else
  if (linkedUserId && linkedUserId !== user.uid) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border text-muted-foreground text-sm">
        <ShieldAlert className="w-4 h-4" />
        Profile already claimed
      </div>
    );
  }

  // Current user already has a pending request for THIS player
  if (myReq && myReq.playerId === playerId && myReq.status === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 text-sm font-semibold"
      >
        <Clock className="w-4 h-4 animate-pulse" />
        Claim request pending admin review
      </motion.div>
    );
  }

  // Current user's request for THIS player was rejected
  if (myReq && myReq.playerId === playerId && myReq.status === 'rejected') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold">
        <XCircle className="w-4 h-4" />
        Claim request rejected
        {myReq.rejectNote && (
          <span className="text-destructive/70 font-normal ml-1">· {myReq.rejectNote}</span>
        )}
      </div>
    );
  }

  // Current user already approved for a DIFFERENT player
  if (myReq && myReq.status === 'approved' && myReq.playerId !== playerId) {
    return null; // They're linked to someone else — no claim button shown
  }

  // Default — unclaimed, user can submit a request
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
      >
        <UserCheck className="w-4 h-4" />
        Claim this profile
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Claim this player profile?"
        description={
          <>
            You are requesting to link your account to{' '}
            <span className="font-semibold text-foreground">{playerName}</span>{' '}
            ({teamName}). An admin will review and confirm your request. You will
            receive a notification once it is approved or rejected.
          </>
        }
        confirmLabel="Submit Claim"
        variant="default"
        loading={submitMutation.isPending}
        onConfirm={async () => {
          await submitMutation.mutateAsync({ playerId, playerName, teamName });
          setConfirmOpen(false);
        }}
      />
    </>
  );
}