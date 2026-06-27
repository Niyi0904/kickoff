import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  style?: any;
  size?: number;
}

export const ThemeToggle: React.FC<Props> = ({ style, size = 20 }) => {
  const { isDark, toggle } = useTheme();
  return (
    <TouchableOpacity onPress={toggle} style={[styles.button, style]}>
      <Text style={{ fontSize: size }}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
