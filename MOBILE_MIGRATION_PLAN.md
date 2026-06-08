# Mobile Migration Plan

**Source of truth (read-only):** `team_management`  
**Implementation target (writable):** `kickoffApp`  
**Last updated:** 2026-06-03

Companion documents:

- `FEATURE_PARITY_REPORT.md` — Phase 1 gap analysis and missing functionality
- `MOBILE_MIGRATION_CHECKLIST.md` — per-feature status (update continuously)

---

## Architecture principles

| Principle | Approach |
|-----------|----------|
| Business logic | Port from web `useAppData`, `lib/*`; do not re-invent rules |
| Backend | Same Firebase project — Firestore + Auth; no separate mobile API |
| HTTP APIs | Web-only Next routes (`/api/send-invite`, `/api/migrate-roles`); mobile uses Firestore directly or documents need for Cloud Function URL |
| UI | Mobile-first layouts; feature parity ≠ pixel parity |
| Safety | **Zero writes** to `team_management` |

---

## Web → Mobile feature map

| # | Web feature | Web route / module | Mobile target | Status | Priority | Screens | Components | Services | State |
|---|-------------|-------------------|---------------|--------|----------|---------|------------|----------|-------|
| 1 | Auth sign in | `/auth` | `SignInScreen` | Complete | P0 | Auth stack | Form inputs | `firebase/auth` | `AuthContext` |
| 2 | Auth sign up | `/auth` | `SignUpScreen` | Complete | P0 | Auth stack | Form inputs | `firebase/auth` | `AuthContext` |
| 3 | Auth sign out | Sidebar | Header menu | Missing→W1 | P0 | — | `AppHeader` | `signOutUser` | `AuthContext` |
| 4 | Role resolution | `useAuth` | `useAuth` + hooks | Partial→W1 | P0 | — | — | `user_roles` doc | `AuthContext` |
| 5 | Protected app | `ProtectedRoute` | `RootNavigator` | Complete | P0 | — | — | auth listener | `AuthContext` |
| 6 | Dashboard | `/dashboard` | `DashboardScreen` | Partial | P1 | Dashboard tab | Stat cards, feed | queries | React Query |
| 7 | Standings | `/standings` | `StandingsScreen` | Complete | P1 | Standings tab | Table | `fetchLeagueStandings` | React Query |
| 8 | Stats leaderboards | `/stats` | `StatsScreen` | Partial | P1 | Stats tab | Tabs, search | events + players | React Query |
| 9 | Teams list | `/teams` | `TeamsScreen` | Partial | P1 | Teams tab | List card | `fetchTeams` | React Query |
| 10 | Team detail | `/teams/[id]` | `TeamDetailScreen` | Missing→W1 | P0 | Stack | Roster, form | derived stats | React Query |
| 11 | Team CRUD | `teams/page` | Admin modals | Missing | P2 | Teams + modal | Forms | mutations | `useAppData` |
| 12 | Players list | `/players` | `PlayersScreen` | Missing→W1 | P0 | Tab + stack | List, filter | `fetchPlayers` | React Query |
| 13 | Player detail | `/players/[id]` | `PlayerDetailScreen` | Missing→W1 | P0 | Stack | Stats, charts | `getPlayerStats` | React Query |
| 14 | Player CRUD | `players/page` | Forms | Missing | P2 | Players | Dialogs | mutations | `useAppData` |
| 15 | Matches list | `/matches` | `MatchesScreen` | Partial | P1 | Matches tab | Filters, accordion | `fetchMatches` | React Query |
| 16 | Match detail | `MatchDetailsDialog` | `MatchDetailScreen` | Missing→W1 | P0 | Stack | Event tabs | events queries | React Query |
| 17 | Add/edit match | `add/editMatchDialog` | `MatchFormScreen` | Missing | P2 | Stack modal | Multi-step | mutations | `useAppData` |
| 18 | Fixture generation | `GenerateFixturesDialog` | `FixtureGenScreen` | Missing | P2 | Matches | Dialog | `lib/fixtures` | mutation |
| 19 | My profile | `/my-profile` | `MyProfileScreen` | Missing | P2 | Stack/tab | Link CTA | `usePlayerLinking` | React Query |
| 20 | Claim profile | `ClaimProfileButton` | Player detail CTA | Missing | P2 | Player detail | Button | `playerLinking` | mutation |
| 21 | Public league | `/public-league` | WebView or screen | Missing | P3 | Public stack | Tabs | public fetch | React Query |
| 22 | Admin onboarding | `/admin/onboarding` | `AdminOnboardingScreen` | Missing | P3 | Admin stack | Invite UI | `lib/admin` | React Query |
| 23 | Admin users | `/admin/users` | `AdminUsersScreen` | Missing | P3 | Admin stack | Role select | `lib/admin` | React Query |
| 24 | Admin settings | `/admin/settings` | `AdminSettingsScreen` | Missing | P3 | Admin stack | Form | `settings/league` | React Query |
| 25 | Admin suspensions | `/admin/suspensions` | `AdminSuspensionsScreen` | Missing | P3 | Admin stack | List | `lib/suspensions` | React Query |
| 26 | Admin link requests | `/admin/link-requests` | `AdminLinkRequestsScreen` | Missing | P3 | Admin stack | Approve/reject | `playerLinking` | React Query |
| 27 | League settings read | `use-leagueSettings` | `useLeagueSettings` | Partial→W1 | P1 | Banner, dashboard | `DeadlineBanner` | `settings/league` | React Query |
| 28 | Profile photo upload | `ProfilePictureUploadDialog` | Image picker | Missing | P4 | Profile | Picker | upload API | — |
| 29 | Email invite API | `/api/send-invite` | Document / CF URL | Missing | P3 | Admin | — | HTTP (not Firestore) | — |
| 30 | Notifications | — | — | N/A | — | — | — | **Not in web app** | — |

