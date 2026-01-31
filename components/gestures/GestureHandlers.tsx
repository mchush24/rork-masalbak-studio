/**
 * GestureHandlers - Advanced gesture components
 * Phase 15: Gestures
 *
 * Provides gesture-enabled components using Gesture API v2:
 * - Swipeable cards
 * - Pinch-to-zoom
 * - Double-tap actions
 * - Long-press menus
 * - Drag-and-drop
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Heart, Trash2, Share2 } from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { useHaptics } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  leftActionColor?: string;
  rightActionColor?: string;
  swipeThreshold?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Swipeable card with left/right actions
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  leftActionColor = Colors.emotion.trust,
  rightActionColor = Colors.emotion.fear,
  swipeThreshold = 100,
  style,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const { success: hapticSuccess, warning: hapticWarning } = useHaptics();

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > swipeThreshold && onSwipeRight) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(hapticSuccess)();
          runOnJS(onSwipeRight)();
        });
      } else if (event.translationX < -swipeThreshold && onSwipeLeft) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(hapticWarning)();
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, swipeThreshold],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, swipeThreshold],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-swipeThreshold, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-swipeThreshold, 0],
      [1, 0.5],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <View style={[styles.swipeableContainer, style]}>
      {/* Left action (revealed when swiping right) */}
      <Animated.View
        style={[
          styles.swipeAction,
          styles.leftAction,
          { backgroundColor: leftActionColor },
          leftActionStyle,
        ]}
      >
        {leftAction || <Heart size={28} color={Colors.neutral.white} />}
      </Animated.View>

      {/* Right action (revealed when swiping left) */}
      <Animated.View
        style={[
          styles.swipeAction,
          styles.rightAction,
          { backgroundColor: rightActionColor },
          rightActionStyle,
        ]}
      >
        {rightAction || <Trash2 size={28} color={Colors.neutral.white} />}
      </Animated.View>

      {/* Card content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeableCard, cardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

interface PinchToZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  onZoomChange?: (scale: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pinch-to-zoom container
 */
export function PinchToZoom({
  children,
  minScale = 1,
  maxScale = 4,
  onZoomChange,
  style,
}: PinchToZoomProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const startScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = savedScale.value;
    })
    .onUpdate((event) => {
      const newScale = startScale.value * event.scale;
      scale.value = Math.min(Math.max(newScale, minScale), maxScale);
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { translateX: -SCREEN_WIDTH / 2 },
      { translateY: -200 },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
      { translateX: SCREEN_WIDTH / 2 },
      { translateY: 200 },
    ],
  }));

  return (
    <GestureHandlerRootView style={[styles.pinchContainer, style]}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.pinchContent, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

interface DoubleTapProps {
  children: React.ReactNode;
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  showHeartAnimation?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Double-tap gesture handler (like Instagram)
 */
export function DoubleTap({
  children,
  onDoubleTap,
  onSingleTap,
  showHeartAnimation = true,
  style,
}: DoubleTapProps) {
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const { success: hapticSuccess } = useHaptics();

  const handleDoubleTap = () => {
    hapticSuccess();
    onDoubleTap?.();

    if (showHeartAnimation) {
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 15 }),
        withTiming(0, { duration: 500 })
      );
      heartOpacity.value = withTiming(0, { duration: 600 });
    }
  };

  const handleSingleTap = () => {
    onSingleTap?.();
  };

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      runOnJS(handleSingleTap)();
    });

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(handleDoubleTap)();
    });

  const composedGesture = Gesture.Exclusive(doubleTap, singleTap);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  return (
    <View style={[styles.doubleTapContainer, style]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.tapArea}>
          {children}
        </Animated.View>
      </GestureDetector>

      {showHeartAnimation && (
        <Animated.View style={[styles.heartOverlay, heartStyle]} pointerEvents="none">
          <Heart size={100} color={Colors.emotion.fear} fill={Colors.emotion.fear} />
        </Animated.View>
      )}
    </View>
  );
}

