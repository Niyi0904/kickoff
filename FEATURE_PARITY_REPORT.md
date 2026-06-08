# Feature Parity Report: team_management → kickoffApp

**Generated:** 2026-06-03  
**Purpose:** List all functionality present in `team_management` that is absent or incomplete in `kickoffApp` **before** implementation work begins.

**Tracking checklist:** See `MOBILE_MIGRATION_CHECKLIST.md` for per-feature Complete / Partial / Missing status (update both docs as migration progresses).

---

## Executive summary

`kickoffApp` has a working **read-only core**: authentication, tab navigation, and list views for dashboard (simplified), standings, stats, teams, and matches. Everything that makes the web app a **league management system**—players, detail screens, admin tools, match recording, invites, linking, suspensions, and settings—is **missing or non-functional** on mobile.

| Area | Web maturity | Mobile maturity |
|------|--------------|-----------------|
| View league data | Full | ~40% (5 tabs, simplified) |
| Manage teams/players | Full | 0% |
| Manage matches & fixtures | Full | 0% |
| Player self-service | Full | 0% |
| Admin / league ops | Full | 0% |
| Public sharing | Full | 0% |

**Critical blockers today (broken or wrong without new code):**

1. **Navigation targets that do not exist** — `TeamsScreen` and `MatchesScreen` call `navigation.navigate('TeamDetail' | 'MatchDetail')`, but `RootNavigator` only registers tab screens. Taps fail or no-op.
2. **No Players area** — Web has a primary `/players` section; mobile has no equivalent tab or screen.
3. **No Firestore write layer** — Web `useAppData` exposes ~15 mutations; mobile only reads.
4. **Schema / query mismatches** — Mobile may read wrong collections or settings document vs web (details in § Data layer gaps).

---

## What mobile already covers (parity achieved)

These are the only areas where `kickoffApp` is **Complete** or acceptably close for a first release:

- Email/password **sign in** and **sign up** with user + default `player` role documents.
- **Auth-gated** app shell (loading state → tabs vs auth stack).
- **Standings** table: position, team name, P, W, D, L, GD, points (calculated from played matches).
- **Stats** leaderboards with sort toggles for goals, assists, yellow cards, red cards.
- **Teams** list with primary color strip, stadium, player count.
- **Matches** list with upcoming/played filter and basic score display.
- **Dashboard** subset: top 3 teams by points, top 5 scorers by goals.

---

## Missing functionality (by priority)

### P0 — Broken or blocking user flows

| # | Missing capability | Web reference | Mobile state |
|---|-------------------|---------------|--------------|
| 1 | **Team detail screen** | `app/teams/[id]/page.tsx` | `TeamDetail` route referenced but not implemented |
| 2 | **Match detail screen** | `components/matches/matchDetailsDialog.tsx` | `MatchDetail` route referenced but not implemented |
| 3 | **Players list screen** | `app/players/page.tsx` | No screen, no tab |
| 4 | **Player detail screen** | `app/players/[id]/page.tsx` | Missing |
| 5 | **Sign out** | `Sidebar`, `UserProfileDropdown` | `signOutUser` in `auth.ts` never exposed in UI |
| 6 | **Firestore write/mutation module** | `app/hooks/useAppData.ts` (add/update/delete/record) | Not ported |

### P1 — Core league management (admin / manager)

| # | Missing capability | Web reference |
|---|-------------------|---------------|
| 7 | Add / edit / delete **teams** | `app/teams/page.tsx`, `useAppData` mutations |
| 8 | Team **logo upload** | `TeamLogoUploadDialog`, `uploadProfileImage` |
| 9 | Assign **team manager** on player | `setManager` in `useAppData` |
| 10 | Add / edit / delete **players** | `app/players/page.tsx` |
| 11 | Player **photo upload** on create/edit | `uploadProfileImage` in players flow |
| 12 | **Registration deadline** banner & enforcement | `DeadlineBanner`, `useLeagueSettings` |
| 13 | Add **match** (upcoming or played) | `components/matches/addMatchDialog.tsx` |
| 14 | **Edit match** + update scores/status | `components/matches/editMatchDialog.tsx` |
| 15 | **Record match stats** (goals, assists, cards, attendance) | `recordMatchStats`, `deleteMatchEvents` |
| 16 | Delete match / delete match week / **clear all matches** | `app/matches/page.tsx` |
| 17 | **Auto-generate fixtures** | `GenerateFixturesDialog`, `lib/fixtures.ts`, `addMatchesBatch` |
| 18 | Match list **grouped by match week** (accordion) | `app/matches/page.tsx` |
| 19 | Match filter **“all”** in addition to played/upcoming | Web 3-way filter |
| 20 | **Role-based UI** (`isAdmin`, `isTeamManager`, scoped `teamId`) | `AuthContext` + page guards |

