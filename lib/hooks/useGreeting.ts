/**
 * useGreeting Hook
 * Part of #23: Profesyonel Copywriting Revizyonu
 *
 * React hook for accessing role-aware greetings.
 *
 * Usage:
 * const { greeting, title, subtitle } = useGreeting();
 * <Text>{title}</Text>
 * <Text>{subtitle}</Text>
 */

import { useMemo } from 'react';
import { useRole, useCopywriting as useCopywritingSettings } from '@/lib/contexts/RoleContext';
import { getRoleAwareGreetingService } from '@/lib/services/role-aware-greeting-service';

interface UseGreetingOptions {
  /** Whether this is the user's first visit */
  isFirstVisit?: boolean;
  /** Days since the user's last visit */
  daysSinceLastVisit?: number;
  /** User's name for personalized greeting */
  name?: string;
}

interface UseGreetingReturn {
  /** Complete greeting object */
  greeting: { title: string; subtitle: string };
  /** Formatted title (with emoji if applicable) */
  title: string;
  /** Subtitle text */
  subtitle: string;
  /** Current time of day */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** Whether emoji is used for this role */
  showsEmoji: boolean;
}

/**
 * Hook for getting role-aware greetings
 */
export function useGreeting(options?: UseGreetingOptions): UseGreetingReturn {
  const { role } = useRole();
  const _copywritingSettings = useCopywritingSettings();

  const service = useMemo(() => {
    return getRoleAwareGreetingService(role);
  }, [role]);

  const greeting = useMemo(() => {
    const formatted = service.getFormattedGreeting({
      isFirstVisit: options?.isFirstVisit,
      daysSinceLastVisit: options?.daysSinceLastVisit,
    });

    // Add name if provided
    if (options?.name) {
      if (role === 'parent') {
        return {
          title: `${formatted.title}`,
          subtitle: `${options.name}, ${formatted.subtitle.toLowerCase()}`,
        };
      }
      return {
        title: formatted.title,
        subtitle: `${options.name}, ${formatted.subtitle.toLowerCase()}`,
      };
    }

    return formatted;
  }, [service, role, options?.isFirstVisit, options?.daysSinceLastVisit, options?.name]);

  return {
    greeting,
    title: greeting.title,
    subtitle: greeting.subtitle,
    timeOfDay: service.getTimeOfDay(),
    showsEmoji: service.shouldShowEmoji(),
  };
}

/**
 * Hook for getting just the greeting title
 */
export function useGreetingTitle(options?: UseGreetingOptions): string {
  const { title } = useGreeting(options);
  return title;
}

/**
 * Hook for getting just the greeting subtitle
 */
export function useGreetingSubtitle(options?: UseGreetingOptions): string {
  const { subtitle } = useGreeting(options);
  return subtitle;
}

/**
 * Hook for getting time of day
 */
export function useTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const { timeOfDay } = useGreeting();
  return timeOfDay;
}

export default useGreeting;
