import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const getAnalysisInputSchema = z.object({
  analysisId: z.string().uuid(),
});

export const getAnalysisProcedure = protectedProcedure
  .input(getAnalysisInputSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[getAnalysis] Fetching analysis:', input.analysisId);

    const supabase = await getSecureClient(ctx);

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', input.analysisId)
      .eq('user_id', userId) // SECURITY: Verify ownership
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Analiz bulunamadı veya erişim yetkiniz yok',
        });
      }
      logger.error('[getAnalysis] Error:', error);
      throw new Error(error.message);
    }

    logger.info('[getAnalysis] Analysis found');
    return data;
  });
