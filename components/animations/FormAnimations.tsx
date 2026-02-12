/**
 * FormAnimations - Input and form animations
 * Phase 11: Input & Form Animations
 *
 * Provides animated form components with:
 * - Focus/blur animations
 * - Error shake animation
 * - Success checkmark animation
 * - Floating label animation
 * - Progress indicators
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/lib/haptics';
import { shadows } from '@/constants/design-system';

const _AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  showPasswordToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Animated Input with floating label and state animations
 */
export function AnimatedInput({
  label,
  error,
  success,
  hint,
  showPasswordToggle,
  containerStyle,
  value,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const {
    tapLight,
    success: hapticSuccess,
    warning: _hapticWarning,
    error: hapticError,
  } = useHaptics();

  // Animation values
  const focusProgress = useSharedValue(0);
  const labelPosition = useSharedValue(value ? 1 : 0);
  const shakeX = useSharedValue(0);
  const borderGlow = useSharedValue(0);
  const successScale = useSharedValue(0);
  const errorOpacity = useSharedValue(0);

  const hasValue = Boolean(value && value.length > 0);

  // Handle focus state
  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    borderGlow.value = withTiming(isFocused ? 1 : 0, { duration: 300 });
  }, [isFocused, focusProgress, borderGlow]);

  // Handle label animation
  useEffect(() => {
    const shouldFloat = isFocused || hasValue;
    labelPosition.value = withSpring(shouldFloat ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused, hasValue, labelPosition]);

  // Handle error animation
  useEffect(() => {
    if (error) {
      hapticError();
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      errorOpacity.value = withTiming(1, { duration: 200 });
    } else {
      errorOpacity.value = withTiming(0, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, shakeX, errorOpacity]);

  // Handle success animation
  useEffect(() => {
    if (success) {
      hapticSuccess();
      successScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    } else {
      successScale.value = withTiming(0, { duration: 150 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, successScale]);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    tapLight();
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(labelPosition.value, [0, 1], [0, -24]);
    const scale = interpolate(labelPosition.value, [0, 1], [1, 0.85]);
    const color = interpolateColor(
      focusProgress.value,
      [0, 1],
      [Colors.neutral.medium, Colors.secondary.lavender]
    );

    return {
      transform: [{ translateY }, { scale }],
      color: error ? Colors.emotion.anger : color,
    };
  });

  const inputContainerStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? Colors.emotion.anger
      : success
        ? Colors.emotion.trust
        : interpolateColor(
            focusProgress.value,
            [0, 1],
            [Colors.neutral.light, Colors.secondary.lavender]
          );

    const shadowOpacity = interpolate(borderGlow.value, [0, 1], [0, 0.15]);

    return {
      borderColor,
      shadowOpacity,
      shadowColor: error ? Colors.emotion.anger : Colors.secondary.lavender,
    };
  });

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const errorMessageStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [
      {
        translateY: interpolate(errorOpacity.value, [0, 1], [-5, 0]),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, containerStyle]}>
      {/* Floating Label */}
      {label && <Animated.Text style={[styles.label, labelAnimatedStyle]}>{label}</Animated.Text>}

      {/* Input Container */}
      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.neutral.medium}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          {...props}
        />

        {/* Right icons */}
        <View style={styles.iconsContainer}>
          {/* Success checkmark */}
          {success && (
            <Animated.View style={[styles.successIcon, successIconStyle]}>
              <Check size={18} color={Colors.emotion.trust} />
            </Animated.View>
          )}

          {/* Password toggle */}
          {showPasswordToggle && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeButton}
            >
              {isPasswordVisible ? (
                <EyeOff size={18} color={Colors.neutral.medium} />
              ) : (
                <Eye size={18} color={Colors.neutral.medium} />
              )}
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Animated.View style={[styles.errorContainer, errorMessageStyle]}>
          <AlertCircle size={14} color={Colors.emotion.anger} />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {/* Hint */}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </Animated.View>
  );
}

