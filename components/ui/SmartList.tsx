/**
 * SmartList Component
 * Phase 3: UX Enhancement
 *
 * Virtualized list wrapper with:
 * - Built-in skeleton loading
 * - Empty states
 * - Pull-to-refresh
 * - Pagination support
 * - Error handling
 * - Animated items
 */

import React, { useCallback, useMemo, ReactElement } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import Animated, { FadeInDown, Layout as ReanimatedLayout } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { typography, spacing } from '@/constants/design-system';
import { IooEmptyState, EMPTY_STATE_PRESETS, IooMood } from '@/components/IooEmptyState';
import { EnhancedRefreshControl } from './EnhancedRefresh';
import { SkeletonListItem, SkeletonCard } from './SkeletonLoader';
import { ErrorState, ErrorType } from './ErrorState';

// Generic type for list data
type ListData = { id: string } & Record<string, unknown>;

interface SmartListProps<T extends ListData> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  /** List data */
  data: T[] | undefined;
  /** Render item function */
  renderItem: ListRenderItem<T>;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Error type for ErrorState */
  errorType?: ErrorType;
  /** Retry handler for error state */
  onRetry?: () => void;
  /** Refresh handler */
  onRefresh?: () => Promise<void>;
  /** Is refreshing */
  isRefreshing?: boolean;
  /** Load more handler */
  onLoadMore?: () => void;
  /** Has more data to load */
  hasMore?: boolean;
  /** Is loading more */
  isLoadingMore?: boolean;
  /** Skeleton type */
  skeletonType?: 'list' | 'card' | 'custom';
  /** Custom skeleton component */
  SkeletonComponent?: React.ComponentType;
  /** Number of skeleton items */
  skeletonCount?: number;
  /** Empty state preset or custom */
  emptyState?:
    | keyof typeof EMPTY_STATE_PRESETS
    | {
        title: string;
        message?: string;
        mood?: IooMood;
        action?: { label: string; onPress: () => void };
      };
  /** Animate items on scroll */
  animateItems?: boolean;
  /** Item animation delay */
  itemAnimationDelay?: number;
  /** Custom styles */
  containerStyle?: ViewStyle;
  /** Content container style */
  contentStyle?: ViewStyle;
  /** Header component */
  ListHeaderComponent?: ReactElement | null;
  /** Footer component (overridden by load more) */
  ListFooterComponent?: ReactElement | null;
}

const _AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export function SmartList<T extends ListData>({
  data,
  renderItem,
  isLoading = false,
  error,
  errorType = 'generic',
  onRetry,
  onRefresh,
  isRefreshing: _isRefreshing = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  skeletonType = 'list',
  SkeletonComponent,
  skeletonCount = 5,
  emptyState = 'noData',
  animateItems = true,
  itemAnimationDelay = 100,
  containerStyle,
  contentStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ...flatListProps
}: SmartListProps<T>) {
  // Animated render item wrapper
  const animatedRenderItem: ListRenderItem<T> = useCallback(
    ({ item, index, separators }) => {
      if (!animateItems) {
        return renderItem({ item, index, separators });
      }

      return (
        <Animated.View
          entering={FadeInDown.delay(index * itemAnimationDelay).springify()}
          layout={ReanimatedLayout.springify()}
        >
          {renderItem({ item, index, separators })}
        </Animated.View>
      );
    },
    [renderItem, animateItems, itemAnimationDelay]
  );

  // Skeleton loading
  const renderSkeleton = useMemo(() => {
    if (!isLoading) return null;

    const Skeleton =
      SkeletonComponent || (skeletonType === 'card' ? SkeletonCard : SkeletonListItem);

    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <View key={index} style={styles.skeletonItem}>
            <Skeleton />
          </View>
        ))}
      </View>
    );
  }, [isLoading, skeletonType, SkeletonComponent, skeletonCount]);

  // Footer with load more (must be before early returns to satisfy hooks rules)
  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color={Colors.primary.sunset} />
          <Text style={styles.loadMoreText}>Yükleniyor...</Text>
        </View>
      );
    }

    if (hasMore && onLoadMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <Text style={styles.loadMoreHint}>Daha fazla için kaydırın</Text>
        </View>
      );
    }

    return ListFooterComponent || null;
  }, [isLoadingMore, hasMore, onLoadMore, ListFooterComponent]);

  // Handle end reached for pagination (must be before early returns to satisfy hooks rules)
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Error state
  if (error && !isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ErrorState type={errorType} description={error.message} onRetry={onRetry} />
      </View>
    );
  }

  // Loading state
  if (isLoading && (!data || data.length === 0)) {
    return (
      <View style={[styles.container, containerStyle]}>
        {ListHeaderComponent}
        {renderSkeleton}
      </View>
    );
  }

  // Empty state
  const isEmpty = !data || data.length === 0;
  const emptyStateConfig =
    typeof emptyState === 'string' ? EMPTY_STATE_PRESETS[emptyState] : emptyState;

  // Refresh control
  const refreshControl = onRefresh ? <EnhancedRefreshControl onRefresh={onRefresh} /> : undefined;

  return (
    <FlatList
      data={data}
      renderItem={animatedRenderItem}
      keyExtractor={item => item.id}
      style={[styles.list, containerStyle]}
      contentContainerStyle={[
        styles.contentContainer,
        isEmpty && styles.emptyContentContainer,
        contentStyle,
      ]}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter()}
      ListEmptyComponent={
        isEmpty && !isLoading ? (
          <IooEmptyState
            title={emptyStateConfig.title}
            message={emptyStateConfig.message}
            mood={emptyStateConfig.mood}
            action={'action' in emptyStateConfig ? emptyStateConfig.action : undefined}
          />
        ) : null
      }
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
}

