/**
 * 💫 Color Splash Animation
 *
 * Animated visual feedback for color selection.
 * Shows a delightful splash effect when user picks a color.
 *
 * Features:
 * - GPU-accelerated Skia animations
 * - Particle burst effect
 * - Radial expansion with fade
 * - Center pulse animation
 * - 60 FPS smooth animation
 * - Child-friendly visual feedback
 *
 * Usage:
 * - Color wheel selection
 * - Favorite colors tap
 * - Gradient selection
 * - Palette pick
 */

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Circle, Group } from '@shopify/react-native-skia';

export interface ColorSplashAnimationProps {
  x: number;
  y: number;
  color: string;
  size?: 'small' | 'medium' | 'large';
  duration?: number;
  onComplete?: () => void;
}

/**
 * Main color splash effect with particles
 */
export function ColorSplashAnimation({
  x,
  y,
  color,
  size = 'medium',
  duration = 500,
  onComplete,
}: ColorSplashAnimationProps) {
  // Animation values
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const particleScale = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: { radius: 30, particles: 6 },
    medium: { radius: 50, particles: 8 },
    large: { radius: 80, particles: 12 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Main circle expansion
      Animated.timing(scale, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }),
      // Particle burst (delayed start)
      Animated.sequence([
        Animated.delay(50),
        Animated.timing(particleScale, {
          toValue: 1,
          duration: duration - 50,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  // Convert Animated values for Skia
  const currentScale = (scale as any).__getValue();
  const currentOpacity = (opacity as any).__getValue();
  const currentParticleScale = (particleScale as any).__getValue();

  // Generate particle positions
  const particles = Array.from({ length: config.particles }, (_, i) => {
    const angle = (i * Math.PI * 2) / config.particles;
    const distance = config.radius;
    return {
      id: `particle-${i}`,
      baseX: Math.cos(angle) * distance,
      baseY: Math.sin(angle) * distance,
      size: 6 + Math.random() * 4, // Random size 6-10
    };
  });

  return (
    <Group opacity={currentOpacity}>
      {/* Outer ring */}
      <Circle
        cx={x}
        cy={y}
        r={config.radius * currentScale}
        color={color}
        style="stroke"
        strokeWidth={3}
        opacity={0.6}
      />

      {/* Middle ring */}
      <Circle
        cx={x}
        cy={y}
        r={config.radius * currentScale * 0.7}
        color={color}
        style="stroke"
        strokeWidth={2}
        opacity={0.4}
      />

      {/* Center pulse (shrinks as splash expands) */}
      <Circle
        cx={x}
        cy={y}
        r={20 * (1 - currentScale)}
        color={color}
        opacity={currentOpacity * 0.8}
      />

      {/* Particle burst */}
      {particles.map((particle) => (
        <Circle
          key={particle.id}
          cx={x + particle.baseX * currentParticleScale}
          cy={y + particle.baseY * currentParticleScale}
          r={particle.size * (1 - currentParticleScale * 0.5)}
          color={color}
          opacity={currentOpacity * 0.7}
        />
      ))}
    </Group>
  );
}

// ============================================================================
// STAR BURST ANIMATION
// ============================================================================

/**
 * Star-shaped burst for special selections
 */
export function StarBurstAnimation({
  x,
  y,
  color,
  duration = 600,
  onComplete,
}: Omit<ColorSplashAnimationProps, 'size'>) {
  const scale = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: 360,
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
  }, []);

  const currentScale = (scale as any).__getValue();
  const currentRotation = (rotation as any).__getValue();
  const currentOpacity = (opacity as any).__getValue();

  // Create star points (5-pointed star)
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = ((currentRotation + i * 36) * Math.PI) / 180;
    const radius = i % 2 === 0 ? 40 : 20; // Alternating long/short points
    return {
      id: `star-${i}`,
      x: x + Math.cos(angle) * radius * currentScale,
      y: y + Math.sin(angle) * radius * currentScale,
    };
  });

  return (
    <Group opacity={currentOpacity}>
      {/* Star rays */}
      {starPoints.map((point, index) => {
        if (index % 2 === 0) {
          return (
            <Circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={8 * (1 - currentScale * 0.5)}
              color={color}
              opacity={0.8}
            />
          );
        }
        return null;
      })}

      {/* Center glow */}
      <Circle
        cx={x}
        cy={y}
        r={15 * (1 - currentScale * 0.3)}
        color={color}
        opacity={currentOpacity}
      />
    </Group>
  );
}

