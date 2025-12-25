/**
 * useResponsive Hook
 *
 * Custom hook for responsive design values based on screen dimensions
 */

import { useWindowDimensions } from "react-native";
import {
  breakpoints,
  getResponsiveValue,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  getResponsivePadding,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveIconSize,
} from "@/constants/design-utilities";
import { spacing, typography, layout } from "@/constants/design-system";

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
    getValue: <T,>(values: {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      default: T;
    }) => getResponsiveValue(width, values),

    getSpacing: (
      smallValue: keyof typeof spacing,
      largeValue: keyof typeof spacing
    ) => getResponsiveSpacing(width, smallValue, largeValue),

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
  const { width, isSmallScreen } = useResponsive();

  return {
    // Grid columns
    gridColumns: isSmallScreen ? 2 : width >= breakpoints.lg ? 4 : 3,

    // Card sizes
    cardPadding: isSmallScreen ? spacing["4"] : spacing["6"],
    cardRadius: isSmallScreen ? spacing["4"] : spacing["5"],

    // Icon sizes
    iconTiny: isSmallScreen ? 14 : layout.icon.tiny,
    iconSmall: isSmallScreen ? 20 : layout.icon.small,
    iconMedium: isSmallScreen ? 28 : layout.icon.medium,
    iconLarge: isSmallScreen ? 40 : layout.icon.large,
    iconHuge: isSmallScreen ? 64 : layout.icon.huge,

    // Avatar sizes
    avatarSmall: isSmallScreen ? 28 : layout.avatar.small,
    avatarMedium: isSmallScreen ? 40 : layout.avatar.medium,
    avatarLarge: isSmallScreen ? 56 : layout.avatar.large,
    avatarXLarge: isSmallScreen ? 80 : layout.avatar.xlarge,

    // Button heights
    buttonSmall: isSmallScreen ? 36 : 40,
    buttonMedium: isSmallScreen ? 44 : 48,
    buttonLarge: isSmallScreen ? 52 : 56,
  };
};

/**
 * Hook for responsive typography
 */
export const useResponsiveTypography = () => {
  const { isSmallScreen } = useResponsive();

  return {
    // Headings
    h1: isSmallScreen ? typography.size["3xl"] : typography.size["4xl"],
    h2: isSmallScreen ? typography.size["2xl"] : typography.size["3xl"],
    h3: isSmallScreen ? typography.size.xl : typography.size["2xl"],
    h4: isSmallScreen ? typography.size.lg : typography.size.xl,
    h5: isSmallScreen ? typography.size.md : typography.size.lg,

    // Body text
    bodyLarge: isSmallScreen ? typography.size.base : typography.size.md,
    body: typography.size.base,
    bodySmall: isSmallScreen ? typography.size.xs : typography.size.sm,

    // UI text
    caption: typography.size.xs,
    label: isSmallScreen ? typography.size.xs : typography.size.sm,
    button: isSmallScreen ? typography.size.sm : typography.size.base,
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
