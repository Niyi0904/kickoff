import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import type { MatchDetailScreenProps } from '../../navigation/types';
import { useMatch, useTeams, useMatches, useGoals, useAssists, useYellowCards, useRedCards } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const phaseLabels: Record<string, string> = {
  firstHalf: '1st Half',
  halftime: 'Half Time',
  secondHalf: '2nd Half',
  fulltime: 'Full Time',
};

type TabType = 'timeline' | 'stats' | 'lineups';

export default function LiveMatchDetailScreen({ route, navigation }: MatchDetailScreenProps) {
  const { matchId } = route.params;
  const { data: match, isLoading } = useMatch(matchId);
  const { data: teams = [] } = useTeams();
  const { data: goals = [] } = useGoals();
  const { data: assists = [] } = useAssists();
  const { data: yellowCards = [] } = useYellowCards();
  const { data: redCards = [] } = useRedCards();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  if (isLoading || !match) return <LoadingView />;

  const home = teamMap.get(match.homeTeamId);
  const away = teamMap.get(match.awayTeamId);
  const isLive = match.status === 'live';
  const isPlayed = match.status === 'played';
  const timer = match.matchTimer ?? 0;

  const matchGoals = useMemo(() => goals.filter(g => g.matchId === matchId), [goals, matchId]);
  const matchAssists = useMemo(() => assists.filter(a => a.matchId === matchId), [assists, matchId]);
  const matchYellows = useMemo(() => yellowCards.filter(y => y.matchId === matchId), [yellowCards, matchId]);
  const matchReds = useMemo(() => redCards.filter(r => r.matchId === matchId), [redCards, matchId]);

  // Build timeline
  const timeline = useMemo(() => {
    const events: { id: string; minute: number; type: string; text: string }[] = [];
    matchGoals.forEach(g => {
      events.push({ id: `g-${g.id}`, minute: (g as any).minute ?? 0, type: 'goal', text: 'Goal' });
    });
    matchAssists.forEach(a => {
      events.push({ id: `a-${a.id}`, minute: (a as any).minute ?? 0, type: 'assist', text: 'Assist' });
    });
    matchYellows.forEach(y => {
      events.push({ id: `y-${y.id}`, minute: (y as any).minute ?? 0, type: 'yellow', text: 'Yellow Card' });
    });
    matchReds.forEach(r => {
      events.push({ id: `r-${r.id}`, minute: (r as any).minute ?? 0, type: 'red', text: 'Red Card' });
    });

    // Parse commentary from keyMoments
    if (match.keyMoments) {
      match.keyMoments.split('\n').filter(l => l.trim()).forEach((line, idx) => {
        const matchRegex = line.match(/^(\d+)'?\s*[-:]?\s*(.*)$/);
        if (matchRegex) {
          events.push({
            id: `c-${idx}`,
            minute: parseInt(matchRegex[1]),
            type: 'commentary',
            text: matchRegex[2],
          });
        } else {
          events.push({ id: `c-${idx}`, minute: 0, type: 'commentary', text: line });
        }
      });
    }

    return events.sort((a, b) => b.minute - a.minute);
  }, [matchGoals, matchAssists, matchYellows, matchReds, match.keyMoments]);

  const stats = [
    { label: 'Possession', home: match.homePossession ?? 50, away: match.awayPossession ?? 50, suffix: '%' },
    { label: 'Shots', home: match.homeShots ?? 0, away: match.awayShots ?? 0 },
    { label: 'SOT', home: match.homeShotsOnTarget ?? 0, away: match.awayShotsOnTarget ?? 0 },
    { label: 'Corners', home: match.homeCorners ?? 0, away: match.awayCorners ?? 0 },
    { label: 'Fouls', home: match.homeFouls ?? 0, away: match.awayFouls ?? 0 },
  ];

  return (
    <View style={styles.container}>
      {/* Header with back */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Scoreboard */}
      <View style={styles.hero}>
        <View style={styles.statusRow}>
          {isLive ? (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(255,61,90,0.12)', borderColor: 'rgba(255,61,90,0.3)' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#FF3D5A' }]} />
              <Text style={[styles.statusText, { color: '#FF3D5A' }]}>LIVE</Text>
              <Text style={[styles.statusTimer, { color: '#FF3D5A' }]}>{timer}'</Text>
            </View>
          ) : isPlayed ? (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(0,230,118,0.12)', borderColor: 'rgba(0,230,118,0.3)' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#00E676' }]} />
              <Text style={[styles.statusText, { color: '#00E676' }]}>Full Time</Text>
            </View>
          ) : (
            <View style={[styles.statusPill, { backgroundColor: 'rgba(255,184,0,0.12)', borderColor: 'rgba(255,184,0,0.3)' }]}>
              <Text style={[styles.statusText, { color: '#FFB800' }]}>GW{match.matchDay} · {match.time || 'TBD'}</Text>
            </View>
          )}
        </View>

        {/* Teams & Score */}
        <View style={styles.scoreRow}>
          <View style={styles.teamCol}>
            <View style={[styles.teamBadge, { backgroundColor: home ? `${home.primaryColor}20` : 'rgba(255,255,255,0.05)', borderColor: home ? `${home.primaryColor}40` : 'rgba(255,255,255,0.05)' }]}>
              <Text style={styles.teamBadgeText}>{home ? home.name[0] : '?'}</Text>
            </View>
            <Text style={styles.teamName}>{home?.name || '?'}</Text>
          </View>

          <View style={styles.scoreCol}>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNum}>{match.homeScore}</Text>
              <Text style={styles.scoreDash}>:</Text>
              <Text style={styles.scoreNum}>{match.awayScore}</Text>
            </View>
            {isLive && match.matchPhase && (
              <Text style={styles.scorePhase}>{phaseLabels[match.matchPhase]}</Text>
            )}
          </View>

          <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
            <View style={[styles.teamBadge, { backgroundColor: away ? `${away.primaryColor}20` : 'rgba(255,255,255,0.05)', borderColor: away ? `${away.primaryColor}40` : 'rgba(255,255,255,0.05)' }]}>
              <Text style={styles.teamBadgeText}>{away ? away.name[0] : '?'}</Text>
            </View>
            <Text style={[styles.teamName, { textAlign: 'right' }]}>{away?.name || '?'}</Text>
          </View>
        </View>

        {/* Quick stats for live */}
        {isLive && (
          <View style={styles.quickStats}>
            <Text style={styles.quickStat}>{match.homeShots ?? 0}</Text>
            <Text style={styles.quickStatLabel}>Shots</Text>
            <Text style={styles.quickStat}>{match.awayShots ?? 0}</Text>
            <View style={styles.quickStatDivider} />
            <Text style={styles.quickStat}>{match.homeShotsOnTarget ?? 0}</Text>
            <Text style={styles.quickStatLabel}>SOT</Text>
            <Text style={styles.quickStat}>{match.awayShotsOnTarget ?? 0}</Text>
            <View style={styles.quickStatDivider} />
            <Text style={styles.quickStat}>{match.homePossession ?? 50}</Text>
            <Text style={styles.quickStatLabel}>Poss%</Text>
            <Text style={styles.quickStat}>{match.awayPossession ?? 50}</Text>
          </View>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['timeline', 'stats', 'lineups'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'timeline' ? 'Timeline' : tab === 'stats' ? 'Stats' : 'Lineups'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <View style={styles.tabContent}>
            {timeline.length > 0 ? (
              timeline.map((event, idx) => {
                const typeColors: Record<string, string> = {
                  goal: '#00E676', assist: '#2196F3', yellow: '#FFB800', red: '#FF3D5A', commentary: '#5A6880',
                };
                return (
                  <View key={event.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                      <View style={[styles.timelineDotInner, { backgroundColor: typeColors[event.type] || '#5A6880' }]} />
                    </View>
                    {idx < timeline.length - 1 && <View style={styles.timelineLine} />}
                    <View style={[styles.timelineCard, { borderLeftColor: typeColors[event.type] || '#5A6880' }]}>
                      <View style={styles.timelineCardHeader}>
                        <View style={[styles.timelineMinuteBadge, { backgroundColor: `${typeColors[event.type]}20` }]}>
                          <Text style={[styles.timelineMinute, { color: typeColors[event.type] }]}>{event.minute}'</Text>
                        </View>
                        <Text style={[styles.timelineType, { color: typeColors[event.type] }]}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.timelineText}>{event.text}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🕐</Text>
                <Text style={styles.emptyTitle}>No Events Yet</Text>
                <Text style={styles.emptyDesc}>Match events will appear here as they happen.</Text>
              </View>
            )}
          </View>
        )}

        {/* STATS */}
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <View style={styles.statsContainer}>
              {stats.map(stat => {
                const total = stat.home + stat.away;
                const homePercent = total > 0 ? (stat.home / total) * 100 : 50;
                return (
                  <View key={stat.label} style={styles.statRow}>
                    <Text style={styles.statValue}>{stat.home}{stat.suffix}</Text>
                    <View style={styles.statBarContainer}>
                      <View style={styles.statBarBg}>
                        <View style={[styles.statBarHome, { width: `${homePercent}%`, backgroundColor: home?.primaryColor || '#00E676' }]} />
                      </View>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                    <Text style={[styles.statValue, { textAlign: 'right' }]}>{stat.away}{stat.suffix}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* LINEUPS */}
        {activeTab === 'lineups' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>Lineups not available for this match.</Text>
          </View>
        )}

        {/* Navigation links */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: home ? `${home.primaryColor}18` : 'rgba(255,255,255,0.05)', borderColor: home ? `${home.primaryColor}30` : 'rgba(255,255,255,0.05)' }]}
            onPress={() => navigation.navigate('TeamDetail', { teamId: match.homeTeamId })}
          >
            <Text style={styles.navText}>{home?.name || 'Home Team'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: away ? `${away.primaryColor}18` : 'rgba(255,255,255,0.05)', borderColor: away ? `${away.primaryColor}30` : 'rgba(255,255,255,0.05)' }]}
            onPress={() => navigation.navigate('TeamDetail', { teamId: match.awayTeamId })}
          >
            <Text style={styles.navText}>{away?.name || 'Away Team'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, paddingHorizontal: 20, zIndex: 10 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  hero: { paddingTop: 80, paddingHorizontal: 20, paddingBottom: 20 },
  statusRow: { justifyContent: 'center', marginBottom: 16 },
  statusPill: { alignSelf: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  statusTimer: { fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  teamCol: { flex: 1, alignItems: 'center', gap: 8 },
  teamBadge: { width: 56, height: 56, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText: { fontSize: 28, color: '#F0F4FF' },
  teamName: { fontSize: 13, fontWeight: '700', color: '#F0F4FF' },
  scoreCol: { flex: 1.2, alignItems: 'center', gap: 4 },
  scoreDisplay: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreNum: { fontFamily: 'monospace', fontSize: 44, fontWeight: '700', color: '#F0F4FF', lineHeight: 46 },
  scoreDash: { fontSize: 20, color: '#5A6880', fontWeight: '300' },
  scorePhase: { fontSize: 11, color: '#5A6880', fontWeight: '600', marginTop: 2 },
  quickStats: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 16, gap: 8, backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12, padding: 10,
  },
  quickStat: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#F0F4FF' },
  quickStatLabel: { fontSize: 9, color: '#5A6880', fontWeight: '600', textTransform: 'uppercase' },
  quickStatDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  tabBar: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#131B2E', borderRadius: 12, padding: 3,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(0,230,118,0.15)' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#5A6880', textTransform: 'uppercase', letterSpacing: 0.5 },
  tabTextActive: { color: '#00E676' },
  content: { flex: 1, padding: 16 },
  tabContent: { marginBottom: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 12, position: 'relative', paddingLeft: 20 },
  timelineDot: { position: 'absolute', left: 0, top: 4, alignItems: 'center' },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { position: 'absolute', left: 4, top: 16, bottom: -12, width: 2, backgroundColor: 'rgba(255,255,255,0.06)' },
  timelineCard: {
    flex: 1, backgroundColor: '#131B2E', borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  timelineCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  timelineMinuteBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  timelineMinute: { fontSize: 10, fontWeight: '700', fontFamily: 'monospace' },
  timelineType: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  timelineText: { fontSize: 13, color: '#C0CCDA', lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#F0F4FF', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#5A6880', textAlign: 'center', lineHeight: 18 },
  statsContainer: { gap: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statValue: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: '#F0F4FF', width: 50 },
  statBarContainer: { flex: 1, gap: 4 },
  statBarBg: { height: 6, backgroundColor: '#1E2A3E', borderRadius: 3, overflow: 'hidden' },
  statBarHome: { height: '100%', borderRadius: 3 },
  statLabel: { fontSize: 10, color: '#5A6880', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.3 },
  sectionLabel: { fontSize: 13, color: '#5A6880', textAlign: 'center', paddingVertical: 20 },
  navRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  navButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 13, fontWeight: '600', color: '#F0F4FF', textAlign: 'center' },
});
