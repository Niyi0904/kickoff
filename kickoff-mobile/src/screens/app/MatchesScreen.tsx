import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { FIXTURES, getTeamById } from '../../lib/data';

type FilterType = 'all' | 'upcoming' | 'completed';

function FixtureCard({ fixture, onPress }: { fixture: typeof FIXTURES[0]; onPress: () => void }) {
  const home = getTeamById(fixture.homeTeamId)!;
  const away = getTeamById(fixture.awayTeamId)!;
  const isCompleted = fixture.status === 'completed';
  const isLive = fixture.status === 'live';

  return (
    <TouchableOpacity style={styles.fixtureCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.fixtureHeader}>
        <Text style={styles.fixtureMeta}>GW{fixture.gameweek} · {fixture.venue.split(' ').slice(0, 3).join(' ')}</Text>
        <View style={[styles.statusBadge, isLive && styles.statusBadgeLive, isCompleted && styles.statusBadgeCompleted]}>
          <Text style={[styles.statusText, isLive && styles.statusTextLive, isCompleted && styles.statusTextCompleted]}>
            {isLive ? '● LIVE' : isCompleted ? 'FT' : fixture.time}
          </Text>
        </View>
      </View>

      <View style={styles.fixtureBody}>
        <View style={styles.teamCol}>
          <View style={[styles.badge, { backgroundColor: `${home.color}18`, borderColor: `${home.color}35` }]}>
            <Text style={styles.badgeText}>{home.badge}</Text>
          </View>
          <Text style={styles.teamName}>{home.shortName}</Text>
        </View>

        <View style={styles.scoreCol}>
          {isCompleted || isLive ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.score, { color: fixture.homeScore! > fixture.awayScore! ? '#00E676' : '#F0F4FF' }]}>{fixture.homeScore}</Text>
              <Text style={styles.scoreDash}>-</Text>
              <Text style={[styles.score, { color: fixture.awayScore! > fixture.homeScore! ? '#00E676' : '#F0F4FF' }]}>{fixture.awayScore}</Text>
            </View>
          ) : (
            <View style={styles.vsRow}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.dateText}>{fixture.date}</Text>
            </View>
          )}
        </View>

        <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
          <View style={[styles.badge, { backgroundColor: `${away.color}18`, borderColor: `${away.color}35` }]}>
            <Text style={styles.badgeText}>{away.badge}</Text>
          </View>
          <Text style={styles.teamName}>{away.shortName}</Text>
        </View>
      </View>

      {isCompleted && fixture.homeScorers && fixture.homeScorers.length > 0 && (
        <View style={styles.scorersRow}>
          <Text style={styles.scorersText}>⚽ {fixture.homeScorers[0]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MatchesScreen({ navigation }: any) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = FIXTURES.filter(f => {
    if (filter === 'upcoming') return f.status === 'upcoming';
    if (filter === 'completed') return f.status === 'completed';
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped = filtered.reduce((acc, f) => {
    const key = `GW${f.gameweek}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, typeof FIXTURES>);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fixtures</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(['all', 'upcoming', 'completed'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          {Object.entries(grouped).sort(([a], [b]) => parseInt(b.replace('GW', '')) - parseInt(a.replace('GW', ''))).map(([gw, fixtures]) => (
            <View key={gw} style={styles.group}>
              <Text style={styles.groupLabel}>{gw}</Text>
              {fixtures.map(f => (
                <FixtureCard
                  key={f.id}
                  fixture={f}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: f.id })}
                />
              ))}
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No fixtures found</Text>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    color: '#F0F4FF',
    fontSize: 16,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00E676',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A8699',
  },
  filterChipTextActive: {
    color: '#09101E',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  group: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 12,
    color: '#5A6880',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  fixtureCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  fixtureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fixtureMeta: {
    fontSize: 11,
    color: '#5A6880',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusBadgeLive: {
    backgroundColor: 'rgba(255,184,0,0.15)',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(0,230,118,0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#5A6880',
  },
  statusTextLive: {
    color: '#FFB800',
  },
  statusTextCompleted: {
    color: '#00E676',
  },
  fixtureBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 22,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0F4FF',
    textAlign: 'center',
  },
  scoreCol: {
    flex: 1.2,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  score: {
    fontFamily: 'monospace',
    fontSize: 30,
    fontWeight: '700',
  },
  scoreDash: {
    fontSize: 18,
    color: '#5A6880',
  },
  vsRow: {
    alignItems: 'center',
    gap: 4,
  },
  vsText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F0F4FF',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#5A6880',
  },
  scorersRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    gap: 8,
  },
  scorersText: {
    fontSize: 11,
    color: '#5A6880',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#5A6880',
  },
});