interface PasswordStrengthBarProps {
  password: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated password strength indicator
 */
export function PasswordStrengthBar({ password, style }: PasswordStrengthBarProps) {
  const strength = useSharedValue(0);
  const width1 = useSharedValue(0);
  const width2 = useSharedValue(0);
  const width3 = useSharedValue(0);
  const width4 = useSharedValue(0);

  useEffect(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    strength.value = Math.min(score, 4);

    // Animate bars
    const animateBars = (targetStrength: number) => {
      width1.value = withTiming(targetStrength >= 1 ? 1 : 0, { duration: 300 });
      width2.value = withDelay(100, withTiming(targetStrength >= 2 ? 1 : 0, { duration: 300 }));
      width3.value = withDelay(200, withTiming(targetStrength >= 3 ? 1 : 0, { duration: 300 }));
      width4.value = withDelay(300, withTiming(targetStrength >= 4 ? 1 : 0, { duration: 300 }));
    };

    animateBars(Math.min(score, 4));
  }, [password, strength, width1, width2, width3, width4]);

  const getColor = (index: number) => {
    const colors = [
      Colors.emotion.anger, // 1 - weak
      Colors.emotion.anticipation, // 2 - fair
      Colors.emotion.joy, // 3 - good
      Colors.emotion.trust, // 4 - strong
    ];
    return colors[index] || Colors.neutral.lighter;
  };

  const getLabel = () => {
    const score = Math.min(
      (password.length >= 6 ? 1 : 0) +
        (password.length >= 10 ? 1 : 0) +
        (/[A-Z]/.test(password) && /[a-z]/.test(password) ? 1 : 0) +
        (/[0-9]/.test(password) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 1 : 0),
      4
    );

    const labels = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
    return labels[score] || '';
  };

  const bar1Style = useAnimatedStyle(() => ({
    flex: width1.value,
    backgroundColor: interpolateColor(width1.value, [0, 1], [Colors.neutral.lighter, getColor(0)]),
  }));

  const bar2Style = useAnimatedStyle(() => ({
    flex: width2.value,
    backgroundColor: interpolateColor(width2.value, [0, 1], [Colors.neutral.lighter, getColor(1)]),
  }));

  const bar3Style = useAnimatedStyle(() => ({
    flex: width3.value,
    backgroundColor: interpolateColor(width3.value, [0, 1], [Colors.neutral.lighter, getColor(2)]),
  }));

  const bar4Style = useAnimatedStyle(() => ({
    flex: width4.value,
    backgroundColor: interpolateColor(width4.value, [0, 1], [Colors.neutral.lighter, getColor(3)]),
  }));

  if (!password) return null;

  return (
    <View style={[styles.strengthContainer, style]}>
      <View style={styles.strengthBars}>
        <Animated.View style={[styles.strengthBar, bar1Style]} />
        <Animated.View style={[styles.strengthBar, bar2Style]} />
        <Animated.View style={[styles.strengthBar, bar3Style]} />
        <Animated.View style={[styles.strengthBar, bar4Style]} />
      </View>
      <Text style={styles.strengthLabel}>{getLabel()}</Text>
    </View>
  );
}

interface CharacterCounterProps {
  current: number;
  max: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Animated character counter
 */
export function CharacterCounter({ current, max, style }: CharacterCounterProps) {
  const scale = useSharedValue(1);
  const color = useSharedValue(0);

  useEffect(() => {
    // Pulse on change
    scale.value = withSequence(withTiming(1.1, { duration: 100 }), withSpring(1, { damping: 10 }));

    // Color change near limit
    const ratio = current / max;
    color.value = withTiming(ratio >= 0.9 ? 1 : ratio >= 0.75 ? 0.5 : 0, { duration: 200 });
  }, [current, max, scale, color]);

  const animatedStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      color.value,
      [0, 0.5, 1],
      [Colors.neutral.medium, Colors.emotion.anticipation, Colors.emotion.anger]
    );

    return {
      transform: [{ scale: scale.value }],
      color: textColor,
    };
  });

  return (
    <Animated.Text style={[styles.characterCounter, animatedStyle, style]}>
      {current}/{max}
    </Animated.Text>
  );
}

