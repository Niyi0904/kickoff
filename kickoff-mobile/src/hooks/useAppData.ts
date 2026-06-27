import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTeams,
  fetchTeamById,
  fetchPlayers,
  fetchPlayerById,
  fetchMatches,
  fetchMatchById,
  fetchPlayerStats,
  fetchLeagueStandings,
  fetchLeagueSettings,
  fetchGoals,
  fetchAssists,
  fetchYellowCards,
  fetchRedCards,
  fetchMatchEvents,
  addTeam,
  updateTeam,
  deleteTeam,
  addPlayer,
  updatePlayer,
  deletePlayer,
  addMatch,
  updateMatch,
  deleteMatch,
  updateLeagueSettings,
  addMatchEvent,
  deleteMatchEvent,
  clearMatchEvents,
  claimPlayerProfile,
  unlinkPlayerProfile,
  fetchUnclaimedPlayers,
  fetchAllUsers,
  updateUserRole,
  fetchLinkRequests,
  createLinkRequest,
  updateLinkRequestStatus,
  fetchSuspensions,
  createSuspension,
  endSuspension,
} from '../firebase/firestore';

export const queryKeys = {
  teams: () => ['teams'] as const,
  team: (id: string) => ['team', id] as const,
  players: () => ['players'] as const,
  playersByTeam: (teamId: string) => ['players', teamId] as const,
  player: (id: string) => ['player', id] as const,
  unclaimedPlayers: (teamId?: string) => ['unclaimedPlayers', teamId || 'all'] as const,
  matches: (status?: string) => ['matches', status || 'all'] as const,
  match: (id: string) => ['match', id] as const,
  matchEvents: (id: string) => ['matchEvents', id || 'all'] as const,
  playerStats: () => ['playerStats'] as const,
  standings: () => ['standings'] as const,
  settings: () => ['settings', 'league'] as const,
  goals: () => ['goals'] as const,
  assists: () => ['assists'] as const,
  yellowCards: () => ['yellowCards'] as const,
  redCards: () => ['redCards'] as const,
  allUsers: () => ['users', 'all'] as const,
  linkRequests: (status?: string) => ['linkRequests', status || 'all'] as const,
  suspensions: (activeOnly?: boolean) => ['suspensions', activeOnly ? 'active' : 'all'] as const,
};

export const useTeams = () =>
  useQuery({ queryKey: queryKeys.teams(), queryFn: fetchTeams, staleTime: 5 * 60 * 1000 });

export const useTeam = (teamId: string) =>
  useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => fetchTeamById(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });

export const usePlayers = (teamId?: string) =>
  useQuery({
    queryKey: teamId ? queryKeys.playersByTeam(teamId) : queryKeys.players(),
    queryFn: () => fetchPlayers(teamId),
    staleTime: 5 * 60 * 1000,
  });

export const usePlayer = (playerId: string) =>
  useQuery({
    queryKey: queryKeys.player(playerId),
    queryFn: () => fetchPlayerById(playerId),
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
  });

export const useMatches = (status?: string) =>
  useQuery({
    queryKey: queryKeys.matches(status),
    queryFn: () => fetchMatches(status),
    staleTime: 2 * 60 * 1000,
  });

export const useMatch = (matchId: string) =>
  useQuery({
    queryKey: queryKeys.match(matchId),
    queryFn: () => fetchMatchById(matchId),
    enabled: !!matchId,
    staleTime: 2 * 60 * 1000,
  });

export const useMatchEvents = (matchId: string) =>
  useQuery({
    queryKey: queryKeys.matchEvents(matchId),
    queryFn: () => fetchMatchEvents(matchId),
    enabled: !!matchId,
    staleTime: 2 * 60 * 1000,
  });

export const usePlayerStats = () =>
  useQuery({
    queryKey: queryKeys.playerStats(),
    queryFn: fetchPlayerStats,
    staleTime: 5 * 60 * 1000,
  });

export const useLeagueStandings = () =>
  useQuery({
    queryKey: queryKeys.standings(),
    queryFn: fetchLeagueStandings,
    staleTime: 5 * 60 * 1000,
  });

export const useLeagueSettings = () => {
  const query = useQuery({
    queryKey: queryKeys.settings(),
    queryFn: fetchLeagueSettings,
    staleTime: 10 * 60 * 1000,
  });
  const settings = query.data;
  const deadlineMs = settings?.inviteDeadline ?? Date.now();
  const isDeadlinePassed = Date.now() > deadlineMs;
  return {
    ...query,
    settings,
    seasonName: settings?.seasonName ?? 'Current Season',
    deadlineMs,
    isDeadlinePassed,
  };
};

export const useGoals = () =>
  useQuery({ queryKey: queryKeys.goals(), queryFn: fetchGoals, staleTime: 2 * 60 * 1000 });

