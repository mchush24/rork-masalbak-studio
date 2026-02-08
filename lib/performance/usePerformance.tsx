/**
 * Performance Monitoring Utilities
 * Phase 4: Performance Enhancement
 *
 * Provides:
 * - Render time tracking
 * - Component performance profiling
 * - Memory usage monitoring
 * - FPS tracking
 * - Slow render detection
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';

// Performance thresholds (ms)
const THRESHOLDS = {
  RENDER_WARNING: 16, // 60fps = 16.67ms per frame
  RENDER_CRITICAL: 50,
  INTERACTION_WARNING: 100,
  INTERACTION_CRITICAL: 300,
};

// Performance entry types
interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'render' | 'interaction' | 'api' | 'custom';
}

interface PerformanceMetrics {
  averageRenderTime: number;
  maxRenderTime: number;
  renderCount: number;
  slowRenders: number;
  fps: number;
}

// Global performance store
class PerformanceStore {
  private static instance: PerformanceStore;
  private entries: PerformanceEntry[] = [];
  private maxEntries = 1000;
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();

  static getInstance(): PerformanceStore {
    if (!PerformanceStore.instance) {
      PerformanceStore.instance = new PerformanceStore();
    }
    return PerformanceStore.instance;
  }

  addEntry(entry: PerformanceEntry): void {
    this.entries.push(entry);

    // Keep entries under limit
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // Log warnings
    if (entry.type === 'render') {
      if (entry.duration > THRESHOLDS.RENDER_CRITICAL) {
        console.warn(
          `[Perf] Critical slow render: ${entry.name} took ${entry.duration.toFixed(2)}ms`
        );
      } else if (entry.duration > THRESHOLDS.RENDER_WARNING && __DEV__) {
        console.log(`[Perf] Slow render: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      }
    }

    // Notify listeners
    this.notifyListeners();
  }

  getMetrics(): PerformanceMetrics {
    const renderEntries = this.entries.filter(e => e.type === 'render');

    if (renderEntries.length === 0) {
      return {
        averageRenderTime: 0,
        maxRenderTime: 0,
        renderCount: 0,
        slowRenders: 0,
        fps: 60,
      };
    }

    const totalTime = renderEntries.reduce((sum, e) => sum + e.duration, 0);
    const maxTime = Math.max(...renderEntries.map(e => e.duration));
    const slowRenders = renderEntries.filter(e => e.duration > THRESHOLDS.RENDER_WARNING).length;

    const averageRenderTime = totalTime / renderEntries.length;
    const fps = Math.min(60, Math.round(1000 / averageRenderTime));

    return {
      averageRenderTime,
      maxRenderTime: maxTime,
      renderCount: renderEntries.length,
      slowRenders,
      fps,
    };
  }

  getEntriesByName(name: string): PerformanceEntry[] {
    return this.entries.filter(e => e.name === name);
  }

  clear(): void {
    this.entries = [];
    this.notifyListeners();
  }

  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const metrics = this.getMetrics();
    this.listeners.forEach(listener => listener(metrics));
  }
}

export const performanceStore = PerformanceStore.getInstance();

// Hook for component render tracking
interface UseRenderTrackingOptions {
  /** Component name for identification */
  name: string;
  /** Enable tracking (disable in production) */
  enabled?: boolean;
  /** Callback on slow render */
  onSlowRender?: (duration: number) => void;
}

export function useRenderTracking({
  name,
  enabled = __DEV__,
  onSlowRender,
}: UseRenderTrackingOptions) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef(0);

  // Track render start
  renderStartTime.current = performance.now();

  useEffect(() => {
    if (!enabled) return;

    const duration = performance.now() - renderStartTime.current;
    renderCount.current++;

    performanceStore.addEntry({
      name,
      startTime: renderStartTime.current,
      duration,
      type: 'render',
    });

    if (duration > THRESHOLDS.RENDER_WARNING && onSlowRender) {
      onSlowRender(duration);
    }
  });

  return {
    renderCount: renderCount.current,
  };
}

// Hook for interaction tracking
export function useInteractionTracking(name: string) {
  const startInteraction = useCallback(() => {
    const startTime = performance.now();

    return {
      end: () => {
        const duration = performance.now() - startTime;
        performanceStore.addEntry({
          name,
          startTime,
          duration,
          type: 'interaction',
        });

        if (duration > THRESHOLDS.INTERACTION_CRITICAL) {
          console.warn(`[Perf] Critical slow interaction: ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
      },
    };
  }, [name]);

  const trackInteraction = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      const tracker = startInteraction();
      try {
        const result = await operation();
        tracker.end();
        return result;
      } catch (error) {
        tracker.end();
        throw error;
      }
    },
    [startInteraction]
  );

  return {
    startInteraction,
    trackInteraction,
  };
}

// Hook for API call tracking
export function useAPITracking() {
  const trackAPI = useCallback(
    async <T,>(name: string, operation: () => Promise<T>): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await operation();
        const duration = performance.now() - startTime;

        performanceStore.addEntry({
          name: `API: ${name}`,
          startTime,
          duration,
          type: 'api',
        });

        if (__DEV__ && duration > 1000) {
          console.log(`[Perf] Slow API call: ${name} took ${duration.toFixed(2)}ms`);
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        performanceStore.addEntry({
          name: `API: ${name} (error)`,
          startTime,
          duration,
          type: 'api',
        });
        throw error;
      }
    },
    []
  );

  return { trackAPI };
}

// Hook for performance metrics subscription
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceStore.getMetrics());

  useEffect(() => {
    return performanceStore.subscribe(setMetrics);
  }, []);

  return metrics;
}

// Run after interactions complete (for non-blocking operations)
export function runAfterInteractions(callback: () => void): void {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
}

// Measure function execution time
export function measureTime<T>(name: string, fn: () => T): { result: T; duration: number } {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;

  performanceStore.addEntry({
    name,
    startTime,
    duration,
    type: 'custom',
  });

  return { result, duration };
}

// Measure async function execution time
export async function measureTimeAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;

  performanceStore.addEntry({
    name,
    startTime,
    duration,
    type: 'custom',
  });

  return { result, duration };
}

// Performance boundary component props
interface _PerformanceBoundaryProps {
  name: string;
  children: React.ReactNode;
  onSlowRender?: (duration: number) => void;
  threshold?: number;
}

// Higher-order component for performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name: string
): React.FC<P> {
  const TrackedComponent: React.FC<P> = props => {
    useRenderTracking({ name });
    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `withPerformanceTracking(${name})`;
  return TrackedComponent;
}

// Debug overlay component (for development)
interface _PerformanceOverlayProps {
  visible?: boolean;
}

export function usePerformanceOverlay(): {
  metrics: PerformanceMetrics;
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
} {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = usePerformanceMetrics();

  return {
    metrics,
    isVisible,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(v => !v),
  };
}

export default {
  useRenderTracking,
  useInteractionTracking,
  useAPITracking,
  usePerformanceMetrics,
  usePerformanceOverlay,
  measureTime,
  measureTimeAsync,
  runAfterInteractions,
  withPerformanceTracking,
  performanceStore,
};
