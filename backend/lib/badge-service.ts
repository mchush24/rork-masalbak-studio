/**
 * BadgeService - Rozet Sistemi Backend Servisi
 *
 * Özellikler:
 * - Rozet kontrolü ve kazandırma
 * - İlerleme takibi
 * - Aktivite kaydı
 * - Seri hesaplama
 */

import { supa } from "./supabase.js";
import { logger } from "./utils.js";

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
  | 'multiple_children';

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
  { id: 'first_analysis', name: 'İlk Çizgi', description: 'İlk analizini yap', icon: '✏️', category: 'first_steps', rarity: 'common', requirement: { type: 'total_analyses', value: 1 } },
  { id: 'first_story', name: 'Masal Başlangıcı', description: 'İlk masalını oluştur', icon: '📖', category: 'first_steps', rarity: 'common', requirement: { type: 'total_stories', value: 1 } },
  { id: 'first_coloring', name: 'Renk Ustası Adayı', description: 'İlk boyama sayfanı oluştur', icon: '🎨', category: 'first_steps', rarity: 'common', requirement: { type: 'total_colorings', value: 1 } },
  { id: 'first_child', name: 'Aile Kurucusu', description: 'İlk çocuğunu ekle', icon: '👶', category: 'first_steps', rarity: 'common', requirement: { type: 'first_child', value: 1 } },
  { id: 'profile_complete', name: 'Profil Yıldızı', description: 'Profilini tamamla', icon: '⭐', category: 'first_steps', rarity: 'common', requirement: { type: 'profile_complete', value: 1 } },

  // Yaratıcılık - Analyses
  { id: 'analysis_5', name: 'Çizim Meraklısı', description: '5 analiz yap', icon: '🔍', category: 'creativity', rarity: 'common', requirement: { type: 'total_analyses', value: 5 } },
  { id: 'analysis_10', name: 'Çizim Avcısı', description: '10 analiz yap', icon: '🎯', category: 'creativity', rarity: 'common', requirement: { type: 'total_analyses', value: 10 } },
  { id: 'analysis_25', name: 'Çizim Uzmanı', description: '25 analiz yap', icon: '🏅', category: 'creativity', rarity: 'rare', requirement: { type: 'total_analyses', value: 25 } },
  { id: 'analysis_50', name: 'Çizim Ustası', description: '50 analiz yap', icon: '🎖️', category: 'creativity', rarity: 'epic', requirement: { type: 'total_analyses', value: 50 } },
  { id: 'analysis_100', name: 'Çizim Efsanesi', description: '100 analiz yap', icon: '👑', category: 'creativity', rarity: 'legendary', requirement: { type: 'total_analyses', value: 100 } },

  // Yaratıcılık - Stories
  { id: 'story_5', name: 'Masal Anlatıcısı', description: '5 masal oluştur', icon: '📚', category: 'creativity', rarity: 'common', requirement: { type: 'total_stories', value: 5 } },
  { id: 'story_10', name: 'Masal Yazarı', description: '10 masal oluştur', icon: '✍️', category: 'creativity', rarity: 'common', requirement: { type: 'total_stories', value: 10 } },
  { id: 'story_25', name: 'Masal Ustası', description: '25 masal oluştur', icon: '📜', category: 'creativity', rarity: 'rare', requirement: { type: 'total_stories', value: 25 } },
  { id: 'story_50', name: 'Masal Büyücüsü', description: '50 masal oluştur', icon: '🧙', category: 'creativity', rarity: 'epic', requirement: { type: 'total_stories', value: 50 } },
  { id: 'story_100', name: 'Masal Efsanesi', description: '100 masal oluştur', icon: '🌟', category: 'creativity', rarity: 'legendary', requirement: { type: 'total_stories', value: 100 } },

  // Yaratıcılık - Colorings
  { id: 'coloring_5', name: 'Renk Avcısı', description: '5 boyama sayfası oluştur', icon: '🖍️', category: 'creativity', rarity: 'common', requirement: { type: 'total_colorings', value: 5 } },
  { id: 'coloring_10', name: 'Renk Ustası', description: '10 boyama sayfası oluştur', icon: '🎨', category: 'creativity', rarity: 'common', requirement: { type: 'total_colorings', value: 10 } },
  { id: 'coloring_25', name: 'Renk Büyücüsü', description: '25 boyama sayfası oluştur', icon: '🌈', category: 'creativity', rarity: 'rare', requirement: { type: 'total_colorings', value: 25 } },

  // Kaşif
  { id: 'explorer_3_tests', name: 'Test Kaşifi', description: '3 farklı test türü dene', icon: '🔍', category: 'explorer', rarity: 'common', requirement: { type: 'unique_test_types', value: 3 } },
  { id: 'explorer_5_tests', name: 'Test Gezgini', description: '5 farklı test türü dene', icon: '🧭', category: 'explorer', rarity: 'rare', requirement: { type: 'unique_test_types', value: 5 } },
  { id: 'explorer_all_tests', name: 'Test Ustası', description: 'Tüm 9 test türünü dene', icon: '🏆', category: 'explorer', rarity: 'legendary', requirement: { type: 'unique_test_types', value: 9 } },
  { id: 'multiple_children', name: 'Kalabalık Aile', description: 'Birden fazla çocuk ekle', icon: '👨‍👩‍👧‍👦', category: 'explorer', rarity: 'rare', requirement: { type: 'multiple_children', value: 2 } },

  // Düzenlilik
  { id: 'streak_3', name: 'Düzenli Ziyaretçi', description: '3 gün üst üste kullan', icon: '🔥', category: 'consistency', rarity: 'common', requirement: { type: 'consecutive_days', value: 3 } },
  { id: 'streak_7', name: 'Haftalık Yıldız', description: '7 gün üst üste kullan', icon: '⭐', category: 'consistency', rarity: 'rare', requirement: { type: 'consecutive_days', value: 7 } },
  { id: 'streak_14', name: 'Süper Kullanıcı', description: '14 gün üst üste kullan', icon: '💪', category: 'consistency', rarity: 'epic', requirement: { type: 'consecutive_days', value: 14 } },
  { id: 'streak_30', name: 'Efsane', description: '30 gün üst üste kullan', icon: '👑', category: 'consistency', rarity: 'legendary', requirement: { type: 'consecutive_days', value: 30 } },

  // Özel Günler
  { id: 'special_23_nisan', name: 'Çocuk Bayramı', description: '23 Nisan\'da uygulamayı kullan', icon: '🎈', category: 'special', rarity: 'rare', requirement: { type: 'special_day', value: '04-23' } },
  { id: 'special_29_ekim', name: 'Cumhuriyet Çocuğu', description: '29 Ekim\'de uygulamayı kullan', icon: '🇹🇷', category: 'special', rarity: 'rare', requirement: { type: 'special_day', value: '10-29' } },
  { id: 'special_new_year', name: 'Yeni Yıl Büyücüsü', description: '1 Ocak\'ta uygulamayı kullan', icon: '🎉', category: 'special', rarity: 'rare', requirement: { type: 'special_day', value: '01-01' } },
  { id: 'special_19_mayis', name: 'Gençlik Ruhu', description: '19 Mayıs\'ta uygulamayı kullan', icon: '🏃', category: 'special', rarity: 'rare', requirement: { type: 'special_day', value: '05-19' } },

  // Gizli
  { id: 'secret_night_owl', name: 'Gece Kuşu', description: 'Gece yarısından sonra kullan', icon: '🦉', category: 'secret', rarity: 'rare', requirement: { type: 'time_of_day', value: 'night' }, isSecret: true },
  { id: 'secret_early_bird', name: 'Erken Kalkan', description: 'Sabah 6\'dan önce kullan', icon: '🌅', category: 'secret', rarity: 'rare', requirement: { type: 'time_of_day', value: 'early_morning' }, isSecret: true },
  { id: 'secret_weekend_warrior', name: 'Hafta Sonu Savaşçısı', description: 'Hem Cumartesi hem Pazar kullan', icon: '🎮', category: 'secret', rarity: 'epic', requirement: { type: 'special_day', value: 'weekend_both' }, isSecret: true },
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

      return (data || []).map(ub => ({
        badgeId: ub.badge_id,
        badge: BADGES.find(b => b.id === ub.badge_id)!,
        unlockedAt: new Date(ub.unlocked_at),
      })).filter(ub => ub.badge);
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
      const { error } = await supa
        .from('user_badges')
        .insert({
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

        await supa
          .from('user_activity')
          .update(updates)
          .eq('id', existing.id);
      } else {
        // Insert new record
        const counts = {
          analyses_count: type === 'analysis' ? 1 : 0,
          stories_count: type === 'story' ? 1 : 0,
          colorings_count: type === 'coloring' ? 1 : 0,
        };

        await supa
          .from('user_activity')
          .insert({
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
  }> {
    try {
      // Get analysis count
      const { count: analysesCount } = await supa
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get story count
      const { count: storiesCount } = await supa
        .from('storybooks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get coloring count
      const { count: coloringsCount } = await supa
        .from('colorings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

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

      return {
        totalAnalyses: analysesCount || 0,
        totalStories: storiesCount || 0,
        totalColorings: coloringsCount || 0,
        uniqueTestTypes,
        consecutiveDays,
        childrenCount,
        profileComplete,
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
        // These are checked separately in real-time
        return false;

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
  static async getBadgeProgress(userId: string): Promise<{
    badge: Badge;
    current: number;
    target: number;
    percentage: number;
  }[]> {
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
