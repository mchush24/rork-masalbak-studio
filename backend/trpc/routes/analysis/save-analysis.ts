import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure.js";

const saveAnalysisInputSchema = z.object({
  taskType: z.enum(["DAP", "HTP", "Family", "Cactus", "Tree", "Garden", "BenderGestalt2", "ReyOsterrieth", "Aile", "Kaktus", "Agac", "Bahce", "Bender", "Rey", "Luscher"]),
  childAge: z.number().optional(),
  childName: z.string().optional(),
  originalImageUrl: z.string().optional(),
  processedImageUrl: z.string().optional(),
  drawingDescription: z.string().optional(),
  childQuote: z.string().optional(),
  analysisResult: z.any(), // JSONB - flexible structure
  aiModel: z.string().optional().default("gpt-4-vision-preview"),
  aiConfidence: z.number().min(0).max(1).optional(),
  processingTimeMs: z.number().optional(),
  language: z.enum(["tr", "en", "ru", "tk", "uz"]).optional().default("tr"),
});

export const saveAnalysisProcedure = protectedProcedure
  .input(saveAnalysisInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[saveAnalysis] Saving analysis for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        task_type: input.taskType,
        child_age: input.childAge,
        child_name: input.childName,
        original_image_url: input.originalImageUrl,
        processed_image_url: input.processedImageUrl,
        drawing_description: input.drawingDescription,
        child_quote: input.childQuote,
        analysis_result: input.analysisResult,
        ai_model: input.aiModel,
        ai_confidence: input.aiConfidence,
        processing_time_ms: input.processingTimeMs,
        language: input.language,
      })
      .select()
      .single();

    if (error) {
      logger.error("[saveAnalysis] Error:", error);
      throw new Error(error.message);
    }

    logger.info("[saveAnalysis] Analysis saved successfully:", data.id);
    return data;
  });
