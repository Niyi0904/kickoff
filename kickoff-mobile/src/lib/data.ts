export type UserRole = 'guest' | 'player' | 'manager' | 'admin';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  founded: string;
  stadium: string;
  manager: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
  form: ('W' | 'D' | 'L')[];
  description: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CAM' | 'LW' | 'RW' | 'FW' | 'CDM';
  number: number;
  nationality: string;
  age: number;
  goals: number;
  assists: number;
  appearances: number;
  cleanSheets?: number;
  yellowCards: number;
  redCards: number;
  rating: number;
  isClaimed: boolean;
  photo?: string;
}

export interface Fixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed' | 'postponed';
  gameweek: number;
  homeScore?: number;
  awayScore?: number;
  homeScorers?: string[];
  awayScorers?: string[];
  attendance?: number;
}

export interface LinkRequest {
  id: string;
  playerId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface Suspension {
  id: string;
  playerId: string;
  reason: string;
  startDate: string;
  endDate: string;
  matchesBanned: number;
  matchesServed: number;
}

export const LEAGUE = {
  name: 'Lagos Premier League',
  season: '2024/25',
  currentGameweek: 12,
  totalGameweeks: 22,
  organizer: 'Lagos FA',
  logo: '⚽',
};

export const TEAMS: Team[] = [
  {
    id: '1', name: 'Lagos FC', shortName: 'LAG', badge: '🔵', color: '#4D7EFF',
    founded: '2010', stadium: 'Teslim Balogun Stadium', manager: 'Emeka Eze',
    played: 11, wins: 9, draws: 1, losses: 1, goalsFor: 32, goalsAgainst: 10, points: 28, position: 1,
    form: ['W','W','W','D','W'],
    description: 'The pride of Lagos, known for their attacking football and passionate fans.',
  },
  {
    id: '2', name: 'Abuja United', shortName: 'ABJ', badge: '🔴', color: '#FF3D5A',
    founded: '2008', stadium: 'Moshood Abiola Stadium', manager: 'Chuka Nwosu',
    played: 11, wins: 8, draws: 2, losses: 1, goalsFor: 27, goalsAgainst: 13, points: 26, position: 2,
    form: ['W','L','W','W','W'],
    description: 'A powerhouse from the capital with a strong defensive tradition.',
  },
  {
    id: '3', name: 'Rivers Saints', shortName: 'RVS', badge: '🟢', color: '#00E676',
    founded: '2012', stadium: 'Isaac Boro Park', manager: 'Tonye Briggs',
    played: 11, wins: 7, draws: 2, losses: 2, goalsFor: 24, goalsAgainst: 16, points: 23, position: 3,
    form: ['W','W','D','L','W'],
    description: 'Rising stars from Port Harcourt with an exciting young squad.',
  },
  {
    id: '4', name: 'Kano Pillars FC', shortName: 'KAN', badge: '🟡', color: '#FFB800',
    founded: '2005', stadium: 'Sani Abacha Stadium', manager: 'Aminu Kano',
    played: 11, wins: 6, draws: 3, losses: 2, goalsFor: 22, goalsAgainst: 17, points: 21, position: 4,
    form: ['D','W','W','D','W'],
    description: 'The northern giants with a loyal fanbase and strong home record.',
  },
  {
    id: '5', name: 'Enugu Rangers', shortName: 'ENU', badge: '🔰', color: '#A855F7',
    founded: '2003', stadium: 'Nnamdi Azikiwe Stadium', manager: 'Fidelis Obi',
    played: 11, wins: 5, draws: 3, losses: 3, goalsFor: 19, goalsAgainst: 18, points: 18, position: 5,
    form: ['L','D','W','W','D'],
    description: 'One of the oldest clubs in the league with rich history.',
  },
  {
    id: '6', name: 'Sunshine FC', shortName: 'SUN', badge: '🌟', color: '#FF8C00',
    founded: '2015', stadium: 'Ondo State Stadium', manager: 'Bola Adeyemi',
    played: 11, wins: 4, draws: 3, losses: 4, goalsFor: 18, goalsAgainst: 22, points: 15, position: 6,
    form: ['W','L','L','D','W'],
    description: 'Sunshine FC bring flair and creativity from the southwest.',
  },
  {
    id: '7', name: 'Warri Wolves', shortName: 'WAR', badge: '🐺', color: '#20B2AA',
    founded: '2011', stadium: 'Warri Township Stadium', manager: 'Chidi Okafor',
    played: 11, wins: 3, draws: 2, losses: 6, goalsFor: 15, goalsAgainst: 25, points: 11, position: 7,
    form: ['L','W','L','L','D'],
    description: 'Fighting spirit defines this Delta State outfit.',
  },
  {
    id: '8', name: 'Enyimba FC', shortName: 'ENY', badge: '🦁', color: '#CD853F',
    founded: '2001', stadium: 'Enyimba International Stadium', manager: 'Uche Okoye',
    played: 11, wins: 1, draws: 2, losses: 8, goalsFor: 9, goalsAgainst: 31, points: 5, position: 8,
    form: ['L','L','D','L','L'],
    description: 'A storied club going through a rebuilding phase this season.',
  },
];

export const PLAYERS: Player[] = [
  { id: '1', name: 'Chukwuemeka Obi', teamId: '1', position: 'FW', number: 9, nationality: '🇳🇬 Nigerian', age: 24, goals: 15, assists: 6, appearances: 11, yellowCards: 1, redCards: 0, rating: 8.4, isClaimed: true },
  { id: '2', name: 'Babatunde Akintola', teamId: '1', position: 'CAM', number: 10, nationality: '🇳🇬 Nigerian', age: 27, goals: 8, assists: 12, appearances: 11, yellowCards: 2, redCards: 0, rating: 8.1, isClaimed: true },
  { id: '3', name: 'Tunde Fadeyi', teamId: '1', position: 'GK', number: 1, nationality: '🇳🇬 Nigerian', age: 29, goals: 0, assists: 0, appearances: 11, cleanSheets: 8, yellowCards: 0, redCards: 0, rating: 7.9, isClaimed: false },
  { id: '4', name: 'Seun Adeyemi', teamId: '1', position: 'CB', number: 4, nationality: '🇳🇬 Nigerian', age: 25, goals: 2, assists: 0, appearances: 10, yellowCards: 3, redCards: 0, rating: 7.5, isClaimed: false },
  { id: '5', name: 'Ifeanyi Eze', teamId: '1', position: 'RW', number: 7, nationality: '🇳🇬 Nigerian', age: 22, goals: 5, assists: 4, appearances: 9, yellowCards: 1, redCards: 0, rating: 7.7, isClaimed: true },
  { id: '6', name: 'Mahmud Yusuf', teamId: '2', position: 'FW', number: 9, nationality: '🇳🇬 Nigerian', age: 26, goals: 12, assists: 3, appearances: 11, yellowCards: 2, redCards: 0, rating: 8.0, isClaimed: false },
  { id: '7', name: 'Emeka Nwosu', teamId: '2', position: 'CM', number: 8, nationality: '🇳🇬 Nigerian', age: 28, goals: 4, assists: 7, appearances: 11, yellowCards: 1, redCards: 0, rating: 7.8, isClaimed: false },
  { id: '8', name: 'Saka Balogun', teamId: '3', position: 'FW', number: 11, nationality: '🇳🇬 Nigerian', age: 21, goals: 10, assists: 5, appearances: 11, yellowCards: 0, redCards: 0, rating: 7.9, isClaimed: true },
  { id: '9', name: 'Pius Amaechi', teamId: '3', position: 'CDM', number: 6, nationality: '🇳🇬 Nigerian', age: 30, goals: 1, assists: 2, appearances: 10, yellowCards: 4, redCards: 1, rating: 7.2, isClaimed: false },
  { id: '10', name: 'Aliyu Musa', teamId: '4', position: 'FW', number: 9, nationality: '🇳🇬 Nigerian', age: 23, goals: 9, assists: 2, appearances: 11, yellowCards: 1, redCards: 0, rating: 7.6, isClaimed: false },
  { id: '11', name: 'Gabriel Okoro', teamId: '5', position: 'LW', number: 7, nationality: '🇳🇬 Nigerian', age: 25, goals: 7, assists: 8, appearances: 11, yellowCards: 2, redCards: 0, rating: 7.7, isClaimed: false },
  { id: '12', name: 'Felix Owusu', teamId: '6', position: 'CAM', number: 10, nationality: '🇳🇬 Nigerian', age: 26, goals: 6, assists: 6, appearances: 10, yellowCards: 1, redCards: 0, rating: 7.4, isClaimed: false },
];

export const FIXTURES: Fixture[] = [
  { id: '1', homeTeamId: '1', awayTeamId: '2', date: '2024-12-21', time: '15:00', venue: 'Teslim Balogun Stadium', status: 'upcoming', gameweek: 13 },
  { id: '2', homeTeamId: '3', awayTeamId: '4', date: '2024-12-21', time: '17:00', venue: 'Isaac Boro Park', status: 'upcoming', gameweek: 13 },
  { id: '3', homeTeamId: '5', awayTeamId: '6', date: '2024-12-22', time: '15:00', venue: 'Nnamdi Azikiwe Stadium', status: 'upcoming', gameweek: 13 },
  { id: '4', homeTeamId: '7', awayTeamId: '8', date: '2024-12-22', time: '17:00', venue: 'Warri Township Stadium', status: 'upcoming', gameweek: 13 },
  { id: '5', homeTeamId: '2', awayTeamId: '3', date: '2024-12-14', time: '15:00', venue: 'Moshood Abiola Stadium', status: 'completed', gameweek: 12, homeScore: 2, awayScore: 1, homeScorers: ['Mahmud Yusuf 23\'', 'Emeka Nwosu 67\''], awayScorers: ['Saka Balogun 45\''], attendance: 14500 },
  { id: '6', homeTeamId: '1', awayTeamId: '4', date: '2024-12-14', time: '17:00', venue: 'Teslim Balogun Stadium', status: 'completed', gameweek: 12, homeScore: 3, awayScore: 0, homeScorers: ['Chukwuemeka Obi 12\'', 'Babatunde Akintola 45+2\'', 'Chukwuemeka Obi 78\''], awayScorers: [], attendance: 18200 },
  { id: '7', homeTeamId: '6', awayTeamId: '7', date: '2024-12-14', time: '15:00', venue: 'Ondo State Stadium', status: 'completed', gameweek: 12, homeScore: 1, awayScore: 1, homeScorers: ['Felix Owusu 55\''], awayScorers: ['Chidi Okoro 88\''], attendance: 6800 },
  { id: '8', homeTeamId: '4', awayTeamId: '5', date: '2024-12-07', time: '15:00', venue: 'Sani Abacha Stadium', status: 'completed', gameweek: 11, homeScore: 2, awayScore: 2, homeScorers: ['Aliyu Musa 34\'', 'Aliyu Musa 71\''], awayScorers: ['Gabriel Okoro 22\'', 'Femi Ojo 89\''], attendance: 11200 },
  { id: '9', homeTeamId: '1', awayTeamId: '3', date: '2024-12-28', time: '16:00', venue: 'Teslim Balogun Stadium', status: 'upcoming', gameweek: 14 },
  { id: '10', homeTeamId: '2', awayTeamId: '4', date: '2024-12-28', time: '16:00', venue: 'Moshood Abiola Stadium', status: 'upcoming', gameweek: 14 },
];

export const LINK_REQUESTS: LinkRequest[] = [
  { id: '1', playerId: '3', userId: 'u1', userName: 'Tunde Fadeyi Jr.', status: 'pending', requestedAt: '2024-12-10' },
  { id: '2', playerId: '4', userId: 'u2', userName: 'Seun A.', status: 'pending', requestedAt: '2024-12-09' },
  { id: '3', playerId: '6', userId: 'u3', userName: 'Mahmud Y.', status: 'approved', requestedAt: '2024-12-05' },
  { id: '4', playerId: '9', userId: 'u4', userName: 'Pius Amaechi', status: 'rejected', requestedAt: '2024-12-01' },
];

export const SUSPENSIONS: Suspension[] = [
  { id: '1', playerId: '9', reason: 'Red card accumulation', startDate: '2024-12-14', endDate: '2024-12-28', matchesBanned: 2, matchesServed: 0 },
  { id: '2', playerId: '4', reason: 'Yellow card threshold', startDate: '2024-12-07', endDate: '2024-12-14', matchesBanned: 1, matchesServed: 1 },
];

export const getTeamById = (id: string) => TEAMS.find(t => t.id === id);
export const getPlayerById = (id: string) => PLAYERS.find(p => p.id === id);
export const getFixtureById = (id: string) => FIXTURES.find(f => f.id === id);
export const getPlayersByTeam = (teamId: string) => PLAYERS.filter(p => p.teamId === teamId);
export const getGoalDiff = (team: Team) => team.goalsFor - team.goalsAgainst;