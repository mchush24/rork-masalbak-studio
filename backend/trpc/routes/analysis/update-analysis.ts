import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supa as supabase } from "../../../lib/supabase.js";



const updateAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
  favorited: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  childName: z.string().optional(),
});

export const updateAnalysisProcedure = publicProcedure
  .input(updateAnalysisInputSchema)
  .mutation(async ({ input }) => {
    console.log("[updateAnalysis] Updating analysis:", input.analysisId);

    const { analysisId, ...updates } = input;

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.favorited !== undefined) updateData.favorited = updates.favorited;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.childName !== undefined) updateData.child_name = updates.childName;

    const { data, error } = await supabase
      .from("analyses")
      .update(updateData)
      .eq("id", analysisId)
      .select()
      .single();

    if (error) {
      console.error("[updateAnalysis] Error:", error);
      throw new Error(error.message);
    }

    console.log("[updateAnalysis] Analysis updated successfully");
    return data;
  });
