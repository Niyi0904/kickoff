import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import type { TeamFormScreenProps } from '../../navigation/types';
import { useTeam, useAddTeam, useUpdateTeam } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

export default function TeamFormScreen({ route, navigation }: TeamFormScreenProps) {
  const { teamId } = route.params || {};
  const { data: existing } = teamId ? useTeam(teamId) : { data: undefined };
  const addTeam = useAddTeam();
  const updateTeam = useUpdateTeam();

  const [form, setForm] = useState({
    name: '',
    stadium: '',
    founded: '',
    primaryColor: '#3b82f6',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        stadium: existing.stadium || '',
        founded: existing.founded || '',
        primaryColor: existing.primaryColor || '#3b82f6',
      });
    }
  }, [existing]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (teamId) {
      await updateTeam.mutateAsync({ id: teamId, data: { name: form.name, stadium: form.stadium, founded: form.founded, primaryColor: form.primaryColor } });
    } else {
      await addTeam.mutateAsync({ name: form.name, stadium: form.stadium, founded: form.founded, primaryColor: form.primaryColor });
    }
    setSaving(false);
    navigation.goBack();
  };

  if (teamId && !existing) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{teamId ? 'Edit Team' : 'Add Team'}</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Team Name', key: 'name', placeholder: 'Full name' },
            { label: 'Stadium', key: 'stadium', placeholder: 'Stadium name' },
            { label: 'Founded', key: 'founded', placeholder: 'Year' },
            { label: 'Primary Color', key: 'primaryColor', placeholder: 'e.g. #3b82f6' },
          ].map(field => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                value={form[field.key as keyof typeof form]}
                onChangeText={v => update(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor="#5A6880"
                style={styles.input}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Team'}</Text>
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
  saveButton: { width: '100%', height: 54, borderRadius: 14, backgroundColor: '#00E676', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#09101E', fontSize: 16, fontWeight: '700' },
});
