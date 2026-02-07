/**
 * MicroInteractions Component Library
 *
 * Provides delightful micro-interactions for key user actions:
 * - Button press feedback
 * - Success celebrations
 * - Loading states
 * - Error feedback
 * - Empty state animations
 *
 * Uses Lottie for complex animations with Animated API fallbacks
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SymbiosisTheme } from '@/constants/SymbiosisTheme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// ============================================
// TYPES
// ============================================
export type AnimationType =
  | 'success'
  | 'error'
  | 'loading'
  | 'pulse'
  | 'bounce'
  | 'shake'
  | 'confetti'
  | 'sparkle'
  | 'heart';

interface MicroInteractionProps {
  type: AnimationType;
  size?: number;
  color?: string;
  autoPlay?: boolean;
  loop?: boolean;
  onAnimationEnd?: () => void;
  style?: ViewStyle;
}

// ============================================
// HAPTIC HELPER
// ============================================
const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style).catch((err) => {
      // Haptic failures are non-critical (device may not support haptics)
      if (__DEV__) {
        console.debug('[Haptics] Haptic feedback failed:', err?.message);
      }
    });
  }
};

// ============================================
// SUCCESS ANIMATION (Checkmark with burst)
// ============================================
export function SuccessAnimation({
  size = 80,
  color = SymbiosisTheme.brand.mint,
  onAnimationEnd,
}: {
  size?: number;
  color?: string;
  onAnimationEnd?: () => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const burstScale = useRef(new Animated.Value(0)).current;
  const burstOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      // Circle appears
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
      // Checkmark bounces in
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      // Burst effect
      Animated.parallel([
        Animated.timing(burstScale, {
          toValue: 1.5,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(burstOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ]).start(() => {
      onAnimationEnd?.();
    });
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Burst ring */}
      <Animated.View
        style={[
          styles.burst,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ scale: burstScale }],
            opacity: burstOpacity,
          },
        ]}
      />
      {/* Main circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            backgroundColor: color,
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {/* Checkmark */}
        <Animated.View
          style={[
            styles.checkmark,
            {
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          <View
            style={[
              styles.checkmarkLine1,
              { backgroundColor: '#FFF', width: size * 0.2, height: 3 },
            ]}
          />
          <View
            style={[
              styles.checkmarkLine2,
              { backgroundColor: '#FFF', width: size * 0.35, height: 3 },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ============================================
// ERROR ANIMATION (Shake with X)
// ============================================
export function ErrorAnimation({
  size = 80,
  color = '#EF4444',
  onAnimationEnd,
}: {
  size?: number;
  color?: string;
  onAnimationEnd?: () => void;
}) {
  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 1,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(shake, {
          toValue: 1,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ]).start(() => {
      onAnimationEnd?.();
    });
  }, []);

  const translateX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size * 0.4,
          backgroundColor: color,
          transform: [{ scale }, { translateX }],
        },
      ]}
    >
      <View style={styles.xMark}>
        <View
          style={[styles.xLine, { backgroundColor: '#FFF', width: size * 0.35 }]}
        />
        <View
          style={[
            styles.xLine,
            styles.xLine2,
            { backgroundColor: '#FFF', width: size * 0.35 },
          ]}
        />
      </View>
    </Animated.View>
  );
}

// ============================================
// PULSE ANIMATION (For buttons/highlights)
// ============================================
export function PulseAnimation({
  size = 60,
  color = SymbiosisTheme.brand.purple.primary,
  children,
}: {
  size?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ scale: pulse }],
            opacity: pulseOpacity,
          },
        ]}
      />
      {children}
    </View>
  );
}