### P2 — Player-facing & engagement

| # | Missing capability | Web reference |
|---|-------------------|---------------|
| 21 | **My Profile** page for linked players | `app/my-profile/page.tsx` |
| 22 | **Claim player profile** | `ClaimProfileButton`, `lib/playerLinking.ts` |
| 23 | Link request status (pending / rejected) | `useMyLinkRequest` |
| 24 | **Suspension badges** on player UI | `SuspensionBadge`, `lib/suspensions.ts` |
| 25 | Player detail **charts** (bar, radar) | `app/players/[id]/page.tsx` + recharts |
| 26 | Per-match **performance history** | `getPlayerRecords` |
| 27 | Dashboard **live activity feed** | `app/dashboard/page.tsx` |
| 28 | Dashboard **season** label & stat summary cards | `useLeagueSettings`, stat cards |
| 29 | Stats **search** and combined **cards** tab | `app/stats/page.tsx` |
| 30 | Deep links from stats/dashboard → player | `Link` / `router.push` |

### P3 — Admin operations

| # | Missing capability | Web reference |
|---|-------------------|---------------|
| 31 | **User Management / onboarding** | `app/admin/onboarding/page.tsx` |
| 32 | Invite creation (code, role, player link/create) | `lib/admin.ts` → `createUserInvite` |
| 33 | **Email invites** | `app/api/send-invite/route.ts` |
| 34 | Pending invites list & delete | `getPendingInvites`, `deleteUserInvite` |
| 35 | **All Users** + change roles | `app/admin/users/page.tsx`, `setUserRole` |
| 36 | Admin **link user to player** / unlink | `LinkUserToPlayerDialog`, `unlinkPlayer` |
| 37 | **League settings** editor | `app/admin/settings/page.tsx` |
| 38 | **Suspensions** admin + override | `app/admin/suspensions/page.tsx` |
| 39 | **Profile link requests** approve/reject | `app/admin/link-requests/page.tsx` |
| 40 | Sidebar **pending requests** count | `usePendingLinkRequests` in `Sidebar.tsx` |
| 41 | **Role migration** utility | `runRoleMigration` in settings |

### P4 — Public & sharing

| # | Missing capability | Web reference |
|---|-------------------|---------------|
| 42 | **Public league page** (no auth) | `app/public-league/page.tsx` |
| 43 | Public tabs: standings, results, scorers | Same page |
| 44 | Share/copy public URL | `shareUrl` in public page |
| 45 | Match week **PNG export** | `domToPng` on matches page (web-only; optional on native) |

### P5 — Infrastructure & polish

| # | Missing capability | Web reference |
|---|-------------------|---------------|
| 46 | **User profile dropdown** (avatar, upload, sign out) | `UserProfileDropdown.tsx` |
| 47 | Global **toast** system | `use-toast`, `Toaster` |
| 48 | Fetch **attendance** collection | `useAppData` → `match_attendance` |
| 49 | `useLeagueSettings` used in screens | Hook exists in mobile but unused |
| 50 | Enrich **player stats** with names (players/teams join) | Web uses context; mobile `fetchPlayerStats` leaves names blank |
| 51 | **Dark mode**, offline, push notifications | Planned in `MOBILE_APP_README.md` only |
| 52 | Shared **design system** / icons on tabs | Web lucide + shadcn vs basic RN styles |

---

## Partial implementations (need work to reach parity)

