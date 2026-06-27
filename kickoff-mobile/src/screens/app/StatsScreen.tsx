import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { usePlayerStats, useTeams, useLeagueStandings } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const TABS = ['Scorers', 'Assists', 'Teams', 'Clean Sheets'] as const;
type Tab = typeof TABS[number];

export default function StatsScreen({ navigation }: { navigation: AppListScreenProps }) {
  const [tab, setTab] = useState<Tab>('Scorers');
  const { data: playerStats = [], isLoading } = usePlayerStats();
  const { data: teams = [] } = useTeams();
  const { data: standings = [] } = useLeagueStandings();

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  const scorers = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 8);
  const assisters = [...playerStats].sort((a, b) => b.assists - a.assists).slice(0, 8);
  const teamStats = [...standings].sort((a, b) => b.goalsFor - a.goalsFor);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabChip, tab === t && styles.tabChipActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabChipText, tab === t && styles.tabChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <View style={styles.list}>
          {tab === 'Scorers' && scorers.map((player, idx) => {
            const team = teamMap.get(player.teamId);
            return (
              <TouchableOpacity
                key={player.playerId}
                style={[styles.statRow, idx === 0 && styles.statRowTop]}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.playerId })}
                activeOpacity={0.8}
              >
                <Text style={[styles.rank, { color: idx === 0 ? '#00E676' : '#5A6880' }]}>{idx + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: team ? `${team.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{player.playerName}</Text>
                  <Text style={[styles.team, { color: team?.primaryColor || '#5A6880' }]}>{player.teamName} · FW</Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.bigNum, { color: '#00E676' }]}>{player.goals}</Text>
                  <Text style={styles.smallLabel}>goals</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {tab === 'Assists' && assisters.map((player, idx) => {
            const team = teamMap.get(player.teamId);
            return (
              <TouchableOpacity
                key={player.playerId}
                style={styles.statRow}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.playerId })}
                activeOpacity={0.8}
              >
                <Text style={[styles.rank, { color: idx === 0 ? '#4D7EFF' : '#5A6880' }]}>{idx + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: team ? `${team.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{player.playerName}</Text>
                  <Text style={[styles.team, { color: team?.primaryColor || '#5A6880' }]}>{player.teamName} · FW</Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.bigNum, { color: '#4D7EFF' }]}>{player.assists}</Text>
                  <Text style={styles.smallLabel}>assists</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {tab === 'Teams' && teamStats.map((entry, idx) => {
            const team = teamMap.get(entry.teamId);
            return (
              <TouchableOpacity
                key={entry.teamId}
                style={styles.statRow}
                onPress={() => navigation.navigate('TeamDetail', { teamId: entry.teamId })}
                activeOpacity={0.8}
              >
                <Text style={[styles.rank, { color: idx === 0 ? '#00E676' : '#5A6880' }]}>{idx + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: team ? `${team.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                  <Text style={styles.avatarText}>{team ? team.name[0] : '?'}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{entry.teamName}</Text>
                  <Text style={styles.team}>{entry.played} games · {entry.goalsAgainst} conceded</Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.bigNum, { color: '#00E676' }]}>{entry.goalsFor}</Text>
                  <Text style={styles.smallLabel}>scored</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {tab === 'Clean Sheets' && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧤</Text>
              <Text style={styles.emptyText}>No goalkeeper data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F0F4FF', textTransform: 'uppercase' },
  tabRow: { paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  tabChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 8 },
  tabChipActive: { backgroundColor: '#00E676' },
  tabChipText: { fontSize: 13, fontWeight: '600', color: '#7A8699' },
  tabChipTextActive: { color: '#09101E' },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', gap: 12 },
  statRowTop: { borderColor: 'rgba(0,230,118,0.2)' },
  rank: { width: 24, textAlign: 'center', fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
  avatar: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#F0F4FF' },
  team: { fontSize: 11, color: '#5A6880', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  bigNum: { fontFamily: 'monospace', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  smallLabel: { fontSize: 10, color: '#5A6880', textTransform: 'uppercase', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: '#5A6880' },
});
