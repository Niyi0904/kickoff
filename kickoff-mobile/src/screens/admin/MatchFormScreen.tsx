import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { getFixtureById, getTeamById, TEAMS } from '../../lib/data';

export default function MatchFormScreen({ route, navigation }: any) {
  const { matchId } = route.params || {};
  const existing = matchId ? getFixtureById(matchId) : null;

  const [form, setForm] = useState({
    homeTeamId: existing?.homeTeamId || TEAMS[0]?.id || '',
    awayTeamId: existing?.awayTeamId || TEAMS[1]?.id || '',
    date: existing?.date || '',
    time: existing?.time || '',
    venue: existing?.venue || '',
    gameweek: existing?.gameweek?.toString() || '1',
    homeScore: existing?.homeScore?.toString() || '',
    awayScore: existing?.awayScore?.toString() || '',
    status: existing?.status || 'upcoming',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existing ? 'Edit Match' : 'Add Match'}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Home Team</Text>
            <View style={styles.teamRow}>
              {TEAMS.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teamChip, form.homeTeamId === t.id && styles.teamChipActive]}
                  onPress={() => update('homeTeamId', t.id)}
                >
                  <Text style={styles.teamChipBadge}>{t.badge}</Text>
                  <Text style={[styles.teamChipText, form.homeTeamId === t.id && styles.teamChipTextActive]}>
                    {t.shortName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Away Team</Text>
            <View style={styles.teamRow}>
              {TEAMS.filter(t => t.id !== form.homeTeamId).map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teamChip, form.awayTeamId === t.id && styles.teamChipActive]}
                  onPress={() => update('awayTeamId', t.id)}
                >
                  <Text style={styles.teamChipBadge}>{t.badge}</Text>
                  <Text style={[styles.teamChipText, form.awayTeamId === t.id && styles.teamChipTextActive]}>
                    {t.shortName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                value={form.date}
                onChangeText={v => update('date', v)}
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
            <Text style={styles.label}>Venue</Text>
            <TextInput
              value={form.venue}
              onChangeText={v => update('venue', v)}
              placeholder="Stadium name"
              placeholderTextColor="#5A6880"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Gameweek</Text>
              <TextInput
                value={form.gameweek}
                onChangeText={v => update('gameweek', v)}
                placeholder="1"
                placeholderTextColor="#5A6880"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {['upcoming', 'live', 'completed'].map(s => (
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
          </View>

          {form.status === 'completed' && (
            <View style={styles.row}>
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Match</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  teamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  teamChipActive: {
    backgroundColor: 'rgba(0,230,118,0.15)',
    borderColor: 'rgba(0,230,118,0.3)',
  },
  teamChipBadge: {
    fontSize: 14,
  },
  teamChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A8699',
  },
  teamChipTextActive: {
    color: '#00E676',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  statusChipActive: {
    backgroundColor: '#00E676',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A8699',
    textTransform: 'capitalize',
  },
  statusChipTextActive: {
    color: '#09101E',
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