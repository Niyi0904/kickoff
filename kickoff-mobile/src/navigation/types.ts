import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

export type AppTabParamList = {
  Dashboard: undefined;
  Standings: undefined;
  Stats: undefined;
  Teams: undefined;
  Players: undefined;
  Matches: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  TeamDetail: { teamId: string };
  PlayerDetail: { playerId: string };
  MatchDetail: { matchId: string };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AppTabNavigation = BottomTabNavigationProp<AppTabParamList>;
export type AppStackNavigation = NativeStackNavigationProp<AppStackParamList>;

export type TeamsScreenNav = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Teams'>,
  NativeStackNavigationProp<AppStackParamList>
>;
