import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function HeaderProfileButton() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('MyProfile')}
      style={{ marginRight: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.border }}
    >
      <Text style={{ fontSize: 16 }}>👤</Text>
    </TouchableOpacity>
  );
}
