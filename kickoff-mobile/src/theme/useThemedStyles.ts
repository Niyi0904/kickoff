import { useMemo } from 'react';
import { StyleSheet, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from './palettes';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (colors: ColorPalette) => T,
): T {
  const { colors } = useTheme();
  return useMemo(() => {
    const raw = factory(colors);
    return StyleSheet.create(raw) as T;
  }, [colors]);
}

export { useTheme };
export type { ColorPalette };
