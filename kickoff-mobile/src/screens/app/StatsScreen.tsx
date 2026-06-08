import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { usePlayerStats } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

type StatType = 'goals' | 'assists' | 'yellowCards' | 'redCards';

const StatsScreen = () => {
  const { data: stats, isLoading } = usePlayerStats();
  const [sortBy, setSortBy] = useState<StatType>('goals');

  if (isLoading) return <LoadingView />;

  const sortedStats = [...(stats || [])].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, sortBy === 'goals' && styles.filterBtnActive]}
          onPress={() => setSortBy('goals')}
        >
          <Text style={styles.filterBtnText}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, sortBy === 'assists' && styles.filterBtnActive]}
          onPress={() => setSortBy('assists')}
        >
          <Text style={styles.filterBtnText}>Assists</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, sortBy === 'yellowCards' && styles.filterBtnActive]}
          onPress={() => setSortBy('yellowCards')}
        >
          <Text style={styles.filterBtnText}>Yellow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, sortBy === 'redCards' && styles.filterBtnActive]}
          onPress={() => setSortBy('redCards')}
        >
          <Text style={styles.filterBtnText}>Red</Text>
        </TouchableOpacity>
      </View>

      {sortedStats.map((player, index) => (
        <View key={player.playerId} style={styles.playerCard}>
          <View style={styles.playerInfo}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.playerDetails}>
              <Text style={styles.playerName}>{player.playerName}</Text>
              <Text style={styles.teamName}>{player.teamName}</Text>
            </View>
          </View>
          <Text style={styles.statValue}>{player[sortBy]}</Text>
        </View>
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
    paddingHorizontal: 12,
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
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d30707',
    width: 30,
  },
  playerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  teamName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d30707',
  },
});

export default StatsScreen;
