/**
 * Renkioo Design System 2.0
 *
 * Şahane bir çocuk uygulaması için profesyonel tasarım sistemi
 * İlham: Apple HIG, Material Design, Duolingo, Khan Academy Kids
 */

import { Dimensions, Platform } from "react-native";
import { Colors } from "./colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// LAYOUT SYSTEM
// ============================================
export const layout = {
  // Screen padding
  screenPadding: 20,
  screenPaddingSmall: 16,

  // Grid system (2 column)
  gridGap: 16,
  columnWidth: (SCREEN_WIDTH - 20 * 2 - 16) / 2, // (screen - padding - gap) / 2

  // Card sizes
  card: {
    hero: {
      width: SCREEN_WIDTH - 40,
      minHeight: 240,
    },
    feature: {
      width: (SCREEN_WIDTH - 40 - 16) / 2,
      minHeight: 180,
    },
    small: {
      width: (SCREEN_WIDTH - 40 - 16) / 2,
      minHeight: 120,
    },
  },

  // Icon sizes
  icon: {
    tiny: 16,
    small: 24,
    medium: 32,
    large: 48,
    huge: 80,
    mega: 120,
  },

  // Avatar sizes
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
};

// ============================================
// TYPOGRAPHY SYSTEM (Enhanced)
// ============================================
export const typography = {
  // Font families
  family: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
    extrabold: "System",
  },

  // Size scale
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 32,
    "4xl": 40,
    "5xl": 48,
    hero: 56,
  },

  // Weight scale
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
    black: "900" as const,
  },

  // Line height multipliers (for calculating: fontSize * multiplier)
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Pre-calculated line heights in pixels (for direct use, based on common font sizes)
  lineHeightPx: {
    xs: 16,    // for 11px font
    sm: 20,    // for 13px font
    base: 24,  // for 15px font
    md: 26,    // for 17px font
    lg: 30,    // for 20px font
    xl: 36,    // for 24px font
  },

  // Letter spacing
  letterSpacing: {
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// ============================================
// SPACING SYSTEM (8pt grid)
// ============================================
export const spacing = {
  "0": 0,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
  "20": 80,
  "24": 96,
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

// ============================================
// SHADOWS & ELEVATION
// React Native Web uses boxShadow, native uses shadow* props
// ============================================
export const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color: string = "#000"
) => {
  const nativeShadow = {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };

  // On web, use boxShadow instead of deprecated shadow* props
  if (Platform.OS === "web") {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
    return {
      boxShadow: `0px ${offsetY}px ${blur}px ${color}${alpha}`,
      elevation,
    };
  }

  return nativeShadow;
};

export const shadows = {
  none: Platform.OS === "web"
    ? { boxShadow: "none", elevation: 0 }
    : {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
  xs: createShadow(1, 2, 0.05, 1),
  sm: createShadow(2, 4, 0.08, 2),
  md: createShadow(4, 8, 0.12, 4),
  lg: createShadow(8, 16, 0.15, 8),
  xl: createShadow(12, 24, 0.2, 12),
  colored: (color: string) => {
    if (Platform.OS === "web") {
      return {
        boxShadow: `0px 4px 12px ${color}4D`, // 0.3 opacity = 4D in hex
        elevation: 6,
      };
    }
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    };
  },
};

// ============================================
// TEXT SHADOWS
// React Native Web uses textShadow CSS property
// ============================================
export const createTextShadow = (
  offsetX: number,
  offsetY: number,
  blur: number,
  color: string
) => {
  if (Platform.OS === "web") {
    return {
      textShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}`,
    };
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: blur,
  };
};

export const textShadows = {
  none: Platform.OS === "web"
    ? { textShadow: "none" }
    : { textShadowColor: "transparent", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 0 },
  sm: createTextShadow(0, 1, 2, "rgba(0,0,0,0.1)"),
  md: createTextShadow(0, 2, 4, "rgba(0,0,0,0.15)"),
  lg: createTextShadow(0, 2, 8, "rgba(0,0,0,0.2)"),
  hero: createTextShadow(0, 2, 10, "rgba(0,0,0,0.2)"),
};

// ============================================
// ANIMATION TIMINGS
// ============================================
export const animation = {
  // Duration (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 600,
    slowest: 800,
  },

  // Easing curves
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { tension: 300, friction: 20 },
    bounce: { tension: 180, friction: 12 },
  },

  // Spring configs
  spring: {
    gentle: { tension: 120, friction: 14 },
    bouncy: { tension: 180, friction: 12 },
    snappy: { tension: 300, friction: 20 },
  },
} as const;

// ============================================
// GLASSMORPHISM STYLES
// ============================================
export const glassmorphism = {
  light: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...shadows.md,
  },
  medium: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    ...shadows.lg,
  },
  dark: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...shadows.md,
  },
} as const;

// ============================================
// NEUMORPHISM STYLES
// ============================================
export const neumorphism = {
  raised: Platform.OS === "web"
    ? {
        backgroundColor: Colors.background.primary,
        boxShadow: "4px 4px 8px #0000001A", // 0.1 opacity
        elevation: 4,
      }
    : {
        backgroundColor: Colors.background.primary,
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
  pressed: Platform.OS === "web"
    ? {
        backgroundColor: Colors.background.primary,
        boxShadow: "-2px -2px 4px #0000000D", // 0.05 opacity
        elevation: 1,
      }
    : {
        backgroundColor: Colors.background.primary,
        shadowColor: "#000",
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
};

// ============================================
// Z-INDEX LAYERS
// ============================================
export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
} as const;

// ============================================
// INTERACTION STATES
// ============================================
export const interaction = {
  press: {
    scale: 0.96,
    opacity: 0.8,
  },
  hover: {
    scale: 1.02,
    elevation: shadows.lg,
  },
  disabled: {
    opacity: 0.4,
  },
  loading: {
    opacity: 0.6,
  },
} as const;

// ============================================
// CARD VARIANTS
// ============================================
export const cardVariants = {
  hero: {
    padding: spacing["8"],
    borderRadius: radius["2xl"],
    minHeight: layout.card.hero.minHeight,
    ...shadows.xl,
  },
  feature: {
    padding: spacing["6"],
    borderRadius: radius.xl,
    minHeight: layout.card.feature.minHeight,
    ...shadows.lg,
  },
  small: {
    padding: spacing["4"],
    borderRadius: radius.lg,
    minHeight: layout.card.small.minHeight,
    ...shadows.md,
  },
  flat: {
    padding: spacing["4"],
    borderRadius: radius.md,
    ...shadows.none,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
} as const;

// ============================================
// BADGE STYLES
// ============================================
export const badgeStyles = {
  default: {
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
  },
  primary: {
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: radius.full,
    backgroundColor: Colors.primary.sunset,
  },
  success: {
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: radius.full,
    backgroundColor: Colors.semantic.success,
  },
  gradient: (colors: string[]) => ({
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: radius.full,
  }),
} as const;

// ============================================
// CHIP STYLES (Quick Actions)
// ============================================
export const chipStyles = {
  default: {
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    ...shadows.sm,
  },
  selected: {
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    backgroundColor: Colors.primary.sunset,
    ...shadows.md,
  },
} as const;

// ============================================
// EMPTY STATE STYLES
// ============================================
export const emptyState = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["8"],
  },
  iconSize: layout.icon.mega,
  iconColor: Colors.neutral.light,
  titleSize: typography.size["2xl"],
  descriptionSize: typography.size.base,
} as const;

export default {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  createShadow,
  textShadows,
  createTextShadow,
  animation,
  glassmorphism,
  neumorphism,
  zIndex,
  interaction,
  cardVariants,
  badgeStyles,
  chipStyles,
  emptyState,
};
