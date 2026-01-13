import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure.js";
import { TRPCError } from "@trpc/server";

const updateAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
  favorited: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  childName: z.string().optional(),
});

export const updateAnalysisProcedure = protectedProcedure
  .input(updateAnalysisInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[updateAnalysis] Updating analysis:", input.analysisId);

    const supabase = getSecureClient(ctx);

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
      .eq("user_id", userId) // SECURITY: Verify ownership
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Analiz bulunamadı veya güncelleme yetkiniz yok",
        });
      }
      logger.error("[updateAnalysis] Error:", error);
      throw new Error(error.message);
    }

    logger.info("[updateAnalysis] Analysis updated successfully");
    return data;
  });
