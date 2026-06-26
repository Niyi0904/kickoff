import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useLinkRequests, useUpdateLinkRequestStatus } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { useTheme } from '../../theme';

export default function AdminLinkRequestsScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const { data: requests = [], isLoading } = useLinkRequests(filter === 'pending' ? 'pending' : undefined);
  const updateStatus = useUpdateLinkRequestStatus();

  const handleApprove = (requestId: string) => {
    Alert.alert('Approve Request', 'Link this player to the user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => updateStatus.mutateAsync({ requestId, status: 'approved' }) },
    ]);
  };

  const handleReject = (requestId: string) => {
    Alert.alert('Reject Request', 'Reject this link request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus.mutateAsync({ requestId, status: 'rejected' }) },
    ]);
  };

  if (isLoading) return <LoadingView />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8, gap: 12 }}>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, textTransform: 'uppercase' }}>Link Requests</Text>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 }}>
          {(['pending', 'all'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: filter === f ? colors.primary : colors.border }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: filter === f ? colors.background : colors.textMuted }}>
                {f === 'pending' ? 'Pending' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
          {requests.map(req => (
            <View key={req.id} style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Player: {req.playerId}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>User: {req.userEmail || req.userId}</Text>
                <View style={{
                  alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
                  backgroundColor: req.status === 'approved' ? `${colors.primary}1E` : req.status === 'rejected' ? `${colors.red}1E` : `${colors.yellow}1E`,
                }}>
                  <Text style={{
                    fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
                    color: req.status === 'approved' ? colors.primary : req.status === 'rejected' ? colors.red : colors.yellow,
                  }}>{req.status}</Text>
                </View>
              </View>
              {req.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.primary}26`, alignItems: 'center', justifyContent: 'center' }} onPress={() => handleApprove(req.id)}>
                    <Text style={{ fontSize: 16, color: colors.primary }}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.red}26`, alignItems: 'center', justifyContent: 'center' }} onPress={() => handleReject(req.id)}>
                    <Text style={{ fontSize: 16, color: colors.red }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          {requests.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 64, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>🔗</Text>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>No link requests</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
