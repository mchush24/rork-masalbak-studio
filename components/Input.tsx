import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";
import { Check, AlertCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { spacing, typography, radius, semantic } from "@/constants/tokens";
import { shadows } from "@/constants/design-system";
import { useHaptic } from "@/lib/haptics";

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

const AnimatedView = Animated.createAnimatedComponent(View);

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
  const { error: errorHaptic, success: successHaptic, tap } = useHaptic();

  // Animation values
  const focusProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const borderColorProgress = useSharedValue(0);
  const labelScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Determine state from props
  const state: InputState = controlledState || (error ? "error" : success ? "success" : "default");

  // Handle state changes with animations
  useEffect(() => {
    if (state === "error") {
      errorHaptic();
      // Shake animation
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      borderColorProgress.value = withTiming(1, { duration: 200 });
    } else if (state === "success") {
      successHaptic();
      borderColorProgress.value = withTiming(2, { duration: 200 });
    } else {
      borderColorProgress.value = withTiming(0, { duration: 200 });
    }
  }, [state, errorHaptic, successHaptic, shakeX, borderColorProgress]);

  // Handle focus changes
  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    glowOpacity.value = withTiming(isFocused ? 0.15 : 0, { duration: 200 });
  }, [isFocused, focusProgress, glowOpacity]);

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderColorProgress.value,
      [0, 1, 2],
      [
        isFocused ? Colors.primary.sunset : Colors.neutral.medium,
        semantic.error,
        semantic.success,
      ]
    );

    return {
      borderColor,
      transform: [{ translateX: shakeX.value }],
    };
  });

  // Animated glow style
  const animatedGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    shadowRadius: 8 + focusProgress.value * 4,
  }));

  const getMessage = () => {
    if (error) return { text: error, color: semantic.error, icon: AlertCircle };
    if (success) return { text: success, color: semantic.success, icon: Check };
    if (helperText) return { text: helperText, color: Colors.neutral.medium, icon: null };
    return null;
  };

  const message = getMessage();

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.labelContainer}
        >
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </Animated.View>
      )}

      <AnimatedView
        style={[
          styles.inputContainer,
          styles[`inputContainer_${size}`],
          animatedBorderStyle,
          animatedGlowStyle,
          isFocused && styles.inputContainerFocused,
          state === "error" && styles.inputContainerError,
          state === "success" && styles.inputContainerSuccess,
          textInputProps.editable === false && styles.inputContainerDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            styles[`input_${size}`],
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={Colors.neutral.light}
          onFocus={(e) => {
            setIsFocused(true);
            tap();
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          accessibilityLabel={textInputProps.accessibilityLabel || label || textInputProps.placeholder}
          accessibilityHint={error ? `Hata: ${error}` : textInputProps.accessibilityHint}
          accessibilityState={{
            disabled: textInputProps.editable === false,
          }}
        />

        {/* Success/Error icon */}
        {state === "success" && !rightIcon && (
          <Animated.View
            entering={FadeIn.springify()}
            style={styles.stateIconContainer}
          >
            <Check size={18} color={semantic.success} />
          </Animated.View>
        )}

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </AnimatedView>

      {/* Message with animation */}
      {message && (
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={FadeOut.duration(150)}
          style={styles.messageContainer}
        >
          {message.icon && (
            <message.icon size={14} color={message.color} style={styles.messageIcon} />
          )}
          <Text style={[styles.message, { color: message.color }]}>
            {message.text}
          </Text>
        </Animated.View>
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
    ...shadows.colored(Colors.primary.sunset),
  },
  inputContainerError: {
    borderColor: semantic.error,
    backgroundColor: "#FEF2F2",
  },
  inputContainerSuccess: {
    borderColor: semantic.success,
    backgroundColor: "#F0FDF4",
  },
  inputContainerDisabled: {
    backgroundColor: Colors.background.primary,
    opacity: 0.6,
  },
  stateIconContainer: {
    marginLeft: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  messageIcon: {
    marginRight: spacing.xs / 2,
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
