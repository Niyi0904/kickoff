import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
  <View style={styles.wrap}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 32, alignItems: 'center' },
  text: { color: '#666', textAlign: 'center', fontSize: 14 },
});
