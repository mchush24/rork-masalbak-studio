/**
 * Delight Module - Phase 21
 *
 * Polish & Delight features:
 * - Easter eggs (hidden surprises)
 * - Seasonal themes (holiday decorations)
 * - Delight moments (milestone celebrations)
 */

export {
  EasterEggProvider,
  useEasterEggs,
} from './EasterEggs';

export {
  SeasonalProvider,
  useSeasonal,
  SnowEffect,
  HeartRain,
} from './SeasonalThemes';

export {
  DelightProvider,
  useDelight,
} from './DelightMoments';

// Combined provider for convenience
export { DelightWrapper } from './DelightWrapper';
