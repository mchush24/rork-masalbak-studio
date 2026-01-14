/**
 * Badge Routes - Rozet tRPC Endpoints
 */

import { z } from "zod";
import { logger } from "../../../lib/utils.js";
import { protectedProcedure, createTRPCRouter } from "../../create-context.js";
import { BadgeService } from "../../../lib/badge-service.js";

/**
 * Get user's badges
 */
export const getUserBadgesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId;
    logger.info("[getUserBadges] Fetching badges for user:", userId);

    const badges = await BadgeService.getUserBadges(userId);

    return {
      badges: badges.map(b => ({
        id: b.badgeId,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        category: b.badge.category,
        rarity: b.badge.rarity,
        unlockedAt: b.unlockedAt.toISOString(),
      })),
      total: badges.length,
    };
  });

/**
 * Check and award new badges
 */
export const checkBadgesProcedure = protectedProcedure
  .mutation(async ({ ctx }) => {
    const userId = ctx.userId;
    logger.info("[checkBadges] Checking badges for user:", userId);

    const result = await BadgeService.checkAndAwardBadges(userId);

    return {
      newBadges: result.newBadges.map(b => ({
        id: b.badgeId,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        category: b.badge.category,
        rarity: b.badge.rarity,
        unlockedAt: b.unlockedAt.toISOString(),
      })),
      totalBadges: result.allBadges.length,
    };
  });

/**
 * Get badge progress (badges not yet earned)
 */
export const getBadgeProgressProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId;
    logger.info("[getBadgeProgress] Fetching badge progress for user:", userId);

    const progress = await BadgeService.getBadgeProgress(userId);

    return {
      progress: progress.slice(0, 5).map(p => ({
        id: p.badge.id,
        name: p.badge.name,
        description: p.badge.description,
        icon: p.badge.icon,
        category: p.badge.category,
        rarity: p.badge.rarity,
        current: p.current,
        target: p.target,
        percentage: p.percentage,
      })),
    };
  });

/**
 * Record activity (called after analysis/story/coloring creation)
 */
export const recordActivityProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['analysis', 'story', 'coloring']),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info(`[recordActivity] Recording ${input.type} activity for user:`, userId);

    await BadgeService.recordActivity(userId, input.type);

    // Check for new badges after recording activity
    const result = await BadgeService.checkAndAwardBadges(userId);

    return {
      newBadges: result.newBadges.map(b => ({
        id: b.badgeId,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        category: b.badge.category,
        rarity: b.badge.rarity,
        unlockedAt: b.unlockedAt.toISOString(),
      })),
    };
  });

/**
 * Badges Router
 */
export const badgesRouter = createTRPCRouter({
  getUserBadges: getUserBadgesProcedure,
  checkBadges: checkBadgesProcedure,
  getBadgeProgress: getBadgeProgressProcedure,
  recordActivity: recordActivityProcedure,
});
