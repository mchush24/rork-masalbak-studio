/**
 * useCopywriting Hook
 * Part of #23: Profesyonel Copywriting Revizyonu
 *
 * React hook for accessing role-aware copywriting throughout the app.
 *
 * Usage:
 * const copy = useCopywriting();
 * <Text>{copy.analysis.title}</Text>
 * <Text>{copy.format('Tamamlandı', { emoji: '✨' })}</Text>
 */

import { useMemo, useCallback } from 'react';
import { useRole, useCopywriting as useRoleCopywriting } from '@/lib/contexts/RoleContext';
import {
  CopywritingService,
  CopywritingTexts,
  getCopyForRole,
} from '@/lib/services/copywriting-service';

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseCopywritingReturn extends CopywritingTexts {
  /** Format text with optional emoji (respects role settings) */
  format: (text: string, options?: { emoji?: string; prefix?: string; suffix?: string }) => string;
  /** Get role-specific greeting with optional name */
  greet: (name?: string) => string;
  /** Get subject label (child/student/client) */
  getSubjectLabel: (plural?: boolean) => string;
  /** Check if emoji should be shown */
  shouldShowEmoji: boolean;
  /** Current formality level */
  formality: 'informal' | 'neutral' | 'formal';
  /** Current role */
  role: 'parent' | 'teacher' | 'expert';
  /** Technical level */
  technicalLevel: 'simple' | 'moderate' | 'technical';
  /** Whether to use emoji in text */
  useEmoji: boolean;
}

/**
 * Hook for accessing role-aware copywriting
 */
export function useCopywriting(): UseCopywritingReturn {
  const { role, config } = useRole();
  const copywritingSettings = useRoleCopywriting();

  // Get texts for current role
  const texts = useMemo(() => getCopyForRole(role), [role]);

  // Create service instance
  const service = useMemo(() => new CopywritingService(role), [role]);

  // Format function
  const format = useCallback(
    (text: string, options?: { emoji?: string; prefix?: string; suffix?: string }) => {
      return service.format(text, options);
    },
    [service]
  );

  // Greet function
  const greet = useCallback(
    (name?: string) => {
      return service.greet(name);
    },
    [service]
  );

  // Get subject label
  const getSubjectLabel = useCallback(
    (plural = false) => {
      return service.getSubjectLabel(plural);
    },
    [service]
  );

  return {
    // All text categories
    ...texts,

    // Helper functions
    format,
    greet,
    getSubjectLabel,

    // Settings
    shouldShowEmoji: copywritingSettings.useEmoji,
    formality: copywritingSettings.formality,
    role,
    technicalLevel: copywritingSettings.technicalLevel,
    useEmoji: copywritingSettings.useEmoji,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for getting specific text category
 */
export function useCopywritingCategory<K extends keyof CopywritingTexts>(
  category: K
): CopywritingTexts[K] {
  const { role } = useRole();
  const texts = useMemo(() => getCopyForRole(role), [role]);
  return texts[category];
}

/**
 * Hook for getting analysis-specific texts
 */
export function useAnalysisCopy() {
  return useCopywritingCategory('analysis');
}

/**
 * Hook for getting result-specific texts
 */
export function useResultsCopy() {
  return useCopywritingCategory('results');
}

/**
 * Hook for getting action texts
 */
export function useActionsCopy() {
  return useCopywritingCategory('actions');
}

/**
 * Hook for getting error texts
 */
export function useErrorsCopy() {
  return useCopywritingCategory('errors');
}

/**
 * Hook for getting success texts
 */
export function useSuccessCopy() {
  return useCopywritingCategory('success');
}

/**
 * Hook for getting status texts
 */
export function useStatusCopy() {
  return useCopywritingCategory('status');
}

/**
 * Hook for getting empty state texts
 */
export function useEmptyStateCopy() {
  return useCopywritingCategory('emptyStates');
}

/**
 * Hook for getting subject (child/student/client) related texts
 */
export function useSubjectsCopy() {
  return useCopywritingCategory('subjects');
}

/**
 * Hook for getting professional-specific texts (teachers/experts only)
 */
export function useProfessionalCopy() {
  return useCopywritingCategory('professional');
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get formatted text with role-appropriate styling
 */
export function useFormattedText() {
  const { role } = useRole();
  const copywritingSettings = useRoleCopywriting();

  const formatWithEmoji = useCallback(
    (text: string, emoji: string): string => {
      if (copywritingSettings.useEmoji) {
        return `${emoji} ${text}`;
      }
      return text;
    },
    [copywritingSettings.useEmoji]
  );

  const formatSuccess = useCallback(
    (text: string): string => {
      return formatWithEmoji(text, '✓');
    },
    [formatWithEmoji]
  );

  const formatError = useCallback(
    (text: string): string => {
      return formatWithEmoji(text, '✗');
    },
    [formatWithEmoji]
  );

  const formatWarning = useCallback(
    (text: string): string => {
      return formatWithEmoji(text, '⚠');
    },
    [formatWithEmoji]
  );

  const formatInfo = useCallback(
    (text: string): string => {
      return formatWithEmoji(text, 'ℹ');
    },
    [formatWithEmoji]
  );

  return {
    formatWithEmoji,
    formatSuccess,
    formatError,
    formatWarning,
    formatInfo,
    useEmoji: copywritingSettings.useEmoji,
    formality: copywritingSettings.formality,
    technicalLevel: copywritingSettings.technicalLevel,
  };
}

/**
 * Hook to get role-appropriate button text
 */
export function useButtonText() {
  const actions = useCopywritingCategory('actions');
  const { role } = useRole();

  return {
    ...actions,
    primary: role === 'parent' ? actions.start : actions.start,
    secondary: actions.cancel,
    destructive: actions.delete,
  };
}

/**
 * Hook to get role-appropriate placeholder text
 */
export function usePlaceholderText() {
  const { role } = useRole();
  const subjects = useCopywritingCategory('subjects');

  const getSearchPlaceholder = useCallback(() => {
    switch (role) {
      case 'parent':
        return 'Ara...';
      case 'teacher':
        return 'Öğrenci ara...';
      case 'expert':
        return 'Danışan ara...';
    }
  }, [role]);

  const getNamePlaceholder = useCallback(() => {
    switch (role) {
      case 'parent':
        return 'Çocuğun adı';
      case 'teacher':
        return 'Öğrenci adı';
      case 'expert':
        return 'Danışan adı';
    }
  }, [role]);

  const getNotesPlaceholder = useCallback(() => {
    switch (role) {
      case 'parent':
        return 'Notlarınız...';
      case 'teacher':
        return 'Gözlem notları...';
      case 'expert':
        return 'Klinik notlar...';
    }
  }, [role]);

  return {
    search: getSearchPlaceholder(),
    name: getNamePlaceholder(),
    notes: getNotesPlaceholder(),
    subjectSingular: subjects.singular,
    subjectPlural: subjects.plural,
  };
}

export default useCopywriting;
