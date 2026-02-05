/**
 * useFadeAnimation Hook
 *
 * Reusable fade animation for enter/exit transitions.
 */

import { useCallback, useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

export interface FadeAnimationConfig {
  /** Initial opacity (default: 0) */
  initialOpacity?: number;
  /** Target opacity when visible (default: 1) */
  targetOpacity?: number;
  /** Animation duration in ms (default: 300) */
  duration?: number;
  /** Delay before animation starts in ms (default: 0) */
  delay?: number;
  /** Auto-start fade in on mount (default: true) */
  autoFadeIn?: boolean;
  /** Easing function */
  easing?: typeof Easing.ease;
  /** Callback when fade in completes */
  onFadeInComplete?: () => void;
  /** Callback when fade out completes */
  onFadeOutComplete?: () => void;
}

export interface FadeAnimationReturn {
  /** Animated style to apply to Animated.View */
  animatedStyle: ViewStyle;
  /** Fade in to target opacity */
  fadeIn: () => void;
  /** Fade out to initial opacity */
  fadeOut: () => void;
  /** Toggle visibility */
  toggle: () => void;
  /** Current visibility state */
  isVisible: { value: boolean };
  /** Current opacity value */
  opacity: { value: number };
}

export function useFadeAnimation(
  config: FadeAnimationConfig = {}
): FadeAnimationReturn {
  const {
    initialOpacity = 0,
    targetOpacity = 1,
    duration = 300,
    delay = 0,
    autoFadeIn = true,
    easing = Easing.ease,
    onFadeInComplete,
    onFadeOutComplete,
  } = config;

  const opacity = useSharedValue(initialOpacity);
  const isVisible = useSharedValue(initialOpacity > 0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = useCallback(() => {
    isVisible.value = true;
    const animation = withTiming(
      targetOpacity,
      { duration, easing },
      finished => {
        if (finished && onFadeInComplete) {
          runOnJS(onFadeInComplete)();
        }
      }
    );
    opacity.value = delay > 0 ? withDelay(delay, animation) : animation;
  }, [opacity, isVisible, targetOpacity, duration, delay, easing, onFadeInComplete]);

  const fadeOut = useCallback(() => {
    opacity.value = withTiming(
      initialOpacity,
      { duration, easing },
      finished => {
        if (finished) {
          isVisible.value = false;
          if (onFadeOutComplete) {
            runOnJS(onFadeOutComplete)();
          }
        }
      }
    );
  }, [opacity, isVisible, initialOpacity, duration, easing, onFadeOutComplete]);

  const toggle = useCallback(() => {
    if (isVisible.value) {
      fadeOut();
    } else {
      fadeIn();
    }
  }, [isVisible, fadeIn, fadeOut]);

  // Auto fade in on mount
  useEffect(() => {
    if (autoFadeIn) {
      fadeIn();
    }
  }, [autoFadeIn, fadeIn]);

  return {
    animatedStyle,
    fadeIn,
    fadeOut,
    toggle,
    isVisible,
    opacity,
  };
}

export default useFadeAnimation;
