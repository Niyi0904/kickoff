import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { TEAMS, PLAYERS, LINK_REQUESTS, SUSPENSIONS } from '../../lib/data';

export default function AdminHomeScreen({ navigation }: any) {
  const { role } = useApp();

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Access Denied</Text>
          <Text style={styles.emptyText}>You need League Admin privileges to access this area.</Text>
        </View>
      </View>
    );
  }

  const stats = [
    { label: 'Teams', value: TEAMS.length, color: '#4D7EFF', icon: '⚽' },
    { label: 'Players', value: PLAYERS.length, color: '#00E676', icon: '👤' },
    { label: 'Pending Requests', value: LINK_REQUESTS.filter(r => r.status === 'pending').length, color: '#FFB800', icon: '🔗' },
    { label: 'Suspensions', value: SUSPENSIONS.filter(s => s.matchesServed < s.matchesBanned).length, color: '#FF3D5A', icon: '🚫' },
  ];

  const actions = [
    { icon: '👥', label: 'Manage Users', desc: 'View & manage user accounts', path: 'TeamManagement', color: '#4D7EFF' },
    { icon: '🔗', label: 'Link Requests', desc: 'Review profile claim requests', path: 'PlayerManagement', color: '#FFB800', badge: LINK_REQUESTS.filter(r => r.status === 'pending').length },
    { icon: '🚫', label: 'Suspensions', desc: 'Manage player bans', path: 'MatchManagement', color: '#FF3D5A' },
    { icon: '📅', label: 'Generate Fixtures', desc: 'Auto-schedule match fixtures', path: 'MatchForm', color: '#00E676' },
    { icon: '⚙️', label: 'League Settings', desc: 'Configure league parameters', path: 'LeagueSettings', color: '#A855F7' },
    { icon: '📊', label: 'Season Stats', desc: 'League-wide analytics', path: 'Stats', color: '#20B2AA' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, { borderColor: `${s.color}20` }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsCard}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={action.path}
                style={[styles.actionRow, idx < actions.length - 1 && styles.actionRowBorder]}
                onPress={() => navigation.navigate(action.path)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}18` }]}>
                  <Text style={styles.actionIconText}>{action.icon}</Text>
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </View>
                {action.badge ? (
                  <View style={[styles.badge, { backgroundColor: action.color }]}>
                    <Text style={styles.badgeText}>{action.badge}</Text>
                  </View>
                ) : (
                  <Text style={styles.actionArrow}>›</Text>
                )}
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F4FF',
    textTransform: 'uppercase',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backIcon: {
    color: '#F0F4FF',
    fontSize: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 14,
    color: '#7A8699',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  statLabel: {
    fontSize: 12,
    color: '#5A6880',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  actionsCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  actionDesc: {
    fontSize: 12,
    color: '#5A6880',
    marginTop: 1,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09101E',
  },
  actionArrow: {
    color: '#5A6880',
    fontSize: 18,
  },
});