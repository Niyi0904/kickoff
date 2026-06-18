import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Text, Switch } from 'react-native';
import { Button, Card, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../navigation/types';
import { addMatch, updateMatch, fetchMatchById } from '../../firebase/firestore';
import { EditableField } from '../../components/EditableField';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND, TEXT_COLOR } from '../../theme';

type MatchFormScreenNavigationProp = StackNavigationProp<AppStackParamList, 'MatchForm'>;
type MatchFormScreenRouteProp = RouteProp<AppStackParamList, 'MatchForm'>;

const MatchFormScreen: React.FC = () => {
  const navigation = useNavigation<MatchFormScreenNavigationProp>();
  const route = useRoute<MatchFormScreenRouteProp>();
  const { matchId } = route.params || {};
  const isEdit = Boolean(matchId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    homeTeamId: '',
    awayTeamId: '',
    matchDay: '',
    scheduledDate: '',
    time: '',
    status: 'upcoming',
    homeScore: '',
    awayScore: '',
    homePoints: '',
    awayPoints: '',
    report: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    if (isEdit) {
      const loadMatch = async () => {
        setLoading(true);
        const match = await fetchMatchById(matchId!);
        if (match) {
          setForm({
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            matchDay: String(match.matchDay),
            scheduledDate: match.scheduledDate ?? '',
            time: match.time ?? '',
            status: match.status,
            homeScore: String(match.homeScore ?? 0),
            awayScore: String(match.awayScore ?? 0),
            homePoints: String(match.homePoints ?? 0),
            awayPoints: String(match.awayPoints ?? 0),
            report: match.report ?? '',
          });
        }
        setLoading(false);
      };
      loadMatch();
    }
  }, [matchId, isEdit]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.homeTeamId.trim()) newErrors.homeTeamId = 'Home Team ID is required';
    if (!form.awayTeamId.trim()) newErrors.awayTeamId = 'Away Team ID is required';
    if (!form.matchDay.trim() || isNaN(Number(form.matchDay))) newErrors.matchDay = 'Valid Match Day is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    
    const matchData = {
      homeTeamId: form.homeTeamId,
      awayTeamId: form.awayTeamId,
      matchDay: Number(form.matchDay),
      scheduledDate: form.scheduledDate,
      time: form.time,
      status: form.status as 'upcoming' | 'played',
      homeScore: Number(form.homeScore) || 0,
      awayScore: Number(form.awayScore) || 0,
      homePoints: Number(form.homePoints) || 0,
      awayPoints: Number(form.awayPoints) || 0,
      report: form.report,
    };

    const success = isEdit
      ? await updateMatch(matchId!, matchData)
      : await addMatch(matchData);
      
    setSaving(false);
    if (success) {
      setSnackbar({ visible: true, message: `Match ${isEdit ? 'updated' : 'created'} successfully` });
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      setSnackbar({ visible: true, message: `Failed to ${isEdit ? 'update' : 'create'} match` });
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
          <EditableField label="Home Team ID" value={form.homeTeamId} onChange={v => setForm({ ...form, homeTeamId: v })} error={errors.homeTeamId} />
          <EditableField label="Away Team ID" value={form.awayTeamId} onChange={v => setForm({ ...form, awayTeamId: v })} error={errors.awayTeamId} />
          <EditableField label="Match Day" value={form.matchDay} onChange={v => setForm({ ...form, matchDay: v })} error={errors.matchDay} keyboardType="numeric" />
          <EditableField label="Scheduled Date (YYYY-MM-DD)" value={form.scheduledDate} onChange={v => setForm({ ...form, scheduledDate: v })} />
          <EditableField label="Time (HH:MM)" value={form.time} onChange={v => setForm({ ...form, time: v })} />
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Status: {form.status.toUpperCase()}</Text>
            <Switch
              value={form.status === 'played'}
              onValueChange={v => setForm({ ...form, status: v ? 'played' : 'upcoming' })}
              trackColor={{ false: '#767577', true: PRIMARY_COLOR }}
            />
          </View>

          {form.status === 'played' && (
            <>
              <EditableField label="Home Score" value={form.homeScore} onChange={v => setForm({ ...form, homeScore: v })} keyboardType="numeric" />
              <EditableField label="Away Score" value={form.awayScore} onChange={v => setForm({ ...form, awayScore: v })} keyboardType="numeric" />
              <EditableField label="Home Points" value={form.homePoints} onChange={v => setForm({ ...form, homePoints: v })} keyboardType="numeric" />
              <EditableField label="Away Points" value={form.awayPoints} onChange={v => setForm({ ...form, awayPoints: v })} keyboardType="numeric" />
              <EditableField label="Match Report" value={form.report} onChange={v => setForm({ ...form, report: v })} />
            </>
          )}

          <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn} disabled={saving} buttonColor={PRIMARY_COLOR}>
            {isEdit ? 'Update Match' : 'Create Match'}
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

export default MatchFormScreen;
