import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  PressableStateCallbackType,
} from "react-native";
import { Colors } from "@/constants/colors";
import { spacing, typography, radius, shadows, buttonVariants } from "@/constants/tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  /** Button text label */
  children: string;

  /** Button click handler */
  onPress: () => void;

  /** Visual style variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Disabled state */
  disabled?: boolean;

  /** Loading state - shows spinner */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Optional icon to display before text */
  icon?: React.ReactNode;

  /** Custom style override */
  style?: ViewStyle;

  /** Custom text style override */
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = ({ pressed }: PressableStateCallbackType): ViewStyle[] => {
    const variantStyle = buttonVariants[variant];
    const baseStyles: ViewStyle[] = [
      styles.button,
      styles[`button_${size}`],
      {
        backgroundColor: variantStyle.backgroundColor,
        ...('borderColor' in variantStyle && variantStyle.borderColor ? { borderColor: variantStyle.borderColor } : {}),
        ...('borderWidth' in variantStyle && variantStyle.borderWidth ? { borderWidth: variantStyle.borderWidth } : {}),
      },
    ];

    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    if (isDisabled) {
      baseStyles.push(styles.disabled);
    } else if (pressed) {
      baseStyles.push(styles.pressed);
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      return Colors.neutral.medium;
    }
    return buttonVariants[variant].color || Colors.neutral.white;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={getButtonStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={styles.spinner}
          />
        ) : (
          icon && <View style={styles.iconContainer}>{icon}</View>
        )}
        <Text
          style={[
            styles.text,
            styles[`text_${size}`],
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    ...shadows.sm,
  },
  button_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
  },
  button_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
  },
  button_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing["2xl"],
    minHeight: 52,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
    ...shadows.none,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  spinner: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: "center",
  },
  text_sm: {
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * typography.lineHeight.tight,
  },
  text_md: {
    fontSize: typography.size.base,
    lineHeight: typography.size.base * typography.lineHeight.tight,
  },
  text_lg: {
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * typography.lineHeight.tight,
  },
});
