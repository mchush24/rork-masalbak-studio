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
export { PerformanceMonitor } from './PerformanceMonitor';
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

// Memory Leak Prevention
export {
  useIsMounted,
  useSafeState,
  useCancellablePromise,
  useEventListenerCleanup,
  useSubscriptionCleanup,
  useAppStateAwareEffect,
  useCachedCallback,
  useMemoryWarning,
  WeakCache,
} from './useLeakPrevention';

// App Startup Optimization
export {
  startupManager,
  useAppStartup,
  createFontLoadTask,
  createAuthCheckTask,
  createCacheWarmTask,
  createAnalyticsTask,
  type StartupTask,
  type StartupMetrics,
  type StartupPhase,
} from './AppStartup';
