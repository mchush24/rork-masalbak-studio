import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";
import { TRPCError } from "@trpc/server";

const deleteStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

export const deleteStorybookProcedure = protectedProcedure
  .input(deleteStorybookInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[deleteStorybook] Deleting storybook:", input.storybookId, "for user:", userId);

    const supabase = getSecureClient(ctx);

    const { error } = await supabase
      .from("storybooks")
      .delete()
      .eq("id", input.storybookId)
      .eq("user_id_fk", userId); // SECURITY: Verify ownership

    if (error) {
      console.error("[deleteStorybook] Error:", error);
      throw new Error(error.message);
    }

    console.log("[deleteStorybook] Storybook deleted successfully");
    return { success: true };
  });
