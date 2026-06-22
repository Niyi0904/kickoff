import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { PLAYERS, getTeamById, LINK_REQUESTS } from '../../lib/data';

export default function PlayerManagementScreen({ navigation }: any) {
  const pendingRequests = LINK_REQUESTS.filter(r => r.status === 'pending');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Players</Text>
        </View>

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Link Requests ({pendingRequests.length})</Text>
            <View style={styles.card}>
              {pendingRequests.map(req => {
                const player = req.playerId ? PLAYERS.find(p => p.id === req.playerId) : null;
                const team = player ? getTeamById(player.teamId) : null;
                return (
                  <View key={req.id} style={styles.requestRow}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestUser}>{req.userName}</Text>
                      <Text style={styles.requestPlayer}>Claiming: {player?.name || 'Unknown'}</Text>
                      {team && <Text style={[styles.requestTeam, { color: team.color }]}>{team.name}</Text>}
                      <Text style={styles.requestDate}>Requested: {req.requestedAt}</Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity style={styles.approveButton}>
                        <Text style={styles.approveText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton}>
                        <Text style={styles.rejectText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Players list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Players</Text>
          <View style={styles.list}>
            {PLAYERS.map((player, idx) => {
              const team = getTeamById(player.teamId)!;
              return (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerRow}
                  onPress={() => navigation.navigate('PlayerForm', { playerId: player.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.playerBadge, { backgroundColor: `${team.color}20` }]}>
                    <Text style={styles.playerBadgeText}>👤</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={[styles.playerTeam, { color: team.color }]}>{team.shortName} · {player.position}</Text>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={styles.playerStat}>{player.goals}G</Text>
                    <Text style={styles.playerStat}>{player.assists}A</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  requestInfo: {
    flex: 1,
  },
  requestUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  requestPlayer: {
    fontSize: 12,
    color: '#5A6880',
    marginTop: 2,
  },
  requestTeam: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  requestDate: {
    fontSize: 11,
    color: '#5A6880',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,230,118,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '700',
  },
  rejectButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,61,90,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    color: '#FF3D5A',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  playerBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBadgeText: {
    fontSize: 18,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0F4FF',
  },
  playerTeam: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  playerStat: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6880',
  },
  arrow: {
    color: '#5A6880',
    fontSize: 18,
  },
});