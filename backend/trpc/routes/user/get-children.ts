import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { getSecureClient } from "../../../lib/supabase-secure.js";

export const getChildrenProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[getChildren] Fetching children for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("users")
      .select("children")
      .eq("id", userId)
      .single();

    if (error) {
      logger.error("[getChildren] Error:", error);
      throw new Error(error.message);
    }

    logger.info("[getChildren] Children found:", data?.children?.length || 0);

    // Return children array or empty array if null
    return data?.children || [];
  });
