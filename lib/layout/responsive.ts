/**
 * Responsive Layout System
 *
 * Provides breakpoint-aware layout utilities for phones and tablets
 * Supports adaptive grids, columns, and spacing
 */

import { Dimensions, Platform } from 'react-native';
import { Breakpoint, isTablet, getCurrentBreakpoint } from '../typography/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// Layout Constants
// ============================================

/**
 * Screen padding by device type
 */
export const screenPadding = {
  phone: 16,
  tablet: 24,
  desktop: 32,
} as const;

/**
 * Get appropriate screen padding for current device
 */
export function getScreenPadding(): number {
  const breakpoint = getCurrentBreakpoint();
  if (breakpoint === 'lg' || breakpoint === 'xl') return screenPadding.tablet;
  if (breakpoint === 'xxl') return screenPadding.desktop;
  return screenPadding.phone;
}

/**
 * Grid gap by device type
 */
export const gridGap = {
  phone: 12,
  tablet: 16,
  desktop: 20,
} as const;

/**
 * Get appropriate grid gap for current device
 */
export function getGridGap(): number {
  const breakpoint = getCurrentBreakpoint();
  if (breakpoint === 'lg' || breakpoint === 'xl') return gridGap.tablet;
  if (breakpoint === 'xxl') return gridGap.desktop;
  return gridGap.phone;
}

// ============================================
// Column System
// ============================================

export type ColumnCount = 1 | 2 | 3 | 4 | 6 | 12;

interface ColumnConfig {
  xs?: ColumnCount;
  sm?: ColumnCount;
  md?: ColumnCount;
  lg?: ColumnCount;
  xl?: ColumnCount;
  xxl?: ColumnCount;
}

/**
 * Default column configurations by breakpoint
 */
export const defaultColumns: Record<Breakpoint, ColumnCount> = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 2,
  xl: 3,
  xxl: 4,
};

/**
 * Get number of columns for current breakpoint
 */
export function getColumns(config?: ColumnConfig): ColumnCount {
  const breakpoint = getCurrentBreakpoint();
  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);

  if (config) {
    // Find nearest defined column count
    for (let i = currentIndex; i >= 0; i--) {
      const bp = orderedBreakpoints[i];
      if (config[bp] !== undefined) {
        return config[bp]!;
      }
    }
  }

  return defaultColumns[breakpoint];
}

/**
 * Calculate column width based on current breakpoint
 */
export function getColumnWidth(
  columns: ColumnCount = getColumns(),
  gap: number = getGridGap(),
  padding: number = getScreenPadding()
): number {
  const availableWidth = SCREEN_WIDTH - padding * 2;
  const totalGapWidth = gap * (columns - 1);
  return (availableWidth - totalGapWidth) / columns;
}

// ============================================
// Responsive Values
// ============================================

type ResponsiveValue<T> = {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
};

/**
 * Get value for current breakpoint from responsive config
 */
export function getResponsiveValue<T>(values: ResponsiveValue<T>, fallback: T): T {
  const breakpoint = getCurrentBreakpoint();
  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);

  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return fallback;
}

// ============================================
// Layout Helpers
// ============================================

/**
 * Content max widths for different layouts
 */
export const maxContentWidth = {
  narrow: 600,
  medium: 900,
  wide: 1200,
  full: Infinity,
} as const;

export type ContentWidth = keyof typeof maxContentWidth;

/**
 * Get constrained content width
 */
export function getContentWidth(type: ContentWidth = 'wide'): number {
  const max = maxContentWidth[type];
  const padding = getScreenPadding();
  return Math.min(SCREEN_WIDTH - padding * 2, max);
}

/**
 * Calculate horizontal margin for centered content
 */
export function getCenteredMargin(type: ContentWidth = 'wide'): number {
  const contentWidth = getContentWidth(type);
  const availableWidth = SCREEN_WIDTH - getScreenPadding() * 2;
  return Math.max(0, (availableWidth - contentWidth) / 2);
}

// ============================================
// Container Styles
// ============================================

/**
 * Common container style presets
 */
export const containerStyles = {
  /**
   * Full-width screen container with appropriate padding
   */
  screen: {
    flex: 1,
    paddingHorizontal: getScreenPadding(),
  },

  /**
   * Centered content container (for tablets/desktop)
   */
  centered: {
    flex: 1,
    paddingHorizontal: getScreenPadding(),
    ...(isTablet() && {
      maxWidth: maxContentWidth.wide,
      alignSelf: 'center' as const,
      width: '100%' as const,
    }),
  },

  /**
   * Narrow content container (for forms, etc.)
   */
  narrow: {
    flex: 1,
    paddingHorizontal: getScreenPadding(),
    ...(isTablet() && {
      maxWidth: maxContentWidth.narrow,
      alignSelf: 'center' as const,
      width: '100%' as const,
    }),
  },

  /**
   * Grid container with gap
   */
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: getGridGap(),
    paddingHorizontal: getScreenPadding(),
  },
};

// ============================================
// Safe Area Helpers
// ============================================

/**
 * Common safe area inset values (fallbacks)
 */
export const safeAreaFallbacks = {
  top: Platform.select({ ios: 44, android: 24, default: 0 }),
  bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  left: 0,
  right: 0,
};

// ============================================
// Orientation Helpers
// ============================================

export type Orientation = 'portrait' | 'landscape';

/**
 * Get current screen orientation
 */
export function getOrientation(): Orientation {
  return SCREEN_HEIGHT >= SCREEN_WIDTH ? 'portrait' : 'landscape';
}

/**
 * Check if in landscape mode
 */
export function isLandscape(): boolean {
  return getOrientation() === 'landscape';
}

/**
 * Check if in portrait mode
 */
export function isPortrait(): boolean {
  return getOrientation() === 'portrait';
}

// ============================================
// Aspect Ratio Helpers
// ============================================

export const aspectRatios = {
  square: 1,
  portrait: 4 / 3,
  landscape: 16 / 9,
  widescreen: 21 / 9,
  golden: 1.618,
} as const;

/**
 * Calculate height from width and aspect ratio
 */
export function getAspectHeight(width: number, ratio: number): number {
  return width / ratio;
}

/**
 * Calculate width from height and aspect ratio
 */
export function getAspectWidth(height: number, ratio: number): number {
  return height * ratio;
}
