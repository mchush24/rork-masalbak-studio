import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";
import { TRPCError } from "@trpc/server";

const deleteAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
});

export const deleteAnalysisProcedure = protectedProcedure
  .input(deleteAnalysisInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[deleteAnalysis] Deleting analysis:", input.analysisId);

    const supabase = getSecureClient(ctx);

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", input.analysisId)
      .eq("user_id", userId); // SECURITY: Verify ownership

    if (error) {
      console.error("[deleteAnalysis] Error:", error);
      throw new Error(error.message);
    }

    console.log("[deleteAnalysis] Analysis deleted successfully");
    return { success: true };
  });
