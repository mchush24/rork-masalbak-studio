/**
 * Gamification Components Export
 * Part of #22: Gamification'ı Opsiyonel/Subtle Yap
 *
 * Base components (use directly when you need full control):
 * - StreakDisplay, BadgeCard, XPProgressBar, NewBadgeModal
 *
 * Role-aware components (automatically respect user role settings):
 * - RoleAwareStreakDisplay, RoleAwareBadgeCard, RoleAwareXPProgressBar
 * - RoleAwareNewBadgeModal, GamificationContainer, GamificationGate
 *
 * Settings & Configuration:
 * - GamificationSettings - UI for teachers to toggle gamification
 *
 * Professional alternatives:
 * - ProfessionalProgress - Clean progress indicator
 * - SubtleAchievementToast - Minimal toast notifications
 * - RoleAwareAchievement - Auto-selects celebration vs toast
 *
 * Hooks:
 * - useShowGamification, useGamificationVisibility, useAchievementNotification
 */

// Base components
export { StreakDisplay } from './StreakDisplay';
export { BadgeCard } from './BadgeCard';
export { XPProgressBar } from './XPProgressBar';
export { NewBadgeModal } from './NewBadgeModal';

// Role-aware components
export {
  RoleAwareXPProgressBar,
  RoleAwareStreakDisplay,
  RoleAwareBadgeCard,
  RoleAwareNewBadgeModal,
  GamificationContainer,
  GamificationGate,
  ProfessionalProgress,
  useShowGamification,
  useGamificationVisibility,
} from './RoleAwareGamification';

// Settings component
export { GamificationSettings } from './GamificationSettings';

// Professional alternatives
export {
  SubtleAchievementToast,
  RoleAwareAchievement,
  useAchievementNotification,
} from './SubtleAchievementToast';
