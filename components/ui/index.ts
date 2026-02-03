/**
 * UI Components Export
 *
 * Reusable UI primitives for the app
 */

// Phase 2: Toast System
export {
  ToastProvider,
  useToast,
  useToastHelpers,
} from './Toast';
export type { ToastType, ToastOptions, ToastAction } from './Toast';

// Phase 2: Search Input
export {
  SearchInput,
  SearchWithHistory,
} from './SearchInput';

// Phase 2: Dialog System
export {
  BaseDialog,
  ConfirmDialog,
  AlertDialog,
  InputDialog,
} from './Dialog';
export type {
  BaseDialogProps,
  ConfirmDialogProps,
  AlertDialogProps,
  InputDialogProps,
} from './Dialog';

// Skeleton Loaders
export {
  SkeletonLoader,
  SkeletonText,
  SkeletonCard,
  SkeletonListItem,
  SkeletonAvatar,
  SkeletonGrid,
  // Phase 3: New custom skeletons
  FeatureCardSkeleton,
  ActivityItemSkeleton,
  AnalysisCardSkeleton,
  StoryCardSkeleton,
  ColoringCardSkeleton,
  XPProgressSkeleton,
  BadgeGridSkeleton,
  StatsCardSkeleton,
} from './SkeletonLoader';

// Phase 4: Empty States
export {
  EmptyState,
  NoAnalysisEmpty,
  NoStoriesEmpty,
  NoColoringEmpty,
  NoHistoryEmpty,
  SearchEmpty,
  ErrorEmpty,
  WelcomeEmpty,
} from './EmptyState';
export type { EmptyStateIllustration, IooMood } from './EmptyState';

// Phase 5: Error States
export {
  ErrorState,
  NetworkError,
  ServerError,
  AuthError,
  NotFoundError,
  GenericError,
} from './ErrorState';
export type { ErrorType } from './ErrorState';

export {
  InlineLoader,
  ButtonLoader,
  CardLoader,
  SectionLoader,
} from './InlineLoader';

export {
  AccessibleTouchable,
  AccessibleIconButton,
  AccessibleCard,
  AccessibleListItem,
} from './AccessibleTouchable';

// Phase 3: Enhanced Refresh
export {
  EnhancedRefreshControl,
  useEnhancedRefresh,
  AnimatedRefreshIndicator,
  PullIndicator,
} from './EnhancedRefresh';

// Phase 3: Smart Lists
export {
  SmartList,
  SmartGrid,
  SmartSectionList,
} from './SmartList';

// Phase 6: Offline Indicator
export {
  OfflineIndicator,
  OfflineBadge,
  OfflineIndicatorProvider,
} from './OfflineIndicator';

// Phase 6: Crash Recovery
export {
  CrashRecoveryDialog,
  useRecoveryPrompt,
} from './CrashRecoveryDialog';
