/**
 * ✍️ Pressure Sensitivity API
 *
 * Handles pressure-sensitive input from:
 * - Apple Pencil (iOS)
 * - S Pen (Samsung tablets)
 * - Generic stylus (Android)
 * - Pressure-enabled web browsers
 *
 * Premium-tier feature that adjusts:
 * - Brush size (pressure → size multiplier)
 * - Opacity (pressure → opacity multiplier)
 * - Line smoothness
 */

import { Platform } from 'react-native';

export interface PressureData {
  pressure: number; // 0-1
  force: number; // 0-1 (iOS-specific)
  altitudeAngle?: number; // Stylus tilt angle (iOS)
  azimuthAngle?: number; // Stylus rotation (iOS)
}

export interface BrushModifiers {
  sizeMultiplier: number; // 0.5-2.0
  opacityMultiplier: number; // 0.3-1.0
}

// ============================================================================
// PRESSURE NORMALIZATION
// ============================================================================

/**
 * Normalize raw pressure values to 0-1 range
 * Different platforms report pressure differently
 */
export function normalizePressure(rawPressure: number, platform: string = Platform.OS): number {
  // Web: PointerEvent.pressure (0-1)
  if (platform === 'web') {
    return Math.max(0, Math.min(1, rawPressure));
  }

  // iOS: UITouch.force (0-1, but can exceed 1 with hard press)
  if (platform === 'ios') {
    return Math.max(0, Math.min(1, rawPressure));
  }

  // Android: MotionEvent.getPressure() (0-1)
  if (platform === 'android') {
    return Math.max(0, Math.min(1, rawPressure));
  }

  // Default: already normalized
  return Math.max(0, Math.min(1, rawPressure));
}

/**
 * Apply smoothing to pressure values to avoid jitter
 * Uses exponential moving average
 */
export class PressureSmoothing {
  private history: number[] = [];
  private readonly maxHistory: number;
  private readonly smoothingFactor: number;

  constructor(maxHistory: number = 3, smoothingFactor: number = 0.7) {
    this.maxHistory = maxHistory;
    this.smoothingFactor = smoothingFactor;
  }

  /**
   * Add new pressure value and return smoothed result
   */
  smooth(pressure: number): number {
    this.history.push(pressure);

    // Keep only recent history
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Exponential moving average
    if (this.history.length === 1) {
      return pressure; // First value, no smoothing
    }

    const avg = this.history.reduce((sum, p) => sum + p, 0) / this.history.length;
    return this.smoothingFactor * pressure + (1 - this.smoothingFactor) * avg;
  }

  /**
   * Reset smoothing history (e.g., on new stroke)
   */
  reset() {
    this.history = [];
  }
}

// ============================================================================
// BRUSH MODIFIERS
// ============================================================================

/**
 * Calculate brush size and opacity modifiers based on pressure
 */
export function calculateBrushModifiers(
  pressure: number,
  settings: {
    pressureSensitivity: boolean;
    minSizeMultiplier?: number;
    maxSizeMultiplier?: number;
    minOpacityMultiplier?: number;
    maxOpacityMultiplier?: number;
  } = { pressureSensitivity: true }
): BrushModifiers {
  // If pressure sensitivity disabled, return neutral values
  if (!settings.pressureSensitivity) {
    return {
      sizeMultiplier: 1.0,
      opacityMultiplier: 1.0,
    };
  }

  const {
    minSizeMultiplier = 0.5,
    maxSizeMultiplier = 2.0,
    minOpacityMultiplier = 0.3,
    maxOpacityMultiplier = 1.0,
  } = settings;

  // Linear interpolation based on pressure
  const sizeMultiplier = minSizeMultiplier + (maxSizeMultiplier - minSizeMultiplier) * pressure;
  const opacityMultiplier =
    minOpacityMultiplier + (maxOpacityMultiplier - minOpacityMultiplier) * pressure;

  return {
    sizeMultiplier,
    opacityMultiplier,
  };
}

/**
 * Apply non-linear curve to pressure for more natural feel
 * Uses ease-in-out curve
 */
