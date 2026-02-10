/**
 * Design Tokens - Compatibility Layer
 *
 * Bu dosya geriye dönük uyumluluk için tutulmaktadır.
 * YENİ KODLARDA @/constants/design-system kullanın.
 *
 * @deprecated Bu dosya yerine @/constants/design-system kullanın
 */

import { Platform } from 'react-native';
import {
  spacing as dsSpacing,
  shadows as dsShadows,
  typography as dsTypography,
  animation,
  textShadows as dsTextShadows,
  createTextShadow,
  createShadow,
} from '@/constants/design-system';
import { Colors } from '@/constants/colors';

// Re-export from design-system with legacy names
export { radius as borderRadius } from '@/constants/design-system';

// Spacing - legacy format (xs, sm, md, lg, xl)
export const spacing = {
  xs: dsSpacing['1'], // 4
  sm: dsSpacing['2'], // 8
  md: dsSpacing['4'], // 16
  lg: dsSpacing['6'], // 24
  xl: dsSpacing['8'], // 32
  xxl: dsSpacing['12'], // 48
  xxxl: dsSpacing['16'], // 64
} as const;

// Animations - legacy format
export const animations = {
  fast: animation.duration.fast,
  normal: animation.duration.normal,
  slow: animation.duration.slow,
  slower: animation.duration.slower,
  easing: {
    standard: animation.spring.snappy,
    gentle: animation.spring.gentle,
    bouncy: animation.spring.bouncy,
  },
} as const;

// Shadows with Platform.select for web support
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shadows = Platform.select<any>({
  web: {
    sm: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    md: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    },
    lg: {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    },
    xl: {
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)',
    },
  },
  default: dsShadows,
})!;

// Typography - legacy format with fontSize
export const typography = {
  fontSize: {
    xs: dsTypography.size.xs,
    sm: dsTypography.size.sm,
    base: dsTypography.size.base,
    md: dsTypography.size.md,
    lg: dsTypography.size.lg,
    xl: dsTypography.size.xl,
    xxl: dsTypography.size['2xl'],
    xxxl: dsTypography.size['3xl'],
    hero: dsTypography.size.hero,
  },
  lineHeight: dsTypography.lineHeight,
  letterSpacing: dsTypography.letterSpacing,
} as const;

// Layout - minimal legacy support
export const layout = {
  minTouchTarget: 44,
  iconSize: {
    sm: 56,
    md: 96,
    lg: 132,
  },
} as const;

// Colors - re-export with legacy structure
export const colors = {
  brand: {
    primary: Colors.primary.sunset,
    secondary: Colors.secondary.sky,
    accent: Colors.secondary.sunshine,
    success: Colors.secondary.grass,
    premium: Colors.secondary.lavender,
  },
  gradients: Colors.gradients,
  opacity: {
    subtle: 0.1,
    light: 0.15,
    medium: 0.25,
    strong: 0.4,
  },
} as const;

// Haptics - unchanged
export const haptics = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  selection: 'selection',
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',
} as const;

// Text Shadows - Platform-aware text shadow styles
export const textShadows = dsTextShadows;
export { createTextShadow };

// Box Shadows - Platform-aware shadow styles
export { createShadow };
