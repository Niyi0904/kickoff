import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme';
import { useNetwork } from '../context/NetworkContext';
import { NetworkBanner } from '../components/NetworkBanner';
import { NotificationRegister } from '../components/NotificationRegister';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import DashboardScreen from '../screens/app/DashboardScreen';
import StandingsScreen from '../screens/app/StandingsScreen';
import StatsScreen from '../screens/app/StatsScreen';
import TeamsScreen from '../screens/app/TeamsScreen';
import PlayersScreen from '../screens/app/PlayersScreen';
import MatchesScreen from '../screens/app/MatchesScreen';
import TeamDetailScreen from '../screens/app/TeamDetailScreen';
import PlayerDetailScreen from '../screens/app/PlayerDetailScreen';
import MatchDetailScreen from '../screens/app/MatchDetailScreen';
import MyProfileScreen from '../screens/app/MyProfileScreen';
import { SignOutButton } from '../components/SignOutButton';
import { HeaderProfileButton } from '../components/HeaderProfileButton';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import LeagueSettingsScreen from '../screens/admin/LeagueSettingsScreen';
import TeamManagementScreen from '../screens/admin/TeamManagementScreen';
import TeamFormScreen from '../screens/admin/TeamFormScreen';
import PlayerManagementScreen from '../screens/admin/PlayerManagementScreen';
import PlayerFormScreen from '../screens/admin/PlayerFormScreen';
import MatchManagementScreen from '../screens/admin/MatchManagementScreen';
import MatchFormScreen from '../screens/admin/MatchFormScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminLinkRequestsScreen from '../screens/admin/AdminLinkRequestsScreen';
import AdminSuspensionsScreen from '../screens/admin/AdminSuspensionsScreen';
import { ThemeToggle } from '../components/ThemeToggle';
import type { AppStackParamList, AppTabParamList, AuthStackParamList } from './types';

export const navigationRef = React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>();

const AdminStack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const tabIcons: Record<string, string> = {
  Dashboard: '🏠',
  Standings: '🏆',
  Stats: '📊',
  Teams: '⚽',
  Players: '👤',
  Matches: '⚔️',
  Admin: '⚙️',
};

const MainTabs = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const },
        tabBarIcon: ({ focused }) => {
          const icon = tabIcons[route.name] ?? '•';
          return (
            <View style={{ opacity: focused ? 1 : 0.5 }}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
            </View>
          );
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <ThemeToggle />
            <HeaderProfileButton />
            <SignOutButton />
          </View>
        ),
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Standings" component={StandingsScreen} options={{ title: 'Standings' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Teams" component={TeamsScreen} options={{ title: 'Teams' }} />
      <Tab.Screen name="Players" component={PlayersScreen} options={{ title: 'Players' }} />
      <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: 'Matches' }} />
      <Tab.Screen name="Admin" component={AdminHomeScreen} options={{ title: 'Admin' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { colors } = useTheme();
  return (
  <AppStack.Navigator
    initialRouteName="MainTabs"
    screenOptions={{
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
      headerTitleStyle: { color: colors.text },
    }}
  >
    <AppStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    <AppStack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
    <AppStack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
    <AppStack.Screen name="AdminLinkRequests" component={AdminLinkRequestsScreen} options={{ title: 'Link Requests' }} />
    <AppStack.Screen name="AdminSuspensions" component={AdminSuspensionsScreen} options={{ title: 'Suspensions' }} />
    <AppStack.Screen name="LeagueSettings" component={LeagueSettingsScreen} options={{ title: 'Settings' }} />
    <AppStack.Screen name="TeamManagement" component={TeamManagementScreen} options={{ title: 'Teams' }} />
    <AppStack.Screen name="TeamForm" component={TeamFormScreen} options={{ title: 'Team Form' }} />
    <AppStack.Screen name="PlayerManagement" component={PlayerManagementScreen} options={{ title: 'Players' }} />
    <AppStack.Screen name="PlayerForm" component={PlayerFormScreen} options={{ title: 'Player Form' }} />
    <AppStack.Screen name="MatchManagement" component={MatchManagementScreen} options={{ title: 'Matches' }} />
    <AppStack.Screen name="MatchForm" component={MatchFormScreen} options={{ title: 'Match Form' }} />    
    <AppStack.Screen name="MyProfile" component={MyProfileScreen} options={{ title: 'My Profile' }} />
    <AppStack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: 'Team' }} />
    <AppStack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: 'Player' }} />
    <AppStack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Match' }} />
  </AppStack.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  const { isConnected } = useNetwork();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer ref={navigationRef}>
        <NetworkBanner isConnected={isConnected} />
        <NotificationRegister />
        {isAuthenticated ? (
          <AppNavigator />
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export function navigateToMainTabs() {
  if (navigationRef.current) {
    navigationRef.current.resetRoot({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }
}