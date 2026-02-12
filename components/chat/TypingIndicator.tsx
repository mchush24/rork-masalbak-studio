/**
 * Typing Indicator Component
 *
 * Animated "..." indicator that shows when the bot is preparing a response.
 * Based on UX research: keeps users engaged and reduces perceived wait time.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/colors';
import { spacing, radius, shadows } from '@/constants/design-system';

interface TypingIndicatorProps {
  visible?: boolean;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export function TypingIndicator({
  visible = true,
  color = '#0D9488',
  size = 'medium',
}: TypingIndicatorProps) {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const containerAnim = useRef(new Animated.Value(0)).current;

  const dotSizes = {
    small: 6,
    medium: 8,
    large: 10,
  };

  const dotSize = dotSizes[size];

  useEffect(() => {
    if (visible) {
      // Fade in container
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Staggered dot animations
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const anim1 = createDotAnimation(dot1Anim, 0);
      const anim2 = createDotAnimation(dot2Anim, 150);
      const anim3 = createDotAnimation(dot3Anim, 300);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      Animated.timing(containerAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) {
    return null;
  }

  const getDotStyle = (anim: Animated.Value) => ({
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: color,
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerAnim,
          transform: [
            {
              scale: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, getDotStyle(dot1Anim)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot2Anim)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot3Anim)]} />
      </View>
    </Animated.View>
  );
}

// Typing indicator with bot avatar
interface TypingBubbleProps {
  visible?: boolean;
  avatarComponent?: React.ReactNode;
}

export function TypingBubble({ visible = true, avatarComponent }: TypingBubbleProps) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {avatarComponent && <View style={styles.avatarContainer}>{avatarComponent}</View>}
      <View style={styles.bubble}>
        <TypingIndicator visible={visible} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['1'],
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['2'],
  },
  dot: {
    // Size set dynamically
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
    marginBottom: spacing['2'],
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    borderBottomLeftRadius: 4,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    ...shadows.sm,
  },
});

export default TypingIndicator;
