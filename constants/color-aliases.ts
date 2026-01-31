/**
 * Color Aliases - Semantic color mapping for UI components
 *
 * Bu dosya, UI bileşenlerinin kullandığı semantik renk isimlerini
 * gerçek Colors yapısına eşler.
 */

import { Colors } from './colors';

/**
 * UI component semantic colors
 * Bu yapı, yeni oluşturulan bileşenlerin beklediği renk yapısını sağlar
 */
export const UIColors = {
  // Primary brand colors
  primary: {
    purple: Colors.secondary.lavender,
    pink: Colors.secondary.rose,
    turquoise: Colors.secondary.mint,
    orange: Colors.primary.sunset,
  },

  // Emotion colors for analysis and feedback
  emotion: {
    joy: Colors.secondary.sunshine,
    trust: Colors.semantic.success,
    fear: Colors.semantic.error,
    anger: Colors.semantic.error, // Alias for anger
    sadness: Colors.secondary.sky,
    surprise: Colors.secondary.lavenderLight,
    anticipation: Colors.secondary.sunshineLight,
  },

  // Neutral colors
  neutral: {
    white: Colors.neutral.white,
    lightest: Colors.neutral.lightest,
    lighter: Colors.neutral.lighter,
    light: Colors.neutral.light,
    medium: Colors.neutral.medium,
    gray: Colors.neutral.medium, // Alias for gray
    dark: Colors.neutral.dark,
    darker: Colors.neutral.darkest,
    darkest: Colors.neutral.darkest, // Explicit darkest
  },

  // Background colors
  background: {
    primary: Colors.background.primary,
    secondary: Colors.neutral.lightest,
    tertiary: Colors.neutral.lighter,
  },

  // Surface colors
  surface: {
    card: Colors.background.card,
    elevated: Colors.neutral.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: Colors.neutral.darkest,
    secondary: Colors.neutral.dark,
    tertiary: Colors.neutral.medium,
    inverse: Colors.neutral.white,
  },

  // Border colors
  border: {
    light: Colors.neutral.lighter,
    medium: Colors.neutral.light,
    focus: Colors.secondary.lavender,
  },

  // Status colors
  status: {
    success: Colors.semantic.success,
    warning: Colors.semantic.warning,
    error: Colors.semantic.error,
    info: Colors.semantic.info,
  },
} as const;

export type UIColorsType = typeof UIColors;
