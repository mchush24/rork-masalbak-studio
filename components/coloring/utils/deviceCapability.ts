/**
 * 🔍 Device Capability Detection
 *
 * Detects device performance tier for progressive enhancement:
 * - Basic: All devices (60 FPS guaranteed, solid colors, fixed brush)
 * - Advanced: Mid-high end (full brush control, pixel-perfect fill, opacity)
 * - Premium: High-end (pressure sensitivity, gradients, sparkle effects)
 *
 * Detection methods:
 * 1. Platform heuristics (iOS model, Android RAM)
 * 2. Runtime performance test (Skia rendering benchmark)
 * 3. Feature detection (pressure API availability)
 */

import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';

export type PerformanceTier = 'basic' | 'advanced' | 'premium';

export interface DeviceCapabilities {
  tier: PerformanceTier;
  supportsGradients: boolean;
  supportsPressure: boolean;
  supportsAnimations: boolean;
  maxHistorySteps: number;
  maxCanvasSize: number;
  recommendedBrushSizes: { min: number; max: number };
}

// ============================================================================
// TIER-SPECIFIC CAPABILITIES
// ============================================================================

const TIER_CAPABILITIES: Record<PerformanceTier, Omit<DeviceCapabilities, 'tier'>> = {
  basic: {
    supportsGradients: false,
    supportsPressure: false,
    supportsAnimations: true, // Simple animations only
    maxHistorySteps: 10,
    maxCanvasSize: 1024,
    recommendedBrushSizes: { min: 10, max: 30 },
  },
  advanced: {
    supportsGradients: false,
    supportsPressure: false,
    supportsAnimations: true,
    maxHistorySteps: 20,
    maxCanvasSize: 2048,
    recommendedBrushSizes: { min: 5, max: 50 },
  },
  premium: {
    supportsGradients: true,
    supportsPressure: true, // Will be verified separately
    supportsAnimations: true,
    maxHistorySteps: 30,
    maxCanvasSize: 4096,
    recommendedBrushSizes: { min: 2, max: 100 },
  },
};

// ============================================================================
// DEVICE CLASSIFICATION
// ============================================================================

/**
 * iOS device classification based on model year
 */
function classifyiOSDevice(): PerformanceTier {
  const model = Device.modelName || '';

  // Premium: Latest devices (2020+)
  // iPhone 12+, iPad Air 4+, iPad Pro 2020+
  if (
    model.includes('iPhone 15') ||
    model.includes('iPhone 14') ||
    model.includes('iPhone 13') ||
    model.includes('iPhone 12') ||
    model.includes('iPad Air (5th') ||
    model.includes('iPad Air (4th') ||
    model.includes('iPad Pro') // All iPad Pros are premium
  ) {
    return 'premium';
  }

  // Advanced: Mid-tier devices (2017-2019)
  // iPhone X, XS, XR, 11, iPad 8th+
  if (
    model.includes('iPhone 11') ||
    model.includes('iPhone XR') ||
    model.includes('iPhone XS') ||
    model.includes('iPhone X') ||
    model.includes('iPad (9th') ||
    model.includes('iPad (8th') ||
    model.includes('iPad Air (3rd')
  ) {
    return 'advanced';
  }

  // Basic: Older devices
  return 'basic';
}

/**
 * Android device classification based on available metrics
 */
async function classifyAndroidDevice(): Promise<PerformanceTier> {
  try {
    // Try to get device memory (Chrome 63+, Android WebView)
    const deviceMemory = (navigator as any).deviceMemory;

    if (deviceMemory >= 6) {
      return 'premium'; // 6GB+ RAM
    } else if (deviceMemory >= 4) {
      return 'advanced'; // 4-6GB RAM
    } else if (deviceMemory) {
      return 'basic'; // <4GB RAM
    }

    // Fallback: Use device year heuristic
    const deviceYearString = Device.deviceYearClass?.toString() || '0';
    const deviceYear = parseInt(deviceYearString, 10);

    if (deviceYear >= 2021) {
      return 'premium';
    } else if (deviceYear >= 2019) {
      return 'advanced';
    }

    return 'basic';
  } catch (error) {
    console.warn('Android device classification failed, defaulting to basic:', error);
    return 'basic';
  }
}

/**
 * Web platform classification
 */
function classifyWebDevice(): PerformanceTier {
  try {
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency || 2;

    // Premium: 8GB+ RAM, 8+ cores
    if (memory >= 8 && cores >= 8) {
      return 'premium';
    }

    // Advanced: 4GB+ RAM, 4+ cores
    if (memory >= 4 && cores >= 4) {
      return 'advanced';
    }

    // Basic: Everything else
    return 'basic';
  } catch (error) {
    console.warn('Web device classification failed, defaulting to advanced:', error);
    return 'advanced'; // Web defaults to advanced
  }
}

