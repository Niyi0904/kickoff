import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme';

export function SignOutButton() {
  const { colors } = useTheme();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      style={{ marginRight: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.border }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.red }}>Sign Out</Text>
    </TouchableOpacity>
  );
}
