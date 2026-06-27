import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import type { AppListScreenProps } from '../../navigation/types';
import { useLeagueSettings, useUpdateLeagueSettings } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function LeagueSettingsScreen({ navigation }: { navigation: AppListScreenProps }) {
  const { data: settings, isLoading } = useLeagueSettings();
  const updateSettings = useUpdateLeagueSettings();

  const [form, setForm] = useState({
    seasonName: '',
    leagueVenue: '',
    matchDay: '',
    defaultTime: '',
    pointsWin: '3',
    pointsDraw: '1',
    pointsLoss: '0',
    yellowsPerBan: '3',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        seasonName: settings.seasonName || '',
        leagueVenue: settings.leagueVenue || '',
        matchDay: settings.matchDay || '',
        defaultTime: settings.defaultTime || '',
        pointsWin: settings.pointsWin?.toString() || '3',
        pointsDraw: settings.pointsDraw?.toString() || '1',
        pointsLoss: settings.pointsLoss?.toString() || '0',
        yellowsPerBan: settings.yellowsPerBan?.toString() || '3',
      });
    }
  }, [settings]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await updateSettings.mutateAsync({
      seasonName: form.seasonName,
      leagueVenue: form.leagueVenue,
      matchDay: form.matchDay,
      defaultTime: form.defaultTime,
      pointsWin: parseInt(form.pointsWin, 10) || 3,
      pointsDraw: parseInt(form.pointsDraw, 10) || 1,
      pointsLoss: parseInt(form.pointsLoss, 10) || 0,
      yellowsPerBan: parseInt(form.yellowsPerBan, 10) || 3,
      inviteDeadline: settings?.inviteDeadline ?? new Date('2099-12-31').getTime(),
    });
    setSaving(false);
  };

  if (isLoading) return <LoadingView />;

  const settingsGroups = [
    {
      title: 'League Configuration',
      items: [
        { label: 'League Name', key: 'seasonName', type: 'text' },
        { label: 'Venue', key: 'leagueVenue', type: 'text' },
        { label: 'Match Day', key: 'matchDay', type: 'text' },
        { label: 'Default Time', key: 'defaultTime', type: 'text' },
      ],
    },
    {
      title: 'Scoring Rules',
      items: [
        { label: 'Points per Win', key: 'pointsWin', type: 'number' },
        { label: 'Points per Draw', key: 'pointsDraw', type: 'number' },
        { label: 'Points per Loss', key: 'pointsLoss', type: 'number' },
        { label: 'Yellows per Ban', key: 'yellowsPerBan', type: 'number' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>League Settings</Text>
        </View>

        {settingsGroups.map(group => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.settingsCard}>
              {group.items.map((item, idx) => (
                <View key={item.label} style={[styles.settingRow, idx < group.items.length - 1 && styles.settingRowBorder]}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <TextInput
                    value={form[item.key as keyof typeof form]}
                    onChangeText={v => update(item.key, v)}
                    style={styles.settingInput}
                    textAlign="right"
                    keyboardType={item.type === 'number' ? 'numeric' : 'default'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </Text>
          </TouchableOpacity>
        </View>
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
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, color: '#5A6880', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginBottom: 10 },
  settingsCard: { backgroundColor: '#131B2E', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingHorizontal: 16 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  settingLabel: { fontSize: 14, color: '#B8C4D8' },
  settingInput: { width: 120, height: 36, backgroundColor: '#1B2540', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, color: '#F0F4FF', textAlign: 'right', paddingRight: 12, fontSize: 14 },
  primaryButton: { width: '100%', height: 52, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#09101E', fontSize: 15, fontWeight: '700' },
});
