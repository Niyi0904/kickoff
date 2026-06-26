import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useMatches, useTeams } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { useTheme } from '../../theme';

type FilterType = 'all' | 'upcoming' | 'played';

const FixtureCard = React.memo(function FixtureCard({ match, home, away, onPress }: { match: any; home: any; away: any; onPress: () => void }) {
  const isCompleted = match.status === 'played';
  const isLive = false;

  return (
    <TouchableOpacity style={styles.fixtureCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.fixtureHeader}>
        <Text style={styles.fixtureMeta}>GW{match.matchDay}</Text>
        <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
          <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
            {isCompleted ? 'FT' : match.time || 'TBD'}
          </Text>
        </View>
      </View>

      <View style={styles.fixtureBody}>
        <View style={styles.teamCol}>
          <View style={[styles.badge, { backgroundColor: `${home?.primaryColor || '#3b82f6'}18`, borderColor: `${home?.primaryColor || '#3b82f6'}35` }]}>
            <Text style={styles.badgeText}>{home ? (home.name[0] || '?') : '?'}</Text>
          </View>
          <Text style={styles.teamName}>{home ? home.name.split(' ')[0] : '?'}</Text>
        </View>

        <View style={styles.scoreCol}>
          {isCompleted ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.score, { color: match.homeScore > match.awayScore ? '#00E676' : '#F0F4FF' }]}>{match.homeScore}</Text>
              <Text style={styles.scoreDash}>-</Text>
              <Text style={[styles.score, { color: match.awayScore > match.homeScore ? '#00E676' : '#F0F4FF' }]}>{match.awayScore}</Text>
            </View>
          ) : (
            <View style={styles.vsRow}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.dateText}>{match.scheduledDate || ''}</Text>
            </View>
          )}
        </View>

        <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
          <View style={[styles.badge, { backgroundColor: `${away?.primaryColor || '#3b82f6'}18`, borderColor: `${away?.primaryColor || '#3b82f6'}35` }]}>
            <Text style={styles.badgeText}>{away ? (away.name[0] || '?') : '?'}</Text>
          </View>
          <Text style={styles.teamName}>{away ? away.name.split(' ')[0] : '?'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function MatchesScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: matches = [], isLoading } = useMatches();
  const { data: teams = [] } = useTeams();

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  const handleMatchPress = useCallback((matchId: string) => {
    navigation.navigate('MatchDetail', { matchId });
  }, [navigation]);

  if (isLoading) return <LoadingView />;

  const filtered = matches.filter(m => {
    if (filter === 'upcoming') return m.status === 'upcoming';
    if (filter === 'played') return m.status === 'played';
    return true;
  });

  const grouped = filtered.reduce((acc, m) => {
    const key = `GW${m.matchDay}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, typeof matches>);

  const sections = useMemo(() =>
    Object.entries(grouped)
      .sort(([a], [b]) => parseInt(b.replace('GW', '')) - parseInt(a.replace('GW', '')))
      .map(([gw, fixtures]) => ({ gw, fixtures })),
    [grouped],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Fixtures</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'upcoming', 'played'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, { backgroundColor: filter === f ? colors.primary : colors.border }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, { color: filter === f ? colors.background : colors.textMuted }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sections}
        keyExtractor={item => item.gw}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        windowSize={3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No fixtures found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.group}>
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>{item.gw}</Text>
            {item.fixtures.map(m => (
              <FixtureCard
                key={m.id}
                match={m}
                home={teamMap.get(m.homeTeamId)}
                away={teamMap.get(m.awayTeamId)}
                onPress={() => handleMatchPress(m.id)}
              />
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', textTransform: 'uppercase' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  group: { marginBottom: 16 },
  groupLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  fixtureCard: { backgroundColor: '#131B2E', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  fixtureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fixtureMeta: { fontSize: 11, color: '#5A6880', fontWeight: '500' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(255,255,255,0.05)' },
  statusBadgeLive: { backgroundColor: 'rgba(255,184,0,0.15)' },
  statusBadgeCompleted: { backgroundColor: 'rgba(0,230,118,0.1)' },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#5A6880' },
  statusTextLive: { color: '#FFB800' },
  statusTextCompleted: { color: '#00E676' },
  fixtureBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamCol: { flex: 1, alignItems: 'center', gap: 6 },
  badge: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 22, color: '#F0F4FF' },
  teamName: { fontSize: 13, fontWeight: '700', color: '#F0F4FF', textAlign: 'center' },
  scoreCol: { flex: 1.2, alignItems: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  score: { fontFamily: 'monospace', fontSize: 30, fontWeight: '700' },
  scoreDash: { fontSize: 18, color: '#5A6880' },
  vsRow: { alignItems: 'center', gap: 4 },
  vsText: { fontSize: 22, fontWeight: '800', color: '#F0F4FF', letterSpacing: 1 },
  dateText: { fontSize: 12, color: '#5A6880' },
  scorersRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', alignItems: 'center', gap: 8 },
  scorersText: { fontSize: 11, color: '#5A6880' },
  empty: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, color: '#5A6880' },
});
