/**
 * Accessibility Utilities
 *
 * Helpers for making the app accessible to all children
 * - Screen reader support
 * - Touch target sizing
 * - Reduced motion
 * - Color contrast
 */

import { AccessibilityInfo, Platform, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/colors';

/**
 * Minimum touch target sizes (Apple HIG & Material Design)
 */
export const TOUCH_TARGETS = {
  minimum: 44, // Apple's minimum
  comfortable: 48, // Material Design
  large: 56, // For children
  extraLarge: 64, // For motor difficulties
} as const;

/**
 * Hook to detect if screen reader is active
 */
export function useScreenReader(): boolean {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isScreenReaderEnabled().then(setIsActive);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setIsActive);

    return () => {
      subscription.remove();
    };
  }, []);

  return isActive;
}

/**
 * Hook to detect if reduce motion is enabled
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

/**
 * Hook to detect if bold text is enabled (iOS)
 */
export function useBoldText(): boolean {
  const [boldText, setBoldText] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isBoldTextEnabled().then(setBoldText);

      const subscription = AccessibilityInfo.addEventListener('boldTextChanged', setBoldText);

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return boldText;
}

/**
 * Combined accessibility settings hook
 */
export function useAccessibilitySettings() {
  const isScreenReaderActive = useScreenReader();
  const reduceMotion = useReduceMotion();
  const boldText = useBoldText();
  const colorScheme = useColorScheme();

  return {
    isScreenReaderActive,
    reduceMotion,
    boldText,
    isDarkMode: colorScheme === 'dark',
    // Helpers
    shouldDisableAnimations: reduceMotion,
    shouldUseLargerText: boldText || isScreenReaderActive,
  };
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Set focus on an element (for screen readers)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setAccessibilityFocus(ref: { current?: any }): void {
  if (ref?.current) {
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
}

/**
 * Generate accessibility props for interactive elements
 */
interface AccessibilityPropsOptions {
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'image' | 'text' | 'header' | 'search' | 'tab';
  state?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
}

export function getAccessibilityProps({
  label,
  hint,
  role = 'button',
  state,
}: AccessibilityPropsOptions) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: state,
  };
}

/**
 * Child-friendly accessibility labels
 * Turkish translations for common actions
 */
export const A11Y_LABELS = {
  // Navigation
  goBack: 'Geri git',
  goHome: 'Ana sayfaya git',
  openMenu: 'Menüyü aç',
  closeMenu: 'Menüyü kapat',

  // Actions
  takePhoto: 'Fotoğraf çek',
  chooseImage: 'Resim seç',
  save: 'Kaydet',
  delete: 'Sil',
  share: 'Paylaş',
  play: 'Oynat',
  pause: 'Duraklat',
  stop: 'Durdur',

  // Emotions
  happy: 'Mutlu',
  sad: 'Üzgün',
  angry: 'Kızgın',
  scared: 'Korkmuş',
  excited: 'Heyecanlı',
  calm: 'Sakin',
  tired: 'Yorgun',
  loved: 'Sevgi dolu',

  // App-specific
  startAnalysis: 'Analizi başlat',
  viewResults: 'Sonuçları gör',
  selectTest: 'Test seç',
  enterAge: 'Yaş gir',
  mascotChat: 'Ioo ile konuş',
} as const;

/**
 * Child-friendly hints (explain what happens)
 */
export const A11Y_HINTS = {
  takePhoto: 'Kamerayı açar ve çizimin fotoğrafını çekersin',
  chooseImage: 'Galeriden bir çizim seçersin',
  startAnalysis: 'Çizimini analiz etmeye başlar',
  viewResults: 'Analiz sonuçlarını gösterir',
  mascotChat: 'Ioo seninle sohbet eder',
  selectEmotion: 'Bu duyguyu seçersin',
  badge: 'Bu rozetinin detaylarını gösterir',
} as const;

/**
 * Color contrast ratios (WCAG 2.1)
 * AA requires 4.5:1 for normal text, 3:1 for large text
 * AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Simplified - in production use a proper library
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets accessibility standards
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * High contrast color pairs for accessibility
 */
export const HIGH_CONTRAST_PAIRS = {
  primary: { text: '#1F2937', background: Colors.neutral.white },
  secondary: { text: Colors.neutral.gray700, background: Colors.neutral.gray50 },
  accent: { text: Colors.neutral.white, background: '#7C3AED' },
  success: { text: Colors.neutral.white, background: '#059669' },
  warning: { text: '#1F2937', background: '#FBBF24' },
  error: { text: Colors.neutral.white, background: '#DC2626' },
} as const;
