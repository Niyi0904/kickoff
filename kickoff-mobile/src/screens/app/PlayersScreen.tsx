import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayers, useTeams } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import type { AppStackParamList } from '../../navigation/types';

const PlayersScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data: players, isLoading } = usePlayers();
  const { data: teams } = useTeams();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let list = players ?? [];
    if (teamFilter !== 'all') {
      list = list.filter((p) => p.teamId === teamFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [players, teamFilter, search]);

  if (isLoading) return <LoadingView />;

  const getTeamName = (teamId: string) => teams?.find((t) => t.id === teamId)?.name ?? '—';

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search players..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <TouchableOpacity
          style={[styles.chip, teamFilter === 'all' && styles.chipActive]}
          onPress={() => setTeamFilter('all')}
        >
          <Text style={styles.chipText}>All teams</Text>
        </TouchableOpacity>
        {teams?.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.chip, teamFilter === t.id && styles.chipActive]}
            onPress={() => setTeamFilter(t.id)}
          >
            <Text style={styles.chipText}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState message="No players found." />
      ) : (
        filtered.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={styles.card}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{player.number}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{player.name}</Text>
              <Text style={styles.meta}>
                {player.position} • {getTeamName(player.teamId)}
                {player.isManager ? ' • Manager' : ''}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filters: { marginBottom: 12, maxHeight: 40 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: { backgroundColor: '#d30707', borderColor: '#d30707' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#d30707',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: { color: '#fff', fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, color: '#888', marginTop: 2 },
  chevron: { fontSize: 22, color: '#ccc' },
});

export default PlayersScreen;
