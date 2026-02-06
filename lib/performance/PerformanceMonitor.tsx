/**
 * Performance Monitor
 * Phase 19: Performance Optimization
 *
 * Monitors and reports performance metrics
 */

import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  InteractionManager,
  Platform,
} from 'react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { zIndex } from '@/constants/design-system';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  jsThreadBlocked: boolean;
  renderTime: number;
  lastUpdate: number;
}

// Global metrics store
let globalMetrics: PerformanceMetrics = {
  fps: 60,
  memoryUsage: 0,
  jsThreadBlocked: false,
  renderTime: 0,
  lastUpdate: Date.now(),
};

// FPS tracking
let frameCount = 0;
let lastFpsUpdate = Date.now();
let fpsHistory: number[] = [];

/**
 * Track FPS
 */
function updateFps() {
  frameCount++;
  const now = Date.now();
  const elapsed = now - lastFpsUpdate;

  if (elapsed >= 1000) {
    const fps = Math.round((frameCount * 1000) / elapsed);
    fpsHistory.push(fps);
    if (fpsHistory.length > 60) fpsHistory.shift();
    
    globalMetrics.fps = fps;
    globalMetrics.lastUpdate = now;
    
    frameCount = 0;
    lastFpsUpdate = now;
  }

  if (Platform.OS !== 'web') {
    requestAnimationFrame(updateFps);
  }
}

// Start FPS tracking
if (Platform.OS !== 'web' && __DEV__) {
  requestAnimationFrame(updateFps);
}

/**
 * Hook for accessing performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(globalMetrics);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!__DEV__) return;

    intervalRef.current = setInterval(() => {
      setMetrics({ ...globalMetrics });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const measureRender = useCallback((name: string) => {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      globalMetrics.renderTime = duration;
      if (__DEV__ && duration > 16) {
        console.warn('[Performance] Slow render: ' + name + ' took ' + duration + 'ms');
      }
    };
  }, []);

  const checkJsThread = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      const start = Date.now();
      InteractionManager.runAfterInteractions(() => {
        const blocked = Date.now() - start > 100;
        globalMetrics.jsThreadBlocked = blocked;
        resolve(blocked);
      });
    });
  }, []);

  const getAverageFps = useCallback((): number => {
    if (fpsHistory.length === 0) return 60;
    return Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
  }, []);

  return {
    metrics,
    measureRender,
    checkJsThread,
    getAverageFps,
    isLowPerformance: metrics.fps < 30,
  };
}

interface PerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Visual performance monitor overlay (development only)
 */
export const PerformanceMonitor = memo(function PerformanceMonitor({
  visible = true,
  position = 'top-right',
}: PerformanceMonitorProps) {
  const { metrics, isLowPerformance, getAverageFps } = usePerformanceMetrics();

  if (!__DEV__ || !visible) {
    return null;
  }

  const positionStyle = {
    'top-left': { top: 50, left: 10 },
    'top-right': { top: 50, right: 10 },
    'bottom-left': { bottom: 100, left: 10 },
    'bottom-right': { bottom: 100, right: 10 },
  }[position];

  const fpsColor = metrics.fps >= 55 ? '#22C55E' : metrics.fps >= 30 ? '#F59E0B' : '#EF4444';

  return (
    <View style={[styles.container, positionStyle]} pointerEvents="none">
      <View style={styles.row}>
        <Text style={styles.label}>FPS</Text>
        <Text style={[styles.value, { color: fpsColor }]}>{metrics.fps}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>AVG</Text>
        <Text style={styles.value}>{getAverageFps()}</Text>
      </View>
      {metrics.renderTime > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Render</Text>
          <Text style={[styles.value, metrics.renderTime > 16 && { color: '#F59E0B' }]}>
            {metrics.renderTime}ms
          </Text>
        </View>
      )}
      {isLowPerformance && (
        <View style={styles.warningBadge}>
          <Text style={styles.warningText}>SLOW</Text>
        </View>
      )}
    </View>
  );
});

/**
 * Higher-order component for measuring render performance
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function PerformanceTrackedComponent(props: P) {
    const startTime = useRef(Date.now());

    useEffect(() => {
      const renderTime = Date.now() - startTime.current;
      if (__DEV__ && renderTime > 100) {
        console.warn('[Performance] ' + componentName + ' initial render: ' + renderTime + 'ms');
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
}

/**
 * Profile a function execution time
 */
export function profileFunction<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = Date.now();
    const result = fn(...args);
    const duration = Date.now() - start;

    if (__DEV__ && duration > 10) {
      console.log('[Profile] ' + name + ': ' + duration + 'ms');
    }

    return result;
  }) as T;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
    zIndex: zIndex.debug,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginRight: 8,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  warningBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'center',
  },
  warningText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
