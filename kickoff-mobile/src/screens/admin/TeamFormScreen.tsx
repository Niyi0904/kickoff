import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Button, Card, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../navigation/types';
import { addTeam, updateTeam, fetchTeamById } from '../../firebase/firestore';
import { EditableField } from '../../components/EditableField';
import { PRIMARY_COLOR, BACKGROUND_COLOR } from '../../theme';

type TeamFormScreenNavigationProp = StackNavigationProp<AppStackParamList, 'TeamForm'>;
type TeamFormScreenRouteProp = RouteProp<AppStackParamList, 'TeamForm'>;

const TeamFormScreen: React.FC = () => {
  const navigation = useNavigation<TeamFormScreenNavigationProp>();
  const route = useRoute<TeamFormScreenRouteProp>();
  const { teamId } = route.params || {};
  const isEdit = Boolean(teamId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logo: '',
    primaryColor: '#000000',
    founded: '',
    stadium: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    if (isEdit) {
      const loadTeam = async () => {
        setLoading(true);
        const team = await fetchTeamById(teamId!);
        if (team) {
          setForm({
            name: team.name,
            logo: team.logo ?? '',
            primaryColor: team.primaryColor,
            founded: team.founded,
            stadium: team.stadium,
          });
        }
        setLoading(false);
      };
      loadTeam();
    }
  }, [teamId, isEdit]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Team name is required';
    if (!form.primaryColor.match(/^#[0-9A-Fa-f]{6}$/))
      newErrors.primaryColor = 'Enter a valid hex color (e.g., #ff7700)';
    if (form.founded && isNaN(Number(form.founded)))
      newErrors.founded = 'Founded year must be a number';
    if (!form.stadium.trim()) newErrors.stadium = 'Stadium is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const success = isEdit
      ? await updateTeam(teamId!, {
          name: form.name,
          logo: form.logo,
          primaryColor: form.primaryColor,
          founded: form.founded,
          stadium: form.stadium,
        })
      : await addTeam({
          name: form.name,
          logo: form.logo,
          primaryColor: form.primaryColor,
          founded: form.founded,
          stadium: form.stadium,
        });
    setSaving(false);
    if (success) {
      setSnackbar({ visible: true, message: `Team ${isEdit ? 'updated' : 'created'} successfully` });
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      setSnackbar({ visible: true, message: `Failed to ${isEdit ? 'update' : 'create'} team` });
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
          <EditableField label="Team Name" value={form.name} onChange={v => setForm({ ...form, name: v })} error={errors.name} />
          <EditableField label="Logo URL" value={form.logo} onChange={v => setForm({ ...form, logo: v })} error={errors.logo} />
          <EditableField label="Primary Color" value={form.primaryColor} onChange={v => setForm({ ...form, primaryColor: v })} error={errors.primaryColor} />
          <EditableField label="Founded" value={form.founded} onChange={v => setForm({ ...form, founded: v })} error={errors.founded} />
          <EditableField label="Stadium" value={form.stadium} onChange={v => setForm({ ...form, stadium: v })} error={errors.stadium} />
          <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn} disabled={saving}>
            {isEdit ? 'Update Team' : 'Create Team'}
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
  card: { marginBottom: 20 },
  saveBtn: { marginTop: 20 },
});

export default TeamFormScreen;
