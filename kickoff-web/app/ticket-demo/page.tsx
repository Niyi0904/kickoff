'use client';

import { TeamTicketCard } from "@/components/TeamTicketCard";
import type { Team, Player, Match, EventRecord, StandingRow, LeagueSettings } from "@/lib/public-league-types";

// Demo data to visualise the ticket-stub card
const DEMO_SETTINGS: LeagueSettings = {
  seasonName: "Lagos NPL 2026",
  leagueVenue: "Onikan Stadium",
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
};

const DEMO_TEAMS_BY_ID = new Map<string, Team>();
const DEMO_TEAM_1: Team = {
  id: "team-1", name: "Lagos City FC", logo: null, primaryColor: "#004d40",
  stadium: "Onikan Stadium",
};
const DEMO_TEAM_2: Team = {
  id: "team-2", name: "Surulere United", logo: null, primaryColor: "#1a237e",
  stadium: "Agege Stadium",
};
const DEMO_TEAM_3: Team = {
  id: "team-3", name: "Eko Rovers", logo: null, primaryColor: "#b71c1c",
  stadium: "TBS Ground",
};
const DEMO_TEAM_4: Team = {
  id: "team-4", name: "Marina Stars", logo: null, primaryColor: "#f57f17",
  stadium: "Lagos Lawn Tennis",
};

DEMO_TEAMS_BY_ID.set("team-1", DEMO_TEAM_1);
DEMO_TEAMS_BY_ID.set("team-2", DEMO_TEAM_2);
DEMO_TEAMS_BY_ID.set("team-3", DEMO_TEAM_3);
DEMO_TEAMS_BY_ID.set("team-4", DEMO_TEAM_4);

const DEMO_STANDINGS: StandingRow[] = [
  { id: "team-1", name: "Lagos City FC", logo: null, color: "#004d40", played: 6, won: 4, drawn: 1, lost: 1, gf: 12, ga: 5, gd: 7, pts: 13, form: ["W", "W", "D", "W", "L"] },
  { id: "team-2", name: "Surulere United", logo: null, color: "#1a237e", played: 6, won: 3, drawn: 2, lost: 1, gf: 9, ga: 6, gd: 3, pts: 11, form: ["W", "D", "W", "D", "L"] },
  { id: "team-3", name: "Eko Rovers", logo: null, color: "#b71c1c", played: 6, won: 2, drawn: 1, lost: 3, gf: 7, ga: 10, gd: -3, pts: 7, form: ["L", "W", "L", "D", "W"] },
  { id: "team-4", name: "Marina Stars", logo: null, color: "#f57f17", played: 6, won: 1, drawn: 0, lost: 5, gf: 4, ga: 14, gd: -10, pts: 3, form: ["L", "L", "L", "W", "L"] },
];

const DEMO_MATCHES: Match[] = [
  {
    id: "m1", matchDay: 6, status: "played", homeTeamId: "team-1", awayTeamId: "team-2",
    homeScore: 3, awayScore: 1, scheduledDate: "2026-07-18T15:00:00Z", time: "15:00",
    venue: "Onikan Stadium", league: "Lagos NPL",
  },
  {
    id: "m2", matchDay: 6, status: "played", homeTeamId: "team-3", awayTeamId: "team-4",
    homeScore: 2, awayScore: 0, scheduledDate: "2026-07-19T16:00:00Z", time: "16:00",
    venue: "Agege Stadium", league: "Lagos NPL",
  },
  {
    id: "m3", matchDay: 7, status: "upcoming", homeTeamId: "team-1", awayTeamId: "team-3",
    scheduledDate: "2026-07-25T15:00:00Z", time: "15:00",
    venue: "Onikan Stadium", league: "Lagos NPL",
  },
  {
    id: "m4", matchDay: 7, status: "upcoming", homeTeamId: "team-2", awayTeamId: "team-4",
    scheduledDate: "2026-07-26T16:00:00Z", time: "16:00",
    venue: "Agege Stadium", league: "Lagos NPL",
  },
];

const DEMO_PLAYERS: Player[] = [
  { id: "p1", name: "Bayo Akinwale", number: 9, teamId: "team-1", photo: null, position: "Forward" },
  { id: "p2", name: "Chidi Obi", number: 10, teamId: "team-1", photo: null, position: "Midfielder" },
  { id: "p3", name: "Emeka Nwosu", number: 7, teamId: "team-2", photo: null, position: "Forward" },
];

const DEMO_GOALS: EventRecord[] = [
  { id: "g1", teamId: "team-1", playerId: "p1", timestamp: { seconds: 0 } },
  { id: "g2", teamId: "team-1", playerId: "p2", timestamp: { seconds: 0 } },
  { id: "g3", teamId: "team-1", playerId: "p1", timestamp: { seconds: 0 } },
];

export default function TicketDemoPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f1] p-8 dark:bg-[#07130f]">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 font-display text-4xl font-bold uppercase tracking-wide text-[#102018] dark:text-white">
          Team Ticket Card · Demo
        </h1>
        <p className="mb-8 font-body text-sm text-[#526357] dark:text-white/60">
          Ticket-stub layout with perforated divider, stamp mark, scoreboard tiles, and Lagos-coded burnt orange live signal.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TeamTicketCard
            team={DEMO_TEAM_1}
            standings={DEMO_STANDINGS}
            matches={DEMO_MATCHES}
            goals={DEMO_GOALS}
            players={DEMO_PLAYERS}
            settings={DEMO_SETTINGS}
            teamsById={DEMO_TEAMS_BY_ID}
          />
          <TeamTicketCard
            team={DEMO_TEAM_2}
            standings={DEMO_STANDINGS}
            matches={DEMO_MATCHES}
            goals={DEMO_GOALS}
            players={DEMO_PLAYERS}
            settings={DEMO_SETTINGS}
            teamsById={DEMO_TEAMS_BY_ID}
          />
          <TeamTicketCard
            team={DEMO_TEAM_3}
            standings={DEMO_STANDINGS}
            matches={DEMO_MATCHES}
            goals={DEMO_GOALS}
            players={DEMO_PLAYERS}
            settings={DEMO_SETTINGS}
            teamsById={DEMO_TEAMS_BY_ID}
          />
          <TeamTicketCard
            team={DEMO_TEAM_4}
            standings={DEMO_STANDINGS}
            matches={DEMO_MATCHES}
            goals={DEMO_GOALS}
            players={DEMO_PLAYERS}
            settings={DEMO_SETTINGS}
            teamsById={DEMO_TEAMS_BY_ID}
          />
        </div>
      </div>
    </div>
  );
}