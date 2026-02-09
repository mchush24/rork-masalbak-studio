/**
 * Social Feed tRPC Router
 *
 * Keşfet sekmesi için API endpoint'leri:
 * - Uzman İpuçları (Expert Tips)
 * - Aktivite Önerileri (Activity Suggestions)
 * - Topluluk Galerisi (Community Gallery)
 * - Başarı Hikayeleri (Success Stories)
 */

import { z } from 'zod';
import { createLogger } from '../../lib/logger.js';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../create-context.js';
import { supa } from '../../lib/supabase.js';
import { dailyTipCache, discoverFeedCache } from '../../lib/cache.js';

const log = createLogger('SocialFeedAPI');

// ============================================
// Schemas
// ============================================

const expertTipCategorySchema = z.enum([
  'development',
  'creativity',
  'emotions',
  'behavior',
  'communication',
]);

const activityCategorySchema = z.enum([
  'coloring',
  'story',
  'game',
  'outdoor',
  'creative',
  'mindfulness',
]);

const galleryThemeSchema = z.enum([
  'family',
  'nature',
  'animals',
  'fantasy',
  'emotions',
  'seasons',
  'holidays',
  'other',
]);

const galleryContentTypeSchema = z.enum(['coloring', 'drawing', 'story_illustration']);

const authorTypeSchema = z.enum(['parent', 'teacher', 'therapist', 'caregiver']);

// ============================================
// Types
// ============================================

interface ExpertTip {
  id: string;
  content: string;
  source: string | null;
  source_title: string | null;
  category: string;
  is_featured: boolean;
  icon: string;
  created_at: string;
}

interface ActivitySuggestion {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  category: string;
  age_min: number;
  age_max: number;
  icon: string;
  action_url: string | null;
  gradient_colors: string[];
  is_daily: boolean;
  display_order: number;
}

interface GalleryItem {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  child_age: number | null;
  theme: string | null;
  content_type: string;
  likes_count: number;
  created_at: string;
}

interface SuccessStory {
  id: string;
  title: string | null;
  content: string;
  child_age: number | null;
  author_type: string;
  images: string[];
  likes_count: number;
  is_featured: boolean;
  created_at: string;
}

// ============================================
// Router
// ============================================

