/**
 * Celebration - Confetti and stars animations
 *
 * Features:
 * - Confetti explosion
 * - Floating stars
 * - Sparkle effect
 * - Haptic feedback
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { celebration } from '@/constants/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// CONFETTI
// ============================================================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  originX?: number;
  originY?: number;
}

function ConfettiPieceComponent({ piece, duration }: { piece: ConfettiPiece; duration: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(piece.scale);

  useEffect(() => {
    const targetX = (Math.random() - 0.5) * SCREEN_WIDTH * 1.5;
    const targetY = SCREEN_HEIGHT * 0.8 + Math.random() * 200;

    translateX.value = withTiming(targetX, {
      duration,
      easing: Easing.out(Easing.quad),
    });

    translateY.value = withTiming(targetY, {
      duration,
      easing: Easing.in(Easing.quad),
    });

    rotate.value = withTiming(piece.rotation * 720, {
      duration,
      easing: Easing.linear,
    });

    opacity.value = withDelay(duration * 0.7, withTiming(0, { duration: duration * 0.3 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: piece.x,
          top: piece.y,
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function Confetti({ active, onComplete, originX, originY }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useCallback(() => {
    const { count, colors } = celebration.confetti;
    const x = originX ?? SCREEN_WIDTH / 2;
    const y = originY ?? SCREEN_HEIGHT / 3;

    const newPieces: ConfettiPiece[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() > 0.5 ? 1 : -1,
      scale: 0.5 + Math.random() * 0.5,
    }));

    setPieces(newPieces);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Cleanup after animation
    setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, celebration.confetti.duration + 100);
  }, [originX, originY, onComplete]);

  useEffect(() => {
    if (active) {
      generatePieces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {pieces.map(piece => (
        <ConfettiPieceComponent
          key={piece.id}
          piece={piece}
          duration={celebration.confetti.duration}
        />
      ))}
    </View>
  );
}

// ============================================================================
// STARS
// ============================================================================

interface Star {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
}

interface StarsProps {
  active: boolean;
  onComplete?: () => void;
  originX?: number;
  originY?: number;
}

function StarComponent({ star, colors }: { star: Star; colors: string[] }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      star.delay,
      withSequence(
        withSpring(star.scale, { damping: 8, stiffness: 100 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      )
    );

    opacity.value = withDelay(
      star.delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      )
    );

    translateY.value = withDelay(
      star.delay,
      withTiming(-50, { duration: 1200, easing: Easing.out(Easing.quad) })
    );

    rotate.value = withDelay(
      star.delay,
      withTiming(360, { duration: 2000, easing: Easing.linear })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.star, { left: star.x, top: star.y }, animatedStyle]}>
      <View style={[styles.starInner, { backgroundColor: colors[0] }]} />
    </Animated.View>
  );
}

export function Stars({ active, onComplete, originX, originY }: StarsProps) {
  const [stars, setStars] = useState<Star[]>([]);

  const generateStars = useCallback(() => {
    const { count, colors: _colors, scale } = celebration.stars;
    const x = originX ?? SCREEN_WIDTH / 2;
    const y = originY ?? SCREEN_HEIGHT / 3;

    const newStars: Star[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: x + (Math.random() - 0.5) * 150,
      y: y + (Math.random() - 0.5) * 100,
      scale: scale.min + Math.random() * (scale.max - scale.min),
      delay: Math.random() * 300,
    }));

    setStars(newStars);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      setStars([]);
      onComplete?.();
    }, celebration.stars.duration + 500);
  }, [originX, originY, onComplete]);

  useEffect(() => {
    if (active) {
      generateStars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (stars.length === 0) return null;

  return (
    <View style={styles.starsContainer} pointerEvents="none">
      {stars.map(star => (
        <StarComponent key={star.id} star={star} colors={[...celebration.stars.colors]} />
      ))}
    </View>
  );
}

// ============================================================================
// SPARKLE
// ============================================================================

interface SparkleProps {
  active: boolean;
  x: number;
  y: number;
  onComplete?: () => void;
}

export function Sparkle({ active, x, y, onComplete }: SparkleProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 }),
        withDelay(500, withTiming(0, { duration: 200 }))
      );

      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(500, withTiming(0, { duration: 200 }))
      );

      rotate.value = withTiming(180, { duration: 800 });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setTimeout(() => {
        onComplete?.();
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  if (!active) return null;

  return (
    <Animated.View style={[styles.sparkle, { left: x - 15, top: y - 15 }, animatedStyle]}>
      <View style={styles.sparkleInner} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  star: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starInner: {
    width: 20,
    height: 20,
    transform: [{ rotate: '45deg' }],
    borderRadius: 4,
  },
  sparkle: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  sparkleInner: {
    width: 20,
    height: 20,
    backgroundColor: '#FFD93D',
    transform: [{ rotate: '45deg' }],
    borderRadius: 4,
  },
});

export default { Confetti, Stars, Sparkle };
