# Mobile Migration Checklist

**Source of truth:** `team_management` (Next.js web)  
**Migration target:** `kickoffApp` (React Native / Expo)  
**Last updated:** 2026-06-03

Use this document to track parity during migration. Update status as work lands in `kickoffApp`.

| Status | Meaning |
|--------|---------|
| **Complete** | Feature works on mobile with comparable behavior |
| **Partial** | Started or read-only subset; gaps vs web |
| **Missing** | Not implemented in `kickoffApp` |

---

## Legend (quick counts)

| Status | Count |
|--------|------:|
| Complete | 8 |
| Partial | 7 |
| Missing | 52 |

---

## 1. Platform & infrastructure

| ID | Feature | Web (`team_management`) | Mobile (`kickoffApp`) | Status | Notes |
|----|---------|-------------------------|------------------------|--------|-------|
| INF-01 | Firebase Auth (email/password) | `app/hooks/useAuth.ts` | `src/firebase/auth.ts`, auth screens | **Complete** | Sign in / sign up |
| INF-02 | User profile document (`users`) | On sign-up + profile UI | Created on sign-up | **Complete** | No profile edit UI on mobile |
| INF-03 | User roles (`user_roles`) | `AuthContext` | `AuthContext` + role hooks | **Partial** | Roles loaded; no admin UI uses them |
| INF-04 | React Query data layer | `useAppData` + contexts | `useAppData` hooks | **Partial** | Read-only queries; no mutations |
| INF-05 | Split Auth / Data contexts | `AuthContext` + `DataContext` | Single `AuthContext` only | **Missing** | Optional optimization |
| INF-06 | Protected routes | `ProtectedRoute` | Auth gate in `RootNavigator` | **Complete** | |
| INF-07 | Toast / error feedback | `use-toast`, Toaster | `Alert.alert` only on auth | **Partial** | |
| INF-08 | Firestore collection naming parity | `yellow_cards`, `settings/league`, snake_case fields | `yellowCards` collection; generic `settings` query | **Partial** | Risk of empty/wrong data on mobile |
| INF-09 | Write / mutation APIs | Full CRUD in `useAppData` | None | **Missing** | Blocker for admin flows |

---

## 2. Authentication & session

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| AUTH-01 | Sign in | `SignInForm` | `SignInScreen` | **Complete** | |
| AUTH-02 | Sign up | `SignUpForm` | `SignUpScreen` | **Complete** | Mobile adds confirm password |
| AUTH-03 | Sign out | Sidebar / `UserProfileDropdown` | `signOutUser` exists, not in UI | **Missing** | |
| AUTH-04 | Role badges (league / team / player) | Sidebar | — | **Missing** | |
| AUTH-05 | Profile picture upload | `ProfilePictureUploadDialog` | — | **Missing** | |
| AUTH-06 | Invite-based onboarding | `lib/admin` + signup flow | — | **Missing** | |
| AUTH-07 | Post-login redirect / home routing | `/` → `/dashboard` | Tab navigator | **Complete** | Different structure, OK |

---

## 3. Navigation & shell

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| NAV-01 | Dashboard | `/` → dashboard | `DashboardScreen` tab | **Partial** | Subset of web widgets |
| NAV-02 | Teams | `/teams` | `TeamsScreen` tab | **Partial** | List only; detail nav broken |
| NAV-03 | Players | `/players` | — | **Missing** | No tab or screen |
| NAV-04 | Stats | `/stats` | `StatsScreen` tab | **Partial** | No search; separate Y/R vs combined cards tab |
| NAV-05 | Standings | `/standings` | `StandingsScreen` tab | **Complete** | No team logos |
| NAV-06 | Matches | `/matches` | `MatchesScreen` tab | **Partial** | Filter + list; detail nav broken |
| NAV-07 | Public league page | `/public-league` (unauthenticated layout) | — | **Missing** | |
| NAV-08 | My Profile (linked player) | `/my-profile` | — | **Missing** | |
| NAV-09 | Admin section | 5 admin routes in sidebar | — | **Missing** | |
| NAV-10 | Stack screens (team / player / match detail) | Dynamic routes | `navigate('TeamDetail'|'MatchDetail')` — routes not registered | **Missing** | Broken taps today |
| NAV-11 | User profile menu | `UserProfileDropdown` | — | **Missing** | |

