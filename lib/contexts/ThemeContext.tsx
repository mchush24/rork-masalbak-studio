/**
 * ThemeContext - Dark/Light mode management
 *
 * Features:
 * - Theme toggle (light/dark/system)
 * - Smooth transition animations
 * - Persisted preference
 * - WCAG AA compliant colors
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme, Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors, EtherealColors, EtherealDarkColors, ThemeConfig } from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  // Current theme mode setting
  mode: ThemeMode;
  // Resolved theme (what's actually displayed)
  theme: ResolvedTheme;
  // Set theme mode
  setMode: (mode: ThemeMode) => Promise<void>;
  // Toggle between light and dark
  toggle: () => Promise<void>;
  // Whether dark mode is active
  isDark: boolean;
  // Theme colors based on current theme
  colors: typeof Colors;
  // Ethereal colors based on current theme
  ethereal: typeof EtherealColors;
  // Theme config for navigation
  themeConfig: typeof ThemeConfig.light;
  // Animation duration for transitions
  transitionDuration: number;
}

const THEME_STORAGE_KEY = '@renkioo_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Resolve actual theme based on mode and system preference
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const isDark = resolvedTheme === 'dark';

  // Get colors based on current theme
  const colors = useMemo(() => {
    return isDark ? DarkColors : Colors;
  }, [isDark]);

  const ethereal = useMemo(() => {
    return isDark ? EtherealDarkColors : EtherealColors;
  }, [isDark]);

  const themeConfig = useMemo(() => {
    return isDark ? ThemeConfig.dark : ThemeConfig.light;
  }, [isDark]);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Force re-render when system theme changes
      if (mode === 'system') {
        // The resolvedTheme will automatically update via useMemo
      }
    });

    return () => subscription.remove();
  }, [mode]);

  // Set theme mode
  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggle = useCallback(async () => {
    const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    await setMode(newMode);
  }, [resolvedTheme, setMode]);

  const value = useMemo<ThemeContextType>(() => ({
    mode,
    theme: resolvedTheme,
    setMode,
    toggle,
    isDark,
    colors: colors as typeof Colors,
    ethereal: ethereal as typeof EtherealColors,
    themeConfig,
    transitionDuration: 300,
  }), [mode, resolvedTheme, setMode, toggle, isDark, colors, ethereal, themeConfig]);

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting themed styles
export function useThemedStyles<T>(
  lightStyles: T,
  darkStyles: T
): T {
  const { isDark } = useTheme();
  return isDark ? darkStyles : lightStyles;
}

// Utility to create themed value
export function themed<T>(light: T, dark: T): { light: T; dark: T } {
  return { light, dark };
}

export default ThemeContext;
