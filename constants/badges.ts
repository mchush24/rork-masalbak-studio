/**
 * Rozetler - Badge Definitions
 *
 * Tüm rozet tanımları ve kategorileri
 */

// ============================================
// TYPES
// ============================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeCategory =
  | 'first_steps'    // İlk Adımlar
  | 'creativity'     // Yaratıcılık
  | 'explorer'       // Kaşif
  | 'consistency'    // Düzenlilik
  | 'special'        // Özel Günler
  | 'secret';        // Gizli

export type BadgeRequirementType =
  | 'total_analyses'
  | 'total_stories'
  | 'total_colorings'
  | 'consecutive_days'
  | 'unique_test_types'
  | 'special_day'
  | 'time_of_day'
  | 'profile_complete'
  | 'first_child'
  | 'multiple_children';

export interface BadgeRequirement {
  type: BadgeRequirementType;
  value: number | string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: BadgeRequirement;
  isSecret?: boolean;
}

export interface UserBadge {
  badgeId: string;
  unlockedAt: Date;
  progress?: number;
  maxProgress?: number;
}

// ============================================
// BADGE CATEGORY LABELS
// ============================================

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  first_steps: 'İlk Adımlar',
  creativity: 'Yaratıcılık',
  explorer: 'Kaşif',
  consistency: 'Düzenlilik',
  special: 'Özel Günler',
  secret: 'Gizli Rozetler',
};

export const BADGE_CATEGORY_ICONS: Record<BadgeCategory, string> = {
  first_steps: '🌱',
  creativity: '🎨',
  explorer: '🔍',
  consistency: '🔥',
  special: '🎉',
  secret: '❓',
};

// ============================================
// RARITY CONFIG
// ============================================

export const BADGE_RARITY_CONFIG: Record<BadgeRarity, { label: string; color: string; bgColor: string }> = {
  common: {
    label: 'Yaygın',
    color: '#78716C', // Stone
    bgColor: '#F5F5F4',
  },
  rare: {
    label: 'Nadir',
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
  },
  epic: {
    label: 'Epik',
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
  },
  legendary: {
    label: 'Efsanevi',
    color: '#F59E0B', // Amber
    bgColor: '#FFFBEB',
  },
};

// ============================================
// BADGE DEFINITIONS
// ============================================

