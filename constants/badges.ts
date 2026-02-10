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
  | 'first_steps'       // İlk Adımlar
  | 'creativity'        // Yaratıcılık
  | 'explorer'          // Kaşif
  | 'consistency'       // Düzenlilik
  | 'special'           // Özel Günler
  | 'secret'            // Gizli
  // Phase 2: Coloring-specific categories
  | 'coloring_master'   // Boyama Ustası
  | 'color_explorer'    // Renk Kaşifi
  | 'brush_master'      // Fırça Ustası
  | 'smart_artist'      // Akıllı Sanatçı
  | 'coloring_streak'   // Boyama Serisi
  | 'dedication'        // Özveri
  | 'session'           // Oturum
  | 'persistence';      // Azim

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
  | 'multiple_children'
  // Phase 2: Coloring-specific requirements
  | 'completed_colorings'
  | 'colors_used_total'
  | 'colors_used_single'
  | 'brush_types_used'
  | 'premium_brushes_used'
  | 'ai_suggestions_used'
  | 'harmony_colors_used'
  | 'reference_images_used'
  | 'coloring_streak'
  | 'coloring_time_total'
  | 'quick_coloring'
  | 'marathon_coloring'
  | 'undo_and_continue'
  | 'coloring_time_of_day';

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
  // Phase 2: Coloring categories
  coloring_master: 'Boyama Ustası',
  color_explorer: 'Renk Kaşifi',
  brush_master: 'Fırça Ustası',
  smart_artist: 'Akıllı Sanatçı',
  coloring_streak: 'Boyama Serisi',
  dedication: 'Özveri',
  session: 'Oturum Başarıları',
  persistence: 'Azim',
};

export const BADGE_CATEGORY_ICONS: Record<BadgeCategory, string> = {
  first_steps: '🌱',
  creativity: '🎨',
  explorer: '🔍',
  consistency: '🔥',
  special: '🎉',
  secret: '❓',
  // Phase 2: Coloring category icons
  coloring_master: '🖼️',
  color_explorer: '🌈',
  brush_master: '🖌️',
  smart_artist: '🤖',
  coloring_streak: '🔥',
  dedication: '⏱️',
  session: '⚡',
  persistence: '💪',
};

// ============================================
// RARITY CONFIG
// ============================================

