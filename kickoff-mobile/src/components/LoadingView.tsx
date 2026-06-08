import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingView = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color="#d30707" />
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
});
