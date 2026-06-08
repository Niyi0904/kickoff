/**
 * Firestore document mappers — aligned with team_management fetchers (read-only reference).
 * Maps snake_case DB fields to camelCase app types.
 */

import type { Match, Player, Team, LeagueSettings } from './types';

export function mapTeam(id: string, data: Record<string, unknown>): Team {
  return {
    id,
    name: String(data.name ?? ''),
    logo: (data.logo as string | undefined) ?? undefined,
    primaryColor: String(data.primary_color ?? data.primaryColor ?? '#3b82f6'),
    founded: String(data.founded ?? ''),
    stadium: String(data.stadium ?? ''),
  };
}

export function mapPlayer(id: string, data: Record<string, unknown>): Player {
  return {
    id,
    name: String(data.name ?? ''),
    position: String(data.position ?? 'FW') as Player['position'],
    number: Number(data.number ?? 0),
    teamId: String(data.team_id ?? data.teamId ?? ''),
    isManager: Boolean(data.is_manager ?? data.isManager ?? false),
    photo: (data.photo as string | null) ?? undefined,
    linkedUserId: (data.linkedUserId as string | null) ?? undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  };
}

export function mapMatch(id: string, data: Record<string, unknown>): Match {
  return {
    id,
    matchDay: Number(data.matchDay ?? 0),
    homeTeamId: String(data.homeTeamId ?? ''),
    awayTeamId: String(data.awayTeamId ?? ''),
    homeScore: Number(data.homeScore ?? 0),
    awayScore: Number(data.awayScore ?? 0),
    homeYellows: Number(data.homeYellows ?? 0),
    awayYellows: Number(data.awayYellows ?? 0),
    homeReds: Number(data.homeReds ?? 0),
    awayReds: Number(data.awayReds ?? 0),
    homePoints: Number(data.homePoints ?? 0),
    awayPoints: Number(data.awayPoints ?? 0),
    minutesPlayed: Number(data.minutesPlayed ?? 90),
    league: String(data.league ?? ''),
    status: (data.status as Match['status']) ?? 'upcoming',
    scheduledDate: data.scheduledDate as string | undefined,
    time: data.time as string | undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
    report: data.report as string | undefined,
    keyMoments: data.keyMoments as string | undefined,
  };
}

export interface PlayerEvent {
  id: string;
  playerId: string;
  matchId: string;
  matchDay: number;
  teamId: string;
  timestamp?: unknown;
}

export function mapPlayerEvent(id: string, data: Record<string, unknown>): PlayerEvent {
  return {
    id,
    playerId: String(data.playerId ?? ''),
    matchId: String(data.matchId ?? ''),
    matchDay: Number(data.matchDay ?? 0),
    teamId: String(data.teamId ?? ''),
    timestamp: data.timestamp,
  };
}

export const DEFAULT_LEAGUE_SETTINGS: LeagueSettings = {
  seasonName: 'Current Season',
  inviteDeadline: new Date('2099-12-31T23:59:59').getTime(),
  leagueVenue: '',
  matchDay: 'Tuesday',
  defaultTime: '10:00',
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  yellowsPerBan: 3,
};

export function mapLeagueSettings(data: Record<string, unknown> | undefined): LeagueSettings {
  if (!data) return DEFAULT_LEAGUE_SETTINGS;

  let inviteDeadline = DEFAULT_LEAGUE_SETTINGS.inviteDeadline;
  const raw = data.inviteDeadline;
  if (raw && typeof raw === 'object' && 'toDate' in raw && typeof (raw as { toDate: () => Date }).toDate === 'function') {
    inviteDeadline = (raw as { toDate: () => Date }).toDate().getTime();
  } else if (typeof raw === 'string') {
    inviteDeadline = new Date(raw).getTime();
  } else if (typeof raw === 'number') {
    inviteDeadline = raw;
  }

  return {
    seasonName: String(data.seasonName ?? DEFAULT_LEAGUE_SETTINGS.seasonName),
    inviteDeadline,
    leagueVenue: String(data.leagueVenue ?? ''),
    matchDay: String(data.matchDay ?? DEFAULT_LEAGUE_SETTINGS.matchDay),
    defaultTime: String(data.defaultTime ?? DEFAULT_LEAGUE_SETTINGS.defaultTime),
    pointsWin: Number(data.pointsWin ?? 3),
    pointsDraw: Number(data.pointsDraw ?? 1),
    pointsLoss: Number(data.pointsLoss ?? 0),
    yellowsPerBan: Number(data.yellowsPerBan ?? 3),
  };
}
