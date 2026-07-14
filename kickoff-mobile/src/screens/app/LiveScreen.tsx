import React, { useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, RefreshControl,
} from 'react-native';
import type { AppTabScreenProps } from '../../navigation/types';
import { useTeams, useMatches } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const phaseLabels: Record<string, string> = {
  firstHalf: '1st Half',
  halftime: 'HT',
  secondHalf: '2nd Half',
  fulltime: 'FT',
};

export default function LiveScreen({ navigation }: { navigation: AppTabScreenProps }) {
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: matches = [], isLoading: matchesLoading, refetch } = useMatches();
  const [refreshing, setRefreshing] = React.useState(false);

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  const liveMatches = useMemo(() => matches.filter(m => m.status === 'live'), [matches]);
  const todaysMatches = useMemo(() => {
    const today = new Date().toDateString();
    return matches.filter(m => m.scheduledDate && new Date(m.scheduledDate).toDateString() === today);
  }, [matches]);
  const upcomingMatches = useMemo(() => matches.filter(m => m.status === 'upcoming'), [matches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (teamsLoading || matchesLoading) return <LoadingView />;

  const renderMatchCard = (match: typeof matches[0]) => {
    const home = teamMap.get(match.homeTeamId);
    const away = teamMap.get(match.awayTeamId);
    if (!home || !away) return null;
    const isLive = match.status === 'live';
    const isPlayed = match.status === 'played';

    return (
      <TouchableOpacity
        key={match.id}
        style={[styles.matchCard, isLive && styles.matchCardLive]}
        onPress={() => navigation.navigate('LiveMatchDetail', { matchId: match.id })}
        activeOpacity={0.85}
      >
        {isLive && <View style={styles.liveBar} />}
        <View style={styles.matchCardContent}>
          {/* Home team */}
          <View style={[styles.matchTeam, { alignItems: 'flex-end' }]}>
            <Text style={[styles.matchTeamName, { textAlign: 'right' }]} numberOfLines={1}>
              {home.name}
            </Text>
            <View style={[styles.matchBadge, { backgroundColor: `${home.primaryColor}20`, borderColor: `${home.primaryColor}40` }]}>
              <Text style={styles.matchBadgeText}>{home.name[0]}</Text>
            </View>
          </View>

          {/* Score / Status */}
          <View style={styles.matchScoreCol}>
            {isLive ? (
              <>
                <View style={styles.matchScoreRow}>
                  <Text style={styles.matchScore}>{match.homeScore}</Text>
                  <Text style={styles.matchScoreDivider}>:</Text>
                  <Text style={styles.matchScore}>{match.awayScore}</Text>
                </View>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTime}>
                    {match.matchTimer || 0}'
                  </Text>
                </View>
              </>
            ) : isPlayed ? (
              <>
                <View style={styles.matchScoreRow}>
                  <Text style={styles.matchScore}>{match.homeScore}</Text>
                  <Text style={styles.matchScoreDivider}>:</Text>
                  <Text style={styles.matchScore}>{match.awayScore}</Text>
                </View>
                <Text style={styles.matchStatusText}>FT</Text>
              </>
            ) : (
              <>
                <View style={styles.matchTimeBox}>
                  <Text style={styles.matchTimeText}>{match.time?.substring(0, 5) || 'TBD'}</Text>
                </View>
                <Text style={styles.matchStatusText}>GW{match.matchDay}</Text>
              </>
            )}
          </View>

          {/* Away team */}
          <View style={styles.matchTeam}>
            <View style={[styles.matchBadge, { backgroundColor: `${away.primaryColor}20`, borderColor: `${away.primaryColor}40` }]}>
              <Text style={styles.matchBadgeText}>{away.name[0]}</Text>
            </View>
            <Text style={styles.matchTeamName} numberOfLines={1}>{away.name}</Text>
          </View>
        </View>
        {isLive && (
          <View style={styles.matchMetaRow}>
            <Text style={styles.matchMetaText}>
              {phaseLabels[match.matchPhase || 'firstHalf']} · {match.matchTimer || 0}'
            </Text>
            <View style={styles.matchStats}>
              <Text style={styles.matchStatText}>
                {match.homeShots ?? 0} - {match.awayShots ?? 0} Shots
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E676" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live</Text>
          <Text style={styles.headerSubtitle}>Follow the action in real time</Text>
        </View>

        {/* Live matches */}
        {liveMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionLiveDot} />
                <Text style={styles.sectionTitle}>Live Now</Text>
              </View>
              <Text style={styles.sectionCount}>{liveMatches.length}</Text>
            </View>
            {liveMatches.map(renderMatchCard)}
          </View>
        )}

        {/* Today's matches */}
        {liveMatches.length === 0 && todaysMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionIcon}>📅</Text>
                <Text style={styles.sectionTitle}>Today's Matches</Text>
              </View>
              <Text style={styles.sectionCount}>{todaysMatches.length}</Text>
            </View>
            {todaysMatches.map(renderMatchCard)}
          </View>
        )}

        {/* Upcoming matches */}
        {upcomingMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionIcon}>🕒</Text>
                <Text style={styles.sectionTitle}>Upcoming</Text>
              </View>
              <Text style={styles.sectionCount}>{upcomingMatches.length}</Text>
            </View>
            {upcomingMatches.slice(0, 5).map(renderMatchCard)}
            {upcomingMatches.length > 5 && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => navigation.navigate('Matches')}
              >
                <Text style={styles.showAllText}>Show all {upcomingMatches.length} fixtures →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty state */}
        {liveMatches.length === 0 && todaysMatches.length === 0 && upcomingMatches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>No Live Matches</Text>
            <Text style={styles.emptyDesc}>
              There are no matches currently in progress. Check back on match day.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09101E' },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, color: '#5A6880', marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3D5A' },
  sectionIcon: { fontSize: 14 },
  sectionTitle: { fontSize: 13, color: '#5A6880', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionCount: { fontSize: 13, fontWeight: '700', color: '#00E676', fontFamily: 'monospace' },
  matchCard: {
    backgroundColor: '#131B2E', borderRadius: 14, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden',
  },
  matchCardLive: {
    borderColor: 'rgba(255,61,90,0.3)', backgroundColor: '#181024',
  },
  liveBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#FF3D5A' },
  matchCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchTeam: { flex: 1, gap: 6 },
  matchTeamName: { fontSize: 13, fontWeight: '700', color: '#F0F4FF' },
  matchBadge: { width: 40, height: 40, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  matchBadgeText: { fontSize: 18, color: '#F0F4FF' },
  matchScoreCol: { alignItems: 'center', gap: 2, minWidth: 64 },
  matchScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matchScore: { fontFamily: 'monospace', fontSize: 24, fontWeight: '700', color: '#F0F4FF', lineHeight: 28 },
  matchScoreDivider: { fontSize: 14, color: '#5A6880', fontWeight: '300' },
  matchTimeBox: { backgroundColor: 'rgba(0,230,118,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)' },
  matchTimeText: { fontSize: 13, fontWeight: '700', color: '#00E676', fontFamily: 'monospace' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FF3D5A' },
  liveTime: { fontSize: 10, fontWeight: '700', color: '#FF3D5A', fontFamily: 'monospace' },
  matchStatusText: { fontSize: 10, fontWeight: '600', color: '#5A6880', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  matchMetaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
  },
  matchMetaText: { fontSize: 10, color: '#5A6880', fontWeight: '600' },
  matchStats: {},
  matchStatText: { fontSize: 10, color: '#5A6880', fontWeight: '600' },
  showAllButton: { alignItems: 'center', paddingVertical: 12 },
  showAllText: { fontSize: 12, color: '#00E676', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F0F4FF', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#5A6880', textAlign: 'center', lineHeight: 20 },
});
