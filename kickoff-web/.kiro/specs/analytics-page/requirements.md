# Requirements Document

## Introduction

The Analytics & Insights page is a new route (`/analytics`) in the Kickoff web app that consolidates league-wide statistical data into a single dark-themed dashboard. It gives league managers, team managers, and players a bird's-eye view of the season through six information widgets: quick stat cards, a league table, top scorers, team form, possession estimates, and a goals-per-matchday chart. All data is derived client-side from the existing Firestore collections already consumed by `useAppContext()` — no new backend endpoints are needed. The page is added to the existing `Sidebar` navigation component alongside the other main routes.

---

## Glossary

- **Analytics_Page**: The React page component rendered at the `/analytics` route.
- **AppContext**: The `useAppContext()` hook that exposes `teams`, `players`, `matches`, `goals`, `assists`, `yellowCards`, `redCards`, `standings`, `topScorers`, and `getPlayerStats()`.
- **Match**: A Firestore document from the `matches` collection with fields `id`, `matchDay`, `homeTeamId`, `awayTeamId`, `homeScore`, `awayScore`, `homeYellows`, `awayYellows`, `homeReds`, `awayReds`, `status` (`'upcoming'|'played'`), `scheduledDate`.
- **PlayerEvent**: A Firestore document from the `goals`, `assists`, `yellow_cards`, or `red_cards` collections with fields `id`, `playerId`, `matchId`, `matchDay`, `teamId`, `timestamp`.
- **Played_Match**: A Match whose `status` field equals `'played'`.
- **Clean_Sheet**: A Played_Match in which a team conceded zero goals — i.e., the team was home and `awayScore === 0`, or the team was away and `homeScore === 0`. Both teams earn a clean sheet in a 0-0 draw.
- **Team_Form**: The ordered sequence of results (`W`, `D`, or `L`) for the last five Played_Matches for a given team, ordered by ascending `matchDay`.
- **Goals_Per_Matchday**: The total count of goals scored across all teams in each matchday, derived by summing `homeScore + awayScore` for every Played_Match on that matchday.
- **Possession_Estimate**: A synthetic per-team possession percentage derived from available data (goals for, matches played) — because possession is not stored in Firestore. Marked visually as estimated.
- **Sidebar**: The `components/Sidebar.tsx` navigation component shared across all authenticated pages.
- **Widget**: A self-contained card component within the Analytics_Page that visualises one category of data.
- **ProtectedRoute**: The `<ProtectedRoute>` wrapper component used by authenticated pages to redirect unauthenticated users.

---

## Requirements

### Requirement 1: Route and Navigation

**User Story:** As a league member, I want an Analytics & Insights page accessible from the sidebar, so that I can navigate to it the same way I reach all other pages in the app.

#### Acceptance Criteria

1. THE Analytics_Page SHALL be accessible at the URL path `/analytics`.
2. THE Sidebar SHALL render a navigation link labelled "Analytics" using the `BarChart2` icon from lucide-react, inserted after the existing "Stats" link and before the "Standings" link in both the desktop `navItems` array and the mobile menu.
3. WHEN a user navigates to `/analytics` on desktop, THE Sidebar SHALL apply the styles `bg-primary/15 text-primary glow-green` to the Analytics link.
4. WHEN a user navigates to `/analytics` on mobile, THE Sidebar SHALL apply the styles `bg-primary/15 text-primary` (without `glow-green`) to the Analytics link, consistent with the mobile active-link pattern.
5. WHEN an unauthenticated user navigates to `/analytics`, THE Analytics_Page SHALL redirect the user to `/auth` via the `ProtectedRoute` wrapper.
6. THE Analytics_Page SHALL render within the existing `Sidebar` layout so that the sidebar and mobile header remain visible at all times.

---

### Requirement 2: Page Header

**User Story:** As a user, I want a clear page title and subtitle on the analytics page, so that I know what section of the app I am viewing.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render an `<h1>` element with the text "Analytics & Insights" and the classes `text-3xl lg:text-4xl font-bold text-foreground`.
2. THE Analytics_Page SHALL render a `<p>` element with the text "League-wide performance overview" and the class `text-muted-foreground mt-1`.
3. WHEN `loading` from AppContext is `true`, THE Analytics_Page SHALL render skeleton placeholder elements (using `animate-pulse bg-secondary/50 rounded-xl`) for each of the six widget sections, and SHALL NOT render any live widget content.
4. WHEN `loading` transitions from `true` to `false`, THE Analytics_Page SHALL replace all skeleton placeholders with the fully rendered widget content.

