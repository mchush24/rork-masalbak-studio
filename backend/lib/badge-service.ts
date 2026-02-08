/**
 * BadgeService - Rozet Sistemi Backend Servisi
 *
 * Özellikler:
 * - Rozet kontrolü ve kazandırma
 * - İlerleme takibi
 * - Aktivite kaydı
 * - Seri hesaplama
 */

import { supa } from './supabase.js';
import { logger } from './utils.js';

// Badge definitions (imported from frontend constants)
// We duplicate the essential types here to avoid import issues
type BadgeRequirementType =
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
  // Phase 2: Coloring-specific achievements
  | 'completed_colorings' // Actually finished coloring pages
  | 'colors_used_total' // Total unique colors ever used
  | 'colors_used_single' // Colors used in a single artwork
  | 'brush_types_used' // Different brush types used
  | 'premium_brushes_used' // Premium brushes used
  | 'ai_suggestions_used' // Used AI color suggestions
  | 'harmony_colors_used' // Used color harmony feature
  | 'reference_images_used' // Used reference image picker
  | 'coloring_streak' // Days in a row coloring
  | 'coloring_time_total' // Total minutes spent coloring
  | 'quick_coloring' // Completed under 5 min
  | 'marathon_coloring' // Single session over 30 min
  | 'undo_and_continue' // Used undo but continued
  | 'perfect_fill' // No color outside lines
  | 'coloring_time_of_day'; // Coloring at specific times

interface BadgeRequirement {
  type: BadgeRequirementType;
  value: number | string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  requirement: BadgeRequirement;
  isSecret?: boolean;
}

// Badge definitions (keep in sync with constants/badges.ts)
const BADGES: Badge[] = [
  // İlk Adımlar
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

  // Yaratıcılık - Analyses
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

  // Yaratıcılık - Stories
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

  // Yaratıcılık - Colorings
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
    description: "Geri al'ı kullan ve devam et",
    icon: '💪',
    category: 'persistence',
    rarity: 'common',
    requirement: { type: 'undo_and_continue', value: 1 },
  },
  {
    id: 'persistent_artist',
    name: 'Azimli Sanatçı',
    description: "10 kez geri al'ı kullan ve devam et",
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

  // Kaşif
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

  // Düzenlilik
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

  // Özel Günler
  {
    id: 'special_23_nisan',
    name: 'Çocuk Bayramı',
    description: "23 Nisan'da uygulamayı kullan",
    icon: '🎈',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '04-23' },
  },
  {
    id: 'special_29_ekim',
    name: 'Cumhuriyet Çocuğu',
    description: "29 Ekim'de uygulamayı kullan",
    icon: '🇹🇷',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '10-29' },
  },
  {
    id: 'special_new_year',
    name: 'Yeni Yıl Büyücüsü',
    description: "1 Ocak'ta uygulamayı kullan",
    icon: '🎉',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '01-01' },
  },
  {
    id: 'special_19_mayis',
    name: 'Gençlik Ruhu',
    description: "19 Mayıs'ta uygulamayı kullan",
    icon: '🏃',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', value: '05-19' },
  },

  // Gizli
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
    description: "Sabah 6'dan önce kullan",
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

export interface UserBadgeResult {
  badgeId: string;
  badge: Badge;
  unlockedAt: Date;
}

export interface CheckBadgesResult {
  newBadges: UserBadgeResult[];
  allBadges: UserBadgeResult[];
}

