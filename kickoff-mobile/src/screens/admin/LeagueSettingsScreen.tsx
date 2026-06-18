import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/types';
import { fetchLeagueSettings, updateLeagueSettings } from '../../firebase/firestore';
import { EditableField } from '../../components/EditableField';
import { PRIMARY_COLOR, BACKGROUND_COLOR } from '../../theme';

type LeagueSettingsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'LeagueSettings'>;

type FormState = {
  seasonName: string;
  inviteDeadline: string; // ISO string for input
  leagueVenue: string;
  matchDay: string;
  defaultTime: string;
  pointsWin: string;
  pointsDraw: string;
  pointsLoss: string;
  yellowsPerBan: string;
};

const LeagueSettingsScreen: React.FC = () => {
  const navigation = useNavigation<LeagueSettingsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    seasonName: '',
    inviteDeadline: '',
    leagueVenue: '',
    matchDay: '',
    defaultTime: '',
    pointsWin: '',
    pointsDraw: '',
    pointsLoss: '',
    yellowsPerBan: '',
  });

  useEffect(() => {
    const load = async () => {
      const settings = await fetchLeagueSettings();
      if (settings) {
        setForm({
          seasonName: settings.seasonName ?? '',
          inviteDeadline: new Date(settings.inviteDeadline).toISOString().slice(0, 16),
          leagueVenue: settings.leagueVenue ?? '',
          matchDay: settings.matchDay ?? '',
          defaultTime: settings.defaultTime ?? '',
          pointsWin: String(settings.pointsWin ?? 3),
          pointsDraw: String(settings.pointsDraw ?? 1),
          pointsLoss: String(settings.pointsLoss ?? 0),
          yellowsPerBan: String(settings.yellowsPerBan ?? 3),
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateLeagueSettings({
      seasonName: form.seasonName,
      inviteDeadline: new Date(form.inviteDeadline).getTime(),
      leagueVenue: form.leagueVenue,
      matchDay: form.matchDay,
      defaultTime: form.defaultTime,
      pointsWin: Number(form.pointsWin),
      pointsDraw: Number(form.pointsDraw),
      pointsLoss: Number(form.pointsLoss),
      yellowsPerBan: Number(form.yellowsPerBan),
    });
    setSaving(false);
    if (success) {
      Alert.alert('Success', 'League settings saved');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <EditableField label="Season Name" value={form.seasonName} onChange={v => setForm({ ...form, seasonName: v })} />
      <EditableField label="Invite Deadline" value={form.inviteDeadline} onChange={v => setForm({ ...form, inviteDeadline: v })} placeholder="YYYY-MM-DDTHH:MM" />
      <EditableField label="League Venue" value={form.leagueVenue} onChange={v => setForm({ ...form, leagueVenue: v })} />
      <EditableField label="Match Day" value={form.matchDay} onChange={v => setForm({ ...form, matchDay: v })} />
      <EditableField label="Default Time" value={form.defaultTime} onChange={v => setForm({ ...form, defaultTime: v })} />
      <EditableField label="Points – Win" value={form.pointsWin} onChange={v => setForm({ ...form, pointsWin: v })} keyboardType="numeric" />
      <EditableField label="Points – Draw" value={form.pointsDraw} onChange={v => setForm({ ...form, pointsDraw: v })} keyboardType="numeric" />
      <EditableField label="Points – Loss" value={form.pointsLoss} onChange={v => setForm({ ...form, pointsLoss: v })} keyboardType="numeric" />
      <EditableField label="Yellows per Ban" value={form.yellowsPerBan} onChange={v => setForm({ ...form, yellowsPerBan: v })} keyboardType="numeric" />
      <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn}>
        Save Settings
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 20,
  },
});

export default LeagueSettingsScreen;
