import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLeagueStandings, usePlayerStats, useLeagueSettings } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const DashboardScreen = () => {
  const { data: standings, isLoading: standingsLoading } = useLeagueStandings();
  const { data: stats, isLoading: statsLoading } = usePlayerStats();
  const { seasonName, isLoading: settingsLoading } = useLeagueSettings();

  if (standingsLoading || statsLoading || settingsLoading) return <LoadingView />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{seasonName}</Text>
      <Text style={styles.subtitle}>League overview</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Teams</Text>
        {standings?.slice(0, 3).map((team, index) => (
          <View key={team.teamId} style={styles.cardRow}>
            <Text style={styles.position}>{index + 1}</Text>
            <Text style={styles.teamName}>{team.teamName}</Text>
            <Text style={styles.points}>{team.points} pts</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Scorers</Text>
        {stats?.sort((a, b) => b.goals - a.goals).slice(0, 5).map((player) => (
          <View key={player.playerId} style={styles.cardRow}>
            <Text style={styles.playerName}>{player.playerName}</Text>
            <Text style={styles.goals}>{player.goals} goals</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#d30707',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  position: {
    fontWeight: 'bold',
    width: 30,
  },
  teamName: {
    flex: 1,
    marginLeft: 10,
  },
  points: {
    fontWeight: 'bold',
    color: '#d30707',
  },
  playerName: {
    flex: 1,
  },
  goals: {
    fontWeight: 'bold',
    color: '#d30707',
  },
});

export default DashboardScreen;
