export type Team = {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor: string;
  stadium?: string | null;
  founded?: string | null;
};

export type Player = {
  id: string;
  name: string;
  teamId: string;
  photo?: string | null;
  number?: string | number | null;
  position?: string | null;
};

export type MatchStatus = "upcoming" | "played";

export type Match = {
  id: string;
  matchDay: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  scheduledDate?: string;
  time?: string;
  league?: string;
  venue?: string;
  minutesPlayed?: number;
};

export type EventRecord = {
  id: string;
  playerId: string;
  teamId: string;
  matchId?: string;
  timestamp?: { seconds?: number };
};

export type StandingRow = {
  id: string;
  name: string;
  logo?: string | null;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: string[];
};

export type LeagueSettings = {
  seasonName: string;
  leagueVenue: string;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  matchDay?: string;
  defaultTime?: string;
};

export type PublicLeagueData = {
  teams: Team[];
  players: Player[];
  matches: Match[];
  goals: EventRecord[];
  assists: EventRecord[];
  yellowCards: EventRecord[];
  redCards: EventRecord[];
  settings: LeagueSettings;
  leagueName?: string;
  leagueLogo?: string | null;
};

export type PublicNavItem = {
  label: string;
  href: string;
};
