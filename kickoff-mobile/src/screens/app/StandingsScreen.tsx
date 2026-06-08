import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLeagueStandings } from '../../hooks/useAppData';
import { LoadingView } from '../../components/LoadingView';

const StandingsScreen = () => {
  const { data: standings, isLoading } = useLeagueStandings();

  if (isLoading) return <LoadingView />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.positionCol]}>Pos</Text>
          <Text style={[styles.cell, styles.teamCol]}>Team</Text>
          <Text style={[styles.cell, styles.numCol]}>P</Text>
          <Text style={[styles.cell, styles.numCol]}>W</Text>
          <Text style={[styles.cell, styles.numCol]}>D</Text>
          <Text style={[styles.cell, styles.numCol]}>L</Text>
          <Text style={[styles.cell, styles.numCol]}>GD</Text>
          <Text style={[styles.cell, styles.numCol]}>Pts</Text>
        </View>

        {standings?.map((team) => (
          <View key={team.teamId} style={styles.row}>
            <Text style={[styles.cell, styles.positionCol]}>{team.position}</Text>
            <Text style={[styles.cell, styles.teamCol]}>{team.teamName}</Text>
            <Text style={[styles.cell, styles.numCol]}>{team.played}</Text>
            <Text style={[styles.cell, styles.numCol]}>{team.wins}</Text>
            <Text style={[styles.cell, styles.numCol]}>{team.draws}</Text>
            <Text style={[styles.cell, styles.numCol]}>{team.losses}</Text>
            <Text style={[styles.cell, styles.numCol]}>{team.goalDifference}</Text>
            <Text style={[styles.cell, styles.numCol, styles.pointsCell]}>{team.points}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#d30707',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
  },
  positionCol: {
    width: 30,
  },
  teamCol: {
    flex: 1,
    textAlign: 'left',
  },
  numCol: {
    width: 30,
  },
  pointsCell: {
    fontWeight: 'bold',
    color: '#d30707',
  },
});

export default StandingsScreen;
