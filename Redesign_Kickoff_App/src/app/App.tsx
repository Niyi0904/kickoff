import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider } from './components/AppContext';
import { MobileShell } from './components/MobileShell';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { HomeScreen } from './components/HomeScreen';
import { FixturesScreen } from './components/FixturesScreen';
import { MatchDetailsScreen } from './components/MatchDetailsScreen';
import { StandingsScreen } from './components/StandingsScreen';
import { TeamsScreen } from './components/TeamsScreen';
import { TeamDetailsScreen } from './components/TeamDetailsScreen';
import { PlayersScreen } from './components/PlayersScreen';
import { PlayerDetailsScreen } from './components/PlayerDetailsScreen';
import { StatisticsScreen } from './components/StatisticsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { MoreScreen } from './components/MoreScreen';
import { SettingsScreen } from './components/SettingsScreen';
import {
  AdminScreen,
  AdminUsersScreen,
  AdminLinkRequestsScreen,
  AdminSuspensionsScreen,
  AdminLeagueSettingsScreen,
} from './components/AdminScreen';
import { NotFoundScreen } from './components/UIStates';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MobileShell>
          <Routes>
            <Route path="/" element={<Navigate to="/splash" replace />} />
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Main tabs */}
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/fixtures" element={<FixturesScreen />} />
            <Route path="/fixtures/:id" element={<MatchDetailsScreen />} />
            <Route path="/standings" element={<StandingsScreen />} />
            <Route path="/teams" element={<TeamsScreen />} />
            <Route path="/teams/:id" element={<TeamDetailsScreen />} />
            <Route path="/players" element={<PlayersScreen />} />
            <Route path="/players/:id" element={<PlayerDetailsScreen />} />
            <Route path="/statistics" element={<StatisticsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/edit" element={<EditProfileScreen />} />
            <Route path="/more" element={<MoreScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminScreen />} />
            <Route path="/admin/users" element={<AdminUsersScreen />} />
            <Route path="/admin/link-requests" element={<AdminLinkRequestsScreen />} />
            <Route path="/admin/suspensions" element={<AdminSuspensionsScreen />} />
            <Route path="/admin/settings" element={<AdminLeagueSettingsScreen />} />
            <Route path="/admin/fixtures" element={<AdminLeagueSettingsScreen />} />

            {/* Stubs */}
            <Route path="/notifications" element={<NotFoundScreen />} />
            <Route path="/rules" element={<NotFoundScreen />} />
            <Route path="/about" element={<NotFoundScreen />} />
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </MobileShell>
      </BrowserRouter>
    </AppProvider>
  );
}
