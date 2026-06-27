import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useAllUsers, useUpdateUserRole } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { useTheme } from '../../theme';

const ROLES = ['league_manager', 'team_manager', 'player', 'user'] as const;

export default function AdminUsersScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { colors } = useTheme();
  const { data: users = [], isLoading } = useAllUsers();
  const updateRole = useUpdateUserRole();

  const handleRoleChange = (uid: string, currentRole: string) => {
    const buttons: any[] = ROLES.map(role => ({
      text: role.replace('_', ' '),
      onPress: () => { updateRole.mutateAsync({ uid, role }); },
    }));
    buttons.push({ text: 'Cancel', onPress: () => {}, style: 'cancel' });
    Alert.alert('Change Role', `Current: ${currentRole}`, buttons);
  };

  if (isLoading) return <LoadingView />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8, gap: 12 }}>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, textTransform: 'uppercase' }}>Manage Users</Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
          {users.map(user => (
            <View key={user.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{user.displayName || 'No name'}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{user.email}</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.primary}1E`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 4 }} onPress={() => handleRoleChange(user.id, user.role ?? 'player')}>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' }}>{user.role?.replace('_', ' ') ?? 'player'}</Text>
                <Text style={{ fontSize: 8, color: colors.primary }}>▼</Text>
              </TouchableOpacity>
            </View>
          ))}
          {users.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>No users found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
