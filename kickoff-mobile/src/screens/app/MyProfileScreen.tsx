import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { usePlayer, usePlayers, useUnclaimedPlayers, useClaimPlayerProfile, useUnlinkPlayerProfile } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function MyProfileScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { userProfile, userRole, playerId, teamId } = useAuth();
  const claimProfile = useClaimPlayerProfile();
  const unlinkProfile = useUnlinkPlayerProfile();

  const { data: linkedPlayer, isLoading: playerLoading } = usePlayer(playerId ?? '');
  const { data: teamPlayers = [], isLoading: playersLoading } = usePlayers(teamId ?? '');
  const { data: allUnclaimed = [] } = useUnclaimedPlayers();

  const unclaimedPlayers = useMemo(() => {
    if (teamId) return allUnclaimed.filter(p => p.teamId === teamId);
    return allUnclaimed;
  }, [allUnclaimed, teamId]);

  const handleClaim = async (pId: string) => {
    if (!userProfile?.id) return;
    await claimProfile.mutateAsync({ playerId: pId, userId: userProfile.id });
  };

  const handleUnlink = () => {
    if (!playerId || !userProfile?.id) return;
    Alert.alert('Unlink Profile', 'Are you sure? This will unlink your account from this player.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: () => unlinkProfile.mutateAsync({ playerId, userId: userProfile.id }) },
    ]);
  };

  if (!userProfile) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* User info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>{userProfile.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userRole?.role?.replace('_', ' ') ?? 'player'}</Text>
          </View>
        </View>

        {/* Linked player */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Player</Text>
          {playerId && linkedPlayer ? (
            <View style={styles.linkedCard}>
              <View style={styles.linkedInfo}>
                <Text style={styles.linkedName}>{linkedPlayer.name}</Text>
                <Text style={styles.linkedMeta}>#{linkedPlayer.number} · {linkedPlayer.position}</Text>
              </View>
              <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('PlayerDetail', { playerId })}>
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.unlinkButton} onPress={handleUnlink}>
                <Text style={styles.unlinkButtonText}>Unlink</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noLinkedCard}>
              <Text style={styles.noLinkedText}>No player profile linked yet.</Text>
              <Text style={styles.noLinkedHint}>Claim a player below to track your stats.</Text>
            </View>
          )}
        </View>

        {/* Claimable players */}
        {!playerId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claim a Player</Text>
            {unclaimedPlayers.length === 0 ? (
              <View style={styles.noLinkedCard}>
                <Text style={styles.noLinkedText}>No unclaimed players available.</Text>
              </View>
            ) : (
              unclaimedPlayers.map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.claimRow}
                  onPress={() => handleClaim(player.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.claimAvatar}>
                    <Text style={styles.claimAvatarText}>👤</Text>
                  </View>
                  <View style={styles.claimInfo}>
                    <Text style={styles.claimName}>{player.name}</Text>
                    <Text style={styles.claimMeta}>#{player.number} · {player.position}</Text>
                  </View>
                  <Text style={styles.claimArrow}>Claim</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8, gap: 12 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F0F4FF', textTransform: 'uppercase' },
  userCard: { alignItems: 'center', padding: 24, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,230,118,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontSize: 36 },
  userName: { fontSize: 24, fontWeight: '800', color: '#F0F4FF', textTransform: 'uppercase' },
  userEmail: { fontSize: 14, color: '#7A8699' },
  roleBadge: { backgroundColor: 'rgba(0,230,118,0.12)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
  roleText: { fontSize: 11, color: '#00E676', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginBottom: 10 },
  linkedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 12 },
  linkedInfo: { flex: 1 },
  linkedName: { fontSize: 15, fontWeight: '700', color: '#F0F4FF' },
  linkedMeta: { fontSize: 12, color: '#5A6880', marginTop: 2 },
  viewButton: { backgroundColor: 'rgba(0,230,118,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  viewButtonText: { fontSize: 12, fontWeight: '600', color: '#00E676' },
  unlinkButton: { backgroundColor: 'rgba(255,61,90,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  unlinkButtonText: { fontSize: 12, fontWeight: '600', color: '#FF3D5A' },
  noLinkedCard: { backgroundColor: '#131B2E', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  noLinkedText: { fontSize: 14, color: '#B8C4D8', fontWeight: '600' },
  noLinkedHint: { fontSize: 12, color: '#5A6880', marginTop: 4 },
  claimRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131B2E', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', gap: 12 },
  claimAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,230,118,0.12)', alignItems: 'center', justifyContent: 'center' },
  claimAvatarText: { fontSize: 18 },
  claimInfo: { flex: 1 },
  claimName: { fontSize: 14, fontWeight: '600', color: '#F0F4FF' },
  claimMeta: { fontSize: 11, color: '#5A6880', marginTop: 1 },
  claimArrow: { fontSize: 13, fontWeight: '600', color: '#00E676' },
});
