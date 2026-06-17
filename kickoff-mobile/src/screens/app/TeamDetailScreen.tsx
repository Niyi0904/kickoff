import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useTeam,
  usePlayers,
  useMatches,
  useGoals,
} from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import type { AppStackParamList } from '../../navigation/types';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND, TEXT_COLOR } from '../../theme';

const TeamDetailScreen = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'TeamDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { teamId } = route.params;

  const { data: team, isLoading } = useTeam(teamId);
  const { data: allPlayers } = usePlayers();
  const { data: matches } = useMatches();
  const { data: goals } = useGoals();

  const teamPlayers = useMemo(
    () => (allPlayers ?? []).filter((p) => p.teamId === teamId),
    [allPlayers, teamId],
  );

  const teamMatches = useMemo(
    () =>
      (matches ?? []).filter(
        (m) => m.status === 'played' && (m.homeTeamId === teamId || m.awayTeamId === teamId),
      ),
    [matches, teamId],
  );

  const totalGoals = useMemo(() => {
    const ids = new Set(teamPlayers.map((p) => p.id));
    return (goals ?? []).filter((g) => ids.has(g.playerId)).length;
  }, [goals, teamPlayers]);

  const manager = teamPlayers.find((p) => p.isManager);

  if (isLoading) return <LoadingView />;
  if (!team) {
    return <EmptyState message="Team not found." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { borderLeftColor: team.primaryColor }]}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.sub}>
          {team.stadium} • Est. {team.founded}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{teamMatches.length}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{totalGoals}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{teamPlayers.length}</Text>
          <Text style={styles.statLabel}>Squad</Text>
        </View>
      </View>

      {manager && (
        <View style={styles.managerCard}>
          <Text style={styles.sectionTitle}>Team manager</Text>
          <Text style={styles.managerName}>{manager.name}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Squad ({teamPlayers.length})</Text>
      {teamPlayers.length === 0 ? (
        <EmptyState message="No players on this team." />
      ) : (
        teamPlayers.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.playerRow}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: p.id })}
          >
            <Text style={styles.playerNum}>#{p.number}</Text>
            <Text style={styles.playerName}>{p.name}</Text>
            <Text style={styles.playerPos}>{p.position}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR, padding: 16 },
  header: {
    backgroundColor: CARD_BACKGROUND,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 6,
    marginBottom: 16,
  },
  teamName: { fontSize: 22, fontWeight: 'bold', color: TEXT_COLOR },
  sub: { color: '#666', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statVal: { fontSize: 20, fontWeight: 'bold', color: PRIMARY_COLOR },
  statLabel: { fontSize: 10, color: '#888', marginTop: 4, textTransform: 'uppercase' },
  managerCard: {
    backgroundColor: CARD_BACKGROUND,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: TEXT_COLOR },
  managerName: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  playerNum: { width: 40, fontWeight: 'bold', color: PRIMARY_COLOR },
  playerName: { flex: 1, fontWeight: '600', color: TEXT_COLOR },
  playerPos: { fontSize: 11, color: '#888' },
});

export default TeamDetailScreen;
