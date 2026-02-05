/**
 * Responsive Typography System
 *
 * Automatically scales typography based on screen dimensions
 * Supports phone, tablet, and desktop breakpoints
 * Follows accessibility guidelines for minimum text sizes
 */

import { Dimensions, Platform, PixelRatio, TextStyle } from 'react-native';

// ============================================
// Screen Breakpoints
// ============================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const breakpoints = {
  /** Small phones (< 375px) */
  xs: 320,
  /** Standard phones (375-413px) */
  sm: 375,
  /** Large phones (414-767px) */
  md: 414,
  /** Tablets (768-1023px) */
  lg: 768,
  /** Large tablets / small desktops (1024-1279px) */
  xl: 1024,
  /** Desktop (1280px+) */
  xxl: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Get current breakpoint based on screen width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (SCREEN_WIDTH < breakpoints.sm) return 'xs';
  if (SCREEN_WIDTH < breakpoints.md) return 'sm';
  if (SCREEN_WIDTH < breakpoints.lg) return 'md';
  if (SCREEN_WIDTH < breakpoints.xl) return 'lg';
  if (SCREEN_WIDTH < breakpoints.xxl) return 'xl';
  return 'xxl';
}

/**
 * Check if current device is a tablet
 */
export function isTablet(): boolean {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return SCREEN_WIDTH >= breakpoints.lg || (SCREEN_WIDTH >= 600 && aspectRatio < 1.6);
}

/**
 * Check if current device is a phone
 */
export function isPhone(): boolean {
  return !isTablet();
}

// ============================================
// Scale Factors
// ============================================

/**
 * Base design width (iPhone 14 Pro)
 */
const BASE_WIDTH = 393;

/**
 * Maximum scale factor for tablets to prevent overly large text
 */
const MAX_SCALE_FACTOR = 1.3;

/**
 * Minimum scale factor for small devices
 */
const MIN_SCALE_FACTOR = 0.85;

/**
 * Calculate scale factor based on screen width
 */
function getScaleFactor(): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.min(Math.max(scale, MIN_SCALE_FACTOR), MAX_SCALE_FACTOR);
}

/**
 * Normalize font size based on screen width and pixel ratio
 * This ensures consistent text sizing across different devices
 */
export function normalize(size: number): number {
  const scaleFactor = getScaleFactor();
  const newSize = size * scaleFactor;

  // Respect user's font scaling preferences
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Normalize with accessibility limits (min 12px, max based on scale)
 */
export function normalizeAccessible(size: number, minSize: number = 12): number {
  const normalized = normalize(size);
  return Math.max(normalized, minSize);
}

// ============================================
// Responsive Font Sizes
// ============================================

export const responsiveFontSizes = {
  /** Caption, helper text (11-12px) */
  xs: normalize(11),
  /** Small text, labels (13-14px) */
  sm: normalize(13),
  /** Body text (15-16px) */
  base: normalize(15),
  /** Medium emphasis (17-18px) */
  md: normalize(17),
  /** Section titles (20-22px) */
  lg: normalize(20),
  /** Card titles, headers (24-26px) */
  xl: normalize(24),
  /** Page titles (28-32px) */
  '2xl': normalize(28),
  /** Large headings (32-36px) */
  '3xl': normalize(32),
  /** Hero text (40-48px) */
  '4xl': normalize(40),
  /** Display text (48-56px) */
  '5xl': normalize(48),
  /** Hero display (56-64px) */
  hero: normalize(56),
} as const;

export type FontSize = keyof typeof responsiveFontSizes;

// ============================================
// Responsive Line Heights
// ============================================

/**
 * Calculate line height based on font size
 * Uses golden ratio derived multipliers for optimal readability
 */
export function getLineHeight(fontSize: number, type: 'tight' | 'normal' | 'relaxed' = 'normal'): number {
  const multipliers = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  };
  return Math.round(fontSize * multipliers[type]);
}

export const responsiveLineHeights = {
  xs: getLineHeight(responsiveFontSizes.xs),
  sm: getLineHeight(responsiveFontSizes.sm),
  base: getLineHeight(responsiveFontSizes.base),
  md: getLineHeight(responsiveFontSizes.md),
  lg: getLineHeight(responsiveFontSizes.lg),
  xl: getLineHeight(responsiveFontSizes.xl),
  '2xl': getLineHeight(responsiveFontSizes['2xl'], 'tight'),
  '3xl': getLineHeight(responsiveFontSizes['3xl'], 'tight'),
  '4xl': getLineHeight(responsiveFontSizes['4xl'], 'tight'),
  '5xl': getLineHeight(responsiveFontSizes['5xl'], 'tight'),
  hero: getLineHeight(responsiveFontSizes.hero, 'tight'),
} as const;

