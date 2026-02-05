/**
 * Performance Monitor
 *
 * Runtime performance monitoring utilities for React Native
 * Tracks renders, API calls, and memory usage
 */

import { InteractionManager, Platform } from 'react-native';

// ============================================
// Types
// ============================================

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  /** Time to first render */
  ttfr?: number;
  /** Time to interactive */
  tti?: number;
  /** JS thread FPS */
  jsFps?: number;
  /** UI thread FPS */
  uiFps?: number;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Number of re-renders */
  renderCount: number;
  /** API call metrics */
  apiMetrics: {
    totalCalls: number;
    averageLatency: number;
    slowCalls: number;
  };
}

export interface ApiCallMetric {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: number;
  success: boolean;
}

// ============================================
// Performance Monitor Class
// ============================================

class PerformanceMonitorImpl {
  private marks: Map<string, PerformanceMark> = new Map();
  private renderCounts: Map<string, number> = new Map();
  private apiCalls: ApiCallMetric[] = [];
  private appStartTime: number = Date.now();
  private firstRenderTime?: number;
  private interactiveTime?: number;
  private enabled: boolean = __DEV__;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Track time to interactive
    InteractionManager.runAfterInteractions(() => {
      this.interactiveTime = Date.now() - this.appStartTime;
      if (this.enabled) {
        console.log(`[Performance] Time to Interactive: ${this.interactiveTime}ms`);
      }
    });
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Mark the start of a performance measurement
   */
  startMark(name: string, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    this.marks.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * Mark the end of a performance measurement
   */
  endMark(name: string): PerformanceMark | undefined {
    if (!this.enabled) return;

    const mark = this.marks.get(name);
    if (mark) {
      mark.endTime = Date.now();
      mark.duration = mark.endTime - mark.startTime;

      if (__DEV__) {
        console.log(`[Performance] ${name}: ${mark.duration}ms`);
      }

      return mark;
    }
    return undefined;
  }

  /**
   * Measure a function's execution time
   */
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    this.startMark(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endMark(name);
    }
  }

  /**
   * Track component render
   */
  trackRender(componentName: string): void {
    if (!this.enabled) return;

    const count = (this.renderCounts.get(componentName) || 0) + 1;
    this.renderCounts.set(componentName, count);

    // Track first render
    if (!this.firstRenderTime && componentName === 'App') {
      this.firstRenderTime = Date.now() - this.appStartTime;
      console.log(`[Performance] Time to First Render: ${this.firstRenderTime}ms`);
    }

    // Warn about excessive re-renders
    if (count > 10 && count % 10 === 0) {
      console.warn(`[Performance] ${componentName} has rendered ${count} times`);
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(metric: Omit<ApiCallMetric, 'duration'>): void {
    if (!this.enabled) return;

    const fullMetric: ApiCallMetric = {
      ...metric,
      duration: metric.endTime - metric.startTime,
    };

    this.apiCalls.push(fullMetric);

    // Keep only last 100 calls
    if (this.apiCalls.length > 100) {
      this.apiCalls = this.apiCalls.slice(-100);
    }

    // Warn about slow API calls (> 3 seconds)
    if (fullMetric.duration > 3000) {
      console.warn(
        `[Performance] Slow API call: ${metric.method} ${metric.url} took ${fullMetric.duration}ms`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const totalRenders = Array.from(this.renderCounts.values()).reduce((a, b) => a + b, 0);

    const apiMetrics = {
      totalCalls: this.apiCalls.length,
      averageLatency:
        this.apiCalls.length > 0
          ? this.apiCalls.reduce((sum, c) => sum + c.duration, 0) / this.apiCalls.length
          : 0,
      slowCalls: this.apiCalls.filter((c) => c.duration > 1000).length,
    };

    return {
      ttfr: this.firstRenderTime,
      tti: this.interactiveTime,
      renderCount: totalRenders,
      apiMetrics,
    };
  }

  /**
   * Get render counts by component
   */
  getRenderCounts(): Record<string, number> {
    return Object.fromEntries(this.renderCounts);
  }

  /**
   * Get API call history
   */
  getApiCalls(): ApiCallMetric[] {
    return [...this.apiCalls];
  }

  /**
   * Clear all metrics
   */
  reset(): void {
    this.marks.clear();
    this.renderCounts.clear();
    this.apiCalls = [];
  }

  /**
   * Generate a performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const renderCounts = this.getRenderCounts();

    const lines = [
      '═══════════════════════════════════════',
      '        PERFORMANCE REPORT',
      '═══════════════════════════════════════',
      '',
      '📊 Timing Metrics:',
      `   Time to First Render: ${metrics.ttfr ? `${metrics.ttfr}ms` : 'N/A'}`,
      `   Time to Interactive: ${metrics.tti ? `${metrics.tti}ms` : 'N/A'}`,
      '',
      '🔄 Render Metrics:',
      `   Total Renders: ${metrics.renderCount}`,
      '',
      '🌐 API Metrics:',
      `   Total Calls: ${metrics.apiMetrics.totalCalls}`,
      `   Average Latency: ${Math.round(metrics.apiMetrics.averageLatency)}ms`,
      `   Slow Calls (>1s): ${metrics.apiMetrics.slowCalls}`,
      '',
    ];

    // Top 10 most rendered components
    const sortedComponents = Object.entries(renderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    if (sortedComponents.length > 0) {
      lines.push('🔝 Top Rendered Components:');
      for (const [name, count] of sortedComponents) {
        lines.push(`   ${name}: ${count} renders`);
      }
    }

    lines.push('');
    lines.push('═══════════════════════════════════════');

    return lines.join('\n');
  }
}

// ============================================
// Singleton Export
// ============================================

export const PerformanceMonitor = new PerformanceMonitorImpl();

// ============================================
// React Hook for Performance Tracking
// ============================================

import { useEffect, useRef } from 'react';

/**
 * Hook to track component render performance
 *
 * @example
 * function MyComponent() {
 *   useRenderTracking('MyComponent');
 *   return <View>...</View>;
 * }
 */
export function useRenderTracking(componentName: string): void {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    PerformanceMonitor.trackRender(componentName);
  });
}

/**
 * Hook to measure effect duration
 *
 * @example
 * function MyComponent() {
 *   useEffectTiming('MyComponent.fetchData', () => {
 *     fetchData();
 *   }, []);
 * }
 */
export function useEffectTiming(
  name: string,
  effect: () => void | (() => void),
  deps: React.DependencyList
): void {
  useEffect(() => {
    PerformanceMonitor.startMark(name);
    const cleanup = effect();
    PerformanceMonitor.endMark(name);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
