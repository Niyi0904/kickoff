'use client';
// components/TransferPlayerDialog.tsx
// Lets a league admin move a player between teams.
// Career stats are preserved; active suspensions carry over.

import { useEffect, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from './ConfirmDialog';
import type { Player, Team } from '@/app/hooks/useAppData';

interface TransferPlayerDialogProps {
  player: Player | null;
  teams: Team[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (payload: {
    playerId: string;
    fromTeamId: string;
    toTeamId: string;
    notes?: string;
  }) => Promise<unknown>;
}

export function TransferPlayerDialog({
  player,
  teams,
  open,
  onOpenChange,
  onTransfer,
}: TransferPlayerDialogProps) {
  const [toTeamId, setToTeamId] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset the form whenever the dialog opens for a new player.
  useEffect(() => {
    if (open) {
      setToTeamId('');
      setNotes('');
      setShowConfirm(false);
    }
  }, [open, player?.id]);

  if (!player) return null;

  const fromTeam = teams.find((t) => t.id === player.teamId);
  const toTeam = teams.find((t) => t.id === toTeamId);

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      await onTransfer({
        playerId: player.id,
        fromTeamId: player.teamId,
        toTeamId,
        notes: notes.trim() || undefined,
      });
      setShowConfirm(false);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Transfer {player.name}
            </DialogTitle>
            <DialogDescription>
              Career stats are preserved and active bans carry over to the new team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm text-muted-foreground">From Team</label>
              <div className="mt-1 p-3 bg-secondary rounded-lg font-semibold text-sm">
                {fromTeam?.name ?? 'No current team'}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">To Team</label>
              <Select value={toTeamId} onValueChange={setToTeamId}>
                <SelectTrigger className="mt-1 bg-background border-border">
                  <SelectValue placeholder="Select destination team" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((t) => t.id !== player.teamId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Notes (optional)</label>
              <Textarea
                placeholder="e.g. Inter-league trade, player request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 bg-background border-border"
              />
            </div>

            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!toTeamId || isLoading}
              className="w-full gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Approve Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Transfer"
        description={
          <>
            Move <span className="font-semibold text-foreground">{player.name}</span> from{' '}
            <span className="font-semibold text-foreground">{fromTeam?.name ?? '—'}</span> to{' '}
            <span className="font-semibold text-foreground">{toTeam?.name ?? '—'}</span>?
            All career stats will be preserved and bans will carry over.
          </>
        }
        confirmLabel="Confirm Transfer"
        onConfirm={handleTransfer}
        loading={isLoading}
        variant="default"
      />
    </>
  );
}
