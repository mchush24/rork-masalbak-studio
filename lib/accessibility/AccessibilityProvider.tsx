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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  AccessibilityInfo,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESSIBILITY_KEY = 'accessibility_preferences';

interface AccessibilityPreferences {
  fontScale: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  largerTouchTargets: boolean;
  reduceTransparency: boolean;
  boldText: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  fontScale: 'normal',
  highContrast: false,
  largerTouchTargets: false,
  reduceTransparency: false,
  boldText: false,
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

  // Helpers
  announceForAccessibility: (message: string) => void;
  setAccessibilityFocus: (ref: React.RefObject<any>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

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
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    defaultPreferences
  );
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
      AccessibilityInfo.isReduceTransparencyEnabled().then(
        setIsReduceTransparencyEnabled
      );
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
  const savePreferences = useCallback(
    async (newPrefs: AccessibilityPreferences) => {
      try {
        await AsyncStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(newPrefs));
      } catch (error) {
        console.error('Failed to save accessibility preferences:', error);
      }
    },
    []
  );

  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K]
    ) => {
      setPreferences((prev) => {
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

  // Helpers
  const announceForAccessibility = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  const setAccessibilityFocus = useCallback((ref: React.RefObject<any>) => {
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
      announceForAccessibility,
      setAccessibilityFocus,
    ]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility context
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
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
