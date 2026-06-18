import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PRIMARY_COLOR } from '../theme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
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
import { SignOutButton } from '../components/SignOutButton';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import LeagueSettingsScreen from '../screens/admin/LeagueSettingsScreen';
import { TeamManagementScreen } from '../screens/admin/TeamManagementScreen';
import TeamFormScreen from '../screens/admin/TeamFormScreen';
import PlayerManagementScreen from '../screens/admin/PlayerManagementScreen';
import PlayerFormScreen from '../screens/admin/PlayerFormScreen';
import MatchManagementScreen from '../screens/admin/MatchManagementScreen';
import MatchFormScreen from '../screens/admin/MatchFormScreen';
import type { AppStackParamList, AppTabParamList, AuthStackParamList } from './types';

const AdminStack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: PRIMARY_COLOR,
      headerRight: () => <SignOutButton />,
    }}
  >
    <Tab.Screen name="Admin" component={AdminHomeScreen} options={{ title: 'Admin' }} />
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="Standings" component={StandingsScreen} options={{ title: 'Standings' }} />
    <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
    <Tab.Screen name="Teams" component={TeamsScreen} options={{ title: 'Teams' }} />
    <Tab.Screen name="Players" component={PlayersScreen} options={{ title: 'Players' }} />
    <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: 'Matches' }} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <AppStack.Navigator>
    <AppStack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
    <AppStack.Screen name="LeagueSettings" component={LeagueSettingsScreen} options={{ title: 'Settings' }} />
    <AppStack.Screen name="TeamManagement" component={TeamManagementScreen} options={{ title: 'Teams' }} />
    <AppStack.Screen name="TeamForm" component={TeamFormScreen} options={{ title: 'Team Form' }} />
    <AppStack.Screen name="PlayerManagement" component={PlayerManagementScreen} options={{ title: 'Players' }} />
    <AppStack.Screen name="PlayerForm" component={PlayerFormScreen} options={{ title: 'Player Form' }} />
    <AppStack.Screen name="MatchManagement" component={MatchManagementScreen} options={{ title: 'Matches' }} />
    <AppStack.Screen name="MatchForm" component={MatchFormScreen} options={{ title: 'Match Form' }} />
    <AppStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    <AppStack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: 'Team' }} />
    <AppStack.Screen name="PlayerDetail" component={PlayerDetailScreen} options={{ title: 'Player' }} />
    <AppStack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Match' }} />
  </AppStack.Navigator>
);

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
