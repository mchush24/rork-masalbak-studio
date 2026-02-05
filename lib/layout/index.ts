/**
 * Layout Module
 *
 * Responsive layout system for phones and tablets
 * Provides grid, column, and container utilities
 *
 * @example
 * import { useLayout, useGridLayout, containerStyles } from '@/lib/layout';
 *
 * // Using hooks for reactive updates
 * const { isTablet, columns, padding } = useLayout();
 * const { containerStyle, itemWidth } = useGridLayout({ columns: { xs: 1, md: 2 } });
 */

// Core layout utilities
export {
  // Spacing
  screenPadding,
  getScreenPadding,
  gridGap,
  getGridGap,
  // Columns
  defaultColumns,
  getColumns,
  getColumnWidth,
  // Responsive values
  getResponsiveValue,
  // Content constraints
  maxContentWidth,
  getContentWidth,
  getCenteredMargin,
  // Container styles
  containerStyles,
  // Safe area
  safeAreaFallbacks,
  // Orientation
  getOrientation,
  isLandscape,
  isPortrait,
  // Aspect ratios
  aspectRatios,
  getAspectHeight,
  getAspectWidth,
  // Types
  type ColumnCount,
  type ContentWidth,
  type Orientation,
} from './responsive';

// Hooks for reactive layout
export {
  useLayout,
  useGridLayout,
  useContainerStyle,
  useResponsiveValue,
} from './useResponsiveLayout';

// Re-export breakpoint utilities from typography
export {
  breakpoints,
  getCurrentBreakpoint,
  isTablet,
  isPhone,
  type Breakpoint,
} from '../typography/responsive';
