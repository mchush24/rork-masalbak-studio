import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/colors";
import { spacing, typography, radius, semantic } from "@/constants/tokens";

export type InputSize = "sm" | "md" | "lg";
export type InputState = "default" | "error" | "success";

interface InputProps extends Omit<TextInputProps, "style"> {
  /** Input label */
  label?: string;

  /** Error message to display */
  error?: string;

  /** Success message to display */
  success?: string;

  /** Helper text */
  helperText?: string;

  /** Input size */
  size?: InputSize;

  /** Full width input */
  fullWidth?: boolean;

  /** Optional icon to display on the left */
  leftIcon?: React.ReactNode;

  /** Optional icon to display on the right */
  rightIcon?: React.ReactNode;

  /** Custom container style */
  containerStyle?: ViewStyle;

  /** Make input required */
  required?: boolean;

  /** Input state */
  state?: InputState;
}

export function Input({
  label,
  error,
  success,
  helperText,
  size = "md",
  fullWidth = true,
  leftIcon,
  rightIcon,
  containerStyle,
  required = false,
  state: controlledState,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Determine state from props
  const state: InputState = controlledState || (error ? "error" : success ? "success" : "default");

  const getBorderColor = () => {
    if (state === "error") return semantic.error;
    if (state === "success") return semantic.success;
    if (isFocused) return Colors.primary.coral;
    return Colors.neutral.medium;
  };

  const getMessage = () => {
    if (error) return { text: error, color: semantic.error };
    if (success) return { text: success, color: semantic.success };
    if (helperText) return { text: helperText, color: Colors.neutral.medium };
    return null;
  };

  const message = getMessage();

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          styles[`inputContainer_${size}`],
          { borderColor: getBorderColor() },
          isFocused && styles.inputContainerFocused,
          state === "error" && styles.inputContainerError,
          textInputProps.editable === false && styles.inputContainerDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            styles[`input_${size}`],
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={Colors.neutral.light}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>

      {message && (
        <Text style={[styles.message, { color: message.color }]}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
  },
  required: {
    color: semantic.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: Colors.neutral.medium,
    // Smooth focus animation
    transition: "border-color 200ms ease",
  },
  inputContainer_sm: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  inputContainer_md: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  inputContainer_lg: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  inputContainerFocused: {
    borderWidth: 2,
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: semantic.error,
    backgroundColor: "#FEF2F2",
  },
  inputContainerDisabled: {
    backgroundColor: Colors.background.primary,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    color: Colors.neutral.darkest,
    paddingVertical: 0, // Remove default padding
  },
  input_sm: {
    fontSize: typography.size.sm,
  },
  input_md: {
    fontSize: typography.size.base,
  },
  input_lg: {
    fontSize: typography.size.lg,
  },
  inputWithLeftIcon: {
    marginLeft: spacing.xs,
  },
  inputWithRightIcon: {
    marginRight: spacing.xs,
  },
  leftIconContainer: {
    marginRight: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.xs * typography.lineHeight.normal,
  },
});
