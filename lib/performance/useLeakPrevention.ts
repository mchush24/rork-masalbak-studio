/**
 * Memory Leak Prevention Hooks
 *
 * Additional hooks and utilities to prevent common memory leaks
 * in React Native applications
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ============================================
// Mounted Reference Hook
// ============================================

/**
 * Hook that tracks if component is mounted
 * Use to prevent state updates on unmounted components
 *
 * @example
 * const isMounted = useIsMounted();
 *
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}

// ============================================
// Safe State Hook
// ============================================

/**
 * useState that only updates if component is mounted
 * Prevents "Can't perform state update on unmounted component" warning
 *
 * @example
 * const [data, setData] = useSafeState<User | null>(null);
 *
 * useEffect(() => {
 *   api.getUser().then(setData); // Safe even if component unmounts
 * }, []);
 */
export function useSafeState<T>(initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const isMounted = useIsMounted();
  const [state, setState] = useState<T>(initialValue);

  const setSafeState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted]
  );

  return [state, setSafeState];
}

// ============================================
// Cancellable Promise Hook
// ============================================

interface CancellablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

/**
 * Creates a cancellable promise wrapper
 */
function makeCancellable<T>(promise: Promise<T>): CancellablePromise<T> {
  let isCancelled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((val) => {
        if (!isCancelled) resolve(val);
      })
      .catch((error) => {
        if (!isCancelled) reject(error);
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCancelled = true;
    },
  };
}

/**
 * Hook for managing cancellable async operations
 *
 * @example
 * const { execute, cancel } = useCancellablePromise();
 *
 * useEffect(() => {
 *   execute(fetchData()).then(setData);
 *   return cancel; // Automatically cancels on unmount
 * }, []);
 */
export function useCancellablePromise() {
  const pendingPromises = useRef<CancellablePromise<unknown>[]>([]);

  useEffect(() => {
    return () => {
      // Cancel all pending promises on unmount
      pendingPromises.current.forEach((p) => p.cancel());
      pendingPromises.current = [];
    };
  }, []);

  const execute = useCallback(<T>(promise: Promise<T>): Promise<T> => {
    const cancellable = makeCancellable(promise);
    pendingPromises.current.push(cancellable);

    return cancellable.promise.finally(() => {
      pendingPromises.current = pendingPromises.current.filter((p) => p !== cancellable);
    });
  }, []);

  const cancel = useCallback(() => {
    pendingPromises.current.forEach((p) => p.cancel());
    pendingPromises.current = [];
  }, []);

  return { execute, cancel };
}

// ============================================
// Event Listener Cleanup Hook
// ============================================

/**
 * Hook for safely managing event listeners with automatic cleanup
 *
 * @example
 * const addListener = useEventListenerCleanup();
 *
 * useEffect(() => {
 *   addListener(window, 'resize', handleResize);
 *   addListener(document, 'keydown', handleKeyDown);
 *   // All listeners are automatically cleaned up on unmount
 * }, []);
 */
export function useEventListenerCleanup() {
  const cleanupFns = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      cleanupFns.current.forEach((cleanup) => cleanup());
      cleanupFns.current = [];
    };
  }, []);

  const addListener = useCallback(
    <K extends keyof GlobalEventHandlersEventMap>(
      target: EventTarget,
      event: K,
      handler: (e: GlobalEventHandlersEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ) => {
      target.addEventListener(event, handler as EventListener, options);
      const cleanup = () => {
        target.removeEventListener(event, handler as EventListener, options);
      };
      cleanupFns.current.push(cleanup);
      return cleanup;
    },
    []
  );

  return addListener;
}

// ============================================
// Subscription Cleanup Hook
// ============================================

/**
 * Hook for managing subscriptions with automatic cleanup
 *
 * @example
 * const subscribe = useSubscriptionCleanup();
 *
 * useEffect(() => {
 *   subscribe(eventEmitter.on('event', handler));
 *   subscribe(observable.subscribe(observer));
 * }, []);
 */
export function useSubscriptionCleanup() {
  const subscriptions = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      subscriptions.current.forEach((unsub) => unsub());
      subscriptions.current = [];
    };
  }, []);

  const subscribe = useCallback((unsubscribe: () => void) => {
    subscriptions.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  return subscribe;
}

// ============================================
// App State Aware Effect
// ============================================

/**
 * useEffect that pauses when app goes to background
 * Useful for polling or animations that shouldn't run in background
 *
 * @example
 * useAppStateAwareEffect(
 *   () => {
 *     const interval = setInterval(poll, 5000);
 *     return () => clearInterval(interval);
 *   },
 *   [],
 *   { pauseInBackground: true }
 * );
 */
export function useAppStateAwareEffect(
  effect: () => (() => void) | void,
  deps: React.DependencyList,
  options: { pauseInBackground?: boolean } = {}
) {
  const { pauseInBackground = true } = options;
  const cleanupRef = useRef<(() => void) | void>();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const runEffect = () => {
      cleanupRef.current = effect();
    };

    const pauseEffect = () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };

    // Initial run
    if (appState.current === 'active') {
      runEffect();
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (pauseInBackground) {
        if (appState.current === 'active' && nextState !== 'active') {
          // Going to background
          pauseEffect();
        } else if (appState.current !== 'active' && nextState === 'active') {
          // Coming to foreground
          runEffect();
        }
      }
      appState.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      pauseEffect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ============================================
// Cached Callback Hook
// ============================================

/**
 * useCallback with automatic cache invalidation
 * Prevents stale closures in long-running callbacks
 *
 * @example
 * const handleSubmit = useCachedCallback(
 *   (data) => {
 *     // Always has access to latest state
 *     api.submit({ ...data, userId: currentUser.id });
 *   },
 *   [currentUser.id]
 * );
 */
export function useCachedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

// ============================================
// Memory Warning Handler
// ============================================

/**
 * Hook that responds to memory warnings
 * Useful for clearing caches or reducing memory usage
 *
 * @example
 * useMemoryWarning(() => {
 *   imageCache.clear();
 *   queryClient.clear();
 * });
 */
export function useMemoryWarning(onWarning: () => void) {
  const onWarningRef = useRef(onWarning);
  onWarningRef.current = onWarning;

  useEffect(() => {
    // Note: React Native doesn't have a built-in memory warning event
    // This is a placeholder for native module integration
    // For production, integrate with react-native-memory-warning or similar

    if (__DEV__) {
      // In development, we can simulate memory pressure
      const checkMemory = () => {
        // Simulated check - replace with actual native module
        const isLowMemory = false;
        if (isLowMemory) {
          onWarningRef.current();
        }
      };

      const interval = setInterval(checkMemory, 30000);
      return () => clearInterval(interval);
    }
  }, []);
}

// ============================================
// Weak Reference Cache
// ============================================

/**
 * Cache that uses WeakRef to allow garbage collection
 * Useful for caching objects without preventing GC
 */
export class WeakCache<K extends object, V> {
  private cache = new Map<K, WeakRef<V extends object ? V : never>>();
  private finalizationRegistry: FinalizationRegistry<K>;

  constructor() {
    this.finalizationRegistry = new FinalizationRegistry((key) => {
      this.cache.delete(key);
    });
  }

  set(key: K, value: V extends object ? V : never): void {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.finalizationRegistry.register(value, key);
  }

  get(key: K): (V extends object ? V : never) | undefined {
    const ref = this.cache.get(key);
    return ref?.deref();
  }

  has(key: K): boolean {
    const ref = this.cache.get(key);
    return ref?.deref() !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
