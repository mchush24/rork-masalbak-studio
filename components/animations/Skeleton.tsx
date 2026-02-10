/**
 * Skeleton - Standardized skeleton loading components
 *
 * Features:
 * - Shimmer animation
 * - Pulse animation
 * - Various shapes (text, circle, rect)
 * - Dark mode support
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { skeleton as skeletonConfig } from '@/constants/animations';
import { radius, spacing } from '@/constants/design-system';

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'thumbnail' | 'card' | 'button' | 'custom';
type AnimationType = 'shimmer' | 'pulse';

interface SkeletonProps {
  variant?: SkeletonVariant;
  animation?: AnimationType;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
}

const VARIANT_STYLES: Record<
  SkeletonVariant,
  { width: number | string; height: number; borderRadius: number }
> = {
  text: { width: '100%', height: 16, borderRadius: 4 },
  title: { width: '60%', height: 24, borderRadius: 6 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  thumbnail: { width: 80, height: 80, borderRadius: 12 },
  card: { width: '100%', height: 120, borderRadius: 16 },
  button: { width: 120, height: 44, borderRadius: 22 },
  custom: { width: '100%', height: 20, borderRadius: 4 },
};

export function Skeleton({
  variant = 'text',
  animation = 'shimmer',
  width,
  height,
  borderRadius,
  style,
  dark = false,
}: SkeletonProps) {
  const shimmerPosition = useSharedValue(-1);
  const pulseOpacity = useSharedValue(1);

  const variantStyle = VARIANT_STYLES[variant];
  const finalWidth = width ?? variantStyle.width;
  const finalHeight = height ?? variantStyle.height;
  const finalBorderRadius = borderRadius ?? variantStyle.borderRadius;

  const baseColor = dark ? '#2A2D38' : '#E8E8E8';
  const highlightColor = dark ? '#3A3D48' : '#F5F5F5';

  useEffect(() => {
    // Note: shimmerPosition and pulseOpacity are Reanimated shared values
    // and should NOT be in the dependency array (they're stable refs)
    // skeletonConfig is a constant import, so it's also stable
    if (animation === 'shimmer') {
      shimmerPosition.value = withRepeat(
        withTiming(1, {
          duration: skeletonConfig.shimmer.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(skeletonConfig.pulse.minOpacity, {
            duration: skeletonConfig.pulse.duration / 2,
          }),
          withTiming(skeletonConfig.pulse.maxOpacity, {
            duration: skeletonConfig.pulse.duration / 2,
          })
        ),
        -1,
        true
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation]);

  const shimmerStyle = useAnimatedStyle(() => {
    if (animation !== 'shimmer') return {};

    return {
      transform: [
        {
          translateX: interpolate(shimmerPosition.value, [-1, 1], [-200, 200]),
        },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    if (animation !== 'pulse') return {};

    return {
      opacity: pulseOpacity.value,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          width: finalWidth as any,
          height: finalHeight,
          borderRadius: finalBorderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      {animation === 'shimmer' && (
        <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', highlightColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}
      {animation === 'pulse' && (
        <Animated.View
          style={[
            styles.pulseOverlay,
            { backgroundColor: highlightColor, borderRadius: finalBorderRadius },
            pulseStyle,
          ]}
        />
      )}
    </View>
  );
}

// Preset skeleton groups
interface SkeletonGroupProps {
  lines?: number;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
}

export function SkeletonText({ lines = 3, style, dark }: SkeletonGroupProps) {
  return (
    <View style={[styles.textGroup, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '70%' : '100%'}
          dark={dark}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ style, dark }: { style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return (
    <View style={[styles.cardGroup, style]}>
      <View style={styles.cardHeader}>
        <Skeleton variant="avatar" dark={dark} />
        <View style={styles.cardHeaderText}>
          <Skeleton variant="title" width="60%" dark={dark} />
          <Skeleton variant="text" width="40%" height={12} dark={dark} />
        </View>
      </View>
      <SkeletonText lines={2} dark={dark} />
    </View>
  );
}

export function SkeletonList({ count = 3, style, dark }: SkeletonGroupProps & { count?: number }) {
  return (
    <View style={[styles.listGroup, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <Skeleton variant="thumbnail" width={60} height={60} dark={dark} />
          <View style={styles.listItemContent}>
            <Skeleton variant="title" width="80%" dark={dark} />
            <Skeleton variant="text" width="60%" height={14} dark={dark} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  shimmerGradient: {
    flex: 1,
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textGroup: {
    gap: spacing.sm,
  },
  cardGroup: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  listGroup: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  listItemContent: {
    flex: 1,
    gap: spacing.xs,
  },
});

export default Skeleton;
