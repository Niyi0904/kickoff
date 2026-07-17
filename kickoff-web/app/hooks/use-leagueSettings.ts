'use client';

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/hooks/useAuth";

export interface LeagueSettings {
  seasonName:     string;
  inviteDeadline: string;
  leagueVenue:    string;
  matchDay:       string;
  defaultTime:    string;
  pointsWin:      number;
  pointsDraw:     number;
  pointsLoss:     number;
  yellowsPerBan:  number;
  leagueId?:      string | null;
}

export interface League extends LeagueSettings {
  id:        string;
  slug:      string;
  name:      string;
  createdAt: any;
}

export const DEFAULT_SETTINGS: LeagueSettings = {
  seasonName:     'Current Season',
  inviteDeadline: '2099-12-31T23:59:59',
  leagueVenue:    '',
  matchDay:       'Tuesday',
  defaultTime:    '10:00',
  pointsWin:      3,
  pointsDraw:     1,
  pointsLoss:     0,
  yellowsPerBan:  3,
};

function normalizeSettings(d: Record<string, any>): LeagueSettings {
  const inviteDeadline = d.inviteDeadline?.toDate
    ? d.inviteDeadline.toDate().toISOString()
    : d.inviteDeadline || DEFAULT_SETTINGS.inviteDeadline;

  return {
    seasonName:     d.seasonName     ?? DEFAULT_SETTINGS.seasonName,
    inviteDeadline,
    leagueVenue:    d.leagueVenue    ?? DEFAULT_SETTINGS.leagueVenue,
    matchDay:       d.matchDay       ?? DEFAULT_SETTINGS.matchDay,
    defaultTime:    d.defaultTime    ?? DEFAULT_SETTINGS.defaultTime,
    pointsWin:      d.pointsWin      ?? DEFAULT_SETTINGS.pointsWin,
    pointsDraw:     d.pointsDraw     ?? DEFAULT_SETTINGS.pointsDraw,
    pointsLoss:     d.pointsLoss     ?? DEFAULT_SETTINGS.pointsLoss,
    yellowsPerBan:  d.yellowsPerBan  ?? DEFAULT_SETTINGS.yellowsPerBan,
    leagueId:       d.leagueId       ?? d.id ?? null,
  };
}

async function fetchSettingsByLeagueId(leagueId: string | null): Promise<LeagueSettings> {
  if (!leagueId) return DEFAULT_SETTINGS;
  const snap = await getDoc(doc(db, 'settings', leagueId));
  if (!snap.exists()) return DEFAULT_SETTINGS;
  return normalizeSettings(snap.data());
}

  export function useLeagueSettings(leagueId?: string) {
    const { leagueId: userLeagueId, loading: isAuthLoading } = useAuth();
    const effectiveLeagueId = leagueId ?? userLeagueId ?? null;

  const queryKey = ['settings', effectiveLeagueId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchSettingsByLeagueId(effectiveLeagueId!),
    staleTime: 1000 * 60 * 10,
    enabled: !isAuthLoading && !!effectiveLeagueId,
  });

  const settings = data ?? DEFAULT_SETTINGS;
  const deadlineMs = new Date(settings.inviteDeadline).getTime();
  const isDeadlinePassed = Date.now() > deadlineMs;

  return {
    settings,
    isLoading: isLoading || isAuthLoading,
    deadlineMs,
    isDeadlinePassed,
    seasonName:    settings.seasonName,
    matchDay:      settings.matchDay,
    defaultTime:   settings.defaultTime,
    yellowsPerBan: settings.yellowsPerBan,
    leagueId:      effectiveLeagueId,
  };
}

export function useLeague(leagueId?: string) {
  return useLeagueSettings(leagueId);
}
