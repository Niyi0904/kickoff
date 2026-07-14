import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

export type AppTabParamList = {
  Dashboard: undefined;
  Live: undefined;
  Standings: undefined;
  Stats: undefined;
  Teams: undefined;
  Players: undefined;
  Matches: undefined;
  Admin: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  MyProfile: undefined;
  TeamDetail: { teamId: string };
  PlayerDetail: { playerId: string };
  MatchDetail: { matchId: string };
  LiveMatchDetail: { matchId: string };
  AdminHome: undefined;
  AdminUsers: undefined;
  AdminLinkRequests: undefined;
  AdminSuspensions: undefined;
  LeagueSettings: undefined;
  TeamManagement: undefined;
  TeamForm: { teamId?: string };
  PlayerManagement: undefined;
  PlayerForm: { playerId?: string };
  MatchManagement: undefined;
  MatchForm: { matchId?: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppTabNavigation = BottomTabNavigationProp<AppTabParamList>;
export type AppStackNavigation = NativeStackNavigationProp<AppStackParamList>;

// Auth screen props
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type WelcomeScreenProps = AuthScreenProps<'Welcome'>;
export type SignInScreenProps = AuthScreenProps<'SignIn'>;
export type SignUpScreenProps = AuthScreenProps<'SignUp'>;
export type ForgotPasswordScreenProps = AuthScreenProps<'ForgotPassword'>;

// App stack screen props
export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
export type TeamDetailScreenProps = AppScreenProps<'TeamDetail'>;
export type PlayerDetailScreenProps = AppScreenProps<'PlayerDetail'>;
export type MatchDetailScreenProps = AppScreenProps<'MatchDetail'>;
export type TeamFormScreenProps = AppScreenProps<'TeamForm'>;
export type PlayerFormScreenProps = AppScreenProps<'PlayerForm'>;
export type MatchFormScreenProps = AppScreenProps<'MatchForm'>;

// For screens used as both tab and stack destinations
export type AppListScreenProps = NativeStackNavigationProp<AppStackParamList>;

// For screens inside tab navigator that also navigate to stack screens
export type AppTabScreenProps = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList>,
  NativeStackNavigationProp<AppStackParamList>
>;

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminUsers: undefined;
  AdminLinkRequests: undefined;
  AdminSuspensions: undefined;
  LeagueSettings: undefined;
  TeamManagement: undefined;
  TeamForm: { teamId?: string };
  PlayerManagement: undefined;
  PlayerForm: { playerId?: string };
  MatchManagement: undefined;
  MatchForm: { matchId?: string };
};