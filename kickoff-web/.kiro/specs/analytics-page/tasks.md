# Implementation Plan: Analytics & Insights Page

## Overview

Build the `/analytics` route as a client-side dashboard that derives all data from `useAppContext()`. The implementation touches one existing file (`components/Sidebar.tsx`) and creates one new file (`app/analytics/page.tsx`). All widget components live as inner functions inside the page file, following the same pattern as `app/standings/page.tsx`.

---

## Tasks

- [x] 1. Add Analytics nav link to Sidebar
  - [x] 1.1 Import `BarChart2` from lucide-react and insert the Analytics navItem
    - Add `BarChart2` to the existing `import { ..., Globe2 } from "lucide-react"` block in `components/Sidebar.tsx`
    - Insert `{ path: "/analytics", label: "Analytics", icon: BarChart2 }` into the `navItems` array after the Stats entry and before the Standings entry
    - The existing active-link logic already handles the new path for both desktop (`glow-green`) and mobile (no `glow-green`) — no further changes needed
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Scaffold the page route and skeleton
  - [x] 2.1 Create `app/analytics/page.tsx` with `AnalyticsPage`, `AnalyticsContent`, and `AnalyticsSkeleton`
    - Add `'use client'` directive
    - Implement `AnalyticsPage` as the default export wrapping `<ProtectedRoute><AnalyticsContent /></ProtectedRoute>` — identical pattern to `StandingsPage`
    - Implement `AnalyticsSkeleton` with `animate-pulse bg-secondary/50 rounded-xl` blocks mirroring the live layout: header (h-10 + h-5), 4 stat-card slots (`grid grid-cols-1 md:grid-cols-4`), two 2-column rows of `h-72` blocks, and a full-width `h-64` chart block
    - Stub `AnalyticsContent` to call `useAppContext()`, return `<AnalyticsSkeleton />` while `loading` is true, and render an empty `<div className="space-y-8 overflow-x-hidden pb-20">` otherwise
    - Import `ProtectedRoute`, `useAppContext`, and `motion` from framer-motion
    - _Requirements: 1.1, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 10.1_

- [x] 3. Implement data derivation hooks in `AnalyticsContent`
  - [x] 3.1 Add `playedMatches` and `playedMatchIds` memos
    - `playedMatches = useMemo(() => matches.filter(m => m.status === 'played'), [matches])`
    - `playedMatchIds = useMemo(() => new Set(playedMatches.map(m => m.id)), [playedMatches])`
    - These are the shared base used by every downstream derivation
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  - [x] 3.2 Add stat-card value memos (`totalGoals`, `totalAssists`, `totalCards`, `totalCleanSheets`)
    - `totalGoals`: `playedMatches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)`
    - `totalAssists`: `assists.filter(a => playedMatchIds.has(a.matchId)).length`
    - `totalCards`: yellow + red counts filtered via `playedMatchIds`
    - `totalCleanSheets`: per-match — add 1 if `awayScore === 0`, add 1 if `homeScore === 0` (0-0 contributes 2)
    - Assemble `statCards: StatCardData[]` array inline with `Target`, `TrendingUp`, `AlertTriangle`, `Shield` icons
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [x] 3.3 Add `goalsPerMatchday` memo
    - Group `playedMatches` by `matchDay`, sum `homeScore + awayScore` per group, return array of `{ matchDay, goals }` sorted ascending by `matchDay`
    - _Requirements: 8.2_
  - [x] 3.4 Add `teamFormEntries` and `leagueSummary` memos
    - `teamFormEntries`: for each team, filter `playedMatches` by team participation and non-null scores, sort by `matchDay` asc then `id` asc, take last 5, map to `W`/`D`/`L`, keep only entries with `form.length > 0`, sort alphabetically
    - `leagueSummary`: compute `winPct`, `drawPct`, `lossPct` from `playedMatches.length * 2` total outcomes; `winPct === lossPct` always
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  - [x] 3.5 Add `possessionEntries` memo
    - Compute `maxPlayed`, build `teamMatchGoals` map, calculate raw scores using the formula from Requirement 7.2, normalise to `(raw / sumRaw) * 50 * n`, round to nearest integer, fall back to `50` when `totalGoalsInTeamMatches === 0` or `maxPlayed === 0`
    - Resolve team `color` from `teams.find(t => t.id === ...)?.primaryColor || 'hsl(var(--primary))'`
    - Sort by descending estimate, then ascending team name
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_

