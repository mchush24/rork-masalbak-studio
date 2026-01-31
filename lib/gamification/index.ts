/**
 * Gamification Module Export
 */

export { BADGES, RARITY_COLORS, getBadgeById, getBadgesByCategory, getBadgesByRarity } from './badges';
export type { Badge, BadgeCategory, BadgeRarity } from './badges';

export {
  loadStreakData,
  saveStreakData,
  recordActivity,
  wasActiveToday,
  getStreakStatus,
  resetStreakData,
} from './streaks';
export type { StreakData } from './streaks';

export { useGamification } from './useGamification';
export type { UserStats } from './useGamification';

// Phase 21: Enhanced gamification with delight milestones
export { useGamificationWithDelight } from './useGamificationWithDelight';
