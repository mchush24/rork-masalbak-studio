/**
 * OptimizationUtils - Performance optimization utilities
 * Phase 19: Performance Optimization
 *
 * Provides optimization helpers:
 * - Image optimization
 * - List virtualization helpers
 * - Memoization utilities
 * - Debounce/throttle hooks
 * - Lazy loading components
 */

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewStyle,
  StyleProp,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Debounce hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Throttle hook
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Throttled callback hook
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const lastRan = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        lastRan.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          () => {
            lastRan.current = Date.now();
            callbackRef.current(...args);
          },
          limit - (now - lastRan.current)
        );
      }
    }) as T,
    [limit]
  );
}

interface OptimizedImageProps {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
  aspectRatio?: number;
  quality?: 'low' | 'medium' | 'high';
  placeholder?: React.ReactNode;
  fadeIn?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Optimized image with lazy loading and fade-in
 */
export const OptimizedImage = memo(function OptimizedImage({
  source,
  width = SCREEN_WIDTH,
  height,
  aspectRatio = 1,
  quality = 'medium',
  placeholder,
  fadeIn = true,
  style,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const opacity = useSharedValue(0);

  const calculatedHeight = height || width / aspectRatio;

  const handleLoad = () => {
    setIsLoaded(true);
    if (fadeIn) {
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = 1;
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Calculate resize mode based on quality
  const resizeMode = quality === 'low' ? 'cover' : 'contain';

  return (
    <View style={[styles.imageContainer, { width, height: calculatedHeight }, style]}>
      {!isLoaded && !hasError && (
        <View style={styles.imagePlaceholder}>
          {placeholder || <ActivityIndicator color={Colors.secondary.lavender} />}
        </View>
      )}
      {hasError ? (
        <View style={styles.imageError}>
          <Animated.Text style={styles.imageErrorText}>!</Animated.Text>
        </View>
      ) : (
        <Animated.Image
          source={source}
          style={[styles.image, { width, height: calculatedHeight }, animatedStyle]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </View>
  );
});

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  itemHeight: number;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
}

/**
 * Optimized virtualized list with fixed item height
 */
export function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  windowSize = 5,
  initialNumToRender = 10,
  maxToRenderPerBatch = 5,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  style,
}: VirtualizedListProps<T>) {
  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  const renderItemMemoized = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItemMemoized}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      windowSize={windowSize}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      removeClippedSubviews={true}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      style={style}
    />
  );
}

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

/**
 * Lazy load component with delay
 */
export function LazyComponent({ children, fallback, delay = 0 }: LazyComponentProps) {
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timeout = setTimeout(() => {
        setShouldRender(true);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [delay]);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface OffscreenProps {
  children: React.ReactNode;
  visible: boolean;
  keepMounted?: boolean;
}

/**
 * Offscreen component - keeps component mounted but hidden
 */
export function Offscreen({ children, visible, keepMounted = true }: OffscreenProps) {
  const [hasBeenVisible, setHasBeenVisible] = useState(visible);

  useEffect(() => {
    if (visible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [visible, hasBeenVisible]);

  if (!keepMounted && !visible) {
    return null;
  }

  if (!hasBeenVisible) {
    return null;
  }

  return <View style={visible ? undefined : styles.offscreen}>{children}</View>;
}

/**
 * Hook for expensive computations with caching
 */
export function useMemoizedComputation<T, D extends readonly unknown[]>(
  computation: () => T,
  deps: D,
  cacheKey?: string
): T {
  const cache = useRef<Map<string, T>>(new Map());
  const key = cacheKey || JSON.stringify(deps);

  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)!;
    }

    const result = computation();
    cache.current.set(key, result);

    // Limit cache size
    if (cache.current.size > 100) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to check if component is mounted
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * Hook for stable callback reference
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Create a memoized selector
 */
export function createSelector<S, R>(
  selector: (state: S) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
): (state: S) => R {
  let lastState: S | undefined;
  let lastResult: R | undefined;

  return (state: S): R => {
    if (lastState === state && lastResult !== undefined) {
      return lastResult;
    }

    const result = selector(state);

    if (lastResult !== undefined && equalityFn(result, lastResult)) {
      return lastResult;
    }

    lastState = state;
    lastResult = result;
    return result;
  };
}

/**
 * Batch multiple state updates
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const isScheduled = useRef(false);

  const scheduleUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);

    if (!isScheduled.current) {
      isScheduled.current = true;

      requestAnimationFrame(() => {
        const updates = pendingUpdates.current;
        pendingUpdates.current = [];
        isScheduled.current = false;

        updates.forEach(u => u());
      });
    }
  }, []);

  return scheduleUpdate;
}

const styles = StyleSheet.create({
  imageContainer: {
    overflow: 'hidden',
    backgroundColor: Colors.neutral.lighter,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
  },
  imageError: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lighter,
  },
  imageErrorText: {
    fontSize: 24,
    color: Colors.neutral.medium,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    opacity: 0,
    pointerEvents: 'none',
  },
});

export default {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  OptimizedImage,
  VirtualizedList,
  LazyComponent,
  Offscreen,
  useMemoizedComputation,
  usePrevious,
  useIsMounted,
  useStableCallback,
  createSelector,
  useBatchedUpdates,
};
