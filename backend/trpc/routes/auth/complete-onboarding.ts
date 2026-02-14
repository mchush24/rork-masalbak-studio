import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const completeOnboardingResponseSchema = z.object({
  success: z.boolean(),
});

export const completeOnboardingProcedure = protectedProcedure
  .output(completeOnboardingResponseSchema)
  .mutation(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[Auth] ✅ Completing onboarding for user:', userId);

    const supabase = await getSecureClient(ctx);

    try {
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      if (error) {
        logger.error('[Auth] ❌ Error completing onboarding:', error);
        logger.error('[Auth] ❌ DB Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kurulum tamamlanamadı. Lütfen tekrar deneyin.',
        });
      }

      logger.info('[Auth] ✅ Onboarding completed successfully');

      return { success: true };
    } catch (error) {
      logger.error('[Auth] ❌ Onboarding error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      });
    }
  });
