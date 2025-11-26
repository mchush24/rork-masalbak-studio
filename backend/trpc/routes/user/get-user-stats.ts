import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const getUserStatsInputSchema = z.object({
  userId: z.string().uuid(),
});

export const getUserStatsProcedure = publicProcedure
  .input(getUserStatsInputSchema)
  .query(async ({ input }) => {
    console.log("[getUserStats] Fetching stats for user:", input.userId);

    // For now, we'll use the user_id field in storybooks and colorings
    // Later we'll migrate to user_id_fk
    const [storybooksResult, coloringsResult, userResult] = await Promise.all([
      supabase
        .from("storybooks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", input.userId),
      supabase
        .from("colorings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", input.userId),
      supabase
        .from("users")
        .select("quota_used, created_at")
        .eq("id", input.userId)
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
