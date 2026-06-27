import React, { useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import type { MatchDetailScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useMatch, useTeams, useMatches, useMatchEvents, useAddMatchEvent, useDeleteMatchEvent } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { MatchEventEditor } from '../../components/MatchEventEditor';

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

export default function MatchDetailScreen({ route, navigation }: MatchDetailScreenProps) {
  const { matchId } = route.params;
  const { isLeagueManager } = useAuth();
  const { data: match, isLoading } = useMatch(matchId);
  const { data: teams = [] } = useTeams();
  const { data: allMatches = [] } = useMatches();
  const { data: events, refetch: refetchEvents } = useMatchEvents(matchId);
  const addEvent = useAddMatchEvent();
  const deleteEvent = useDeleteMatchEvent();

  const teamMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  if (isLoading || !match) return <LoadingView />;

  const home = teamMap.get(match.homeTeamId);
  const away = teamMap.get(match.awayTeamId);
  const isCompleted = match.status === 'played';

  const homeForm = useMemo(() => computeForm(match.homeTeamId, allMatches), [match.homeTeamId, allMatches]);
  const awayForm = useMemo(() => computeForm(match.awayTeamId, allMatches), [match.awayTeamId, allMatches]);

  const handleAddEvent = useCallback(async (collection: 'goals' | 'assists' | 'yellow_cards' | 'red_cards', playerId: string, teamId: string, minute?: number) => {
    await addEvent.mutateAsync({ collection, event: { playerId, matchId, matchDay: match.matchDay, teamId, minute } });
    refetchEvents();
  }, [addEvent, matchId, match.matchDay, refetchEvents]);

  const handleDeleteEvent = useCallback(async (collection: 'goals' | 'assists' | 'yellow_cards' | 'red_cards', eventId: string) => {
    await deleteEvent.mutateAsync({ collection, eventId });
    refetchEvents();
  }, [deleteEvent, refetchEvents]);

  return (
    <View style={styles.container}>
      {/* Hero score card */}
      <View style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Status pill */}
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, { backgroundColor: isCompleted ? 'rgba(0,230,118,0.12)' : 'rgba(255,184,0,0.12)', borderColor: isCompleted ? 'rgba(0,230,118,0.3)' : 'rgba(255,184,0,0.3)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isCompleted ? '#00E676' : '#FFB800' }]} />
            <Text style={[styles.statusText, { color: isCompleted ? '#00E676' : '#FFB800' }]}>
              {isCompleted ? 'Full Time' : `GW${match.matchDay}`}
            </Text>
          </View>
        </View>

        {/* Teams & Score */}
        <View style={styles.scoreRow}>
          <View style={styles.teamCol}>
            <View style={[styles.teamBadge, { backgroundColor: home ? `${home.primaryColor}20` : 'rgba(255,255,255,0.05)', borderColor: home ? `${home.primaryColor}40` : 'rgba(255,255,255,0.05)' }]}>
              <Text style={styles.teamBadgeText}>{home ? home.name[0] : '?'}</Text>
            </View>
            <Text style={styles.teamName}>{home?.name || '?'}</Text>
            <Text style={styles.teamLabel}>Home</Text>
          </View>

          <View style={styles.scoreCol}>
            {isCompleted ? (
              <View style={styles.scoreDisplay}>
                <Text style={[styles.scoreNum, { color: match.homeScore > match.awayScore ? '#00E676' : '#F0F4FF' }]}>{match.homeScore}</Text>
                <Text style={styles.scoreDash}>—</Text>
                <Text style={[styles.scoreNum, { color: match.awayScore > match.homeScore ? '#00E676' : '#F0F4FF' }]}>{match.awayScore}</Text>
              </View>
            ) : (
              <View style={styles.vsDisplay}>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.vsTime}>{match.time || 'TBD'}</Text>
              </View>
            )}
            {isCompleted && (
              <Text style={styles.resultLabel}>
                {match.homeScore === match.awayScore ? 'Draw' : (match.homeScore > match.awayScore ? home?.name.split(' ')[0] : away?.name.split(' ')[0]) + ' Win'}
              </Text>
            )}
          </View>

          <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
            <View style={[styles.teamBadge, { backgroundColor: away ? `${away.primaryColor}20` : 'rgba(255,255,255,0.05)', borderColor: away ? `${away.primaryColor}40` : 'rgba(255,255,255,0.05)' }]}>
              <Text style={styles.teamBadgeText}>{away ? away.name[0] : '?'}</Text>
            </View>
            <Text style={styles.teamName}>{away?.name || '?'}</Text>
            <Text style={styles.teamLabel}>Away</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Match Info</Text>
          {[
            { icon: '🕒', label: 'Date & Time', value: `${match.scheduledDate || 'TBD'} · ${match.time || ''}` },
            { icon: '📅', label: 'Match Day', value: `Gameweek ${match.matchDay}` },
          ].map(item => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Goal scorers */}
        {isCompleted && events && (events.goals.length > 0) && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Goals</Text>
            <View style={styles.scorersRow}>
              <View style={styles.scorersCol}>
                {events.goals.filter((g: any) => g.teamId === match.homeTeamId).map((g: any, i: number) => (
                  <View key={i} style={styles.scorerItem}>
                    <Text style={styles.scorerIcon}>⚽</Text>
                    <Text style={styles.scorerText}>{g.playerId} {g.minute ? `${g.minute}'` : ''}</Text>
                  </View>
                ))}
                {events.goals.filter((g: any) => g.teamId === match.homeTeamId).length === 0 && <Text style={styles.scorerEmpty}>—</Text>}
              </View>
              <View style={styles.scorersDivider} />
              <View style={[styles.scorersCol, { alignItems: 'flex-end' }]}>
                {events.goals.filter((g: any) => g.teamId === match.awayTeamId).map((g: any, i: number) => (
                  <View key={i} style={styles.scorerItem}>
                    <Text style={styles.scorerText}>{g.playerId} {g.minute ? `${g.minute}'` : ''}</Text>
                    <Text style={styles.scorerIcon}>⚽</Text>
                  </View>
                ))}
                {events.goals.filter((g: any) => g.teamId === match.awayTeamId).length === 0 && <Text style={styles.scorerEmpty}>—</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Team Form */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Team Form</Text>
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formTeam}>{home?.name.split(' ')[0] || '?'}</Text>
              <View style={styles.formBadges}>
                {homeForm.map((r, i) => {
                  const colors: Record<string, string> = { W: '#00E676', D: '#FFB800', L: '#FF3D5A' };
                  return (
                    <View key={i} style={[styles.formBadge, { backgroundColor: `${colors[r]}20`, borderColor: `${colors[r]}40` }]}>
                      <Text style={[styles.formBadgeText, { color: colors[r] }]}>{r}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={[styles.formCol, { alignItems: 'flex-end' }]}>
              <Text style={[styles.formTeam, { textAlign: 'right' }]}>{away?.name.split(' ')[0] || '?'}</Text>
              <View style={[styles.formBadges, { justifyContent: 'flex-end' }]}>
                {awayForm.map((r, i) => {
                  const colors: Record<string, string> = { W: '#00E676', D: '#FFB800', L: '#FF3D5A' };
                  return (
                    <View key={i} style={[styles.formBadge, { backgroundColor: `${colors[r]}20`, borderColor: `${colors[r]}40` }]}>
                      <Text style={[styles.formBadgeText, { color: colors[r] }]}>{r}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Match Event Editor (admin only) */}
        {isLeagueManager && isCompleted && events && (
          <MatchEventEditor
            matchId={matchId}
            matchDay={match.matchDay}
            homeTeamId={match.homeTeamId}
            awayTeamId={match.awayTeamId}
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {/* Navigation to teams */}
        <View style={styles.teamNavRow}>
          <TouchableOpacity
            style={[styles.teamNavButton, { backgroundColor: home ? `${home.primaryColor}18` : 'rgba(255,255,255,0.05)', borderColor: home ? `${home.primaryColor}30` : 'rgba(255,255,255,0.05)' }]}
            onPress={() => navigation.navigate('TeamDetail', { teamId: match.homeTeamId })}
          >
            <Text style={styles.teamNavText}>{home ? home.name.split(' ')[0] : '?'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.teamNavButton, { backgroundColor: away ? `${away.primaryColor}18` : 'rgba(255,255,255,0.05)', borderColor: away ? `${away.primaryColor}30` : 'rgba(255,255,255,0.05)' }]}
            onPress={() => navigation.navigate('TeamDetail', { teamId: match.awayTeamId })}
          >
            <Text style={styles.teamNavText}>{away ? away.name.split(' ')[0] : '?'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, paddingHorizontal: 20, zIndex: 10 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, color: '#5A6880' },
  hero: { paddingHorizontal: 20, paddingTop: 80, paddingBottom: 28 },
  statusRow: { justifyContent: 'center', marginBottom: 20 },
  statusPill: { alignSelf: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  teamCol: { flex: 1, alignItems: 'center', gap: 8 },
  teamBadge: { width: 64, height: 64, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText: { fontSize: 32, color: '#F0F4FF' },
  teamName: { fontSize: 15, fontWeight: '700', color: '#F0F4FF', textAlign: 'center' },
  teamLabel: { fontSize: 11, color: '#5A6880' },
  scoreCol: { flex: 1.2, alignItems: 'center', gap: 4 },
  scoreDisplay: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreNum: { fontFamily: 'monospace', fontSize: 48, fontWeight: '700', lineHeight: 50 },
  scoreDash: { fontSize: 24, color: '#253352', fontWeight: '300' },
  vsDisplay: { alignItems: 'center', gap: 4 },
  vsText: { fontSize: 36, fontWeight: '800', color: '#F0F4FF', letterSpacing: 1 },
  vsTime: { fontSize: 16, fontWeight: '600', color: '#FFB800' },
  resultLabel: { fontSize: 11, color: '#5A6880', marginTop: 4 },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#131B2E', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardLabel: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  infoIcon: { fontSize: 14, color: '#5A6880', width: 20, textAlign: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#5A6880' },
  infoValue: { fontSize: 14, color: '#F0F4FF', fontWeight: '500', marginTop: 1 },
  scorersRow: { flexDirection: 'row', gap: 16 },
  scorersCol: { flex: 1, gap: 8 },
  scorersDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  scorerItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scorerIcon: { fontSize: 12 },
  scorerText: { fontSize: 13, color: '#F0F4FF' },
  scorerEmpty: { fontSize: 12, color: '#5A6880', textAlign: 'right' },
  formRow: { flexDirection: 'row', gap: 16 },
  formCol: { flex: 1, gap: 6 },
  formTeam: { fontSize: 12, fontWeight: '600', color: '#F0F4FF', marginBottom: 4 },
  formBadges: { flexDirection: 'row', gap: 6 },
  formBadge: { width: 26, height: 26, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  formBadgeText: { fontSize: 11, fontWeight: '700' },
  teamNavRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  teamNavButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  teamNavText: { fontSize: 14, fontWeight: '600', color: '#F0F4FF' },
});
