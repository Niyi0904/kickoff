import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useLeagueStandings, useTeams } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function StandingsScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { data: standings = [], isLoading } = useLeagueStandings();
  const { data: teams = [] } = useTeams();
  const teamMap = React.useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  if (isLoading) return <LoadingView />;

  const sorted = [...standings].sort((a, b) => a.position - b.position);

  const getZoneColor = (pos: number) => {
    if (pos <= 2) return '#00E676';
    if (pos <= 4) return '#4D7EFF';
    if (pos >= sorted.length - 1) return '#FF3D5A';
    return 'transparent';
  };

  const totalGoals = sorted.reduce((a, t) => a + t.goalsFor, 0);
  const avgPerGame = sorted.reduce((a, t) => a + t.played, 0) > 0
    ? (totalGoals / (sorted.reduce((a, t) => a + t.played, 0) / 2)).toFixed(1)
    : '0';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Standings</Text>
        </View>

        {/* Zone legend */}
        <View style={styles.legendRow}>
          {[
            { label: 'Top 2 (Champions)', color: '#00E676' },
            { label: 'Top 4 (Promotion)', color: '#4D7EFF' },
            { label: 'Relegation', color: '#FF3D5A' },
          ].map(z => (
            <View key={z.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: z.color, opacity: 0.7 }]} />
              <Text style={styles.legendLabel}>{z.label}</Text>
            </View>
          ))}
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <View style={[styles.th, { width: 20 }]}>
            <Text style={styles.thText}>#</Text>
          </View>
          <View style={[styles.th, { flex: 1 }]}>
            <Text style={styles.thText}>Team</Text>
          </View>
          {['P', 'W', 'D', 'L', 'GD', 'Pts'].map(h => (
            <View key={h} style={[styles.th, { width: h === 'Pts' ? 34 : 22 }]}>
              <Text style={[styles.thText, h === 'Pts' && styles.thTextAccent]}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Team rows */}
        <View style={styles.tableBody}>
          {sorted.map((entry, idx) => {
            const pos = entry.position;
            const zoneColor = getZoneColor(pos);
            const team = teamMap.get(entry.teamId);
            return (
              <TouchableOpacity
                key={entry.teamId}
                style={[
                  styles.tableRow,
                  { borderLeftColor: zoneColor === 'transparent' ? 'transparent' : zoneColor },
                  idx % 2 === 0 ? { backgroundColor: '#131B2E' } : { backgroundColor: '#111728' },
                ]}
                onPress={() => navigation.navigate('TeamDetail', { teamId: entry.teamId })}
                activeOpacity={0.8}
              >
                <View style={[styles.td, { width: 20 }]}>
                  <Text style={[styles.tdText, { color: pos <= 2 ? '#00E676' : pos >= sorted.length ? '#FF3D5A' : '#7A8699' }]}>{pos}</Text>
                </View>
                <View style={[styles.td, { flex: 1 }]}>
                  <View style={[styles.teamBadge, { backgroundColor: team ? `${team.primaryColor}20` : 'rgba(255,255,255,0.05)' }]}>
                    <Text style={styles.teamBadgeText}>{team ? (team.name[0] || '?') : '?'}</Text>
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName} numberOfLines={1}>{entry.teamName}</Text>
                  </View>
                </View>
                {[entry.played, entry.wins, entry.draws, entry.losses].map((v, i) => (
                  <View key={i} style={[styles.td, { width: 22 }]}>
                    <Text style={styles.tdText}>{v}</Text>
                  </View>
                ))}
                <View style={[styles.td, { width: 22 }]}>
                  <Text style={[styles.tdText, { color: entry.goalDifference > 0 ? '#00E676' : entry.goalDifference < 0 ? '#FF3D5A' : '#B8C4D8' }]}>
                    {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                  </Text>
                </View>
                <View style={[styles.td, { width: 34 }]}>
                  <Text style={[styles.tdText, styles.tdTextAccent]}>{entry.points}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom border */}
        <View style={styles.tableFooter} />

        {/* Stats summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Season at a Glance</Text>
          <View style={styles.summaryCards}>
            {[
              { label: 'Total Goals', value: totalGoals.toString() },
              { label: 'Avg per Game', value: avgPerGame },
              { label: 'Leaders', value: sorted[0]?.teamName || '-' },
            ].map(s => (
              <View key={s.label} style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F0F4FF', textTransform: 'uppercase' },
  legendRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendLabel: { fontSize: 11, color: '#5A6880' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#0E1525', borderTopLeftRadius: 12, borderTopRightRadius: 12, gap: 8 },
  th: { alignItems: 'center' },
  thText: { fontSize: 10, color: '#5A6880', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  thTextAccent: { color: '#00E676' },
  tableBody: { paddingHorizontal: 20 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 8, borderLeftWidth: 3, borderRightWidth: 0, borderTopWidth: 1, borderBottomWidth: 0, borderTopColor: 'rgba(255,255,255,0.03)' },
  td: { alignItems: 'center' },
  tdText: { fontFamily: 'monospace', fontSize: 12, color: '#B8C4D8' },
  tdTextAccent: { fontSize: 15, fontWeight: '700', color: '#00E676' },
  teamBadge: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, top: 0 },
  teamBadgeText: { fontSize: 16, color: '#F0F4FF' },
  teamInfo: { flex: 1, marginLeft: 36 },
  teamName: { fontSize: 13, fontWeight: '600', color: '#F0F4FF' },
  formRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  formBadge: { width: 18, height: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  formBadgeText: { fontSize: 10, fontWeight: '700' },
  tableFooter: { height: 12, backgroundColor: '#131B2E', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 16 },
  summarySection: { paddingHorizontal: 20, marginBottom: 24 },
  summaryTitle: { fontSize: 13, color: '#5A6880', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  summaryCards: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#131B2E', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  summaryValue: { fontFamily: 'monospace', fontSize: 20, fontWeight: '700', color: '#00E676' },
  summaryLabel: { fontSize: 11, color: '#5A6880', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
});