---

### Requirement 3: Quick Stat Cards

**User Story:** As a user, I want four summary stat cards at the top of the page, so that I can see the most important league totals at a glance.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render four stat cards labelled "Total Goals", "Total Assists", "Cards", and "Clean Sheets". On screens narrower than 768px, the cards SHALL be arranged in a single-column stack; on screens 768px and wider, they SHALL be arranged in a single 4-column row.
2. WHEN rendering the "Total Goals" card, THE Analytics_Page SHALL display `goals.length` where `goals` contains only events whose associated match has `status === 'played'` — equivalently, `goals.filter(g => matches.find(m => m.id === g.matchId)?.status === 'played').length`, which equals `matches.filter(m => m.status === 'played').reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)`.
3. WHEN rendering the "Total Assists" card, THE Analytics_Page SHALL display the count of `assists` events where the associated match has `status === 'played'`.
4. WHEN rendering the "Cards" card, THE Analytics_Page SHALL display the count of `yellowCards` events plus the count of `redCards` events where each event's associated match has `status === 'played'`.
5. WHEN rendering the "Clean Sheets" card, THE Analytics_Page SHALL display the total count of Clean_Sheets across all Played_Matches, derived as: for each Played_Match, add 1 if `awayScore === 0` (home team clean sheet) and add 1 if `homeScore === 0` (away team clean sheet), so a 0-0 draw contributes 2 to the total.
6. THE Analytics_Page SHALL render each stat card with an icon (`Target` for goals, `TrendingUp` for assists, `AlertTriangle` for cards, `Shield` for clean sheets from lucide-react), a label, and the numeric value, using the `glass-card` and `border-border/50` classes.
7. WHEN no Played_Matches exist, THE Analytics_Page SHALL display `0` in each stat card without rendering an error state.

---

### Requirement 4: League Table Widget

**User Story:** As a user, I want a league table widget showing the current standings, so that I can see team rankings without navigating away from the analytics page.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render a League Table Widget that displays up to six teams from the `standings` array computed by AppContext.
2. THE League_Table_Widget SHALL display, for each team: position number, team name (with logo avatar), matches played (P), wins (W), draws (D), losses (L), goal difference (GD), and points (PTS).
3. THE League_Table_Widget SHALL display a maximum of six teams using `standings.slice(0, 6)`, preserving the sort order (descending points, then descending GD, then descending GF) already applied by the `standings` memoised value.
4. WHEN goal difference is positive, THE League_Table_Widget SHALL prefix the GD value with `+`. WHEN goal difference is zero, no prefix SHALL be shown. WHEN goal difference is negative, the natural `-` sign SHALL be shown.
5. WHEN positions 1–3 are rendered, THE League_Table_Widget SHALL apply `text-primary` to the position number element. WHEN positions 4–6 are rendered, THE League_Table_Widget SHALL apply `text-muted-foreground` to the position number element.
6. IF the `standings` array is empty, THEN THE League_Table_Widget SHALL render a `<p>` element with the text "No matches played yet".
7. THE League_Table_Widget SHALL include a link with the text "View Full Table" that navigates to `/standings`.

---

### Requirement 5: Top Scorers Widget

**User Story:** As a user, I want a top scorers widget showing the leading goal-scorers with a visual bar, so that I can quickly compare player goal tallies.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render a Top Scorers Widget that displays up to five players ranked by goal count, using `topScorers.slice(0, 5)` from AppContext (already sorted descending by goals).
2. THE Top_Scorers_Widget SHALL display, for each player: rank position (1-based index), player name, team abbreviation, a horizontal progress bar, and the goal count.
3. THE Top_Scorers_Widget SHALL set the bar width using `(scorer.stats.goals / maxGoals) * 100` percent, where `maxGoals = topScorers[0]?.stats.goals ?? 1`. All players sharing the maximum goal count SHALL receive a 100% bar width.
4. WHEN `topScorers` is empty OR all entries have `stats.goals === 0`, THE Top_Scorers_Widget SHALL render a `<p>` element with the text "No goals recorded yet" and SHALL NOT render any player rows.
5. THE Top_Scorers_Widget SHALL render each player name inside a `<Link href={/players/${player.id}}>` element.
6. THE Top_Scorers_Widget SHALL apply the following colour to the rank position indicator: position 1 → `#F5C842` (gold), position 2 → `#94A3B8` (silver), position 3 → `#CD7F32` (bronze), positions 4–5 → `text-muted-foreground`.
7. WHEN `topScorers` is `undefined` or `null`, THE Top_Scorers_Widget SHALL render the empty-state message and SHALL NOT throw a runtime error.

