'use client';
// app/hooks/usePlayerLinking.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/app/context/AuthContext';
import { useToast } from './use-toast';
import {
  submitLinkRequest,
  getPendingLinkRequests,
  getAllLinkRequests,
  getUserLinkRequest,
  getLinkedPlayer,
  approveLinkRequest,
  rejectLinkRequest,
  unlinkPlayer,
  LinkRequest,
} from '@/lib/playerLinking';

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────
export const LINK_KEYS = {
  all:        ['link_requests', 'all']     as const,
  pending:    ['link_requests', 'pending'] as const,
  userReq:    (uid: string) => ['link_requests', 'user', uid]   as const,
  linked:     (uid: string) => ['linked_player', uid]           as const,
};

// ─────────────────────────────────────────────
// Get current user's link request status
// ─────────────────────────────────────────────
export function useMyLinkRequest() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: LINK_KEYS.userReq(user?.uid ?? ''),
    queryFn:  () => getUserLinkRequest(user!.uid),
    enabled:  !!user,
    staleTime: 1000 * 60 * 2,
  });
}

// ─────────────────────────────────────────────
// Get the player profile linked to the current user
// Used to drive the "My Profile" sidebar item
// ─────────────────────────────────────────────
export function useMyLinkedPlayer() {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: LINK_KEYS.linked(user?.uid ?? ''),
    queryFn:  () => getLinkedPlayer(user!.uid),
    enabled:  !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// ─────────────────────────────────────────────
// Admin — all requests
// ─────────────────────────────────────────────
export function useAllLinkRequests() {
  return useQuery<LinkRequest[]>({
    queryKey: LINK_KEYS.all,
    queryFn:  () => getAllLinkRequests(),
    staleTime: 1000 * 60 * 1,
  });
}

// ─────────────────────────────────────────────
// Admin — pending requests only
// ─────────────────────────────────────────────
export function usePendingLinkRequests() {
  return useQuery<LinkRequest[]>({
    queryKey: LINK_KEYS.pending,
    queryFn:  () => getPendingLinkRequests(),
    staleTime: 1000 * 60 * 1,
  });
}

// ─────────────────────────────────────────────
// Submit a claim request (player side)
// ─────────────────────────────────────────────
export function useSubmitLinkRequest() {
  const queryClient = useQueryClient();
  const { user }    = useAuthContext();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: ({
      playerId,
      playerName,
      teamName,
    }: {
      playerId:   string;
      playerName: string;
      teamName:   string;
    }) => submitLinkRequest(
      user!.uid,
      playerId,
      user!.email ?? '',
      user!.displayName ?? 'Unknown',
      playerName,
      teamName,
    ),

    onSuccess: (result) => {
      if ('error' in result && result.error) {
        toast({
          title:       'Cannot submit request',
          description: result.error.message,
          variant:     'destructive',
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['link_requests'] });
      toast({
        title:       'Request submitted',
        description: 'Your claim has been sent to the admin for review.',
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit request.', variant: 'destructive' });
    },
  });
}

// ─────────────────────────────────────────────
// Admin — approve
// ─────────────────────────────────────────────
export function useApproveLinkRequest() {
  const queryClient = useQueryClient();
  const { user }    = useAuthContext();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: ({ requestId, playerId, userId }: { requestId: string; playerId: string; userId: string }) =>
      approveLinkRequest(requestId, playerId, userId, user!.uid),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['link_requests'] });
      queryClient.invalidateQueries({ queryKey: ['linked_player'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({ title: 'Request approved', description: 'Player profile has been linked.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve request.', variant: 'destructive' });
    },
  });
}

// ─────────────────────────────────────────────
// Admin — reject
// ─────────────────────────────────────────────
export function useRejectLinkRequest() {
  const queryClient = useQueryClient();
  const { user }    = useAuthContext();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note: string }) =>
      rejectLinkRequest(requestId, user!.uid, note),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['link_requests'] });
      toast({ title: 'Request rejected', description: 'The claim has been declined.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject request.', variant: 'destructive' });
    },
  });
}

// ─────────────────────────────────────────────
// Admin — unlink
// ─────────────────────────────────────────────
export function useUnlinkPlayer() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: (playerId: string) => unlinkPlayer(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['link_requests'] });
      queryClient.invalidateQueries({ queryKey: ['linked_player'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({ title: 'Player unlinked', description: 'The player profile has been unlinked.' });
    },
  });
}