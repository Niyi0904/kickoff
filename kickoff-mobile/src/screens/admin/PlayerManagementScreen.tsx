import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { usePlayers, useTeams, usePlayerStats } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function PlayerManagementScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { data: players = [], isLoading } = usePlayers();
  const { data: teams = [] } = useTeams();
  const { data: stats = [] } = usePlayerStats();

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);
  const statsMap = useMemo(() => new Map(stats.map(s => [s.playerId, s])), [stats]);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Players</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Players</Text>
          <View style={styles.list}>
            {players.map((player) => {
              const team = teamMap.get(player.teamId);
              const s = statsMap.get(player.id);
              return (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerRow}
                  onPress={() => navigation.navigate('PlayerForm', { playerId: player.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.playerBadge, { backgroundColor: team ? `${team.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                    <Text style={styles.playerBadgeText}>👤</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={[styles.playerTeam, { color: team?.primaryColor || '#5A6880' }]}>
                      {team?.name || '?'} · {player.position}
                    </Text>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={styles.playerStat}>{s?.goals ?? 0}G</Text>
                    <Text style={styles.playerStat}>{s?.assists ?? 0}A</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PlayerForm', {})}
        >
          <Text style={styles.addButtonText}>Add Player</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8, gap: 12 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F0F4FF', textTransform: 'uppercase' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginBottom: 10 },
  list: { gap: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', gap: 12 },
  playerBadge: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  playerBadgeText: { fontSize: 18 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '700', color: '#F0F4FF' },
  playerTeam: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  playerStats: { flexDirection: 'row', gap: 12 },
  playerStat: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: '#5A6880' },
  arrow: { color: '#5A6880', fontSize: 18 },
  addButton: { marginHorizontal: 20, height: 50, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  addButtonText: { color: '#09101E', fontSize: 15, fontWeight: '700' },
});
