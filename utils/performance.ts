/**
 * Performance Utilities
 *
 * Common patterns for optimizing React Native performance
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';

/**
 * Debounce a function call
 * Useful for search inputs, resize handlers, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function call
 * Useful for scroll handlers, continuous events, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Hook for debounced value
 * Useful for search inputs that trigger API calls
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debounced callback
 * Returns a memoized debounced version of the callback
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay) as T,
    [delay]
  );
}

/**
 * Hook for throttled callback
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit) as T,
    [limit]
  );
}

/**
 * Run expensive operations after interactions complete
 * Prevents janky animations and transitions
 */
export function runAfterInteractions(task: () => void): { cancel: () => void } {
  if (Platform.OS === 'web') {
    // Web doesn't have InteractionManager
    const timeoutId = setTimeout(task, 0);
    return {
      cancel: () => clearTimeout(timeoutId),
    };
  }

  return InteractionManager.runAfterInteractions(task);
}

/**
 * Hook for running effects after interactions
 */
export function useAfterInteractions(callback: () => void | (() => void), deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const handle = runAfterInteractions(() => {
      const cleanup = memoizedCallback();
      if (cleanup) {
        return cleanup;
      }
    });

    return () => {
      handle.cancel();
    };
  }, [memoizedCallback]);
}

/**
 * Lazy initialization for expensive computations
 */
export function useLazyInit<T>(factory: () => T): T {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = factory();
  }

  return ref.current;
}

/**
 * Memoize a heavy computation with custom comparison
 */
export function useMemoCompare<T>(next: T, compare: (prev: T | undefined, next: T) => boolean): T {
  const previousRef = useRef<T | undefined>(undefined);
  const previous = previousRef.current;

  const isEqual = previous !== undefined && compare(previous, next);

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });

  return isEqual ? previous! : next;
}

/**
 * Hook for preventing unnecessary re-renders
 * Returns previous value if new value is shallowly equal
 */
export function useStableValue<T extends Record<string, unknown>>(value: T): T {
  const ref = useRef(value);

  const isEqual = useMemo(() => {
    const prev = ref.current;
    const keys = Object.keys(value);
    const prevKeys = Object.keys(prev);

    if (keys.length !== prevKeys.length) return false;

    return keys.every(key => prev[key] === value[key]);
  }, [value]);

  if (!isEqual) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Batch state updates for better performance
 */
export function batchUpdates(callback: () => void): void {
  if (Platform.OS === 'web') {
    // React 18 already batches updates on web
    callback();
  } else {
    // Use unstable_batchedUpdates for React Native
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { unstable_batchedUpdates } = require('react-native');
    if (unstable_batchedUpdates) {
      unstable_batchedUpdates(callback);
    } else {
      callback();
    }
  }
}

/**
 * Pre-computed animation configurations for reuse
 * Prevents creating new animation configs on each render
 */
export const ANIMATION_CONFIGS = {
  // Spring configs
  springGentle: {
    tension: 40,
    friction: 7,
  },
  springBouncy: {
    tension: 100,
    friction: 5,
  },
  springStiff: {
    tension: 200,
    friction: 10,
  },

  // Timing configs
  timingFast: {
    duration: 150,
  },
  timingMedium: {
    duration: 300,
  },
  timingSlow: {
    duration: 500,
  },
} as const;

/**
 * Image loading optimization
 * Preload images for smoother UX
 */
export async function preloadImages(uris: string[]): Promise<void> {
  if (Platform.OS === 'web') {
    // Web preloading
    await Promise.all(
      uris.map(
        uri =>
          new Promise<void>(resolve => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = uri;
          })
      )
    );
  } else {
    // React Native preloading
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Image } = require('react-native');
    await Promise.all(uris.map(uri => Image.prefetch(uri).catch(() => {})));
  }
}

/**
 * Measure render performance (development only)
 */
export function useRenderCount(componentName: string): void {
  const countRef = useRef(0);
  countRef.current += 1;

  if (__DEV__) {
    console.log(`[Render] ${componentName}: ${countRef.current}`);
  }
}
