import { Colors } from '@/constants/colors';

/**
 * Color Contrast Checker
 *
 * Utilities for checking WCAG color contrast compliance
 * Supports AA and AAA compliance levels
 */

// ============================================
// Types
// ============================================

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ContrastResult {
  /** Contrast ratio (1:1 to 21:1) */
  ratio: number;
  /** Formatted ratio string (e.g., "4.5:1") */
  ratioString: string;
  /** Meets WCAG AA for normal text (4.5:1) */
  passesAA: boolean;
  /** Meets WCAG AA for large text (3:1) */
  passesAALarge: boolean;
  /** Meets WCAG AAA for normal text (7:1) */
  passesAAA: boolean;
  /** Meets WCAG AAA for large text (4.5:1) */
  passesAAALarge: boolean;
}

// ============================================
// Color Parsing
// ============================================

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): RGBColor {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Handle shorthand hex (e.g., #fff)
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map(c => c + c)
          .join('')
      : cleanHex;

  const bigint = parseInt(fullHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Parse rgba color string to RGB
 */
export function rgbaToRgb(rgba: string): RGBColor {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  throw new Error(`Invalid rgba color: ${rgba}`);
}

/**
 * Parse any color string to RGB
 */
export function parseColor(color: string): RGBColor {
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  if (color.startsWith('rgb')) {
    return rgbaToRgb(color);
  }
  throw new Error(`Unsupported color format: ${color}`);
}

// ============================================
// Contrast Calculation
// ============================================

/**
 * Calculate relative luminance of a color (WCAG 2.1 definition)
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(rgb: RGBColor): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(channel => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio from 1:1 (identical) to 21:1 (black vs white)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(parseColor(color1));
  const lum2 = getLuminance(parseColor(color2));

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast compliance and return detailed results
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    ratioString: `${ratio.toFixed(2)}:1`,
    passesAA: ratio >= 4.5,
    passesAALarge: ratio >= 3,
    passesAAA: ratio >= 7,
    passesAAALarge: ratio >= 4.5,
  };
}

// ============================================
// Color Suggestions
// ============================================

/**
 * Find a lighter or darker shade that meets contrast requirements
 */
export function suggestAccessibleColor(
  targetColor: string,
  backgroundColor: string,
  targetRatio: number = 4.5
): string {
  const bgLum = getLuminance(parseColor(backgroundColor));
  const targetRgb = parseColor(targetColor);

  // Determine if we should lighten or darken
  const shouldLighten = bgLum < 0.5;

  const rgb = { ...targetRgb };
  const step = shouldLighten ? 5 : -5;
  let iterations = 0;
  const maxIterations = 100;

  while (iterations < maxIterations) {
    const currentColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const ratio = getContrastRatio(currentColor, backgroundColor);

    if (ratio >= targetRatio) {
      return rgbToHex(rgb);
    }

    // Adjust all channels
    rgb.r = Math.max(0, Math.min(255, rgb.r + step));
    rgb.g = Math.max(0, Math.min(255, rgb.g + step));
    rgb.b = Math.max(0, Math.min(255, rgb.b + step));

    iterations++;
  }

  // Fallback to black or white
  return shouldLighten ? Colors.neutral.white : Colors.neutral.darkest;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// ============================================
// Accessibility Testing Helpers
// ============================================

export interface ColorPair {
  foreground: string;
  background: string;
  name?: string;
}

export interface AccessibilityReport {
  passed: number;
  failed: number;
  results: {
    name: string;
    foreground: string;
    background: string;
    contrast: ContrastResult;
    suggestion?: string;
  }[];
}

/**
 * Test multiple color pairs and generate accessibility report
 */
export function testColorPairs(pairs: ColorPair[]): AccessibilityReport {
  const results: AccessibilityReport['results'] = [];
  let passed = 0;
  let failed = 0;

  for (const pair of pairs) {
    const contrast = checkContrast(pair.foreground, pair.background);
    const passesAA = contrast.passesAA;

    if (passesAA) {
      passed++;
    } else {
      failed++;
    }

    results.push({
      name: pair.name || `${pair.foreground} on ${pair.background}`,
      foreground: pair.foreground,
      background: pair.background,
      contrast,
      suggestion: !passesAA ? suggestAccessibleColor(pair.foreground, pair.background) : undefined,
    });
  }

  return { passed, failed, results };
}

/**
 * Check if text size qualifies as "large text" for WCAG
 * Large text: 18pt (24px) or 14pt bold (18.67px)
 */
export function isLargeText(fontSize: number, isBold: boolean): boolean {
  if (isBold) {
    return fontSize >= 18.67;
  }
  return fontSize >= 24;
}

/**
 * Get required contrast ratio based on text size
 */
export function getRequiredContrast(
  fontSize: number,
  isBold: boolean,
  level: 'AA' | 'AAA' = 'AA'
): number {
  const isLarge = isLargeText(fontSize, isBold);

  if (level === 'AAA') {
    return isLarge ? 4.5 : 7;
  }
  return isLarge ? 3 : 4.5;
}