| Feature | What exists on mobile | What web has extra |
|---------|---------------------|-------------------|
| Dashboard | Top teams + top scorers | Season title, 5 stat cards, activity feed, minutes card, links to players |
| Teams list | Read-only cards | CRUD, logos, manager assignment, deadline banner, detail page |
| Matches list | Filter + scores | Week grouping, detail dialog, admin actions, export |
| Stats | 4 sort modes | Search, cards tab (Y+R), avatars, links, filter zero rows |
| Standings | Full numeric table | Team avatars/colors, empty-state messaging |
| Auth / roles | Load `userRole` | Badges, gating write UI, manager scoping |
| Data hooks | Read queries | All mutations, attendance, topScorers helper, player records |

---

## Data layer gaps (implement before trusting mobile stats)

| Issue | Web (`team_management`) | Mobile (`kickoffApp`) | Impact |
|-------|-------------------------|------------------------|--------|
| Yellow cards collection | `yellow_cards` | Queries `yellowCards` | Yellow card counts likely **zero** on mobile |
| Red cards collection | `red_cards` | Queries `redCards` | Red card counts likely **zero** on mobile |
| League settings document | `settings/league` (single doc) | `getDocs(collection(db, 'settings'))` | May return wrong doc or defaults |
| Team field names | Writes `primary_color`, reads mapped to `primaryColor` | Expects `primaryColor` on doc | Colors may be undefined if only snake_case in DB |
| Player stats names | Resolved via `players` / `teams` in UI | Not joined in `fetchPlayerStats` | Leaderboard shows **blank names** |
| Attendance | `match_attendance` queried | Not queried | Detail + minutes / discipline incomplete |

**Recommendation:** Extract shared Firestore accessors (collection names, field mappers) into a package used by both apps before building more screens.

---

## Web routes → mobile mapping

| Web route | Mobile equivalent | Parity |
|-----------|-------------------|--------|
| `/auth` | Auth stack | Complete |
| `/dashboard` | Dashboard tab | Partial |
| `/teams` | Teams tab | Partial |
| `/teams/[id]` | — | Missing |
| `/players` | — | Missing |
| `/players/[id]` | — | Missing |
| `/stats` | Stats tab | Partial |
| `/standings` | Standings tab | Complete |
| `/matches` | Matches tab | Partial |
| `/my-profile` | — | Missing |
| `/public-league` | — | Missing |
| `/admin/onboarding` | — | Missing |
| `/admin/users` | — | Missing |
| `/admin/settings` | — | Missing |
| `/admin/suspensions` | — | Missing |
| `/admin/link-requests` | — | Missing |

---

## Web mutations not available on mobile

All defined in `team_management/app/hooks/useAppData.ts`:

| Mutation | Purpose |
|----------|---------|
| `addTeam` / `updateTeam` / `deleteTeam` | Team CRUD |
| `addPlayer` / `updatePlayer` / `deletePlayer` | Player CRUD |
| `setManager` | Team manager flag on player |
| `addMatch` / `updateMatch` / `deleteMatch` | Match CRUD |
| `addMatchesBatch` | Fixture generation batch write |
| `deleteAllMatches` | Clear season matches + events |
| `recordMatchStats` | Post-match events |
| `deleteMatchEvents` | Clear events before re-record |
| `addRecord` / `updateRecord` | Legacy `match_records` collection |

Supporting libraries not on mobile: `lib/fixtures.ts`, `lib/admin.ts`, `lib/playerLinking.ts`, `lib/suspensions.ts`, `lib/uploadImage` (or equivalent).

---

## Recommended implementation order

1. **Align Firestore layer** (collections, settings path, field mappers, player name enrichment).
2. **Add App stack navigator** with TeamDetail, MatchDetail, PlayersList, PlayerDetail (read-only).
3. **Sign out + profile entry point** (minimal menu).
4. **Port mutations** into mobile `useAppData` (or shared module) behind role checks.
5. **Match recording flow** (largest admin surface).
6. **Players tab + claim profile + My Profile**.
7. **Admin screens** (settings → users → link requests → suspensions → onboarding).
8. **Public league** (in-app WebView or dedicated read-only screens).

---

## Document maintenance

- When a gap is closed, remove or downgrade it in this report and mark the matching row **Complete** in `MOBILE_MIGRATION_CHECKLIST.md`.
- Keep **P0** section empty before calling the migration “feature complete” for internal users.
- Re-run this analysis after major web releases so new `team_management` features get checklist rows.
