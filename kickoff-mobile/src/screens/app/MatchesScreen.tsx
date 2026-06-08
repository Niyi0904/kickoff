import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMatches, useTeams } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';
import type { AppStackParamList } from '../../navigation/types';

const MatchesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: teams } = useTeams();
  const [filter, setFilter] = useState<'upcoming' | 'played'>('upcoming');

  if (matchesLoading) return <LoadingView />;

  const getTeamName = (teamId: string) => {
    return teams?.find(t => t.id === teamId)?.name || 'Unknown';
  };

  const filteredMatches = matches?.filter(m => m.status === filter) || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'upcoming' && styles.filterBtnActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={styles.filterBtnText}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'played' && styles.filterBtnActive]}
          onPress={() => setFilter('played')}
        >
          <Text style={styles.filterBtnText}>Played</Text>
        </TouchableOpacity>
      </View>

      {filteredMatches.map((match) => (
        <TouchableOpacity
          key={match.id}
          style={styles.matchCard}
          onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
        >
          <View style={styles.matchDateContainer}>
            <Text style={styles.matchDay}>MD {match.matchDay}</Text>
            {match.scheduledDate && (
              <Text style={styles.matchDate}>
                {new Date(match.scheduledDate).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.matchContent}>
            <View style={styles.team}>
              <Text style={styles.teamName}>{getTeamName(match.homeTeamId)}</Text>
            </View>

            <View style={styles.score}>
              <Text style={styles.scoreText}>
                {match.homeScore} - {match.awayScore}
              </Text>
              <Text style={styles.status}>
                {match.status === 'played' ? 'Final' : 'vs'}
              </Text>
            </View>

            <View style={[styles.team, styles.awayTeam]}>
              <Text style={styles.teamName}>{getTeamName(match.awayTeamId)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterBtnActive: {
    backgroundColor: '#d30707',
    borderColor: '#d30707',
  },
  filterBtnText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#d30707',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchDateContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 12,
  },
  matchDay: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d30707',
  },
  matchDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  matchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  team: {
    flex: 1,
  },
  awayTeam: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  score: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d30707',
  },
  status: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default MatchesScreen;
