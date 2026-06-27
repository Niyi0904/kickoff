import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import type { PlayerDetailScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { usePlayer, useTeam, usePlayerStats } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function PlayerDetailScreen({ route, navigation }: PlayerDetailScreenProps) {
  const { playerId } = route.params;
  const { userProfile, role, isLeagueManager, isPlayer } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { data: player, isLoading } = usePlayer(playerId);
  const { data: team } = useTeam(player?.teamId || '');
  const { data: playerStats = [] } = usePlayerStats();

  const stats = useMemo(() => playerStats.find(s => s.playerId === playerId), [playerStats, playerId]);

  if (isLoading || !player) return <LoadingView />;

  const isOwnProfile = userProfile?.id === player.linkedUserId;
  const canClaim = isPlayer && !player.linkedUserId && !claimed;

  const statItems = [
    { label: 'Goals', value: stats?.goals ?? 0, color: '#00E676' },
    { label: 'Assists', value: stats?.assists ?? 0, color: '#4D7EFF' },
    { label: 'Yellows', value: stats?.yellowCards ?? 0, color: '#FFB800' },
    { label: 'Reds', value: stats?.redCards ?? 0, color: '#FF3D5A' },
  ];

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: team ? `${team.primaryColor}15` : '#09101E' }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroContent}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: team ? `${team.primaryColor}25` : 'rgba(255,255,255,0.1)', borderColor: team ? `${team.primaryColor}40` : 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{player.name}</Text>
            {player.linkedUserId && (
              <View style={styles.claimedTag}>
                <Text style={styles.claimedTagText}>CLAIMED</Text>
              </View>
            )}
          </View>
          {team && (
            <TouchableOpacity onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}>
              <View style={styles.teamLink}>
                <View style={[styles.teamBadge, { backgroundColor: `${team.primaryColor}25` }]}>
                  <Text style={styles.teamBadgeText}>{team.name[0]}</Text>
                </View>
                <Text style={[styles.teamLinkText, { color: team.primaryColor }]}>{team.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{player.position}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>#{player.number}</Text>
            </View>
          </View>

          {/* Claim / Actions */}
          {canClaim && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => setShowClaimModal(true)}
            >
              <Text style={styles.claimIcon}>🔗</Text>
              <Text style={styles.claimText}>Claim This Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats grid */}
        <Text style={styles.sectionLabel}>Season Stats</Text>
        <View style={styles.statsGrid}>
          {statItems.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Player Info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Player Info</Text>
          {[
            { label: 'Squad Number', value: `#${player.number}` },
            { label: 'Position', value: player.position },
            { label: 'Team', value: team?.name || 'N/A' },
          ].map(item => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Claim modal */}
      <Modal visible={showClaimModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Claim Profile</Text>
            <Text style={styles.modalBody}>
              Claiming this profile will link it to your account. The league admin will review and approve your request.
            </Text>
            <TouchableOpacity
              style={styles.modalPrimary}
              onPress={() => { setClaimed(true); setShowClaimModal(false); }}
            >
              <Text style={styles.modalPrimaryText}>Submit Claim Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowClaimModal(false)}>
              <Text style={styles.modalSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, paddingHorizontal: 20, zIndex: 10 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: '#5A6880' },
  hero: { paddingHorizontal: 20, paddingTop: 100, paddingBottom: 24 },
  heroContent: { alignItems: 'center', gap: 10 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 40 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  playerName: { fontSize: 26, fontWeight: '800', color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  claimedTag: { backgroundColor: 'rgba(0,230,118,0.12)', borderWidth: 1, borderColor: 'rgba(0,230,118,0.3)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  claimedTagText: { fontSize: 10, color: '#00E676', fontWeight: '700' },
  teamLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  teamBadge: { width: 20, height: 20, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  teamBadgeText: { fontSize: 11, color: '#F0F4FF' },
  teamLinkText: { fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  metaText: { fontSize: 11, color: '#5A6880' },
  claimButton: { width: '100%', marginTop: 16, height: 48, borderRadius: 13, backgroundColor: '#00E676', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  claimIcon: { fontSize: 16 },
  claimText: { color: '#09101E', fontSize: 15, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '46%', backgroundColor: '#131B2E', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  statValue: { fontFamily: 'monospace', fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 },
  card: { backgroundColor: '#131B2E', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardLabel: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 13, color: '#5A6880' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#F0F4FF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#131B2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  modalHandle: { width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#F0F4FF', textTransform: 'uppercase', marginBottom: 8 },
  modalBody: { fontSize: 14, color: '#7A8699', marginBottom: 20, lineHeight: 22 },
  modalPrimary: { width: '100%', height: 52, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalPrimaryText: { color: '#09101E', fontSize: 16, fontWeight: '700' },
  modalSecondary: { width: '100%', height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  modalSecondaryText: { color: '#F0F4FF', fontSize: 15 },
});
