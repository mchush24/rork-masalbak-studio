/**
 * Renkioo Design System Utilities
 *
 * Helper functions and utilities for working with the design system
 */

import { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { spacing, typography, radius, shadows, layout } from "./design-system";
import { Colors } from "./colors";

// ============================================
// RESPONSIVE UTILITIES
// ============================================

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  xs: 320,
  sm: 380,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Get responsive value based on screen width
 * @param width - Current screen width
 * @param values - Values for different breakpoints
 */
export const getResponsiveValue = <T,>(
  width: number,
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }
): T => {
  if (width >= breakpoints.xl && values.xl !== undefined) return values.xl;
  if (width >= breakpoints.lg && values.lg !== undefined) return values.lg;
  if (width >= breakpoints.md && values.md !== undefined) return values.md;
  if (width >= breakpoints.sm && values.sm !== undefined) return values.sm;
  if (width >= breakpoints.xs && values.xs !== undefined) return values.xs;
  return values.default;
};

/**
 * Check if screen is small (< 380px)
 */
export const isSmallScreen = (width: number): boolean => width < breakpoints.sm;

/**
 * Check if screen is medium (>= 768px)
 */
export const isMediumScreen = (width: number): boolean => width >= breakpoints.md;

/**
 * Check if screen is large (>= 1024px)
 */
export const isLargeScreen = (width: number): boolean => width >= breakpoints.lg;

/**
 * Get responsive padding based on screen size
 */
export const getResponsivePadding = (width: number): number => {
  return isSmallScreen(width) ? spacing["4"] : layout.screenPadding;
};

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (
  width: number,
  smallValue: keyof typeof spacing,
  largeValue: keyof typeof spacing
): number => {
  return isSmallScreen(width) ? spacing[smallValue] : spacing[largeValue];
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (
  width: number,
  smallSize: keyof typeof typography.size,
  largeSize: keyof typeof typography.size
): number => {
  return isSmallScreen(width) ? typography.size[smallSize] : typography.size[largeSize];
};

/**
 * Get responsive icon size
 */
export const getResponsiveIconSize = (
  width: number,
  smallSize: number,
  largeSize: number
): number => {
  return isSmallScreen(width) ? smallSize : largeSize;
};

// ============================================
// STYLE COMPOSITION UTILITIES
// ============================================

/**
 * Combine multiple style objects conditionally
 */
export const composeStyles = <T extends ViewStyle | TextStyle | ImageStyle>(
  ...styles: (T | false | undefined | null)[]
): T => {
  return Object.assign(
    {},
    ...styles.filter(Boolean)
  ) as T;
};

/**
 * Apply style conditionally
 */
export const conditionalStyle = <T extends ViewStyle | TextStyle | ImageStyle>(
  condition: boolean,
  style: T
): T | undefined => {
  return condition ? style : undefined;
};

// ============================================
// COMMON STYLE PATTERNS
// ============================================

/**
 * Flex utilities
 */
export const flex = {
  center: {
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  row: {
    flexDirection: "row",
  } as ViewStyle,
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  column: {
    flexDirection: "column",
  } as ViewStyle,
  columnCenter: {
    flexDirection: "column",
    alignItems: "center",
  } as ViewStyle,
  wrap: {
    flexWrap: "wrap",
  } as ViewStyle,
} as const;

/**
 * Create glassmorphism style with custom opacity
 */
export const createGlassmorphism = (
  opacity: number = 0.7,
  borderOpacity: number = 0.3,
  isDark: boolean = false
): ViewStyle => ({
  backgroundColor: isDark
    ? `rgba(0, 0, 0, ${opacity})`
    : `rgba(255, 255, 255, ${opacity})`,
  borderWidth: 1,
  borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
  ...shadows.md,
});

/**
 * Create gradient-ready container style
 */
export const createGradientContainer = (
  paddingSize: keyof typeof spacing = "6",
  borderRadiusSize: keyof typeof radius = "2xl"
): ViewStyle => ({
  padding: spacing[paddingSize],
  borderRadius: radius[borderRadiusSize],
  overflow: "hidden",
});

/**
 * Create card style with custom shadow
 */
export const createCard = (
  shadowSize: keyof typeof shadows = "md",
  paddingSize: keyof typeof spacing = "5",
  borderRadiusSize: keyof typeof radius = "xl"
): ViewStyle => ({
  backgroundColor: Colors.neutral.white,
  padding: spacing[paddingSize],
  borderRadius: radius[borderRadiusSize],
  ...shadows[shadowSize],
});

/**
 * Create pill/badge style
 */
export const createBadge = (
  backgroundColor: string,
  textColor: string = Colors.neutral.white
): { container: ViewStyle; text: TextStyle } => ({
  container: {
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: radius.full,
    backgroundColor,
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: textColor,
  },
});

/**
 * Create circular icon container
 */
export const createIconContainer = (
  size: number,
  backgroundColor: string
): ViewStyle => ({
  width: size,
  height: size,
  borderRadius: radius.full,
  backgroundColor,
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Text style presets
 */
export const textStyles = {
  h1: {
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
  } as TextStyle,
  h2: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
  } as TextStyle,
  h3: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  } as TextStyle,
  h4: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  } as TextStyle,
  body: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    color: Colors.neutral.dark,
    lineHeight: typography.size.base * typography.lineHeight.normal,
  } as TextStyle,
  bodySmall: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  } as TextStyle,
  caption: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
  } as TextStyle,
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  } as TextStyle,
  button: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  } as TextStyle,
} as const;

