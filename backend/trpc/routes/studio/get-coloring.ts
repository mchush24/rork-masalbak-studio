import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';

const getColoringInputSchema = z.object({
  coloringId: z.string().uuid(),
});

export const getColoringProcedure = protectedProcedure
  .input(getColoringInputSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info('[getColoring] Fetching coloring:', input.coloringId, 'for user:', userId);

    const supabase = await getSecureClient(ctx);

    const { data, error } = await supabase
      .from('colorings')
      .select('*')
      .eq('id', input.coloringId)
      .eq('user_id_fk', userId)
      .single();

    if (error) {
      logger.error('[getColoring] Error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      logger.error('[getColoring] Coloring not found or access denied');
      throw new Error("Coloring not found or you don't have access");
    }

    logger.info('[getColoring] Coloring found successfully');
    return data;
  });
