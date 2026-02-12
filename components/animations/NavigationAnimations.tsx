/**
 * NavigationAnimations - Screen and navigation transitions
 * Phase 12: Navigation Transitions
 *
 * Provides animated navigation components with:
 * - Screen transition wrappers
 * - Tab bar animations
 * - Modal animations
 * - Shared element transitions
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/lib/haptics';
import { shadows, zIndex } from '@/constants/design-system';

const { width: _SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen transition wrapper with various animation types
 */
export function ScreenTransition({
  children,
  type = 'fade',
  delay = 0,
  style,
}: ScreenTransitionProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(type === 'slide' ? 50 : 0);
  const translateY = useSharedValue(type === 'slideUp' ? 30 : 0);
  const scale = useSharedValue(type === 'scale' ? 0.95 : 1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, type, opacity, translateX, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.screenContainer, animatedStyle, style]}>{children}</Animated.View>
  );
}

interface TabIconAnimatedProps {
  children: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated tab bar icon with scale and color transitions
 */
export function TabIconAnimated({ children, isActive, onPress, style }: TabIconAnimatedProps) {
  const scale = useSharedValue(1);
  const activeProgress = useSharedValue(isActive ? 1 : 0);
  const { tapLight, error: _hapticError } = useHaptics();

  useEffect(() => {
    activeProgress.value = withSpring(isActive ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });

    if (isActive) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withSpring(1, { damping: 10 })
      ) as number;
    }
  }, [isActive, activeProgress, scale]);

  const handlePress = () => {
    tapLight();
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10 })
    ) as number;
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(activeProgress.value, [0, 1], [0, -2]);

    return {
      transform: [{ scale: scale.value }, { translateY }],
    };
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
    transform: [{ scaleX: activeProgress.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={[styles.tabIconContainer, style]}>
      <Animated.View style={[styles.tabIconWrapper, animatedStyle]}>{children}</Animated.View>
      <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
    </Pressable>
  );
}

// Helper for sequence
const withSequence = (...animations: ReturnType<typeof withTiming | typeof withSpring>[]) => {
  'worklet';
  return animations.reduce((acc, animation, index) => {
    if (index === 0) return animation;
    return withDelay(0, animation);
  }, animations[0]);
};

interface TabBarAnimatedProps {
  children: React.ReactNode;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated tab bar with slide animation
 */
export function TabBarAnimated({ children, visible = true, style }: TabBarAnimatedProps) {
  const translateY = useSharedValue(visible ? 0 : 100);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : 100, {
      damping: 15,
      stiffness: 100,
    });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.tabBar, animatedStyle, style]}>{children}</Animated.View>;
}

interface ModalTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  type?: 'slide' | 'fade' | 'scale';
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated modal with backdrop and content transitions
 */
export function ModalTransition({
  children,
  visible,
  type = 'slide',
  onClose,
  style,
}: ModalTransitionProps) {
  const backdropOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(SCREEN_HEIGHT);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });

      if (type === 'slide') {
        contentTranslateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      } else if (type === 'scale') {
        contentScale.value = withSpring(1, { damping: 12 });
        contentOpacity.value = withTiming(1, { duration: 200 });
      } else {
        contentOpacity.value = withTiming(1, { duration: 200 });
      }
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });

      if (type === 'slide') {
        contentTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      } else if (type === 'scale') {
        contentScale.value = withTiming(0.9, { duration: 150 });
        contentOpacity.value = withTiming(0, { duration: 150 });
      } else {
        contentOpacity.value = withTiming(0, { duration: 150 });
      }
    }
  }, [visible, type, backdropOpacity, contentTranslateY, contentScale, contentOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => {
    if (type === 'slide') {
      return {
        transform: [{ translateY: contentTranslateY.value }],
      };
    } else if (type === 'scale') {
      return {
        transform: [{ scale: contentScale.value }],
        opacity: contentOpacity.value,
      };
    }
    return {
      opacity: contentOpacity.value,
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <Animated.View style={[styles.modalBackdrop, backdropStyle]}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.modalContent, contentStyle, style]}>{children}</Animated.View>
    </View>
  );
}

