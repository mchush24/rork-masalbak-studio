import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const deleteAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
});

export const deleteAnalysisProcedure = publicProcedure
  .input(deleteAnalysisInputSchema)
  .mutation(async ({ input }) => {
    console.log("[deleteAnalysis] Deleting analysis:", input.analysisId);

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", input.analysisId);

    if (error) {
      console.error("[deleteAnalysis] Error:", error);
      throw new Error(error.message);
    }

    console.log("[deleteAnalysis] Analysis deleted successfully");
    return { success: true };
  });
