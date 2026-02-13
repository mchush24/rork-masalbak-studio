/**
 * Virtualized List
 * Phase 19: Performance Optimization
 *
 * Optimized list rendering with virtualization
 */

import React, { useCallback, useMemo, memo, useRef } from 'react';
import { FlatList, FlatListProps, View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VirtualizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'data'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  estimatedItemSize?: number;
  overscan?: number;
  onEndReachedThreshold?: number;
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: React.ComponentType<unknown> | React.ReactElement;
  ListHeaderComponent?: React.ComponentType<unknown> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<unknown> | React.ReactElement;
}

/**
 * Optimized virtualized list component
 */
export function VirtualizedList<T>({
  data,
  renderItem,
  estimatedItemSize = 100,
  overscan = 5,
  onEndReachedThreshold = 0.5,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ...props
}: VirtualizedListProps<T>) {
  const listRef = useRef<FlatList>(null);

  // Memoize getItemLayout for performance
  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    }),
    [estimatedItemSize]
  );

  // Optimized render item wrapper
  const optimizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return renderItem(item, index);
    },
    [renderItem]
  );

  // Calculate window size based on screen height
  const windowSize = useMemo(() => {
    return Math.ceil(SCREEN_HEIGHT / estimatedItemSize) + overscan * 2;
  }, [estimatedItemSize, overscan]);

  // Optimization settings
  const optimizationProps = useMemo(
    () => ({
      removeClippedSubviews: Platform.OS !== 'web',
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: Math.ceil(SCREEN_HEIGHT / estimatedItemSize) + 2,
      windowSize,
      onEndReachedThreshold,
      maintainVisibleContentPosition: {
        minIndexForVisible: 0,
      },
    }),
    [estimatedItemSize, windowSize, onEndReachedThreshold]
  );

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={optimizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
      {...optimizationProps}
      {...props}
    />
  );
}

/**
 * Hook for list virtualization utilities
 */
export function useVirtualization<T>(
  data: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const { itemHeight, containerHeight, overscan = 3 } = options;

  const visibleCount = useMemo(() => {
    return Math.ceil(containerHeight / itemHeight);
  }, [containerHeight, itemHeight]);

  const totalHeight = useMemo(() => {
    return data.length * itemHeight;
  }, [data.length, itemHeight]);

  const getVisibleRange = useCallback(
    (scrollOffset: number) => {
      const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan);
      const endIndex = Math.min(
        data.length - 1,
        Math.ceil((scrollOffset + containerHeight) / itemHeight) + overscan
      );

      return { startIndex, endIndex };
    },
    [itemHeight, containerHeight, overscan, data.length]
  );

  const getItemOffset = useCallback(
    (index: number) => {
      return index * itemHeight;
    },
    [itemHeight]
  );

  const scrollToIndex = useCallback(
    (listRef: React.RefObject<FlatList>, index: number, animated = true) => {
      if (listRef.current) {
        listRef.current.scrollToIndex({
          index,
          animated,
          viewPosition: 0.5,
        });
      }
    },
    []
  );

  return {
    visibleCount,
    totalHeight,
    getVisibleRange,
    getItemOffset,
    scrollToIndex,
  };
}

/**
 * Optimized item wrapper with memoization
 */
export const MemoizedListItem = memo(function MemoizedListItem<T>({
  item,
  index,
  renderItem,
}: {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactElement;
}) {
  return renderItem(item, index);
});

/**
 * List item separator component
 */
export const ListItemSeparator = memo(function ListItemSeparator({
  height = 1,
  color = Colors.neutral.lighter,
  marginHorizontal = 0,
}: {
  height?: number;
  color?: string;
  marginHorizontal?: number;
}) {
  return (
    <View
      style={{
        height,
        backgroundColor: color,
        marginHorizontal,
      }}
    />
  );
});

/**
 * Loading footer for infinite scroll
 */
export const ListLoadingFooter = memo(function ListLoadingFooter({
  isLoading,
  height = 60,
}: {
  isLoading: boolean;
  height?: number;
}) {
  if (!isLoading) return null;

  return (
    <View style={[styles.loadingFooter, { height }]}>
      <View style={styles.loadingDot} />
      <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
      <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
    </View>
  );
});

const styles = StyleSheet.create({
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary.lavender,
    opacity: 0.3,
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
});