// ============================================
// CONFETTI ANIMATION (For celebrations)
// ============================================
export function ConfettiAnimation({
  count = 20,
  duration = 2000,
  onAnimationEnd,
}: {
  count?: number;
  duration?: number;
  onAnimationEnd?: () => void;
}) {
  const particles = useRef(
    Array.from({ length: count }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color:
        SymbiosisTheme.gradients.rainbow[
          Math.floor(Math.random() * SymbiosisTheme.gradients.rainbow.length)
        ],
      startX: Math.random() * 300 - 150,
      size: Math.random() * 8 + 4,
    }))
  ).current;

  useEffect(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

    const animations = particles.map((particle) =>
      Animated.parallel([
        Animated.timing(particle.translateY, {
          toValue: 300 + Math.random() * 100,
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(particle.translateX, {
          toValue: particle.startX + (Math.random() - 0.5) * 100,
          duration: duration,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(particle.rotate, {
          toValue: Math.random() * 10,
          duration: duration,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: duration,
          delay: duration * 0.7,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    Animated.parallel(animations).start(() => {
      onAnimationEnd?.();
    });
  }, []);

  return (
    <View style={styles.confettiContainer}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              width: particle.size,
              height: particle.size * 1.5,
              backgroundColor: particle.color,
              left: '50%',
              marginLeft: particle.startX,
              transform: [
                { translateY: particle.translateY },
                { translateX: particle.translateX },
                {
                  rotate: particle.rotate.interpolate({
                    inputRange: [0, 10],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ============================================
// SPARKLE ANIMATION (For highlights)
// ============================================
export function SparkleAnimation({
  size = 100,
  color = SymbiosisTheme.brand.gold,
}: {
  size?: number;
  color?: string;
}) {
  const sparkles = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      angle: (i * 72 * Math.PI) / 180, // Evenly distributed
    }))
  ).current;

  useEffect(() => {
    const animations = sparkles.map((sparkle, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.parallel([
            Animated.timing(sparkle.scale, {
              toValue: 1,
              duration: 400,
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(sparkle.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sparkle.scale, {
              toValue: 0,
              duration: 400,
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
          Animated.delay(800),
        ])
      )
    );

    animations.forEach((anim) => anim.start());
    return () => animations.forEach((anim) => anim.stop());
  }, []);

  return (
    <View style={[styles.sparkleContainer, { width: size, height: size }]}>
      {sparkles.map((sparkle, index) => {
        const x = Math.cos(sparkle.angle) * (size * 0.35);
        const y = Math.sin(sparkle.angle) * (size * 0.35);
        return (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                backgroundColor: color,
                left: size / 2 + x - 4,
                top: size / 2 + y - 4,
                transform: [{ scale: sparkle.scale }],
                opacity: sparkle.opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ============================================
// HEART BEAT ANIMATION
// ============================================
export function HeartBeatAnimation({
  size = 60,
  color = SymbiosisTheme.brand.pink.primary,
}: {
  size?: number;
  color?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(800),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.heart,
        {
          width: size,
          height: size * 0.9,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={[styles.heartLeft, { backgroundColor: color }]} />
      <View style={[styles.heartRight, { backgroundColor: color }]} />
    </Animated.View>
  );
}

// ============================================
// BUTTON PRESS HOOK
// ============================================
export function useButtonAnimation() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, []);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, []);

  return { scale, onPressIn, onPressOut };
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  burst: {
    position: 'absolute',
    borderWidth: 3,
  },
  checkmark: {
    width: '60%',
    height: '40%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  checkmarkLine1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  checkmarkLine2: {
    position: 'absolute',
    bottom: 3,
    left: 8,
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  xMark: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    transform: [{ rotate: '-45deg' }],
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
  sparkleContainer: {
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heart: {
    position: 'relative',
  },
  heartLeft: {
    position: 'absolute',
    width: '50%',
    height: '80%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    left: '10%',
    top: '15%',
    transform: [{ rotate: '-45deg' }],
  },
  heartRight: {
    position: 'absolute',
    width: '50%',
    height: '80%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    right: '10%',
    top: '15%',
    transform: [{ rotate: '45deg' }],
  },
});

export default {
  SuccessAnimation,
  ErrorAnimation,
  PulseAnimation,
  ConfettiAnimation,
  SparkleAnimation,
  HeartBeatAnimation,
  useButtonAnimation,
};