// Grid variant
interface SmartGridProps<T extends ListData> extends SmartListProps<T> {
  /** Number of columns */
  numColumns?: number;
  /** Gap between items */
  gap?: number;
}

export function SmartGrid<T extends ListData>({
  numColumns = 2,
  gap = spacing['4'],
  ...props
}: SmartGridProps<T>) {
  return (
    <SmartList
      {...props}
      numColumns={numColumns}
      columnWrapperStyle={{ gap }}
      contentContainerStyle={[{ gap }, props.contentStyle]}
      skeletonType="card"
    />
  );
}

// Section list variant
interface SectionData<T extends ListData> {
  title: string;
  data: T[];
}

interface SmartSectionListProps<T extends ListData> {
  sections: SectionData<T>[];
  renderItem: ListRenderItem<T>;
  renderSectionHeader?: (section: SectionData<T>) => ReactElement;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  emptyState?: keyof typeof EMPTY_STATE_PRESETS;
  containerStyle?: ViewStyle;
}

export function SmartSectionList<T extends ListData>({
  sections,
  renderItem,
  renderSectionHeader,
  isLoading = false,
  error,
  onRetry,
  onRefresh,
  isRefreshing = false,
  emptyState = 'noData',
  containerStyle,
}: SmartSectionListProps<T>) {
  // Flatten sections for FlatList
  const flatData = useMemo(() => {
    const items: { type: 'header' | 'item'; section?: SectionData<T>; item?: T; id: string }[] = [];

    sections.forEach((section, sectionIndex) => {
      items.push({
        type: 'header',
        section,
        id: `header-${sectionIndex}`,
      });
      section.data.forEach(item => {
        items.push({
          type: 'item',
          item,
          id: item.id,
        });
      });
    });

    return items;
  }, [sections]);

  const renderFlatItem: ListRenderItem<(typeof flatData)[0]> = useCallback(
    ({ item, index, separators }) => {
      if (item.type === 'header' && item.section) {
        if (renderSectionHeader) {
          return renderSectionHeader(item.section);
        }
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{item.section.title}</Text>
          </View>
        );
      }

      if (item.type === 'item' && item.item) {
        return renderItem({ item: item.item as T, index, separators });
      }

      return null;
    },
    [renderItem, renderSectionHeader]
  );

  const isEmpty = sections.every(s => s.data.length === 0);

  return (
    <SmartList
      data={flatData as unknown as ListData[]}
      renderItem={renderFlatItem as unknown as ListRenderItem<ListData>}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      emptyState={isEmpty ? emptyState : undefined}
      containerStyle={containerStyle}
      animateItems={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing['4'],
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonContainer: {
    padding: spacing['4'],
    gap: spacing['3'],
  },
  skeletonItem: {
    marginBottom: spacing['2'],
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4'],
    gap: spacing['2'],
  },
  loadMoreText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  loadMoreHint: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
  },
  sectionHeader: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    backgroundColor: Colors.neutral.lightest,
  },
  sectionHeaderText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default SmartList;
