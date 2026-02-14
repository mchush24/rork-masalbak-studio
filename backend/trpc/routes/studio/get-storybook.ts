import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const getStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

export const getStorybookProcedure = protectedProcedure
  .input(getStorybookInputSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info('[getStorybook] Fetching storybook:', input.storybookId, 'for user:', userId);

    const supabase = await getSecureClient(ctx);

    const { data, error } = await supabase
      .from('storybooks')
      .select('*')
      .eq('id', input.storybookId)
      .eq('user_id_fk', userId)
      .single();

    if (error) {
      logger.error('[getStorybook] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Masal verisi alınırken bir hata oluştu',
      });
    }

    if (!data) {
      logger.error('[getStorybook] Storybook not found or access denied');
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Masal bulunamadı veya erişim yetkiniz yok',
      });
    }

    logger.info('[getStorybook] Storybook found successfully');
    return data;
  });
