/**
 * Accessibility Module Export
 * Phase 17: Accessibility 2.0
 *
 * Features:
 * - Screen reader support
 * - Font scaling (normal/large/xlarge)
 * - Reduced motion support
 * - High contrast mode
 * - Color blind modes (deuteranopia, protanopia, tritanopia)
 * - Cognitive accessibility (simplified language, reduced information)
 * - Larger touch targets
 */

export {
  AccessibilityProvider,
  useAccessibility,
  useAccessibleAnimation,
  useAccessibleFontSize,
  useMinimumTouchTarget,
  useColorBlindSafeColors,
  useTransformedColor,
  useCognitiveAccessibility,
} from './AccessibilityProvider';

export type { ColorBlindMode } from './AccessibilityProvider';

export {
  AccessibleButton,
  AccessibleText,
  AccessibleImage,
  SkipLink,
  LiveRegion,
  FocusGroup,
  AccessibilitySettingsItem,
  HighContrastWrapper,
  ReducedMotionWrapper,
  ColorBlindModeSelector,
  CognitiveAccessibilitySettings,
} from './AccessibilityComponents';

// Color contrast checking utilities
export {
  checkContrast,
  getContrastRatio,
  getLuminance,
  hexToRgb,
  rgbToHex,
  parseColor,
  suggestAccessibleColor,
  testColorPairs,
  isLargeText,
  getRequiredContrast,
  type ContrastResult,
  type AccessibilityReport,
  type ColorPair,
} from './contrastChecker';

// Accessibility audit utilities
export {
  useAccessibilityAudit,
  useScreenReaderStatus,
  WCAG_GUIDELINES,
  type AccessibilityIssue,
  type AuditConfig,
  type AuditResult,
} from './useAccessibilityAudit';
