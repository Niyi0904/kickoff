import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useSuspensions, useEndSuspension } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { useTheme } from '../../theme';

export default function AdminSuspensionsScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { colors } = useTheme();
  const [showActive, setShowActive] = useState(true);
  const { data: suspensions = [], isLoading } = useSuspensions(showActive);
  const endSus = useEndSuspension();

  const handleEnd = (id: string) => {
    Alert.alert('End Suspension', 'Mark this suspension as inactive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => endSus.mutateAsync(id) },
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, textTransform: 'uppercase' }}>Suspensions</Text>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 }}>
          {([true, false] as const).map(f => (
            <TouchableOpacity
              key={String(f)}
              onPress={() => setShowActive(f)}
              style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: showActive === f ? colors.primary : colors.border }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: showActive === f ? colors.background : colors.textMuted }}>
                {f ? 'Active' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
          {suspensions.map(s => (
            <View key={s.id} style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{s.playerName || s.playerId}</Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.active ? colors.red : colors.textSecondary }} />
              </View>
              <Text style={{ fontSize: 13, color: colors.yellow, fontWeight: '500' }}>{s.reason}</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>From: {new Date(s.startDate).toLocaleDateString()}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>To: {new Date(s.endDate).toLocaleDateString()}</Text>
              </View>
              {s.active && (
                <TouchableOpacity style={{ backgroundColor: `${colors.red}26`, borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 4 }} onPress={() => handleEnd(s.id)}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.red }}>End Suspension</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {suspensions.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>No suspensions</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
