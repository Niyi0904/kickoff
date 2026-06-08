# Football Team Management - Mobile App

A React Native/Expo mobile app for managing football/soccer leagues, teams, players, and matches.

## Project Structure

```
src/
├── firebase/
│   ├── config.ts          # Firebase configuration
│   ├── auth.ts            # Authentication functions
│   └── firestore.ts       # Firestore queries
├── context/
│   └── AuthContext.tsx    # Authentication context provider
├── hooks/
│   ├── useAuth.ts         # Auth-related hooks
│   └── useAppData.ts      # Data fetching hooks with React Query
├── screens/
│   ├── auth/
│   │   ├── SignInScreen.tsx
│   │   └── SignUpScreen.tsx
│   └── app/
│       ├── DashboardScreen.tsx
│       ├── StandingsScreen.tsx
│       ├── StatsScreen.tsx
│       ├── TeamsScreen.tsx
│       └── MatchesScreen.tsx
├── navigation/
│   └── RootNavigator.tsx  # Navigation structure
├── lib/
│   └── types.ts           # TypeScript type definitions
└── components/            # Reusable components (coming soon)
```

## Features Implemented

### Phase 1: Foundation ✅
- [x] Firebase authentication (sign in/sign up)
- [x] React Navigation setup (stack & tab navigation)
- [x] Auth context & hooks
- [x] Type definitions for all entities
- [x] React Query integration for data fetching
- [x] Firestore query functions

### Phase 2: Core Features (In Progress)
- [x] Dashboard with league overview and top performers
- [x] League Standings table with W/D/L/GD/PTS
- [x] Player Statistics with filterable leaderboards (goals, assists, cards)
- [x] Teams list with player counts
- [x] Matches view with upcoming/played filter
- [ ] Match details screen
- [ ] Team roster details
- [ ] User profile screen

### Phase 3: Enhanced Features (Planned)
- [ ] Match recording (admin only)
- [ ] Suspensions management
- [ ] Team manager features
- [ ] Player linking
- [ ] Photo uploads

### Phase 4: Polish (Planned)
- [ ] Dark mode
- [ ] Offline support
- [ ] Push notifications
- [ ] Performance optimization

## Getting Started

### Prerequisites

- Node.js (v16+)
- Expo CLI: `npm install -g expo-cli`
- Firebase project with Firestore and Auth enabled

### Firebase Setup

1. Create a Firebase project at https://firebase.google.com/
2. Enable Authentication (Email/Password)
3. Enable Firestore
4. Get your Firebase config from Project Settings
5. Update `src/firebase/config.ts` with your credentials

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### Installation

```bash
cd kickoffApp
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# For iOS
npm run ios

# For Android
npm run android

# For Web
npm run web
```

## Data Models

### User
- `id` - Firebase UID
- `email` - User email
- `displayName` - User's display name
- `photo` - Profile picture URL (optional)
- `createdAt` - Timestamp

### User Role
- `uid` - Firebase UID
- `role` - 'league_manager' | 'team_manager' | 'player' | 'admin'
- `teamId` - Team ID (for team managers)

### Team
- `id` - Unique ID
- `name` - Team name
- `logo` - Logo URL (optional)
- `primaryColor` - Team color (hex)
- `founded` - Year founded
- `stadium` - Stadium name

### Player
- `id` - Unique ID
- `name` - Player name
- `position` - Position (GK, CB, RB, LB, DF, MF, FW)
- `number` - Jersey number
- `teamId` - Team ID
- `photo` - Player photo URL (optional)
- `linkedUserId` - Firebase UID (if linked to user)

### Match
- `id` - Unique ID
- `matchDay` - Week number
- `homeTeamId` - Home team ID
- `awayTeamId` - Away team ID
- `homeScore` - Home team goals
- `awayScore` - Away team goals
- `status` - 'upcoming' | 'played' | 'cancelled'
- `scheduledDate` - Match date (ISO format)
- `time` - Kick-off time (HH:MM)

## API Integration

### Authentication
- `signIn(email, password)` - Sign in with email/password
- `signUp(email, password, displayName)` - Create new account
- `signOutUser()` - Sign out
- `getCurrentUser()` - Get current Firebase user

### Data Queries
- `useTeams()` - Fetch all teams
- `usePlayers(teamId?)` - Fetch players, optionally by team
- `useMatches(status?)` - Fetch matches, optionally by status
- `usePlayerStats()` - Fetch player statistics (goals, assists, cards)
- `useLeagueStandings()` - Fetch league standings (auto-calculated)
- `useLeagueSettings()` - Fetch league configuration

## Hooks

### useAuth()
Get authentication state and user info:
```typescript
const { user, userProfile, userRole, isAuthenticated, isLoading } = useAuth();
```

### useIsLeagueManager()
Check if user is league manager:
```typescript
const isManager = useIsLeagueManager();
```

### useIsTeamManager(teamId?)
Check if user is team manager:
```typescript
const isTeamManager = useIsTeamManager(teamId);
```

## Next Steps

1. **Add Missing Screens**
   - Match detail screen
   - Team roster detail
   - User profile
   - Admin dashboard

2. **Implement Admin Features**
   - Match recording interface
   - Player/team management
   - Fixture generation
   - Suspension management

3. **Improve UI/UX**
   - Add icons with React Native icons package
   - Implement theming system
   - Add smooth animations
   - Better error handling

4. **Testing**
   - Unit tests for hooks and utilities
   - Integration tests for navigation
   - Firebase security rules testing

## Troubleshooting

### Firebase Config Not Found
Make sure to update `src/firebase/config.ts` with your Firebase credentials.

### Auth Not Working
- Check Firebase Authentication is enabled in Console
- Verify Email/Password provider is active
- Check Firestore security rules allow user document creation

### No Data Showing
- Verify Firestore has collections created: teams, players, matches, etc.
- Check Firestore security rules allow read access
- Use Expo DevTools to debug React Query

## Technologies Used

- **React Native** - Mobile UI framework
- **Expo** - React Native development platform
- **Firebase** - Backend (Auth + Firestore)
- **React Navigation** - Screen navigation
- **React Query** - Data fetching & caching
- **TypeScript** - Type safety

## License

MIT
