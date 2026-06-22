import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { FIXTURES, getTeamById } from '../../lib/data';

export default function MatchManagementScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Matches</Text>
        </View>

        <View style={styles.list}>
          {FIXTURES.map(fixture => {
            const home = getTeamById(fixture.homeTeamId)!;
            const away = getTeamById(fixture.awayTeamId)!;
            const isCompleted = fixture.status === 'completed';
            return (
              <TouchableOpacity
                key={fixture.id}
                style={styles.matchRow}
                onPress={() => navigation.navigate('MatchForm', { matchId: fixture.id })}
                activeOpacity={0.8}
              >
                <View style={styles.matchHeader}>
                  <Text style={styles.matchMeta}>GW{fixture.gameweek} · {fixture.date}</Text>
                  <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
                    <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
                      {isCompleted ? 'FT' : fixture.time}
                    </Text>
                  </View>
                </View>
                <View style={styles.matchBody}>
                  <View style={styles.teamCol}>
                    <Text style={styles.teamBadge}>{home.badge}</Text>
                    <Text style={styles.teamName}>{home.shortName}</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    {isCompleted ? (
                      <Text style={styles.scoreText}>
                        {fixture.homeScore}–{fixture.awayScore}
                      </Text>
                    ) : (
                      <Text style={styles.vsText}>VS</Text>
                    )}
                  </View>
                  <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.teamBadge}>{away.badge}</Text>
                    <Text style={styles.teamName}>{away.shortName}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
    gap: 12,
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  matchRow: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchMeta: {
    fontSize: 11,
    color: '#5A6880',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(0,230,118,0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#5A6880',
  },
  statusTextCompleted: {
    color: '#00E676',
  },
  matchBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  teamBadge: {
    fontSize: 20,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: '#00E676',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F0F4FF',
  },
});