export const BADGE_RARITY_CONFIG: Record<BadgeRarity, {
  label: string;
  color: string;
  bgColor: string;
  gradient: readonly [string, string];
  glowColor: string;
}> = {
  common: {
    label: 'Yaygın',
    color: '#78716C',
    bgColor: '#F5F5F4',
    gradient: ['#F5F5F4', '#E7E5E4'] as const,
    glowColor: 'rgba(120, 113, 108, 0.15)',
  },
  rare: {
    label: 'Nadir',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    gradient: ['#EFF6FF', '#DBEAFE'] as const,
    glowColor: 'rgba(59, 130, 246, 0.2)',
  },
  epic: {
    label: 'Epik',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    gradient: ['#F5F3FF', '#EDE9FE'] as const,
    glowColor: 'rgba(139, 92, 246, 0.25)',
  },
  legendary: {
    label: 'Efsanevi',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    gradient: ['#FFFBEB', '#FEF3C7'] as const,
    glowColor: 'rgba(245, 158, 11, 0.3)',
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
  {
    id: 'coloring_50',
    name: 'Renk Şampiyonu',
    description: '50 boyama sayfası oluştur',
    icon: '🏆',
    category: 'creativity',
    rarity: 'epic',
    requirement: { type: 'total_colorings', value: 50 },
  },
  {
    id: 'coloring_100',
    name: 'Renk Efsanesi',
    description: '100 boyama sayfası oluştur',
    icon: '💎',
    category: 'creativity',
    rarity: 'legendary',
    requirement: { type: 'total_colorings', value: 100 },
  },

  // =========================================
  // PHASE 2: COLORING ACHIEVEMENTS (20+ new)
  // =========================================

  // Masterpiece Collection - Completed Colorings
  {
    id: 'first_masterpiece',
    name: 'İlk Şaheser',
    description: 'İlk boyamanı tamamla',
    icon: '🖼️',
    category: 'coloring_master',
    rarity: 'common',
    requirement: { type: 'completed_colorings', value: 1 },
  },
  {
    id: 'gallery_starter',
    name: 'Galeri Başlangıcı',
    description: '5 boyama tamamla',
    icon: '🎭',
    category: 'coloring_master',
    rarity: 'common',
    requirement: { type: 'completed_colorings', value: 5 },
  },
  {
    id: 'art_collector',
    name: 'Sanat Koleksiyoncusu',
    description: '10 boyama tamamla',
    icon: '🏛️',
    category: 'coloring_master',
    rarity: 'rare',
    requirement: { type: 'completed_colorings', value: 10 },
  },
  {
    id: 'gallery_curator',
    name: 'Galeri Küratörü',
    description: '25 boyama tamamla',
    icon: '👨‍🎨',
    category: 'coloring_master',
    rarity: 'epic',
    requirement: { type: 'completed_colorings', value: 25 },
  },
  {
    id: 'museum_worthy',
    name: 'Müze Değerinde',
    description: '50 boyama tamamla',
    icon: '🏆',
    category: 'coloring_master',
    rarity: 'legendary',
    requirement: { type: 'completed_colorings', value: 50 },
  },

  // Color Explorer - Variety of Colors
  {
    id: 'color_curious',
    name: 'Renk Meraklısı',
    description: '10 farklı renk kullan',
    icon: '🔴',
    category: 'color_explorer',
    rarity: 'common',
    requirement: { type: 'colors_used_total', value: 10 },
  },
  {
    id: 'rainbow_chaser',
    name: 'Gökkuşağı Avcısı',
    description: '25 farklı renk kullan',
    icon: '🌈',
    category: 'color_explorer',
    rarity: 'common',
    requirement: { type: 'colors_used_total', value: 25 },
  },
  {
    id: 'color_connoisseur',
    name: 'Renk Uzmanı',
    description: '50 farklı renk kullan',
    icon: '🎨',
    category: 'color_explorer',
    rarity: 'rare',
    requirement: { type: 'colors_used_total', value: 50 },
  },
  {
    id: 'palette_master',
    name: 'Palet Ustası',
    description: '100 farklı renk kullan',
    icon: '🎭',
    category: 'color_explorer',
    rarity: 'epic',
    requirement: { type: 'colors_used_total', value: 100 },
  },
  {
    id: 'chromatic_legend',
    name: 'Kromatik Efsane',
    description: '200 farklı renk kullan',
    icon: '💎',
    category: 'color_explorer',
    rarity: 'legendary',
    requirement: { type: 'colors_used_total', value: 200 },
  },

  // Single Artwork Excellence
  {
    id: 'colorful_creation',
    name: 'Renkli Yaratım',
    description: 'Tek eserde 5+ renk kullan',
    icon: '🖌️',
    category: 'color_explorer',
    rarity: 'common',
    requirement: { type: 'colors_used_single', value: 5 },
  },
  {
    id: 'rainbow_artwork',
    name: 'Gökkuşağı Eseri',
    description: 'Tek eserde 10+ renk kullan',
    icon: '🌟',
    category: 'color_explorer',
    rarity: 'rare',
    requirement: { type: 'colors_used_single', value: 10 },
  },
  {
    id: 'chromatic_masterpiece',
    name: 'Kromatik Şaheser',
    description: 'Tek eserde 15+ renk kullan',
    icon: '✨',
    category: 'color_explorer',
    rarity: 'epic',
    requirement: { type: 'colors_used_single', value: 15 },
  },

  // Brush Master - Tool Usage
  {
    id: 'brush_beginner',
    name: 'Fırça Çırağı',
    description: '3 farklı fırça türü dene',
    icon: '🖌️',
    category: 'brush_master',
    rarity: 'common',
    requirement: { type: 'brush_types_used', value: 3 },
  },
  {
    id: 'brush_explorer',
    name: 'Fırça Kaşifi',
    description: '5 farklı fırça türü dene',
    icon: '🎨',
    category: 'brush_master',
    rarity: 'rare',
    requirement: { type: 'brush_types_used', value: 5 },
  },
  {
    id: 'brush_virtuoso',
    name: 'Fırça Virtüözü',
    description: 'Tüm 7 fırça türünü dene',
    icon: '🏆',
    category: 'brush_master',
    rarity: 'epic',
    requirement: { type: 'brush_types_used', value: 7 },
  },

  // Premium Artist
  {
    id: 'premium_curious',
    name: 'Premium Meraklısı',
    description: 'İlk premium fırçayı kullan',
    icon: '💫',
    category: 'brush_master',
    rarity: 'rare',
    requirement: { type: 'premium_brushes_used', value: 1 },
  },
  {
    id: 'premium_collector',
    name: 'Premium Koleksiyoncu',
    description: '3 farklı premium fırça kullan',
    icon: '💎',
    category: 'brush_master',
    rarity: 'epic',
    requirement: { type: 'premium_brushes_used', value: 3 },
  },
  {
    id: 'premium_master',
    name: 'Premium Ustası',
    description: 'Tüm premium fırçaları kullan',
    icon: '👑',
    category: 'brush_master',
    rarity: 'legendary',
    requirement: { type: 'premium_brushes_used', value: 5 },
  },

  // AI & Smart Features
  {
    id: 'ai_curious',
    name: 'Yapay Zeka Meraklısı',
    description: 'İlk AI renk önerisini kullan',
    icon: '🤖',
    category: 'smart_artist',
    rarity: 'common',
    requirement: { type: 'ai_suggestions_used', value: 1 },
  },
  {
    id: 'ai_collaborator',
    name: 'AI İşbirlikçisi',
    description: '10 kez AI öneri kullan',
    icon: '🧠',
    category: 'smart_artist',
    rarity: 'rare',
    requirement: { type: 'ai_suggestions_used', value: 10 },
  },
  {
    id: 'ai_partner',
    name: 'AI Ortağı',
    description: '25 kez AI öneri kullan',
    icon: '🌟',
    category: 'smart_artist',
    rarity: 'epic',
    requirement: { type: 'ai_suggestions_used', value: 25 },
  },

  // Color Harmony
  {
    id: 'harmony_seeker',
    name: 'Uyum Arayıcısı',
    description: 'İlk renk harmonisi kullan',
    icon: '🎵',
    category: 'smart_artist',
    rarity: 'common',
    requirement: { type: 'harmony_colors_used', value: 1 },
  },
  {
    id: 'harmony_artist',
    name: 'Uyum Sanatçısı',
    description: '10 kez renk harmonisi kullan',
    icon: '🎶',
    category: 'smart_artist',
    rarity: 'rare',
    requirement: { type: 'harmony_colors_used', value: 10 },
  },
  {
    id: 'harmony_master',
    name: 'Uyum Ustası',
    description: '25 kez renk harmonisi kullan',
    icon: '🎼',
    category: 'smart_artist',
    rarity: 'epic',
    requirement: { type: 'harmony_colors_used', value: 25 },
  },

  // Reference Image
  {
    id: 'reference_starter',
    name: 'Referans Başlangıcı',
    description: 'İlk referans görsel kullan',
    icon: '📷',
    category: 'smart_artist',
    rarity: 'common',
    requirement: { type: 'reference_images_used', value: 1 },
  },
  {
    id: 'reference_pro',
    name: 'Referans Profesyoneli',
    description: '10 kez referans görsel kullan',
    icon: '📸',
    category: 'smart_artist',
    rarity: 'rare',
    requirement: { type: 'reference_images_used', value: 10 },
  },

  // Coloring Streaks
  {
    id: 'coloring_streak_3',
    name: 'Boyama Çırağı',
    description: '3 gün üst üste boya',
    icon: '🔥',
    category: 'coloring_streak',
    rarity: 'common',
    requirement: { type: 'coloring_streak', value: 3 },
  },
  {
    id: 'coloring_streak_7',
    name: 'Haftalık Sanatçı',
    description: '7 gün üst üste boya',
    icon: '⭐',
    category: 'coloring_streak',
    rarity: 'rare',
    requirement: { type: 'coloring_streak', value: 7 },
  },
  {
    id: 'coloring_streak_14',
    name: 'İki Haftalık Usta',
    description: '14 gün üst üste boya',
    icon: '💪',
    category: 'coloring_streak',
    rarity: 'epic',
    requirement: { type: 'coloring_streak', value: 14 },
  },
  {
    id: 'coloring_streak_30',
    name: 'Aylık Efsane',
    description: '30 gün üst üste boya',
    icon: '👑',
    category: 'coloring_streak',
    rarity: 'legendary',
    requirement: { type: 'coloring_streak', value: 30 },
  },

  // Time Spent - Dedication
  {
    id: 'time_spent_30',
    name: 'Sanat Zamanı',
    description: 'Toplam 30 dakika boyama yap',
    icon: '⏱️',
    category: 'dedication',
    rarity: 'common',
    requirement: { type: 'coloring_time_total', value: 30 },
  },
  {
    id: 'time_spent_60',
    name: 'Sanat Saati',
    description: 'Toplam 1 saat boyama yap',
    icon: '🕐',
    category: 'dedication',
    rarity: 'common',
    requirement: { type: 'coloring_time_total', value: 60 },
  },
  {
    id: 'time_spent_300',
    name: 'Sanat Günü',
    description: 'Toplam 5 saat boyama yap',
    icon: '🌅',
    category: 'dedication',
    rarity: 'rare',
    requirement: { type: 'coloring_time_total', value: 300 },
  },
  {
    id: 'time_spent_600',
    name: 'Sanat Haftası',
    description: 'Toplam 10 saat boyama yap',
    icon: '🌙',
    category: 'dedication',
    rarity: 'epic',
    requirement: { type: 'coloring_time_total', value: 600 },
  },
  {
    id: 'time_spent_1800',
    name: 'Sanat Yaşamı',
    description: 'Toplam 30 saat boyama yap',
    icon: '🌟',
    category: 'dedication',
    rarity: 'legendary',
    requirement: { type: 'coloring_time_total', value: 1800 },
  },

  // Session Achievements
  {
    id: 'speed_artist',
    name: 'Hızlı Sanatçı',
    description: '5 dakikadan kısa sürede tamamla',
    icon: '⚡',
    category: 'session',
    rarity: 'rare',
    requirement: { type: 'quick_coloring', value: 1 },
  },
  {
    id: 'marathon_artist',
    name: 'Maraton Sanatçısı',
    description: '30 dakikadan uzun tek oturum',
    icon: '🏃',
    category: 'session',
    rarity: 'rare',
    requirement: { type: 'marathon_coloring', value: 1 },
  },

  // Persistence
  {
    id: 'never_give_up',
    name: 'Asla Pes Etme',
    description: 'Geri al\'ı kullan ve devam et',
    icon: '💪',
    category: 'persistence',
    rarity: 'common',
    requirement: { type: 'undo_and_continue', value: 1 },
  },
  {
    id: 'persistent_artist',
    name: 'Azimli Sanatçı',
    description: '10 kez geri al\'ı kullan ve devam et',
    icon: '🔄',
    category: 'persistence',
    rarity: 'rare',
    requirement: { type: 'undo_and_continue', value: 10 },
  },

  // Secret Coloring Badges
  {
    id: 'secret_midnight_artist',
    name: 'Gece Yarısı Sanatçısı',
    description: 'Gece yarısından sonra boya',
    icon: '🌙',
    category: 'secret',
    rarity: 'rare',
    requirement: { type: 'coloring_time_of_day', value: 'midnight' },
    isSecret: true,
  },
  {
    id: 'secret_sunrise_creator',
    name: 'Şafak Yaratıcısı',
    description: 'Gün doğumunda boya',
    icon: '🌅',
    category: 'secret',
    rarity: 'rare',
    requirement: { type: 'coloring_time_of_day', value: 'sunrise' },
    isSecret: true,
  },
  {
    id: 'secret_golden_hour',
    name: 'Altın Saat',
    description: 'Gün batımında boya',
    icon: '🌇',
    category: 'secret',
    rarity: 'epic',
    requirement: { type: 'coloring_time_of_day', value: 'golden_hour' },
    isSecret: true,
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
