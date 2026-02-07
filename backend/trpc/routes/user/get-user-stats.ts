import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { getSecureClient } from "../../../lib/supabase-secure.js";

export const getUserStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[getUserStats] Fetching stats for user:", userId);

    const supabase = getSecureClient(ctx);

    // Use user_id_fk for storybooks and colorings (foreign key column)
    // Use Promise.allSettled for partial failure recovery
    const results = await Promise.allSettled([
      supabase
        .from("storybooks")
        .select("*", { count: "exact", head: true })
        .eq("user_id_fk", userId),
      supabase
        .from("colorings")
        .select("*", { count: "exact", head: true })
        .eq("user_id_fk", userId),
      supabase
        .from("users")
        .select("quota_used, created_at")
        .eq("id", userId)
        .single(),
    ]);

    // Extract results with fallbacks for failures
    const storybooksResult = results[0].status === 'fulfilled' ? results[0].value : { count: null };
    const coloringsResult = results[1].status === 'fulfilled' ? results[1].value : { count: null };
    const userResult = results[2].status === 'fulfilled' ? results[2].value : { data: null };

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const queryNames = ['storybooks', 'colorings', 'user'];
        logger.warn(`[getUserStats] ${queryNames[index]} query failed:`, result.reason);
      }
    });

    const stats = {
      totalStorybooks: storybooksResult.count || 0,
      totalColorings: coloringsResult.count || 0,
      totalAnalyses: (userResult.data?.quota_used as any)?.analyses || 0,
      quotaUsed: userResult.data?.quota_used || { analyses: 0, storybooks: 0, colorings: 0 },
      memberSince: userResult.data?.created_at,
    };

    logger.info("[getUserStats] Stats:", stats);
    return stats;
  });
