import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  usePlayer,
  useTeams,
  useGoals,
  useAssists,
  useYellowCards,
  useRedCards,
} from '../../hooks/useAppData';
import { getPlayerStatsForId } from '../../firebase/firestore';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import type { AppStackParamList } from '../../navigation/types';

const PlayerDetailScreen = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'PlayerDetail'>>();
  const { playerId } = route.params;

  const { data: player, isLoading } = usePlayer(playerId);
  const { data: teams } = useTeams();
  const { data: goals = [] } = useGoals();
  const { data: assists = [] } = useAssists();
  const { data: yellows = [] } = useYellowCards();
  const { data: reds = [] } = useRedCards();

  const stats = useMemo(
    () => getPlayerStatsForId(playerId, goals, assists, yellows, reds),
    [playerId, goals, assists, yellows, reds],
  );

  if (isLoading) return <LoadingView />;
  if (!player) return <EmptyState message="Player not found." />;

  const team = teams?.find((t) => t.id === player.teamId);

  const statItems = [
    { label: 'Goals', value: stats.goals },
    { label: 'Assists', value: stats.assists },
    { label: 'Matches', value: stats.matches },
    { label: 'Yellow', value: stats.yellowCards },
    { label: 'Red', value: stats.redCards },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{player.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>#{player.number}</Text>
        </View>
        <Text style={styles.meta}>
          {player.position} • {team?.name ?? 'Unknown team'}
          {player.isManager ? ' • Manager' : ''}
        </Text>
      </View>

      <View style={styles.grid}>
        {statItems.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        Match-by-match charts and profile claim are available on web; coming to mobile in a later wave.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: 'bold' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d30707',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  meta: { color: '#666', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '30%',
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#d30707' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  note: { marginTop: 24, fontSize: 12, color: '#888', textAlign: 'center' },
});

export default PlayerDetailScreen;
