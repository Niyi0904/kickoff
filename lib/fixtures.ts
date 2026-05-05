/**
 * lib/fixtures.ts
 *
 * Pure utility functions for fixture generation.
 * No React, no hooks, no side effects — fully testable.
 * Used by: app/matches/page.tsx, and any future fixture-related features.
 */

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface FixtureTeam {
  id: string;
  name: string;
}

export interface GeneratedFixture {
  homeTeamId:    string;
  awayTeamId:    string;
  homeScore:     number;
  awayScore:     number;
  homeAssists:   number;
  awayAssists:   number;
  homeYellows:   number;
  awayYellows:   number;
  homeReds:      number;
  awayReds:      number;
  minutesPlayed: number;
  matchDay:      number;
  scheduledDate: string;
  time:          string;
  league:        string;
  status:        'upcoming';
}

// ─────────────────────────────────────────────
// Day-of-week name → JS day number (0 = Sunday)
// ─────────────────────────────────────────────
const DAY_NAME_TO_NUMBER: Record<string, number> = {
  sunday:    0,
  monday:    1,
  tuesday:   2,
  wednesday: 3,
  thursday:  4,
  friday:    5,
  saturday:  6,
};

/**
 * Get the next N occurrences of a given weekday, starting from a date.
 *
 * @param count     - How many dates to generate
 * @param matchDay  - Day name e.g. "Tuesday" (from league settings)
 * @param fromDate  - ISO date string to start from (defaults to today)
 * @returns Array of ISO date strings e.g. ["2026-05-06", "2026-05-13"]
 */
export function getNextMatchDays(
  count: number,
  matchDay: string = 'Tuesday',
  fromDate?: string
): string[] {
  const targetDay = DAY_NAME_TO_NUMBER[matchDay.toLowerCase()] ?? 2; // default Tuesday
  const dates: string[] = [];
  const d = fromDate ? new Date(fromDate) : new Date();

  // Advance to the next occurrence of targetDay.
  // If fromDate lands exactly on targetDay, we still move forward 7 days
  // so we don't re-generate fixtures on the same week.
  const daysUntilNext = ((7 - d.getDay() + targetDay) % 7) || 7;
  d.setDate(d.getDate() + daysUntilNext);

  for (let i = 0; i < count; i++) {
    dates.push(new Date(d).toISOString().split('T')[0]);
    d.setDate(d.getDate() + 7);
  }

  return dates;
}

/**
 * Fisher-Yates shuffle — returns a new shuffled array, never mutates input.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate round-robin fixtures for a set of teams.
 *
 * @param teams       - Array of teams to schedule
 * @param weekCount   - Number of match weeks to generate
 * @param startWeek   - Match day number to start from (default 1)
 * @param matchDay    - Day of week for fixtures e.g. "Tuesday" (from settings)
 * @param defaultTime - Default kick-off time e.g. "10:00" (from settings)
 * @param startDate   - ISO date to generate dates from (optional)
 * @param leagueName  - League name shown on match cards (from settings)
 * @returns Array of fixture objects ready to pass to addMatchesBatch()
 */
export function generateFixtures(
  teams:       FixtureTeam[],
  weekCount:   number,
  startWeek:   number   = 1,
  matchDay:    string   = 'Tuesday',
  defaultTime: string   = '10:00',
  startDate?:  string,
  leagueName:  string   = 'Seasonal League'
): GeneratedFixture[] {
  const fixtures: GeneratedFixture[] = [];
  const teamList = [...teams];

  // Round-robin requires an even number of teams — add a BYE if odd
  if (teamList.length % 2 !== 0) {
    teamList.push({ id: 'bye', name: 'BYE' });
  }

  const numTeams  = teamList.length;
  const matchDays = getNextMatchDays(weekCount, matchDay, startDate);

  // Spread matches across common time slots
  const timeSlots = ['8:00', '10:00', '12:00', '14:00'];

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
    const scheduledDate  = matchDays[weekIndex];
    const shuffledTimes  = shuffle(timeSlots);
    let matchInWeek      = 0;

    for (let i = 0; i < numTeams / 2; i++) {
      let home = teamList[i];
      let away = teamList[numTeams - 1 - i];

      // Alternate home/away each week for fairness
      if (weekIndex % 2 === 1) [home, away] = [away, home];

      // Skip BYE matchups
      if (home.id === 'bye' || away.id === 'bye') continue;

      fixtures.push({
        homeTeamId:    home.id,
        awayTeamId:    away.id,
        homeScore:     0,
        awayScore:     0,
        homeAssists:   0,
        awayAssists:   0,
        homeYellows:   0,
        awayYellows:   0,
        homeReds:      0,
        awayReds:      0,
        minutesPlayed: 90,
        matchDay:      startWeek + weekIndex,
        scheduledDate,
        time:          shuffledTimes[matchInWeek % shuffledTimes.length] || defaultTime,
        league:        leagueName,
        status:        'upcoming',
      });

      matchInWeek++;
    }

    // Rotate teams for round-robin scheduling (keep first team fixed)
    teamList.splice(1, 0, teamList.pop()!);
  }

  return fixtures;
}

/**
 * Format a 24h time string to 12h format.
 * e.g. "14:30" → "2:30 PM"
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h    = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}