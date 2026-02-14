import { z } from 'zod';
import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

export const registerPushTokenProcedure = protectedProcedure
  .input(
    z.object({
      pushToken: z.string().min(1),
      platform: z.enum(['ios', 'android', 'web']),
      deviceId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info(`[PushToken] Registering token for user ${userId} (${input.platform})`);

    const supabase = await getSecureClient(ctx);

    const { error } = await supabase.from('user_push_tokens').upsert(
      {
        user_id: userId,
        push_token: input.pushToken,
        platform: input.platform,
        device_id: input.deviceId || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,push_token' }
    );

    if (error) {
      logger.error('[PushToken] Register error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Push token kaydedilemedi',
      });
    }

    logger.info(`[PushToken] Token registered for user ${userId}`);
    return { success: true };
  });

export const unregisterPushTokenProcedure = protectedProcedure
  .input(
    z.object({
      pushToken: z.string().min(1),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info(`[PushToken] Unregistering token for user ${userId}`);

    const supabase = await getSecureClient(ctx);

    const { error } = await supabase
      .from('user_push_tokens')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('push_token', input.pushToken);

    if (error) {
      logger.error('[PushToken] Unregister error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Push token kaldırılamadı',
      });
    }

    logger.info(`[PushToken] Token unregistered for user ${userId}`);
    return { success: true };
  });
