import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";

const getStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

export const getStorybookProcedure = protectedProcedure
  .input(getStorybookInputSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log("[getStorybook] Fetching storybook:", input.storybookId, "for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("storybooks")
      .select("*")
      .eq("id", input.storybookId)
      .eq("user_id_fk", userId)
      .single();

    if (error) {
      console.error("[getStorybook] Error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      console.error("[getStorybook] Storybook not found or access denied");
      throw new Error("Storybook not found or you don't have access");
    }

    console.log("[getStorybook] Storybook found successfully");
    return data;
  });
