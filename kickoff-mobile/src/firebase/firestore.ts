import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import {
  mapTeam,
  mapPlayer,
  mapMatch,
  mapPlayerEvent,
  mapLeagueSettings,
  DEFAULT_LEAGUE_SETTINGS,
  type PlayerEvent,
} from '../lib/firestoreMappers';
import type { Team, Player, Match, PlayerStats, TeamStanding, LeagueSettings } from '../lib/types';

export type { PlayerEvent };

export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'teams'));
    return snapshot.docs.map((d) => mapTeam(d.id, d.data() as Record<string, unknown>));
  } catch (error) {
    console.error('Fetch teams error:', error);
    return [];
  }
};

export const fetchTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const ref = doc(db, 'teams', teamId);
    const snap = await getDoc(ref);
    return snap.exists() ? mapTeam(snap.id, snap.data() as Record<string, unknown>) : null;
  } catch (error) {
    console.error('Fetch team by ID error:', error);
    return null;
  }
};

export const fetchPlayers = async (teamId?: string): Promise<Player[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    if (teamId) {
      constraints.push(where('team_id', '==', teamId));
    }
    const playersQuery = constraints.length
      ? query(collection(db, 'players'), ...constraints)
      : collection(db, 'players');
    const snapshot = await getDocs(playersQuery);
    const all = snapshot.docs.map((d) => mapPlayer(d.id, d.data() as Record<string, unknown>));
    if (!teamId) return all;
    return all.filter((p) => p.teamId === teamId);
  } catch (error) {
    try {
      const snapshot = await getDocs(collection(db, 'players'));
      const all = snapshot.docs.map((d) => mapPlayer(d.id, d.data() as Record<string, unknown>));
      return teamId ? all.filter((p) => p.teamId === teamId) : all;
    } catch (e) {
      console.error('Fetch players error:', e);
      return [];
    }
  }
};

export const fetchPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    const snap = await getDoc(doc(db, 'players', playerId));
    return snap.exists() ? mapPlayer(snap.id, snap.data() as Record<string, unknown>) : null;
  } catch (error) {
    console.error('Fetch player by ID error:', error);
    return null;
  }
};

export const fetchMatches = async (status?: string): Promise<Match[]> => {
  try {
    const constraints: QueryConstraint[] = [orderBy('matchDay', 'desc')];
    if (status) {
      constraints.unshift(where('status', '==', status));
    }
    const snapshot = await getDocs(query(collection(db, 'matches'), ...constraints));
    return snapshot.docs.map((d) => mapMatch(d.id, d.data() as Record<string, unknown>));
  } catch (error) {
    console.error('Fetch matches error:', error);
    return [];
  }
};

export const fetchMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    const snap = await getDoc(doc(db, 'matches', matchId));
    return snap.exists() ? mapMatch(snap.id, snap.data() as Record<string, unknown>) : null;
  } catch (error) {
    console.error('Fetch match by ID error:', error);
    return null;
  }
};

async function fetchEvents(collectionName: string): Promise<PlayerEvent[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((d) => mapPlayerEvent(d.id, d.data() as Record<string, unknown>));
}

export const fetchGoals = () => fetchEvents('goals');
export const fetchAssists = () => fetchEvents('assists');
export const fetchYellowCards = () => fetchEvents('yellow_cards');
export const fetchRedCards = () => fetchEvents('red_cards');

export const fetchMatchEvents = async (matchId: string) => {
  const filterByMatch = async (col: string) => {
    const snap = await getDocs(query(collection(db, col), where('matchId', '==', matchId)));
    return snap.docs.map((d) => mapPlayerEvent(d.id, d.data() as Record<string, unknown>));
  };
  const [goals, assists, yellows, reds] = await Promise.all([
    filterByMatch('goals'),
    filterByMatch('assists'),
    filterByMatch('yellow_cards'),
    filterByMatch('red_cards'),
  ]);
  return { goals, assists, yellows, reds };
};

