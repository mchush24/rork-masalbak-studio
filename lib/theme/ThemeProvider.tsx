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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useColorScheme, Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors as LightColors } from '@/constants/colors';

const THEME_KEY = 'theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

// Dark mode color palette
const DarkColors = {
  primary: {
    purple: '#A78BFA',
    pink: '#F472B6',
    orange: '#FB923C',
    turquoise: '#5EEAD4',
  },
  emotion: {
    joy: '#FDE047',
    trust: '#86EFAC',
    fear: '#FCA5A5',
    surprise: '#C4B5FD',
    sadness: '#93C5FD',
    anticipation: '#FDBA74',
  },
  neutral: {
    white: '#1F1F23',
    lighter: '#2A2A2E',
    light: '#3F3F46',
    medium: '#A1A1AA',
    dark: '#E4E4E7',
    darker: '#F4F4F5',
  },
  background: {
    primary: '#0F0F12',
    secondary: '#1F1F23',
    tertiary: '#2A2A2E',
  },
  surface: {
    card: '#1F1F23',
    elevated: '#2A2A2E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    primary: '#F4F4F5',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    inverse: '#18181B',
  },
  border: {
    light: '#3F3F46',
    medium: '#52525B',
    focus: '#A78BFA',
  },
  status: {
    success: '#86EFAC',
    warning: '#FDE047',
    error: '#FCA5A5',
    info: '#93C5FD',
  },
};

// Light mode extended palette
const ExtendedLightColors = {
  ...LightColors,
  primary: {
    purple: '#A78BFA',
    pink: '#F472B6',
    orange: '#FB923C',
    turquoise: '#5EEAD4',
  },
  emotion: {
    joy: '#FDE047',
    trust: '#22C55E',
    fear: '#EF4444',
    surprise: '#C4B5FD',
    sadness: '#60A5FA',
    anticipation: '#FB923C',
  },
  neutral: {
    white: '#FFFFFF',
    lightest: '#F8F7FC',
    lighter: '#F1F0F7',
    light: '#E5E7EB',
    medium: '#9CA3AF',
    dark: '#6B7280',
    darker: '#374151',
    darkest: '#1A1A2E',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F7FC',
    tertiary: '#F1F0F7',
  },
  surface: {
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#1A1A2E',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    focus: '#7C3AED',
  },
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export type ThemeColors = typeof ExtendedLightColors;

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

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
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
  const colors = useMemo<ThemeColors>(() => {
    return isDark ? DarkColors as ThemeColors : ExtendedLightColors;
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

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
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
export function useThemedStyles<T>(
  styleFactory: (colors: ThemeColors, isDark: boolean) => T
): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => styleFactory(colors, isDark), [colors, isDark, styleFactory]);
}

/**
 * Hook to get a single color value
 */
export function useThemeColor(
  colorPath: string,
  fallback?: string
): string {
  const { colors } = useTheme();

  return useMemo(() => {
    const parts = colorPath.split('.');
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

export { DarkColors, ExtendedLightColors };
