import { logger } from "../../../lib/utils.js";
/**
 * Save Completed Coloring
 *
 * Saves a user's completed coloring with the colored image
 */

import { z } from "zod";
import { protectedProcedure } from "../../create-context.js";
import { getSecureClient } from "../../../lib/supabase-secure.js";
import { BadgeService } from "../../../lib/badge-service.js";

export const saveCompletedColoringProcedure = protectedProcedure
  .input(
    z.object({
      coloringId: z.string().uuid(),
      completedImageData: z.string(), // Base64 image data with data:image/png;base64, prefix
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    const { coloringId, completedImageData } = input;

    logger.info(`[SaveCompletedColoring] User ${userId} saving coloring ${coloringId}`);

    const supabase = getSecureClient(ctx);

    // 1. Verify the coloring belongs to this user
    const { data: coloring, error: fetchError } = await supabase
      .from("colorings")
      .select("*")
      .eq("id", coloringId)
      .eq("user_id_fk", userId)
      .single();

    if (fetchError || !coloring) {
      logger.error("[SaveCompletedColoring] Coloring not found or access denied:", fetchError);
      throw new Error("Coloring not found or you don't have permission to update it");
    }

    // 2. Upload the completed image to Supabase storage
    try {
      // Extract base64 data
      const base64Data = completedImageData.split(',')[1] || completedImageData;
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const filename = `images/completed_coloring_${coloringId}_${Date.now()}.png`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(process.env.SUPABASE_BUCKET || "renkioo")
        .upload(filename, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        logger.error("[SaveCompletedColoring] Upload error:", uploadError);
        throw new Error("Failed to upload completed image");
      }

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from(process.env.SUPABASE_BUCKET || "renkioo")
        .getPublicUrl(filename);

      const completedImageUrl = urlData.publicUrl;

      logger.info("[SaveCompletedColoring] Image uploaded:", completedImageUrl);

      // 3. Update the coloring record
      const { data: updatedColoring, error: updateError } = await supabase
        .from("colorings")
        .update({
          completed_image_url: completedImageUrl,
          is_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coloringId)
        .eq("user_id_fk", userId)
        .select()
        .single();

      if (updateError) {
        logger.error("[SaveCompletedColoring] Update error:", updateError);
        throw new Error("Failed to update coloring record");
      }

      logger.info("[SaveCompletedColoring] ✅ Successfully saved completed coloring");

      // Record activity and check badges (don't block on this)
      BadgeService.recordActivity(userId, 'coloring')
        .then(() => BadgeService.checkAndAwardBadges(userId))
        .catch(err => logger.error('[saveCompletedColoring] Badge check error:', err));

      return {
        success: true,
        coloring: updatedColoring,
        completedImageUrl,
      };
    } catch (error) {
      logger.error("[SaveCompletedColoring] Error:", error);
      throw new Error("Failed to save completed coloring");
    }
  });
