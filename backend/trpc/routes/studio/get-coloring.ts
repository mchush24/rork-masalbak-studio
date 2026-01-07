import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";

const getColoringInputSchema = z.object({
  coloringId: z.string().uuid(),
});

export const getColoringProcedure = protectedProcedure
  .input(getColoringInputSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log("[getColoring] Fetching coloring:", input.coloringId, "for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("colorings")
      .select("*")
      .eq("id", input.coloringId)
      .eq("user_id_fk", userId)
      .single();

    if (error) {
      console.error("[getColoring] Error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      console.error("[getColoring] Coloring not found or access denied");
      throw new Error("Coloring not found or you don't have access");
    }

    console.log("[getColoring] Coloring found successfully");
    return data;
  });
