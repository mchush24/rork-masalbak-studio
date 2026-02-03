/**
 * Performance Optimization Module
 * Phase 19: Performance Optimization
 *
 * Provides utilities for:
 * - Animation optimization
 * - Image optimization
 * - Memory management
 * - Startup optimization
 * - Performance monitoring
 */

export { useOptimizedAnimation, useAnimationCleanup } from './AnimationOptimizer';
export { OptimizedImage, useImagePreloader } from './ImageOptimizer';
export { useMemoryManager, useComponentCleanup } from './MemoryManager';
export { useDeferredLoad, useCriticalPath } from './StartupOptimizer';
export { PerformanceMonitor, usePerformanceMetrics } from './PerformanceMonitor';
export { VirtualizedList, useVirtualization } from './VirtualizedList';

// Phase 4: Enhanced Performance Tracking
export {
  useRenderTracking,
  useInteractionTracking,
  useAPITracking,
  usePerformanceOverlay,
  measureTime,
  measureTimeAsync,
  runAfterInteractions,
  withPerformanceTracking,
  performanceStore,
} from './usePerformance';
