import { Colors } from '@/constants/colors';

/**
 * Badge Definitions for RenkiOO Gamification
 *
 * Categories:
 * - Analysis badges (drawing analysis achievements)
 * - Creative badges (coloring, stories)
 * - Streak badges (consistency)
 * - Milestone badges (cumulative achievements)
 */

export type BadgeCategory = 'analysis' | 'creative' | 'streak' | 'milestone' | 'special';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji for now, can be replaced with custom icons
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: {
    type: 'count' | 'streak' | 'special';
    target: number;
    metric: string;
  };
  xpReward: number;
  unlockedAt?: Date;
}

export const BADGES: Badge[] = [
  // ============================================
  // ANALYSIS BADGES
  // ============================================
  {
    id: 'first_analysis',
    name: 'İlk Adım',
    description: 'İlk çizim analizini tamamladın',
    icon: '🌟',
    category: 'analysis',
    rarity: 'common',
    requirement: { type: 'count', target: 1, metric: 'total_analyses' },
    xpReward: 50,
  },
  {
    id: 'curious_mind',
    name: 'Meraklı Zihin',
    description: '5 çizim analizi tamamladın',
    icon: '🔍',
    category: 'analysis',
    rarity: 'common',
    requirement: { type: 'count', target: 5, metric: 'total_analyses' },
    xpReward: 100,
  },
  {
    id: 'emotion_explorer',
    name: 'Duygu Kaşifi',
    description: '10 çizim analizi tamamladın',
    icon: '🧭',
    category: 'analysis',
    rarity: 'rare',
    requirement: { type: 'count', target: 10, metric: 'total_analyses' },
    xpReward: 200,
  },
  {
    id: 'insight_master',
    name: 'İç Görü Ustası',
    description: '25 çizim analizi tamamladın',
    icon: '🔮',
    category: 'analysis',
    rarity: 'epic',
    requirement: { type: 'count', target: 25, metric: 'total_analyses' },
    xpReward: 500,
  },
  {
    id: 'emotion_guru',
    name: 'Duygu Gurusu',
    description: '50 çizim analizi tamamladın',
    icon: '🧙',
    category: 'analysis',
    rarity: 'legendary',
    requirement: { type: 'count', target: 50, metric: 'total_analyses' },
    xpReward: 1000,
  },
  {
    id: 'test_variety',
    name: 'Çeşitlilik Avcısı',
    description: '5 farklı test türü denedin',
    icon: '🎯',
    category: 'analysis',
    rarity: 'rare',
    requirement: { type: 'count', target: 5, metric: 'unique_test_types' },
    xpReward: 150,
  },

  // ============================================
  // CREATIVE BADGES
  // ============================================
  {
    id: 'first_coloring',
    name: 'Renk Dostu',
    description: 'İlk boyama sayfasını oluşturdun',
    icon: '🎨',
    category: 'creative',
    rarity: 'common',
    requirement: { type: 'count', target: 1, metric: 'total_colorings' },
    xpReward: 50,
  },
  {
    id: 'color_enthusiast',
    name: 'Renk Tutkunu',
    description: '10 boyama sayfası oluşturdun',
    icon: '🖌️',
    category: 'creative',
    rarity: 'rare',
    requirement: { type: 'count', target: 10, metric: 'total_colorings' },
    xpReward: 200,
  },
  {
    id: 'color_master',
    name: 'Renk Ustası',
    description: '25 boyama sayfası oluşturdun',
    icon: '👨‍🎨',
    category: 'creative',
    rarity: 'epic',
    requirement: { type: 'count', target: 25, metric: 'total_colorings' },
    xpReward: 400,
  },
  {
    id: 'first_story',
    name: 'Hikaye Başlangıcı',
    description: 'İlk interaktif masalı tamamladın',
    icon: '📖',
    category: 'creative',
    rarity: 'common',
    requirement: { type: 'count', target: 1, metric: 'total_stories' },
    xpReward: 50,
  },
  {
    id: 'storyteller',
    name: 'Masal Anlatıcısı',
    description: '10 interaktif masal tamamladın',
    icon: '📚',
    category: 'creative',
    rarity: 'rare',
    requirement: { type: 'count', target: 10, metric: 'total_stories' },
    xpReward: 200,
  },

  // ============================================
  // STREAK BADGES
  // ============================================
  {
    id: 'streak_3',
    name: 'Başlangıç Serisi',
    description: '3 gün üst üste aktif oldun',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: { type: 'streak', target: 3, metric: 'daily_streak' },
    xpReward: 75,
  },
  {
    id: 'streak_7',
    name: 'Haftalık Yıldız',
    description: '7 gün üst üste aktif oldun',
    icon: '⭐',
    category: 'streak',
    rarity: 'rare',
    requirement: { type: 'streak', target: 7, metric: 'daily_streak' },
    xpReward: 200,
  },
  {
    id: 'streak_14',
    name: 'İki Haftalık Kahraman',
    description: '14 gün üst üste aktif oldun',
    icon: '🦸',
    category: 'streak',
    rarity: 'epic',
    requirement: { type: 'streak', target: 14, metric: 'daily_streak' },
    xpReward: 400,
  },
  {
    id: 'streak_30',
    name: 'Aylık Efsane',
    description: '30 gün üst üste aktif oldun',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    requirement: { type: 'streak', target: 30, metric: 'daily_streak' },
    xpReward: 1000,
  },

  // ============================================
  // MILESTONE BADGES
  // ============================================
  {
    id: 'xp_100',
    name: 'Yolculuk Başladı',
    description: '100 XP kazandın',
    icon: '🚀',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'count', target: 100, metric: 'total_xp' },
    xpReward: 25,
  },
  {
    id: 'xp_500',
    name: 'Deneyimli',
    description: '500 XP kazandın',
    icon: '💫',
    category: 'milestone',
    rarity: 'rare',
    requirement: { type: 'count', target: 500, metric: 'total_xp' },
    xpReward: 50,
  },
  {
    id: 'xp_1000',
    name: 'Uzman',
    description: '1000 XP kazandın',
    icon: '🏅',
    category: 'milestone',
    rarity: 'epic',
    requirement: { type: 'count', target: 1000, metric: 'total_xp' },
    xpReward: 100,
  },
  {
    id: 'xp_5000',
    name: 'Grandmaster',
    description: '5000 XP kazandın',
    icon: '🏆',
    category: 'milestone',
    rarity: 'legendary',
    requirement: { type: 'count', target: 5000, metric: 'total_xp' },
    xpReward: 250,
  },

  // ============================================
  // SPECIAL BADGES
  // ============================================
  {
    id: 'early_adopter',
    name: 'Öncü Kullanıcı',
    description: 'RenkiOO\'nun ilk kullanıcılarından biri oldun',
    icon: '🌱',
    category: 'special',
    rarity: 'legendary',
    requirement: { type: 'special', target: 1, metric: 'early_adopter' },
    xpReward: 500,
  },
  {
    id: 'weekend_warrior',
    name: 'Hafta Sonu Savaşçısı',
    description: 'Bir hafta sonu 5+ aktivite tamamladın',
    icon: '⚔️',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special', target: 5, metric: 'weekend_activities' },
    xpReward: 150,
  },
  {
    id: 'night_owl',
    name: 'Gece Kuşu',
    description: 'Gece 22:00 sonrası analiz tamamladın',
    icon: '🦉',
    category: 'special',
    rarity: 'common',
    requirement: { type: 'special', target: 1, metric: 'night_activity' },
    xpReward: 50,
  },
];

// Badge rarity colors
export const RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string }> = {
  common: {
    bg: '#F1F5F9',
    border: '#94A3B8',
    text: '#475569',
  },
  rare: {
    bg: '#EEF2FF',
    border: Colors.secondary.indigo,
    text: '#4338CA',
  },
  epic: {
    bg: '#FDF4FF',
    border: '#A855F7',
    text: '#7E22CE',
  },
  legendary: {
    bg: '#FEF3C7',
    border: Colors.semantic.amber,
    text: '#B45309',
  },
};

// Helper functions
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter((badge) => badge.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return BADGES.filter((badge) => badge.rarity === rarity);
}
