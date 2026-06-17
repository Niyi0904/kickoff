import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/types';
import { PRIMARY_COLOR, BACKGROUND_COLOR } from '../../theme';

type AdminHomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'AdminHome'>;

const AdminHomeScreen: React.FC = () => {
  const navigation = useNavigation<AdminHomeScreenNavigationProp>();
  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => navigation.navigate('LeagueSettings')} style={styles.button} buttonColor={PRIMARY_COLOR}>
        League Settings
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('TeamManagement')} style={styles.button} buttonColor={PRIMARY_COLOR}>
        Manage Teams
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('PlayerManagement')} style={styles.button} buttonColor={PRIMARY_COLOR}>
        Manage Players
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('MatchManagement')} style={styles.button} buttonColor={PRIMARY_COLOR}>
        Manage Matches
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  button: {
    marginVertical: 10,
  },
});

export default AdminHomeScreen;
