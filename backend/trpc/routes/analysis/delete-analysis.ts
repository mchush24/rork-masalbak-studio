import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const deleteAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
});

export const deleteAnalysisProcedure = protectedProcedure
  .input(deleteAnalysisInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[deleteAnalysis] Deleting analysis:', input.analysisId);

    const supabase = await getSecureClient(ctx);

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', input.analysisId)
      .eq('user_id', userId); // SECURITY: Verify ownership

    if (error) {
      logger.error('[deleteAnalysis] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Analiz silinirken bir hata oluştu',
      });
    }

    logger.info('[deleteAnalysis] Analysis deleted successfully');
    return { success: true };
  });
