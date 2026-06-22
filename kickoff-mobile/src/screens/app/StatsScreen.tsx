import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { PLAYERS, TEAMS, getTeamById } from '../../lib/data';

const TABS = ['Scorers', 'Assists', 'Teams', 'Clean Sheets'] as const;
type Tab = typeof TABS[number];

export default function StatsScreen({ navigation }: any) {
  const [tab, setTab] = useState<Tab>('Scorers');

  const scorers = [...PLAYERS].sort((a, b) => b.goals - a.goals).slice(0, 8);
  const assisters = [...PLAYERS].sort((a, b) => b.assists - a.assists).slice(0, 8);
  const gkPlayers = PLAYERS.filter(p => p.position === 'GK');
  const teamStats = [...TEAMS].sort((a, b) => b.goalsFor - a.goalsFor);

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
            const team = getTeamById(player.teamId)!;
            return (
              <TouchableOpacity
                key={player.id}
                style={[styles.statRow, idx === 0 && styles.statRowTop]}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.rank, { color: idx === 0 ? '#00E676' : '#5A6880' }]}>{idx + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: `${team.color}20` }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{player.name}</Text>
                  <Text style={[styles.team, { color: team.color }]}>{team.shortName} · {player.position}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.bigNum, { color: '#00E676' }]}>{player.goals}</Text>
                  <Text style={styles.smallLabel}>goals</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {tab === 'Assists' && assisters.map((player, idx) => {
            const team = getTeamById(player.teamId)!;
            return (
              <TouchableOpacity
                key={player.id}
                style={styles.statRow}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.rank, { color: idx === 0 ? '#4D7EFF' : '#5A6880' }]}>{idx + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: `${team.color}20` }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{player.name}</Text>
                  <Text style={[styles.team, { color: team.color }]}>{team.shortName} · {player.position}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.bigNum, { color: '#4D7EFF' }]}>{player.assists}</Text>
                  <Text style={styles.smallLabel}>assists</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {tab === 'Teams' && teamStats.map((team, idx) => (
            <TouchableOpacity
              key={team.id}
              style={styles.statRow}
              onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}
              activeOpacity={0.8}
            >
              <Text style={[styles.rank, { color: idx === 0 ? '#00E676' : '#5A6880' }]}>{idx + 1}</Text>
              <View style={[styles.avatar, { backgroundColor: `${team.color}20` }]}>
                <Text style={styles.avatarText}>{team.badge}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{team.name}</Text>
                <Text style={styles.team}>{team.played} games · {team.goalsAgainst} conceded</Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.bigNum, { color: '#00E676' }]}>{team.goalsFor}</Text>
                <Text style={styles.smallLabel}>scored</Text>
              </View>
            </TouchableOpacity>
          ))}

          {tab === 'Clean Sheets' && (
            gkPlayers.length > 0 ? gkPlayers.map((player, idx) => {
              const team = getTeamById(player.teamId)!;
              return (
                <TouchableOpacity
                  key={player.id}
                  style={styles.statRow}
                  onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.rank, { color: '#FFB800' }]}>{idx + 1}</Text>
                  <View style={[styles.avatar, { backgroundColor: `${team.color}20` }]}>
                    <Text style={styles.avatarText}>🧤</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{player.name}</Text>
                    <Text style={[styles.team, { color: team.color }]}>{team.shortName} · GK</Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={[styles.bigNum, { color: '#FFB800' }]}>{player.cleanSheets || 0}</Text>
                    <Text style={styles.smallLabel}>clean sheets</Text>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🧤</Text>
                <Text style={styles.emptyText}>No goalkeeper data available</Text>
              </View>
            )
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
  tabRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: '#00E676',
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A8699',
  },
  tabChipTextActive: {
    color: '#09101E',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  statRowTop: {
    borderColor: 'rgba(0,230,118,0.2)',
  },
  rank: {
    width: 24,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  team: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  bigNum: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  smallLabel: {
    fontSize: 10,
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
    fontSize: 14,
    color: '#5A6880',
  },
});