// ============================================
// ANIMATION HELPERS
// ============================================

/**
 * Create press animation style
 */
export const createPressStyle = (pressed: boolean): ViewStyle => ({
  opacity: pressed ? 0.8 : 1,
  transform: [{ scale: pressed ? 0.98 : 1 }],
});

/**
 * Create hover animation style
 */
export const createHoverStyle = (hovered: boolean): ViewStyle => ({
  transform: [{ scale: hovered ? 1.02 : 1 }],
});

// ============================================
// BORDER UTILITIES
// ============================================

/**
 * Create border style
 */
export const createBorder = (
  width: number = 1,
  color: string = Colors.neutral.lighter,
  radiusSize: keyof typeof radius = "lg"
): ViewStyle => ({
  borderWidth: width,
  borderColor: color,
  borderRadius: radius[radiusSize],
});

/**
 * Create bottom border only
 */
export const bottomBorder = (
  width: number = 1,
  color: string = Colors.neutral.lighter
): ViewStyle => ({
  borderBottomWidth: width,
  borderBottomColor: color,
});

/**
 * Create top border only
 */
export const topBorder = (
  width: number = 1,
  color: string = Colors.neutral.lighter
): ViewStyle => ({
  borderTopWidth: width,
  borderTopColor: color,
});

// ============================================
// POSITION UTILITIES
// ============================================

/**
 * Absolute positioning presets
 */
export const position = {
  absolute: {
    position: "absolute",
  } as ViewStyle,
  absoluteFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  } as ViewStyle,
  absoluteTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  } as ViewStyle,
  absoluteBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  } as ViewStyle,
  absoluteCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  } as ViewStyle,
} as const;

// ============================================
// SAFE AREA UTILITIES
// ============================================

/**
 * Create content container with safe area padding
 */
export const createSafeAreaContainer = (
  topInset: number,
  bottomInset: number,
  additionalTop: number = 16,
  additionalBottom: number = 24
): ViewStyle => ({
  paddingTop: topInset + additionalTop,
  paddingBottom: bottomInset + additionalBottom,
});

// ============================================
// GRID UTILITIES
// ============================================

/**
 * Create grid item style
 */
export const createGridItem = (
  columns: 2 | 3 | 4,
  gap: keyof typeof spacing = "3"
): ViewStyle => {
  const gapValue = spacing[gap];
  return {
    flex: 1,
    minWidth: `${100 / columns - gapValue}%` as any,
    maxWidth: `${100 / columns - gapValue}%` as any,
  };
};

/**
 * Create grid container style
 */
export const createGridContainer = (
  gap: keyof typeof spacing = "3"
): ViewStyle => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing[gap],
});

// ============================================
// EXPORT ALL
// ============================================

export default {
  breakpoints,
  getResponsiveValue,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  getResponsivePadding,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveIconSize,
  composeStyles,
  conditionalStyle,
  flex,
  createGlassmorphism,
  createGradientContainer,
  createCard,
  createBadge,
  createIconContainer,
  textStyles,
  createPressStyle,
  createHoverStyle,
  createBorder,
  bottomBorder,
  topBorder,
  position,
  createSafeAreaContainer,
  createGridItem,
  createGridContainer,
};
