import { z } from 'zod';
import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { uploadBuffer, supa } from '../../../lib/supabase.js';

const BUCKET = process.env.SUPABASE_BUCKET || 'renkioo';

export const uploadAvatarProcedure = protectedProcedure
  .input(
    z.object({
      imageData: z.string().max(3_000_000), // Base64 with data:image prefix, ~2MB
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info(`[UploadAvatar] User ${userId} uploading avatar`);

    // Extract base64 data
    const base64Data = input.imageData.split(',')[1] || input.imageData;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Upload to storage
    const filename = `avatars/${userId}/avatar_${Date.now()}.png`;
    const avatarUrl = await uploadBuffer(BUCKET, filename, imageBuffer, 'image/png');

    logger.info(`[UploadAvatar] Uploaded: ${avatarUrl}`);

    // Update user profile
    const { error } = await supa.from('users').update({ avatar_url: avatarUrl }).eq('id', userId);

    if (error) {
      logger.error('[UploadAvatar] DB update error:', error);
      throw new Error('Avatar kaydedilemedi');
    }

    logger.info(`[UploadAvatar] Avatar updated for user ${userId}`);
    return { avatarUrl };
  });
