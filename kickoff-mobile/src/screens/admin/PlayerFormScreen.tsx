import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import type { PlayerFormScreenProps } from '../../navigation/types';
import { usePlayer, useTeams, useAddPlayer, useUpdatePlayer } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'FW'];

export default function PlayerFormScreen({ route, navigation }: PlayerFormScreenProps) {
  const { playerId } = route.params || {};
  const { data: existing } = playerId ? usePlayer(playerId) : { data: undefined };
  const { data: teams = [] } = useTeams();
  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();

  const [form, setForm] = useState({
    name: '',
    number: '',
    position: 'FW',
    teamId: '',
    isManager: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        number: existing.number?.toString() || '',
        position: existing.position || 'FW',
        teamId: existing.teamId || teams[0]?.id || '',
        isManager: existing.isManager || false,
      });
    }
  }, [existing, teams]);

  useEffect(() => {
    if (!form.teamId && teams.length > 0) {
      setForm(f => ({ ...f, teamId: teams[0].id }));
    }
  }, [teams, form.teamId]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.teamId) return;
    setSaving(true);
    const data = {
      name: form.name,
      number: parseInt(form.number, 10) || 0,
      position: form.position,
      teamId: form.teamId,
      isManager: form.isManager,
      createdAt: Date.now(),
    };
    if (playerId) {
      await updatePlayer.mutateAsync({ id: playerId, data });
    } else {
      await addPlayer.mutateAsync(data);
    }
    setSaving(false);
    navigation.goBack();
  };

  if (playerId && !existing) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{playerId ? 'Edit Player' : 'Add Player'}</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Full Name', key: 'name', placeholder: 'Player name' },
            { label: 'Squad Number', key: 'number', placeholder: 'e.g. 9' },
          ].map(field => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                value={form[field.key as keyof typeof form] as string}
                onChangeText={v => update(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor="#5A6880"
                style={styles.input}
                keyboardType={field.key === 'number' ? 'numeric' : 'default'}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.label}>Position</Text>
            <View style={styles.posRow}>
              {POSITIONS.map(pos => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.posChip, form.position === pos && styles.posChipActive]}
                  onPress={() => update('position', pos)}
                >
                  <Text style={[styles.posChipText, form.position === pos && styles.posChipTextActive]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Team</Text>
            <View style={styles.teamRow}>
              {teams.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teamChip, form.teamId === t.id && styles.teamChipActive, { borderColor: form.teamId === t.id ? `${t.primaryColor}60` : 'rgba(255,255,255,0.06)' }]}
                  onPress={() => update('teamId', t.id)}
                >
                  <Text style={[styles.teamChipText, form.teamId === t.id && { color: t.primaryColor }]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Player'}</Text>
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
  form: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, color: '#7A8699', fontWeight: '500' },
  input: { width: '100%', height: 52, backgroundColor: '#131B2E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, color: '#F0F4FF', paddingHorizontal: 16, fontSize: 15 },
  posRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  posChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  posChipActive: { backgroundColor: '#00E676', borderColor: '#00E676' },
  posChipText: { fontSize: 12, fontWeight: '600', color: '#7A8699' },
  posChipTextActive: { color: '#09101E' },
  teamRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  teamChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1 },
  teamChipText: { fontSize: 12, fontWeight: '600', color: '#7A8699' },
  teamChipActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  saveButton: { width: '100%', height: 54, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveButtonText: { color: '#09101E', fontSize: 16, fontWeight: '700' },
});