---

### Requirement 6: Team Form Widget

**User Story:** As a user, I want a team form widget showing the last five results per team, so that I can assess which teams are in good or poor form.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render a Team Form Widget listing all teams, sorted alphabetically ascending by team name, that have played at least one Played_Match.
2. THE Team_Form_Widget SHALL derive each team's Team_Form by: (a) filtering `matches` where `status === 'played'` AND (`homeTeamId === teamId` OR `awayTeamId === teamId`) AND both `homeScore` and `awayScore` are non-null numeric values; (b) sorting by `matchDay` ascending, with `id` ascending as a secondary tie-breaker; (c) taking the last five entries; (d) mapping each to `W`, `D`, or `L` based on the team's side and score.
3. WHEN fewer than five Played_Matches exist for a team, THE Team_Form_Widget SHALL display only the available results without padding or placeholder badges.
4. THE Team_Form_Widget SHALL render each result as a coloured badge: `W` with `bg-green-500/20 text-green-400`, `D` with `bg-yellow-500/20 text-yellow-400`, `L` with `bg-red-500/20 text-red-400`.
5. THE Team_Form_Widget SHALL display overall league percentages — win %, draw %, and loss % — calculated across all Played_Matches, where total outcomes = 2 × playedMatches.length, wins = (playedMatches where homeScore ≠ awayScore) × 2, draws = (playedMatches where homeScore === awayScore) × 2. Each percentage SHALL be rounded to the nearest whole number.
6. IF no Played_Matches exist, THEN THE Team_Form_Widget SHALL render a `<p>` element with the text "No matches played yet".

---

### Requirement 7: Possession Widget

**User Story:** As a user, I want a possession widget showing an estimated possession percentage per team, so that I can gauge attacking and controlling tendencies even though raw possession time is not tracked.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render a Possession Widget that displays a per-team possession estimate as a labelled horizontal bar showing the percentage value as a whole number.
2. THE Possession_Widget SHALL derive the Possession_Estimate using: `rawScore = (team.gf / totalGoalsInTeamMatches) * 50 + 50 * (team.played / maxPlayedByAnyTeam)`, where `totalGoalsInTeamMatches` is the sum of `homeScore + awayScore` for all matches in which the team participated and `maxPlayedByAnyTeam = Math.max(...standings.map(t => t.played))`. WHEN `totalGoalsInTeamMatches === 0`, raw score SHALL default to `50`. WHEN `maxPlayedByAnyTeam === 0`, raw score SHALL default to `50`. The final estimate for each team SHALL be normalised: `estimate = (rawScore / sumOfAllRawScores) * 50 * numberOfTeams`, expressed as a percentage rounded to the nearest whole number.
3. THE Possession_Widget SHALL render a `<p>` element with the text "Estimated — possession data not tracked" in `text-muted-foreground text-xs` at the top of the widget.
4. THE Possession_Widget SHALL colour each bar using the team's `primaryColor` from the `teams` collection. WHEN a team's `primaryColor` is null or empty, the bar SHALL fall back to `hsl(var(--primary))`.
5. THE Possession_Widget SHALL sort teams by descending possession estimate. WHEN two teams share the same estimate, they SHALL be sorted alphabetically ascending by team name as a tie-breaker.
6. IF no Played_Matches exist, THEN THE Possession_Widget SHALL render the disclaimer label from criterion 3 and a `<p>` element with the text "No data available yet", and SHALL NOT render any team bars.

---

### Requirement 8: Goals Per Matchday Chart