// ============================================================================
// RIPPLE WAVE ANIMATION
// ============================================================================

/**
 * Gentle ripple wave for subtle feedback
 */
export function RippleWaveAnimation({
  x,
  y,
  color,
  duration = 400,
  onComplete,
}: Omit<ColorSplashAnimationProps, 'size'>) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(wave1, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(wave2, {
          toValue: 1,
          duration: duration - 100,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(wave3, {
          toValue: 1,
          duration: duration - 200,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  const currentWave1 = (wave1 as any).__getValue();
  const currentWave2 = (wave2 as any).__getValue();
  const currentWave3 = (wave3 as any).__getValue();
  const currentOpacity = (opacity as any).__getValue();

  return (
    <Group opacity={currentOpacity}>
      {/* First wave */}
      <Circle
        cx={x}
        cy={y}
        r={40 * currentWave1}
        color={color}
        style="stroke"
        strokeWidth={2}
        opacity={0.6}
      />

      {/* Second wave */}
      <Circle
        cx={x}
        cy={y}
        r={40 * currentWave2}
        color={color}
        style="stroke"
        strokeWidth={2}
        opacity={0.4}
      />

      {/* Third wave */}
      <Circle
        cx={x}
        cy={y}
        r={40 * currentWave3}
        color={color}
        style="stroke"
        strokeWidth={2}
        opacity={0.2}
      />
    </Group>
  );
}

// ============================================================================
// CONFETTI BURST ANIMATION
// ============================================================================

/**
 * Colorful confetti burst for celebrations
 */
export function ConfettiBurstAnimation({
  x,
  y,
  color,
  duration = 800,
  onComplete,
}: Omit<ColorSplashAnimationProps, 'size'>) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(duration / 2),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  const currentScale = (scale as any).__getValue();
  const currentOpacity = (opacity as any).__getValue();

  // Generate confetti pieces
  const confetti = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 16;
    const distance = 50 + Math.random() * 30;
    const offsetAngle = (Math.random() - 0.5) * 0.5;
    return {
      id: `confetti-${i}`,
      x: Math.cos(angle + offsetAngle) * distance,
      y: Math.sin(angle + offsetAngle) * distance,
      size: 4 + Math.random() * 4,
      rotation: Math.random() * 360,
    };
  });

  return (
    <Group opacity={currentOpacity}>
      {/* Confetti pieces */}
      {confetti.map((piece) => (
        <Circle
          key={piece.id}
          cx={x + piece.x * currentScale}
          cy={y + piece.y * currentScale}
          r={piece.size}
          color={color}
          opacity={0.8}
        />
      ))}

      {/* Center flash */}
      <Circle
        cx={x}
        cy={y}
        r={25 * (1 - currentScale * 0.8)}
        color={color}
        opacity={currentOpacity * 0.6}
      />
    </Group>
  );
}

// ============================================================================
// ADAPTIVE SPLASH ANIMATION
// ============================================================================

/**
 * Automatically choose the best splash animation based on context
 */
export function AdaptiveColorSplash({
  x,
  y,
  color,
  context = 'default',
  onComplete,
}: Omit<ColorSplashAnimationProps, 'size'> & {
  context?: 'default' | 'favorite' | 'wheel' | 'gradient' | 'celebrate';
}) {
  switch (context) {
    case 'favorite':
      return (
        <StarBurstAnimation
          x={x}
          y={y}
          color={color}
          onComplete={onComplete}
        />
      );

    case 'wheel':
      return (
        <ColorSplashAnimation
          x={x}
          y={y}
          color={color}
          size="large"
          onComplete={onComplete}
        />
      );

    case 'gradient':
      return (
        <RippleWaveAnimation
          x={x}
          y={y}
          color={color}
          onComplete={onComplete}
        />
      );

    case 'celebrate':
      return (
        <ConfettiBurstAnimation
          x={x}
          y={y}
          color={color}
          duration={1000}
          onComplete={onComplete}
        />
      );

    default:
      return (
        <ColorSplashAnimation
          x={x}
          y={y}
          color={color}
          size="medium"
          onComplete={onComplete}
        />
      );
  }
}
