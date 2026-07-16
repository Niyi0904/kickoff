'use client';
// app/hooks/useSuspensions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/app/context/AuthContext';
import { useLeagueSettings } from './use-leagueSettings';
import {
  getActiveSuspensions,
  getPlayerSuspensions,
  evaluateSuspensions,
  overrideSuspension,
  checkPlayerSuspension,
  Suspension,
  SuspensionCheck,
} from '@/lib/suspensions';
import { useToast } from './use-toast';

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────
export const SUSPENSION_KEYS = {
  all:    ['suspensions', 'active']    as const,
  player: (id: string) => ['suspensions', 'player', id] as const,
  check:  (id: string) => ['suspensions', 'check',  id] as const,
};

// ─────────────────────────────────────────────
// All active suspensions — used in admin panel
// ─────────────────────────────────────────────
export function useActiveSuspensions() {
  return useQuery<Suspension[]>({
    queryKey: SUSPENSION_KEYS.all,
    queryFn:  () => getActiveSuspensions(),
    staleTime: 1000 * 60 * 2,
  });
}

// ─────────────────────────────────────────────
// Suspensions for a specific player — used on player profile
// ─────────────────────────────────────────────
export function usePlayerSuspensions(playerId: string) {
  return useQuery({
    queryKey: SUSPENSION_KEYS.player(playerId),
    queryFn:  () => getPlayerSuspensions(playerId),
    enabled:  !!playerId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─────────────────────────────────────────────
// Check if a single player is suspended
// Used in player cards and match dialogs
// ─────────────────────────────────────────────
export function usePlayerSuspensionCheck(playerId: string) {
  return useQuery({
    queryKey: SUSPENSION_KEYS.check(playerId),
    queryFn:  () => checkPlayerSuspension(playerId),
    enabled:  !!playerId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─────────────────────────────────────────────
// Evaluate + create suspensions after a match
// Called from recordMatchStats flow
// ─────────────────────────────────────────────
export function useEvaluateSuspensions() {
  const queryClient   = useQueryClient();
  const { settings }  = useLeagueSettings();
  const { toast }     = useToast();

  return useMutation({
    mutationFn: ({
      matchId,
      playerIds,
    }: {
      matchId:   string;
      playerIds: { yellows: string[]; reds: string[] };
    }) => evaluateSuspensions(matchId, playerIds, settings.yellowsPerBan),

    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['suspensions'] });
      if (result.created.length > 0) {
        toast({
          title:       '⚠️ Suspension issued',
          description: `${result.created.length} player(s) have been automatically suspended.`,
          variant:     'default',
        });
      }
      if (result.errors.length > 0) {
        console.error('Suspension evaluation errors:', result.errors);
      }
    },
  });
}

// ─────────────────────────────────────────────
// Admin override mutation
// ─────────────────────────────────────────────
export function useOverrideSuspension() {
  const queryClient = useQueryClient();
  const { user }    = useAuthContext();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: ({
      suspensionId,
      note,
    }: {
      suspensionId: string;
      note:         string;
    }) => overrideSuspension(suspensionId, user!.uid, note),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspensions'] });
      toast({ title: 'Suspension lifted', description: 'The suspension has been overridden.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to override suspension.', variant: 'destructive' });
    },
  });
}