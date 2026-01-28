/**
 * List Optimization Utilities
 *
 * Helpers for optimizing FlatList and ScrollView performance
 */

import { Dimensions, Platform } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Optimized FlatList props for better performance
 * Use these as default props for heavy lists
 */
export const FLATLIST_OPTIMIZED_PROPS = {
  // Remove items that are far from viewport
  removeClippedSubviews: Platform.OS !== 'web',

  // Reduce initial render batch size
  initialNumToRender: 10,

  // Max items to render beyond viewport
  maxToRenderPerBatch: 5,

  // Start rendering more items before reaching edge
  onEndReachedThreshold: 0.5,

  // Window size multiplier (1 = viewport height)
  windowSize: 5,

  // Update cells every N milliseconds at most
  updateCellsBatchingPeriod: 50,

  // Maintain scroll position when content changes
  maintainVisibleContentPosition: {
    minIndexForVisible: 0,
  },
} as const;

/**
 * Get optimized item layout for fixed-height items
 * This allows FlatList to skip measuring items
 */
export function getItemLayout(itemHeight: number, separatorHeight: number = 0) {
  return (data: any[] | null | undefined, index: number) => ({
    length: itemHeight + separatorHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
  });
}

/**
 * Key extractor for items with id
 */
export function keyExtractorId(item: { id: string | number }) {
  return String(item.id);
}

/**
 * Key extractor for items at index
 */
export function keyExtractorIndex(item: any, index: number) {
  return String(index);
}

/**
 * Calculate optimal batch sizes based on item height
 */
export function calculateBatchSizes(itemHeight: number) {
  const itemsPerScreen = Math.ceil(SCREEN_HEIGHT / itemHeight);

  return {
    initialNumToRender: Math.ceil(itemsPerScreen * 1.5),
    maxToRenderPerBatch: Math.ceil(itemsPerScreen / 2),
    windowSize: 3,
  };
}

/**
 * Placeholder item heights for common patterns
 */
export const ITEM_HEIGHTS = {
  smallCard: 80,
  mediumCard: 120,
  largeCard: 200,
  listItem: 64,
  compactListItem: 48,
  gridItem: 150,
} as const;

/**
 * Scroll performance configs
 */
export const SCROLL_PERFORMANCE = {
  // Disable scroll indicator for cleaner look + tiny perf gain
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,

  // Optimize scroll event handling
  scrollEventThrottle: 16, // 60fps

  // Deceleration rate
  decelerationRate: Platform.OS === 'ios' ? 'normal' : 0.985,

  // Bounce settings
  bounces: true,
  overScrollMode: 'never' as const,
} as const;

/**
 * Virtualization settings for very large lists
 */
export const VIRTUALIZATION_CONFIG = {
  // Only render items near viewport
  removeClippedSubviews: true,

  // Aggressive memory management
  maxToRenderPerBatch: 3,
  updateCellsBatchingPeriod: 100,
  windowSize: 3,

  // Start loading more items early
  onEndReachedThreshold: 1,
} as const;
