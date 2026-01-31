/**
 * UI Components Export
 *
 * Reusable UI primitives for the app
 */

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
