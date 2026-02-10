/**
 * Role-Aware Gamification Components
 * Part of #22: Gamification'ı Opsiyonel/Subtle Yap
 *
 * These wrappers automatically show/hide gamification elements based on user role:
 * - Parents: Full gamification (XP, badges, streaks, celebrations)
 * - Teachers: Gamification disabled by default (can be enabled in settings)
 * - Experts: No gamification (clean professional UI)
 *
 * Each wrapper respects the specific gamification setting from RoleContext.
 */

import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { useGamification, useRole, useIsProfessional } from '@/lib/contexts/RoleContext';
import { XPProgressBar } from './XPProgressBar';
import { StreakDisplay } from './StreakDisplay';
import { BadgeCard } from './BadgeCard';
import { NewBadgeModal } from './NewBadgeModal';
import { Badge } from '@/lib/gamification/badges';

// ============================================================================
// ROLE-AWARE XP PROGRESS BAR
// ============================================================================

interface RoleAwareXPProgressBarProps {
  level: number;
  xpProgress: number;
  xpNeeded: number;
  totalXp: number;
  progressPercent: number;
  onPress?: () => void;
  size?: 'compact' | 'full';
  /** Force show regardless of role settings */
  forceShow?: boolean;
}

/**
 * Role-aware XP progress bar
 * Shows XP progress only if gamification.showXP is enabled for the user's role
 */
export const RoleAwareXPProgressBar = memo(function RoleAwareXPProgressBar({
  forceShow = false,
  ...props
}: RoleAwareXPProgressBarProps) {
  const gamification = useGamification();

  // Don't render if XP display is disabled and not forced
  if (!forceShow && !gamification.showXP) {
    return null;
  }

  return <XPProgressBar {...props} />;
});

// ============================================================================
// ROLE-AWARE STREAK DISPLAY
// ============================================================================

interface RoleAwareStreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  streakAtRisk?: boolean;
  hasFreezeAvailable?: boolean;
  onPress?: () => void;
  size?: 'compact' | 'full';
  /** Force show regardless of role settings */
  forceShow?: boolean;
}

/**
 * Role-aware streak display
 * Shows streak only if gamification.showStreak is enabled for the user's role
 */
export const RoleAwareStreakDisplay = memo(function RoleAwareStreakDisplay({
  forceShow = false,
  ...props
}: RoleAwareStreakDisplayProps) {
  const gamification = useGamification();

  // Don't render if streak display is disabled and not forced
  if (!forceShow && !gamification.showStreak) {
    return null;
  }

  return <StreakDisplay {...props} />;
});

// ============================================================================
// ROLE-AWARE BADGE CARD
// ============================================================================

interface RoleAwareBadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  showXp?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  /** Force show regardless of role settings */
  forceShow?: boolean;
}

/**
 * Role-aware badge card
 * Shows badges only if gamification.showBadges is enabled for the user's role
 */
export const RoleAwareBadgeCard = memo(function RoleAwareBadgeCard({
  forceShow = false,
  ...props
}: RoleAwareBadgeCardProps) {
  const gamification = useGamification();

  // Don't render if badge display is disabled and not forced
  if (!forceShow && !gamification.showBadges) {
    return null;
  }

  return <BadgeCard {...props} />;
});

// ============================================================================
// GAMIFICATION CONTAINER
// ============================================================================

interface GamificationContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  /** Force show regardless of role settings */
  forceShow?: boolean;
  /** Specific feature to check (defaults to overall enabled status) */
  feature?: 'showXP' | 'showBadges' | 'showStreak' | 'showCelebrations';
}

/**
 * Container that only renders children if gamification is enabled
 * Useful for wrapping entire gamification sections
 */
export const GamificationContainer = memo(function GamificationContainer({
  children,
  style,
  forceShow = false,
  feature,
}: GamificationContainerProps) {
  const gamification = useGamification();

  // Check specific feature or overall enabled status
  const shouldShow = forceShow || (feature ? gamification[feature] : gamification.isEnabled);

  if (!shouldShow) {
    return null;
  }

  return <View style={style}>{children}</View>;
});

