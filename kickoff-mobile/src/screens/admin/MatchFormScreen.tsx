import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import type { MatchFormScreenProps } from '../../navigation/types';
import { useMatch, useTeams, useAddMatch, useUpdateMatch } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function MatchFormScreen({ route, navigation }: MatchFormScreenProps) {
  const { matchId } = route.params || {};
  const { data: existing } = matchId ? useMatch(matchId) : { data: undefined };
  const { data: teams = [] } = useTeams();
  const addMatch = useAddMatch();
  const updateMatch = useUpdateMatch();

  const [form, setForm] = useState({
    homeTeamId: '',
    awayTeamId: '',
    scheduledDate: '',
    time: '',
    matchDay: '1',
    homeScore: '',
    awayScore: '',
    homePoints: '',
    awayPoints: '',
    status: 'upcoming' as 'upcoming' | 'played' | 'cancelled',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        homeTeamId: existing.homeTeamId || teams[0]?.id || '',
        awayTeamId: existing.awayTeamId || teams[1]?.id || '',
        scheduledDate: existing.scheduledDate || '',
        time: existing.time || '',
        matchDay: existing.matchDay?.toString() || '1',
        homeScore: existing.homeScore?.toString() || '',
        awayScore: existing.awayScore?.toString() || '',
        homePoints: existing.homePoints?.toString() || '',
        awayPoints: existing.awayPoints?.toString() || '',
        status: existing.status || 'upcoming',
      });
    }
  }, [existing, teams]);

  useEffect(() => {
    if (!form.homeTeamId && teams.length > 0) {
      setForm(f => ({ ...f, homeTeamId: teams[0].id }));
    }
  }, [teams, form.homeTeamId]);

  useEffect(() => {
    if (form.homeTeamId && !form.awayTeamId && teams.length > 1) {
      const other = teams.find(t => t.id !== form.homeTeamId);
      if (other) setForm(f => ({ ...f, awayTeamId: other.id }));
    }
  }, [form.homeTeamId, teams, form.awayTeamId]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.homeTeamId || !form.awayTeamId) return;
    setSaving(true);
    const data = {
      homeTeamId: form.homeTeamId,
      awayTeamId: form.awayTeamId,
      scheduledDate: form.scheduledDate || undefined,
      time: form.time || undefined,
      matchDay: parseInt(form.matchDay, 10) || 1,
      homeScore: form.status === 'played' ? (parseInt(form.homeScore, 10) || 0) : 0,
      awayScore: form.status === 'played' ? (parseInt(form.awayScore, 10) || 0) : 0,
      homePoints: form.status === 'played' ? (parseInt(form.homePoints, 10) || computePoints(parseInt(form.homeScore, 10) || 0, parseInt(form.awayScore, 10) || 0)) : 0,
      awayPoints: form.status === 'played' ? (parseInt(form.awayPoints, 10) || computePoints(parseInt(form.awayScore, 10) || 0, parseInt(form.homeScore, 10) || 0)) : 0,
      status: form.status,
      homeYellows: 0,
      awayYellows: 0,
      homeReds: 0,
      awayReds: 0,
      minutesPlayed: 90,
      league: '',
      createdAt: Date.now(),
    };
    if (matchId) {
      await updateMatch.mutateAsync({ id: matchId, data });
    } else {
      await addMatch.mutateAsync(data);
    }
    setSaving(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{matchId ? 'Edit Match' : 'Add Match'}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Home Team</Text>
            <View style={styles.teamRow}>
              {teams.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teamChip, form.homeTeamId === t.id && styles.teamChipActive]}
                  onPress={() => update('homeTeamId', t.id)}
                >
                  <Text style={[styles.teamChipText, form.homeTeamId === t.id && styles.teamChipTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Away Team</Text>
            <View style={styles.teamRow}>
              {teams.filter(t => t.id !== form.homeTeamId).map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teamChip, form.awayTeamId === t.id && styles.teamChipActive]}
                  onPress={() => update('awayTeamId', t.id)}
                >
                  <Text style={[styles.teamChipText, form.awayTeamId === t.id && styles.teamChipTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                value={form.scheduledDate}
                onChangeText={v => update('scheduledDate', v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#5A6880"
                style={styles.input}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                value={form.time}
                onChangeText={v => update('time', v)}
                placeholder="HH:MM"
                placeholderTextColor="#5A6880"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gameweek</Text>
            <TextInput
              value={form.matchDay}
              onChangeText={v => update('matchDay', v)}
              placeholder="1"
              placeholderTextColor="#5A6880"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {(['upcoming', 'played', 'cancelled'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusChip, form.status === s && styles.statusChipActive]}
                  onPress={() => update('status', s)}
                >
                  <Text style={[styles.statusChipText, form.status === s && styles.statusChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {form.status === 'played' && (
            <View style={styles.row2}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Home Score</Text>
                <TextInput
                  value={form.homeScore}
                  onChangeText={v => update('homeScore', v)}
                  placeholder="0"
                  placeholderTextColor="#5A6880"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Away Score</Text>
                <TextInput
                  value={form.awayScore}
                  onChangeText={v => update('awayScore', v)}
                  placeholder="0"
                  placeholderTextColor="#5A6880"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Match'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function computePoints(goalsFor: number, goalsAgainst: number): number {
  if (goalsFor > goalsAgainst) return 3;
  if (goalsFor === goalsAgainst) return 1;
  return 0;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09101E' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8, gap: 12 },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#F0F4FF', fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F0F4FF', textTransform: 'uppercase' },
  form: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, color: '#7A8699', fontWeight: '500' },
  input: { width: '100%', height: 52, backgroundColor: '#131B2E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, color: '#F0F4FF', paddingHorizontal: 16, fontSize: 15 },
  row2: { flexDirection: 'row', gap: 12 },
  teamRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  teamChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  teamChipActive: { backgroundColor: 'rgba(0,230,118,0.15)', borderColor: 'rgba(0,230,118,0.3)' },
  teamChipText: { fontSize: 12, fontWeight: '600', color: '#7A8699' },
  teamChipTextActive: { color: '#00E676' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  statusChipActive: { backgroundColor: '#00E676' },
  statusChipText: { fontSize: 12, fontWeight: '600', color: '#7A8699', textTransform: 'capitalize' },
  statusChipTextActive: { color: '#09101E' },
  saveButton: { width: '100%', height: 54, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#09101E', fontSize: 16, fontWeight: '700' },
});
