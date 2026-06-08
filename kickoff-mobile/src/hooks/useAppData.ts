import { useQuery } from '@tanstack/react-query';
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
} from '../firebase/firestore';

export const queryKeys = {
  teams: () => ['teams'] as const,
  team: (id: string) => ['team', id] as const,
  players: () => ['players'] as const,
  playersByTeam: (teamId: string) => ['players', teamId] as const,
  player: (id: string) => ['player', id] as const,
  matches: (status?: string) => ['matches', status || 'all'] as const,
  match: (id: string) => ['match', id] as const,
  matchEvents: (id: string) => ['matchEvents', id] as const,
  playerStats: () => ['playerStats'] as const,
  standings: () => ['standings'] as const,
  settings: () => ['settings', 'league'] as const,
  goals: () => ['goals'] as const,
  assists: () => ['assists'] as const,
  yellowCards: () => ['yellowCards'] as const,
  redCards: () => ['redCards'] as const,
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
