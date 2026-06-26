import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { TeamDetailScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTeam, usePlayers, useMatches, useLeagueStandings, usePlayerStats } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const POS_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'FW'];

function computeForm(teamId: string, matches: any[]) {
  return matches
    .filter((m: any) => m.status === 'played' && (m.homeTeamId === teamId || m.awayTeamId === teamId))
    .sort((a: any, b: any) => a.matchDay - b.matchDay)
    .slice(-5)
    .map((m: any) => {
      if (m.homeTeamId === teamId) {
        if (m.homeScore > m.awayScore) return 'W' as const;
        if (m.homeScore < m.awayScore) return 'L' as const;
        return 'D' as const;
      } else {
        if (m.awayScore > m.homeScore) return 'W' as const;
        if (m.awayScore < m.homeScore) return 'L' as const;
        return 'D' as const;
      }
    });
}

function FormBadge({ r }: { r: 'W' | 'D' | 'L' }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    W: { bg: 'rgba(0,230,118,0.15)', color: '#00E676', label: 'Win' },
    D: { bg: 'rgba(255,184,0,0.15)', color: '#FFB800', label: 'Draw' },
    L: { bg: 'rgba(255,61,90,0.15)', color: '#FF3D5A', label: 'Loss' },
  };
  return (
    <View style={[s.formItem, { backgroundColor: cfg[r].bg }]}>
      <Text style={[s.formItemText, { color: cfg[r].color }]}>{r}</Text>
      <Text style={[s.formItemLabel, { color: cfg[r].color }]}>{cfg[r].label}</Text>
    </View>
  );
}

