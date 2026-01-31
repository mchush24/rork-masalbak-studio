/**
 * SkeletonLoader - Advanced skeleton loading states
 * Phase 13: Loading States 2.0
 *
 * Provides shimmer-animated skeleton placeholders:
 * - Text skeletons (single/multi-line)
 * - Card skeletons
 * - Image skeletons
 * - Avatar skeletons
 * - Custom shapes
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Dimensions, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { UIColors as Colors } from '@/constants/color-aliases';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonBaseProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Base skeleton component with shimmer effect
 */
export function SkeletonBase({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonBaseProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerPosition.value,
          [0, 1],
          [-SCREEN_WIDTH, SCREEN_WIDTH]
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lineSpacing?: number;
  lastLineWidth?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

/**
 * Text skeleton with multiple lines
 */
export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  lineSpacing = 8,
  lastLineWidth = '60%',
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          borderRadius={4}
          style={{ marginBottom: index < lines - 1 ? lineSpacing : 0 }}
        />
      ))}
    </View>
  );
}

interface SkeletonAvatarProps {
  size?: number;
  shape?: 'circle' | 'square';
  style?: StyleProp<ViewStyle>;
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({
  size = 48,
  shape = 'circle',
  style,
}: SkeletonAvatarProps) {
  return (
    <SkeletonBase
      width={size}
      height={size}
      borderRadius={shape === 'circle' ? size / 2 : 8}
      style={style}
    />
  );
}

interface SkeletonImageProps {
  width?: DimensionValue;
  height?: number;
  aspectRatio?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Image skeleton with aspect ratio support
 */
export function SkeletonImage({
  width = '100%',
  height,
  aspectRatio = 16 / 9,
  borderRadius = 12,
  style,
}: SkeletonImageProps) {
  const calculatedHeight = height || (typeof width === 'number' ? width / aspectRatio : 200);

  return (
    <SkeletonBase
      width={width}
      height={calculatedHeight}
      borderRadius={borderRadius}
      style={style}
    />
  );
}

interface SkeletonCardProps {
  variant?: 'standard' | 'horizontal' | 'compact';
  showImage?: boolean;
  showAvatar?: boolean;
  textLines?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Card skeleton with different variants
 */
export function SkeletonCard({
  variant = 'standard',
  showImage = true,
  showAvatar = false,
  textLines = 2,
  style,
}: SkeletonCardProps) {
  if (variant === 'horizontal') {
    return (
      <View style={[styles.horizontalCard, style]}>
        {showImage && (
          <SkeletonBase width={80} height={80} borderRadius={12} />
        )}
        <View style={styles.horizontalCardContent}>
          {showAvatar && (
            <View style={styles.avatarRow}>
              <SkeletonAvatar size={32} />
              <SkeletonBase width={100} height={14} style={{ marginLeft: 8 }} />
            </View>
          )}
          <SkeletonBase width="80%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonText lines={textLines} lineHeight={12} lineSpacing={6} />
        </View>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={[styles.compactCard, style]}>
        {showAvatar && <SkeletonAvatar size={40} style={{ marginRight: 12 }} />}
        <View style={styles.compactCardContent}>
          <SkeletonBase width="70%" height={16} style={{ marginBottom: 6 }} />
          <SkeletonBase width="50%" height={12} />
        </View>
      </View>
    );
  }

  // Standard variant
  return (
    <View style={[styles.standardCard, style]}>
      {showImage && <SkeletonImage aspectRatio={16 / 9} style={{ marginBottom: 12 }} />}
      {showAvatar && (
        <View style={styles.avatarRow}>
          <SkeletonAvatar size={36} />
          <SkeletonBase width={120} height={14} style={{ marginLeft: 10 }} />
        </View>
      )}
      <SkeletonBase width="85%" height={20} style={{ marginBottom: 8, marginTop: showAvatar ? 12 : 0 }} />
      <SkeletonText lines={textLines} lineHeight={14} lineSpacing={6} />
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  itemVariant?: 'standard' | 'horizontal' | 'compact';
  showImage?: boolean;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * List skeleton with multiple items
 */
export function SkeletonList({
  count = 3,
  itemVariant = 'compact',
  showImage = false,
  showAvatar = true,
  style,
}: SkeletonListProps) {
  return (
    <View style={[styles.listContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          variant={itemVariant}
          showImage={showImage}
          showAvatar={showAvatar}
          style={{ marginBottom: index < count - 1 ? 12 : 0 }}
        />
      ))}
    </View>
  );
}

interface SkeletonGridProps {
  columns?: number;
  count?: number;
  itemSize?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Grid skeleton layout
 */
export function SkeletonGrid({
  columns = 2,
  count = 4,
  itemSize = 150,
  gap = 12,
  style,
}: SkeletonGridProps) {
  return (
    <View style={[styles.gridContainer, { gap }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.gridItem,
            { width: `${(100 - gap * (columns - 1) / 4) / columns}%` },
          ]}
        >
          <SkeletonBase width="100%" height={itemSize} borderRadius={16} />
          <SkeletonBase width="80%" height={14} style={{ marginTop: 8 }} />
          <SkeletonBase width="50%" height={12} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

interface SkeletonChartProps {
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Chart skeleton placeholder
 */
export function SkeletonChart({
  type = 'bar',
  height = 200,
  style,
}: SkeletonChartProps) {
  if (type === 'pie') {
    return (
      <View style={[styles.chartContainer, { height }, style]}>
        <SkeletonBase width={height * 0.7} height={height * 0.7} borderRadius={height * 0.35} />
      </View>
    );
  }

  if (type === 'line') {
    return (
      <View style={[styles.chartContainer, { height }, style]}>
        <View style={styles.lineChartBars}>
          {Array.from({ length: 7 }).map((_, index) => (
            <View key={index} style={styles.lineChartPoint}>
              <SkeletonBase width={8} height={8} borderRadius={4} />
            </View>
          ))}
        </View>
        <SkeletonBase width="100%" height={2} style={{ marginTop: 'auto' }} />
      </View>
    );
  }

  // Bar chart
  return (
    <View style={[styles.chartContainer, { height }, style]}>
      <View style={styles.barChartBars}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBase
            key={index}
            width={30}
            height={height * (0.3 + Math.random() * 0.5)}
            borderRadius={4}
          />
        ))}
      </View>
      <SkeletonBase width="100%" height={2} style={{ marginTop: 8 }} />
    </View>
  );
}

interface SkeletonProfileProps {
  showCover?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Profile page skeleton
 */
export function SkeletonProfile({
  showCover = true,
  style,
}: SkeletonProfileProps) {
  return (
    <View style={[styles.profileContainer, style]}>
      {showCover && <SkeletonBase width="100%" height={120} borderRadius={0} />}
      <View style={styles.profileContent}>
        <SkeletonAvatar
          size={80}
          style={[styles.profileAvatar, showCover && { marginTop: -40 }]}
        />
        <SkeletonBase width={150} height={22} style={{ marginTop: 12 }} />
        <SkeletonBase width={100} height={14} style={{ marginTop: 8 }} />
        <SkeletonText lines={2} style={{ marginTop: 16, width: '80%' }} />

        <View style={styles.profileStats}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.profileStat}>
              <SkeletonBase width={40} height={24} />
              <SkeletonBase width={60} height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base
  skeletonBase: {
    backgroundColor: Colors.neutral.lighter,
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerGradient: {
    flex: 1,
    width: SCREEN_WIDTH,
  },

  // Text
  textContainer: {
    width: '100%',
  },

  // Cards
  standardCard: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
  },
  compactCardContent: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // List
  listContainer: {
    width: '100%',
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    marginBottom: 16,
  },

  // Chart
  chartContainer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    flex: 1,
  },
  lineChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  lineChartPoint: {
    alignItems: 'center',
  },

  // Profile
  profileContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileContent: {
    alignItems: 'center',
    padding: 16,
  },
  profileAvatar: {
    borderWidth: 4,
    borderColor: Colors.neutral.white,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  profileStat: {
    alignItems: 'center',
  },
});

export default {
  SkeletonBase,
  SkeletonText,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonCard,
  SkeletonList,
  SkeletonGrid,
  SkeletonChart,
  SkeletonProfile,
};
