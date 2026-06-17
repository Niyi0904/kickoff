import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useMatch, useTeams, usePlayers, useMatchEvents } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import type { AppStackParamList } from '../../navigation/types';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND, TEXT_COLOR } from '../../theme';

const MatchDetailScreen = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'MatchDetail'>>();
  const { matchId } = route.params;

  const { data: match, isLoading } = useMatch(matchId);
  const { data: teams } = useTeams();
  const { data: players } = usePlayers();
  const { data: events, isLoading: eventsLoading } = useMatchEvents(matchId);

  const homeName = teams?.find((t) => t.id === match?.homeTeamId)?.name ?? 'Home';
  const awayName = teams?.find((t) => t.id === match?.awayTeamId)?.name ?? 'Away';

  const playerName = (id: string) => players?.find((p) => p.id === id)?.name ?? 'Unknown';

  const timeline = useMemo(() => {
    if (!events) return [];
    const items = [
      ...events.goals.map((g) => ({ type: 'Goal', playerId: g.playerId })),
      ...events.assists.map((a) => ({ type: 'Assist', playerId: a.playerId })),
      ...events.yellows.map((y) => ({ type: 'Yellow', playerId: y.playerId })),
      ...events.reds.map((r) => ({ type: 'Red', playerId: r.playerId })),
    ];
    return items;
  }, [events]);

  if (isLoading || eventsLoading) return <LoadingView />;
  if (!match) return <EmptyState message="Match not found." />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreCard}>
        <Text style={styles.matchDay}>Match day {match.matchDay}</Text>
        {match.scheduledDate && (
          <Text style={styles.date}>
            {new Date(match.scheduledDate).toLocaleDateString()}
            {match.time ? ` • ${match.time}` : ''}
          </Text>
        )}
        <View style={styles.scoreRow}>
          <Text style={styles.team}>{homeName}</Text>
          <Text style={styles.score}>
            {match.homeScore} - {match.awayScore}
          </Text>
          <Text style={styles.team}>{awayName}</Text>
        </View>
        <Text style={styles.status}>{match.status === 'played' ? 'Final' : 'Upcoming'}</Text>
      </View>

      {match.report ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report</Text>
          <Text style={styles.body}>{match.report}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events ({timeline.length})</Text>
        {timeline.length === 0 ? (
          <Text style={styles.empty}>No recorded events for this match.</Text>
        ) : (
          timeline.map((ev, i) => (
            <View key={`${ev.type}-${ev.playerId}-${i}`} style={styles.eventRow}>
              <Text style={styles.eventType}>{ev.type}</Text>
              <Text style={styles.eventPlayer}>{playerName(ev.playerId)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR, padding: 16 },
  scoreCard: {
    backgroundColor: CARD_BACKGROUND,
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  matchDay: { fontSize: 12, color: PRIMARY_COLOR, fontWeight: '700' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  team: { flex: 1, fontSize: 14, fontWeight: '600', textAlign: 'center', color: TEXT_COLOR },
  score: { fontSize: 28, fontWeight: 'bold', color: PRIMARY_COLOR },
  status: { marginTop: 8, fontSize: 12, color: '#888' },
  section: {
    backgroundColor: CARD_BACKGROUND,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: TEXT_COLOR },
  body: { color: TEXT_COLOR, lineHeight: 20 },
  empty: { color: '#888', fontSize: 13 },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventType: { fontWeight: '600', color: PRIMARY_COLOR },
  eventPlayer: { color: TEXT_COLOR },
});

export default MatchDetailScreen;
