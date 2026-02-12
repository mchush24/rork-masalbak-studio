/**
 * useResponsive Hook
 *
 * Custom hook for responsive design values based on screen dimensions
 */

import { useWindowDimensions } from 'react-native';
import { spacing, typography, layout } from '@/constants/design-system';

// ============================================
// BREAKPOINTS & RESPONSIVE UTILITIES
// (Previously in design-utilities.ts)
// ============================================
const breakpoints = {
  xs: 0,
  sm: 380,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

const isSmallScreen = (width: number) => width < breakpoints.sm;
const isMediumScreen = (width: number) => width >= breakpoints.md;
const isLargeScreen = (width: number) => width >= breakpoints.lg;

const getResponsivePadding = (width: number) => (isSmallScreen(width) ? 16 : 20);

const getResponsiveValue = <T>(
  width: number,
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T; default: T }
): T => {
  if (width >= breakpoints.xl && values.xl !== undefined) return values.xl;
  if (width >= breakpoints.lg && values.lg !== undefined) return values.lg;
  if (width >= breakpoints.md && values.md !== undefined) return values.md;
  if (width >= breakpoints.sm && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  return values.default;
};

const getResponsiveSpacing = (
  width: number,
  smallValue: keyof typeof spacing,
  largeValue: keyof typeof spacing
) => (isSmallScreen(width) ? spacing[smallValue] : spacing[largeValue]);

const getResponsiveFontSize = (
  width: number,
  smallSize: keyof typeof typography.size,
  largeSize: keyof typeof typography.size
) => (isSmallScreen(width) ? typography.size[smallSize] : typography.size[largeSize]);

const getResponsiveIconSize = (width: number, smallSize: number, largeSize: number) =>
  isSmallScreen(width) ? smallSize : largeSize;

// ============================================
// HOOKS
// ============================================

/**
 * Hook to get responsive values based on current screen width
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return {
    // Screen dimensions
    width,
    height,

    // Breakpoint checks
    isXs: width < breakpoints.sm,
    isSm: width >= breakpoints.sm && width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl,

    // Helper checks
    isSmallScreen: isSmallScreen(width),
    isMediumScreen: isMediumScreen(width),
    isLargeScreen: isLargeScreen(width),

    // Responsive values
    screenPadding: getResponsivePadding(width),

    // Helper functions bound to current width
    getValue: <T>(values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T; default: T }) =>
      getResponsiveValue(width, values),

    getSpacing: (smallValue: keyof typeof spacing, largeValue: keyof typeof spacing) =>
      getResponsiveSpacing(width, smallValue, largeValue),

    getFontSize: (
      smallSize: keyof typeof typography.size,
      largeSize: keyof typeof typography.size
    ) => getResponsiveFontSize(width, smallSize, largeSize),

    getIconSize: (smallSize: number, largeSize: number) =>
      getResponsiveIconSize(width, smallSize, largeSize),
  };
};

/**
 * Hook to get responsive layout values
 */
export const useResponsiveLayout = () => {
  const { width, isSmallScreen: small } = useResponsive();

  return {
    // Grid columns
    gridColumns: small ? 2 : width >= breakpoints.lg ? 4 : 3,

    // Card sizes
    cardPadding: small ? spacing['4'] : spacing['6'],
    cardRadius: small ? spacing['4'] : spacing['5'],

    // Icon sizes
    iconTiny: small ? 14 : layout.icon.tiny,
    iconSmall: small ? 20 : layout.icon.small,
    iconMedium: small ? 28 : layout.icon.medium,
    iconLarge: small ? 40 : layout.icon.large,
    iconHuge: small ? 64 : layout.icon.huge,

    // Avatar sizes
    avatarSmall: small ? 28 : layout.avatar.small,
    avatarMedium: small ? 40 : layout.avatar.medium,
    avatarLarge: small ? 56 : layout.avatar.large,
    avatarXLarge: small ? 80 : layout.avatar.xlarge,

    // Button heights
    buttonSmall: small ? 36 : 40,
    buttonMedium: small ? 44 : 48,
    buttonLarge: small ? 52 : 56,
  };
};

/**
 * Hook for responsive typography
 */
export const useResponsiveTypography = () => {
  const { isSmallScreen: small } = useResponsive();

  return {
    // Headings
    h1: small ? typography.size['3xl'] : typography.size['4xl'],
    h2: small ? typography.size['2xl'] : typography.size['3xl'],
    h3: small ? typography.size.xl : typography.size['2xl'],
    h4: small ? typography.size.lg : typography.size.xl,
    h5: small ? typography.size.md : typography.size.lg,

    // Body text
    bodyLarge: small ? typography.size.base : typography.size.md,
    body: typography.size.base,
    bodySmall: small ? typography.size.xs : typography.size.sm,

    // UI text
    caption: typography.size.xs,
    label: small ? typography.size.xs : typography.size.sm,
    button: small ? typography.size.sm : typography.size.base,
  };
};

/**
 * Simple hook to check if device is small screen
 */
export const useIsSmallScreen = (): boolean => {
  const { width } = useWindowDimensions();
  return isSmallScreen(width);
};

/**
 * Simple hook to get screen padding
 */
export const useScreenPadding = (): number => {
  const { width } = useWindowDimensions();
  return getResponsivePadding(width);
};
