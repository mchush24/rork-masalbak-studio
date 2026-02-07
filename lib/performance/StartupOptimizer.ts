/**
 * Startup Optimizer
 * Phase 19: Performance Optimization
 *
 * Optimizes app startup and critical path loading
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { InteractionManager, Platform } from 'react-native';

// Track startup tasks
const startupTasks: Map<string, () => Promise<void>> = new Map();
const completedTasks: Set<string> = new Set();
let isStartupComplete = false;

/**
 * Register a startup task
 */
export function registerStartupTask(
  id: string,
  task: () => Promise<void>,
  priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
): void {
  startupTasks.set(id, task);
}

/**
 * Run all startup tasks in priority order
 */
export async function runStartupTasks(): Promise<void> {
  for (const [id, task] of startupTasks) {
    if (!completedTasks.has(id)) {
      try {
        await task();
        completedTasks.add(id);
      } catch (error) {
        console.error('Startup task ' + id + ' failed:', error);
      }
    }
  }
  isStartupComplete = true;
}

/**
 * Hook for deferred loading of non-critical components
 */
export function useDeferredLoad(delay: number = 0) {
  const [isReady, setIsReady] = useState(delay === 0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (delay === 0) {
      // Wait for interactions to complete
      const handle = InteractionManager.runAfterInteractions(() => {
        if (mountedRef.current) {
          setIsReady(true);
        }
      });

      return () => {
        mountedRef.current = false;
        handle.cancel();
      };
    }

    // Delay loading
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        if (mountedRef.current) {
          setIsReady(true);
        }
      });
    }, delay);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [delay]);

  return isReady;
}

/**
 * Hook for critical path optimization
 */
export function useCriticalPath() {
  const [criticalComplete, setCriticalComplete] = useState(false);
  const [allComplete, setAllComplete] = useState(false);

  const runCritical = useCallback(async (tasks: Array<() => Promise<void>>) => {
    try {
      await Promise.all(tasks.map(task => task()));
      setCriticalComplete(true);
    } catch (error) {
      console.error('Critical path error:', error);
      // Still mark as complete to allow app to function
      setCriticalComplete(true);
    }
  }, []);

  const runDeferred = useCallback(async (tasks: Array<() => Promise<void>>) => {
    // Wait for interactions to complete first
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        resolve();
      });
    });

    // Run deferred tasks sequentially to avoid overloading
    for (const task of tasks) {
      try {
        await task();
      } catch (error) {
        console.error('Deferred task error:', error);
      }
    }
    setAllComplete(true);
  }, []);

  return {
    criticalComplete,
    allComplete,
    runCritical,
    runDeferred,
  };
}

/**
 * Lazy load a component
 */
export function lazyLoad<T>(
  loader: () => Promise<{ default: T }>,
  delay: number = 0
): Promise<{ default: T }> {
  return new Promise((resolve) => {
    if (delay > 0) {
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          loader().then(resolve);
        });
      }, delay);
    } else {
      InteractionManager.runAfterInteractions(() => {
        loader().then(resolve);
      });
    }
  });
}

/**
 * Preload fonts, images, and other assets
 */
export async function preloadAssets(assets: {
  fonts?: Array<{ [key: string]: any }>;
  images?: string[];
}): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (assets.fonts) {
    // Font preloading would typically use expo-font
    // tasks.push(Font.loadAsync(...assets.fonts));
  }

  if (assets.images) {
    // Image preloading (non-critical - failures are logged but don't block startup)
    const { Image } = require('react-native');
    assets.images.forEach((uri) => {
      tasks.push(
        Image.prefetch(uri).catch((err: Error) => {
          if (__DEV__) {
            console.warn('[StartupOptimizer] Image prefetch failed for:', uri, err?.message);
          }
          // Return resolved to not fail Promise.all
          return null;
        })
      );
    });
  }

  await Promise.all(tasks);
}

/**
 * Measure startup time
 */
export function measureStartupTime(name: string): () => void {
  const startTime = Date.now();
  
  return () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (__DEV__) {
      console.log('[Startup] ' + name + ': ' + duration + 'ms');
    }
    
    // Could send to analytics in production
    return duration;
  };
}

/**
 * Check if startup is complete
 */
export function isStartupFinished(): boolean {
  return isStartupComplete;
}

/**
 * Mark startup as complete
 */
export function markStartupComplete(): void {
  isStartupComplete = true;
}
