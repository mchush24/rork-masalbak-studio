/**
 * ✨ Drawing Sparkles
 *
 * GPU-accelerated sparkle particle effects for drawing interactions.
 *
 * Features:
 * - Skia-based particle system (60 FPS)
 * - Trail sparkles following brush strokes
 * - Burst sparkles on tap/fill
 * - Color-matched particles
 * - Premium device optimization
 * - Child-friendly visual delight
 *
 * Particle Types:
 * - Trail: Sparkles that follow brush path
 * - Burst: Explosion of sparkles on tap
 * - Floating: Gentle floating particles
 * - Star: Star-shaped sparkles
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import { Circle, Group } from '@shopify/react-native-skia';

export interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  size: number;
  color: string;
  life: number; // 0-1 (1 = just born, 0 = dead)
  decay: number; // How fast it fades
}

export interface DrawingSparklesProps {
  x: number;
  y: number;
  color: string;
  type?: 'trail' | 'burst' | 'floating' | 'star';
  count?: number;
  onComplete?: () => void;
}

/**
 * Sparkle particle system
 */
export function DrawingSparkles({
  x,
  y,
  color,
  type = 'trail',
  count = 8,
  onComplete,
}: DrawingSparklesProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  // Generate particles based on type
  const particles = useMemo(() => {
    return generateParticles(x, y, color, type, count);
  }, [x, y, color, type, count]);

  useEffect(() => {
    // Animate particles
    Animated.timing(animValue, {
      toValue: 1,
      duration: type === 'trail' ? 500 : 800,
      useNativeDriver: false,
    }).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current animation progress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = (animValue as any).__getValue();

  return (
    <Group>
      {particles.map(particle => {
        // Calculate particle position based on progress
        const currentX = particle.x + particle.vx * progress * 30;
        const currentY = particle.y + particle.vy * progress * 30;

        // Calculate opacity based on life and progress
        const opacity = Math.max(0, particle.life - progress * particle.decay);

        // Calculate size (shrink over time)
        const size = particle.size * (1 - progress * 0.5);

        if (opacity <= 0 || size <= 0) return null;

        return (
          <Circle
            key={particle.id}
            cx={currentX}
            cy={currentY}
            r={size}
            color={particle.color}
            opacity={opacity}
          />
        );
      })}
    </Group>
  );
}

// ============================================================================
// TRAIL SPARKLES
// ============================================================================

/**
 * Continuous trail of sparkles following brush stroke
 */
export function SparkleTrail({
  points,
  color,
  enabled = true,
}: {
  points: { x: number; y: number }[];
  color: string;
  enabled?: boolean;
}) {
  if (!enabled || points.length === 0) return null;

  // Sample points (not every point - performance optimization)
  const sampledPoints = points.filter((_, index) => index % 3 === 0);

  return (
    <Group>
      {sampledPoints.map((point, index) => (
        <DrawingSparkles
          key={`sparkle-${index}`}
          x={point.x}
          y={point.y}
          color={color}
          type="trail"
          count={3}
        />
      ))}
    </Group>
  );
}

// ============================================================================
// BURST SPARKLES
// ============================================================================

/**
 * Burst of sparkles on tap/fill
 */
export function SparkleBurst({
  x,
  y,
  color,
  intensity = 'medium',
  onComplete,
}: {
  x: number;
  y: number;
  color: string;
  intensity?: 'low' | 'medium' | 'high';
  onComplete?: () => void;
}) {
  const count = {
    low: 6,
    medium: 12,
    high: 20,
  }[intensity];

  return (
    <DrawingSparkles x={x} y={y} color={color} type="burst" count={count} onComplete={onComplete} />
  );
}

// ============================================================================
// STAR SPARKLES
// ============================================================================

/**
 * Star-shaped sparkles for special moments
 */
export function StarSparkles({
  x,
  y,
  color,
  onComplete,
}: {
  x: number;
  y: number;
  color: string;
  onComplete?: () => void;
}) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = (animValue as any).__getValue();

  // Create 5-pointed star pattern
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 10;
    const radius = i % 2 === 0 ? 30 : 15; // Alternating long/short points
    const distance = radius * (1 + progress * 2);

    return {
      id: `star-${i}`,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      size: (i % 2 === 0 ? 6 : 4) * (1 - progress * 0.5),
      opacity: Math.max(0, 1 - progress * 1.2),
    };
  });

  return (
    <Group>
      {starPoints.map(point => (
        <Circle
          key={point.id}
          cx={point.x}
          cy={point.y}
          r={point.size}
          color={color}
          opacity={point.opacity}
        />
      ))}
    </Group>
  );
}

