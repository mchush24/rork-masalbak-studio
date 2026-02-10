/**
 * Visual Polish Utilities
 * Phase 21: Polish & Delight
 *
 * Consistent styling helpers and design tokens
 */

import { Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Standardized shadow presets
 */
export const SHADOWS = {
  none: {},
  xs: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string = Colors.secondary.lavender) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
  inner: {
    // Note: React Native doesn't support inset shadows natively
    // This is a placeholder for web or custom implementations
  },
};

/**
 * Standardized border radius presets
 */
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

/**
 * Standardized spacing scale
 */
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  // Display
  display: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  // Headings
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  // Body
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  bodySemibold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  // Small
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  // Caption
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  // Overline
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};

/**
 * Animation timing presets (for consistency)
 */
export const TIMING = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

/**
 * Z-index scale
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 9999,
};

/**
 * Common layout helpers
 */
export const LAYOUT = StyleSheet.create({
  // Flex
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexWrap: { flexWrap: 'wrap' },
  
  // Alignment
  center: { justifyContent: 'center', alignItems: 'center' },
  centerX: { alignItems: 'center' },
  centerY: { justifyContent: 'center' },
  spaceBetween: { justifyContent: 'space-between' },
  spaceAround: { justifyContent: 'space-around' },
  spaceEvenly: { justifyContent: 'space-evenly' },
  
  // Fill
  fillParent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  fillWidth: { width: '100%' },
  fillHeight: { height: '100%' },
});

/**
 * Create consistent card styles
 */
export function createCardStyle(options?: {
  padding?: number;
  radius?: keyof typeof RADIUS;
  shadow?: keyof typeof SHADOWS;
  backgroundColor?: string;
}) {
  const {
    padding = SPACING[4],
    radius = 'md',
    shadow = 'sm',
    backgroundColor = '#1E2235',
  } = options || {};

  return {
    padding,
    borderRadius: RADIUS[radius],
    backgroundColor,
    ...(typeof SHADOWS[shadow] === 'function' ? {} : SHADOWS[shadow]),
  };
}

/**
 * Create consistent button styles
 */
export function createButtonStyle(options?: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}) {
  const { size = 'md', variant = 'primary', fullWidth = false } = options || {};

  const sizes = {
    sm: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm },
    md: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.md },
    lg: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: RADIUS.lg },
  };

  const variants = {
    primary: {
      backgroundColor: Colors.secondary.lavender,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: Colors.secondary.rose,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.secondary.lavender,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  };

  return {
    ...sizes[size],
    ...variants[variant],
    ...(fullWidth ? { width: '100%' } : {}),
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };
}

/**
 * Get platform-specific styles
 */
export function platformSelect<T>(options: { ios?: T; android?: T; web?: T; default: T }): T {
  const platform = Platform.OS;
  if (platform === 'ios' && options.ios !== undefined) return options.ios;
  if (platform === 'android' && options.android !== undefined) return options.android;
  if (platform === 'web' && options.web !== undefined) return options.web;
  return options.default;
}

/**
 * Calculate responsive values
 */
export function responsive(
  baseValue: number,
  options?: { min?: number; max?: number; scale?: number }
): number {
  const { min, max, scale = 1 } = options || {};
  let value = baseValue * scale;
  
  if (min !== undefined && value < min) value = min;
  if (max !== undefined && value > max) value = max;
  
  return value;
}

/**
 * Color manipulation utilities
 */
export const colorUtils = {
  /**
   * Add opacity to a hex color
   */
  withOpacity: (hex: string, opacity: number): string => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hex + alpha;
  },

  /**
   * Lighten a color
   */
  lighten: (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
    const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * amount));
    const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  /**
   * Darken a color
   */
  darken: (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
    const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
};
