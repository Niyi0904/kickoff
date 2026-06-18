import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/types';
import { fetchTeams, deleteTeam } from '../../firebase/firestore';
import { PRIMARY_COLOR, BACKGROUND_COLOR } from '../../theme';

type TeamManagementScreenNavigationProp = StackNavigationProp<AppStackParamList, 'TeamManagement'>;

export const TeamManagementScreen: React.FC = () => {
  const navigation = useNavigation<TeamManagementScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Array<any>>([]);

  const loadTeams = async () => {
    setLoading(true);
    const data = await fetchTeams();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTeams);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (teamId: string) => {
    Alert.alert('Confirm', 'Delete this team?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteTeam(teamId);
          if (ok) {
            loadTeams();
          } else {
            Alert.alert('Error', 'Could not delete team');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.actions}>
        <IconButton icon="pencil" size={20} onPress={() => navigation.navigate('TeamForm', { teamId: item.id })} />
        <IconButton icon="delete" size={20} onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => navigation.navigate('TeamForm')} style={styles.addBtn}>
        Add New Team
      </Button>
      <FlatList data={teams} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: BACKGROUND_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16 },
  actions: { flexDirection: 'row' },
});
