import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  isConnected: boolean;
}

export const NetworkBanner: React.FC<Props> = React.memo(({ isConnected }) => {
  const { colors } = useTheme();

  if (isConnected) return null;

  return (
    <View style={{
      backgroundColor: colors.yellow,
      paddingVertical: 6,
      paddingHorizontal: 16,
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>
        No internet connection — showing cached data
      </Text>
    </View>
  );
});