export const useAssists = () =>
  useQuery({ queryKey: queryKeys.assists(), queryFn: fetchAssists, staleTime: 2 * 60 * 1000 });

export const useYellowCards = () =>
  useQuery({ queryKey: queryKeys.yellowCards(), queryFn: fetchYellowCards, staleTime: 2 * 60 * 1000 });

export const useRedCards = () =>
  useQuery({ queryKey: queryKeys.redCards(), queryFn: fetchRedCards, staleTime: 2 * 60 * 1000 });

// Mutations
export const useAddTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addTeam>[0]) => addTeam(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.teams() }); },
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTeam>[1] }) => updateTeam(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.teams() }); },
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.teams() }); },
  });
};

export const useAddPlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addPlayer>[0]) => addPlayer(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.players() }); },
  });
};

export const useUpdatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePlayer>[1] }) => updatePlayer(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.players() }); },
  });
};

export const useDeletePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.players() }); },
  });
};

export const useAddMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addMatch>[0]) => addMatch(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches() });
      qc.invalidateQueries({ queryKey: queryKeys.standings() });
    },
  });
};

export const useUpdateMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMatch>[1] }) => updateMatch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches() });
      qc.invalidateQueries({ queryKey: queryKeys.standings() });
    },
  });
};

export const useDeleteMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matches() });
      qc.invalidateQueries({ queryKey: queryKeys.standings() });
    },
  });
};

export const useUpdateLeagueSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateLeagueSettings>[0]) => updateLeagueSettings(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.settings() }); },
  });
};

// ── Player Linking ────────────────────────────────────────────

export const useUnclaimedPlayers = (teamId?: string) =>
  useQuery({
    queryKey: queryKeys.unclaimedPlayers(teamId),
    queryFn: () => fetchUnclaimedPlayers(teamId),
    staleTime: 2 * 60 * 1000,
  });

export const useClaimPlayerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, userId }: { playerId: string; userId: string }) =>
      claimPlayerProfile(playerId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.unclaimedPlayers() });
      qc.invalidateQueries({ queryKey: queryKeys.players() });
    },
  });
};

export const useUnlinkPlayerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, userId }: { playerId: string; userId: string }) =>
      unlinkPlayerProfile(playerId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.players() });
    },
  });
};

// ── Admin: Users ──────────────────────────────────────────────

export const useAllUsers = () =>
  useQuery({
    queryKey: queryKeys.allUsers(),
    queryFn: fetchAllUsers,
    staleTime: 2 * 60 * 1000,
  });

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: string }) => updateUserRole(uid, role as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.allUsers() }); },
  });
};

// ── Admin: Link Requests ──────────────────────────────────────

export const useLinkRequests = (status?: string) =>
  useQuery({
    queryKey: queryKeys.linkRequests(status),
    queryFn: () => fetchLinkRequests(status as any),
    staleTime: 2 * 60 * 1000,
  });

export const useCreateLinkRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, userId, userEmail }: { playerId: string; userId: string; userEmail?: string }) =>
      createLinkRequest(playerId, userId, userEmail),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.linkRequests() }); },
  });
};

export const useUpdateLinkRequestStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
      updateLinkRequestStatus(requestId, status as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.linkRequests() });
      qc.invalidateQueries({ queryKey: queryKeys.players() });
    },
  });
};

// ── Admin: Suspensions ────────────────────────────────────────

export const useSuspensions = (activeOnly?: boolean) =>
  useQuery({
    queryKey: queryKeys.suspensions(activeOnly),
    queryFn: () => fetchSuspensions(activeOnly),
    staleTime: 2 * 60 * 1000,
  });

export const useCreateSuspension = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createSuspension>[0]) => createSuspension(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.suspensions() }); },
  });
};

export const useEndSuspension = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suspensionId: string) => endSuspension(suspensionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.suspensions() }); },
  });
};

// ── Match Event Mutations ──────────────────────────────────────

type EventCollection = 'goals' | 'assists' | 'yellow_cards' | 'red_cards';

export const useAddMatchEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collection, event }: { collection: EventCollection; event: { playerId: string; matchId: string; matchDay: number; teamId: string; minute?: number } }) =>
      addMatchEvent(collection, event),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matchEvents('') });
      qc.invalidateQueries({ queryKey: queryKeys.playerStats() });
    },
  });
};

export const useDeleteMatchEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collection, eventId }: { collection: EventCollection; eventId: string }) =>
      deleteMatchEvent(collection, eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matchEvents('') });
      qc.invalidateQueries({ queryKey: queryKeys.playerStats() });
    },
  });
};

export const useClearMatchEvents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => clearMatchEvents(matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matchEvents('') });
      qc.invalidateQueries({ queryKey: queryKeys.playerStats() });
    },
  });
};
