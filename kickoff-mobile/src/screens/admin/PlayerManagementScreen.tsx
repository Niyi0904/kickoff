import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/types';
import { fetchPlayers, deletePlayer } from '../../firebase/firestore';
import { PRIMARY_COLOR, BACKGROUND_COLOR, CARD_BACKGROUND } from '../../theme';
import type { Player } from '../../lib/types';

type PlayerManagementScreenNavigationProp = StackNavigationProp<AppStackParamList, 'PlayerManagement'>;

const PlayerManagementScreen: React.FC = () => {
  const navigation = useNavigation<PlayerManagementScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');

  const loadPlayers = async () => {
    setLoading(true);
    const data = await fetchPlayers();
    setPlayers(data);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPlayers);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (playerId: string) => {
    Alert.alert('Confirm', 'Delete this player?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await deletePlayer(playerId);
          if (ok) {
            loadPlayers();
          } else {
            Alert.alert('Error', 'Could not delete player');
          }
        },
      },
    ]);
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.position} • #{item.number}</Text>
      </View>
      <View style={styles.actions}>
        <IconButton icon="pencil" size={20} onPress={() => navigation.navigate('PlayerForm', { playerId: item.id })} />
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
      <Button mode="contained" onPress={() => navigation.navigate('PlayerForm')} style={styles.addBtn}>
        Add New Player
      </Button>
      <TextInput
        style={styles.search}
        placeholder="Search players..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList 
        data={filteredPlayers} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: BACKGROUND_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn: { marginBottom: 12, backgroundColor: PRIMARY_COLOR },
  search: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, color: '#666' },
  actions: { flexDirection: 'row' },
});

export default PlayerManagementScreen;
