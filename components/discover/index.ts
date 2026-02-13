/**
 * Discover Components
 *
 * Reusable sub-components extracted from the Discover screen.
 * These can be imported by discover.tsx, DiscoverSection (home page),
 * or any other screen that needs discover-style UI elements.
 *
 * Card components (ExpertTipCard, ActivityCard, etc.) live in
 * @/components/social-feed and are re-exported here for convenience.
 */

// Discover-specific components
export { SectionHeader } from './SectionHeader';
export { DiscoverEmptyState } from './DiscoverEmptyState';

// Re-export social feed cards for convenient single-import
export {
  ExpertTipCard,
  ActivityCard,
  CommunityGalleryCard,
  SuccessStoryCard,
  SocialFeedSkeleton,
  ExpertTipSkeleton,
  ActivityCarouselSkeleton,
  GallerySkeleton,
  StoriesSkeleton,
} from '@/components/social-feed';

// Re-export showcase data
export { SHOWCASE_GALLERY, SHOWCASE_STORIES } from '@/constants/showcase-data';
export type { ShowcaseGalleryItem, ShowcaseStoryItem } from '@/constants/showcase-data';