---

## 4. Dashboard

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| DASH-01 | Season name from settings | `useLeagueSettings` | — | **Missing** | Hook exists, unused |
| DASH-02 | Stat cards (teams, players, goals, cards) | 5-card grid | — | **Missing** | |
| DASH-03 | Played / upcoming match counts | Header chips | — | **Missing** | |
| DASH-04 | Golden Boot / top scorers (5) | Linked to player profiles | Top 5 by goals only | **Partial** | No avatars, assists column, deep links |
| DASH-05 | Live activity feed | Goals/cards/assists timeline | — | **Missing** | |
| DASH-06 | Total minutes played card | From `minutesPlayed` on matches | — | **Missing** | |
| DASH-07 | Top teams preview | — | Top 3 from standings | **Partial** | Web uses full dashboard layout |

---

## 5. Teams

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| TEAM-01 | Teams list | Cards + navigate to detail | List with player count | **Partial** | |
| TEAM-02 | Team detail page | `/teams/[id]` | — | **Missing** | |
| TEAM-03 | Squad list on detail | Roster → player profile | — | **Missing** | |
| TEAM-04 | Team form (W/D/L) | Recent results | — | **Missing** | |
| TEAM-05 | Top scorer / assister on team | Computed | — | **Missing** | |
| TEAM-06 | Team manager display | Crown card | — | **Missing** | |
| TEAM-07 | Add team (admin) | Dialog + logo upload | — | **Missing** | |
| TEAM-08 | Edit team (admin) | Inline edit | — | **Missing** | |
| TEAM-09 | Delete team (admin) | With player guard | — | **Missing** | |
| TEAM-10 | Assign team manager | `setManager` | — | **Missing** | |
| TEAM-11 | Team logo upload | `TeamLogoUploadDialog` | — | **Missing** | |
| TEAM-12 | Registration deadline banner | `DeadlineBanner` | — | **Missing** | |
| TEAM-13 | Role-scoped team visibility | Team manager sees own team | — | **Missing** | |

---

## 6. Players

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| PLAY-01 | Players list | `/players` | — | **Missing** | |
| PLAY-02 | Filter by team | Select | — | **Missing** | |
| PLAY-03 | Player stats on list | Goals / cards summary | — | **Missing** | |
| PLAY-04 | Suspension badge on list | `SuspensionBadge` | — | **Missing** | |
| PLAY-05 | Add player | Admin + team manager | — | **Missing** | |
| PLAY-06 | Edit player | Dialog | — | **Missing** | |
| PLAY-07 | Delete player | Alert dialog | — | **Missing** | |
| PLAY-08 | Player photo upload | On create | — | **Missing** | |
| PLAY-09 | Player detail page | `/players/[id]` | — | **Missing** | |
| PLAY-10 | Performance charts | Bar + radar (recharts) | — | **Missing** | |
| PLAY-11 | Per-match record history | `getPlayerRecords` | — | **Missing** | |
| PLAY-12 | Claim profile button | `ClaimProfileButton` | — | **Missing** | |
| PLAY-13 | Deep link from stats / dashboard | `Link` to player | — | **Missing** | |

---

## 7. Standings

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| STD-01 | Full table (P, W, D, L, GD, PTS) | Yes | Yes | **Complete** | |
| STD-02 | Team logos / colors in table | Avatars | Text only | **Partial** | |
| STD-03 | Empty state copy | Yes | Implicit empty list | **Partial** | |
| STD-04 | Responsive column hiding | `hidden md:` | All columns shown | **Complete** | Acceptable on mobile |

---

