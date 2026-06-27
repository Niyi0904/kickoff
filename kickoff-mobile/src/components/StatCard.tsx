import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

type StatCardProps = {
  title: string;
  children: React.ReactNode;
};

export const StatCard: React.FC<StatCardProps> = React.memo(({ title, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.black }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
});

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
});
