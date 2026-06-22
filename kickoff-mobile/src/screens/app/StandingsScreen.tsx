import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { TEAMS, getGoalDiff } from '../../lib/data';

function FormBadge({ r }: { r: 'W' | 'D' | 'L' }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    W: { bg: 'rgba(0,230,118,0.15)', color: '#00E676' },
    D: { bg: 'rgba(255,184,0,0.15)', color: '#FFB800' },
    L: { bg: 'rgba(255,61,90,0.15)', color: '#FF3D5A' },
  };
  return (
    <View style={[styles.formBadge, { backgroundColor: cfg[r].bg }]}>
      <Text style={[styles.formBadgeText, { color: cfg[r].color }]}>{r}</Text>
    </View>
  );
}

export default function StandingsScreen({ navigation }: any) {
  const sorted = [...TEAMS].sort((a, b) => b.points - a.points || getGoalDiff(b) - getGoalDiff(a));

  const getZoneColor = (pos: number) => {
    if (pos <= 2) return '#00E676';
    if (pos <= 4) return '#4D7EFF';
    if (pos >= sorted.length - 1) return '#FF3D5A';
    return 'transparent';
  };

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
          {sorted.map((team, idx) => {
            const pos = idx + 1;
            const zoneColor = getZoneColor(pos);
            return (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.tableRow,
                  { borderLeftColor: zoneColor === 'transparent' ? 'transparent' : zoneColor },
                  idx % 2 === 0 ? { backgroundColor: '#131B2E' } : { backgroundColor: '#111728' },
                ]}
                onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.td, { width: 20 }]}>
                  <Text style={[styles.tdText, { color: pos <= 2 ? '#00E676' : pos >= sorted.length ? '#FF3D5A' : '#7A8699' }]}>{pos}</Text>
                </View>
                <View style={[styles.td, { flex: 1 }]}>
                  <View style={[styles.teamBadge, { backgroundColor: `${team.color}20` }]}>
                    <Text style={styles.teamBadgeText}>{team.badge}</Text>
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName} numberOfLines={1}>{team.name}</Text>
                    <View style={styles.formRow}>
                      {team.form.slice(-5).map((r, i) => <FormBadge key={i} r={r} />)}
                    </View>
                  </View>
                </View>
                {[team.played, team.wins, team.draws, team.losses].map((v, i) => (
                  <View key={i} style={[styles.td, { width: 22 }]}>
                    <Text style={styles.tdText}>{v}</Text>
                  </View>
                ))}
                <View style={[styles.td, { width: 22 }]}>
                  <Text style={[styles.tdText, { color: getGoalDiff(team) > 0 ? '#00E676' : getGoalDiff(team) < 0 ? '#FF3D5A' : '#B8C4D8' }]}>
                    {getGoalDiff(team) > 0 ? '+' : ''}{getGoalDiff(team)}
                  </Text>
                </View>
                <View style={[styles.td, { width: 34 }]}>
                  <Text style={[styles.tdText, styles.tdTextAccent]}>{team.points}</Text>
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
              { label: 'Total Goals', value: TEAMS.reduce((a, t) => a + t.goalsFor, 0).toString() },
              { label: 'Avg per Game', value: (TEAMS.reduce((a, t) => a + t.goalsFor, 0) / Math.max(1, TEAMS.reduce((a, t) => a + t.played, 0) / 2)).toFixed(1) },
              { label: 'Leaders', value: sorted[0].shortName },
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
  container: {
    flex: 1,
    backgroundColor: '#09101E',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F4FF',
    textTransform: 'uppercase',
  },
  legendRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 11,
    color: '#5A6880',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#0E1525',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 8,
  },
  th: {
    alignItems: 'center',
  },
  thText: {
    fontSize: 10,
    color: '#5A6880',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  thTextAccent: {
    color: '#00E676',
  },
  tableBody: {
    paddingHorizontal: 20,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  td: {
    alignItems: 'center',
  },
  tdText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#B8C4D8',
  },
  tdTextAccent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00E676',
  },
  teamBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  teamBadgeText: {
    fontSize: 16,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 36,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  formBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tableFooter: {
    height: 12,
    backgroundColor: '#131B2E',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 13,
    color: '#5A6880',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: '#00E676',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});