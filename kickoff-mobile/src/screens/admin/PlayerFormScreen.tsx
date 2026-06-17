import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Text, Switch } from 'react-native';
import { Button, Card, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../navigation/types';
import { addPlayer, updatePlayer, fetchPlayerById } from '../../firebase/firestore';
import { EditableField } from '../../components/EditableField';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND, TEXT_COLOR } from '../../theme';

type PlayerFormScreenNavigationProp = StackNavigationProp<AppStackParamList, 'PlayerForm'>;
type PlayerFormScreenRouteProp = RouteProp<AppStackParamList, 'PlayerForm'>;

const PlayerFormScreen: React.FC = () => {
  const navigation = useNavigation<PlayerFormScreenNavigationProp>();
  const route = useRoute<PlayerFormScreenRouteProp>();
  const { playerId } = route.params || {};
  const isEdit = Boolean(playerId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    number: '',
    position: '',
    teamId: '',
    isManager: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    if (isEdit) {
      const loadPlayer = async () => {
        setLoading(true);
        const player = await fetchPlayerById(playerId!);
        if (player) {
          setForm({
            name: player.name,
            number: String(player.number),
            position: player.position,
            teamId: player.teamId,
            isManager: player.isManager ?? false,
          });
        }
        setLoading(false);
      };
      loadPlayer();
    }
  }, [playerId, isEdit]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Player name is required';
    if (!form.number.trim() || isNaN(Number(form.number))) newErrors.number = 'Valid number is required';
    if (!form.position.trim()) newErrors.position = 'Position is required';
    if (!form.teamId.trim()) newErrors.teamId = 'Team ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const success = isEdit
      ? await updatePlayer(playerId!, {
          name: form.name,
          number: Number(form.number),
          position: form.position,
          teamId: form.teamId,
          isManager: form.isManager,
        })
      : await addPlayer({
          name: form.name,
          number: Number(form.number),
          position: form.position,
          teamId: form.teamId,
          isManager: form.isManager,
        });
    setSaving(false);
    if (success) {
      setSnackbar({ visible: true, message: `Player ${isEdit ? 'updated' : 'created'} successfully` });
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      setSnackbar({ visible: true, message: `Failed to ${isEdit ? 'update' : 'create'} player` });
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
      <Card style={styles.card}>
        <Card.Content>
          <EditableField label="Player Name" value={form.name} onChange={v => setForm({ ...form, name: v })} error={errors.name} />
          <EditableField label="Number" value={form.number} onChange={v => setForm({ ...form, number: v })} error={errors.number} keyboardType="numeric" />
          <EditableField label="Position" value={form.position} onChange={v => setForm({ ...form, position: v })} error={errors.position} />
          <EditableField label="Team ID" value={form.teamId} onChange={v => setForm({ ...form, teamId: v })} error={errors.teamId} />
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Is Manager?</Text>
            <Switch
              value={form.isManager}
              onValueChange={v => setForm({ ...form, isManager: v })}
              trackColor={{ false: '#767577', true: PRIMARY_COLOR }}
            />
          </View>

          <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn} disabled={saving} buttonColor={PRIMARY_COLOR}>
            {isEdit ? 'Update Player' : 'Create Player'}
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: BACKGROUND_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 20, backgroundColor: CARD_BACKGROUND },
  saveBtn: { marginTop: 20 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
});

export default PlayerFormScreen;