// ============================================================================
// GAMIFICATION GATE
// ============================================================================

interface GamificationGateProps {
  children: ReactNode;
  /** What to render when gamification is disabled */
  fallback?: ReactNode;
  /** Force show regardless of role settings */
  forceShow?: boolean;
  /** Specific feature to check */
  feature?: 'showXP' | 'showBadges' | 'showStreak' | 'showCelebrations';
}

/**
 * Gate component that conditionally renders content based on gamification settings
 * Can provide a fallback for when gamification is disabled
 */
export const GamificationGate = memo(function GamificationGate({
  children,
  fallback = null,
  forceShow = false,
  feature,
}: GamificationGateProps) {
  const gamification = useGamification();

  // Check specific feature or overall enabled status
  const shouldShow = forceShow || (feature ? gamification[feature] : gamification.isEnabled);

  if (!shouldShow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
});

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to check if a specific gamification feature should be shown
 */
export function useShowGamification(
  feature?: 'showXP' | 'showBadges' | 'showStreak' | 'showCelebrations'
): boolean {
  const gamification = useGamification();
  return feature ? gamification[feature] : gamification.isEnabled;
}

/**
 * Hook to get gamification visibility based on role
 * Returns both the settings and helper functions
 */
export function useGamificationVisibility() {
  const gamification = useGamification();
  const { role } = useRole();
  const isProfessional = useIsProfessional();

  return {
    // Settings
    ...gamification,

    // Role info
    role,
    isProfessional,

    // Helpers
    shouldShowXP: gamification.showXP,
    shouldShowBadges: gamification.showBadges,
    shouldShowStreak: gamification.showStreak,
    shouldShowCelebrations: gamification.showCelebrations,

    // Check any feature
    shouldShow: (feature: keyof typeof gamification) => gamification[feature],
  };
}

// ============================================================================
// ROLE-AWARE NEW BADGE MODAL
// ============================================================================

interface RoleAwareNewBadgeModalProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
  /** Force show regardless of role settings */
  forceShow?: boolean;
}

/**
 * Role-aware badge celebration modal
 * Shows celebration only if gamification.showCelebrations is enabled
 */
export const RoleAwareNewBadgeModal = memo(function RoleAwareNewBadgeModal({
  forceShow = false,
  ...props
}: RoleAwareNewBadgeModalProps) {
  const gamification = useGamification();

  // Don't render if celebrations are disabled and not forced
  if (!forceShow && !gamification.showCelebrations) {
    // Still call onClose to clean up state
    if (props.visible && props.badge) {
      props.onClose();
    }
    return null;
  }

  return <NewBadgeModal {...props} />;
});

// ============================================================================
// PROFESSIONAL ALTERNATIVES
// ============================================================================

/**
 * Professional progress indicator (alternative to XP for professionals)
 * Shows completion stats without gamification elements
 */
interface ProfessionalProgressProps {
  completed: number;
  total: number;
  label?: string;
}

export const ProfessionalProgress = memo(function ProfessionalProgress({
  completed,
  total,
  label = 'Tamamlanan',
}: ProfessionalProgressProps) {
  const isProfessional = useIsProfessional();

  // Only show for professionals
  if (!isProfessional) {
    return null;
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={professionalProgressStyles.container}>
      <View style={professionalProgressStyles.labelRow}>
        <Text style={professionalProgressStyles.label}>{label}</Text>
        <Text style={professionalProgressStyles.value}>
          {completed}/{total}
        </Text>
      </View>
      <View style={professionalProgressStyles.progressBar}>
        <View
          style={[
            professionalProgressStyles.progressFill,
            { width: `${percentage}%` as any },
          ]}
        />
      </View>
    </View>
  );
});

const professionalProgressStyles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.gray700,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
});

export default {
  RoleAwareXPProgressBar,
  RoleAwareStreakDisplay,
  RoleAwareBadgeCard,
  RoleAwareNewBadgeModal,
  GamificationContainer,
  GamificationGate,
  ProfessionalProgress,
};