## 8. Stats (leaderboards)

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| STAT-01 | Goals leaderboard | Tab | Sort button | **Complete** | |
| STAT-02 | Assists leaderboard | Tab | Sort button | **Complete** | |
| STAT-03 | Cards leaderboard (combined) | Tab | Separate yellow / red sorts | **Partial** | Different UX |
| STAT-04 | Search players | Input filter | — | **Missing** | |
| STAT-05 | Hide zero-stat rows | Unless searching | Shows all players | **Partial** | |
| STAT-06 | Player avatars + deep links | Yes | Names only | **Partial** | |
| STAT-07 | Enriched player/team names in data | From context | `fetchPlayerStats` leaves names empty | **Partial** | Data layer gap |

---

## 9. Matches

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| MAT-01 | Match list | Accordion by match week | Flat list | **Partial** | |
| MAT-02 | Status filter | all / played / upcoming | upcoming / played only | **Partial** | |
| MAT-03 | Match week grouping | Accordion per week | — | **Missing** | |
| MAT-04 | Match detail view | `MatchDetailsDialog` | — | **Missing** | Nav target undefined |
| MAT-05 | Goals / assists / cards in detail | Tabs in dialog | — | **Missing** | |
| MAT-06 | Attendance in detail | Tab | — | **Missing** | Not fetched on mobile |
| MAT-07 | Commentary / key moments | Timeline in dialog | — | **Missing** | |
| MAT-08 | Add match (admin) | `AddMatchDialog` | — | **Missing** | |
| MAT-09 | Edit match + record stats | `EditMatchDialog` | — | **Missing** | |
| MAT-10 | Delete single match | Per-card action | — | **Missing** | |
| MAT-11 | Delete match week | Batch per week | — | **Missing** | |
| MAT-12 | Delete all matches | Confirm dialog | — | **Missing** | |
| MAT-13 | Auto-generate fixtures | `GenerateFixturesDialog` + `lib/fixtures` | — | **Missing** | |
| MAT-14 | Export match week as PNG | `domToPng` | — | **Missing** | Low priority on native |
| MAT-15 | Team logos on match cards | Avatars | Names only | **Partial** | |

---

## 10. My profile (player-linked)

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| PROF-01 | My Profile nav item | Sidebar when linked | — | **Missing** | |
| PROF-02 | Not-linked empty state | Claim instructions | — | **Missing** | |
| PROF-03 | Pending / rejected request UI | From `useMyLinkRequest` | — | **Missing** | |
| PROF-04 | Personal stats dashboard | Stats + records | — | **Missing** | |
| PROF-05 | Suspension status on profile | `usePlayerSuspensionCheck` | — | **Missing** | |
| PROF-06 | Link to full player profile | Button | — | **Missing** | |

---

## 11. Public league page

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| PUB-01 | Unauthenticated public layout | `RootLayoutClient` bypass | — | **Missing** | Could be WebView or deep link |
| PUB-02 | Standings tab | Read-only query | — | **Missing** | |
| PUB-03 | Results tab | Match list | — | **Missing** | |
| PUB-04 | Top scorers tab | Goals leaderboard | — | **Missing** | |
| PUB-05 | Share URL / copy link | `navigator.clipboard` | — | **Missing** | |

---

## 12. Admin — user management & onboarding

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| ADM-01 | User Management (`/admin/onboarding`) | Invites, roles, player modes | — | **Missing** | |
| ADM-02 | Create invite codes | `createUserInvite` | — | **Missing** | |
| ADM-03 | Send invite email | `/api/send-invite` | — | **Missing** | Needs API or Cloud Function on mobile |
| ADM-04 | Pending invites list | `getPendingInvites` | — | **Missing** | |
| ADM-05 | Link existing user to player on invite | `linkExistingUserToPlayer` | — | **Missing** | |
| ADM-06 | Create player on invite | Batch in `lib/admin` | — | **Missing** | |
| ADM-07 | All Users (`/admin/users`) | Role changes | — | **Missing** | |
| ADM-08 | Link / unlink user ↔ player | `LinkUserToPlayerDialog`, `unlinkPlayer` | — | **Missing** | |

