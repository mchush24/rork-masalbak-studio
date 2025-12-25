/**
 * Component Presets
 *
 * Reusable component style patterns for common UI elements
 */

import { ViewStyle, TextStyle } from "react-native";
import { spacing, typography, radius, shadows } from "./design-system";
import { Colors } from "./colors";

// ============================================
// BUTTON PRESETS
// ============================================

export const buttonPresets = {
  // Primary gradient button
  primary: {
    container: {
      borderRadius: radius.lg,
      overflow: "hidden",
      ...shadows.lg,
    } as ViewStyle,
    gradient: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: spacing["2"],
      paddingVertical: spacing["4"],
      paddingHorizontal: spacing["6"],
    } as ViewStyle,
    text: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: Colors.neutral.white,
    } as TextStyle,
  },

  // Secondary outline button
  secondary: {
    container: {
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: Colors.neutral.light,
      backgroundColor: Colors.neutral.white,
      ...shadows.sm,
    } as ViewStyle,
    inner: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: spacing["2"],
      paddingVertical: spacing["4"],
      paddingHorizontal: spacing["6"],
    } as ViewStyle,
    text: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: Colors.neutral.darkest,
    } as TextStyle,
  },

  // Ghost button (no background)
  ghost: {
    container: {
      borderRadius: radius.lg,
    } as ViewStyle,
    inner: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: spacing["2"],
      paddingVertical: spacing["3"],
      paddingHorizontal: spacing["5"],
    } as ViewStyle,
    text: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: Colors.neutral.dark,
    } as TextStyle,
  },

  // Icon button
  icon: {
    container: {
      width: 48,
      height: 48,
      borderRadius: radius.full,
      backgroundColor: Colors.neutral.white,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      ...shadows.md,
    } as ViewStyle,
  },

  // Small button
  small: {
    container: {
      borderRadius: radius.md,
      overflow: "hidden",
      ...shadows.sm,
    } as ViewStyle,
    gradient: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: spacing["1"],
      paddingVertical: spacing["2"],
      paddingHorizontal: spacing["4"],
    } as ViewStyle,
    text: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: Colors.neutral.white,
    } as TextStyle,
  },
} as const;

// ============================================
// INPUT PRESETS
// ============================================

export const inputPresets = {
  default: {
    container: {
      marginBottom: spacing["4"],
    } as ViewStyle,
    label: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: Colors.neutral.darkest,
      marginBottom: spacing["2"],
    } as TextStyle,
    input: {
      backgroundColor: Colors.neutral.white,
      borderWidth: 2,
      borderColor: Colors.neutral.lighter,
      borderRadius: radius.lg,
      paddingVertical: spacing["3"],
      paddingHorizontal: spacing["4"],
      fontSize: typography.size.base,
      color: Colors.neutral.darkest,
      ...shadows.sm,
    } as ViewStyle & TextStyle,
    error: {
      borderColor: Colors.semantic.error,
    } as ViewStyle,
    errorText: {
      fontSize: typography.size.xs,
      color: Colors.semantic.error,
      marginTop: spacing["1"],
    } as TextStyle,
  },

  search: {
    container: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: Colors.neutral.white,
      borderRadius: radius.full,
      paddingHorizontal: spacing["4"],
      paddingVertical: spacing["3"],
      gap: spacing["2"],
      ...shadows.sm,
    } as ViewStyle,
    input: {
      flex: 1,
      fontSize: typography.size.base,
      color: Colors.neutral.darkest,
    } as TextStyle,
  },
} as const;

// ============================================
// CARD PRESETS
// ============================================

export const cardPresets = {
  // Standard card
  standard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing["5"],
    ...shadows.md,
  } as ViewStyle,

  // Glass card
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: radius.xl,
    padding: spacing["5"],
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...shadows.lg,
  } as ViewStyle,

  // Elevated card
  elevated: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius["2xl"],
    padding: spacing["6"],
    ...shadows.xl,
  } as ViewStyle,

  // Flat card
  flat: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing["4"],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  } as ViewStyle,

  // Gradient card header
  gradientHeader: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing["5"],
    marginBottom: spacing["4"],
  } as ViewStyle,
} as const;

// ============================================
// HEADER PRESETS
// ============================================

export const headerPresets = {
  // Standard screen header
  screen: {
    container: {
      marginBottom: spacing["6"],
    } as ViewStyle,
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginBottom: spacing["4"],
      ...shadows.xl,
    } as ViewStyle,
    title: {
      fontSize: typography.size["4xl"],
      fontWeight: typography.weight.extrabold,
      color: Colors.neutral.darkest,
      marginBottom: spacing["2"],
      letterSpacing: typography.letterSpacing.tight,
      textAlign: "center" as const,
    } as TextStyle,
    subtitle: {
      fontSize: typography.size.md,
      color: Colors.neutral.medium,
      textAlign: "center" as const,
      lineHeight: typography.size.md * typography.lineHeight.normal,
    } as TextStyle,
  },

  // Inline header (with back button)
  inline: {
    container: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing["4"],
      marginBottom: spacing["6"],
    } as ViewStyle,
    backButton: {
      width: 40,
      height: 40,
      borderRadius: radius.lg,
      backgroundColor: Colors.neutral.white,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      ...shadows.md,
    } as ViewStyle,
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: radius.xl,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      ...shadows.lg,
    } as ViewStyle,
    textContainer: {
      flex: 1,
    } as ViewStyle,
    title: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.extrabold,
      color: Colors.neutral.darkest,
      marginBottom: spacing["1"],
      letterSpacing: typography.letterSpacing.tight,
    } as TextStyle,
    subtitle: {
      fontSize: typography.size.sm,
      color: Colors.neutral.medium,
      fontWeight: typography.weight.medium,
    } as TextStyle,
  },
} as const;

