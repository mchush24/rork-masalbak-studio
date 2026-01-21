/**
 * 🎨 TextureShaders - GPU-Accelerated Texture Effects
 *
 * Skia Runtime Effect shaders for:
 * - Glitter/sparkle texture (animated)
 * - Scale/fish-scale pattern
 * - Dot pattern
 * - Solid fill (baseline)
 *
 * Uses Skia's RuntimeEffect for 60 FPS GPU rendering
 */

import { Skia } from '@shopify/react-native-skia';
import type { SkRuntimeEffect } from '@shopify/react-native-skia';

// ============================================================================
// TEXTURE TYPES
// ============================================================================

export type TextureType = 'solid' | 'glitter' | 'scale' | 'dots';

export interface TextureConfig {
  type: TextureType;
  baseColor: string;
  intensity?: number; // 0-1, affects pattern visibility
  animated?: boolean;
  scale?: number; // Pattern scale multiplier
}

// ============================================================================
// SHADER SOURCE CODE (SkSL - Skia Shading Language)
// ============================================================================

/**
 * Glitter/Sparkle Shader
 * Creates animated sparkle points that shimmer over time
 * Uses noise-based particle generation
 */
const GLITTER_SHADER_SOURCE = `
uniform float2 iResolution;
uniform float iTime;
uniform vec3 baseColor;
uniform float intensity;

// Hash function for pseudo-random sparkles
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Generate sparkle at position
float sparkle(vec2 uv, float time) {
  vec2 grid = floor(uv * 30.0);
  float h = hash(grid);

  // Animate sparkle timing
  float sparkleTime = fract(h * 10.0 + time * (0.5 + h * 0.5));

  // Sparkle brightness curve (sharp peak)
  float brightness = pow(max(0.0, 1.0 - abs(sparkleTime - 0.5) * 4.0), 3.0);

  // Add position-based variation
  vec2 cellUv = fract(uv * 30.0) - 0.5;
  float dist = length(cellUv);

  // Only show sparkle if close to cell center and hash is high enough
  if (h > 0.7 && dist < 0.1) {
    return brightness * (1.0 - dist * 10.0);
  }
  return 0.0;
}

half4 main(float2 fragCoord) {
  vec2 uv = fragCoord / iResolution;

  // Base color
  vec3 color = baseColor;

  // Add sparkle layer
  float spark = sparkle(uv, iTime);

  // Combine base color with white sparkles
  color = mix(color, vec3(1.0), spark * intensity);

  // Add subtle shimmer across entire surface
  float shimmer = sin(uv.x * 100.0 + iTime * 3.0) * sin(uv.y * 100.0 - iTime * 2.0);
  shimmer = max(0.0, shimmer) * 0.1 * intensity;
  color += shimmer;

  return half4(color, 1.0);
}
`;

/**
 * Scale/Fish-Scale Pattern Shader
 * Creates overlapping semicircle pattern like fish scales or grass
 */
const SCALE_SHADER_SOURCE = `
uniform float2 iResolution;
uniform vec3 baseColor;
uniform float intensity;
uniform float scale;

half4 main(float2 fragCoord) {
  vec2 uv = fragCoord / iResolution;

  // Scale the pattern
  vec2 scaledUv = uv * scale * 20.0;

  // Create offset rows for scale overlap
  float row = floor(scaledUv.y);
  float offset = mod(row, 2.0) * 0.5;

  vec2 cell = vec2(scaledUv.x + offset, scaledUv.y);
  vec2 cellId = floor(cell);
  vec2 cellUv = fract(cell) - vec2(0.5, 0.0);

  // Distance from arc center (at bottom of cell)
  float dist = length(cellUv);

  // Create arc shape
  float arc = smoothstep(0.55, 0.5, dist) * smoothstep(0.0, 0.1, cellUv.y);

  // Darken/lighten based on position for 3D effect
  float shade = 1.0 - (cellUv.y + 0.3) * 0.3 * intensity;

  vec3 color = baseColor * shade;

  // Add subtle edge highlight
  float edge = smoothstep(0.5, 0.45, dist) - smoothstep(0.45, 0.4, dist);
  color += edge * 0.2 * intensity;

  return half4(color, 1.0);
}
`;

/**
 * Dot Pattern Shader
 * Creates polka-dot pattern with configurable size
 */
const DOTS_SHADER_SOURCE = `
uniform float2 iResolution;
uniform vec3 baseColor;
uniform float intensity;
uniform float scale;

half4 main(float2 fragCoord) {
  vec2 uv = fragCoord / iResolution;

  // Scale and create grid
  vec2 gridUv = uv * scale * 15.0;
  vec2 cellId = floor(gridUv);
  vec2 cellUv = fract(gridUv) - 0.5;

  // Distance from center of cell
  float dist = length(cellUv);

  // Create soft dot
  float dot = 1.0 - smoothstep(0.2, 0.3, dist);

  // Alternate dot color (slightly lighter)
  vec3 dotColor = baseColor * (1.2 + intensity * 0.3);

  // Mix base and dot
  vec3 color = mix(baseColor, dotColor, dot * intensity);

  return half4(color, 1.0);
}
`;

/**
 * Solid Fill Shader (baseline)
 * Simple solid color fill, optimized for GPU
 */
const SOLID_SHADER_SOURCE = `
uniform vec3 baseColor;

half4 main(float2 fragCoord) {
  return half4(baseColor, 1.0);
}
`;

// ============================================================================
// COMPILED SHADERS
// ============================================================================

