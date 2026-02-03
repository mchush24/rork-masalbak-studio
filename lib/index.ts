/**
 * Library Utilities Index
 * Central export for all lib modules
 *
 * Usage:
 * import { useForm, analytics, networkMonitor } from '@/lib';
 */

// Analytics
export {
  analytics,
  useAnalytics,
  useScreenTracking,
  useTimedEvent,
} from './analytics';
export type {
  EventCategory,
  AnalyticsEvent,
  UserProperties,
  ScreenView,
} from './analytics';

// Error Handling
export {
  globalErrorHandler,
  useGlobalErrorHandler,
  withErrorHandling,
  createError,
} from './error';
export type {
  ErrorSeverity,
  ErrorCategory,
  ProcessedError,
  RecoveryOption,
} from './error';

// Forms
export {
  useForm,
  useFieldValidation,
  commonSchemas,
  createPasswordConfirmSchema,
  createFormSchema,
} from './forms';
export type {
  FieldError,
  FieldState,
  FormState,
} from './forms';

// Media
export {
  OptimizedImage,
  AvatarImage,
  Thumbnail,
  useCachedImage,
  imageCache,
  getOptimizedDimensions,
  buildOptimizedUrl,
} from './media';

// Network
export {
  networkMonitor,
  useNetworkStatus,
  useIsOnline,
  useNetworkAwareOperation,
  useOfflineIndicator,
} from './network';
export type {
  NetworkQuality,
  NetworkStatus,
} from './network';

// Performance
export {
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
} from './performance';

// Persistence
export {
  statePersistence,
  useStatePersistence,
  useDraft,
  useCrashRecovery,
} from './persistence';
export type {
  SessionState,
  Draft,
  CrashRecoveryState,
} from './persistence';