interface LongPressMenuProps {
  children: React.ReactNode;
  menuItems: {
    icon: React.ComponentType<{ size: number; color: string }>;
    label: string;
    onPress: () => void;
    destructive?: boolean;
  }[];
  onLongPress?: () => void;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Long-press to show context menu
 */
export function LongPressMenu({
  children,
  menuItems,
  onLongPress,
  duration = 500,
  style,
}: LongPressMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef<View>(null);
  const menuScale = useSharedValue(0);
  const { tapHeavy, tapMedium } = useHaptics();

  const handleLongPress = () => {
    tapHeavy();

    targetRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        x: x + width / 2,
        y: y + height,
      });
      setMenuVisible(true);
      menuScale.value = withSpring(1, { damping: 12 });
    });

    onLongPress?.();
  };

  const closeMenu = () => {
    menuScale.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setMenuVisible)(false);
    });
  };

  const handleMenuItemPress = (item: typeof menuItems[0]) => {
    tapMedium();
    closeMenu();
    setTimeout(() => item.onPress(), 150);
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(duration)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuScale.value }],
    opacity: menuScale.value,
  }));

  return (
    <>
      <GestureDetector gesture={longPressGesture}>
        <Animated.View ref={targetRef} style={style}>
          {children}
        </Animated.View>
      </GestureDetector>

      {menuVisible && (
        <Pressable
          style={styles.menuOverlay}
          onPress={closeMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                left: menuPosition.x - 100,
                top: menuPosition.y + 10,
              },
              menuStyle,
            ]}
          >
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleMenuItemPress(item)}
              >
                <item.icon
                  size={18}
                  color={item.destructive ? Colors.emotion.fear : Colors.neutral.dark}
                />
                <Animated.Text
                  style={[
                    styles.menuItemText,
                    item.destructive && styles.menuItemTextDestructive,
                  ]}
                >
                  {item.label}
                </Animated.Text>
              </Pressable>
            ))}
          </Animated.View>
        </Pressable>
      )}
    </>
  );
}

interface DraggableProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  snapToGrid?: number;
  boundaries?: { minX: number; maxX: number; minY: number; maxY: number };
  style?: StyleProp<ViewStyle>;
}

/**
 * Draggable element with optional snap-to-grid
 */
export function Draggable({
  children,
  onDragStart,
  onDragEnd,
  snapToGrid,
  boundaries,
  style,
}: DraggableProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const snapValue = (value: number, grid: number) => {
    'worklet';
    return Math.round(value / grid) * grid;
  };

  const clampValue = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withSpring(1.05);
      if (onDragStart) {
        runOnJS(onDragStart)();
      }
    })
    .onUpdate((event) => {
      let newX = startX.value + event.translationX;
      let newY = startY.value + event.translationY;

      if (boundaries) {
        newX = clampValue(newX, boundaries.minX, boundaries.maxX);
        newY = clampValue(newY, boundaries.minY, boundaries.maxY);
      }

      translateX.value = newX;
      translateY.value = newY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);

      if (snapToGrid) {
        translateX.value = withSpring(snapValue(translateX.value, snapToGrid));
        translateY.value = withSpring(snapValue(translateY.value, snapToGrid));
      }

      if (onDragEnd) {
        runOnJS(onDragEnd)({
          x: translateX.value,
          y: translateY.value,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.draggableContainer, animatedStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

interface PullToActionProps {
  children: React.ReactNode;
  onPull: () => void;
  threshold?: number;
  actionContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pull-down to trigger action
 */
export function PullToAction({
  children,
  onPull,
  threshold = 100,
  actionContent,
  style,
}: PullToActionProps) {
  const translateY = useSharedValue(0);
  const actionOpacity = useSharedValue(0);
  const isTriggered = useSharedValue(false);
  const { tapHeavy } = useHaptics();

  const triggerHaptic = () => {
    tapHeavy();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        // Apply resistance
        translateY.value = Math.sqrt(event.translationY) * 10;
        actionOpacity.value = interpolate(
          translateY.value,
          [0, threshold],
          [0, 1],
          Extrapolation.CLAMP
        );

        if (translateY.value >= threshold && !isTriggered.value) {
          isTriggered.value = true;
          runOnJS(triggerHaptic)();
        } else if (translateY.value < threshold && isTriggered.value) {
          isTriggered.value = false;
        }
      }
    })
    .onEnd(() => {
      if (isTriggered.value) {
        runOnJS(onPull)();
        isTriggered.value = false;
      }
      translateY.value = withSpring(0);
      actionOpacity.value = withTiming(0);
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const actionStyle = useAnimatedStyle(() => ({
    opacity: actionOpacity.value,
    transform: [{ scale: interpolate(actionOpacity.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <View style={[styles.pullContainer, style]}>
      <Animated.View style={[styles.pullActionContainer, actionStyle]}>
        {actionContent || (
          <View style={styles.defaultPullAction}>
            <Share2 size={24} color={Colors.primary.purple} />
          </View>
        )}
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.pullContent, contentStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  // Swipeable
  swipeableContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeableCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },

  // Pinch
  pinchContainer: {
    overflow: 'hidden',
  },
  pinchContent: {
    flex: 1,
  },

  // Double Tap
  doubleTapContainer: {
    position: 'relative',
  },
  tapArea: {
    flex: 1,
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },

  // Long Press Menu
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  menuContainer: {
    position: 'absolute',
    width: 200,
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neutral.dark,
  },
  menuItemTextDestructive: {
    color: Colors.emotion.fear,
  },

  // Draggable
  draggableContainer: {
    position: 'absolute',
  },

  // Pull to Action
  pullContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  pullActionContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  defaultPullAction: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.purple + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pullContent: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
});

export default {
  SwipeableCard,
  PinchToZoom,
  DoubleTap,
  LongPressMenu,
  Draggable,
  PullToAction,
};