export const socialFeedRouter = createTRPCRouter({
  // ============================================
  // EXPERT TIPS
  // ============================================

  /**
   * Günün ipucunu getir (featured tip)
   */
  getDailyTip: publicProcedure.query(async () => {
    log.debug('Fetching daily tip');

    return dailyTipCache.getOrFetch('daily', async () => {
      const { data, error } = await supa
        .from('expert_tips')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        log.error('Error fetching daily tip', error);
        throw error;
      }

      if (!data) {
        const { data: fallback } = await supa
          .from('expert_tips')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return { tip: fallback as ExpertTip | null };
      }

      return { tip: data as ExpertTip };
    });
  }),

  /**
   * Uzman ipuçlarını listele
   */
  listExpertTips: publicProcedure
    .input(
      z.object({
        category: expertTipCategorySchema.optional(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      log.debug('Listing expert tips', { category: input.category, limit: input.limit });

      let query = supa
        .from('expert_tips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(input.limit + 1);

      if (input.category) {
        query = query.eq('category', input.category);
      }

      if (input.cursor) {
        query = query.lt('created_at', input.cursor);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error listing expert tips', error);
        throw error;
      }

      const tips = data as ExpertTip[];
      const hasMore = tips.length > input.limit;
      const items = hasMore ? tips.slice(0, -1) : tips;
      const nextCursor = hasMore ? items[items.length - 1]?.created_at : undefined;

      return {
        tips: items,
        nextCursor,
        hasMore,
      };
    }),

  // ============================================
  // ACTIVITY SUGGESTIONS
  // ============================================

  /**
   * Günlük aktivite önerilerini getir
   */
  getDailySuggestions: publicProcedure
    .input(
      z.object({
        childAge: z.number().min(1).max(18).optional(),
      })
    )
    .query(async ({ input }) => {
      log.debug('Fetching daily suggestions', { childAge: input.childAge });

      let query = supa
        .from('activity_suggestions')
        .select('*')
        .eq('is_daily', true)
        .order('display_order', { ascending: true });

      if (input.childAge) {
        query = query.lte('age_min', input.childAge).gte('age_max', input.childAge);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error fetching daily suggestions', error);
        throw error;
      }

      return { suggestions: data as ActivitySuggestion[] };
    }),

  /**
   * Tüm aktiviteleri listele
   */
  listActivities: publicProcedure
    .input(
      z.object({
        category: activityCategorySchema.optional(),
        childAge: z.number().min(1).max(18).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      log.debug('Listing activities', { category: input.category, childAge: input.childAge });

      let query = supa
        .from('activity_suggestions')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(input.limit);

      if (input.category) {
        query = query.eq('category', input.category);
      }

      if (input.childAge) {
        query = query.lte('age_min', input.childAge).gte('age_max', input.childAge);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error listing activities', error);
        throw error;
      }

      return { activities: data as ActivitySuggestion[] };
    }),

  // ============================================
  // COMMUNITY GALLERY
  // ============================================

  /**
   * Topluluk galerisini listele
   */
  listGallery: publicProcedure
    .input(
      z.object({
        theme: galleryThemeSchema.optional(),
        contentType: galleryContentTypeSchema.optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      log.debug('Listing gallery', { theme: input.theme, contentType: input.contentType });

      let query = supa
        .from('community_gallery')
        .select(
          'id, image_url, thumbnail_url, child_age, theme, content_type, likes_count, created_at'
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(input.limit + 1);

      if (input.theme) {
        query = query.eq('theme', input.theme);
      }

      if (input.contentType) {
        query = query.eq('content_type', input.contentType);
      }

      if (input.cursor) {
        query = query.lt('created_at', input.cursor);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error listing gallery', error);
        throw error;
      }

      const items = data as GalleryItem[];
      const hasMore = items.length > input.limit;
      const galleryItems = hasMore ? items.slice(0, -1) : items;
      const nextCursor = hasMore ? galleryItems[galleryItems.length - 1]?.created_at : undefined;

      return {
        items: galleryItems,
        nextCursor,
        hasMore,
      };
    }),

  /**
   * Galeri öğesini beğen
   */
  likeGalleryItem: protectedProcedure
    .input(
      z.object({
        galleryId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      log.debug('Liking gallery item', { galleryId: input.galleryId, userId });

      // Check if already liked
      const { data: existingLike } = await supa
        .from('gallery_likes')
        .select('id')
        .eq('gallery_id', input.galleryId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supa
          .from('gallery_likes')
          .delete()
          .eq('gallery_id', input.galleryId)
          .eq('user_id', userId);

        if (error) {
          log.error('Error unliking gallery item', error);
          throw error;
        }

        return { liked: false };
      }

      // Like
      const { error } = await supa.from('gallery_likes').insert({
        gallery_id: input.galleryId,
        user_id: userId,
      });

      if (error) {
        log.error('Error liking gallery item', error);
        throw error;
      }

      return { liked: true };
    }),

  /**
   * Galeriye öğe ekle
   */
  submitToGallery: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        childAge: z.number().min(1).max(18),
        theme: galleryThemeSchema,
        contentType: galleryContentTypeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      log.info('Submitting to gallery', { userId, theme: input.theme });

      const { data, error } = await supa
        .from('community_gallery')
        .insert({
          user_id: userId,
          image_url: input.imageUrl,
          thumbnail_url: input.thumbnailUrl,
          child_age: input.childAge,
          theme: input.theme,
          content_type: input.contentType,
          is_approved: false, // Requires moderation
        })
        .select('id')
        .single();

      if (error) {
        log.error('Error submitting to gallery', error);
        throw error;
      }

      return {
        success: true,
        id: data.id,
        message: 'Gönderiniz inceleme için gönderildi. Onaylandıktan sonra galeride görünecek.',
      };
    }),

  /**
   * Kullanıcının kendi beğenilerini kontrol et
   */
  getUserGalleryLikes: protectedProcedure
    .input(
      z.object({
        galleryIds: z.array(z.string().uuid()),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (input.galleryIds.length === 0) {
        return { likedIds: [] };
      }

      const { data, error } = await supa
        .from('gallery_likes')
        .select('gallery_id')
        .eq('user_id', userId)
        .in('gallery_id', input.galleryIds);

      if (error) {
        log.error('Error fetching user gallery likes', error);
        throw error;
      }

      return {
        likedIds: (data || []).map(d => d.gallery_id),
      };
    }),

  // ============================================
  // SUCCESS STORIES
  // ============================================

  /**
   * Başarı hikayelerini listele
   */
  listStories: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        cursor: z.string().optional(),
        featuredOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      log.debug('Listing success stories', {
        limit: input.limit,
        featuredOnly: input.featuredOnly,
      });

      let query = supa
        .from('success_stories')
        .select(
          'id, title, content, child_age, author_type, images, likes_count, is_featured, created_at'
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(input.limit + 1);

      if (input.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      if (input.cursor) {
        query = query.lt('created_at', input.cursor);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error listing stories', error);
        throw error;
      }

      const stories = data as SuccessStory[];
      const hasMore = stories.length > input.limit;
      const storyItems = hasMore ? stories.slice(0, -1) : stories;
      const nextCursor = hasMore ? storyItems[storyItems.length - 1]?.created_at : undefined;

      return {
        stories: storyItems,
        nextCursor,
        hasMore,
      };
    }),

  /**
   * Hikaye beğen
   */
  likeStory: protectedProcedure
    .input(
      z.object({
        storyId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      log.debug('Liking story', { storyId: input.storyId, userId });

      // Check if already liked
      const { data: existingLike } = await supa
        .from('story_likes')
        .select('id')
        .eq('story_id', input.storyId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supa
          .from('story_likes')
          .delete()
          .eq('story_id', input.storyId)
          .eq('user_id', userId);

        if (error) {
          log.error('Error unliking story', error);
          throw error;
        }

        return { liked: false };
      }

      // Like
      const { error } = await supa.from('story_likes').insert({
        story_id: input.storyId,
        user_id: userId,
      });

      if (error) {
        log.error('Error liking story', error);
        throw error;
      }

      return { liked: true };
    }),

  /**
   * Hikaye paylaş
   */
  submitStory: protectedProcedure
    .input(
      z.object({
        title: z.string().max(200).optional(),
        content: z.string().min(50).max(2000),
        childAge: z.number().min(1).max(18),
        authorType: authorTypeSchema,
        images: z.array(z.string().url()).max(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      log.info('Submitting story', { userId, authorType: input.authorType });

      const { data, error } = await supa
        .from('success_stories')
        .insert({
          user_id: userId,
          title: input.title,
          content: input.content,
          child_age: input.childAge,
          author_type: input.authorType,
          images: input.images || [],
          is_approved: false, // Requires moderation
        })
        .select('id')
        .single();

      if (error) {
        log.error('Error submitting story', error);
        throw error;
      }

      return {
        success: true,
        id: data.id,
        message: 'Hikayeniz inceleme için gönderildi. Onaylandıktan sonra görünecek.',
      };
    }),

  /**
   * Kullanıcının kendi beğenilerini kontrol et (hikayeler)
   */
  getUserStoryLikes: protectedProcedure
    .input(
      z.object({
        storyIds: z.array(z.string().uuid()),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (input.storyIds.length === 0) {
        return { likedIds: [] };
      }

      const { data, error } = await supa
        .from('story_likes')
        .select('story_id')
        .eq('user_id', userId)
        .in('story_id', input.storyIds);

      if (error) {
        log.error('Error fetching user story likes', error);
        throw error;
      }

      return {
        likedIds: (data || []).map(d => d.story_id),
      };
    }),

  // ============================================
  // COMBINED FEED
  // ============================================

  /**
   * Keşfet ekranı için tüm verileri getir
   */
  getDiscoverFeed: publicProcedure
    .input(
      z.object({
        childAge: z.number().min(1).max(18).optional(),
      })
    )
    .query(async ({ input }) => {
      log.debug('Fetching discover feed', { childAge: input.childAge });

      const cacheKey = `feed:${input.childAge || 'all'}`;
      return discoverFeedCache.getOrFetch(cacheKey, async () => {
        // Parallel fetches with graceful failure handling
        const results = await Promise.allSettled([
          // Daily tip
          supa
            .from('expert_tips')
            .select('*')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),

          // Daily suggestions
          (() => {
            let query = supa
              .from('activity_suggestions')
              .select('*')
              .eq('is_daily', true)
              .order('display_order', { ascending: true })
              .limit(5);

            if (input.childAge) {
              query = query.lte('age_min', input.childAge).gte('age_max', input.childAge);
            }

            return query;
          })(),

          // Gallery (first 8)
          supa
            .from('community_gallery')
            .select(
              'id, image_url, thumbnail_url, child_age, theme, content_type, likes_count, created_at'
            )
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(8),

          // Stories (first 3)
          supa
            .from('success_stories')
            .select(
              'id, title, content, child_age, author_type, images, likes_count, is_featured, created_at'
            )
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        // Extract results with fallbacks
        const dailyTipResult =
          results[0].status === 'fulfilled' ? results[0].value : { data: null };
        const suggestionsResult =
          results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const galleryResult = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
        const storiesResult = results[3].status === 'fulfilled' ? results[3].value : { data: [] };

        return {
          dailyTip: (dailyTipResult.data as ExpertTip) || null,
          suggestions: (suggestionsResult.data as ActivitySuggestion[]) || [],
          gallery: (galleryResult.data as GalleryItem[]) || [],
          stories: (storiesResult.data as SuccessStory[]) || [],
        };
      });
    }),
});