interface FormStepIndicatorProps {
  steps: number;
  currentStep: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated form step indicator
 */
export function FormStepIndicator({ steps, currentStep, style }: FormStepIndicatorProps) {
  return (
    <View style={[styles.stepsContainer, style]}>
      {Array.from({ length: steps }).map((_, index) => {
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <StepDot active={isActive} current={isCurrent} stepNumber={index + 1} />
            {index < steps - 1 && <StepLine active={index < currentStep} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function StepDot({
  active,
  current,
  stepNumber,
}: {
  active: boolean;
  current: boolean;
  stepNumber: number;
}) {
  const scale = useSharedValue(active ? 1 : 0.8);
  const bgColor = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(active ? 1 : 0.8, { damping: 12 });
    bgColor.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, scale, bgColor]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bgColor.value,
      [0, 1],
      [Colors.neutral.lighter, Colors.secondary.lavender]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[styles.stepDot, animatedStyle, current && styles.stepDotCurrent]}>
      {active ? (
        <Check size={14} color={Colors.neutral.white} />
      ) : (
        <Text style={styles.stepNumber}>{stepNumber}</Text>
      )}
    </Animated.View>
  );
}

function StepLine({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 400 });
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: progress.value,
    backgroundColor: Colors.secondary.lavender,
  }));

  return (
    <View style={styles.stepLineContainer}>
      <View style={styles.stepLineBackground} />
      <Animated.View style={[styles.stepLineFill, animatedStyle]} />
    </View>
  );
}

interface SubmitButtonAnimatedProps {
  onPress: () => void;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated submit button with loading, success, and error states
 */
export function SubmitButtonAnimated({
  onPress,
  loading = false,
  success = false,
  error = false,
  disabled = false,
  children,
  style,
}: SubmitButtonAnimatedProps) {
  const scale = useSharedValue(1);
  const bgColor = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const {
    tapMedium,
    success: hapticSuccess,
    warning: _hapticWarning,
    error: hapticError,
  } = useHaptics();

  useEffect(() => {
    if (success) {
      bgColor.value = withTiming(1, { duration: 300 });
      hapticSuccess();
    } else if (error) {
      bgColor.value = withTiming(2, { duration: 300 });
      shakeX.value = withSequence(
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      hapticError();
    } else {
      bgColor.value = withTiming(0, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, error, bgColor, shakeX]);

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 15 });
    tapMedium();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bgColor.value,
      [0, 1, 2],
      [Colors.secondary.lavender, Colors.emotion.trust, Colors.emotion.anger]
    );

    return {
      transform: [{ scale: scale.value }, { translateX: shakeX.value }],
      backgroundColor,
      opacity: disabled ? 0.5 : 1,
    };
  });

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[styles.submitButton, animatedStyle, style]}>
        {loading ? (
          <View style={styles.loadingDots}>
            <LoadingDot delay={0} />
            <LoadingDot delay={150} />
            <LoadingDot delay={300} />
          </View>
        ) : success ? (
          <Check size={22} color={Colors.neutral.white} />
        ) : (
          children
        )}
      </Animated.View>
    </Pressable>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 }))
    );

    const interval = setInterval(() => {
      opacity.value = withDelay(
        delay,
        withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 }))
      );
    }, 900);

    return () => clearInterval(interval);
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.loadingDot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  // Animated Input
  container: {
    marginBottom: 20,
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.neutral.darkest,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    gap: 8,
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.emotion.trust + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: Colors.emotion.anger,
    flex: 1,
  },
  hintText: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 6,
    paddingHorizontal: 4,
  },

  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 4,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral.medium,
    minWidth: 40,
  },

  // Character Counter
  characterCounter: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },

  // Form Steps
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCurrent: {
    ...shadows.colored(Colors.secondary.lavender),
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },
  stepLineContainer: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
    position: 'relative',
  },
  stepLineBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 2,
  },
  stepLineFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 54,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.white,
  },
});

export default {
  AnimatedInput,
  PasswordStrengthBar,
  CharacterCounter,
  FormStepIndicator,
  SubmitButtonAnimated,
};
