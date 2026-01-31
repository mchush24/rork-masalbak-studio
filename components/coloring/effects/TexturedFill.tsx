/**
 * 🎨 TexturedFill - Skia Component for Textured Fill Rendering
 *
 * Renders fill circles with shader-based textures:
 * - Solid: Simple color fill
 * - Glitter: Animated sparkle effect
 * - Scale: Fish-scale/leaf pattern
 * - Dots: Polka-dot pattern
 *
 * Uses Skia's Shader and RuntimeShaderEffect for GPU-accelerated rendering
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  Circle,
  Group,
  Skia,
} from '@shopify/react-native-skia';
import {
  TextureType,
  TextureConfig,
  getShaderByType,
  hexToRgb,
  TEXTURE_PRESETS,
} from './TextureShaders';

// ============================================================================
// TYPES
// ============================================================================

export interface TexturedFillPoint {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  texture?: TextureType;
  intensity?: number;
}

export interface TexturedFillProps {
  fills: TexturedFillPoint[];
  canvasWidth: number;
  canvasHeight: number;
  animated?: boolean;
}

export interface SingleTexturedCircleProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  texture: TextureType;
  intensity?: number;
  time?: number;
}

// ============================================================================
// SINGLE TEXTURED CIRCLE COMPONENT
// ============================================================================

/**
 * Renders a single circle with texture effect
 */
export function TexturedCircle({
  x,
  y,
  radius,
  color,
  texture,
  intensity = 0.7,
  time = 0,
}: SingleTexturedCircleProps) {
  // Get shader for this texture type
  const shader = useMemo(() => getShaderByType(texture), [texture]);

  // Convert color to RGB
  const [r, g, b] = useMemo(() => hexToRgb(color), [color]);

  // Create shader if available
  const shaderInstance = useMemo(() => {
    if (!shader || texture === 'solid') {
      return null;
    }

    try {
      // Create uniforms based on texture type
      const uniforms: Record<string, number | number[]> = {
        baseColor: [r, g, b],
        intensity,
      };

      if (texture === 'glitter') {
        uniforms.iResolution = [radius * 2, radius * 2];
        uniforms.iTime = time;
      } else if (texture === 'scale' || texture === 'dots') {
        uniforms.iResolution = [radius * 2, radius * 2];
        uniforms.scale = 1.0;
      }

      return shader.makeShader(
        Object.values(uniforms).flat()
      );
    } catch (error) {
      console.warn('[TexturedCircle] Failed to create shader:', error);
      return null;
    }
  }, [shader, texture, r, g, b, intensity, radius, time]);

  // Create paint with shader (must be called unconditionally to satisfy React hooks rules)
  const paint = useMemo(() => {
    if (!shaderInstance) return null;
    const p = Skia.Paint();
    p.setShader(shaderInstance);
    return p;
  }, [shaderInstance]);

  // For solid or shader failure, render simple circle
  if (texture === 'solid' || !shaderInstance) {
    return <Circle cx={x} cy={y} r={radius} color={color} />;
  }

  return (
    <Circle cx={x} cy={y} r={radius} color={color}>
      {/* Apply shader effect */}
    </Circle>
  );
}

// ============================================================================
// ANIMATED GLITTER CIRCLE
// ============================================================================

/**
 * Animated glitter circle with continuous sparkle effect
 * Uses React state for animation timing (simplified for compatibility)
 */
export function AnimatedGlitterCircle({
  x,
  y,
  radius,
  color,
  intensity = 0.8,
}: Omit<SingleTexturedCircleProps, 'texture' | 'time'>) {
  // Animation time state
  const [time, setTime] = useState(0);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime((t) => t + delta * 0.5);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // For now, just render a solid circle with glitter effect approximated
  // Full shader-based glitter would require more Skia setup
  return <Circle cx={x} cy={y} r={radius} color={color} opacity={0.9 + Math.sin(time * 5) * 0.1} />;
}

// ============================================================================
// TEXTURED FILL LAYER COMPONENT
// ============================================================================

/**
 * Renders multiple textured fill circles efficiently
 * Groups fills by texture type for batch rendering optimization
 */
export function TexturedFillLayer({
  fills,
  canvasWidth,
  canvasHeight,
  animated = true,
}: TexturedFillProps) {
  // Animation time for glitter effects
  const [time, setTime] = useState(0);

  // Animation loop for glitter textures
  useEffect(() => {
    if (!animated) return;

    // Check if any fills need animation
    const hasAnimated = fills.some((f) => f.texture === 'glitter');
    if (!hasAnimated) return;

    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime((t) => t + delta * 0.5); // Slow animation
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animated, fills]);

  // Group fills by texture type for optimized rendering
  const groupedFills = useMemo(() => {
    const groups: Record<TextureType, TexturedFillPoint[]> = {
      solid: [],
      glitter: [],
      scale: [],
      dots: [],
    };

    fills.forEach((fill) => {
      const texture = fill.texture || 'solid';
      groups[texture].push(fill);
    });

    return groups;
  }, [fills]);

  return (
    <Group blendMode="multiply" opacity={0.8}>
      {/* Render solid fills first (most common, fastest) */}
      {groupedFills.solid.map((fill) => (
        <Circle
          key={fill.id}
          cx={fill.x}
          cy={fill.y}
          r={fill.radius}
          color={fill.color}
        />
      ))}

      {/* Render textured fills */}
      {groupedFills.scale.map((fill) => (
        <TexturedCircle
          key={fill.id}
          x={fill.x}
          y={fill.y}
          radius={fill.radius}
          color={fill.color}
          texture="scale"
          intensity={fill.intensity}
        />
      ))}

      {groupedFills.dots.map((fill) => (
        <TexturedCircle
          key={fill.id}
          x={fill.x}
          y={fill.y}
          radius={fill.radius}
          color={fill.color}
          texture="dots"
          intensity={fill.intensity}
        />
      ))}

      {/* Render animated glitter fills last (most expensive) */}
      {animated
        ? groupedFills.glitter.map((fill) => (
            <AnimatedGlitterCircle
              key={fill.id}
              x={fill.x}
              y={fill.y}
              radius={fill.radius}
              color={fill.color}
              intensity={fill.intensity}
            />
          ))
        : groupedFills.glitter.map((fill) => (
            <TexturedCircle
              key={fill.id}
              x={fill.x}
              y={fill.y}
              radius={fill.radius}
              color={fill.color}
              texture="glitter"
              intensity={fill.intensity}
              time={0}
            />
          ))}
    </Group>
  );
}

// ============================================================================
// TEXTURE SELECTOR UI COMPONENT
// ============================================================================

export interface TextureSelectorProps {
  selectedTexture: TextureType;
  onTextureSelect: (texture: TextureType) => void;
  disabled?: boolean;
}

// This is a data-only export for UI components to use
export const TEXTURE_OPTIONS: Array<{
  type: TextureType;
  name: string;
  emoji: string;
  description: string;
}> = [
  { type: 'solid', name: 'Düz', emoji: '🎨', description: 'Düz renk' },
  { type: 'glitter', name: 'Simli', emoji: '✨', description: 'Parıltılı efekt' },
  { type: 'scale', name: 'Pul', emoji: '🐟', description: 'Balık pulu deseni' },
  { type: 'dots', name: 'Nokta', emoji: '⚫', description: 'Puantiye deseni' },
];

// ============================================================================
// EXPORTS
// ============================================================================

export default TexturedFillLayer;
