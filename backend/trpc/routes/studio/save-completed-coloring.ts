import { logger } from '../../../lib/utils.js';
/**
 * Save Completed Coloring
 *
 * Saves a user's completed coloring with the colored image
 */

import { z } from 'zod';
import { protectedProcedure } from '../../create-context.js';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { BadgeService } from '../../../lib/badge-service.js';
import { TRPCError } from '@trpc/server';

export const saveCompletedColoringProcedure = protectedProcedure
  .input(
    z.object({
      coloringId: z.string().uuid(),
      completedImageData: z.string().max(10_000_000), // Base64 image data with data:image/png;base64, prefix
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    const { coloringId, completedImageData } = input;

    logger.info(`[SaveCompletedColoring] User ${userId} saving coloring ${coloringId}`);

    const supabase = await getSecureClient(ctx);

    // 1. Verify the coloring belongs to this user
    const { data: coloring, error: fetchError } = await supabase
      .from('colorings')
      .select('*')
      .eq('id', coloringId)
      .eq('user_id_fk', userId)
      .single();

    if (fetchError || !coloring) {
      logger.error('[SaveCompletedColoring] Coloring not found or access denied:', fetchError);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Boyama bulunamadı veya erişim yetkiniz yok',
      });
    }

    // 2. Upload the completed image to Supabase storage
    try {
      // Extract base64 data
      const base64Data = completedImageData.split(',')[1] || completedImageData;
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const filename = `images/completed_coloring_${coloringId}_${Date.now()}.png`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'renkioo')
        .upload(filename, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        logger.error('[SaveCompletedColoring] Upload error:', uploadError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Boyama görseli yüklenirken bir hata oluştu',
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'renkioo')
        .getPublicUrl(filename);

      const completedImageUrl = urlData.publicUrl;

      logger.info('[SaveCompletedColoring] Image uploaded:', completedImageUrl);

      // 3. Update the coloring record
      const { data: updatedColoring, error: updateError } = await supabase
        .from('colorings')
        .update({
          completed_image_url: completedImageUrl,
          is_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', coloringId)
        .eq('user_id_fk', userId)
        .select()
        .single();

      if (updateError) {
        logger.error('[SaveCompletedColoring] Update error:', updateError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Boyama kaydı güncellenirken bir hata oluştu',
        });
      }

      logger.info('[SaveCompletedColoring] ✅ Successfully saved completed coloring');

      // Record activity and check badges in background (fire-and-forget with logging)
      const badgeStartTime = Date.now();

      BadgeService.recordActivity(userId, 'coloring')
        .then(() => BadgeService.checkAndAwardBadges(userId))
        .then(() => {
          const duration = Date.now() - badgeStartTime;
          if (duration > 2000) {
            logger.warn(
              '[saveCompletedColoring] Badge check took longer than expected:',
              duration,
              'ms'
            );
          }
        })
        .catch(err => {
          logger.error('[saveCompletedColoring] Badge check error:', err);
          // Badge errors are non-critical - user still gets their coloring saved
        });

      return {
        success: true,
        coloring: updatedColoring,
        completedImageUrl,
      };
    } catch (error) {
      logger.error('[SaveCompletedColoring] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Boyama kaydedilirken bir hata oluştu',
      });
    }
  });
