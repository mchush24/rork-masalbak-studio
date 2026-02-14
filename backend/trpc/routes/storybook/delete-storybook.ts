import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const deleteStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

export const deleteStorybookProcedure = protectedProcedure
  .input(deleteStorybookInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[deleteStorybook] Deleting storybook:', input.storybookId, 'for user:', userId);

    const supabase = await getSecureClient(ctx);

    const { error } = await supabase
      .from('storybooks')
      .delete()
      .eq('id', input.storybookId)
      .eq('user_id_fk', userId); // SECURITY: Verify ownership

    if (error) {
      logger.error('[deleteStorybook] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Masal silinirken bir hata oluştu',
      });
    }

    logger.info('[deleteStorybook] Storybook deleted successfully');
    return { success: true };
  });
