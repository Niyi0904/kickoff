import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useMatches, useTeams } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function MatchManagementScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { data: matches = [], isLoading } = useMatches();
  const { data: teams = [] } = useTeams();

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Matches</Text>
        </View>

        <View style={styles.list}>
          {matches.map((match) => {
            const home = teamMap.get(match.homeTeamId);
            const away = teamMap.get(match.awayTeamId);
            const isCompleted = match.status === 'played';
            return (
              <TouchableOpacity
                key={match.id}
                style={styles.matchRow}
                onPress={() => navigation.navigate('MatchForm', { matchId: match.id })}
                activeOpacity={0.8}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchMeta}>GW{match.matchDay} · {match.scheduledDate || 'TBD'}</Text>
                  <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
                    <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
                      {isCompleted ? 'FT' : match.time || 'TBD'}
                    </Text>
                  </View>
                </View>
                <View style={styles.matchBody}>
                  <View style={styles.teamCol}>
                    <View style={[styles.teamBadge, { backgroundColor: home ? `${home.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                      <Text style={styles.teamBadgeText}>{home ? home.name[0] : '?'}</Text>
                    </View>
                    <Text style={styles.teamName}>{home?.name?.split(' ')[0] || '?'}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    {isCompleted ? (
                      <Text style={styles.scoreText}>{match.homeScore}–{match.awayScore}</Text>
                    ) : (
                      <Text style={styles.vsText}>VS</Text>
                    )}
                  </View>
                  <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
                    <View style={[styles.teamBadge, { backgroundColor: away ? `${away.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                      <Text style={styles.teamBadgeText}>{away ? away.name[0] : '?'}</Text>
                    </View>
                    <Text style={styles.teamName}>{away?.name?.split(' ')[0] || '?'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MatchForm', {})}
        >
          <Text style={styles.addButtonText}>Add Match</Text>
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
  list: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  matchRow: { backgroundColor: '#131B2E', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  matchMeta: { fontSize: 11, color: '#5A6880', fontWeight: '500' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(255,255,255,0.05)' },
  statusBadgeCompleted: { backgroundColor: 'rgba(0,230,118,0.1)' },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#5A6880' },
  statusTextCompleted: { color: '#00E676' },
  matchBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamCol: { flex: 1, alignItems: 'center', gap: 4 },
  teamBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText: { fontSize: 16, fontWeight: '600', color: '#F0F4FF' },
  teamName: { fontSize: 12, fontWeight: '600', color: '#F0F4FF' },
  scoreCol: { flex: 1, alignItems: 'center' },
  scoreText: { fontFamily: 'monospace', fontSize: 20, fontWeight: '700', color: '#00E676' },
  vsText: { fontSize: 16, fontWeight: '800', color: '#F0F4FF' },
  addButton: { marginHorizontal: 20, height: 50, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  addButtonText: { color: '#09101E', fontSize: 15, fontWeight: '700' },
});
