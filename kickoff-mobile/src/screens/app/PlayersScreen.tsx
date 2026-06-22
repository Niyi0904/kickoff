import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { PLAYERS, getTeamById } from '../../lib/data';

const POSITIONS = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'FW'];

export default function PlayersScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All');

  const filtered = PLAYERS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === 'All' || p.position === posFilter;
    return matchSearch && matchPos;
  });

  const sorted = [...filtered].sort((a, b) => b.goals - a.goals);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Players</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search players..."
              placeholderTextColor="#5A6880"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Position filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {POSITIONS.map(pos => (
            <TouchableOpacity
              key={pos}
              style={[styles.filterChip, posFilter === pos && styles.filterChipActive]}
              onPress={() => setPosFilter(pos)}
            >
              <Text style={[styles.filterChipText, posFilter === pos && styles.filterChipTextActive]}>
                {pos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Players list */}
        <View style={styles.list}>
          {sorted.map((player, idx) => {
            const team = getTeamById(player.teamId)!;
            return (
              <TouchableOpacity
                key={player.id}
                style={styles.playerCard}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                activeOpacity={0.9}
              >
                {/* Rank */}
                <Text style={[styles.rank, { color: idx === 0 ? '#00E676' : '#5A6880' }]}>{idx + 1}</Text>

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: `${team.color}30`, borderColor: `${team.color}30` }]}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                  {player.isClaimed && (
                    <View style={styles.claimedBadge}>
                      <Text style={styles.claimedText}>✓</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.teamName, { color: team.color }]}>{team.shortName}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <View style={styles.posBadge}>
                      <Text style={styles.posText}>{player.position}</Text>
                    </View>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsCol}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.goals}</Text>
                    <Text style={styles.statLabel}>Gls</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#4D7EFF' }]}>{player.assists}</Text>
                    <Text style={styles.statLabel}>Ast</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#A855F7' }]}>{player.rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Rtg</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {sorted.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No players found</Text>
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
    marginBottom: 12,
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
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00E676',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A8699',
  },
  filterChipTextActive: {
    color: '#09101E',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  rank: {
    width: 24,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  claimedBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimedText: {
    fontSize: 8,
    color: '#09101E',
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  teamName: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 11,
    color: '#5A6880',
  },
  posBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  posText: {
    fontSize: 11,
    color: '#5A6880',
  },
  statsCol: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#00E676',
  },
  statLabel: {
    fontSize: 9,
    color: '#5A6880',
    textTransform: 'uppercase',
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