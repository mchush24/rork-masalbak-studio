/**
 * Typography Module
 *
 * Responsive typography system with automatic scaling
 * based on screen dimensions and device type
 *
 * @example
 * import { useTypography, textStyles, normalize } from '@/lib/typography';
 *
 * // Using hook for reactive updates
 * const { fontSizes, isTablet } = useTypography();
 *
 * // Using presets directly
 * <Text style={textStyles.headingLarge}>Title</Text>
 *
 * // Custom normalization
 * const customSize = normalize(18);
 */

// Core responsive utilities
export {
  // Breakpoints
  breakpoints,
  getCurrentBreakpoint,
  isTablet,
  isPhone,
  // Font sizing
  normalize,
  normalizeAccessible,
  responsiveFontSizes,
  responsiveLineHeights,
  getLineHeight,
  // Text style presets
  textStyles,
  // Utility functions
  getResponsiveSize,
  createResponsiveTextStyle,
  // Types
  type Breakpoint,
  type FontSize,
  type FontWeight,
  type TextStyleName,
} from './responsive';

// Hooks for reactive typography
export {
  useTypography,
  useTextStyle,
  useFontSize,
  useResponsiveLayout,
} from './useTypography';
