import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { PRIMARY_COLOR } from '../theme';

export const SignOutButton = () => {
  const { signOut } = useAuth();

  const handlePress = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.btn}>
      <Text style={styles.text}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { marginRight: 12, paddingVertical: 4, paddingHorizontal: 8 },
  text: { color: PRIMARY_COLOR, fontSize: 13, fontWeight: '600' },
});
