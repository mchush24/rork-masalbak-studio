import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const saveAnalysisInputSchema = z.object({
  userId: z.string().uuid(),
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

export const saveAnalysisProcedure = publicProcedure
  .input(saveAnalysisInputSchema)
  .mutation(async ({ input }) => {
    console.log("[saveAnalysis] Saving analysis for user:", input.userId);

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: input.userId,
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
      console.error("[saveAnalysis] Error:", error);
      throw new Error(error.message);
    }

    console.log("[saveAnalysis] Analysis saved successfully:", data.id);
    return data;
  });