**User Story:** As a user, I want a goals-per-matchday chart showing scoring trends over the season, so that I can see whether matches are becoming more or less prolific.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render a Goals Per Matchday Chart using the `BarChart` component from the `recharts` library.
2. THE Goals_Per_Matchday_Chart SHALL derive its data by grouping Played_Matches by `matchDay`, summing `homeScore + awayScore` per group, producing an array of `{ matchDay: number, goals: number }` sorted by ascending `matchDay`.
3. THE Goals_Per_Matchday_Chart SHALL render an X-axis with tick labels formatted as `"MD N"` (e.g. "MD 1", "MD 2") and a Y-axis with integer-only ticks (suppressing fractional tick values using `tickFormatter: (v) => Number.isInteger(v) ? String(v) : ""`).
4. THE Goals_Per_Matchday_Chart SHALL wrap the chart in a `ResponsiveContainer` with `width="100%"` so it fills its parent container width on all screen sizes.
5. THE Goals_Per_Matchday_Chart SHALL use `hsl(var(--primary))` as the fill colour for bars, `rgba(255,255,255,0.1)` as the stroke colour for `CartesianGrid` lines, and `rgba(255,255,255,0.1)` as the stroke colour for both axes.
6. THE Goals_Per_Matchday_Chart SHALL render a `Tooltip` with a `bg-card` background and content formatted as "Matchday N — Y goals".
7. IF fewer than two matchdays of data exist, THE Goals_Per_Matchday_Chart SHALL render the chart with the available data and SHALL NOT display an error state.
8. IF no Played_Matches exist, THE Goals_Per_Matchday_Chart SHALL render a `<p>` element with the text "No match data yet" and SHALL NOT render the chart components.

---

### Requirement 9: Responsive Layout

**User Story:** As a user on any device, I want the analytics page to be usable on both desktop and mobile, so that I can check stats from my phone as well as on a larger screen.

#### Acceptance Criteria

1. THE Analytics_Page SHALL render the four quick stat cards in a single-column stack on screens narrower than 768px, and in a 4-column row on screens 768px and wider.
2. THE Analytics_Page SHALL render the League Table Widget and Top Scorers Widget stacked in a single column on screens narrower than 1024px, and side-by-side in a 2-column grid on screens 1024px and wider.
3. THE Analytics_Page SHALL render the Team Form Widget and Possession Widget stacked in a single column on screens narrower than 1024px, and side-by-side in a 2-column grid on screens 1024px and wider.
4. THE Goals_Per_Matchday_Chart SHALL span the full available content width on all screen sizes.
5. THE Analytics_Page SHALL prevent horizontal overflow by applying `overflow-x-hidden` to its root container element.
6. THE Analytics_Page SHALL apply sufficient bottom padding so that widget content is not obscured by any bottom navigation bar on mobile devices.

---

### Requirement 10: Empty and Loading States

**User Story:** As a user, I want the analytics page to handle missing data gracefully, so that the page never crashes or shows broken UI when the league is new or data is sparse.

#### Acceptance Criteria

1. WHEN `loading` from AppContext is `true`, THE Analytics_Page SHALL render skeleton placeholders for all eight sections: the four stat-card slots, the League Table Widget, the Top Scorers Widget, the Team Form Widget, and the Possession Widget. No live widget content SHALL render while `loading` is `true`.
2. WHEN `loading` is `false` and no matches with `status === 'played'` exist, THE Analytics_Page SHALL render the League Table Widget, Top Scorers Widget, Team Form Widget, and Possession Widget each displaying their respective empty-state `<p>` messages, and SHALL NOT throw a runtime error.
3. WHEN `loading` is `false` and `teams` is an empty array, THE Analytics_Page SHALL render empty-state `<p className="text-center py-8 text-muted-foreground text-sm">` messages in the League Table Widget, Team Form Widget, and Possession Widget without crashing.
4. THE Analytics_Page SHALL NOT make any direct Firestore calls — it SHALL derive all data exclusively from AppContext state to avoid duplicate subscriptions.

---

### Requirement 11: Styling and Theme Consistency

**User Story:** As a user, I want the analytics page to look and feel like the rest of the Kickoff app, so that the experience is coherent and polished.

#### Acceptance Criteria

1. THE Analytics_Page SHALL use the `glass-card` CSS class on all widget container elements.
2. THE Analytics_Page SHALL use `border-border/50` for widget borders and `bg-background` as the page background.
3. WHEN a widget enters the viewport, THE Analytics_Page SHALL animate it using framer-motion with `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, and a `transition` of `{ duration: 0.3, delay: N * 0.1 }` where N is the widget's zero-based index in render order (0 for the stat cards row, 1 for the League Table, 2 for Top Scorers, 3 for Team Form, 4 for Possession, 5 for Goals Chart).
4. THE Analytics_Page SHALL use `text-muted-foreground` for supporting and descriptive text (labels, subtitles, units, disclaimers) and `text-foreground` for numeric data values and headings.
5. THE Analytics_Page SHALL NOT introduce any third-party UI libraries not already present in the project's `package.json`.
