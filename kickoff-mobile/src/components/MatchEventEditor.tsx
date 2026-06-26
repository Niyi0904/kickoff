import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput,
} from 'react-native';
import { usePlayers } from '../hooks/useAppData';
import type { PlayerEvent } from '../lib/firestoreMappers';

type EventCollection = 'goals' | 'assists' | 'yellow_cards' | 'red_cards';

interface MatchEventEditorProps {
  matchId: string;
  matchDay: number;
  homeTeamId: string;
  awayTeamId: string;
  events: {
    goals: PlayerEvent[];
    assists: PlayerEvent[];
    yellows: PlayerEvent[];
    reds: PlayerEvent[];
  };
  onAddEvent: (collection: EventCollection, playerId: string, teamId: string, minute?: number) => void;
  onDeleteEvent: (collection: EventCollection, eventId: string) => void;
}

const EVENT_TABS: { key: EventCollection; label: string; color: string }[] = [
  { key: 'goals', label: 'Goals', color: '#00E676' },
  { key: 'assists', label: 'Assists', color: '#4D7EFF' },
  { key: 'yellow_cards', label: 'Yellows', color: '#FFB800' },
  { key: 'red_cards', label: 'Reds', color: '#FF3D5A' },
];

export const MatchEventEditor: React.FC<MatchEventEditorProps> = ({
  matchId,
  matchDay,
  homeTeamId,
  awayTeamId,
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [activeTab, setActiveTab] = useState<EventCollection>('goals');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTeamId, setPickerTeamId] = useState(homeTeamId);
  const [minuteInput, setMinuteInput] = useState('');

  const { data: homePlayers = [] } = usePlayers(homeTeamId);
  const { data: awayPlayers = [] } = usePlayers(awayTeamId);

  const currentEvents = events[activeTab === 'yellow_cards' ? 'yellows' : activeTab === 'red_cards' ? 'reds' : activeTab];

  const handleAddEvent = (playerId: string, teamId: string) => {
    onAddEvent(
      activeTab,
      playerId,
      teamId,
      activeTab !== 'assists' ? (parseInt(minuteInput, 10) || 0) : undefined,
    );
    setShowPicker(false);
    setMinuteInput('');
  };

  const eventLabel = (e: PlayerEvent) => {
    if ('minute' in e && typeof (e as any).minute === 'number') {
      return `#${(e as any).minute}'`;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Match Events</Text>

      {/* Event type tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
        {EVENT_TABS.map(tab => {
          const count = currentEvents.length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && { borderBottomColor: tab.color, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && { color: tab.color }]}>{tab.label}</Text>
              <Text style={[styles.tabCount, { color: tab.color }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Events list */}
      <View style={styles.eventsContainer}>
        <View style={styles.teamEvents}>
          <Text style={styles.teamLabel}>Home</Text>
          {currentEvents.filter(e => e.teamId === homeTeamId).map(e => (
            <View key={e.id} style={styles.eventRow}>
              <Text style={styles.eventText}>Player: {e.playerId}</Text>
              <Text style={styles.eventMinute}>{eventLabel(e)}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDeleteEvent(activeTab, e.id)}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.divider} />
        <View style={styles.teamEvents}>
          <Text style={styles.teamLabel}>Away</Text>
          {currentEvents.filter(e => e.teamId === awayTeamId).map(e => (
            <View key={e.id} style={styles.eventRow}>
              <Text style={styles.eventText}>Player: {e.playerId}</Text>
              <Text style={styles.eventMinute}>{eventLabel(e)}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDeleteEvent(activeTab, e.id)}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Add event button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.addButtonText}>+ Add {activeTab === 'yellow_cards' ? 'Yellow Card' : activeTab === 'red_cards' ? 'Red Card' : activeTab === 'goals' ? 'Goal' : 'Assist'}</Text>
      </TouchableOpacity>

      {/* Player picker modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Player</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Team toggle */}
            <View style={styles.teamToggle}>
              <TouchableOpacity
                style={[styles.teamToggleBtn, pickerTeamId === homeTeamId && styles.teamToggleActive]}
                onPress={() => setPickerTeamId(homeTeamId)}
              >
                <Text style={[styles.teamToggleText, pickerTeamId === homeTeamId && styles.teamToggleTextActive]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.teamToggleBtn, pickerTeamId === awayTeamId && styles.teamToggleActive]}
                onPress={() => setPickerTeamId(awayTeamId)}
              >
                <Text style={[styles.teamToggleText, pickerTeamId === awayTeamId && styles.teamToggleTextActive]}>Away</Text>
              </TouchableOpacity>
            </View>

            {/* Minute input for non-assist events */}
            {activeTab !== 'assists' && (
              <View style={styles.minuteRow}>
                <Text style={styles.minuteLabel}>Minute:</Text>
                <View style={styles.minuteInput}>
                  <TextInput
                    value={minuteInput}
                    onChangeText={setMinuteInput}
                    placeholder="e.g. 45"
                    placeholderTextColor="#5A6880"
                    style={styles.minuteField}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {/* Player list */}
            <ScrollView style={styles.playerList}>
              {(pickerTeamId === homeTeamId ? homePlayers : awayPlayers).map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerRow}
                  onPress={() => handleAddEvent(player.id, pickerTeamId)}
                >
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerPos}>#{player.number} · {player.position}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#5A6880',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 12,
  },
  tabRow: { marginBottom: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#7A8699' },
  tabCount: { fontSize: 12, fontWeight: '700' },
  eventsContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  teamEvents: { flex: 1, gap: 6 },
  teamLabel: { fontSize: 11, color: '#5A6880', fontWeight: '600', marginBottom: 4 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  eventText: { flex: 1, fontSize: 12, color: '#F0F4FF' },
  eventMinute: { fontSize: 11, color: '#5A6880', fontFamily: 'monospace' },
  deleteBtn: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255,61,90,0.2)', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 10, color: '#FF3D5A', fontWeight: '700' },
  addButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { fontSize: 13, color: '#00E676', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#131B2E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F0F4FF' },
  modalClose: { fontSize: 20, color: '#5A6880' },
  teamToggle: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  teamToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  teamToggleActive: { backgroundColor: 'rgba(0,230,118,0.15)' },
  teamToggleText: { fontSize: 13, fontWeight: '600', color: '#7A8699' },
  teamToggleTextActive: { color: '#00E676' },
  minuteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  minuteLabel: { fontSize: 13, color: '#7A8699' },
  minuteInput: { flex: 1 },
  minuteField: { width: '100%', height: 40, backgroundColor: '#1B2540', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, color: '#F0F4FF', paddingHorizontal: 12, fontSize: 14 },
  playerList: { maxHeight: 300 },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 12 },
  playerName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#F0F4FF' },
  playerPos: { fontSize: 12, color: '#5A6880' },
});
