/**
 * Design Tokens - Renkioo Design System
 * Tüm uygulama boyunca tutarlı tasarım için merkezi token tanımları
 */

import { Colors } from "./colors";

// ============================================
// SPACING SCALE (8px base)
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

// ============================================
// TYPOGRAPHY SCALE
// ============================================
export const typography = {
  // Font Sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 40,
  },

  // Font Weights
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },

  // Line Heights (relative to font size)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.2,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// ============================================
// BORDER RADIUS SCALE
// ============================================
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

// ============================================
// SHADOW SCALE
// ============================================
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

// ============================================
// ANIMATION DURATIONS
// ============================================
export const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// ============================================
// BUTTON VARIANTS
// ============================================
export const buttonVariants = {
  primary: {
    backgroundColor: Colors.primary.sunset,
    color: Colors.neutral.white,
  },
  secondary: {
    backgroundColor: Colors.secondary.sky,
    color: Colors.neutral.white,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: Colors.neutral.medium,
    borderWidth: 1,
    color: Colors.neutral.darkest,
  },
  ghost: {
    backgroundColor: "transparent",
    color: Colors.primary.sunset,
  },
  danger: {
    backgroundColor: Colors.semantic.error,
    color: Colors.neutral.white,
  },
  success: {
    backgroundColor: Colors.secondary.grass,
    color: Colors.neutral.white,
  },
} as const;

// ============================================
// SEMANTIC COLORS (For Specific Use Cases)
// ============================================
export const semantic = {
  // Status Colors - Yumuşak ve çocuk dostu tonlar
  success: Colors.semantic.success,
  successLight: Colors.semantic.successLight,
  warning: Colors.semantic.warning,
  warningLight: Colors.semantic.warningLight,
  error: Colors.semantic.error,
  errorLight: Colors.semantic.errorLight,
  info: Colors.semantic.info,
  infoLight: Colors.semantic.infoLight,

  // Risk Levels
  risk: Colors.special.risk,
} as const;

// ============================================
// LAYOUT CONSTANTS
// ============================================
export const layout = {
  // Container padding
  containerPadding: spacing.xl,

  // Max widths
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
  },

  // Card heights
  cardHeight: {
    sm: 120,
    md: 180,
    lg: 240,
  },
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
} as const;

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================
export const breakpoints = {
  xs: 0,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// ============================================
// TYPE HELPERS
// ============================================
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type ButtonVariant = keyof typeof buttonVariants;
