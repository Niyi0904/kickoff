import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMatches } from '../hooks/useAppData';
import { LoadingView } from './LoadingView';

export const MatchesCard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data: matches, isLoading } = useMatches();

  if (isLoading) return <LoadingView />;

  if (!matches?.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Upcoming Matches</Text>
        <Text style={styles.empty}>No scheduled matches.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Upcoming Matches</Text>
      {matches.slice(0, 3).map((match) => (
        <TouchableOpacity key={match.id} style={styles.row} onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}>
          <Text style={styles.team}>{match.homeTeamName} vs {match.awayTeamName}</Text>
          <Text style={styles.date}>{new Date(match.date).toLocaleDateString()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  team: {
    color: '#fff',
    flex: 1,
  },
  date: {
    color: '#bbb',
  },
  empty: {
    color: '#bbb',
    fontStyle: 'italic',
  },
});
