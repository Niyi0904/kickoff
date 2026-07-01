'use client';

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

async function fetchLeagueSettings(): Promise<LeagueSettings> {
  const snap = await getDoc(doc(db, 'settings', 'league'));
  if (!snap.exists()) return DEFAULT_SETTINGS;
  const d = snap.data();

  // Handle Firestore Timestamp vs ISO String
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
    leagueId:       d.leagueId       ?? null,
  };
}

export function useLeagueSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'league'],
    queryFn: fetchLeagueSettings,
    staleTime: 1000 * 60 * 10,
  });

  const settings = data ?? DEFAULT_SETTINGS;
  const deadlineMs = new Date(settings.inviteDeadline).getTime();
  const isDeadlinePassed = Date.now() > deadlineMs;

  return {
    settings,
    isLoading,
    deadlineMs,
    isDeadlinePassed,
    seasonName:    settings.seasonName,
    matchDay:      settings.matchDay,
    defaultTime:   settings.defaultTime,
    yellowsPerBan: settings.yellowsPerBan,
  };
}