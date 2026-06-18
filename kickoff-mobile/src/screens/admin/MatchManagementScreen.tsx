import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/types';
import { fetchMatches, deleteMatch, fetchTeams } from '../../firebase/firestore';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND } from '../../theme';
import type { Match, Team } from '../../lib/types';

type MatchManagementScreenNavigationProp = StackNavigationProp<AppStackParamList, 'MatchManagement'>;

const MatchManagementScreen: React.FC = () => {
  const navigation = useNavigation<MatchManagementScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [matchesData, teamsData] = await Promise.all([fetchMatches(), fetchTeams()]);
    setMatches(matchesData);
    setTeams(teamsData);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (matchId: string) => {
    Alert.alert('Confirm', 'Delete this match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteMatch(matchId);
          if (ok) {
            loadData();
          } else {
            Alert.alert('Error', 'Could not delete match');
          }
        },
      },
    ]);
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';

  const renderItem = ({ item }: { item: Match }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.title}>{getTeamName(item.homeTeamId)} vs {getTeamName(item.awayTeamId)}</Text>
        <Text style={styles.subtitle}>MD {item.matchDay} • {item.status === 'played' ? `${item.homeScore} - ${item.awayScore}` : 'Upcoming'}</Text>
      </View>
      <View style={styles.actions}>
        <IconButton icon="pencil" size={20} onPress={() => navigation.navigate('MatchForm', { matchId: item.id })} />
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
      <Button mode="contained" onPress={() => navigation.navigate('MatchForm')} style={styles.addBtn} buttonColor={PRIMARY_COLOR}>
        Add New Match
      </Button>
      <FlatList 
        data={matches} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: BACKGROUND_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn: { marginBottom: 12 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: '#eee',
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row' },
});

export default MatchManagementScreen;