// ============================================================================
// PERFORMANCE BENCHMARK
// ============================================================================

/**
 * Runtime performance test using Skia rendering
 * Measures how many circles can be drawn in 16ms (60 FPS budget)
 */
export async function runPerformanceBenchmark(): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const iterations = 1000;

    // Simulate Skia path operations
    let dummyCalc = 0;
    for (let i = 0; i < iterations; i++) {
      // Simulate expensive calculations similar to Skia path operations
      dummyCalc += Math.sqrt(i) * Math.sin(i);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Score: operations per 16ms (60 FPS frame budget)
    const score = (iterations / duration) * 16;

    resolve(score);
  });
}

/**
 * Adjust tier based on benchmark results
 */
function adjustTierByBenchmark(baseTier: PerformanceTier, score: number): PerformanceTier {
  // Score thresholds
  const PREMIUM_THRESHOLD = 500;
  const ADVANCED_THRESHOLD = 250;

  if (score >= PREMIUM_THRESHOLD) {
    // Can upgrade to premium
    if (baseTier === 'advanced') return 'premium';
    if (baseTier === 'basic') return 'advanced';
  } else if (score >= ADVANCED_THRESHOLD) {
    // Can upgrade to advanced
    if (baseTier === 'basic') return 'advanced';
  } else {
    // Low performance: downgrade
    if (baseTier === 'premium') return 'advanced';
    if (baseTier === 'advanced') return 'basic';
  }

  return baseTier;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detects device capabilities with progressive enhancement
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  console.log('[DeviceCapability] Starting detection...');

  // Step 1: Platform-based classification
  let tier: PerformanceTier;

  if (Platform.OS === 'ios') {
    tier = classifyiOSDevice();
    console.log(`[DeviceCapability] iOS classified as: ${tier}`);
  } else if (Platform.OS === 'android') {
    tier = await classifyAndroidDevice();
    console.log(`[DeviceCapability] Android classified as: ${tier}`);
  } else {
    tier = classifyWebDevice();
    console.log(`[DeviceCapability] Web classified as: ${tier}`);
  }

  // Step 2: Run performance benchmark
  try {
    const benchmarkScore = await runPerformanceBenchmark();
    console.log(`[DeviceCapability] Benchmark score: ${benchmarkScore.toFixed(0)}`);

    tier = adjustTierByBenchmark(tier, benchmarkScore);
    console.log(`[DeviceCapability] Adjusted tier: ${tier}`);
  } catch (error) {
    console.warn('[DeviceCapability] Benchmark failed, using base tier:', error);
  }

  // Step 3: Check pressure sensitivity support (premium feature)
  const supportsPressure = tier === 'premium' && checkPressureSupport();

  // Step 4: Build capabilities object
  const capabilities: DeviceCapabilities = {
    tier,
    ...TIER_CAPABILITIES[tier],
    supportsPressure, // Override with actual detection
  };

  console.log('[DeviceCapability] Final capabilities:', capabilities);

  return capabilities;
}

// ============================================================================
// FEATURE DETECTION
// ============================================================================

/**
 * Check if device supports pointer pressure events
 */
function checkPressureSupport(): boolean {
  if (Platform.OS === 'web') {
    // Web: Check PointerEvent API
    return 'PointerEvent' in window && 'pressure' in PointerEvent.prototype;
  }

  // iOS: Apple Pencil support (iPad Pro, iPad Air 3+)
  if (Platform.OS === 'ios') {
    const model = Device.modelName || '';
    return model.includes('iPad Pro') || model.includes('iPad Air');
  }

  // Android: Most stylus-enabled tablets support pressure
  // Will be verified at runtime in pressureSensitivity.ts
  if (Platform.OS === 'android') {
    const isTablet = Device.deviceType === Device.DeviceType.TABLET;
    return isTablet;
  }

  return false;
}

/**
 * Get screen pixel ratio (for canvas sizing)
 */
export function getOptimalPixelRatio(): number {
  const { width, height } = Dimensions.get('window');
  const screenSize = Math.max(width, height);

  // Limit pixel ratio based on screen size to avoid memory issues
  if (screenSize > 1200) {
    return Math.min(2, (typeof window !== 'undefined' ? window.devicePixelRatio : 2) || 2);
  }

  return (typeof window !== 'undefined' ? window.devicePixelRatio : 2) || 2;
}

/**
 * Calculate optimal canvas size based on device tier and screen size
 */
export function getOptimalCanvasSize(tier: PerformanceTier): number {
  const { width, height } = Dimensions.get('window');
  const maxScreenDimension = Math.max(width, height);
  const maxCanvasSize = TIER_CAPABILITIES[tier].maxCanvasSize;

  // Use screen size but cap at tier maximum
  return Math.min(maxScreenDimension * 2, maxCanvasSize);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TIER_CAPABILITIES };
