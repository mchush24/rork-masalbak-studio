import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';

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
      throw new Error(error.message);
    }

    if (!data) {
      logger.error('[getStorybook] Storybook not found or access denied');
      throw new Error("Storybook not found or you don't have access");
    }

    logger.info('[getStorybook] Storybook found successfully');
    return data;
  });
