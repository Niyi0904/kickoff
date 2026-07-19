'use client';

import { useQuery } from "@tanstack/react-query";
import { fetchPublicLeagueData } from "@/lib/fetchPublicLeagueData";
import type { PublicLeagueData, LeagueSettings, Team, Player, Match, EventRecord } from "@/lib/public-league-types";

const DEFAULT_SETTINGS: LeagueSettings = {
  seasonName: "Current Season",
  leagueVenue: "",
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
};

const EMPTY_TEAMS: Team[] = [];
const EMPTY_PLAYERS: Player[] = [];
const EMPTY_MATCHES: Match[] = [];
const EMPTY_EVENTS: EventRecord[] = [];

export function usePublicLeagueData(leagueSlug?: string) {
  return useQuery({
    queryKey: ["public-league", leagueSlug],
    queryFn: () => fetchPublicLeagueData(leagueSlug),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLeagueDefaults(data: PublicLeagueData | undefined) {
  const teams = data?.teams ?? EMPTY_TEAMS;
  const players = data?.players ?? EMPTY_PLAYERS;
  const matches = data?.matches ?? EMPTY_MATCHES;
  const goals = data?.goals ?? EMPTY_EVENTS;
  const assists = data?.assists ?? EMPTY_EVENTS;
  const yellowCards = data?.yellowCards ?? EMPTY_EVENTS;
  const redCards = data?.redCards ?? EMPTY_EVENTS;
  const settings = data?.settings ?? DEFAULT_SETTINGS;

  return { teams, players, matches, goals, assists, yellowCards, redCards, settings };
}
