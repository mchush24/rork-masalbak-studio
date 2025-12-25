/**
 * Save Completed Coloring
 *
 * Saves a user's completed coloring with the colored image
 */

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { supa as supabase } from "../../../lib/supabase.js";

export const saveCompletedColoringProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
      coloringId: z.string().uuid(),
      completedImageData: z.string(), // Base64 image data with data:image/png;base64, prefix
    })
  )
  .mutation(async ({ input }) => {
    const { userId, coloringId, completedImageData } = input;

    console.log(`[SaveCompletedColoring] User ${userId} saving coloring ${coloringId}`);

    // 1. Verify the coloring belongs to this user
    const { data: coloring, error: fetchError } = await supabase
      .from("colorings")
      .select("*")
      .eq("id", coloringId)
      .eq("user_id_fk", userId)
      .single();

    if (fetchError || !coloring) {
      console.error("[SaveCompletedColoring] Coloring not found or access denied:", fetchError);
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
        console.error("[SaveCompletedColoring] Upload error:", uploadError);
        throw new Error("Failed to upload completed image");
      }

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from(process.env.SUPABASE_BUCKET || "renkioo")
        .getPublicUrl(filename);

      const completedImageUrl = urlData.publicUrl;

      console.log("[SaveCompletedColoring] Image uploaded:", completedImageUrl);

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
        console.error("[SaveCompletedColoring] Update error:", updateError);
        throw new Error("Failed to update coloring record");
      }

      console.log("[SaveCompletedColoring] ✅ Successfully saved completed coloring");

      return {
        success: true,
        coloring: updatedColoring,
        completedImageUrl,
      };
    } catch (error) {
      console.error("[SaveCompletedColoring] Error:", error);
      throw new Error("Failed to save completed coloring");
    }
  });
