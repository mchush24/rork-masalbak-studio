/**
 * useAccessibilityAudit Hook
 *
 * Development tool for auditing accessibility issues
 * Only active in development mode
 */

import { useEffect, useCallback, useRef } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { checkContrast, isLargeText, getRequiredContrast } from './contrastChecker';

// ============================================
// Types
// ============================================

export interface AccessibilityIssue {
  type: 'error' | 'warning';
  category: 'contrast' | 'touch-target' | 'label' | 'role' | 'structure';
  message: string;
  element?: string;
  suggestion?: string;
}

export interface AuditConfig {
  /** Minimum touch target size in pixels */
  minTouchTarget?: number;
  /** Contrast level to check ('AA' | 'AAA') */
  contrastLevel?: 'AA' | 'AAA';
  /** Enable console logging */
  enableLogging?: boolean;
}

export interface AuditResult {
  issues: AccessibilityIssue[];
  score: number; // 0-100
  passedChecks: number;
  failedChecks: number;
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: Required<AuditConfig> = {
  minTouchTarget: 44,
  contrastLevel: 'AA',
  enableLogging: __DEV__,
};

// ============================================
// Audit Functions
// ============================================

/**
 * Check if element has proper touch target size
 */
function checkTouchTarget(
  width: number,
  height: number,
  minSize: number,
  elementName?: string
): AccessibilityIssue | null {
  if (width < minSize || height < minSize) {
    return {
      type: 'error',
      category: 'touch-target',
      message: `Touch target too small: ${width}x${height}px (minimum: ${minSize}x${minSize}px)`,
      element: elementName,
      suggestion: `Increase size to at least ${minSize}x${minSize}px for easy tapping`,
    };
  }
  return null;
}

/**
 * Check if element has accessible label
 */
function checkAccessibleLabel(
  hasLabel: boolean,
  role: string,
  elementName?: string
): AccessibilityIssue | null {
  const needsLabel = ['button', 'link', 'image', 'checkbox', 'radio', 'switch'].includes(role);

  if (needsLabel && !hasLabel) {
    return {
      type: 'error',
      category: 'label',
      message: `Missing accessible label for ${role}`,
      element: elementName,
      suggestion: 'Add accessibilityLabel prop to describe the element',
    };
  }
  return null;
}

/**
 * Check color contrast compliance
 */
function checkColorContrast(
  foreground: string,
  background: string,
  fontSize: number,
  isBold: boolean,
  level: 'AA' | 'AAA',
  elementName?: string
): AccessibilityIssue | null {
  try {
    const result = checkContrast(foreground, background);
    const requiredRatio = getRequiredContrast(fontSize, isBold, level);
    const isLarge = isLargeText(fontSize, isBold);

    if (result.ratio < requiredRatio) {
      return {
        type: result.ratio < 3 ? 'error' : 'warning',
        category: 'contrast',
        message: `Insufficient contrast ratio: ${result.ratioString} (required: ${requiredRatio}:1 for ${isLarge ? 'large' : 'normal'} text)`,
        element: elementName,
        suggestion: `Increase contrast to at least ${requiredRatio}:1 for WCAG ${level} compliance`,
      };
    }
  } catch (error) {
    // Color parsing failed, skip check
    return null;
  }
  return null;
}

/**
 * Check if interactive elements have proper roles
 */
function checkAccessibleRole(
  isInteractive: boolean,
  hasRole: boolean,
  role?: string,
  elementName?: string
): AccessibilityIssue | null {
  if (isInteractive && !hasRole) {
    return {
      type: 'warning',
      category: 'role',
      message: 'Interactive element missing accessibility role',
      element: elementName,
      suggestion: 'Add accessibilityRole prop (e.g., "button", "link")',
    };
  }
  return null;
}

// ============================================
// Main Hook
// ============================================

/**
 * Hook for auditing accessibility issues in development
 *
 * @example
 * const { auditComponent, issues } = useAccessibilityAudit();
 *
 * // In render or effect
 * auditComponent({
 *   name: 'LoginButton',
 *   isInteractive: true,
 *   hasLabel: !!accessibilityLabel,
 *   role: 'button',
 *   dimensions: { width: 200, height: 44 },
 * });
 */
export function useAccessibilityAudit(config: AuditConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const issuesRef = useRef<AccessibilityIssue[]>([]);
  const screenReaderEnabled = useRef(false);

  // Check if screen reader is enabled
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      screenReaderEnabled.current = enabled;
    });

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        screenReaderEnabled.current = enabled;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const logIssue = useCallback(
    (issue: AccessibilityIssue) => {
      if (finalConfig.enableLogging && __DEV__) {
        const prefix = issue.type === 'error' ? '🔴 A11Y Error' : '🟡 A11Y Warning';
        console.warn(
          `${prefix}: ${issue.message}${issue.element ? ` (${issue.element})` : ''}\n${issue.suggestion ? `💡 ${issue.suggestion}` : ''}`
        );
      }
    },
    [finalConfig.enableLogging]
  );

  interface ComponentAuditParams {
    name?: string;
    isInteractive?: boolean;
    hasLabel?: boolean;
    role?: string;
    dimensions?: { width: number; height: number };
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    isBold?: boolean;
  }

  const auditComponent = useCallback(
    (params: ComponentAuditParams) => {
      if (!__DEV__) return;

      const issues: AccessibilityIssue[] = [];

      // Touch target check
      if (params.isInteractive && params.dimensions) {
        const touchIssue = checkTouchTarget(
          params.dimensions.width,
          params.dimensions.height,
          finalConfig.minTouchTarget,
          params.name
        );
        if (touchIssue) issues.push(touchIssue);
      }

      // Label check
      if (params.isInteractive && params.role) {
        const labelIssue = checkAccessibleLabel(
          params.hasLabel ?? false,
          params.role,
          params.name
        );
        if (labelIssue) issues.push(labelIssue);
      }

      // Role check
      const roleIssue = checkAccessibleRole(
        params.isInteractive ?? false,
        !!params.role,
        params.role,
        params.name
      );
      if (roleIssue) issues.push(roleIssue);

      // Contrast check
      if (params.textColor && params.backgroundColor && params.fontSize) {
        const contrastIssue = checkColorContrast(
          params.textColor,
          params.backgroundColor,
          params.fontSize,
          params.isBold ?? false,
          finalConfig.contrastLevel,
          params.name
        );
        if (contrastIssue) issues.push(contrastIssue);
      }

      // Log issues
      issues.forEach(logIssue);

      // Store issues
      issuesRef.current = [...issuesRef.current, ...issues];
    },
    [finalConfig, logIssue]
  );

  const getAuditResult = useCallback((): AuditResult => {
    const issues = issuesRef.current;
    const errorCount = issues.filter((i) => i.type === 'error').length;
    const warningCount = issues.filter((i) => i.type === 'warning').length;
    const totalChecks = issues.length + 10; // Assume some base checks passed
    const failedChecks = errorCount + warningCount * 0.5;
    const score = Math.max(0, Math.round((1 - failedChecks / totalChecks) * 100));

    return {
      issues,
      score,
      passedChecks: totalChecks - issues.length,
      failedChecks: issues.length,
    };
  }, []);

  const clearIssues = useCallback(() => {
    issuesRef.current = [];
  }, []);

  return {
    auditComponent,
    getAuditResult,
    clearIssues,
    issues: issuesRef.current,
    isScreenReaderEnabled: screenReaderEnabled.current,
  };
}

// ============================================
// Utility Hook for Screen Reader Status
// ============================================

/**
 * Hook that returns current screen reader status
 */
export function useScreenReaderStatus() {
  const enabled = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((isEnabled) => {
      enabled.current = isEnabled;
    });

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        enabled.current = isEnabled;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return enabled.current;
}

// ============================================
// Constants for Accessibility Guidelines
// ============================================

export const WCAG_GUIDELINES = {
  /** Minimum touch target size (WCAG 2.5.5) */
  MIN_TOUCH_TARGET: 44,
  /** Minimum contrast for normal text AA */
  MIN_CONTRAST_AA: 4.5,
  /** Minimum contrast for large text AA */
  MIN_CONTRAST_AA_LARGE: 3,
  /** Minimum contrast for normal text AAA */
  MIN_CONTRAST_AAA: 7,
  /** Minimum contrast for large text AAA */
  MIN_CONTRAST_AAA_LARGE: 4.5,
  /** Large text size threshold */
  LARGE_TEXT_SIZE: 24,
  /** Large bold text size threshold */
  LARGE_BOLD_TEXT_SIZE: 18.67,
} as const;
