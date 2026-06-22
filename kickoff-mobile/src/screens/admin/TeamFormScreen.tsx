import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { getTeamById } from '../../lib/data';

export default function TeamFormScreen({ route, navigation }: any) {
  const { teamId } = route.params || {};
  const existing = teamId ? getTeamById(teamId) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    shortName: existing?.shortName || '',
    manager: existing?.manager || '',
    stadium: existing?.stadium || '',
    founded: existing?.founded || '',
    description: existing?.description || '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    // Placeholder save
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existing ? 'Edit Team' : 'Add Team'}</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Team Name', key: 'name', placeholder: 'Full name' },
            { label: 'Short Name', key: 'shortName', placeholder: 'e.g. LAG' },
            { label: 'Manager', key: 'manager', placeholder: 'Manager name' },
            { label: 'Stadium', key: 'stadium', placeholder: 'Stadium name' },
            { label: 'Founded', key: 'founded', placeholder: 'Year' },
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

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={v => update('description', v)}
              placeholder="Team description"
              placeholderTextColor="#5A6880"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09101E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#F0F4FF',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F4FF',
    textTransform: 'uppercase',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#7A8699',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#F0F4FF',
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
});