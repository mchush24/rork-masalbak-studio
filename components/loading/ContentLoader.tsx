/**
 * ContentLoader - Smart content loading states
 * Phase 13: Loading States 2.0
 *
 * Provides intelligent loading states with:
 * - Automatic skeleton selection
 * - Error/empty states
 * - Refresh handling
 * - Progressive loading
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { AlertCircle, RefreshCw, Inbox, WifiOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/lib/haptics';
import { SkeletonCard, SkeletonList, SkeletonProfile, SkeletonChart } from './SkeletonLoader';

type LoadingState = 'loading' | 'success' | 'error' | 'empty' | 'offline';
type ContentType = 'list' | 'card' | 'profile' | 'chart' | 'custom';

interface ContentLoaderProps {
  children: React.ReactNode;
  state: LoadingState;
  contentType?: ContentType;
  customSkeleton?: React.ReactNode;
  errorMessage?: string;
  emptyMessage?: string;
  emptyTitle?: string;
  onRetry?: () => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  skeletonCount?: number;
  minLoadingTime?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Smart content loader with automatic skeleton selection
 */
export function ContentLoader({
  children,
  state,
  contentType = 'list',
  customSkeleton,
  errorMessage = 'Bir hata oluştu',
  emptyMessage = 'Henüz içerik yok',
  emptyTitle = 'Boş',
  onRetry,
  onRefresh,
  refreshing = false,
  skeletonCount = 3,
  minLoadingTime = 0,
  style,
}: ContentLoaderProps) {
  const [showContent, setShowContent] = useState(state === 'success');
  const { tapMedium, error: _hapticError } = useHaptics();

  useEffect(() => {
    if (state === 'success') {
      if (minLoadingTime > 0) {
        const timeout = setTimeout(() => setShowContent(true), minLoadingTime);
        return () => clearTimeout(timeout);
      }
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [state, minLoadingTime]);

  const handleRetry = () => {
    tapMedium();
    onRetry?.();
  };

  const renderSkeleton = () => {
    if (customSkeleton) return customSkeleton;

    switch (contentType) {
      case 'list':
        return <SkeletonList count={skeletonCount} />;
      case 'card':
        return <SkeletonCard variant="standard" />;
      case 'profile':
        return <SkeletonProfile />;
      case 'chart':
        return <SkeletonChart type="bar" />;
      default:
        return <SkeletonList count={skeletonCount} />;
    }
  };

  const renderErrorState = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.stateContainer}
    >
      <View style={styles.stateIconContainer}>
        <AlertCircle size={48} color={Colors.emotion.fear} />
      </View>
      <Animated.Text style={styles.stateTitle}>Hata</Animated.Text>
      <Animated.Text style={styles.stateMessage}>{errorMessage}</Animated.Text>
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <RefreshCw size={18} color={Colors.neutral.white} />
          <Animated.Text style={styles.retryButtonText}>Tekrar Dene</Animated.Text>
        </Pressable>
      )}
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.stateContainer}
    >
      <View style={[styles.stateIconContainer, styles.emptyIconContainer]}>
        <Inbox size={48} color={Colors.neutral.medium} />
      </View>
      <Animated.Text style={styles.stateTitle}>{emptyTitle}</Animated.Text>
      <Animated.Text style={styles.stateMessage}>{emptyMessage}</Animated.Text>
    </Animated.View>
  );

  const renderOfflineState = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.stateContainer}
    >
      <View style={[styles.stateIconContainer, styles.offlineIconContainer]}>
        <WifiOff size={48} color={Colors.neutral.medium} />
      </View>
      <Animated.Text style={styles.stateTitle}>Çevrimdışı</Animated.Text>
      <Animated.Text style={styles.stateMessage}>İnternet bağlantınızı kontrol edin</Animated.Text>
      {onRetry && (
        <Pressable style={[styles.retryButton, styles.offlineRetryButton]} onPress={handleRetry}>
          <RefreshCw size={18} color={Colors.secondary.lavender} />
          <Animated.Text style={[styles.retryButtonText, styles.offlineRetryButtonText]}>
            Tekrar Dene
          </Animated.Text>
        </Pressable>
      )}
    </Animated.View>
  );

  const content = onRefresh ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.secondary.lavender}
          colors={[Colors.secondary.lavender]}
        />
      }
    >
      {showContent ? children : null}
    </ScrollView>
  ) : showContent ? (
    children
  ) : null;

  return (
    <View style={[styles.container, style]}>
      {state === 'loading' && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          {renderSkeleton()}
        </Animated.View>
      )}
      {state === 'error' && renderErrorState()}
      {state === 'empty' && renderEmptyState()}
      {state === 'offline' && renderOfflineState()}
      {state === 'success' && content}
    </View>
  );
}