export function applyPressureCurve(pressure: number, curve: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' = 'easeInOut'): number {
  switch (curve) {
    case 'linear':
      return pressure;

    case 'easeIn':
      // Quadratic ease-in
      return pressure * pressure;

    case 'easeOut':
      // Quadratic ease-out
      return 1 - (1 - pressure) * (1 - pressure);

    case 'easeInOut':
      // Quadratic ease-in-out
      return pressure < 0.5
        ? 2 * pressure * pressure
        : 1 - Math.pow(-2 * pressure + 2, 2) / 2;

    default:
      return pressure;
  }
}

// ============================================================================
// PRESSURE DETECTION
// ============================================================================

/**
 * Detect if current input device supports pressure
 * (iOS Apple Pencil, Android Stylus, Web PointerEvent)
 */
export function isPressureAvailable(): boolean {
  if (Platform.OS === 'web') {
    // Check if PointerEvent API supports pressure
    return (
      typeof window !== 'undefined' &&
      'PointerEvent' in window &&
      'pressure' in PointerEvent.prototype
    );
  }

  // iOS: Check for 3D Touch / Apple Pencil support
  // This will be determined at runtime based on UITouch.force
  if (Platform.OS === 'ios') {
    return true; // Will check actual force value in touch handler
  }

  // Android: Most tablets with stylus support pressure
  // Will be verified at runtime
  if (Platform.OS === 'android') {
    return true; // Will check actual pressure value in motion event
  }

  return false;
}

/**
 * Extract pressure data from Skia touch event
 */
export function extractPressureFromTouch(touch: any): PressureData {
  const pressure = touch.force || touch.pressure || 0.5; // Default to medium pressure
  const force = touch.force || pressure;

  return {
    pressure: normalizePressure(pressure),
    force: normalizePressure(force),
    altitudeAngle: touch.altitudeAngle,
    azimuthAngle: touch.azimuthAngle,
  };
}

// ============================================================================
// PRESSURE MANAGER CLASS
// ============================================================================

/**
 * Manages pressure state across a drawing session
 */
export class PressureManager {
  private smoother: PressureSmoothing;
  private enabled: boolean;
  private currentPressure: number = 0.5;

  constructor(enabled: boolean = true) {
    this.smoother = new PressureSmoothing(3, 0.7);
    this.enabled = enabled;
  }

  /**
   * Update pressure from touch event
   */
  updatePressure(touch: any): number {
    if (!this.enabled) {
      return 0.5; // Neutral pressure
    }

    const { pressure } = extractPressureFromTouch(touch);
    const smoothed = this.smoother.smooth(pressure);

    // Apply ease-in-out curve for natural feel
    const curved = applyPressureCurve(smoothed, 'easeInOut');

    this.currentPressure = curved;
    return curved;
  }

  /**
   * Get current brush modifiers based on pressure
   */
  getBrushModifiers(): BrushModifiers {
    return calculateBrushModifiers(this.currentPressure, {
      pressureSensitivity: this.enabled,
    });
  }

  /**
   * Reset pressure state (call on stroke end)
   */
  reset() {
    this.smoother.reset();
    this.currentPressure = 0.5;
  }

  /**
   * Enable/disable pressure sensitivity
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Get current pressure value
   */
  getCurrentPressure(): number {
    return this.currentPressure;
  }
}

// ============================================================================
// STYLUS TILT SUPPORT (Advanced - iOS only)
// ============================================================================

/**
 * Calculate brush shape modifier based on stylus tilt
 * (Future enhancement for Phase 5+)
 */
export function calculateTiltModifier(altitudeAngle?: number): {
  widthScale: number;
  heightScale: number;
} {
  if (!altitudeAngle) {
    return { widthScale: 1, heightScale: 1 }; // Circular brush
  }

  // Convert altitude angle to tilt factor
  // 90° = perpendicular (circular), 0° = flat (elliptical)
  const tiltFactor = Math.cos(altitudeAngle);

  return {
    widthScale: 1.0,
    heightScale: Math.max(0.3, 1.0 - tiltFactor * 0.7), // Flatten brush when tilted
  };
}

// ============================================================================
// All exports are already declared above with 'export' keyword
// ============================================================================
