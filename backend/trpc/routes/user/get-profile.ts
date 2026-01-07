import { protectedProcedure } from "../../create-context";
import { getSecureClient } from "../../../lib/supabase-secure";

export const getProfileProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[getProfile] Fetching profile:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[getProfile] Error:", error);
      throw new Error(error.message);
    }

    console.log("[getProfile] Profile found:", data?.email);
    return data;
  });
