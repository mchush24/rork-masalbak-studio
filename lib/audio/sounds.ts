/**
 * Sound constants and types for Renkioo audio system
 * Phase 1: Sound Foundation
 */

export type SoundName =
  // UI Sounds
  | 'UI_TAP'
  | 'UI_TAP_LIGHT'
  | 'UI_SUCCESS'
  | 'UI_ERROR'
  | 'UI_SWOOSH'
  | 'UI_POP'
  | 'UI_TOGGLE'
  // Celebration Sounds
  | 'CELEBRATION_FANFARE'
  | 'CELEBRATION_CONFETTI'
  | 'CELEBRATION_SPARKLE'
  // Gamification Sounds
  | 'XP_GAIN'
  | 'LEVEL_UP'
  | 'BADGE_UNLOCK'
  | 'STREAK_FIRE'
  | 'STREAK_MILESTONE'
  // Ioo (Mascot) Sounds
  | 'IOO_HAPPY'
  | 'IOO_CURIOUS'
  | 'IOO_CELEBRATE'
  | 'IOO_GREETING'
  // Analysis Sounds
  | 'ANALYSIS_START'
  | 'ANALYSIS_COMPLETE';

export interface SoundConfig {
  name: SoundName;
  file: string;
  volume: number; // 0.0 - 1.0
  category: 'ui' | 'celebration' | 'gamification' | 'mascot' | 'analysis';
  description: string;
}

/**
 * Sound configuration map
 * Note: Sound files should be placed in assets/sounds/
 * For now, we use placeholder paths. Replace with actual audio files.
 */
export const SOUNDS: Record<SoundName, SoundConfig> = {
  // UI Sounds
  UI_TAP: {
    name: 'UI_TAP',
    file: 'tap.mp3',
    volume: 0.5,
    category: 'ui',
    description: 'Button tap sound',
  },
  UI_TAP_LIGHT: {
    name: 'UI_TAP_LIGHT',
    file: 'tap-light.mp3',
    volume: 0.3,
    category: 'ui',
    description: 'Light tap for small interactions',
  },
  UI_SUCCESS: {
    name: 'UI_SUCCESS',
    file: 'success.mp3',
    volume: 0.6,
    category: 'ui',
    description: 'Success confirmation sound',
  },
  UI_ERROR: {
    name: 'UI_ERROR',
    file: 'error.mp3',
    volume: 0.5,
    category: 'ui',
    description: 'Error notification sound',
  },
  UI_SWOOSH: {
    name: 'UI_SWOOSH',
    file: 'swoosh.mp3',
    volume: 0.4,
    category: 'ui',
    description: 'Screen transition swoosh',
  },
  UI_POP: {
    name: 'UI_POP',
    file: 'pop.mp3',
    volume: 0.5,
    category: 'ui',
    description: 'Popup/modal appearance',
  },
  UI_TOGGLE: {
    name: 'UI_TOGGLE',
    file: 'toggle.mp3',
    volume: 0.4,
    category: 'ui',
    description: 'Toggle switch sound',
  },

  // Celebration Sounds
  CELEBRATION_FANFARE: {
    name: 'CELEBRATION_FANFARE',
    file: 'fanfare.mp3',
    volume: 0.7,
    category: 'celebration',
    description: 'Major achievement celebration',
  },
  CELEBRATION_CONFETTI: {
    name: 'CELEBRATION_CONFETTI',
    file: 'confetti.mp3',
    volume: 0.6,
    category: 'celebration',
    description: 'Confetti burst sound',
  },
  CELEBRATION_SPARKLE: {
    name: 'CELEBRATION_SPARKLE',
    file: 'sparkle.mp3',
    volume: 0.5,
    category: 'celebration',
    description: 'Sparkle/shine effect',
  },

  // Gamification Sounds
  XP_GAIN: {
    name: 'XP_GAIN',
    file: 'xp-gain.mp3',
    volume: 0.5,
    category: 'gamification',
    description: 'XP points earned',
  },
  LEVEL_UP: {
    name: 'LEVEL_UP',
    file: 'level-up.mp3',
    volume: 0.8,
    category: 'gamification',
    description: 'Level up fanfare',
  },
  BADGE_UNLOCK: {
    name: 'BADGE_UNLOCK',
    file: 'badge-unlock.mp3',
    volume: 0.7,
    category: 'gamification',
    description: 'Badge unlocked sound',
  },
  STREAK_FIRE: {
    name: 'STREAK_FIRE',
    file: 'streak-fire.mp3',
    volume: 0.6,
    category: 'gamification',
    description: 'Streak maintained fire sound',
  },
  STREAK_MILESTONE: {
    name: 'STREAK_MILESTONE',
    file: 'streak-milestone.mp3',
    volume: 0.7,
    category: 'gamification',
    description: 'Streak milestone reached',
  },

  // Ioo (Mascot) Sounds
  IOO_HAPPY: {
    name: 'IOO_HAPPY',
    file: 'ioo-happy.mp3',
    volume: 0.5,
    category: 'mascot',
    description: 'Ioo happy expression',
  },
  IOO_CURIOUS: {
    name: 'IOO_CURIOUS',
    file: 'ioo-curious.mp3',
    volume: 0.5,
    category: 'mascot',
    description: 'Ioo curious/thinking',
  },
  IOO_CELEBRATE: {
    name: 'IOO_CELEBRATE',
    file: 'ioo-celebrate.mp3',
    volume: 0.6,
    category: 'mascot',
    description: 'Ioo celebration',
  },
  IOO_GREETING: {
    name: 'IOO_GREETING',
    file: 'ioo-greeting.mp3',
    volume: 0.5,
    category: 'mascot',
    description: 'Ioo greeting/hello',
  },

  // Analysis Sounds
  ANALYSIS_START: {
    name: 'ANALYSIS_START',
    file: 'analysis-start.mp3',
    volume: 0.5,
    category: 'analysis',
    description: 'Analysis started',
  },
  ANALYSIS_COMPLETE: {
    name: 'ANALYSIS_COMPLETE',
    file: 'analysis-complete.mp3',
    volume: 0.6,
    category: 'analysis',
    description: 'Analysis completed',
  },
};

// Sound categories for settings
export const SOUND_CATEGORIES = {
  ui: {
    label: 'Arayüz Sesleri',
    description: 'Buton tıklamaları, geçişler',
  },
  celebration: {
    label: 'Kutlama Sesleri',
    description: 'Konfeti, fanfare',
  },
  gamification: {
    label: 'Oyun Sesleri',
    description: 'XP, rozet, seviye',
  },
  mascot: {
    label: 'Ioo Sesleri',
    description: 'Maskot sesleri',
  },
  analysis: {
    label: 'Analiz Sesleri',
    description: 'Analiz bildirimleri',
  },
} as const;

export type SoundCategory = keyof typeof SOUND_CATEGORIES;