interface SharedElementProps {
  children: React.ReactNode;
  id: string;
  isSource?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Shared element transition container
 * Note: This is a simplified version. For full shared element transitions,
 * consider using react-native-shared-element or expo-router's native support.
 */
export function SharedElement({ children, id, isSource = true, style }: SharedElementProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!isSource) {
      // Destination animation
      scale.value = 0.8;
      opacity.value = 0;

      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isSource, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} testID={`shared-${id}`}>
      {children}
    </Animated.View>
  );
}

interface PageIndicatorProps {
  total: number;
  current: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated page indicator dots
 */
export function PageIndicator({ total, current, style }: PageIndicatorProps) {
  return (
    <View style={[styles.pageIndicatorContainer, style]}>
      {Array.from({ length: total }).map((_, index) => (
        <PageDot key={index} isActive={index === current} />
      ))}
    </View>
  );
}

function PageDot({ isActive }: { isActive: boolean }) {
  const width = useSharedValue(isActive ? 24 : 8);
  const opacity = useSharedValue(isActive ? 1 : 0.4);

  useEffect(() => {
    width.value = withSpring(isActive ? 24 : 8, { damping: 15 });
    opacity.value = withTiming(isActive ? 1 : 0.4, { duration: 200 });
  }, [isActive, width, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pageDot, isActive && styles.pageDotActive, animatedStyle]} />
  );
}

interface SwipeableScreenProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Swipeable screen container with gesture support
 */
export function SwipeableScreen({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  style,
}: SwipeableScreenProps) {
  const translateX = useSharedValue(0);
  const startX = useRef(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[styles.swipeableContainer, animatedStyle, style]}
      onTouchStart={e => {
        startX.current = e.nativeEvent.pageX;
      }}
      onTouchMove={e => {
        const diff = e.nativeEvent.pageX - startX.current;
        translateX.value = diff * 0.3; // Dampened movement
      }}
      onTouchEnd={e => {
        const diff = e.nativeEvent.pageX - startX.current;

        if (diff > threshold && onSwipeRight) {
          runOnJS(onSwipeRight)();
        } else if (diff < -threshold && onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }

        translateX.value = withSpring(0, { damping: 15 });
      }}
    >
      {children}
    </Animated.View>
  );
}

interface HeaderAnimatedProps {
  children: React.ReactNode;
  scrollY: SharedValue<number>;
  collapsedHeight?: number;
  expandedHeight?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated collapsible header based on scroll position
 */
export function HeaderAnimated({
  children,
  scrollY,
  collapsedHeight = 60,
  expandedHeight = 120,
  style,
}: HeaderAnimatedProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, expandedHeight - collapsedHeight],
      [expandedHeight, collapsedHeight],
      'clamp'
    );

    const opacity = interpolate(
      scrollY.value,
      [0, (expandedHeight - collapsedHeight) / 2],
      [1, 0],
      'clamp'
    );

    return {
      height,
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.headerAnimated, animatedStyle, style]}>{children}</Animated.View>
  );
}

// Pre-built entering/exiting animations for screens
export const screenEntering = {
  fade: FadeIn.duration(300),
  slideRight: SlideInRight.springify().damping(15),
  slideUp: SlideInUp.springify().damping(15),
};

export const screenExiting = {
  fade: FadeOut.duration(200),
  slideLeft: SlideOutLeft.springify().damping(15),
  slideDown: SlideOutDown.springify().damping(15),
};

const styles = StyleSheet.create({
  // Screen Transition
  screenContainer: {
    flex: 1,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 30,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
    ...shadows.sm,
  },
  tabIconContainer: {
    alignItems: 'center',
    padding: 8,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary.lavender,
    marginTop: 4,
  },

  // Modal
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: zIndex.modal,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdropPressable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 200,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },

  // Page Indicator
  pageIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pageDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.light,
  },
  pageDotActive: {
    backgroundColor: Colors.secondary.lavender,
  },

  // Swipeable
  swipeableContainer: {
    flex: 1,
  },

  // Header
  headerAnimated: {
    overflow: 'hidden',
  },
});

export default {
  ScreenTransition,
  TabIconAnimated,
  TabBarAnimated,
  ModalTransition,
  SharedElement,
  PageIndicator,
  SwipeableScreen,
  HeaderAnimated,
  screenEntering,
  screenExiting,
};
