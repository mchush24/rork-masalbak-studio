/**
 * Sound Registry - Ses efektleri tanımları
 *
 * Uygulama genelinde kullanılan ses efektlerinin merkezi kaydı.
 * Her ses için kategori, dosya yolu ve varsayılan ses seviyesi tanımlanır.
 */

export type SoundName =
  // UI Sounds
  | 'tap_light'
  | 'tap_medium'
  | 'tap_heavy'
  | 'success'
  | 'error'
  | 'warning'
  | 'swoosh'
  | 'pop'
  | 'toggle'
  // Gamification
  | 'xp_gain'
  | 'level_up'
  | 'badge_unlock'
  | 'streak_fire'
  | 'celebration'
  | 'confetti'
  | 'coin'
  // Ioo
  | 'ioo_happy'
  | 'ioo_curious'
  | 'ioo_celebrate'
  | 'ioo_thinking'
  | 'ioo_sad'
  // Coloring
  | 'brush_stroke'
  | 'fill_bucket'
  | 'color_pick'
  // Story
  | 'page_turn'
  | 'story_complete'
  // Analysis
  | 'scan_start'
  | 'scan_complete'
  | 'insight_reveal';

export type SoundCategory =
  | 'ui'
  | 'gamification'
  | 'celebration'
  | 'mascot'
  | 'coloring'
  | 'story'
  | 'analysis';

// Category descriptions for settings UI
export const SOUND_CATEGORIES: Record<SoundCategory, { label: string; description: string }> = {
  ui: { label: 'Arayüz Sesleri', description: 'Buton, toggle ve genel etkileşim sesleri' },
  gamification: { label: 'Oyunlaştırma', description: 'XP, seviye atlama ve başarı sesleri' },
  celebration: { label: 'Kutlama', description: 'Başarı ve tamamlama sesleri' },
  mascot: { label: 'Ioo Sesleri', description: 'Maskot karakterin sesleri' },
  coloring: { label: 'Boyama', description: 'Fırça ve boya kovası sesleri' },
  story: { label: 'Hikaye', description: 'Sayfa çevirme ve hikaye sesleri' },
  analysis: { label: 'Analiz', description: 'Tarama ve içgörü sesleri' },
};

interface SoundDefinition {
  name: SoundName;
  category: SoundCategory;
  file: string;
  volume: number;
  respectHapticSetting?: boolean;
}

export const SOUNDS: Record<SoundName, SoundDefinition> = {
  // UI Sounds
  tap_light: { name: 'tap_light', category: 'ui', file: 'tap_light.mp3', volume: 0.3, respectHapticSetting: true },
  tap_medium: { name: 'tap_medium', category: 'ui', file: 'tap_medium.mp3', volume: 0.4, respectHapticSetting: true },
  tap_heavy: { name: 'tap_heavy', category: 'ui', file: 'tap_heavy.mp3', volume: 0.5, respectHapticSetting: true },
  success: { name: 'success', category: 'ui', file: 'success.mp3', volume: 0.5 },
  error: { name: 'error', category: 'ui', file: 'error.mp3', volume: 0.4 },
  warning: { name: 'warning', category: 'ui', file: 'warning.mp3', volume: 0.4 },
  swoosh: { name: 'swoosh', category: 'ui', file: 'swoosh.mp3', volume: 0.3 },
  pop: { name: 'pop', category: 'ui', file: 'pop.mp3', volume: 0.4 },
  toggle: { name: 'toggle', category: 'ui', file: 'toggle.mp3', volume: 0.3, respectHapticSetting: true },

  // Gamification Sounds
  xp_gain: { name: 'xp_gain', category: 'gamification', file: 'xp_gain.mp3', volume: 0.5 },
  level_up: { name: 'level_up', category: 'gamification', file: 'level_up.mp3', volume: 0.7 },
  badge_unlock: { name: 'badge_unlock', category: 'gamification', file: 'badge_unlock.mp3', volume: 0.6 },
  streak_fire: { name: 'streak_fire', category: 'gamification', file: 'streak_fire.mp3', volume: 0.5 },
  coin: { name: 'coin', category: 'gamification', file: 'coin.mp3', volume: 0.4 },

  // Celebration Sounds
  celebration: { name: 'celebration', category: 'celebration', file: 'celebration.mp3', volume: 0.6 },
  confetti: { name: 'confetti', category: 'celebration', file: 'confetti.mp3', volume: 0.5 },

  // Mascot (Ioo) Sounds
  ioo_happy: { name: 'ioo_happy', category: 'mascot', file: 'ioo_happy.mp3', volume: 0.5 },
  ioo_curious: { name: 'ioo_curious', category: 'mascot', file: 'ioo_curious.mp3', volume: 0.4 },
  ioo_celebrate: { name: 'ioo_celebrate', category: 'mascot', file: 'ioo_celebrate.mp3', volume: 0.6 },
  ioo_thinking: { name: 'ioo_thinking', category: 'mascot', file: 'ioo_thinking.mp3', volume: 0.3 },
  ioo_sad: { name: 'ioo_sad', category: 'mascot', file: 'ioo_sad.mp3', volume: 0.4 },

  // Coloring Sounds
  brush_stroke: { name: 'brush_stroke', category: 'coloring', file: 'brush_stroke.mp3', volume: 0.2 },
  fill_bucket: { name: 'fill_bucket', category: 'coloring', file: 'fill_bucket.mp3', volume: 0.4 },
  color_pick: { name: 'color_pick', category: 'coloring', file: 'color_pick.mp3', volume: 0.3 },

  // Story Sounds
  page_turn: { name: 'page_turn', category: 'story', file: 'page_turn.mp3', volume: 0.4 },
  story_complete: { name: 'story_complete', category: 'story', file: 'story_complete.mp3', volume: 0.5 },

  // Analysis Sounds
  scan_start: { name: 'scan_start', category: 'analysis', file: 'scan_start.mp3', volume: 0.4 },
  scan_complete: { name: 'scan_complete', category: 'analysis', file: 'scan_complete.mp3', volume: 0.5 },
  insight_reveal: { name: 'insight_reveal', category: 'analysis', file: 'insight_reveal.mp3', volume: 0.5 },
};

export function getSoundsByCategory(category: SoundCategory): SoundDefinition[] {
  return Object.values(SOUNDS).filter((sound) => sound.category === category);
}
