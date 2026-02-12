/**
 * AccessibilityProvider - Enhanced accessibility support
 * Phase 17: Accessibility 2.0
 *
 * Provides accessibility context with:
 * - Screen reader detection
 * - Font scaling
 * - Reduced motion support
 * - High contrast mode
 * - Focus management
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const ACCESSIBILITY_KEY = 'accessibility_preferences';

export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface AccessibilityPreferences {
  fontScale: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  largerTouchTargets: boolean;
  reduceTransparency: boolean;
  boldText: boolean;
  colorBlindMode: ColorBlindMode;
  simplifiedLanguage: boolean;
  reducedInformation: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  fontScale: 'normal',
  highContrast: false,
  largerTouchTargets: false,
  reduceTransparency: false,
  boldText: false,
  colorBlindMode: 'none',
  simplifiedLanguage: false,
  reducedInformation: false,
};

interface AccessibilityContextType {
  // System settings
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isInvertColorsEnabled: boolean;

  // User preferences
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  resetPreferences: () => void;

  // Computed values
  fontSizeMultiplier: number;
  minimumTouchSize: number;
  shouldReduceMotion: boolean;
  shouldUseHighContrast: boolean;
  colorBlindMode: ColorBlindMode;
  shouldUseSimplifiedLanguage: boolean;
  shouldReduceInformation: boolean;

  // Color transformation helpers
  transformColor: (hex: string) => string;
  getColorBlindSafeColors: () => ColorBlindSafeColors;

  // Helpers
  announceForAccessibility: (message: string) => void;
  setAccessibilityFocus: (ref: React.RefObject<View>) => void;
}

/**
 * Color-blind safe color alternatives
 */
interface ColorBlindSafeColors {
  success: string;
  error: string;
  warning: string;
  info: string;
  primary: string;
  secondary: string;
}

/**
 * Color transformation matrices for color blindness simulation
 * These matrices approximate how colors appear to people with color vision deficiencies
 */