export const fetchPlayerStats = async (): Promise<PlayerStats[]> => {
  try {
    const [teams, players, goals, assists, yellows, reds] = await Promise.all([
      fetchTeams(),
      fetchPlayers(),
      fetchGoals(),
      fetchAssists(),
      fetchYellowCards(),
      fetchRedCards(),
    ]);

    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const statsMap = new Map<string, PlayerStats>();

    const ensure = (playerId: string, teamId: string) => {
      if (!statsMap.has(playerId)) {
        const player = playerMap.get(playerId);
        const team = teamMap.get(teamId) ?? teamMap.get(player?.teamId ?? '');
        statsMap.set(playerId, {
          playerId,
          playerName: player?.name ?? 'Unknown',
          teamId: teamId || player?.teamId || '',
          teamName: team?.name ?? '',
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
        });
      }
      return statsMap.get(playerId)!;
    };

    goals.forEach((g) => { ensure(g.playerId, g.teamId).goals += 1; });
    assists.forEach((a) => { ensure(a.playerId, a.teamId).assists += 1; });
    yellows.forEach((y) => { ensure(y.playerId, y.teamId).yellowCards += 1; });
    reds.forEach((r) => { ensure(r.playerId, r.teamId).redCards += 1; });

    return Array.from(statsMap.values()).sort((a, b) => b.goals - a.goals);
  } catch (error) {
    console.error('Fetch player stats error:', error);
    return [];
  }
};

export const getPlayerStatsForId = (
  playerId: string,
  goals: PlayerEvent[],
  assists: PlayerEvent[],
  yellows: PlayerEvent[],
  reds: PlayerEvent[],
) => {
  const matchIds = new Set<string>();
  [...goals, ...assists, ...yellows, ...reds]
    .filter((e) => e.playerId === playerId)
    .forEach((e) => matchIds.add(e.matchId));

  return {
    goals: goals.filter((g) => g.playerId === playerId).length,
    assists: assists.filter((a) => a.playerId === playerId).length,
    yellowCards: yellows.filter((y) => y.playerId === playerId).length,
    redCards: reds.filter((r) => r.playerId === playerId).length,
    matches: matchIds.size,
  };
};

export const fetchLeagueStandings = async (): Promise<TeamStanding[]> => {
  try {
    const [teams, matchesSnapshot] = await Promise.all([
      fetchTeams(),
      getDocs(query(collection(db, 'matches'), where('status', '==', 'played'))),
    ]);

    const standingsMap = new Map<string, TeamStanding>();
    teams.forEach((team) => {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        position: 0,
      });
    });

    matchesSnapshot.docs.forEach((docSnap) => {
      const match = mapMatch(docSnap.id, docSnap.data() as Record<string, unknown>);
      const home = standingsMap.get(match.homeTeamId);
      const away = standingsMap.get(match.awayTeamId);
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;
      home.points += match.homePoints;
      away.points += match.awayPoints;

      if (match.homePoints === 3) home.wins += 1;
      else if (match.homePoints === 1) home.draws += 1;
      else home.losses += 1;

      if (match.awayPoints === 3) away.wins += 1;
      else if (match.awayPoints === 1) away.draws += 1;
      else away.losses += 1;
    });

    standingsMap.forEach((s) => {
      s.goalDifference = s.goalsFor - s.goalsAgainst;
    });

    const sorted = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    sorted.forEach((s, i) => { s.position = i + 1; });
    return sorted;
  } catch (error) {
    console.error('Fetch league standings error:', error);
    return [];
  }
};

export const fetchLeagueSettings = async (): Promise<LeagueSettings> => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'league'));
    return snap.exists()
      ? mapLeagueSettings(snap.data() as Record<string, unknown>)
      : DEFAULT_LEAGUE_SETTINGS;
  } catch (error) {
    console.error('Fetch league settings error:', error);
    return DEFAULT_LEAGUE_SETTINGS;
  }
};