---

## 13. Admin — settings

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| SET-01 | League settings page | `/admin/settings` | — | **Missing** | |
| SET-02 | Season name, venue, match day, default time | Editable | — | **Missing** | |
| SET-03 | Points win/draw/loss | Editable | — | **Missing** | |
| SET-04 | Invite deadline | Editable | — | **Missing** | |
| SET-05 | Yellows per ban | Editable | — | **Missing** | |
| SET-06 | Role migration tool | `runRoleMigration` | — | **Missing** | |
| SET-07 | Read settings in UI | `useLeagueSettings` | Hook only, unused | **Partial** | |

---

## 14. Admin — suspensions

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| SUS-01 | Suspensions admin page | `/admin/suspensions` | — | **Missing** | |
| SUS-02 | List active suspensions | `useActiveSuspensions` | — | **Missing** | |
| SUS-03 | Override suspension | `useOverrideSuspension` | — | **Missing** | |
| SUS-04 | Auto ban from yellow accumulation | `lib/suspensions` | — | **Missing** | |
| SUS-05 | Suspension badges in UI | Players, profiles | — | **Missing** | |

---

## 15. Admin — profile link requests

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| LINK-01 | Profile requests page | `/admin/link-requests` | — | **Missing** | |
| LINK-02 | Approve / reject requests | Mutations | — | **Missing** | |
| LINK-03 | Pending count in sidebar | Badge | — | **Missing** | |
| LINK-04 | Player claim flow | `submitLinkRequest` | — | **Missing** | |

---

## 16. Data & business logic (shared backend)

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| DATA-01 | Fetch teams / players / matches | Yes | Yes | **Complete** | |
| DATA-02 | Fetch goals / assists / cards / attendance | Yes | Goals/assists/cards only in stats; no attendance query | **Partial** | |
| DATA-03 | `recordMatchStats` | Yes | — | **Missing** | |
| DATA-04 | `getPlayerStats` / `getPlayerRecords` | Yes | — | **Missing** | |
| DATA-05 | `topScorers` derived list | Yes | Inline sort on dashboard | **Partial** | |
| DATA-06 | Standings calculation | In `useAppData` | `fetchLeagueStandings` | **Complete** | Align field names with web |
| DATA-07 | Fixture generation algorithm | `lib/fixtures.ts` | — | **Missing** | Port to shared package ideal |
| DATA-08 | Legacy `match_records` CRUD | `addRecord` / `updateRecord` | — | **Missing** | Legacy; confirm if still needed |

---

## 17. Polish & future (from mobile README)

| ID | Feature | Web | Mobile | Status | Notes |
|----|---------|-----|--------|--------|-------|
| POL-01 | Dark mode | Web theme | — | **Missing** | Planned in README |
| POL-02 | Offline support | — | — | **Missing** | |
| POL-03 | Push notifications | — | — | **Missing** | |
| POL-04 | Shared component library | shadcn/ui | Inline styles | **Partial** | |
| POL-05 | Tab bar icons | lucide in web | Default tab icons | **Partial** | |

---

## Suggested migration waves

1. **Wave 1 — Fix foundation:** Firestore schema parity, mutations layer, register stack screens, sign out, players list + detail, team/match detail (read-only).
2. **Wave 2 — Role-based write paths:** Team/player CRUD for managers, match add/edit/record stats, league settings read in UI.
3. **Wave 3 — Admin:** Onboarding, users, link requests, suspensions, fixture generation.
4. **Wave 4 — Player experience:** My profile, claim profile, public league (or web link).
5. **Wave 5 — Polish:** Photos, exports, dark mode, offline, notifications.

---

## How to update this checklist

When implementing a feature in `kickoffApp`:

1. Change the row **Status** to Complete or Partial.
2. Add a short note if behavior still differs from web.
3. Refresh the **quick counts** table at the top.
4. Mirror breaking gaps in `FEATURE_PARITY_REPORT.md` until closed.
