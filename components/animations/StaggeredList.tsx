/**
 * StaggeredList - List with staggered entrance animations
 *
 * Features:
 * - Automatic staggered entrance
 * - Configurable animation direction
 * - Performance optimized
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { duration, stagger } from '@/constants/animations';

type EntranceDirection = 'up' | 'down' | 'left' | 'right' | 'fade';
type StaggerSpeed = 'fast' | 'normal' | 'slow';

interface StaggeredListProps {
  children: React.ReactNode[];
  direction?: EntranceDirection;
  speed?: StaggerSpeed;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  initialDelay?: number;
}

const getEnteringAnimation = (direction: EntranceDirection, index: number, delay: number) => {
  const baseDelay = delay;

  switch (direction) {
    case 'up':
      return FadeInUp.delay(baseDelay).duration(duration.listItemEnter).springify();
    case 'down':
      return FadeInDown.delay(baseDelay).duration(duration.listItemEnter).springify();
    case 'left':
      return FadeInLeft.delay(baseDelay).duration(duration.listItemEnter).springify();
    case 'right':
      return FadeInRight.delay(baseDelay).duration(duration.listItemEnter).springify();
    case 'fade':
    default:
      return FadeIn.delay(baseDelay).duration(duration.listItemEnter);
  }
};

export function StaggeredList({
  children,
  direction = 'up',
  speed = 'normal',
  style,
  itemStyle,
  initialDelay = 0,
}: StaggeredListProps) {
  const staggerConfig = stagger[speed];
  const staggerDelay = staggerConfig.staggerChildren;

  return (
    <View style={[styles.container, style]}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const delay = initialDelay + staggerConfig.delayChildren + index * staggerDelay;

        return (
          <Animated.View
            key={index}
            entering={getEnteringAnimation(direction, index, delay)}
            layout={Layout.springify()}
            style={itemStyle}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
}

// Individual staggered item for more control
interface StaggeredItemProps {
  children: React.ReactNode;
  index: number;
  direction?: EntranceDirection;
  staggerDelay?: number;
  initialDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggeredItem({
  children,
  index,
  direction = 'up',
  staggerDelay = duration.listItemStagger,
  initialDelay = 0,
  style,
}: StaggeredItemProps) {
  const delay = initialDelay + index * staggerDelay;

  return (
    <Animated.View
      entering={getEnteringAnimation(direction, index, delay)}
      layout={Layout.springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StaggeredList;
