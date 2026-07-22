export interface Team {
  id: string;
  name: string;
  color: string;
  logo: string | null;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'played' | 'scheduled';
  scheduledDate: string;
  matchDay: number;
  venue: string;
  time: string;
}

export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
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
}

export interface League {
  id: string;
  name: string;
  slug: string;
  seasonName: string;
  venue: string;
  teams: Team[];
  matches: Match[];
}

// Focus Baller teams (seeded data)
const FOCUS_TEAMS: Team[] = [
  { id: 'big6', name: 'Big6', color: '#3b82f6', logo: null },
  { id: 'expoundia', name: 'EXPOUNDIA FC', color: '#2a7b4f', logo: null },
  { id: 'bolistic', name: 'BOLISTIC FC', color: '#3b82f6', logo: null },
  { id: 'shelter', name: 'SHELTER FC', color: '#2a7b4f', logo: null },
  { id: 'foz', name: 'FOZ FC', color: '#00ff00', logo: null },
  { id: 'page3pro', name: 'Page3Pro FC', color: '#f73b3b', logo: null },
];

const teamId = (short: string) => short;

// Focus Baller matches
const FOCUS_MATCHES: Match[] = [
  { id: 'm1', homeTeamId: teamId('big6'), awayTeamId: teamId('expoundia'), homeScore: 2, awayScore: 1, status: 'played', scheduledDate: '2026-06-06', matchDay: 1, venue: 'Surulere Stadium', time: '10:00' },
  { id: 'm2', homeTeamId: teamId('bolistic'), awayTeamId: teamId('shelter'), homeScore: 0, awayScore: 0, status: 'played', scheduledDate: '2026-06-06', matchDay: 1, venue: 'Surulere Stadium', time: '12:00' },
  { id: 'm3', homeTeamId: teamId('foz'), awayTeamId: teamId('page3pro'), homeScore: 3, awayScore: 1, status: 'played', scheduledDate: '2026-06-06', matchDay: 1, venue: 'Surulere Stadium', time: '14:00' },
  { id: 'm4', homeTeamId: teamId('expoundia'), awayTeamId: teamId('bolistic'), homeScore: 1, awayScore: 1, status: 'played', scheduledDate: '2026-06-13', matchDay: 2, venue: 'Surulere Stadium', time: '10:00' },
  { id: 'm5', homeTeamId: teamId('shelter'), awayTeamId: teamId('foz'), homeScore: 2, awayScore: 2, status: 'played', scheduledDate: '2026-06-13', matchDay: 2, venue: 'Surulere Stadium', time: '12:00' },
  { id: 'm6', homeTeamId: teamId('page3pro'), awayTeamId: teamId('big6'), homeScore: 0, awayScore: 4, status: 'played', scheduledDate: '2026-06-13', matchDay: 2, venue: 'Surulere Stadium', time: '14:00' },
  { id: 'm7', homeTeamId: teamId('big6'), awayTeamId: teamId('bolistic'), homeScore: null, awayScore: null, status: 'scheduled', scheduledDate: '2026-07-28', matchDay: 3, venue: 'Surulere Stadium', time: '10:00' },
  { id: 'm8', homeTeamId: teamId('expoundia'), awayTeamId: teamId('foz'), homeScore: null, awayScore: null, status: 'scheduled', scheduledDate: '2026-07-28', matchDay: 3, venue: 'Surulere Stadium', time: '12:00' },
  { id: 'm9', homeTeamId: teamId('shelter'), awayTeamId: teamId('page3pro'), homeScore: null, awayScore: null, status: 'scheduled', scheduledDate: '2026-07-28', matchDay: 3, venue: 'Surulere Stadium', time: '14:00' },
];

function buildStandings(teams: Team[], matches: Match[], ptsWin = 3, ptsDraw = 1, ptsLoss = 0): StandingRow[] {
  const table = new Map<string, StandingRow>();
  teams.forEach((t) => table.set(t.id, { position: 0, teamId: t.id, teamName: t.name, color: t.color, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] }));

  const played = matches.filter((m) => m.status === 'played');
  played.forEach((m) => {
    const home = table.get(m.homeTeamId);
    const away = table.get(m.awayTeamId);
    if (!home || !away) return;
    const hs = m.homeScore ?? 0;
    const as = m.awayScore ?? 0;
    home.played++; away.played++;
    home.gf += hs; home.ga += as;
    away.gf += as; away.ga += hs;
    if (hs > as) { home.won++; away.lost++; home.pts += ptsWin; away.pts += ptsLoss; home.form.push('W'); away.form.push('L'); }
    else if (hs < as) { away.won++; home.lost++; away.pts += ptsWin; home.pts += ptsLoss; away.form.push('W'); home.form.push('L'); }
    else { home.drawn++; away.drawn++; home.pts += ptsDraw; away.pts += ptsDraw; home.form.push('D'); away.form.push('D'); }
  });

  return Array.from(table.values())
    .map((r) => ({ ...r, gd: r.gf - r.ga, form: r.form.slice(-5) }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.teamName.localeCompare(b.teamName))
    .map((r, i) => ({ ...r, position: i + 1 }));
}

function computeFormattedStandings(standings: StandingRow[]) {
  return standings;
}

export const FOCUS_BALLER: League = {
  id: 'focus-baller',
  name: 'Focus Baller',
  slug: 'focus-baller',
  seasonName: '2026/27 League',
  venue: 'Surulere Stadium',
  teams: FOCUS_TEAMS,
  matches: FOCUS_MATCHES,
};

export const FOCUS_STANDINGS = buildStandings(FOCUS_TEAMS, FOCUS_MATCHES);

// Nidav Baller (second league)
const NIDAV_TEAMS: Team[] = [
  { id: 'n1', name: 'FC Phoenix', color: '#ff6b35', logo: null },
  { id: 'n2', name: 'Lagos City', color: '#004e98', logo: null },
  { id: 'n3', name: 'Unity FC', color: '#2d6a4f', logo: null },
  { id: 'n4', name: 'Coastal Stars', color: '#7b2d8e', logo: null },
];

const NIDAV_MATCHES: Match[] = [
  { id: 'nm1', homeTeamId: 'n1', awayTeamId: 'n2', homeScore: 3, awayScore: 2, status: 'played', scheduledDate: '2026-06-08', matchDay: 1, venue: 'Teslim Balogun Stadium', time: '15:00' },
  { id: 'nm2', homeTeamId: 'n3', awayTeamId: 'n4', homeScore: 1, awayScore: 0, status: 'played', scheduledDate: '2026-06-08', matchDay: 1, venue: 'Teslim Balogun Stadium', time: '17:00' },
  { id: 'nm3', homeTeamId: 'n2', awayTeamId: 'n3', homeScore: null, awayScore: null, status: 'scheduled', scheduledDate: '2026-07-29', matchDay: 2, venue: 'Teslim Balogun Stadium', time: '15:00' },
];

export const NIDAV_BALLER: League = {
  id: 'nidav-baller',
  name: 'Nidav Baller',
  slug: 'nidav-baller',
  seasonName: 'Summer 2026',
  venue: 'Teslim Balogun Stadium',
  teams: NIDAV_TEAMS,
  matches: NIDAV_MATCHES,
};

export const NIDAV_STANDINGS = buildStandings(NIDAV_TEAMS, NIDAV_MATCHES);
