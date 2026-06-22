import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { TEAMS } from '../../lib/data';

export default function TeamsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const filtered = TEAMS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.shortName.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Teams</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search teams..."
              placeholderTextColor="#5A6880"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Teams grid */}
        <View style={styles.grid}>
          {filtered.map((team, idx) => (
            <TouchableOpacity
              key={team.id}
              style={styles.teamCard}
              onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}
              activeOpacity={0.9}
            >
              {/* Position badge */}
              <View style={[styles.posBadge, { backgroundColor: team.position <= 2 ? 'rgba(0,230,118,0.15)' : team.position >= TEAMS.length ? 'rgba(255,61,90,0.15)' : 'rgba(255,255,255,0.05)' }]}>
                <Text style={[styles.posBadgeText, { color: team.position <= 2 ? '#00E676' : team.position >= TEAMS.length ? '#FF3D5A' : '#7A8699' }]}>{team.position}</Text>
              </View>

              {/* Badge */}
              <View style={[styles.badge, { backgroundColor: `${team.color}20`, borderColor: `${team.color}40` }]}>
                <Text style={styles.badgeText}>{team.badge}</Text>
              </View>

              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamShort}>{team.shortName}</Text>

              {/* Stats row */}
              <View style={styles.statsRow}>
                {[
                  { label: 'Pts', value: team.points, color: '#00E676' },
                  { label: 'W', value: team.wins, color: '#F0F4FF' },
                  { label: 'GF', value: team.goalsFor, color: '#F0F4FF' },
                ].map(s => (
                  <View key={s.label} style={styles.statItem}>
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No teams found</Text>
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 16,
    fontSize: 14,
    color: '#5A6880',
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    height: 44,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    color: '#F0F4FF',
    paddingLeft: 42,
    paddingRight: 16,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  teamCard: {
    width: '47%',
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    position: 'relative',
  },
  posBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posBadgeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 30,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0F4FF',
    marginBottom: 2,
    textAlign: 'center',
  },
  teamShort: {
    fontSize: 11,
    color: '#5A6880',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
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