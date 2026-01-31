/**
 * PerformanceMonitor - Performance tracking and optimization
 * Phase 19: Performance Optimization
 *
 * Provides performance monitoring:
 * - Frame rate tracking
 * - Render time measurement
 * - Memory monitoring
 * - Network request timing
 * - Performance reporting
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { InteractionManager, Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface RenderMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
}

interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

interface PerformanceReport {
  averageFPS: number;
  slowFrames: number;
  averageRenderTime: number;
  slowRenders: number;
  networkRequests: number;
  averageNetworkTime: number;
  memoryWarnings: number;
}

interface PerformanceContextType {
  // Metrics
  metrics: PerformanceMetric[];
  renderMetrics: Map<string, RenderMetric>;
  networkMetrics: NetworkMetric[];

  // Tracking methods
  trackMetric: (name: string, value: number, unit?: string) => void;
  trackRender: (componentName: string, renderTime: number) => void;
  trackNetworkRequest: (metric: Omit<NetworkMetric, 'timestamp'>) => void;

  // Optimization helpers
  scheduleAfterInteraction: (callback: () => void) => void;
  measureRender: <T>(componentName: string, renderFn: () => T) => T;

  // Reporting
  generateReport: () => PerformanceReport;
  clearMetrics: () => void;

  // Settings
  isMonitoringEnabled: boolean;
  setMonitoringEnabled: (enabled: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(
  undefined
);

interface PerformanceProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  maxMetrics?: number;
}

export function PerformanceProvider({
  children,
  enabled = __DEV__,
  maxMetrics = 1000,
}: PerformanceProviderProps) {
  const [isMonitoringEnabled, setMonitoringEnabled] = useState(enabled);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [renderMetrics, setRenderMetrics] = useState<Map<string, RenderMetric>>(
    new Map()
  );
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetric[]>([]);

  const frameTimestamps = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(0);

  // Track FPS
  useEffect(() => {
    if (!isMonitoringEnabled) return;

    let animationFrameId: number;
    let isRunning = true;

    const measureFPS = (timestamp: number) => {
      if (!isRunning) return;

      if (lastFrameTime.current > 0) {
        const delta = timestamp - lastFrameTime.current;
        frameTimestamps.current.push(delta);

        // Keep only last 60 frames
        if (frameTimestamps.current.length > 60) {
          frameTimestamps.current.shift();
        }
      }

      lastFrameTime.current = timestamp;
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMonitoringEnabled]);

  const trackMetric = useCallback(
    (name: string, value: number, unit: string = 'ms') => {
      if (!isMonitoringEnabled) return;

      setMetrics((prev) => {
        const newMetrics = [
          ...prev,
          { name, value, unit, timestamp: Date.now() },
        ];
        // Trim to max metrics
        if (newMetrics.length > maxMetrics) {
          return newMetrics.slice(-maxMetrics);
        }
        return newMetrics;
      });
    },
    [isMonitoringEnabled, maxMetrics]
  );

  const trackRender = useCallback(
    (componentName: string, renderTime: number) => {
      if (!isMonitoringEnabled) return;

      setRenderMetrics((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(componentName);

        if (existing) {
          newMap.set(componentName, {
            componentName,
            renderTime: (existing.renderTime + renderTime) / 2,
            renderCount: existing.renderCount + 1,
          });
        } else {
          newMap.set(componentName, {
            componentName,
            renderTime,
            renderCount: 1,
          });
        }

        return newMap;
      });

      // Track slow renders (> 16ms = below 60fps)
      if (renderTime > 16) {
        trackMetric(`slow_render_${componentName}`, renderTime);
      }
    },
    [isMonitoringEnabled, trackMetric]
  );

  const trackNetworkRequest = useCallback(
    (metric: Omit<NetworkMetric, 'timestamp'>) => {
      if (!isMonitoringEnabled) return;

      setNetworkMetrics((prev) => {
        const newMetrics = [...prev, { ...metric, timestamp: Date.now() }];
        if (newMetrics.length > maxMetrics) {
          return newMetrics.slice(-maxMetrics);
        }
        return newMetrics;
      });
    },
    [isMonitoringEnabled, maxMetrics]
  );

  const scheduleAfterInteraction = useCallback((callback: () => void) => {
    InteractionManager.runAfterInteractions(callback);
  }, []);

  const measureRender = useCallback(
    <T,>(componentName: string, renderFn: () => T): T => {
      if (!isMonitoringEnabled) {
        return renderFn();
      }

      const startTime = performance.now();
      const result = renderFn();
      const endTime = performance.now();

      trackRender(componentName, endTime - startTime);

      return result;
    },
    [isMonitoringEnabled, trackRender]
  );

  const generateReport = useCallback((): PerformanceReport => {
    // Calculate average FPS
    const frameTimes = frameTimestamps.current;
    const avgFrameTime =
      frameTimes.length > 0
        ? frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
        : 16.67;
    const averageFPS = Math.round(1000 / avgFrameTime);
    const slowFrames = frameTimes.filter((t) => t > 16.67).length;

    // Calculate render metrics
    const renderTimes = Array.from(renderMetrics.values()).map(
      (m) => m.renderTime
    );
    const averageRenderTime =
      renderTimes.length > 0
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
        : 0;
    const slowRenders = renderTimes.filter((t) => t > 16).length;

    // Calculate network metrics
    const networkTimes = networkMetrics.map((m) => m.duration);
    const averageNetworkTime =
      networkTimes.length > 0
        ? networkTimes.reduce((a, b) => a + b, 0) / networkTimes.length
        : 0;

    // Count memory warnings
    const memoryWarnings = metrics.filter(
      (m) => m.name === 'memory_warning'
    ).length;

    return {
      averageFPS,
      slowFrames,
      averageRenderTime: Math.round(averageRenderTime * 100) / 100,
      slowRenders,
      networkRequests: networkMetrics.length,
      averageNetworkTime: Math.round(averageNetworkTime),
      memoryWarnings,
    };
  }, [metrics, renderMetrics, networkMetrics]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    setRenderMetrics(new Map());
    setNetworkMetrics([]);
    frameTimestamps.current = [];
  }, []);

  const value = useMemo(
    () => ({
      metrics,
      renderMetrics,
      networkMetrics,
      trackMetric,
      trackRender,
      trackNetworkRequest,
      scheduleAfterInteraction,
      measureRender,
      generateReport,
      clearMetrics,
      isMonitoringEnabled,
      setMonitoringEnabled,
    }),
    [
      metrics,
      renderMetrics,
      networkMetrics,
      trackMetric,
      trackRender,
      trackNetworkRequest,
      scheduleAfterInteraction,
      measureRender,
      generateReport,
      clearMetrics,
      isMonitoringEnabled,
    ]
  );

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * Hook to access performance context
 */
export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

/**
 * Hook to track component render time
 */
export function useRenderTracking(componentName: string) {
  const { trackRender, isMonitoringEnabled } = usePerformance();
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    if (!isMonitoringEnabled) return;

    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;

    renderCount.current += 1;
    trackRender(componentName, renderTime);

    lastRenderTime.current = currentTime;
  });
}

/**
 * Hook to schedule work after animations
 */
export function useAfterInteraction() {
  const { scheduleAfterInteraction } = usePerformance();

  return useCallback(
    (callback: () => void) => {
      scheduleAfterInteraction(callback);
    },
    [scheduleAfterInteraction]
  );
}

/**
 * Hook for lazy initialization
 */
export function useLazyInit<T>(factory: () => T, delay: number = 0): T | null {
  const [value, setValue] = useState<T | null>(null);
  const { scheduleAfterInteraction } = usePerformance();

  useEffect(() => {
    if (delay > 0) {
      const timeout = setTimeout(() => {
        scheduleAfterInteraction(() => {
          setValue(factory());
        });
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      scheduleAfterInteraction(() => {
        setValue(factory());
      });
    }
  }, []);

  return value;
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    useRenderTracking(componentName);
    return <WrappedComponent {...props} />;
  };
}