// ============================================
// LIST ITEM PRESETS
// ============================================

export const listItemPresets = {
  // Standard list item
  standard: {
    container: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      padding: spacing["4"],
      backgroundColor: Colors.neutral.white,
      borderRadius: radius.lg,
      marginBottom: spacing["3"],
      ...shadows.sm,
    } as ViewStyle,
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: spacing["3"],
    } as ViewStyle,
    content: {
      flex: 1,
    } as ViewStyle,
    title: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: Colors.neutral.darkest,
      marginBottom: spacing["1"],
    } as TextStyle,
    subtitle: {
      fontSize: typography.size.sm,
      color: Colors.neutral.medium,
    } as TextStyle,
    chevron: {
      marginLeft: spacing["2"],
    } as ViewStyle,
  },

  // Compact list item
  compact: {
    container: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: spacing["3"],
      paddingHorizontal: spacing["4"],
      borderBottomWidth: 1,
      borderBottomColor: Colors.neutral.lightest,
    } as ViewStyle,
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: spacing["3"],
    } as ViewStyle,
    content: {
      flex: 1,
    } as ViewStyle,
    title: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: Colors.neutral.darkest,
    } as TextStyle,
  },
} as const;

// ============================================
// MODAL PRESETS
// ============================================

export const modalPresets = {
  // Bottom sheet modal
  bottomSheet: {
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end" as const,
    } as ViewStyle,
    content: {
      backgroundColor: Colors.neutral.white,
      borderTopLeftRadius: radius["2xl"],
      borderTopRightRadius: radius["2xl"],
      padding: spacing["6"],
      ...shadows.xl,
    } as ViewStyle,
    handle: {
      width: 40,
      height: 4,
      backgroundColor: Colors.neutral.light,
      borderRadius: radius.full,
      alignSelf: "center" as const,
      marginBottom: spacing["4"],
    } as ViewStyle,
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: spacing["6"],
    } as ViewStyle,
    title: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.extrabold,
      color: Colors.neutral.darkest,
    } as TextStyle,
  },

  // Center modal
  center: {
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: spacing["6"],
    } as ViewStyle,
    content: {
      backgroundColor: Colors.neutral.white,
      borderRadius: radius["2xl"],
      padding: spacing["6"],
      width: "100%",
      maxWidth: 400,
      ...shadows.xl,
    } as ViewStyle,
    header: {
      alignItems: "center" as const,
      marginBottom: spacing["6"],
    } as ViewStyle,
    title: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.extrabold,
      color: Colors.neutral.darkest,
      textAlign: "center" as const,
    } as TextStyle,
  },
} as const;

// ============================================
// BADGE PRESETS
// ============================================

export const badgePresets = {
  // Solid badge
  solid: (color: string) => ({
    container: {
      paddingHorizontal: spacing["3"],
      paddingVertical: spacing["1"],
      borderRadius: radius.full,
      backgroundColor: color,
    } as ViewStyle,
    text: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.bold,
      color: Colors.neutral.white,
    } as TextStyle,
  }),

  // Outlined badge
  outlined: (color: string) => ({
    container: {
      paddingHorizontal: spacing["3"],
      paddingVertical: spacing["1"],
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: color,
      backgroundColor: "transparent",
    } as ViewStyle,
    text: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.bold,
      color: color,
    } as TextStyle,
  }),

  // Soft badge (light background)
  soft: (color: string, backgroundColor: string) => ({
    container: {
      paddingHorizontal: spacing["3"],
      paddingVertical: spacing["1"],
      borderRadius: radius.full,
      backgroundColor: backgroundColor,
    } as ViewStyle,
    text: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.bold,
      color: color,
    } as TextStyle,
  }),
} as const;

// ============================================
// EMPTY STATE PRESETS
// ============================================

export const emptyStatePresets = {
  default: {
    container: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingVertical: spacing["10"],
      paddingHorizontal: spacing["8"],
    } as ViewStyle,
    iconContainer: {
      marginBottom: spacing["4"],
    } as ViewStyle,
    title: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: Colors.neutral.dark,
      textAlign: "center" as const,
      marginBottom: spacing["2"],
    } as TextStyle,
    description: {
      fontSize: typography.size.base,
      color: Colors.neutral.medium,
      textAlign: "center" as const,
      lineHeight: typography.size.base * typography.lineHeight.relaxed,
    } as TextStyle,
  },
} as const;

// ============================================
// EXPORT ALL
// ============================================

export default {
  buttonPresets,
  inputPresets,
  cardPresets,
  headerPresets,
  listItemPresets,
  modalPresets,
  badgePresets,
  emptyStatePresets,
};
