/**
 * ThemeProvider - Dark/Light mode support
 * Phase 16: Dark Mode
 *
 * Provides theme context with:
 * - System preference detection
 * - Manual theme toggle
 * - Animated theme transitions
 * - Persisted preferences
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors as DarkColorPalette } from '@/constants/colors';

const THEME_KEY = 'theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

export type ThemeColors = typeof Colors;

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setMode(saved as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Calculate resolved theme
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const isDark = resolvedTheme === 'dark';

  // Select colors based on theme
  // DarkColorPalette mirrors Colors structure but has different literal types from `as const` arrays
  const colors = useMemo<ThemeColors>(() => {
    return (isDark ? DarkColorPalette : Colors) as ThemeColors;
  }, [isDark]);

  // Update status bar
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  const setTheme = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setTheme(newMode);
  }, [mode, setTheme]);

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      colors,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [mode, resolvedTheme, colors, isDark, setTheme, toggleTheme]
  );

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get themed styles
 */
export function useThemedStyles<T>(styleFactory: (colors: ThemeColors, isDark: boolean) => T): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => styleFactory(colors, isDark), [colors, isDark, styleFactory]);
}

/**
 * Hook to get a single color value
 */
export function useThemeColor(colorPath: string, fallback?: string): string {
  const { colors } = useTheme();

  return useMemo(() => {
    const parts = colorPath.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = colors;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return fallback || '#000000';
      }
    }

    return typeof value === 'string' ? value : fallback || '#000000';
  }, [colors, colorPath, fallback]);
}

export { DarkColorPalette as DarkColors };
