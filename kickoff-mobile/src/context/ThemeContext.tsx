import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, ColorPalette } from '../theme/palettes';

const THEME_KEY = '@theme_preference';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ColorPalette;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(stored => {
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(THEME_KEY, newMode);
  }, []);

  const toggle = useCallback(async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    await setMode(next);
  }, [mode, setMode]);

  const resolvedDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = resolvedDark ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark: resolvedDark, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
