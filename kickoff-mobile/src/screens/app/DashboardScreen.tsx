import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLeagueStandings, usePlayerStats, useLeagueSettings } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import StatCard from '../../components/StatCard';
import { MatchesCard } from '../../components/MatchesCard';
import { useQueryClient } from '@tanstack/react-query';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND, TEXT_COLOR } from '../../theme';

const DashboardScreen = () => {
  const queryClient = useQueryClient();
  const { data: standings, isLoading: standingsLoading } = useLeagueStandings();
  const { data: stats, isLoading: statsLoading } = usePlayerStats();
  const { seasonName, isLoading: settingsLoading } = useLeagueSettings();

  const onRefresh = React.useCallback(() => {
    // Invalidate queries to refetch fresh data
    queryClient.invalidateQueries({ queryKey: ['standings'] });
    queryClient.invalidateQueries({ queryKey: ['playerStats'] });
    queryClient.invalidateQueries({ queryKey: ['settings', 'league'] });
  }, [queryClient]);

  if (standingsLoading || statsLoading || settingsLoading) return <LoadingView />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={standingsLoading || statsLoading || settingsLoading} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>{seasonName}</Text>
      <Text style={styles.subtitle}>League overview</Text>

      <StatCard title="Top Teams">
        {standings?.slice(0, 3).map((team, index) => (
          <View key={team.teamId} style={styles.cardRow}>
            <Text style={styles.position}>{index + 1}</Text>
            <Text style={styles.teamName}>{team.teamName}</Text>
            <Text style={styles.points}>{team.points} pts</Text>
          </View>
        ))}
      </StatCard>

      <StatCard title="Top Scorers">
        {stats?.sort((a, b) => b.goals - a.goals).slice(0, 5).map((player) => (
          <View key={player.playerId} style={styles.cardRow}>
            <Text style={styles.playerName}>{player.playerName}</Text>
            <Text style={styles.goals}>{player.goals} goals</Text>
          </View>
        ))}
      </StatCard>
      <MatchesCard />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterBtnActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  filterBtnText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: TEXT_COLOR,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 20,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
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
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_COLOR,
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
    color: PRIMARY_COLOR,
  },
  playerName: {
    flex: 1,
  },
  goals: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
});

export default DashboardScreen;
