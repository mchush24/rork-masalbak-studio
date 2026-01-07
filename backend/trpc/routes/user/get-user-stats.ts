import { protectedProcedure } from "../../create-context";
import { getSecureClient } from "../../../lib/supabase-secure";

export const getUserStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[getUserStats] Fetching stats for user:", userId);

    const supabase = getSecureClient(ctx);

    // Use user_id_fk for storybooks and colorings (foreign key column)
    const [storybooksResult, coloringsResult, userResult] = await Promise.all([
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

    const stats = {
      totalStorybooks: storybooksResult.count || 0,
      totalColorings: coloringsResult.count || 0,
      totalAnalyses: (userResult.data?.quota_used as any)?.analyses || 0,
      quotaUsed: userResult.data?.quota_used || { analyses: 0, storybooks: 0, colorings: 0 },
      memberSince: userResult.data?.created_at,
    };

    console.log("[getUserStats] Stats:", stats);
    return stats;
  });
