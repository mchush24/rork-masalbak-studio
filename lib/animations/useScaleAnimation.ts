/**
 * useScaleAnimation Hook
 *
 * Reusable scale animation for press feedback on buttons, cards, etc.
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  SpringConfig,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

export interface ScaleAnimationConfig {
  /** Scale value when pressed (default: 0.96) */
  pressedScale?: number;
  /** Scale value on hover - web only (default: 1.02) */
  hoverScale?: number;
  /** Spring configuration for the animation */
  springConfig?: SpringConfig;
  /** Use timing instead of spring (faster, less bouncy) */
  useTiming?: boolean;
  /** Duration for timing animation in ms (default: 150) */
  duration?: number;
}

export interface ScaleAnimationReturn {
  /** Animated style to apply to Animated.View */
  animatedStyle: ViewStyle;
  /** Call on press in */
  onPressIn: () => void;
  /** Call on press out */
  onPressOut: () => void;
  /** Call on hover start (web) */
  onHoverIn?: () => void;
  /** Call on hover end (web) */
  onHoverOut?: () => void;
  /** Current scale value (for debugging) */
  scale: { value: number };
}

const DEFAULT_SPRING_CONFIG: SpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export function useScaleAnimation(
  config: ScaleAnimationConfig = {}
): ScaleAnimationReturn {
  const {
    pressedScale = 0.96,
    hoverScale = 1.02,
    springConfig = DEFAULT_SPRING_CONFIG,
    useTiming = false,
    duration = 150,
  } = config;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animate = useCallback(
    (toValue: number) => {
      if (useTiming) {
        scale.value = withTiming(toValue, { duration });
      } else {
        scale.value = withSpring(toValue, springConfig);
      }
    },
    [scale, useTiming, duration, springConfig]
  );

  const onPressIn = useCallback(() => {
    animate(pressedScale);
  }, [animate, pressedScale]);

  const onPressOut = useCallback(() => {
    animate(1);
  }, [animate]);

  const onHoverIn = useCallback(() => {
    animate(hoverScale);
  }, [animate, hoverScale]);

  const onHoverOut = useCallback(() => {
    animate(1);
  }, [animate]);

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    scale,
  };
}

export default useScaleAnimation;
