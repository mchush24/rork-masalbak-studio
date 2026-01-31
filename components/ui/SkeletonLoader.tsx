/**
 * SkeletonLoader Component - Enhanced
 * Phase 3: Skeleton Loader Enhancement
 *
 * Shimmer-effect skeleton loaders for content placeholders
 * - Gradient shimmer effect (left to right)
 * - Reanimated smooth animation
 * - Rounded corners matching content
 * - Custom skeleton variants for feature cards
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circle' | 'card' | 'image' | 'button' | 'badge';
  /** Base color for skeleton background */
  baseColor?: string;
  /** Highlight color for shimmer effect */
  highlightColor?: string;
  /** Animation duration in ms */
  duration?: number;
}

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  variant = 'text',
  baseColor = Colors.neutral.lighter,
  highlightColor = Colors.neutral.white,
  duration = 1500,
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    animation.start();
    return () => animation.stop();
  }, [duration, shimmerAnim]);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        return {
          width: height,
          height: height,
          borderRadius: height / 2,
        };
      case 'card':
        return {
          width: width,
          height: height || 120,
          borderRadius: radius.xl,
        };
      case 'image':
        return {
          width: width,
          height: height || 200,
          borderRadius: radius.lg,
        };
      case 'button':
        return {
          width: width,
          height: height || 48,
          borderRadius: radius.full,
        };
      case 'badge':
        return {
          width: width || 80,
          height: height || 24,
          borderRadius: radius.full,
        };
      default:
        return {
          width: width,
          height: height,
          borderRadius: borderRadius,
        };
    }
  };

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: baseColor },
        getVariantStyles(),
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            highlightColor,
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

// Pre-built skeleton patterns
interface SkeletonPatternProps {
  count?: number;
}

export function SkeletonText({ count = 3 }: SkeletonPatternProps) {
  return (
    <View style={styles.textPattern}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === count - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginBottom: spacing['2'] }}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.cardPattern}>
      <SkeletonLoader variant="image" height={160} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="70%" height={18} style={{ marginBottom: spacing['2'] }} />
        <SkeletonLoader width="90%" height={12} style={{ marginBottom: spacing['1'] }} />
        <SkeletonLoader width="50%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View style={styles.listItemPattern}>
      <SkeletonLoader variant="circle" height={48} />
      <View style={styles.listItemContent}>
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: spacing['1'] }} />
        <SkeletonLoader width="40%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return <SkeletonLoader variant="circle" height={size} />;
}

export function SkeletonGrid({ columns = 2, rows = 2 }: { columns?: number; rows?: number }) {
  return (
    <View style={styles.gridPattern}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <View key={colIndex} style={[styles.gridItem, { flex: 1 }]}>
              <SkeletonLoader variant="card" height={100} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ============================================
// PHASE 3: New Custom Skeletons
// ============================================

/**
 * Feature Card Skeleton
 * Matches FeatureCard component layout
 */
export function FeatureCardSkeleton() {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureCardHeader}>
        <SkeletonLoader variant="circle" height={56} />
        <View style={styles.featureCardBadge}>
          <SkeletonLoader variant="badge" width={60} height={20} />
        </View>
      </View>
      <SkeletonLoader width="80%" height={20} style={{ marginBottom: spacing['2'] }} />
      <SkeletonLoader width="100%" height={12} style={{ marginBottom: spacing['1'] }} />
      <SkeletonLoader width="60%" height={12} />
    </View>
  );
}

/**
 * Activity Item Skeleton
 * For activity feed items
 */
export function ActivityItemSkeleton() {
  return (
    <View style={styles.activityItem}>
      <SkeletonLoader variant="circle" height={44} />
      <View style={styles.activityContent}>
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing['1'] }} />
        <SkeletonLoader width="40%" height={12} />
      </View>
      <SkeletonLoader width={60} height={24} borderRadius={radius.md} />
    </View>
  );
}

/**
 * Analysis Card Skeleton
 * Matches analysis card layout
 */
