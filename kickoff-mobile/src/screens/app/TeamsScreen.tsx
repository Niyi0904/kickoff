import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTeams, usePlayers } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import type { AppStackParamList } from '../../navigation/types';

const TeamsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: players } = usePlayers();

  if (teamsLoading) return <LoadingView />;

  const getTeamPlayerCount = (teamId: string) => {
    return players?.filter(p => p.teamId === teamId).length || 0;
  };

  return (
    <ScrollView style={styles.container}>
      {teams?.map((team) => (
        <TouchableOpacity
          key={team.id}
          style={styles.teamCard}
          onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}
        >
          <View
            style={[
              styles.colorBadge,
              { backgroundColor: team.primaryColor },
            ]}
          />
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamDetails}>
              {team.stadium} • {getTeamPlayerCount(team.id)} players
            </Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorBadge: {
    width: 12,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
  },
  teamDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#ccc',
  },
});

export default TeamsScreen;