export class BadgeService {
  /**
   * Get all badges for a user
   */
  static async getUserBadges(userId: string): Promise<UserBadgeResult[]> {
    try {
      const { data, error } = await supa
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        logger.error('[BadgeService] Error fetching user badges:', error);
        return [];
      }

      return (data || [])
        .map(ub => ({
          badgeId: ub.badge_id,
          badge: BADGES.find(b => b.id === ub.badge_id)!,
          unlockedAt: new Date(ub.unlocked_at),
        }))
        .filter(ub => ub.badge);
    } catch (error) {
      logger.error('[BadgeService] Error in getUserBadges:', error);
      return [];
    }
  }

  /**
   * Check and award badges based on user stats
   */
  static async checkAndAwardBadges(userId: string): Promise<CheckBadgesResult> {
    try {
      logger.info(`[BadgeService] Checking badges for user ${userId}`);

      // Get user's current badges
      const existingBadges = await this.getUserBadges(userId);
      const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

      // Get user stats
      const stats = await this.getUserStats(userId);

      const newBadges: UserBadgeResult[] = [];

      // Check each badge
      for (const badge of BADGES) {
        if (existingBadgeIds.has(badge.id)) continue;

        const earned = await this.checkBadgeRequirement(userId, badge, stats);

        if (earned) {
          const awarded = await this.awardBadge(userId, badge.id);
          if (awarded) {
            newBadges.push({
              badgeId: badge.id,
              badge,
              unlockedAt: new Date(),
            });
          }
        }
      }

      if (newBadges.length > 0) {
        logger.info(`[BadgeService] Awarded ${newBadges.length} new badges to user ${userId}`);
      }

      return {
        newBadges,
        allBadges: [...existingBadges, ...newBadges],
      };
    } catch (error) {
      logger.error('[BadgeService] Error in checkAndAwardBadges:', error);
      return { newBadges: [], allBadges: [] };
    }
  }

  /**
   * Award a specific badge to user
   */
  static async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      const { error } = await supa.from('user_badges').insert({
        user_id: userId,
        badge_id: badgeId,
        unlocked_at: new Date().toISOString(),
      });

      if (error) {
        // Ignore unique constraint errors (badge already awarded)
        if (error.code === '23505') {
          logger.info(`[BadgeService] Badge ${badgeId} already awarded to user ${userId}`);
          return false;
        }
        logger.error('[BadgeService] Error awarding badge:', error);
        return false;
      }

      logger.info(`[BadgeService] Awarded badge ${badgeId} to user ${userId}`);
      return true;
    } catch (error) {
      logger.error('[BadgeService] Error in awardBadge:', error);
      return false;
    }
  }

  /**
   * Record user activity (for streak tracking)
   */
  static async recordActivity(
    userId: string,
    type: 'analysis' | 'story' | 'coloring'
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Upsert activity record
      const { data: existing } = await supa
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single();

      if (existing) {
        // Update counts
        const updates: Record<string, number> = {};
        if (type === 'analysis') updates.analyses_count = (existing.analyses_count || 0) + 1;
        if (type === 'story') updates.stories_count = (existing.stories_count || 0) + 1;
        if (type === 'coloring') updates.colorings_count = (existing.colorings_count || 0) + 1;

        await supa.from('user_activity').update(updates).eq('id', existing.id);
      } else {
        // Insert new record
        const counts = {
          analyses_count: type === 'analysis' ? 1 : 0,
          stories_count: type === 'story' ? 1 : 0,
          colorings_count: type === 'coloring' ? 1 : 0,
        };

        await supa.from('user_activity').insert({
          user_id: userId,
          activity_date: today,
          ...counts,
          first_activity_at: new Date().toISOString(),
        });
      }

      // Check for time-based secret badges
      await this.checkTimeBadges(userId);

      // Check special day badges
      await this.checkSpecialDayBadges(userId);

      logger.info(`[BadgeService] Recorded ${type} activity for user ${userId}`);
    } catch (error) {
      logger.error('[BadgeService] Error recording activity:', error);
    }
  }

  /**
   * Get user statistics for badge checking
   */
  private static async getUserStats(userId: string): Promise<{
    totalAnalyses: number;
    totalStories: number;
    totalColorings: number;
    uniqueTestTypes: number;
    consecutiveDays: number;
    childrenCount: number;
    profileComplete: boolean;
    // Phase 2: Coloring-specific stats
    completedColorings: number;
    colorsUsedTotal: number;
    colorsUsedSingleMax: number;
    brushTypesUsed: number;
    premiumBrushesUsed: number;
    aiSuggestionsUsed: number;
    harmonyColorsUsed: number;
    referenceImagesUsed: number;
    coloringStreak: number;
    coloringTimeTotal: number;
    quickColorings: number;
    marathonColorings: number;
    undoAndContinue: number;
  }> {
    try {
      // Get analysis count
      const { count: analysesCount } = await supa
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get story count (storybooks uses user_id_fk as foreign key)
      const { count: storiesCount } = await supa
        .from('storybooks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id_fk', userId);

      // Get coloring count (colorings uses user_id_fk as foreign key)
      const { count: coloringsCount } = await supa
        .from('colorings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id_fk', userId);

      // Get unique test types
      const { data: testTypes } = await supa
        .from('analyses')
        .select('task_type')
        .eq('user_id', userId);
      const uniqueTestTypes = new Set(testTypes?.map(t => t.task_type) || []).size;

      // Get user data for children and profile
      const { data: userData } = await supa
        .from('users')
        .select('children, name, current_streak')
        .eq('id', userId)
        .single();

      const children = userData?.children || [];
      const childrenCount = Array.isArray(children) ? children.length : 0;
      const profileComplete = !!(userData?.name && childrenCount > 0);
      const consecutiveDays = userData?.current_streak || 0;

      // Phase 2: Get coloring-specific stats from user_coloring_stats table
      const { data: coloringStats } = await supa
        .from('user_coloring_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        totalAnalyses: analysesCount || 0,
        totalStories: storiesCount || 0,
        totalColorings: coloringsCount || 0,
        uniqueTestTypes,
        consecutiveDays,
        childrenCount,
        profileComplete,
        // Phase 2: Coloring-specific stats
        completedColorings: coloringStats?.completed_colorings || 0,
        colorsUsedTotal: coloringStats?.colors_used_total || 0,
        colorsUsedSingleMax: coloringStats?.colors_used_single_max || 0,
        brushTypesUsed: coloringStats?.brush_types_used || 0,
        premiumBrushesUsed: coloringStats?.premium_brushes_used || 0,
        aiSuggestionsUsed: coloringStats?.ai_suggestions_used || 0,
        harmonyColorsUsed: coloringStats?.harmony_colors_used || 0,
        referenceImagesUsed: coloringStats?.reference_images_used || 0,
        coloringStreak: coloringStats?.coloring_streak || 0,
        coloringTimeTotal: coloringStats?.coloring_time_total || 0,
        quickColorings: coloringStats?.quick_colorings || 0,
        marathonColorings: coloringStats?.marathon_colorings || 0,
        undoAndContinue: coloringStats?.undo_and_continue || 0,
      };
    } catch (error) {
      logger.error('[BadgeService] Error getting user stats:', error);
      return {
        totalAnalyses: 0,
        totalStories: 0,
        totalColorings: 0,
        uniqueTestTypes: 0,
        consecutiveDays: 0,
        childrenCount: 0,
        profileComplete: false,
        // Phase 2: Default coloring stats
        completedColorings: 0,
        colorsUsedTotal: 0,
        colorsUsedSingleMax: 0,
        brushTypesUsed: 0,
        premiumBrushesUsed: 0,
        aiSuggestionsUsed: 0,
        harmonyColorsUsed: 0,
        referenceImagesUsed: 0,
        coloringStreak: 0,
        coloringTimeTotal: 0,
        quickColorings: 0,
        marathonColorings: 0,
        undoAndContinue: 0,
      };
    }
  }

  /**
   * Check if badge requirement is met
   */
  private static async checkBadgeRequirement(
    userId: string,
    badge: Badge,
    stats: Awaited<ReturnType<typeof this.getUserStats>>
  ): Promise<boolean> {
    const { type, value } = badge.requirement;

    switch (type) {
      case 'total_analyses':
        return stats.totalAnalyses >= (value as number);

      case 'total_stories':
        return stats.totalStories >= (value as number);

      case 'total_colorings':
        return stats.totalColorings >= (value as number);

      case 'consecutive_days':
        return stats.consecutiveDays >= (value as number);

      case 'unique_test_types':
        return stats.uniqueTestTypes >= (value as number);

      case 'first_child':
        return stats.childrenCount >= 1;

      case 'multiple_children':
        return stats.childrenCount >= (value as number);

      case 'profile_complete':
        return stats.profileComplete;

      case 'special_day':
      case 'time_of_day':
      case 'coloring_time_of_day':
        // These are checked separately in real-time
        return false;

      // Phase 2: Coloring-specific requirements
      case 'completed_colorings':
        return stats.completedColorings >= (value as number);

      case 'colors_used_total':
        return stats.colorsUsedTotal >= (value as number);

      case 'colors_used_single':
        return stats.colorsUsedSingleMax >= (value as number);

      case 'brush_types_used':
        return stats.brushTypesUsed >= (value as number);

      case 'premium_brushes_used':
        return stats.premiumBrushesUsed >= (value as number);

      case 'ai_suggestions_used':
        return stats.aiSuggestionsUsed >= (value as number);

      case 'harmony_colors_used':
        return stats.harmonyColorsUsed >= (value as number);

      case 'reference_images_used':
        return stats.referenceImagesUsed >= (value as number);

      case 'coloring_streak':
        return stats.coloringStreak >= (value as number);

      case 'coloring_time_total':
        return stats.coloringTimeTotal >= (value as number);

      case 'quick_coloring':
        return stats.quickColorings >= (value as number);

      case 'marathon_coloring':
        return stats.marathonColorings >= (value as number);

      case 'undo_and_continue':
        return stats.undoAndContinue >= (value as number);

      default:
        return false;
    }
  }

  /**
   * Check time-based secret badges
   */
  private static async checkTimeBadges(userId: string): Promise<void> {
    const now = new Date();
    const hour = now.getHours();

    // Night owl: midnight to 4am
    if (hour >= 0 && hour < 4) {
      await this.awardBadge(userId, 'secret_night_owl');
    }

    // Early bird: 4am to 6am
    if (hour >= 4 && hour < 6) {
      await this.awardBadge(userId, 'secret_early_bird');
    }
  }

  /**
   * Check coloring time-based secret badges
   */
  private static async checkColoringTimeBadges(userId: string): Promise<void> {
    const now = new Date();
    const hour = now.getHours();

    // Midnight artist: 0am to 3am
    if (hour >= 0 && hour < 3) {
      await this.awardBadge(userId, 'secret_midnight_artist');
    }

    // Sunrise creator: 5am to 7am
    if (hour >= 5 && hour < 7) {
      await this.awardBadge(userId, 'secret_sunrise_creator');
    }

    // Golden hour: 6pm to 8pm (sunset time)
    if (hour >= 18 && hour < 20) {
      await this.awardBadge(userId, 'secret_golden_hour');
    }
  }

  /**
   * Record coloring-specific activity for badge tracking
   */
  static async recordColoringActivity(
    userId: string,
    activity: {
      type:
        | 'coloring_completed'
        | 'brush_used'
        | 'color_used'
        | 'ai_suggestion'
        | 'harmony_used'
        | 'reference_used'
        | 'undo_used'
        | 'session_time';
      value?: string | number;
      sessionDuration?: number;
      colorsInSession?: number;
    }
  ): Promise<void> {
    try {
      // Get or create user coloring stats
      const { data: existing } = await supa
        .from('user_coloring_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const updates: Record<string, unknown> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      switch (activity.type) {
        case 'coloring_completed':
          updates.completed_colorings = (existing?.completed_colorings || 0) + 1;
          // Update colors used in single max
          if (
            activity.colorsInSession &&
            activity.colorsInSession > (existing?.colors_used_single_max || 0)
          ) {
            updates.colors_used_single_max = activity.colorsInSession;
          }
          // Check for quick or marathon coloring
          if (activity.sessionDuration) {
            if (activity.sessionDuration < 5) {
              updates.quick_colorings = (existing?.quick_colorings || 0) + 1;
            }
            if (activity.sessionDuration >= 30) {
              updates.marathon_colorings = (existing?.marathon_colorings || 0) + 1;
            }
          }
          break;

        case 'brush_used':
          // Track unique brush types as a Set stored as JSON array
          const brushTypes = new Set(existing?.brush_types_array || []);
          if (activity.value && typeof activity.value === 'string') {
            brushTypes.add(activity.value);
            updates.brush_types_array = Array.from(brushTypes);
            updates.brush_types_used = brushTypes.size;
            // Check if premium brush
            const premiumBrushes = ['watercolor', 'marker', 'spray', 'crayon', 'highlighter'];
            if (premiumBrushes.includes(activity.value)) {
              const premiumSet = new Set(existing?.premium_brushes_array || []);
              premiumSet.add(activity.value);
              updates.premium_brushes_array = Array.from(premiumSet);
              updates.premium_brushes_used = premiumSet.size;
            }
          }
          break;

        case 'color_used':
          // Track unique colors
          const colors = new Set(existing?.colors_used_array || []);
          if (activity.value && typeof activity.value === 'string') {
            colors.add(activity.value);
            updates.colors_used_array = Array.from(colors);
            updates.colors_used_total = colors.size;
          }
          break;

        case 'ai_suggestion':
          updates.ai_suggestions_used = (existing?.ai_suggestions_used || 0) + 1;
          break;

        case 'harmony_used':
          updates.harmony_colors_used = (existing?.harmony_colors_used || 0) + 1;
          break;

        case 'reference_used':
          updates.reference_images_used = (existing?.reference_images_used || 0) + 1;
          break;

        case 'undo_used':
          updates.undo_and_continue = (existing?.undo_and_continue || 0) + 1;
          break;

        case 'session_time':
          if (typeof activity.value === 'number') {
            updates.coloring_time_total = (existing?.coloring_time_total || 0) + activity.value;
          }
          break;
      }

      // Upsert the stats
      if (existing) {
        await supa.from('user_coloring_stats').update(updates).eq('user_id', userId);
      } else {
        await supa.from('user_coloring_stats').insert(updates);
      }

      // Check for coloring time-based badges
      await this.checkColoringTimeBadges(userId);

      // Update coloring streak
      await this.updateColoringStreak(userId);

      logger.info(`[BadgeService] Recorded coloring activity ${activity.type} for user ${userId}`);
    } catch (error) {
      logger.error('[BadgeService] Error recording coloring activity:', error);
    }
  }

  /**
   * Update coloring streak for a user
   */
  private static async updateColoringStreak(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get user's coloring activity
      const { data: stats } = await supa
        .from('user_coloring_stats')
        .select('last_coloring_date, coloring_streak')
        .eq('user_id', userId)
        .single();

      const lastDate = stats?.last_coloring_date;
      const currentStreak = stats?.coloring_streak || 0;

      let newStreak = 1;

      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.floor(
          (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // Same day, keep current streak
          newStreak = currentStreak;
        } else if (diffDays === 1) {
          // Consecutive day, increment streak
          newStreak = currentStreak + 1;
        } else {
          // Streak broken, start over
          newStreak = 1;
        }
      }

      // Update streak
      await supa
        .from('user_coloring_stats')
        .update({
          coloring_streak: newStreak,
          last_coloring_date: today,
        })
        .eq('user_id', userId);
    } catch (error) {
      logger.error('[BadgeService] Error updating coloring streak:', error);
    }
  }

  /**
   * Check special day badges
   */
  private static async checkSpecialDayBadges(userId: string): Promise<void> {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    const dayOfWeek = now.getDay();

    // Check fixed date special days
    const specialDayBadges: Record<string, string> = {
      '01-01': 'special_new_year',
      '04-23': 'special_23_nisan',
      '05-19': 'special_19_mayis',
      '10-29': 'special_29_ekim',
    };

    if (specialDayBadges[dateStr]) {
      await this.awardBadge(userId, specialDayBadges[dateStr]);
    }

    // Check weekend warrior (need both Saturday and Sunday in the same week)
    if (dayOfWeek === 0) {
      // Sunday - check if Saturday also had activity
      const saturday = new Date(now);
      saturday.setDate(saturday.getDate() - 1);
      const saturdayStr = saturday.toISOString().split('T')[0];

      const { data: saturdayActivity } = await supa
        .from('user_activity')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_date', saturdayStr)
        .single();

      if (saturdayActivity) {
        await this.awardBadge(userId, 'secret_weekend_warrior');
      }
    }
  }

  /**
   * Get badge progress for a user
   */
  static async getBadgeProgress(userId: string): Promise<
    {
      badge: Badge;
      current: number;
      target: number;
      percentage: number;
    }[]
  > {
    const stats = await this.getUserStats(userId);
    const existingBadges = await this.getUserBadges(userId);
    const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

    const progress: {
      badge: Badge;
      current: number;
      target: number;
      percentage: number;
    }[] = [];

    for (const badge of BADGES) {
      if (existingBadgeIds.has(badge.id)) continue;
      if (badge.isSecret) continue;

      const { type, value } = badge.requirement;
      let current = 0;
      let target = typeof value === 'number' ? value : 1;

      switch (type) {
        case 'total_analyses':
          current = stats.totalAnalyses;
          break;
        case 'total_stories':
          current = stats.totalStories;
          break;
        case 'total_colorings':
          current = stats.totalColorings;
          break;
        case 'consecutive_days':
          current = stats.consecutiveDays;
          break;
        case 'unique_test_types':
          current = stats.uniqueTestTypes;
          break;
        case 'first_child':
        case 'multiple_children':
          current = stats.childrenCount;
          target = typeof value === 'number' ? value : 1;
          break;
        case 'profile_complete':
          current = stats.profileComplete ? 1 : 0;
          target = 1;
          break;
        // Phase 2: Coloring-specific progress tracking
        case 'completed_colorings':
          current = stats.completedColorings;
          break;
        case 'colors_used_total':
          current = stats.colorsUsedTotal;
          break;
        case 'colors_used_single':
          current = stats.colorsUsedSingleMax;
          break;
        case 'brush_types_used':
          current = stats.brushTypesUsed;
          break;
        case 'premium_brushes_used':
          current = stats.premiumBrushesUsed;
          break;
        case 'ai_suggestions_used':
          current = stats.aiSuggestionsUsed;
          break;
        case 'harmony_colors_used':
          current = stats.harmonyColorsUsed;
          break;
        case 'reference_images_used':
          current = stats.referenceImagesUsed;
          break;
        case 'coloring_streak':
          current = stats.coloringStreak;
          break;
        case 'coloring_time_total':
          current = stats.coloringTimeTotal;
          break;
        case 'quick_coloring':
          current = stats.quickColorings;
          break;
        case 'marathon_coloring':
          current = stats.marathonColorings;
          break;
        case 'undo_and_continue':
          current = stats.undoAndContinue;
          break;
        default:
          continue;
      }

      if (current < target) {
        progress.push({
          badge,
          current,
          target,
          percentage: Math.round((current / target) * 100),
        });
      }
    }

    // Sort by percentage (closest to completion first)
    return progress.sort((a, b) => b.percentage - a.percentage);
  }
}

export default BadgeService;