export default function TeamDetailScreen({ route, navigation }: TeamDetailScreenProps) {
  const { teamId } = route.params;
  const { isLeagueManager } = useAuth();
  const [tab, setTab] = useState<'overview' | 'squad' | 'fixtures'>('overview');

  const { data: team, isLoading: teamLoading } = useTeam(teamId);
  const { data: players = [] } = usePlayers(teamId);
  const { data: matches = [] } = useMatches();
  const { data: standings = [] } = useLeagueStandings();
  const { data: playerStats = [] } = usePlayerStats();

  const standing = useMemo(() => standings.find(s => s.teamId === teamId), [standings, teamId]);
  const statsMap = useMemo(() => new Map(playerStats.map(s => [s.playerId, s])), [playerStats]);
  const form = useMemo(() => computeForm(teamId, matches), [teamId, matches]);

  const teamMatches = useMemo(() =>
    matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId).slice(-20),
    [matches, teamId]
  );

  if (teamLoading || !team) return <LoadingView />;

  const tabs = ['overview', 'squad', 'fixtures'] as const;

  return (
    <View style={s.container}>
      {/* Hero */}
      <View style={[s.hero, { backgroundColor: `${team.primaryColor}15` }]}>
        <View style={s.header}>
          <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={s.heroContent}>
          <View style={[s.heroBadge, { backgroundColor: `${team.primaryColor}20`, borderColor: `${team.primaryColor}50` }]}>
            <Text style={s.heroBadgeText}>{team.name[0]}</Text>
          </View>
          <Text style={s.heroName}>{team.name}</Text>
          <Text style={s.heroFounded}>Founded {team.founded}</Text>

          {/* Key stats */}
          <View style={s.keyStats}>
            {[
              { label: 'Position', value: `#${standing?.position ?? '-'}`, color: standing?.position && standing.position <= 2 ? '#00E676' : '#F0F4FF' },
              { label: 'Points', value: standing?.points ?? '-', color: '#00E676' },
              { label: 'Goals', value: standing?.goalsFor ?? '-', color: '#4D7EFF' },
              { label: 'W/D/L', value: standing ? `${standing.wins}/${standing.draws}/${standing.losses}` : '-', color: '#F0F4FF' },
            ].map(stat => (
              <View key={stat.label} style={s.keyStatCard}>
                <Text style={[s.keyStatValue, { color: stat.color as string }]}>{stat.value}</Text>
                <Text style={s.keyStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            {tab === t && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.tabContent} showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          <View style={s.tabPane}>
            <View style={s.card}>
              <Text style={s.cardLabel}>Stadium</Text>
              <Text style={s.cardValue}>{team.stadium || 'N/A'}</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Form (Last 5)</Text>
              <View style={s.formGrid}>
                {form.length > 0 ? form.map((r, i) => <FormBadge key={i} r={r} />) : <Text style={{ color: '#5A6880', fontSize: 13 }}>No matches played yet</Text>}
              </View>
            </View>
          </View>
        )}

        {tab === 'squad' && (
          <View style={s.tabPane}>
            {POS_ORDER.filter(pos => players.some(p => p.position === pos)).map(pos => {
              const groupLabel = pos === 'GK' ? 'Goalkeeper' : pos === 'FW' ? 'Forward' : (pos === 'CM' || pos === 'CAM' || pos === 'CDM') ? 'Midfield' : 'Defence';
              return (
                <View key={pos} style={s.squadGroup}>
                  <Text style={s.squadGroupLabel}>{groupLabel}</Text>
                  {players.filter(p => p.position === pos).map(player => {
                    const ps = statsMap.get(player.id);
                    return (
                      <TouchableOpacity
                        key={player.id}
                        style={s.squadRow}
                        onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                        activeOpacity={0.8}
                      >
                        <View style={s.squadAvatar}>
                          <Text style={s.squadAvatarText}>👤</Text>
                        </View>
                        <Text style={s.squadNumber}>#{player.number}</Text>
                        <View style={s.squadInfo}>
                          <Text style={s.squadName}>{player.name}</Text>
                          <Text style={s.squadMeta}>{player.position}</Text>
                        </View>
                        <View style={s.squadStats}>
                          <View style={s.squadStat}>
                            <Text style={s.squadStatValue}>{ps?.goals ?? 0}</Text>
                            <Text style={s.squadStatLabel}>G</Text>
                          </View>
                          <View style={s.squadStat}>
                            <Text style={[s.squadStatValue, { color: '#4D7EFF' }]}>{ps?.assists ?? 0}</Text>
                            <Text style={s.squadStatLabel}>A</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        {tab === 'fixtures' && (
          <View style={[s.tabPane, { gap: 10 }]}>
            {teamMatches.length === 0 && <Text style={{ color: '#5A6880', textAlign: 'center', marginTop: 20 }}>No fixtures yet</Text>}
            {teamMatches.map(m => {
              const isHome = m.homeTeamId === teamId;
              const completed = m.status === 'played';
              const homeScore = isHome ? m.homeScore : m.awayScore;
              const awayScore = isHome ? m.awayScore : m.homeScore;
              const won = completed && homeScore > awayScore;
              const lost = completed && homeScore < awayScore;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={s.fixtureRow}
                  onPress={() => navigation.navigate('MatchDetail', { matchId: m.id })}
                  activeOpacity={0.8}
                >
                  <View style={[s.fixtureBadge, { backgroundColor: completed ? (won ? 'rgba(0,230,118,0.15)' : lost ? 'rgba(255,61,90,0.15)' : 'rgba(255,184,0,0.15)') : 'rgba(255,255,255,0.05)' }]}>
                    <Text style={[s.fixtureBadgeText, { color: completed ? (won ? '#00E676' : lost ? '#FF3D5A' : '#FFB800') : '#5A6880' }]}>
                      {completed ? (won ? 'W' : lost ? 'L' : 'D') : isHome ? 'H' : 'A'}
                    </Text>
                  </View>
                  <View style={s.fixtureInfo}>
                    <Text style={s.fixtureOpponent}>vs {isHome ? m.awayTeamId : m.homeTeamId}</Text>
                    <Text style={s.fixtureMeta}>GW{m.matchDay} · {m.scheduledDate || ''}</Text>
                  </View>
                  {completed ? (
                    <Text style={[s.fixtureScore, { color: won ? '#00E676' : lost ? '#FF3D5A' : '#FFB800' }]}>
                      {homeScore}–{awayScore}
                    </Text>
                  ) : (
                    <Text style={s.fixtureTime}>{m.time || ''}</Text>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, paddingHorizontal: 20, zIndex: 10 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: '#5A6880' },
  hero: { paddingHorizontal: 20, paddingTop: 100, paddingBottom: 24 },
  heroContent: { alignItems: 'center', gap: 8 },
  heroBadge: { width: 72, height: 72, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroBadgeText: { fontSize: 38, color: '#F0F4FF' },
  heroName: { fontSize: 28, fontWeight: '800', color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  heroFounded: { fontSize: 12, color: '#5A6880', marginTop: 1 },
  keyStats: { flexDirection: 'row', gap: 10, marginTop: 16 },
  keyStatCard: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: 10, alignItems: 'center' },
  keyStatValue: { fontFamily: 'monospace', fontSize: 16, fontWeight: '700' },
  keyStatLabel: { fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#0E1525', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  tab: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize', color: '#5A6880' },
  tabTextActive: { color: '#00E676' },
  tabIndicator: { position: 'absolute', bottom: 0, width: '100%', height: 2, backgroundColor: '#00E676' },
  tabContent: { flex: 1, padding: 16 },
  tabPane: { gap: 12 },
  card: { backgroundColor: '#131B2E', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardLabel: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 10 },
  cardBody: { fontSize: 14, color: '#B8C4D8', lineHeight: 22 },
  cardValue: { fontSize: 14, color: '#F0F4FF', fontWeight: '600' },
  formGrid: { flexDirection: 'row', gap: 8 },
  formItem: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  formItemText: { fontSize: 18, fontWeight: '800', fontFamily: 'sans-serif' },
  formItemLabel: { fontSize: 10, opacity: 0.7, marginTop: 2 },
  squadGroup: { marginBottom: 12 },
  squadGroupLabel: { fontSize: 11, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 4 },
  squadRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', gap: 12 },
  squadAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,230,118,0.15)', alignItems: 'center', justifyContent: 'center' },
  squadAvatarText: { fontSize: 14 },
  squadNumber: { fontFamily: 'monospace', fontSize: 14, fontWeight: '600', color: '#5A6880', width: 24 },
  squadInfo: { flex: 1 },
  squadName: { fontSize: 14, fontWeight: '600', color: '#F0F4FF' },
  squadMeta: { fontSize: 11, color: '#5A6880', marginTop: 2 },
  squadStats: { flexDirection: 'row', gap: 12 },
  squadStat: { alignItems: 'center' },
  squadStatValue: { fontFamily: 'monospace', fontWeight: '700', color: '#00E676', fontSize: 14 },
  squadStatLabel: { fontSize: 9, color: '#5A6880', textTransform: 'uppercase' },
  fixtureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', gap: 12 },
  fixtureBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fixtureBadgeText: { fontSize: 11, fontWeight: '700' },
  fixtureInfo: { flex: 1 },
  fixtureOpponent: { fontSize: 13, fontWeight: '600', color: '#F0F4FF' },
  fixtureMeta: { fontSize: 11, color: '#5A6880', marginTop: 2 },
  fixtureScore: { fontFamily: 'monospace', fontSize: 18, fontWeight: '700' },
  fixtureTime: { fontSize: 13, color: '#5A6880' },
});
