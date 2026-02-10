/**
 * Animation Optimizer
 * Phase 19: Performance Optimization
 *
 * Optimizes animations for 60fps performance
 */

import { useCallback, useRef, useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  cancelAnimation,
  runOnJS,
  SharedValue,
  Easing,
} from 'react-native-reanimated';
import { Platform } from 'react-native';

// Optimized spring configurations
export const OPTIMIZED_SPRING = {
  fast: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
    overshootClamping: false,
  },
  normal: {
    damping: 15,
    stiffness: 150,
    mass: 1,
    overshootClamping: false,
  },
  slow: {
    damping: 12,
    stiffness: 100,
    mass: 1.5,
    overshootClamping: false,
  },
  bounce: {
    damping: 8,
    stiffness: 200,
    mass: 0.8,
    overshootClamping: false,
  },
};

// Optimized timing configurations
export const OPTIMIZED_TIMING = {
  instant: {
    duration: 0,
  },
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
  },
  normal: {
    duration: 300,
    easing: Easing.inOut(Easing.cubic),
  },
  slow: {
    duration: 500,
    easing: Easing.inOut(Easing.cubic),
  },
};

interface OptimizedAnimationOptions {
  type?: 'spring' | 'timing';
  preset?: keyof typeof OPTIMIZED_SPRING | keyof typeof OPTIMIZED_TIMING;
  reduceMotion?: boolean;
  onComplete?: () => void;
}

/**
 * Hook for optimized animations with automatic cleanup
 */
export function useOptimizedAnimation(
  initialValue: number = 0,
  options: OptimizedAnimationOptions = {}
) {
  const { type = 'spring', preset = 'normal', reduceMotion = false } = options;
  const value = useSharedValue(initialValue);
  const isAnimating = useSharedValue(false);

  const animate = useCallback(
    (toValue: number, customOptions?: Partial<OptimizedAnimationOptions>) => {
      const finalType = customOptions?.type || type;
      const finalPreset = customOptions?.preset || preset;
      const shouldReduceMotion = customOptions?.reduceMotion ?? reduceMotion;

      if (shouldReduceMotion) {
        value.value = toValue;
        return;
      }

      isAnimating.value = true;

      if (finalType === 'spring') {
        const config =
          OPTIMIZED_SPRING[finalPreset as keyof typeof OPTIMIZED_SPRING] || OPTIMIZED_SPRING.normal;
        value.value = withSpring(toValue, config, finished => {
          if (finished) {
            isAnimating.value = false;
            if (options.onComplete) {
              runOnJS(options.onComplete)();
            }
          }
        });
      } else {
        const config =
          OPTIMIZED_TIMING[finalPreset as keyof typeof OPTIMIZED_TIMING] || OPTIMIZED_TIMING.normal;
        value.value = withTiming(toValue, config, finished => {
          if (finished) {
            isAnimating.value = false;
            if (options.onComplete) {
              runOnJS(options.onComplete)();
            }
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, preset, reduceMotion, options.onComplete]
  );

  const cancel = useCallback(() => {
    cancelAnimation(value);
    isAnimating.value = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    cancel();
    value.value = initialValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, cancel]);

  return {
    value,
    isAnimating,
    animate,
    cancel,
    reset,
  };
}

/**
 * Hook for cleaning up animations on unmount
 */
export function useAnimationCleanup(animations: SharedValue<number>[]) {
  const animationsRef = useRef(animations);
  animationsRef.current = animations;

  useEffect(() => {
    return () => {
      animationsRef.current.forEach(anim => {
        cancelAnimation(anim);
      });
    };
  }, []);
}

/**
 * Creates an optimized animated style with memoization
 */
export function useOptimizedStyle<T extends object>(styleCreator: () => T): () => T {
  return useAnimatedStyle(styleCreator) as unknown as () => T;
}

/**
 * Batch multiple animation updates for better performance
 */
export function batchAnimations(
  animations: { value: SharedValue<number>; toValue: number; config?: unknown }[]
) {
  'worklet';
  animations.forEach(({ value, toValue, config }) => {
    if (config) {
      value.value = withSpring(toValue, config);
    } else {
      value.value = toValue;
    }
  });
}

/**
 * Check if animations should be reduced based on platform settings
 */
export function shouldReduceAnimations(): boolean {
  // Web always uses reduced animations for better compatibility
  if (Platform.OS === 'web') {
    return true;
  }
  return false;
}
