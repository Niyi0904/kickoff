import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { getPlayerById, getTeamById } from '../../lib/data';

export default function PlayerDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { role, user } = useApp();
  const [claimed, setClaimed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const player = getPlayerById(id);
  const team = player ? getTeamById(player.teamId) : null;

  if (!player || !team) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Player not found</Text>
        </View>
      </View>
    );
  }

  const isOwnProfile = user?.playerId === player.id;
  const canClaim = role === 'player' && !player.isClaimed && !claimed;

  const stats = [
    { label: 'Goals', value: player.goals, color: '#00E676' },
    { label: 'Assists', value: player.assists, color: '#4D7EFF' },
    { label: 'Apps', value: player.appearances, color: '#FFB800' },
    { label: 'Rating', value: player.rating.toFixed(1), color: '#A855F7' },
    { label: 'Yellows', value: player.yellowCards, color: '#FFB800' },
    { label: 'Reds', value: player.redCards, color: '#FF3D5A' },
    ...(player.position === 'GK' ? [{ label: 'Clean Sheets', value: (player.cleanSheets || 0).toString(), color: '#00E676' }] : []),
  ];

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: `${team.color}15` }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroContent}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: `${team.color}25`, borderColor: `${team.color}40` }]}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            {(isOwnProfile || role === 'admin') && (
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{player.name}</Text>
            {(player.isClaimed || claimed) && (
              <View style={styles.claimedTag}>
                <Text style={styles.claimedTagText}>CLAIMED</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}>
            <View style={styles.teamLink}>
              <View style={[styles.teamBadge, { backgroundColor: `${team.color}25` }]}>
                <Text style={styles.teamBadgeText}>{team.badge}</Text>
              </View>
              <Text style={[styles.teamLinkText, { color: team.color }]}>{team.name}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{player.position}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>#{player.number}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>Age {player.age}</Text>
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
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Player Info</Text>
          {[
            { label: 'Nationality', value: player.nationality },
            { label: 'Age', value: `${player.age} years` },
            { label: 'Squad Number', value: `#${player.number}` },
            { label: 'Position', value: player.position },
          ].map(item => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Rating bar */}
        <View style={styles.card}>
          <View style={styles.ratingHeader}>
            <Text style={styles.cardLabel}>Season Rating</Text>
            <Text style={styles.ratingValue}>{player.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.ratingBarBg}>
            <View style={[styles.ratingBarFill, { width: `${(player.rating / 10) * 100}%` }]} />
          </View>
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>0</Text>
            <Text style={styles.ratingLabel}>10</Text>
          </View>
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
  },
  emptyText: {
    fontSize: 14,
    color: '#5A6880',
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  claimedTag: {
    backgroundColor: 'rgba(0,230,118,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  claimedTagText: {
    fontSize: 10,
    color: '#00E676',
    fontWeight: '700',
  },
  teamLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  teamBadge: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 11,
  },
  teamLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#5A6880',
  },
  claimButton: {
    width: '100%',
    marginTop: 16,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  claimIcon: {
    fontSize: 16,
  },
  claimText: {
    color: '#09101E',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '30%',
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
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
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#5A6880',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingValue: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#A855F7',
  },
  ratingBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  ratingLabel: {
    fontSize: 10,
    color: '#5A6880',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#131B2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: '#7A8699',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalPrimary: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalPrimaryText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    color: '#F0F4FF',
    fontSize: 15,
  },
});