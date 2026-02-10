/**
 * useShakeAnimation Hook
 *
 * Reusable shake animation for error feedback on inputs, forms, etc.
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ShakeAnimationConfig {
  /** Maximum horizontal displacement in pixels (default: 10) */
  intensity?: number;
  /** Duration of one shake cycle in ms (default: 80) */
  duration?: number;
  /** Number of shake cycles (default: 4) */
  shakeCount?: number;
  /** Enable haptic feedback (default: true) */
  hapticEnabled?: boolean;
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'error';
}

export interface ShakeAnimationReturn {
  /** Animated style to apply to Animated.View */
  animatedStyle: ViewStyle;
  /** Trigger the shake animation */
  shake: () => void;
  /** Whether currently shaking */
  isShaking: { value: boolean };
}

export function useShakeAnimation(config: ShakeAnimationConfig = {}): ShakeAnimationReturn {
  const {
    intensity = 10,
    duration = 80,
    shakeCount = 4,
    hapticEnabled = true,
    hapticType = 'error',
  } = config;

  const translateX = useSharedValue(0);
  const isShaking = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = useCallback(() => {
    // Prevent multiple simultaneous shakes
    if (isShaking.value) return;
    isShaking.value = true;

    // Trigger haptic feedback
    if (hapticEnabled) {
      try {
        switch (hapticType) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'error':
          default:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch {
        // Haptics not available (e.g., web)
      }
    }

    // Build shake sequence
    const timingConfig = {
      duration,
      easing: Easing.linear,
    };

    // Create alternating shake values: [intensity, -intensity, intensity, -intensity, ...]
    const shakeSequence: ReturnType<typeof withTiming>[] = [];
    for (let i = 0; i < shakeCount; i++) {
      shakeSequence.push(withTiming(intensity, timingConfig), withTiming(-intensity, timingConfig));
    }
    // Return to center
    shakeSequence.push(withTiming(0, timingConfig));

    translateX.value = withSequence(...shakeSequence) as number;

    // Reset isShaking after animation completes
    setTimeout(
      () => {
        isShaking.value = false;
      },
      duration * (shakeCount * 2 + 1)
    );
  }, [translateX, isShaking, intensity, duration, shakeCount, hapticEnabled, hapticType]);

  return {
    animatedStyle,
    shake,
    isShaking,
  };
}

export default useShakeAnimation;
