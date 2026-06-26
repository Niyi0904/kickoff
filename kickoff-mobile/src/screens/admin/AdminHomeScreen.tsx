import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
} from 'react-native';
import type { AppListScreenProps, AppStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTeams, usePlayers } from '../../hooks/useAppData';
import { useTheme } from '../../theme';

type Action = {
  icon: string;
  label: string;
  desc: string;
  path: keyof AppStackParamList;
  color: string;
};

export default function AdminHomeScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { isLeagueManager } = useAuth();
  const { colors } = useTheme();
  const { data: teams = [] } = useTeams();
  const { data: players = [] } = usePlayers();

  if (!isLeagueManager) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 }}>
          <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, textTransform: 'uppercase' }}>Admin</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 50 }}>🔒</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, textTransform: 'uppercase' }}>Access Denied</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>You need League Admin privileges to access this area.</Text>
        </View>
      </View>
    );
  }

  const stats = [
    { label: 'Teams', value: teams.length, color: colors.blue, icon: '⚽' },
    { label: 'Players', value: players.length, color: colors.primary, icon: '👤' },
  ];

  const actions: Action[] = [
    { icon: '👥', label: 'Manage Teams', desc: 'Add, edit & delete teams', path: 'TeamManagement', color: colors.blue },
    { icon: '👤', label: 'Manage Players', desc: 'Add, edit & delete players', path: 'PlayerManagement', color: colors.primary },
    { icon: '📅', label: 'Manage Matches', desc: 'Schedule & record results', path: 'MatchManagement', color: colors.yellow },
    { icon: '⚙️', label: 'League Settings', desc: 'Configure league parameters', path: 'LeagueSettings', color: colors.purple },
    { icon: '👥', label: 'Manage Users', desc: 'View & change user roles', path: 'AdminUsers', color: colors.blue },
    { icon: '🔗', label: 'Link Requests', desc: 'Approve or reject player links', path: 'AdminLinkRequests', color: colors.yellow },
    { icon: '🚫', label: 'Suspensions', desc: 'Manage player suspensions', path: 'AdminSuspensions', color: colors.red },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, textTransform: 'uppercase' }}>Admin Panel</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <View key={s.label} style={{ width: '47%', backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${s.color}20`, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</Text>
              <Text style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: '700', lineHeight: 30, color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginBottom: 10 }}>Quick Actions</Text>
          <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={action.path}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14, borderBottomWidth: idx < actions.length - 1 ? 1 : 0, borderBottomColor: colors.border }}
                onPress={() => navigation.navigate(action.path as any)}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${action.color}18`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Text style={{ fontSize: 20 }}>{action.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{action.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{action.desc}</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