export const BADGES: Badge[] = [
  // ==========================================
  // İLK ADIMLAR (First Steps)
  // ==========================================
  {
    id: 'first_analysis',
    name: 'İlk Çizgi',
    description: 'İlk analizini yap',
    icon: '✏️',
    category: 'first_steps',
    rarity: 'common',
    requirement: { type: 'total_analyses', value: 1 },
  },
  {
    id: 'first_story',
    name: 'Masal Başlangıcı',
    description: 'İlk masalını oluştur',
    icon: '📖',
    category: 'first_steps',
    rarity: 'common',
    requirement: { type: 'total_stories', value: 1 },
  },
  {
    id: 'first_coloring',
    name: 'Renk Ustası Adayı',
    description: 'İlk boyama sayfanı oluştur',
    icon: '🎨',
    category: 'first_steps',
    rarity: 'common',
    requirement: { type: 'total_colorings', value: 1 },
  },
  {
    id: 'first_child',
    name: 'Aile Kurucusu',
    description: 'İlk çocuğunu ekle',
    icon: '👶',
    category: 'first_steps',
    rarity: 'common',
    requirement: { type: 'first_child', value: 1 },
  },
  {
    id: 'profile_complete',
    name: 'Profil Yıldızı',
    description: 'Profilini tamamla',
    icon: '⭐',
    category: 'first_steps',
    rarity: 'common',
    requirement: { type: 'profile_complete', value: 1 },
  },

  // ==========================================
  // YARATICILIK (Creativity) - Analyses
  // ==========================================
  {
    id: 'analysis_5',
    name: 'Çizim Meraklısı',
    description: '5 analiz yap',
    icon: '🔍',
    category: 'creativity',
    rarity: 'common',
    requirement: { type: 'total_analyses', value: 5 },
  },
  {
    id: 'analysis_10',
    name: 'Çizim Avcısı',
    description: '10 analiz yap',
    icon: '🎯',
    category: 'creativity',
    rarity: 'common',
    requirement: { type: 'total_analyses', value: 10 },
  },
  {
    id: 'analysis_25',
    name: 'Çizim Uzmanı',
    description: '25 analiz yap',
    icon: '🏅',
    category: 'creativity',
    rarity: 'rare',
    requirement: { type: 'total_analyses', value: 25 },
  },
  {
    id: 'analysis_50',
    name: 'Çizim Ustası',
    description: '50 analiz yap',
    icon: '🎖️',
    category: 'creativity',
    rarity: 'epic',
    requirement: { type: 'total_analyses', value: 50 },
  },
  {
    id: 'analysis_100',
    name: 'Çizim Efsanesi',
    description: '100 analiz yap',
    icon: '👑',
    category: 'creativity',
    rarity: 'legendary',
    requirement: { type: 'total_analyses', value: 100 },
  },

  // ==========================================
  // YARATICILIK (Creativity) - Stories
  // ==========================================
  {
    id: 'story_5',
    name: 'Masal Anlatıcısı',
    description: '5 masal oluştur',
    icon: '📚',
    category: 'creativity',
    rarity: 'common',
    requirement: { type: 'total_stories', value: 5 },
  },
  {
    id: 'story_10',
    name: 'Masal Yazarı',
    description: '10 masal oluştur',
    icon: '✍️',
    category: 'creativity',
    rarity: 'common',
    requirement: { type: 'total_stories', value: 10 },
  },
  {
    id: 'story_25',
    name: 'Masal Ustası',
    description: '25 masal oluştur',
    icon: '📜',
    category: 'creativity',
    rarity: 'rare',
    requirement: { type: 'total_stories', value: 25 },
  },
  {
    id: 'story_50',
    name: 'Masal Büyücüsü',
    description: '50 masal oluştur',
    icon: '🧙',
    category: 'creativity',
    rarity: 'epic',
    requirement: { type: 'total_stories', value: 50 },
  },
  {
    id: 'story_100',
    name: 'Masal Efsanesi',
    description: '100 masal oluştur',
    icon: '🌟',
    category: 'creativity',
    rarity: 'legendary',
    requirement: { type: 'total_stories', value: 100 },
  },

  // ==========================================
  // YARATICILIK (Creativity) - Colorings
  // ==========================================
  {
    id: 'coloring_5',
    name: 'Renk Avcısı',
    description: '5 boyama sayfası oluştur',
    icon: '🖍️',
    category: 'creativity',
    rarity: 'common',
    requirement: { type: 'total_colorings', value: 5 },
  },
  {
    id: 'coloring_10',
    name: 'Renk Ustası',
    description: '10 boyama sayfası oluştur',
    icon: '🎨',
    category: 'creativity',
    rarity: 'common',
    requirement: { type: 'total_colorings', value: 10 },
  },
  {
    id: 'coloring_25',
    name: 'Renk Büyücüsü',
    description: '25 boyama sayfası oluştur',
    icon: '🌈',
    category: 'creativity',
    rarity: 'rare',
    requirement: { type: 'total_colorings', value: 25 },
  },

  // ==========================================
  // KAŞİF (Explorer)
  // ==========================================
  {
    id: 'explorer_3_tests',
    name: 'Test Kaşifi',
    description: '3 farklı test türü dene',
    icon: '🔍',
    category: 'explorer',
    rarity: 'common',
    requirement: { type: 'unique_test_types', value: 3 },
  },
  {
    id: 'explorer_5_tests',
    name: 'Test Gezgini',
    description: '5 farklı test türü dene',
    icon: '🧭',
    category: 'explorer',
    rarity: 'rare',
    requirement: { type: 'unique_test_types', value: 5 },
  },
  {
    id: 'explorer_all_tests',
    name: 'Test Ustası',
    description: 'Tüm 9 test türünü dene',
    icon: '🏆',
    category: 'explorer',
    rarity: 'legendary',
    requirement: { type: 'unique_test_types', value: 9 },
  },
  {
    id: 'multiple_children',
    name: 'Kalabalık Aile',
    description: 'Birden fazla çocuk ekle',
    icon: '👨‍👩‍👧‍👦',
    category: 'explorer',
    rarity: 'rare',
    requirement: { type: 'multiple_children', value: 2 },
  },

  // ==========================================
  // DÜZENLİLİK (Consistency)
  // ==========================================
  {
    id: 'streak_3',
    name: 'Düzenli Ziyaretçi',
    description: '3 gün üst üste kullan',
    icon: '🔥',
    category: 'consistency',
    rarity: 'common',
    requirement: { type: 'consecutive_days', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Haftalık Yıldız',
    description: '7 gün üst üste kullan',
    icon: '⭐',
    category: 'consistency',
    rarity: 'rare',
    requirement: { type: 'consecutive_days', value: 7 },
  },
  {
    id: 'streak_14',
    name: 'Süper Kullanıcı',
    description: '14 gün üst üste kullan',
    icon: '💪',
    category: 'consistency',
    rarity: 'epic',
    requirement: { type: 'consecutive_days', value: 14 },
  },
  {
    id: 'streak_30',
    name: 'Efsane',
    description: '30 gün üst üste kullan',
    icon: '👑',
    category: 'consistency',
    rarity: 'legendary',
    requirement: { type: 'consecutive_days', value: 30 },
  },

  // ==========================================
  // ÖZEL GÜNLER (Special Days)
  // ==========================================
  {
    id: 'special_23_nisan',
    name: 'Çocuk Bayramı',
    description: '23 Nisan\'da uygulamayı kullan',
    icon: '🎈',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '04-23' },
  },
  {
    id: 'special_29_ekim',
    name: 'Cumhuriyet Çocuğu',
    description: '29 Ekim\'de uygulamayı kullan',
    icon: '🇹🇷',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '10-29' },
  },
  {
    id: 'special_new_year',
    name: 'Yeni Yıl Büyücüsü',
    description: '1 Ocak\'ta uygulamayı kullan',
    icon: '🎉',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '01-01' },
  },
  {
    id: 'special_19_mayis',
    name: 'Gençlik Ruhu',
    description: '19 Mayıs\'ta uygulamayı kullan',
    icon: '🏃',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '05-19' },
  },

  // ==========================================
  // GİZLİ ROZETLER (Secret)
  // ==========================================
  {
    id: 'secret_night_owl',
    name: 'Gece Kuşu',
    description: 'Gece yarısından sonra kullan',
    icon: '🦉',
    category: 'secret',
    rarity: 'rare',
    requirement: { type: 'time_of_day', value: 'night' },
    isSecret: true,
  },
  {
    id: 'secret_early_bird',
    name: 'Erken Kalkan',
    description: 'Sabah 6\'dan önce kullan',
    icon: '🌅',
    category: 'secret',
    rarity: 'rare',
    requirement: { type: 'time_of_day', value: 'early_morning' },
    isSecret: true,
  },
  {
    id: 'secret_weekend_warrior',
    name: 'Hafta Sonu Savaşçısı',
    description: 'Hem Cumartesi hem Pazar kullan',
    icon: '🎮',
    category: 'secret',
    rarity: 'epic',
    requirement: { type: 'special_day', value: 'weekend_both' },
    isSecret: true,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(badge => badge.id === id);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter(badge => badge.category === category);
}

/**
 * Get non-secret badges
 */
export function getVisibleBadges(): Badge[] {
  return BADGES.filter(badge => !badge.isSecret);
}

/**
 * Get secret badges
 */
export function getSecretBadges(): Badge[] {
  return BADGES.filter(badge => badge.isSecret);
}

/**
 * Get total badge count
 */
export function getTotalBadgeCount(): number {
  return BADGES.length;
}

/**
 * Get badges grouped by category
 */
export function getBadgesGroupedByCategory(): Record<BadgeCategory, Badge[]> {
  return BADGES.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<BadgeCategory, Badge[]>);
}
