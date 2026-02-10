/**
 * EnhancedRefresh Component
 * Phase 3: UX Enhancement
 *
 * Custom pull-to-refresh with:
 * - Ioo mascot animation
 * - Custom colors matching app theme
 * - Haptic feedback
 * - Pull progress indicator
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, RefreshControlProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { typography, spacing } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';

interface EnhancedRefreshControlProps extends Omit<
  RefreshControlProps,
  'onRefresh' | 'refreshing'
> {
  /** Called when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Refresh message */
  message?: string;
  /** Refreshing message */
  refreshingMessage?: string;
  /** Theme colors */
  tintColor?: string;
  /** Background color */
  backgroundColor?: string;
}

export function EnhancedRefreshControl({
  onRefresh,
  message = 'Yenilemek için çekin',
  refreshingMessage = 'Yükleniyor...',
  tintColor = Colors.primary.sunset,
  backgroundColor,
  ...props
}: EnhancedRefreshControlProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { success } = useHapticFeedback();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    success();

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, success]);

  return (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={tintColor}
      colors={[tintColor, Colors.secondary.lavender, Colors.secondary.grass]}
      progressBackgroundColor={backgroundColor || Colors.neutral.white}
      title={isRefreshing ? refreshingMessage : message}
      titleColor={Colors.neutral.medium}
      {...props}
    />
  );
}

// Hook for easy refresh control usage
interface UseRefreshOptions {
  onRefresh: () => Promise<void>;
  message?: string;
  refreshingMessage?: string;
}

export function useEnhancedRefresh({ onRefresh, message, refreshingMessage }: UseRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { success } = useHapticFeedback();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    success();

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, success]);

  const refreshControl = (
    <EnhancedRefreshControl
      onRefresh={onRefresh}
      message={message}
      refreshingMessage={refreshingMessage}
    />
  );

  return {
    isRefreshing,
    handleRefresh,
    refreshControl,
    RefreshControl: () => refreshControl,
  };
}

// Custom animated refresh indicator (for custom implementations)
interface AnimatedRefreshIndicatorProps {
  progress: number; // 0-1 pull progress
  refreshing: boolean;
  size?: number;
}

export function AnimatedRefreshIndicator({
  progress,
  refreshing,
  size = 40,
}: AnimatedRefreshIndicatorProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
      scale.value = withSpring(1);
    } else {
      rotation.value = 0;
      scale.value = withSpring(progress);
    }
  }, [refreshing, progress, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: interpolate(scale.value, [0, 0.5, 1], [0, 0.5, 1]),
  }));

  return (
    <Animated.View style={[styles.indicator, { width: size, height: size }, animatedStyle]}>
      <View style={styles.indicatorRing}>
        {/* Animated dots */}
        {[0, 1, 2, 3].map(i => (
          <AnimatedDot key={i} index={i} size={size / 6} refreshing={refreshing} />
        ))}
      </View>
    </Animated.View>
  );
}

// Individual animated dot
interface AnimatedDotProps {
  index: number;
  size: number;
  refreshing: boolean;
}

function AnimatedDot({ index, size, refreshing }: AnimatedDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    if (refreshing) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 300 }), withTiming(0.5, { duration: 300 })),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(0.5);
    }
  }, [refreshing, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const dotColors = [
    Colors.primary.sunset,
    Colors.secondary.lavender,
    Colors.secondary.grass,
    Colors.secondary.sky,
  ];

  const positions = [
    { top: 0, left: '50%', marginLeft: -size / 2 },
    { top: '50%', right: 0, marginTop: -size / 2 },
    { bottom: 0, left: '50%', marginLeft: -size / 2 },
    { top: '50%', left: 0, marginTop: -size / 2 },
  ];

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColors[index],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(positions[index] as any),
        },
        animatedStyle,
      ]}
    />
  );
}

// Pull indicator with progress
interface PullIndicatorProps {
  progress: number;
  threshold?: number;
  pullMessage?: string;
  releaseMessage?: string;
}

export function PullIndicator({
  progress,
  threshold = 0.8,
  pullMessage = 'Yenilemek için çekin',
  releaseMessage = 'Bırakın',
}: PullIndicatorProps) {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(interpolate(progress, [0, 0.5, 1], [-50, -20, 0]));
    opacity.value = withTiming(progress > 0.2 ? 1 : 0);
  }, [progress, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const isReady = progress >= threshold;

  return (
    <Animated.View style={[styles.pullIndicator, animatedStyle]}>
      <AnimatedRefreshIndicator progress={progress} refreshing={false} size={24} />
      <Text style={[styles.pullText, isReady && styles.pullTextReady]}>
        {isReady ? releaseMessage : pullMessage}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorRing: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
  },
  pullIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
  },
  pullText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
  },
  pullTextReady: {
    color: Colors.primary.sunset,
    fontWeight: typography.weight.semibold,
  },
});

export default EnhancedRefreshControl;
