import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';

export default function LeagueSettingsScreen({ navigation }: any) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);
    setGenerated(true);
  };

  const settingsGroups = [
    {
      title: 'League Configuration',
      items: [
        { label: 'League Name', value: 'Lagos Premier League', type: 'text' },
        { label: 'Season', value: '2024/25', type: 'text' },
        { label: 'Total Gameweeks', value: '22', type: 'number' },
        { label: 'Teams', value: '8', type: 'number' },
      ],
    },
    {
      title: 'Scoring Rules',
      items: [
        { label: 'Points per Win', value: '3', type: 'number' },
        { label: 'Points per Draw', value: '1', type: 'number' },
        { label: 'Points per Loss', value: '0', type: 'number' },
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
                    defaultValue={item.value}
                    style={styles.settingInput}
                    textAlign="right"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Generate fixtures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate Fixtures</Text>
          <View style={styles.generateCard}>
            <Text style={styles.generateDesc}>Auto-generate fixture schedule for the season based on the number of teams and gameweeks.</Text>
            {generated && (
              <View style={styles.successRow}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>Fixtures generated successfully!</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, generating && styles.primaryButtonDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            <Text style={styles.primaryButtonText}>
              {generating ? 'Generating...' : '📅 Generate Fixture Schedule'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>💾 Save Settings</Text>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 10,
  },
  settingsCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingLabel: {
    fontSize: 14,
    color: '#B8C4D8',
  },
  settingInput: {
    width: 120,
    height: 36,
    backgroundColor: '#1B2540',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#F0F4FF',
    textAlign: 'right',
    paddingRight: 12,
    fontSize: 14,
  },
  generateCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  generateDesc: {
    fontSize: 14,
    color: '#B8C4D8',
    lineHeight: 20,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  successIcon: {
    fontSize: 14,
    color: '#00E676',
  },
  successText: {
    fontSize: 13,
    color: '#00E676',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: '#1B2540',
  },
  primaryButtonText: {
    color: '#09101E',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#4D7EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});