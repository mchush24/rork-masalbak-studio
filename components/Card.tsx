import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  PressableStateCallbackType,
} from "react-native";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows } from "@/constants/tokens";

export type CardVariant = "default" | "elevated" | "outlined" | "filled";
export type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  /** Card content */
  children: React.ReactNode;

  /** Visual variant */
  variant?: CardVariant;

  /** Padding size */
  padding?: CardPadding;

  /** Make card pressable */
  onPress?: () => void;

  /** Custom style */
  style?: ViewStyle;

  /** Disabled state (only applies if onPress is provided) */
  disabled?: boolean;

  /** Top border color accent */
  accentColor?: string;

  /** Accent border width */
  accentWidth?: number;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  onPress,
  style,
  disabled = false,
  accentColor,
  accentWidth = 4,
}: CardProps) {
  const getCardStyle = (pressed?: boolean): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [
      styles.card,
      styles[`card_${variant}`],
      padding !== "none" && styles[`padding_${padding}`],
    ];

    if (accentColor) {
      baseStyles.push({
        borderTopWidth: accentWidth,
        borderTopColor: accentColor,
      });
    }

    if (onPress && !disabled && pressed) {
      baseStyles.push(styles.pressed);
    }

    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }: PressableStateCallbackType) => getCardStyle(pressed)}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    // Smooth press animation
    transition: "all 200ms ease",
  },
  card_default: {
    ...shadows.sm,
  },
  card_elevated: {
    ...shadows.lg,
  },
  card_outlined: {
    borderWidth: 2,
    borderColor: Colors.neutral.light,
    ...shadows.none,
  },
  card_filled: {
    backgroundColor: Colors.background.primary,
    ...shadows.none,
  },
  padding_sm: {
    padding: spacing.md,
  },
  padding_md: {
    padding: spacing.xl,
  },
  padding_lg: {
    padding: spacing["2xl"],
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
    ...shadows.md,
  },
  disabled: {
    opacity: 0.5,
  },
});
