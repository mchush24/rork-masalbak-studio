import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supa as supabase } from "../../../lib/supabase.js";



const getAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
});

export const getAnalysisProcedure = publicProcedure
  .input(getAnalysisInputSchema)
  .query(async ({ input }) => {
    console.log("[getAnalysis] Fetching analysis:", input.analysisId);

    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", input.analysisId)
      .single();

    if (error) {
      console.error("[getAnalysis] Error:", error);
      throw new Error(error.message);
    }

    console.log("[getAnalysis] Analysis found");
    return data;
  });
