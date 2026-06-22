import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { TEAMS, FIXTURES, PLAYERS, LEAGUE, getTeamById } from '../../lib/data';

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors: Record<string, string> = { W: '#00E676', D: '#FFB800', L: '#FF3D5A' };
  return <View style={[styles.formDot, { backgroundColor: colors[result] }]} />;
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: color || '#F0F4FF' }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const { user, role } = useApp();
  const topTeam = TEAMS[0];
  const nextFixture = FIXTURES.find(f => f.status === 'upcoming');
  const recentResult = FIXTURES.find(f => f.status === 'completed');
  const topScorer = PLAYERS[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.userName}>{user ? user.name.split(' ')[0] : 'Fan'}</Text>
            </View>
            <View style={styles.gameweekBox}>
              <Text style={styles.gameweekLabel}>Gameweek</Text>
              <Text style={styles.gameweekValue}>{LEAGUE.currentGameweek}</Text>
            </View>
          </View>

          {/* League banner */}
          <View style={styles.leagueBanner}>
            <View>
              <Text style={styles.leagueName}>{LEAGUE.name}</Text>
              <Text style={styles.leagueSeason}>{LEAGUE.season} Season</Text>
              <Text style={styles.leagueProgress}>{LEAGUE.currentGameweek} of {LEAGUE.totalGameweeks} gameweeks played</Text>
            </View>
            <View style={styles.leagueLogo}>
              <Text style={styles.leagueLogoText}>⚽</Text>
            </View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <StatCard label="Teams" value={`${TEAMS.length}`} />
          <StatCard label="Matches" value={FIXTURES.filter(f => f.status === 'completed').length.toString()} />
          <StatCard label="Goals" value={FIXTURES.filter(f => f.status === 'completed').reduce((a, f) => a + (f.homeScore || 0) + (f.awayScore || 0), 0).toString()} color="#00E676" />
        </View>

        {/* Role-specific quick action */}
        {role !== 'guest' && (
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate(role === 'admin' ? 'AdminHome' : 'Profile')}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.quickActionLabel}>
                {role === 'player' ? 'My Profile' : role === 'manager' ? 'My Team' : 'Admin Panel'}
              </Text>
              <Text style={styles.quickActionDesc}>
                {role === 'player' ? 'View your stats & update profile' : role === 'manager' ? 'Manage squad & view fixtures' : 'Manage league operations'}
              </Text>
            </View>
            <View style={styles.quickActionArrow}>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Next fixture */}
        {nextFixture && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionIcon}>📅</Text>
                <Text style={styles.sectionTitle}>Next Fixture</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Fixtures')}>
                <Text style={styles.sectionLink}>See all</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.fixtureCard}
              onPress={() => navigation.navigate('MatchDetail', { matchId: nextFixture.id })}
              activeOpacity={0.9}
            >
              <Text style={styles.fixtureMeta}>
                GW{nextFixture.gameweek} · {nextFixture.date} · {nextFixture.time}
              </Text>
              <View style={styles.fixtureTeams}>
                {[nextFixture.homeTeamId, nextFixture.awayTeamId].map((tid, i) => {
                  const t = getTeamById(tid)!;
                  return (
                    <View key={tid} style={[styles.fixtureTeam, { alignItems: i === 0 ? 'flex-start' : 'flex-end' }]}>
                      <View style={[styles.teamBadge, { backgroundColor: `${t.color}20`, borderColor: `${t.color}40` }]}>
                        <Text style={styles.teamBadgeText}>{t.badge}</Text>
                      </View>
                      <Text style={styles.teamShortName}>{t.shortName}</Text>
                      <Text style={styles.teamFullName}>{t.name}</Text>
                    </View>
                  );
                })}
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                  <Text style={styles.venueText}>{nextFixture.venue.split(' ').slice(0, 2).join(' ')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Latest result */}
        {recentResult && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionIcon}>🔥</Text>
                <Text style={styles.sectionTitle}>Latest Result</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => navigation.navigate('MatchDetail', { matchId: recentResult.id })}
              activeOpacity={0.9}
            >
              <View style={styles.resultRow}>
                {[recentResult.homeTeamId, recentResult.awayTeamId].map((tid, i) => {
                  const t = getTeamById(tid)!;
                  const score = i === 0 ? recentResult.homeScore : recentResult.awayScore;
                  return (
                    <View key={tid} style={[styles.resultTeam, { flexDirection: i === 0 ? 'row' : 'row-reverse' }]}>
                      <View style={[styles.resultBadge, { backgroundColor: `${t.color}20` }]}>
                        <Text style={styles.resultBadgeText}>{t.badge}</Text>
                      </View>
                      <Text style={styles.resultTeamName}>{t.shortName}</Text>
                      <Text style={[styles.resultScore, { color: score! > (i === 0 ? recentResult.awayScore! : recentResult.homeScore!) ? '#00E676' : score === (i === 0 ? recentResult.awayScore : recentResult.homeScore) ? '#FFB800' : '#F0F4FF' }]}>
                        {score}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.resultMeta}>GW{recentResult.gameweek} · FT</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top of table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>📈</Text>
              <Text style={styles.sectionTitle}>Top of Table</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Standings')}>
              <Text style={styles.sectionLink}>Full table</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.standingsList}>
            {TEAMS.slice(0, 3).map((team, idx) => (
              <TouchableOpacity
                key={team.id}
                style={styles.standingRow}
                onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}
                activeOpacity={0.8}
              >
                <Text style={[styles.standingPos, { color: idx === 0 ? '#00E676' : '#5A6880' }]}>{idx + 1}</Text>
                <View style={[styles.standingBadge, { backgroundColor: `${team.color}20` }]}>
                  <Text style={styles.standingBadgeText}>{team.badge}</Text>
                </View>
                <View style={styles.standingInfo}>
                  <Text style={styles.standingName}>{team.name}</Text>
                  <View style={styles.formRow}>
                    {team.form.map((r, i) => <FormDot key={i} result={r} />)}
                  </View>
                </View>
                <Text style={styles.standingPts}>{team.points}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top scorer */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>⭐</Text>
              <Text style={styles.sectionTitle}>Top Scorer</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.topScorerCard}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: topScorer.id })}
            activeOpacity={0.9}
          >
            <View style={styles.topScorerAvatar}>
              <Text style={styles.topScorerAvatarText}>👤</Text>
            </View>
            <View style={styles.topScorerInfo}>
              <Text style={styles.topScorerName}>{topScorer.name}</Text>
              <Text style={styles.topScorerTeam}>{getTeamById(topScorer.teamId)?.name} · {topScorer.position}</Text>
            </View>
            <View style={styles.topScorerStats}>
              <Text style={styles.topScorerGoals}>{topScorer.goals}</Text>
              <Text style={styles.topScorerLabel}>goals</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09101E',
  },
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: '#5A6880',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  gameweekBox: {
    alignItems: 'flex-end',
  },
  gameweekLabel: {
    fontSize: 11,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gameweekValue: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: '#00E676',
  },
  leagueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,230,118,0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.15)',
  },
  leagueName: {
    fontSize: 12,
    color: '#00E676',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  leagueSeason: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F4FF',
    marginTop: 2,
  },
  leagueProgress: {
    fontSize: 13,
    color: '#7A8699',
    marginTop: 2,
  },
  leagueLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,230,118,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueLogoText: {
    fontSize: 26,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickAction: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#00E676',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickActionDesc: {
    fontSize: 15,
    color: '#F0F4FF',
    marginTop: 2,
    fontWeight: '600',
  },
  quickActionArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,230,118,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    color: '#00E676',
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#5A6880',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionLink: {
    fontSize: 12,
    color: '#00E676',
  },
  fixtureCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  fixtureMeta: {
    fontSize: 11,
    color: '#FFB800',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  fixtureTeams: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixtureTeam: {
    flex: 1,
    gap: 4,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 22,
  },
  teamShortName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  teamFullName: {
    fontSize: 11,
    color: '#5A6880',
  },
  vsContainer: {
    flex: 0.8,
    alignItems: 'center',
    gap: 4,
  },
  vsText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0F4FF',
    lineHeight: 34,
  },
  venueText: {
    fontSize: 11,
    color: '#5A6880',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTeam: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  resultBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: {
    fontSize: 18,
  },
  resultTeamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  resultScore: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '700',
  },
  resultMeta: {
    fontSize: 11,
    color: '#5A6880',
    textAlign: 'center',
    marginTop: 8,
  },
  standingsList: {
    gap: 8,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  standingPos: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    width: 16,
    textAlign: 'center',
  },
  standingBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standingBadgeText: {
    fontSize: 16,
  },
  standingInfo: {
    flex: 1,
  },
  standingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  formDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  standingPts: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: '#00E676',
  },
  topScorerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 14,
  },
  topScorerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,230,118,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topScorerAvatarText: {
    fontSize: 22,
  },
  topScorerInfo: {
    flex: 1,
  },
  topScorerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  topScorerTeam: {
    fontSize: 12,
    color: '#5A6880',
    marginTop: 2,
  },
  topScorerStats: {
    alignItems: 'flex-end',
  },
  topScorerGoals: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '700',
    color: '#00E676',
    lineHeight: 30,
  },
  topScorerLabel: {
    fontSize: 11,
    color: '#5A6880',
  },
});