/**
 * 🖌️ Advanced Brush Tool
 *
 * Features:
 * - Variable size (5-50px with pressure sensitivity)
 * - Opacity control (0-100%)
 * - Hardness/softness adjustment
 * - Pressure-sensitive size and opacity
 * - Smooth path interpolation
 * - Skia GPU-accelerated rendering
 */

import React, { useMemo } from 'react';
import { Path as SkiaPath, Paint, Skia, BlendMode } from '@shopify/react-native-skia';
import { useColoring } from '../ColoringContext';
import { PressureManager, BrushModifiers } from '../utils/pressureSensitivity';

export interface BrushToolProps {
  path: any; // Skia Path object
  color: string;
  baseSize: number;
  baseOpacity: number;
  hardness: number;
  pressureModifiers?: BrushModifiers;
  isEraser?: boolean;
}

/**
 * Renders a single brush stroke with advanced settings
 */
export function BrushStroke({
  path,
  color,
  baseSize,
  baseOpacity,
  hardness,
  pressureModifiers,
  isEraser = false,
}: BrushToolProps) {
  // Calculate final size and opacity with pressure
  const finalSize = pressureModifiers
    ? baseSize * pressureModifiers.sizeMultiplier
    : baseSize;

  const finalOpacity = pressureModifiers
    ? baseOpacity * pressureModifiers.opacityMultiplier
    : baseOpacity;

  // Create paint configuration
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAntiAlias(true);

    if (isEraser) {
      // Eraser uses destination-out blend mode
      p.setBlendMode(BlendMode.DstOut);
      p.setColor(Skia.Color('black'));
    } else {
      // Regular brush
      const rgba = hexToRgba(color, finalOpacity);
      p.setColor(Skia.Color(rgba));
    }

    // Stroke configuration
    p.setStyle(1); // Stroke style
    p.setStrokeWidth(finalSize);
    p.setStrokeCap(1); // Round cap
    p.setStrokeJoin(1); // Round join

    // Apply hardness (softer edges with lower hardness)
    if (hardness < 1 && !isEraser) {
      // Create blur effect for soft brushes
      const blurSigma = (1 - hardness) * finalSize * 0.2;
      const blur = Skia.ImageFilter.MakeBlur(blurSigma, blurSigma, 0, null);
      p.setImageFilter(blur);
    }

    return p;
  }, [color, finalSize, finalOpacity, hardness, isEraser]);

  return <SkiaPath path={path} paint={paint} />;
}

// ============================================================================
// BRUSH PATH BUILDER
// ============================================================================

/**
 * Creates smooth brush paths with interpolation
 */
export class BrushPathBuilder {
  private path: any;
  private lastPoint: { x: number; y: number } | null = null;
  private pressureManager: PressureManager;

  constructor(pressureSensitivityEnabled: boolean = false) {
    this.path = Skia.Path.Make();
    this.pressureManager = new PressureManager(pressureSensitivityEnabled);
  }

  /**
   * Start a new stroke
   */
  start(x: number, y: number, touch?: any) {
    this.path.moveTo(x, y);
    this.lastPoint = { x, y };

    if (touch) {
      this.pressureManager.updatePressure(touch);
    }
  }

  /**
   * Add point to stroke with smooth interpolation
   */
  addPoint(x: number, y: number, touch?: any) {
    if (!this.lastPoint) {
      this.start(x, y, touch);
      return;
    }

    // Update pressure
    if (touch) {
      this.pressureManager.updatePressure(touch);
    }

    // Calculate distance from last point
    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only add if moved significantly (prevents jitter)
    if (distance > 2) {
      // Use quadratic bezier for smooth curves
      const midX = (this.lastPoint.x + x) / 2;
      const midY = (this.lastPoint.y + y) / 2;

      this.path.quadTo(this.lastPoint.x, this.lastPoint.y, midX, midY);
      this.lastPoint = { x, y };
    }
  }

  /**
   * Finish the stroke
   */
  end(x: number, y: number, touch?: any) {
    if (this.lastPoint) {
      // Final point with straight line for accuracy
      this.path.lineTo(x, y);

      if (touch) {
        this.pressureManager.updatePressure(touch);
      }
    }
  }

  /**
   * Get the current path
   */
  getPath() {
    return this.path;
  }

  /**
   * Get a copy of the path
   */
  copyPath() {
    return this.path.copy();
  }

  /**
   * Get current brush modifiers based on pressure
   */
  getBrushModifiers(): BrushModifiers {
    return this.pressureManager.getBrushModifiers();
  }

  /**
   * Reset the builder for a new stroke
   */
  reset() {
    this.path = Skia.Path.Make();
    this.lastPoint = null;
    this.pressureManager.reset();
  }
}

// ============================================================================
// BRUSH PREVIEW
// ============================================================================

/**
 * Live preview of brush settings (shown while adjusting)
 */
export function BrushPreview({
  color,
  size,
  opacity,
  hardness,
}: {
  color: string;
  size: number;
  opacity: number;
  hardness: number;
}) {
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAntiAlias(true);

    const rgba = hexToRgba(color, opacity);
    p.setColor(Skia.Color(rgba));

    // Apply hardness blur
    if (hardness < 1) {
      const blurSigma = (1 - hardness) * size * 0.2;
      const blur = Skia.ImageFilter.MakeBlur(blurSigma, blurSigma, 0, null);
      p.setImageFilter(blur);
    }

    return p;
  }, [color, size, opacity, hardness]);

  // Render as a circle at preview location
  // (In actual UI, this would be positioned near the settings panel)
  return (
    <SkiaPath
      path={createCirclePath(50, 50, size / 2)}
      paint={paint}
    />
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert hex color to RGBA with alpha
 */
function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create a circle path for preview
 */
function createCirclePath(cx: number, cy: number, radius: number) {
  const path = Skia.Path.Make();
  path.addCircle(cx, cy, radius);
  return path;
}

/**
 * Create brush texture pattern (for advanced hardness rendering)
 * Future enhancement for Phase 3+
 */
export function createBrushTexture(size: number, hardness: number) {
  // This would create a gradient texture for soft brushes
  // Using Skia Shader API
  // Implementation deferred to Phase 3
  return null;
}

// ============================================================================
// BrushPathBuilder is already exported above
// ============================================================================