---

## Implementation waves

### Wave 1 — Foundation (current sprint)

**Goal:** Correct data layer, navigation, read-only parity for lists + details, sign out.

| Task | Deliverables |
|------|----------------|
| Firestore parity | `firestoreMappers.ts`, fix collection names (`yellow_cards`, `red_cards`, `settings/league`) |
| Auth parity | Fail-closed roles, `teamId` / `playerId`, `useIsAdmin` |
| Navigation | `AppStack`: tabs + TeamDetail, MatchDetail, Players, PlayerDetail |
| Screens | Players tab, detail screens (read-only), sign out |
| Docs | Update checklist counts, Wave 1 progress report |

### Wave 2 — Write path (managers)

| Task | Deliverables |
|------|----------------|
| `useAppData` mutations | Port from web hook |
| Team/player forms | Role-gated create/edit/delete |
| Deadline banner | `useLeagueSettings` |

### Wave 3 — Match operations (league manager)

| Task | Deliverables |
|------|----------------|
| Add/edit match | Multi-step form |
| `recordMatchStats` | Events batch write |
| Fixture generation | Port `lib/fixtures.ts` |
| Suspension evaluation | Port `useSuspensions` |

### Wave 4 — Player & admin

| Task | Deliverables |
|------|----------------|
| My profile, claim, link requests | Linking hooks |
| Admin stack | 5 admin screens |
| Public league | Read-only or deep link |

### Wave 5 — Polish

| Task | Deliverables |
|------|----------------|
| Toasts, skeletons, icons | UX |
| Photo upload | Storage integration |
| Offline / push | Only if web adds equivalent |

---

## Required Firestore collections (shared)

| Collection | Read | Write (rules) |
|------------|------|----------------|
| `teams` | Public | League manager or team manager (own team) |
| `players` | Public | League / team manager |
| `matches` | Public | League manager only |
| `goals`, `assists`, `yellow_cards`, `red_cards`, `match_attendance` | Public | League manager |
| `users`, `user_roles` | Owner / auth | Mixed |
| `user_invites` | Admin | League manager |
| `link_requests` | Auth | Create own; update admin |
| `suspensions` | Auth | League manager |
| `settings/league` | Public read typical | League manager |

---

## Validation checklist (per module)

After each wave:

- [ ] Behavior matches web for same role (league manager, team manager, player)
- [ ] Firestore field mapping matches web fetchers
- [ ] Loading states on all queries
- [ ] Error states surfaced (Alert or toast)
- [ ] Empty states copy sensible
- [ ] Edge cases: no teams, no matches, tied standings, self-match blocked
- [ ] Checklist + parity report updated

---

## Web issues (document only — do not fix in `team_management`)

| ID | Observation |
|----|-------------|
| WEB-01 | Sign-up default role: web `createUserDocument` uses `user`; mobile uses `player` — align policy in report only |
| WEB-02 | Invite email requires Next.js `/api/send-invite` — mobile needs hosted endpoint or Cloud Function |
| WEB-03 | `UserRole` type in mobile `types.ts` duplicates interface name with role union type |
