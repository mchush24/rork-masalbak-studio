/**
 * 🌊 Fill Spread Animation
 *
 * Animated visual feedback for fill tool operations.
 * Shows paint spreading from click point across the filled region.
 *
 * Features:
 * - GPU-accelerated Skia animations
 * - Radial spread effect
 * - Color pulse animation
 * - Adaptive to fill region size
 * - 60 FPS smooth animation
 *
 * Hybrid Animation Strategy (Phase 1 Architecture):
 * - Skia for canvas effects (this component)
 * - React Native Animated for UI elements
 * - Lottie for celebrations (Phase 4)
 */

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Circle, Group } from '@shopify/react-native-skia';

export interface FillSpreadAnimationProps {
  x: number;
  y: number;
  color: string;
  radius?: number;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Animated ripple effect that spreads from fill point
 */
export function FillSpreadAnimation({
  x,
  y,
  color,
  radius = 100,
  duration = 400,
  onComplete,
}: FillSpreadAnimationProps) {
  // Animation values using React Native Animated
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert Animated values for Skia
  const animatedRadius = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, radius],
  });

  return (
    <Group>
      {/* Outer ripple */}
      <Circle
        cx={x}
        cy={y}
        r={(animatedRadius as unknown as { __getValue(): number }).__getValue()}
        color={color}
        style="stroke"
        strokeWidth={3}
        opacity={(opacity as unknown as { __getValue(): number }).__getValue()}
      />

      {/* Inner ripple (delayed) */}
      <Circle
        cx={x}
        cy={y}
        r={(animatedRadius as unknown as { __getValue(): number }).__getValue() * 0.7}
        color={color}
        style="stroke"
        strokeWidth={2}
        opacity={(opacity as unknown as { __getValue(): number }).__getValue() * 0.6}
      />

      {/* Center pulse */}
      <Circle
        cx={x}
        cy={y}
        r={15 * (1 - (scale as unknown as { __getValue(): number }).__getValue())}
        color={color}
        opacity={(opacity as unknown as { __getValue(): number }).__getValue()}
      />
    </Group>
  );
}

/**
 * Multiple concentric ripples for dramatic effect
 */
export function MultipleFillRipples({
  x,
  y,
  color,
  radius = 100,
  count = 3,
  onComplete,
}: FillSpreadAnimationProps & { count?: number }) {
  const ripples = Array.from({ length: count }, (_, i) => ({
    id: `ripple-${i}`,
    delay: i * 100,
  }));

  return (
    <>
      {ripples.map((ripple, index) => (
        <DelayedFillRipple
          key={ripple.id}
          x={x}
          y={y}
          color={color}
          radius={radius}
          delay={ripple.delay}
          onComplete={index === ripples.length - 1 ? onComplete : undefined}
        />
      ))}
    </>
  );
}

/**
 * Single ripple with delay
 */
function DelayedFillRipple({
  x,
  y,
  color,
  radius = 100,
  delay,
  onComplete,
}: FillSpreadAnimationProps & { delay: number }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const animatedRadius = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, radius],
  });

  return (
    <Circle
      cx={x}
      cy={y}
      r={(animatedRadius as unknown as { __getValue(): number }).__getValue()}
      color={color}
      opacity={(opacity as unknown as { __getValue(): number }).__getValue() * 0.3}
      style="stroke"
      strokeWidth={2}
    />
  );
}

/**
 * Expanding circle fill effect (for small regions)
 */
export function ExpandingFillCircle({
  x,
  y,
  color,
  targetRadius = 50,
  duration = 300,
  onComplete,
}: FillSpreadAnimationProps & { targetRadius?: number }) {
  const radius = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(radius, {
        toValue: targetRadius,
        tension: 100,
        friction: 10,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Circle
      cx={x}
      cy={y}
      r={(radius as unknown as { __getValue(): number }).__getValue()}
      color={color}
      opacity={(opacity as unknown as { __getValue(): number }).__getValue()}
    />
  );
}

/**
 * Paint splash effect (for dramatic fills)
 */
export function PaintSplashEffect({
  x,
  y,
  color,
  onComplete,
}: Omit<FillSpreadAnimationProps, 'radius'>) {
  const mainScale = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(mainScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(mainScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(splashScale, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create multiple splash particles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const distance = 40;
    return {
      id: `particle-${i}`,
      baseX: Math.cos(angle) * distance,
      baseY: Math.sin(angle) * distance,
    };
  });

  const currentMainScale = (mainScale as unknown as { __getValue(): number }).__getValue();
  const currentSplashScale = (splashScale as unknown as { __getValue(): number }).__getValue();
  const currentOpacity = (opacity as unknown as { __getValue(): number }).__getValue();

  return (
    <Group opacity={currentOpacity}>
      {/* Main splash */}
      <Circle cx={x} cy={y} r={30 * currentMainScale} color={color} opacity={0.8} />

      {/* Splash particles */}
      {particles.map(particle => (
        <Circle
          key={particle.id}
          cx={x + particle.baseX * currentSplashScale}
          cy={y + particle.baseY * currentSplashScale}
          r={8 * (1 - currentSplashScale * 0.5)}
          color={color}
          opacity={currentOpacity * 0.6}
        />
      ))}
    </Group>
  );
}

// ============================================================================
// ADAPTIVE FILL ANIMATION
// ============================================================================

/**
 * Automatically choose the best animation based on fill size
 */
export function AdaptiveFillAnimation({
  x,
  y,
  color,
  fillArea,
  onComplete,
}: Omit<FillSpreadAnimationProps, 'radius'> & { fillArea: number }) {
  // Small area: expanding circle
  if (fillArea < 5000) {
    return (
      <ExpandingFillCircle
        x={x}
        y={y}
        color={color}
        targetRadius={Math.sqrt(fillArea / Math.PI)}
        onComplete={onComplete}
      />
    );
  }

  // Medium area: single ripple
  if (fillArea < 20000) {
    return (
      <FillSpreadAnimation
        x={x}
        y={y}
        color={color}
        radius={Math.sqrt(fillArea / Math.PI)}
        onComplete={onComplete}
      />
    );
  }

  // Large area: multiple ripples
  return (
    <MultipleFillRipples
      x={x}
      y={y}
      color={color}
      radius={Math.sqrt(fillArea / Math.PI)}
      count={3}
      onComplete={onComplete}
    />
  );
}
