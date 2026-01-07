import { protectedProcedure } from "../../create-context";
import { getSecureClient } from "../../../lib/supabase-secure";

export const getChildrenProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[getChildren] Fetching children for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("users")
      .select("children")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[getChildren] Error:", error);
      throw new Error(error.message);
    }

    console.log("[getChildren] Children found:", data?.children?.length || 0);

    // Return children array or empty array if null
    return data?.children || [];
  });