- [~] 4. Checkpoint — verify derivations
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement `StatCards` widget
  - [-] 5.1 Write the `StatCards` inner function
    - Props: `cards: StatCardData[]`, `animationDelay: number`
    - Wrap in `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: animationDelay }}>`
    - Render `<div className="grid grid-cols-1 md:grid-cols-4 gap-4">` containing four cards
    - Each card: `glass-card rounded-2xl border border-border/50 p-5` with the icon, label (`text-muted-foreground`), and value (`text-foreground font-bold text-3xl`)
    - When `playedMatches.length === 0`, all values are `0` — no special empty-state needed
    - Wire into `AnalyticsContent` at widget index N=0 (`animationDelay={0}`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.1, 11.1, 11.2, 11.3, 11.4_
  - [~] 5.2 Write property test for stat-card derivations
    - **Property 1: Goals consistency** — `totalGoals === playedMatches.reduce((s, m) => s + m.homeScore + m.awayScore, 0)` for any generated input
    - **Property 2: Clean sheets non-negative** — `totalCleanSheets >= 0` for any input
    - **Property 3: Clean sheets double-count** — a match with `homeScore=0, awayScore=0` contributes exactly 2
    - Use fast-check arbitraries for match arrays; extract the derivation functions as pure utilities for testing
    - **Validates: Requirements 3.2, 3.5**

- [ ] 6. Implement `LeagueTableWidget`
  - [-] 6.1 Write the `LeagueTableWidget` inner function
    - Props: `standings` (from `useAppContext`), `animationDelay: number`
    - Render `standings.slice(0, 6)` rows with: position (1-based), team name + logo avatar, P, W, D, L, GD (prefixed `+` when positive, no prefix at zero, natural `-` when negative), PTS
    - Position colour: index < 3 → `text-primary`, else → `text-muted-foreground`
    - Empty state: `standings.length === 0` → `<p>No matches played yet</p>`
    - Include `<Link href="/standings">View Full Table</Link>`
    - Wire into `AnalyticsContent` at widget index N=1 (`animationDelay={0.1}`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 11.1, 11.2, 11.3_

- [ ] 7. Implement `TopScorersWidget`
  - [-] 7.1 Write the `TopScorersWidget` inner function
    - Props: `topScorers` (from `useAppContext`), `animationDelay: number`
    - Slice to `topScorers.slice(0, 5)`; compute `maxGoals = displayScorers[0]?.stats.goals ?? 1`
    - For each scorer: 1-based rank (coloured gold/silver/bronze/muted per rank), `<Link href={/players/${player.id}}>{player.name}</Link>`, team abbreviation, horizontal progress bar at `(goals / maxGoals) * 100%`, goal count
    - Bar width must be in `[0, 100]` — no divide-by-zero via the `?? 1` default
    - Empty/zero state: `topScorers` empty or all goals = 0 → `<p>No goals recorded yet</p>`
    - Handle `undefined`/`null` `topScorers` without throwing
    - Wire into `AnalyticsContent` at widget index N=2 (`animationDelay={0.2}`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.1, 11.2, 11.3_
  - [~] 7.2 Write property test for top-scorer bar width
    - **Property 5: Top scorers bar width** — for any generated `topScorers` array with numeric goal counts, every bar width is in `[0, 100]`
    - **Validates: Requirements 5.3**

- [ ] 8. Implement `TeamFormWidget`
  - [-] 8.1 Write the `TeamFormWidget` inner function
    - Props: `formEntries: TeamFormEntry[]`, `winPct: number`, `drawPct: number`, `lossPct: number`, `animationDelay: number`
    - Render each team's row with name and up to 5 form badges: `W` → `bg-green-500/20 text-green-400`, `D` → `bg-yellow-500/20 text-yellow-400`, `L` → `bg-red-500/20 text-red-400`
    - Show league-wide win/draw/loss percentages below the form rows
    - Empty state: `formEntries.length === 0` → `<p>No matches played yet</p>`
    - Wire into `AnalyticsContent` at widget index N=3 (`animationDelay={0.3}`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.1, 11.2, 11.3_
  - [~] 8.2 Write property tests for `TeamFormWidget` derivations
    - **Property 6: Form length** — `entry.form.length <= 5` for all generated team+match combinations
    - **Property 8: League win/loss parity** — `leagueSummary.winPct === leagueSummary.lossPct` for any set of played matches
    - **Validates: Requirements 6.2, 6.5**

- [ ] 9. Implement `PossessionWidget`
  - [-] 9.1 Write the `PossessionWidget` inner function
    - Props: `entries: PossessionEntry[]`, `animationDelay: number`
    - Render disclaimer `<p className="text-muted-foreground text-xs">Estimated — possession data not tracked</p>` at the top of the widget unconditionally
    - For each entry: team name, labelled horizontal bar coloured with `entry.color`, percentage value as whole number
    - Empty state: `entries.length === 0` → disclaimer + `<p>No data available yet</p>`, no bars
    - Wire into `AnalyticsContent` at widget index N=4 (`animationDelay={0.4}`)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 11.1, 11.2, 11.3_
  - [~] 9.2 Write property test for possession derivation
    - **Property 4: Possession sums** — `possessionEntries.reduce((s, e) => s + e.estimate, 0)` ≈ `50 * n` (within ±n due to integer rounding) for any non-empty standings array
    - **Validates: Requirements 7.2**

- [ ] 10. Implement `GoalsChartWidget`
  - [ ] 10.1 Write the `GoalsChartWidget` inner function
    - Props: `data: MatchdayGoalDatum[]`, `animationDelay: number`
    - Empty state: `data.length === 0` → `<p className="text-center py-10 text-muted-foreground text-sm">No match data yet</p>`, no chart rendered
    - When data exists, render recharts `<ResponsiveContainer width="100%" height={240}><BarChart ...>`
    - X-axis: `tickFormatter={(v) => \`MD \${v}\`}`, stroke `rgba(255,255,255,0.1)`, muted foreground tick fill
    - Y-axis: `allowDecimals={false}`, `tickFormatter={(v) => Number.isInteger(v) ? String(v) : ''}`, width `30`
    - `<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />`
    - `<Bar dataKey="goals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />`
    - `<Tooltip>` with `bg-card` background, border from `hsl(var(--border))`, content `"N goals"` / label `"Matchday N"`
    - Wire into `AnalyticsContent` at widget index N=5 (`animationDelay={0.5}`)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 11.1, 11.2, 11.3_
  - [~] 10.2 Write property test for `goalsPerMatchday` derivation
    - **Property 7: Matchday goals sorted** — for any generated array of played matches, the output is sorted ascending by `matchDay` with no duplicate `matchDay` keys
    - **Validates: Requirements 8.2**

- [ ] 11. Assemble responsive layout and wire all widgets
  - [~] 11.1 Compose the full `AnalyticsContent` return JSX
    - Page header: `<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>` wrapping `<h1 className="text-3xl lg:text-4xl font-bold text-foreground">Analytics & Insights</h1>` and `<p className="text-muted-foreground mt-1">League-wide performance overview</p>`
    - Stat cards row: `<StatCards cards={statCards} animationDelay={0} />`
    - `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">` containing `<LeagueTableWidget>` (delay 0.1) and `<TopScorersWidget>` (delay 0.2)
    - `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">` containing `<TeamFormWidget>` (delay 0.3) and `<PossessionWidget>` (delay 0.4)
    - `<GoalsChartWidget data={goalsPerMatchday} animationDelay={0.5} />` as a full-width block
    - Root container: `className="space-y-8 overflow-x-hidden pb-20"`
    - _Requirements: 1.6, 2.1, 2.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 11.3_

- [~] 12. Checkpoint — full integration check
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design document has a Correctness Properties section — property tests are included for Properties 1, 2, 3, 4, 5, 6, 7, and 8 (Properties 9 and 10 are structural invariants enforced by code review, not runtime tests)
- Pure derivation functions should be extracted alongside their `useMemo` call so fast-check tests can import them directly without mounting a React component
- All widget inner functions are co-located in `app/analytics/page.tsx`; if the file exceeds ~400 lines they may optionally be split into `app/analytics/_components/` — that is an implementation-time call
- The `ProtectedRoute` pattern is identical to `app/standings/page.tsx` — use it as the reference

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5"] },
    { "id": 3, "tasks": ["5.1", "6.1", "7.1", "8.1", "9.1", "10.1"] },
    { "id": 4, "tasks": ["5.2", "7.2", "8.2", "9.2", "10.2", "11.1"] },
    { "id": 5, "tasks": [] }
  ]
}
```
