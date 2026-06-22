import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { TEAMS } from '../../lib/data';

export default function TeamManagementScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Teams</Text>
        </View>

        <View style={styles.list}>
          {TEAMS.map((team, idx) => (
            <TouchableOpacity
              key={team.id}
              style={styles.teamRow}
              onPress={() => navigation.navigate('TeamForm', { teamId: team.id })}
              activeOpacity={0.8}
            >
              <View style={[styles.teamBadge, { backgroundColor: `${team.color}20` }]}>
                <Text style={styles.teamBadgeText}>{team.badge}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamMeta}>{team.shortName} · {team.manager}</Text>
              </View>
              <View style={styles.teamStats}>
                <Text style={styles.teamPts}>{team.points} pts</Text>
                <Text style={styles.teamForm}>W{team.wins} D{team.draws} L{team.losses}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
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
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  teamBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 20,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  teamMeta: {
    fontSize: 12,
    color: '#5A6880',
    marginTop: 2,
  },
  teamStats: {
    alignItems: 'flex-end',
  },
  teamPts: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#00E676',
  },
  teamForm: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 2,
  },
  arrow: {
    color: '#5A6880',
    fontSize: 18,
  },
});