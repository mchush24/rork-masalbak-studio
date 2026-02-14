/**
 * AnimatedPressable - Standardized pressable with animations
 *
 * Features:
 * - Consistent press feedback
 * - Haptic feedback support
 * - Configurable animation style
 */

import React, { useCallback } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spring, transforms } from '@/constants/animations';
import { hapticImpact, hapticSelection } from '@/lib/platform';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

type PressStyle = 'button' | 'card' | 'icon' | 'subtle' | 'none';
type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'none';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressStyle?: PressStyle;
  haptic?: HapticStyle;
  disabled?: boolean;
}

const PRESS_SCALES: Record<PressStyle, number> = {
  button: transforms.buttonPress.scale,
  card: transforms.cardPress.scale,
  icon: transforms.iconPress.scale,
  subtle: 0.99,
  none: 1,
};

export function AnimatedPressable({
  children,
  style,
  pressStyle = 'button',
  haptic = 'light',
  disabled = false,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, PRESS_SCALES[pressStyle]]);

    return {
      transform: [{ scale }],
      opacity: interpolate(pressed.value, [0, 1], [1, disabled ? 0.5 : 0.9]),
    };
  });

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      pressed.value = withSpring(1, spring.snappy);

      // Trigger haptic feedback
      if (haptic !== 'none' && !disabled) {
        switch (haptic) {
          case 'light':
            hapticImpact(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            hapticImpact(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'selection':
            hapticSelection();
            break;
        }
      }

      onPressIn?.(e);
    },
    [haptic, disabled, onPressIn, pressed]
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      pressed.value = withSpring(0, spring.snappy);
      onPressOut?.(e);
    },
    [onPressOut, pressed]
  );

  return (
    <AnimatedPressableComponent
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedPressableComponent>
  );
}

export default AnimatedPressable;