const COLOR_BLIND_MATRICES: Record<ColorBlindMode, number[][]> = {
  none: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  // Red-green color blindness (most common, affects ~6% of males)
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  // Red color blindness
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  // Blue-yellow color blindness (rare)
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

/**
 * Safe color palettes for each color blindness type
 */
const COLOR_BLIND_SAFE_PALETTES: Record<ColorBlindMode, ColorBlindSafeColors> = {
  none: {
    success: '#22C55E',
    error: '#EF4444',
    warning: Colors.semantic.amber,
    info: '#3B82F6',
    primary: '#7C3AED',
    secondary: '#EC4899',
  },
  deuteranopia: {
    success: '#0077BB', // Blue instead of green
    error: '#CC3311', // Orange-red
    warning: '#EE7733', // Orange
    info: '#0077BB', // Blue
    primary: '#7C3AED', // Purple is safe
    secondary: '#EE3377', // Magenta
  },
  protanopia: {
    success: '#009988', // Teal
    error: '#CC3311', // Orange-red
    warning: '#EE7733', // Orange
    info: '#0077BB', // Blue
    primary: '#7C3AED', // Purple is safe
    secondary: '#EE3377', // Magenta
  },
  tritanopia: {
    success: '#009988', // Teal
    error: '#CC3311', // Orange-red
    warning: '#DDAA33', // Gold
    info: '#EE7733', // Orange
    primary: '#7C3AED', // Purple
    secondary: '#CC3311', // Red-orange
  },
};

/**
 * Transform a hex color for color blindness
 */
function transformColorForColorBlindness(hex: string, mode: ColorBlindMode): string {
  if (mode === 'none') return hex;

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Apply transformation matrix
  const matrix = COLOR_BLIND_MATRICES[mode];
  const newR = Math.min(1, Math.max(0, matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b));
  const newG = Math.min(1, Math.max(0, matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b));
  const newB = Math.min(1, Math.max(0, matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b));

  // Convert back to hex
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // System settings
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);
  const [isGrayscaleEnabled, setIsGrayscaleEnabled] = useState(false);
  const [isReduceTransparencyEnabled, setIsReduceTransparencyEnabled] = useState(false);
  const [isInvertColorsEnabled, setIsInvertColorsEnabled] = useState(false);

  // Reduced motion from Reanimated
  const systemReduceMotion = useReducedMotion();

  // User preferences
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem(ACCESSIBILITY_KEY);
        if (saved) {
          setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
        }
      } catch (error) {
        console.error('Failed to load accessibility preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreferences();
  }, []);

  // Listen for system accessibility changes
  useEffect(() => {
    // Screen reader
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    // Bold text
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isBoldTextEnabled().then(setIsBoldTextEnabled);
      const boldTextListener = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        setIsBoldTextEnabled
      );

      // Grayscale
      AccessibilityInfo.isGrayscaleEnabled().then(setIsGrayscaleEnabled);
      const grayscaleListener = AccessibilityInfo.addEventListener(
        'grayscaleChanged',
        setIsGrayscaleEnabled
      );

      // Reduce transparency
      AccessibilityInfo.isReduceTransparencyEnabled().then(setIsReduceTransparencyEnabled);
      const transparencyListener = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        setIsReduceTransparencyEnabled
      );

      // Invert colors
      AccessibilityInfo.isInvertColorsEnabled().then(setIsInvertColorsEnabled);
      const invertListener = AccessibilityInfo.addEventListener(
        'invertColorsChanged',
        setIsInvertColorsEnabled
      );

      return () => {
        screenReaderListener.remove();
        boldTextListener.remove();
        grayscaleListener.remove();
        transparencyListener.remove();
        invertListener.remove();
      };
    }

    return () => {
      screenReaderListener.remove();
    };
  }, []);

  // Save preferences
  const savePreferences = useCallback(async (newPrefs: AccessibilityPreferences) => {
    try {
      await AsyncStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error);
    }
  }, []);

  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
      setPreferences(prev => {
        const newPrefs = { ...prev, [key]: value };
        savePreferences(newPrefs);
        return newPrefs;
      });
    },
    [savePreferences]
  );

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    savePreferences(defaultPreferences);
  }, [savePreferences]);

  // Computed values
  const fontSizeMultiplier = useMemo(() => {
    const scaleMap = {
      normal: 1,
      large: 1.2,
      xlarge: 1.4,
    };
    return scaleMap[preferences.fontScale];
  }, [preferences.fontScale]);

  const minimumTouchSize = useMemo(() => {
    return preferences.largerTouchTargets ? 56 : 44;
  }, [preferences.largerTouchTargets]);

  const shouldReduceMotion = useMemo(() => {
    return systemReduceMotion || false;
  }, [systemReduceMotion]);

  const shouldUseHighContrast = useMemo(() => {
    return preferences.highContrast;
  }, [preferences.highContrast]);

  const colorBlindMode = useMemo(() => {
    return preferences.colorBlindMode;
  }, [preferences.colorBlindMode]);

  const shouldUseSimplifiedLanguage = useMemo(() => {
    return preferences.simplifiedLanguage;
  }, [preferences.simplifiedLanguage]);

  const shouldReduceInformation = useMemo(() => {
    return preferences.reducedInformation;
  }, [preferences.reducedInformation]);

  // Color transformation helpers
  const transformColor = useCallback(
    (hex: string) => {
      return transformColorForColorBlindness(hex, preferences.colorBlindMode);
    },
    [preferences.colorBlindMode]
  );

  const getColorBlindSafeColors = useCallback(() => {
    return COLOR_BLIND_SAFE_PALETTES[preferences.colorBlindMode];
  }, [preferences.colorBlindMode]);

  // Helpers
  const announceForAccessibility = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  const setAccessibilityFocus = useCallback((ref: React.RefObject<View>) => {
    if (ref.current) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  }, []);

  const value = useMemo(
    () => ({
      isScreenReaderEnabled,
      isReduceMotionEnabled: shouldReduceMotion,
      isBoldTextEnabled,
      isGrayscaleEnabled,
      isReduceTransparencyEnabled,
      isInvertColorsEnabled,
      preferences,
      updatePreference,
      resetPreferences,
      fontSizeMultiplier,
      minimumTouchSize,
      shouldReduceMotion,
      shouldUseHighContrast,
      colorBlindMode,
      shouldUseSimplifiedLanguage,
      shouldReduceInformation,
      transformColor,
      getColorBlindSafeColors,
      announceForAccessibility,
      setAccessibilityFocus,
    }),
    [
      isScreenReaderEnabled,
      shouldReduceMotion,
      isBoldTextEnabled,
      isGrayscaleEnabled,
      isReduceTransparencyEnabled,
      isInvertColorsEnabled,
      preferences,
      updatePreference,
      resetPreferences,
      fontSizeMultiplier,
      minimumTouchSize,
      shouldUseHighContrast,
      colorBlindMode,
      shouldUseSimplifiedLanguage,
      shouldReduceInformation,
      transformColor,
      getColorBlindSafeColors,
      announceForAccessibility,
      setAccessibilityFocus,
    ]
  );

  if (!isLoaded) {
    return null;
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

/**
 * Hook to access accessibility context
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Hook for accessible animations
 */
export function useAccessibleAnimation() {
  const { shouldReduceMotion } = useAccessibility();

  const getAnimationConfig = useCallback(
    (duration: number = 300) => {
      if (shouldReduceMotion) {
        return { duration: 0 };
      }
      return { duration };
    },
    [shouldReduceMotion]
  );

  const getSpringConfig = useCallback(
    (config: { damping?: number; stiffness?: number } = {}) => {
      if (shouldReduceMotion) {
        return { damping: 100, stiffness: 1000 };
      }
      return {
        damping: config.damping ?? 15,
        stiffness: config.stiffness ?? 100,
      };
    },
    [shouldReduceMotion]
  );

  return { getAnimationConfig, getSpringConfig, shouldReduceMotion };
}

/**
 * Hook for scaled font sizes
 */
export function useAccessibleFontSize(baseSize: number): number {
  const { fontSizeMultiplier } = useAccessibility();
  return Math.round(baseSize * fontSizeMultiplier);
}

/**
 * Hook for minimum touch target size
 */
export function useMinimumTouchTarget(): number {
  const { minimumTouchSize } = useAccessibility();
  return minimumTouchSize;
}

/**
 * Hook for color blind safe colors
 */
export function useColorBlindSafeColors() {
  const { getColorBlindSafeColors, colorBlindMode } = useAccessibility();
  return { colors: getColorBlindSafeColors(), mode: colorBlindMode };
}

/**
 * Hook for transformed colors
 */
export function useTransformedColor(hex: string): string {
  const { transformColor } = useAccessibility();
  return transformColor(hex);
}

/**
 * Hook for cognitive accessibility settings
 */
export function useCognitiveAccessibility() {
  const { shouldUseSimplifiedLanguage, shouldReduceInformation } = useAccessibility();
  return {
    simplifiedLanguage: shouldUseSimplifiedLanguage,
    reducedInformation: shouldReduceInformation,
  };
}
