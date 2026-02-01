/**
 * Delight Module
 * Phase 21: Polish & Delight
 *
 * Easter eggs, seasonal themes, and special moments
 */

// Easter Eggs
export {
  IooDanceWrapper,
  EasterEggBadge,
  useTapCounter,
  markEasterEggFound,
  isEasterEggFound,
  getTotalEasterEggsFound,
  type EasterEggType,
} from './EasterEggs';

// Seasonal Themes
export {
  SeasonalEffects,
  useSeasonalTheme,
  getCurrentSeason,
  getSeasonalIooAccessory,
  SEASONAL_COLORS,
  type SeasonType,
  type IooAccessory,
} from './SeasonalThemes';

// Delight Moments
export {
  MilestoneCelebration,
  useMilestones,
  isMilestoneAchieved,
  checkAnalysisMilestones,
  checkStreakMilestones,
  checkAnniversaryMilestone,
  type MilestoneType,
} from './DelightMoments';

// Visual Polish
export {
  SHADOWS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  TIMING,
  Z_INDEX,
  LAYOUT,
  createCardStyle,
  createButtonStyle,
  platformSelect,
  responsive,
  colorUtils,
} from './VisualPolish';