let glitterShader: SkRuntimeEffect | null = null;
let scaleShader: SkRuntimeEffect | null = null;
let dotsShader: SkRuntimeEffect | null = null;
let solidShader: SkRuntimeEffect | null = null;

/**
 * Get or compile the glitter shader
 */
export function getGlitterShader(): SkRuntimeEffect | null {
  if (!glitterShader) {
    try {
      glitterShader = Skia.RuntimeEffect.Make(GLITTER_SHADER_SOURCE);
      if (!glitterShader) {
        console.warn('[TextureShaders] Failed to compile glitter shader');
      }
    } catch (error) {
      console.error('[TextureShaders] Glitter shader compilation error:', error);
    }
  }
  return glitterShader;
}

/**
 * Get or compile the scale shader
 */
export function getScaleShader(): SkRuntimeEffect | null {
  if (!scaleShader) {
    try {
      scaleShader = Skia.RuntimeEffect.Make(SCALE_SHADER_SOURCE);
      if (!scaleShader) {
        console.warn('[TextureShaders] Failed to compile scale shader');
      }
    } catch (error) {
      console.error('[TextureShaders] Scale shader compilation error:', error);
    }
  }
  return scaleShader;
}

/**
 * Get or compile the dots shader
 */
export function getDotsShader(): SkRuntimeEffect | null {
  if (!dotsShader) {
    try {
      dotsShader = Skia.RuntimeEffect.Make(DOTS_SHADER_SOURCE);
      if (!dotsShader) {
        console.warn('[TextureShaders] Failed to compile dots shader');
      }
    } catch (error) {
      console.error('[TextureShaders] Dots shader compilation error:', error);
    }
  }
  return dotsShader;
}

/**
 * Get or compile the solid shader
 */
export function getSolidShader(): SkRuntimeEffect | null {
  if (!solidShader) {
    try {
      solidShader = Skia.RuntimeEffect.Make(SOLID_SHADER_SOURCE);
      if (!solidShader) {
        console.warn('[TextureShaders] Failed to compile solid shader');
      }
    } catch (error) {
      console.error('[TextureShaders] Solid shader compilation error:', error);
    }
  }
  return solidShader;
}

/**
 * Get shader by texture type
 */
export function getShaderByType(type: TextureType): SkRuntimeEffect | null {
  switch (type) {
    case 'glitter':
      return getGlitterShader();
    case 'scale':
      return getScaleShader();
    case 'dots':
      return getDotsShader();
    case 'solid':
    default:
      return getSolidShader();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hex color to RGB array for shader uniforms
 */
export function hexToRgb(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle short hex (#RGB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
}

/**
 * Create shader uniforms for a given texture config
 */
export function createShaderUniforms(
  config: TextureConfig,
  width: number,
  height: number,
  time: number = 0
): Float32Array {
  const [r, g, b] = hexToRgb(config.baseColor);

  switch (config.type) {
    case 'glitter':
      return new Float32Array([
        width, height,           // iResolution
        time,                    // iTime
        r, g, b,                 // baseColor
        config.intensity ?? 0.8, // intensity
      ]);

    case 'scale':
      return new Float32Array([
        width, height,           // iResolution
        r, g, b,                 // baseColor
        config.intensity ?? 0.5, // intensity
        config.scale ?? 1.0,     // scale
      ]);

    case 'dots':
      return new Float32Array([
        width, height,           // iResolution
        r, g, b,                 // baseColor
        config.intensity ?? 0.6, // intensity
        config.scale ?? 1.0,     // scale
      ]);

    case 'solid':
    default:
      return new Float32Array([r, g, b]); // baseColor only
  }
}

// ============================================================================
// TEXTURE PRESETS
// ============================================================================

export const TEXTURE_PRESETS: Record<string, TextureConfig> = {
  // Solid colors
  solid: { type: 'solid', baseColor: '#FF6B6B' },

  // Glitter variants
  glitterRed: { type: 'glitter', baseColor: '#FF6B6B', intensity: 0.8, animated: true },
  glitterGold: { type: 'glitter', baseColor: '#FFD700', intensity: 1.0, animated: true },
  glitterSilver: { type: 'glitter', baseColor: '#C0C0C0', intensity: 0.9, animated: true },
  glitterPink: { type: 'glitter', baseColor: '#FF69B4', intensity: 0.8, animated: true },
  glitterBlue: { type: 'glitter', baseColor: '#4D96FF', intensity: 0.8, animated: true },
  glitterPurple: { type: 'glitter', baseColor: '#9D4EDD', intensity: 0.8, animated: true },

  // Scale patterns (good for grass, leaves, dragon scales)
  scaleGreen: { type: 'scale', baseColor: '#6BCB77', intensity: 0.5, scale: 1.0 },
  scaleBlue: { type: 'scale', baseColor: '#4D96FF', intensity: 0.4, scale: 0.8 },
  scaleGold: { type: 'scale', baseColor: '#FFD700', intensity: 0.6, scale: 1.2 },

  // Dot patterns (good for polka dots, freckles)
  dotsRed: { type: 'dots', baseColor: '#FF6B6B', intensity: 0.5, scale: 1.0 },
  dotsPink: { type: 'dots', baseColor: '#FFB3D9', intensity: 0.6, scale: 0.8 },
  dotsBlue: { type: 'dots', baseColor: '#B3D9FF', intensity: 0.5, scale: 1.0 },
};

export default {
  getGlitterShader,
  getScaleShader,
  getDotsShader,
  getSolidShader,
  getShaderByType,
  hexToRgb,
  createShaderUniforms,
  TEXTURE_PRESETS,
};