// ============================================================================
// FLOATING SPARKLES
// ============================================================================

/**
 * Gentle floating sparkles (background ambiance)
 */
export function FloatingSparkles({
  count = 5,
  color = '#FFD700',
  bounds,
}: {
  count?: number;
  color?: string;
  bounds: { width: number; height: number };
}) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: `float-${i}`,
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      size: 2 + Math.random() * 3,
      duration: 3000 + Math.random() * 2000,
      delay: Math.random() * 1000,
    }));
  }, [count, bounds]);

  return (
    <Group>
      {particles.map(particle => (
        <FloatingParticle key={particle.id} particle={particle} color={color} bounds={bounds} />
      ))}
    </Group>
  );
}

function FloatingParticle({
  particle,
  color,
  bounds: _bounds,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  particle: any;
  color: string;
  bounds: { width: number; height: number };
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: false,
        }),
      ])
    );

    float.start();

    return () => float.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = (floatAnim as any).__getValue();

  // Float upward and fade
  const currentY = particle.y - progress * 50;
  const opacity = Math.max(0, 1 - progress);

  return (
    <Circle cx={particle.x} cy={currentY} r={particle.size} color={color} opacity={opacity * 0.6} />
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate particle configuration based on type
 */
function generateParticles(
  x: number,
  y: number,
  color: string,
  type: 'trail' | 'burst' | 'floating' | 'star',
  count: number
): SparkleParticle[] {
  const particles: SparkleParticle[] = [];

  for (let i = 0; i < count; i++) {
    let particle: SparkleParticle;

    switch (type) {
      case 'trail':
        // Sparkles that trail behind, slight random spread
        particle = {
          id: `particle-${i}`,
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1, // Slight upward drift
          size: 2 + Math.random() * 3,
          color: color,
          life: 1,
          decay: 1.5,
        };
        break;

      case 'burst':
        // Explosion in all directions
        const angle = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 3;
        particle = {
          id: `particle-${i}`,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
          color: color,
          life: 1,
          decay: 1.2,
        };
        break;

      case 'floating':
        // Gentle upward float
        particle = {
          id: `particle-${i}`,
          x: x + (Math.random() - 0.5) * 20,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1 - Math.random() * 0.5,
          size: 2 + Math.random() * 2,
          color: color,
          life: 1,
          decay: 0.8,
        };
        break;

      case 'star':
        // Star points radiating outward
        const starAngle = (i * Math.PI * 2) / count;
        particle = {
          id: `particle-${i}`,
          x,
          y,
          vx: Math.cos(starAngle) * 3,
          vy: Math.sin(starAngle) * 3,
          size: 4 + Math.random() * 3,
          color: color,
          life: 1,
          decay: 1,
        };
        break;
    }

    particles.push(particle);
  }

  return particles;
}

/**
 * Create rainbow sparkles with multiple colors
 */
export function RainbowSparkles({
  x,
  y,
  onComplete,
}: {
  x: number;
  y: number;
  onComplete?: () => void;
}) {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9D4EDD', '#FF69B4'];
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % colors.length);
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete?.();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SparkleBurst x={x} y={y} color={colors[currentIndex]} intensity="high" />;
}
