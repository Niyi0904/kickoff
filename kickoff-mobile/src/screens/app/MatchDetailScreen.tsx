import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { getFixtureById, getTeamById } from '../../lib/data';

export default function MatchDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { role } = useApp();
  const fixture = getFixtureById(id);

  if (!fixture) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>❌</Text>
          <Text style={styles.emptyText}>Fixture not found</Text>
        </View>
      </View>
    );
  }

  const home = getTeamById(fixture.homeTeamId)!;
  const away = getTeamById(fixture.awayTeamId)!;
  const isCompleted = fixture.status === 'completed';
  const isUpcoming = fixture.status === 'upcoming';

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
              {isCompleted ? 'Full Time' : fixture.status === 'live' ? 'Live' : `GW${fixture.gameweek} · ${fixture.date}`}
            </Text>
          </View>
        </View>

        {/* Teams & Score */}
        <View style={styles.scoreRow}>
          {/* Home team */}
          <View style={styles.teamCol}>
            <View style={[styles.teamBadge, { backgroundColor: `${home.color}20`, borderColor: `${home.color}40` }]}>
              <Text style={styles.teamBadgeText}>{home.badge}</Text>
            </View>
            <Text style={styles.teamName}>{home.name}</Text>
            <Text style={styles.teamLabel}>Home</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreCol}>
            {isCompleted ? (
              <View style={styles.scoreDisplay}>
                <Text style={[styles.scoreNum, { color: fixture.homeScore! > fixture.awayScore! ? '#00E676' : '#F0F4FF' }]}>{fixture.homeScore}</Text>
                <Text style={styles.scoreDash}>—</Text>
                <Text style={[styles.scoreNum, { color: fixture.awayScore! > fixture.homeScore! ? '#00E676' : '#F0F4FF' }]}>{fixture.awayScore}</Text>
              </View>
            ) : (
              <View style={styles.vsDisplay}>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.vsTime}>{fixture.time}</Text>
              </View>
            )}
            {isCompleted && (
              <Text style={styles.resultLabel}>
                {fixture.homeScore === fixture.awayScore ? 'Draw' : (fixture.homeScore! > fixture.awayScore! ? home.shortName : away.shortName) + ' Win'}
              </Text>
            )}
          </View>

          {/* Away team */}
          <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
            <View style={[styles.teamBadge, { backgroundColor: `${away.color}20`, borderColor: `${away.color}40` }]}>
              <Text style={styles.teamBadgeText}>{away.badge}</Text>
            </View>
            <Text style={styles.teamName}>{away.name}</Text>
            <Text style={styles.teamLabel}>Away</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Match Info</Text>
          {[
            { icon: '🕒', label: 'Date & Time', value: `${fixture.date} · ${fixture.time}` },
            { icon: '📍', label: 'Venue', value: fixture.venue },
            { icon: '👥', label: 'Attendance', value: fixture.attendance ? fixture.attendance.toLocaleString() : 'TBD' },
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
        {isCompleted && (fixture.homeScorers?.length || fixture.awayScorers?.length) && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Goals</Text>
            <View style={styles.scorersRow}>
              <View style={styles.scorersCol}>
                {(fixture.homeScorers || []).map((s, i) => (
                  <View key={i} style={styles.scorerItem}>
                    <Text style={styles.scorerIcon}>⚽</Text>
                    <Text style={styles.scorerText}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.scorersDivider} />
              <View style={[styles.scorersCol, { alignItems: 'flex-end' }]}>
                {(fixture.awayScorers || []).map((s, i) => (
                  <View key={i} style={styles.scorerItem}>
                    <Text style={styles.scorerText}>{s}</Text>
                    <Text style={styles.scorerIcon}>⚽</Text>
                  </View>
                ))}
                {(fixture.awayScorers || []).length === 0 && <Text style={styles.scorerEmpty}>—</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Head to head */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Team Form</Text>
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formTeam}>{home.shortName}</Text>
              <View style={styles.formBadges}>
                {home.form.map((r, i) => {
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
              <Text style={[styles.formTeam, { textAlign: 'right' }]}>{away.shortName}</Text>
              <View style={[styles.formBadges, { justifyContent: 'flex-end' }]}>
                {away.form.map((r, i) => {
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

        {/* Navigation to teams */}
        <View style={styles.teamNavRow}>
          <TouchableOpacity style={[styles.teamNavButton, { backgroundColor: `${home.color}18`, borderColor: `${home.color}30` }]} onPress={() => navigation.navigate('TeamDetail', { teamId: home.id })}>
            <Text style={styles.teamNavText}>{home.badge} {home.shortName}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.teamNavButton, { backgroundColor: `${away.color}18`, borderColor: `${away.color}30` }]} onPress={() => navigation.navigate('TeamDetail', { teamId: away.id })}>
            <Text style={styles.teamNavText}>{away.badge} {away.shortName}</Text>
          </TouchableOpacity>
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
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#5A6880',
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 28,
  },
  statusRow: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusPill: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  teamBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 32,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0F4FF',
    textAlign: 'center',
  },
  teamLabel: {
    fontSize: 11,
    color: '#5A6880',
  },
  scoreCol: {
    flex: 1.2,
    alignItems: 'center',
    gap: 4,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreNum: {
    fontFamily: 'monospace',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 50,
  },
  scoreDash: {
    fontSize: 24,
    color: '#253352',
    fontWeight: '300',
  },
  vsDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  vsText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F0F4FF',
    letterSpacing: 1,
  },
  vsTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFB800',
  },
  resultLabel: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLabel: {
    fontSize: 12,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 14,
    color: '#5A6880',
    width: 20,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#5A6880',
  },
  infoValue: {
    fontSize: 14,
    color: '#F0F4FF',
    fontWeight: '500',
    marginTop: 1,
  },
  scorersRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scorersCol: {
    flex: 1,
    gap: 8,
  },
  scorersDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scorerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scorerIcon: {
    fontSize: 12,
  },
  scorerText: {
    fontSize: 13,
    color: '#F0F4FF',
  },
  scorerEmpty: {
    fontSize: 12,
    color: '#5A6880',
    textAlign: 'right',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formCol: {
    flex: 1,
    gap: 6,
  },
  formTeam: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0F4FF',
    marginBottom: 4,
  },
  formBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  formBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  teamNavButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0F4FF',
  },
});