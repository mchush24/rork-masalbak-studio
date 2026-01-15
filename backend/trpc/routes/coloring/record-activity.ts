/**
 * Record Coloring Activity - Phase 2 Achievement Tracking
 *
 * Records coloring-specific activities for badge/achievement system:
 * - Coloring completions
 * - Brush usage
 * - Color usage
 * - AI suggestions used
 * - Harmony features used
 * - Reference images used
 * - Session time
 * - Undo usage
 */

import { z } from "zod";
import { protectedProcedure } from "../../create-context.js";
import { BadgeService } from "../../../lib/badge-service.js";

const activityTypeSchema = z.enum([
  'coloring_completed',
  'brush_used',
  'color_used',
  'ai_suggestion',
  'harmony_used',
  'reference_used',
  'undo_used',
  'session_time',
]);

const recordColoringActivityInputSchema = z.object({
  type: activityTypeSchema,
  value: z.union([z.string(), z.number()]).optional(),
  sessionDuration: z.number().optional(), // in minutes
  colorsInSession: z.number().optional(),
});

export const recordColoringActivityProcedure = protectedProcedure
  .input(recordColoringActivityInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    // Record the activity
    await BadgeService.recordColoringActivity(userId, {
      type: input.type,
      value: input.value,
      sessionDuration: input.sessionDuration,
      colorsInSession: input.colorsInSession,
    });

    // Check and award any new badges
    const badgeResult = await BadgeService.checkAndAwardBadges(userId);

    return {
      success: true,
      newBadges: badgeResult.newBadges.map(b => ({
        id: b.badgeId,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        rarity: b.badge.rarity,
      })),
    };
  });

// Get coloring stats for the user
const getColoringStatsInputSchema = z.object({});

export const getColoringStatsProcedure = protectedProcedure
  .input(getColoringStatsInputSchema)
  .query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Get badge progress
    const progress = await BadgeService.getBadgeProgress(userId);

    // Filter to only coloring-related badges
    const coloringCategories = [
      'coloring_master',
      'color_explorer',
      'brush_master',
      'smart_artist',
      'coloring_streak',
      'dedication',
      'session',
      'persistence',
    ];

    const coloringProgress = progress.filter(p =>
      coloringCategories.includes(p.badge.category)
    );

    return {
      progress: coloringProgress.slice(0, 6).map(p => ({
        badge: {
          id: p.badge.id,
          name: p.badge.name,
          description: p.badge.description,
          icon: p.badge.icon,
          category: p.badge.category,
          rarity: p.badge.rarity,
        },
        current: p.current,
        target: p.target,
        percentage: p.percentage,
      })),
    };
  });
