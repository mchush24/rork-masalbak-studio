/**
 * SocialFeedSkeleton - Loading State
 *
 * Premium skeleton loading with:
 * - Shimmer animation
 * - Layout matching real content
 * - Smooth transitions
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { spacing, borderRadius } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonBoxProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
}

function SkeletonBox({ width, height, borderRadius: br = 8, style }: SkeletonBoxProps) {
  const shimmerAnim = useSharedValue(0);

  React.useEffect(() => {
    shimmerAnim.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerAnim.value, [0, 1], [-100, SCREEN_WIDTH]),
      },
    ],
  }));

  return (
    <View
      style={[
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          width: width as any,
          height,
          borderRadius: br,
          backgroundColor: '#E5E7EB',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 100, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

export function ExpertTipSkeleton() {
  return (
    <View style={styles.tipContainer}>
      <View style={styles.tipHeader}>
        <SkeletonBox width={42} height={42} borderRadius={21} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width={100} height={14} />
          <SkeletonBox width={80} height={10} />
        </View>
      </View>
      <SkeletonBox width="100%" height={16} style={{ marginTop: 12 }} />
      <SkeletonBox width="80%" height={16} style={{ marginTop: 8 }} />
      <SkeletonBox width="60%" height={16} style={{ marginTop: 8 }} />
      <SkeletonBox width={120} height={12} style={{ marginTop: 16 }} />
    </View>
  );
}

export function ActivityCarouselSkeleton() {
  return (
    <View style={styles.carouselContainer}>
      <View style={styles.sectionHeader}>
        <SkeletonBox width={120} height={18} />
        <SkeletonBox width={60} height={14} />
      </View>
      <View style={styles.carouselRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.activityCard}>
            <SkeletonBox width={52} height={52} borderRadius={16} />
            <SkeletonBox width="80%" height={14} style={{ marginTop: 12 }} />
            <SkeletonBox width="60%" height={12} style={{ marginTop: 6 }} />
            <View style={styles.activityFooter}>
              <SkeletonBox width={50} height={20} borderRadius={10} />
              <SkeletonBox width={28} height={28} borderRadius={14} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function GallerySkeleton() {
  const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;
  const CARD_HEIGHT = CARD_WIDTH * 1.2;

  return (
    <View style={styles.galleryContainer}>
      <View style={styles.sectionHeader}>
        <SkeletonBox width={140} height={18} />
        <SkeletonBox width={60} height={14} />
      </View>
      <View style={styles.galleryGrid}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.galleryCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            <SkeletonBox width="100%" height="85%" borderRadius={borderRadius.lg} />
            <View style={styles.galleryFooter}>
              <SkeletonBox width={40} height={18} />
              <SkeletonBox width={6} height={6} borderRadius={3} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function StoriesSkeleton() {
  return (
    <View style={styles.storiesContainer}>
      <View style={[styles.sectionHeader, { marginHorizontal: spacing.md }]}>
        <SkeletonBox width={130} height={18} />
        <SkeletonBox width={60} height={14} />
      </View>
      {[0, 1].map(i => (
        <View key={i} style={styles.storyCard}>
          <SkeletonBox width={40} height={40} borderRadius={12} />
          <SkeletonBox width="90%" height={14} style={{ marginTop: 16 }} />
          <SkeletonBox width="80%" height={14} style={{ marginTop: 8 }} />
          <SkeletonBox width="70%" height={14} style={{ marginTop: 8 }} />
          <View style={styles.storyFooter}>
            <SkeletonBox width={100} height={12} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <SkeletonBox width={40} height={20} />
              <SkeletonBox width={20} height={20} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function SocialFeedSkeleton() {
  return (
    <View style={styles.container}>
      <ExpertTipSkeleton />
      <ActivityCarouselSkeleton />
      <GallerySkeleton />
      <StoriesSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  tipContainer: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  carouselContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  carouselRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  activityCard: {
    width: 150,
    height: 190,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  galleryContainer: {
    marginBottom: spacing.lg,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  galleryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  galleryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  storiesContainer: {
    marginBottom: spacing.lg,
  },
  storyCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.xl,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default SocialFeedSkeleton;
