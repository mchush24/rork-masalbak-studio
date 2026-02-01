/**
 * Memory Manager
 * Phase 19: Performance Optimization
 *
 * Manages memory to prevent leaks and optimize usage
 */

import { useEffect, useRef, useCallback } from 'react';
import { InteractionManager, Platform } from 'react-native';

// Track mounted components for cleanup
const mountedComponents = new Set<string>();
const cleanupCallbacks = new Map<string, () => void>();

/**
 * Generate unique component ID
 */
function generateComponentId(): string {
  return 'component_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Hook for memory management with automatic cleanup
 */
export function useMemoryManager() {
  const componentId = useRef(generateComponentId());
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const intervals = useRef<NodeJS.Timeout[]>([]);
  const subscriptions = useRef<(() => void)[]>([]);

  useEffect(() => {
    const id = componentId.current;
    mountedComponents.add(id);

    return () => {
      mountedComponents.delete(id);
      
      // Clear all timeouts
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];

      // Clear all intervals
      intervals.current.forEach(clearInterval);
      intervals.current = [];

      // Call all cleanup subscriptions
      subscriptions.current.forEach((cleanup) => cleanup());
      subscriptions.current = [];

      // Run any registered cleanup callbacks
      const cleanup = cleanupCallbacks.get(id);
      if (cleanup) {
        cleanup();
        cleanupCallbacks.delete(id);
      }
    };
  }, []);

  const safeTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (mountedComponents.has(componentId.current)) {
        callback();
      }
    }, delay);
    timeouts.current.push(timeout);
    return timeout;
  }, []);

  const safeInterval = useCallback((callback: () => void, interval: number): NodeJS.Timeout => {
    const id = setInterval(() => {
      if (mountedComponents.has(componentId.current)) {
        callback();
      } else {
        clearInterval(id);
      }
    }, interval);
    intervals.current.push(id);
    return id;
  }, []);

  const addCleanup = useCallback((cleanup: () => void) => {
    subscriptions.current.push(cleanup);
  }, []);

  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupCallbacks.set(componentId.current, cleanup);
  }, []);

  const isMounted = useCallback((): boolean => {
    return mountedComponents.has(componentId.current);
  }, []);

  return {
    safeTimeout,
    safeInterval,
    addCleanup,
    registerCleanup,
    isMounted,
    componentId: componentId.current,
  };
}

/**
 * Hook for component cleanup with deferred execution
 */
export function useComponentCleanup(cleanup: () => void) {
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  useEffect(() => {
    return () => {
      // Defer cleanup to after interactions complete
      InteractionManager.runAfterInteractions(() => {
        cleanupRef.current();
      });
    };
  }, []);
}

/**
 * Debounce function for preventing excessive updates
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);

    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Run heavy computation after interactions complete
 */
export function runAfterInteractions<T>(task: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(task());
    });
  });
}

/**
 * Check available memory (approximation for React Native)
 */
export function getMemoryInfo(): { isLowMemory: boolean; usage: number } {
  // This is a simplified check - actual implementation would use native modules
  const isLowMemory = Platform.OS !== 'web' && (global as any).gc !== undefined;
  return {
    isLowMemory,
    usage: 0, // Would need native module for actual usage
  };
}

/**
 * Force garbage collection if available (development only)
 */
export function forceGarbageCollection(): void {
  if (__DEV__ && (global as any).gc) {
    (global as any).gc();
  }
}