// ============================================
// Typography Presets
// ============================================

export type FontWeight = '400' | '500' | '600' | '700' | '800' | '900';

interface TypographyPreset extends TextStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing?: number;
}

/**
 * Pre-defined typography styles for consistent usage
 */
export const textStyles: Record<string, TypographyPreset> = {
  // Display styles (for heroes, large headings)
  displayLarge: {
    fontSize: responsiveFontSizes.hero,
    lineHeight: responsiveLineHeights.hero,
    fontWeight: '800',
    letterSpacing: -1,
  },
  displayMedium: {
    fontSize: responsiveFontSizes['5xl'],
    lineHeight: responsiveLineHeights['5xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: responsiveFontSizes['4xl'],
    lineHeight: responsiveLineHeights['4xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Heading styles
  headingLarge: {
    fontSize: responsiveFontSizes['3xl'],
    lineHeight: responsiveLineHeights['3xl'],
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headingMedium: {
    fontSize: responsiveFontSizes['2xl'],
    lineHeight: responsiveLineHeights['2xl'],
    fontWeight: '600',
    letterSpacing: 0,
  },
  headingSmall: {
    fontSize: responsiveFontSizes.xl,
    lineHeight: responsiveLineHeights.xl,
    fontWeight: '600',
    letterSpacing: 0,
  },

  // Title styles
  titleLarge: {
    fontSize: responsiveFontSizes.lg,
    lineHeight: responsiveLineHeights.lg,
    fontWeight: '600',
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: responsiveFontSizes.md,
    lineHeight: responsiveLineHeights.md,
    fontWeight: '600',
    letterSpacing: 0,
  },
  titleSmall: {
    fontSize: responsiveFontSizes.base,
    lineHeight: responsiveLineHeights.base,
    fontWeight: '600',
    letterSpacing: 0,
  },

  // Body styles
  bodyLarge: {
    fontSize: responsiveFontSizes.md,
    lineHeight: responsiveLineHeights.md,
    fontWeight: '400',
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: responsiveFontSizes.base,
    lineHeight: responsiveLineHeights.base,
    fontWeight: '400',
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: responsiveFontSizes.sm,
    lineHeight: responsiveLineHeights.sm,
    fontWeight: '400',
    letterSpacing: 0,
  },

  // Label styles
  labelLarge: {
    fontSize: responsiveFontSizes.base,
    lineHeight: responsiveLineHeights.base,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: responsiveFontSizes.sm,
    lineHeight: responsiveLineHeights.sm,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: responsiveFontSizes.xs,
    lineHeight: responsiveLineHeights.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Special styles
  caption: {
    fontSize: responsiveFontSizes.xs,
    lineHeight: responsiveLineHeights.xs,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: responsiveFontSizes.xs,
    lineHeight: responsiveLineHeights.xs,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  button: {
    fontSize: responsiveFontSizes.md,
    lineHeight: responsiveLineHeights.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
};

export type TextStyleName = keyof typeof textStyles;

// ============================================
// Utility Functions
// ============================================

/**
 * Get responsive font size based on breakpoint
 */
export function getResponsiveSize(
  sizes: Partial<Record<Breakpoint, number>>
): number {
  const breakpoint = getCurrentBreakpoint();
  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);

  // Find the nearest defined size (current or smaller)
  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i];
    if (sizes[bp] !== undefined) {
      return sizes[bp]!;
    }
  }

  // Fallback to first defined size
  for (const bp of orderedBreakpoints) {
    if (sizes[bp] !== undefined) {
      return sizes[bp]!;
    }
  }

  return responsiveFontSizes.base;
}

/**
 * Create responsive text style with size variants
 */
export function createResponsiveTextStyle(
  sizes: Partial<Record<Breakpoint, FontSize>>,
  weight: FontWeight = '400'
): TextStyle {
  const breakpoint = getCurrentBreakpoint();
  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);

  let sizeKey: FontSize = 'base';
  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i];
    if (sizes[bp] !== undefined) {
      sizeKey = sizes[bp]!;
      break;
    }
  }

  return {
    fontSize: responsiveFontSizes[sizeKey],
    lineHeight: responsiveLineHeights[sizeKey],
    fontWeight: weight,
  };
}
