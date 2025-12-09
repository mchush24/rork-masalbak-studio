import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const deleteStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

export const deleteStorybookProcedure = publicProcedure
  .input(deleteStorybookInputSchema)
  .mutation(async ({ input }) => {
    console.log("[deleteStorybook] Deleting storybook:", input.storybookId);

    const { error } = await supabase
      .from("storybooks")
      .delete()
      .eq("id", input.storybookId);

    if (error) {
      console.error("[deleteStorybook] Error:", error);
      throw new Error(error.message);
    }

    console.log("[deleteStorybook] Storybook deleted successfully");
    return { success: true };
  });
