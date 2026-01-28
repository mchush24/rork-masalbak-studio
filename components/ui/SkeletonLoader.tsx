/**
 * SkeletonLoader Component
 *
 * Shimmer-effect skeleton loaders for content placeholders
 * Matches the app's design system with soft, organic shapes
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circle' | 'card' | 'image' | 'button';
}

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  variant = 'text',
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, []);

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
          borderRadius: 20,
        };
      case 'image':
        return {
          width: width,
          height: height || 200,
          borderRadius: 16,
        };
      case 'button':
        return {
          width: width,
          height: height || 48,
          borderRadius: 24,
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
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
          style={{ marginBottom: 8 }}
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
        <SkeletonLoader width="70%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="90%" height={12} style={{ marginBottom: 4 }} />
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
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 6 }} />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(185, 142, 255, 0.08)',
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
    width: SCREEN_WIDTH,
  },

  // Pattern styles
  textPattern: {
    width: '100%',
  },
  cardPattern: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  listItemPattern: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
  gridPattern: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
});

export default SkeletonLoader;
