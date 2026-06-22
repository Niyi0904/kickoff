import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { getTeamById, getPlayersByTeam, FIXTURES } from '../../lib/data';

const POS_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'FW'];

export default function TeamDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { role } = useApp();
  const [tab, setTab] = useState<'overview' | 'squad' | 'fixtures'>('overview');

  const team = getTeamById(id);
  const players = getPlayersByTeam(id);
  const teamFixtures = FIXTURES.filter(f => f.homeTeamId === id || f.awayTeamId === id).slice(0, 5);

  if (!team) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Team not found</Text>
        </View>
      </View>
    );
  }

  const tabs = ['overview', 'squad', 'fixtures'] as const;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: `${team.color}15` }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroContent}>
          <View style={[styles.heroBadge, { backgroundColor: `${team.color}20`, borderColor: `${team.color}50` }]}>
            <Text style={styles.heroBadgeText}>{team.badge}</Text>
          </View>
          <Text style={styles.heroName}>{team.name}</Text>
          <Text style={styles.heroManager}>Manager: {team.manager}</Text>
          <Text style={styles.heroFounded}>Founded {team.founded}</Text>

          {/* Key stats */}
          <View style={styles.keyStats}>
            {[
              { label: 'Position', value: `#${team.position}`, color: team.position <= 2 ? '#00E676' : '#F0F4FF' },
              { label: 'Points', value: team.points, color: '#00E676' },
              { label: 'Goals', value: team.goalsFor, color: '#4D7EFF' },
              { label: 'W/D/L', value: `${team.wins}/${team.draws}/${team.losses}`, color: '#F0F4FF' },
            ].map(s => (
              <View key={s.label} style={styles.keyStatCard}>
                <Text style={[styles.keyStatValue, { color: s.color as string }]}>{s.value}</Text>
                <Text style={styles.keyStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t}
            </Text>
            {tab === t && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          <View style={styles.tabPane}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>About</Text>
              <Text style={styles.cardBody}>{team.description}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Stadium</Text>
              <Text style={styles.cardValue}>{team.stadium}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Form (Last 5)</Text>
              <View style={styles.formGrid}>
                {team.form.map((r, i) => {
                  const cfg: Record<string, { bg: string; color: string; label: string }> = {
                    W: { bg: 'rgba(0,230,118,0.15)', color: '#00E676', label: 'Win' },
                    D: { bg: 'rgba(255,184,0,0.15)', color: '#FFB800', label: 'Draw' },
                    L: { bg: 'rgba(255,61,90,0.15)', color: '#FF3D5A', label: 'Loss' },
                  };
                  return (
                    <View key={i} style={[styles.formItem, { backgroundColor: cfg[r].bg }]}>
                      <Text style={[styles.formItemText, { color: cfg[r].color }]}>{r}</Text>
                      <Text style={[styles.formItemLabel, { color: cfg[r].color }]}>{cfg[r].label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {tab === 'squad' && (
          <View style={styles.tabPane}>
            {POS_ORDER.filter(pos => players.some(p => p.position === pos)).map(pos => (
              <View key={pos} style={styles.squadGroup}>
                <Text style={styles.squadGroupLabel}>
                  {pos === 'GK' ? 'Goalkeeper' : pos === 'FW' ? 'Forward' : pos === 'CM' || pos === 'CAM' || pos === 'CDM' ? 'Midfield' : 'Defence'}
                </Text>
                {players.filter(p => p.position === pos).map(player => (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.squadRow}
                    onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.squadAvatar}>
                      <Text style={styles.squadAvatarText}>👤</Text>
                    </View>
                    <Text style={styles.squadNumber}>#{player.number}</Text>
                    <View style={styles.squadInfo}>
                      <Text style={styles.squadName}>{player.name}</Text>
                      <Text style={styles.squadMeta}>{player.position} · {player.nationality}</Text>
                    </View>
                    <View style={styles.squadStats}>
                      <View style={styles.squadStat}>
                        <Text style={styles.squadStatValue}>{player.goals}</Text>
                        <Text style={styles.squadStatLabel}>G</Text>
                      </View>
                      <View style={styles.squadStat}>
                        <Text style={[styles.squadStatValue, { color: '#4D7EFF' }]}>{player.assists}</Text>
                        <Text style={styles.squadStatLabel}>A</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {tab === 'fixtures' && (
          <View style={[styles.tabPane, { gap: 10 }]}>
            {teamFixtures.map(f => {
              const isHome = f.homeTeamId === id;
              const opponent = isHome ? getTeamById(f.awayTeamId)! : getTeamById(f.homeTeamId)!;
              const completed = f.status === 'completed';
              const homeScore = isHome ? f.homeScore : f.awayScore;
              const awayScore = isHome ? f.awayScore : f.homeScore;
              const won = completed && homeScore! > awayScore!;
              const lost = completed && homeScore! < awayScore!;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={styles.fixtureRow}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: f.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.fixtureBadge, { backgroundColor: completed ? (won ? 'rgba(0,230,118,0.15)' : lost ? 'rgba(255,61,90,0.15)' : 'rgba(255,184,0,0.15)') : 'rgba(255,255,255,0.05)' }]}>
                    <Text style={[styles.fixtureBadgeText, { color: completed ? (won ? '#00E676' : lost ? '#FF3D5A' : '#FFB800') : '#5A6880' }]}>
                      {completed ? (won ? 'W' : lost ? 'L' : 'D') : isHome ? 'H' : 'A'}
                    </Text>
                  </View>
                  <View style={styles.fixtureInfo}>
                    <Text style={styles.fixtureOpponent}>vs {opponent.name}</Text>
                    <Text style={styles.fixtureMeta}>GW{f.gameweek} · {f.date}</Text>
                  </View>
                  {completed ? (
                    <Text style={[styles.fixtureScore, { color: won ? '#00E676' : lost ? '#FF3D5A' : '#FFB800' }]}>
                      {homeScore}–{awayScore}
                    </Text>
                  ) : (
                    <Text style={styles.fixtureTime}>{f.time}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#F0F4FF',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F4FF',
    textTransform: 'uppercase',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#5A6880',
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
    gap: 8,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 38,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroManager: {
    fontSize: 13,
    color: '#7A8699',
    marginTop: 3,
  },
  heroFounded: {
    fontSize: 12,
    color: '#5A6880',
    marginTop: 1,
  },
  keyStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  keyStatCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  keyStatValue: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  keyStatLabel: {
    fontSize: 10,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E1525',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabActive: {
    // active state
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#5A6880',
  },
  tabTextActive: {
    color: '#00E676',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#00E676',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabPane: {
    gap: 12,
  },
  card: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLabel: {
    fontSize: 12,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 14,
    color: '#B8C4D8',
    lineHeight: 22,
  },
  cardValue: {
    fontSize: 14,
    color: '#F0F4FF',
    fontWeight: '600',
  },
  formGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  formItem: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  formItemText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'sans-serif',
  },
  formItemLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
  squadGroup: {
    marginBottom: 12,
  },
  squadGroupLabel: {
    fontSize: 11,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  squadAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,230,118,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadAvatarText: {
    fontSize: 14,
  },
  squadNumber: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6880',
    width: 24,
  },
  squadInfo: {
    flex: 1,
  },
  squadName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  squadMeta: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 2,
  },
  squadStats: {
    flexDirection: 'row',
    gap: 12,
  },
  squadStat: {
    alignItems: 'center',
  },
  squadStatValue: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#00E676',
    fontSize: 14,
  },
  squadStatLabel: {
    fontSize: 9,
    color: '#5A6880',
    textTransform: 'uppercase',
  },
  fixtureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  fixtureBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixtureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fixtureInfo: {
    flex: 1,
  },
  fixtureOpponent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  fixtureMeta: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 2,
  },
  fixtureScore: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
  },
  fixtureTime: {
    fontSize: 13,
    color: '#5A6880',
  },
});