export function AnalysisCardSkeleton() {
  return (
    <View style={styles.analysisCard}>
      <View style={styles.analysisHeader}>
        <SkeletonLoader variant="image" height={120} width={120} />
        <View style={styles.analysisInfo}>
          <SkeletonLoader width="80%" height={18} style={{ marginBottom: spacing['2'] }} />
          <SkeletonLoader width="60%" height={14} style={{ marginBottom: spacing['2'] }} />
          <View style={styles.analysisTagRow}>
            <SkeletonLoader variant="badge" width={70} height={22} />
            <SkeletonLoader variant="badge" width={50} height={22} />
          </View>
        </View>
      </View>
      <View style={styles.analysisSummary}>
        <SkeletonLoader width="100%" height={12} style={{ marginBottom: spacing['1'] }} />
        <SkeletonLoader width="90%" height={12} style={{ marginBottom: spacing['1'] }} />
        <SkeletonLoader width="70%" height={12} />
      </View>
    </View>
  );
}

/**
 * Story Card Skeleton
 * Matches story card layout
 */
export function StoryCardSkeleton() {
  return (
    <View style={styles.storyCard}>
      <SkeletonLoader variant="image" height={140} />
      <View style={styles.storyContent}>
        <SkeletonLoader width="85%" height={18} style={{ marginBottom: spacing['2'] }} />
        <SkeletonLoader width="100%" height={12} style={{ marginBottom: spacing['1'] }} />
        <SkeletonLoader width="75%" height={12} style={{ marginBottom: spacing['3'] }} />
        <View style={styles.storyFooter}>
          <SkeletonLoader variant="badge" width={80} height={22} />
          <SkeletonLoader width={60} height={14} />
        </View>
      </View>
    </View>
  );
}

/**
 * Coloring Card Skeleton
 * Matches coloring history card layout
 */
export function ColoringCardSkeleton() {
  return (
    <View style={styles.coloringCard}>
      <SkeletonLoader variant="image" height={160} />
      <View style={styles.coloringContent}>
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing['2'] }} />
        <View style={styles.coloringMeta}>
          <SkeletonLoader width={80} height={12} />
          <SkeletonLoader width={60} height={12} />
        </View>
      </View>
    </View>
  );
}

/**
 * XP Progress Skeleton
 * Matches XP progress bar layout
 */
export function XPProgressSkeleton() {
  return (
    <View style={styles.xpProgress}>
      <View style={styles.xpHeader}>
        <SkeletonLoader width={80} height={16} />
        <SkeletonLoader width={60} height={14} />
      </View>
      <SkeletonLoader width="100%" height={12} borderRadius={radius.full} />
    </View>
  );
}

/**
 * Badge Grid Skeleton
 * Matches badge grid layout
 */
export function BadgeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.badgeGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.badgeItem}>
          <SkeletonLoader variant="circle" height={48} />
          <SkeletonLoader width={50} height={10} style={{ marginTop: spacing['1'] }} />
        </View>
      ))}
    </View>
  );
}

/**
 * Stats Card Skeleton
 * For dashboard stats
 */
export function StatsCardSkeleton() {
  return (
    <View style={styles.statsCard}>
      <SkeletonLoader variant="circle" height={32} />
      <SkeletonLoader width={40} height={24} style={{ marginVertical: spacing['2'] }} />
      <SkeletonLoader width={60} height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  shimmerGradient: {
    flex: 1,
    width: SCREEN_WIDTH * 2,
  },

  // Pattern styles
  textPattern: {
    width: '100%',
  },
  cardPattern: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  cardContent: {
    padding: spacing['4'],
  },
  listItemPattern: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    gap: spacing['3'],
  },
  listItemContent: {
    flex: 1,
  },
  gridPattern: {
    gap: spacing['3'],
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  gridItem: {
    flex: 1,
  },

  // Feature Card Skeleton
  featureCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['5'],
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing['4'],
  },
  featureCardBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },

  // Activity Item Skeleton
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['4'],
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  activityContent: {
    flex: 1,
  },

  // Analysis Card Skeleton
  analysisCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  analysisHeader: {
    flexDirection: 'row',
    gap: spacing['4'],
    marginBottom: spacing['4'],
  },
  analysisInfo: {
    flex: 1,
  },
  analysisTagRow: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  analysisSummary: {
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },

  // Story Card Skeleton
  storyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  storyContent: {
    padding: spacing['4'],
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Coloring Card Skeleton
  coloringCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  coloringContent: {
    padding: spacing['4'],
  },
  coloringMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // XP Progress Skeleton
  xpProgress: {
    gap: spacing['2'],
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Badge Grid Skeleton
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['4'],
  },
  badgeItem: {
    alignItems: 'center',
    width: 64,
  },

  // Stats Card Skeleton
  statsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['4'],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    flex: 1,
  },
});

export default SkeletonLoader;