interface ProgressiveLoaderProps {
  children: React.ReactNode[];
  loadingDelay?: number;
  staggerDelay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Progressive loader that reveals content in stages
 */
export function ProgressiveLoader({
  children,
  loadingDelay = 0,
  staggerDelay = 100,
  style,
}: ProgressiveLoaderProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= children.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, staggerDelay);

      return () => clearInterval(interval);
    }, loadingDelay);

    return () => clearTimeout(startTimeout);
  }, [children.length, loadingDelay, staggerDelay]);

  return (
    <View style={[styles.progressiveContainer, style]}>
      {children.map((child, index) => (
        <Animated.View
          key={index}
          entering={index < visibleCount ? FadeIn.duration(300) : undefined}
          style={index >= visibleCount ? styles.hidden : undefined}
        >
          {index < visibleCount ? child : null}
        </Animated.View>
      ))}
    </View>
  );
}

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  endMessage?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Infinite scroll loader for paginated content
 */
export function InfiniteScrollLoader({
  isLoading,
  hasMore,
  onLoadMore,
  children,
  loadingComponent,
  endMessage = 'Tüm içerik yüklendi',
  style,
}: InfiniteScrollLoaderProps) {
  const spinRotation = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      spinRotation.value = withTiming(360, { duration: 1000 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRotation.value}deg` }],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <ScrollView
      style={[styles.infiniteScrollContainer, style]}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      {children}
      {isLoading && (
        <View style={styles.infiniteLoadingContainer}>
          {loadingComponent || (
            <Animated.View style={spinStyle}>
              <RefreshCw size={24} color={Colors.secondary.lavender} />
            </Animated.View>
          )}
        </View>
      )}
      {!hasMore && !isLoading && (
        <Animated.Text style={styles.endMessage}>{endMessage}</Animated.Text>
      )}
    </ScrollView>
  );
}

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  style?: StyleProp<ViewStyle>;
}

/**
 * Enhanced pull-to-refresh wrapper
 */
export function PullToRefresh({ children, onRefresh, style }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={[styles.pullToRefreshContainer, style]}
      contentContainerStyle={styles.pullToRefreshContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.secondary.lavender}
          colors={[Colors.secondary.lavender]}
          progressBackgroundColor={Colors.neutral.white}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // State containers
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  stateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconContainer: {
    backgroundColor: Colors.neutral.lighter,
  },
  offlineIconContainer: {
    backgroundColor: Colors.neutral.lighter,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral.dark,
    marginBottom: 8,
  },
  stateMessage: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // Retry button
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondary.lavender,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  offlineRetryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.secondary.lavender,
  },
  offlineRetryButtonText: {
    color: Colors.secondary.lavender,
  },

  // Progressive loader
  progressiveContainer: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
  },

  // Infinite scroll
  infiniteScrollContainer: {
    flex: 1,
  },
  infiniteLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  endMessage: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
    color: Colors.neutral.medium,
  },

  // Pull to refresh
  pullToRefreshContainer: {
    flex: 1,
  },
  pullToRefreshContent: {
    flexGrow: 1,
  },
});

export default {
  ContentLoader,
  ProgressiveLoader,
  InfiniteScrollLoader,
  PullToRefresh,
};
