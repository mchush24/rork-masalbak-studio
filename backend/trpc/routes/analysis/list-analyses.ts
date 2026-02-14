import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const listAnalysesInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  taskType: z
    .enum([
      'DAP',
      'HTP',
      'Family',
      'Cactus',
      'Tree',
      'Garden',
      'BenderGestalt2',
      'ReyOsterrieth',
      'Aile',
      'Kaktus',
      'Agac',
      'Bahce',
      'Bender',
      'Rey',
      'Luscher',
      'FreeDrawing',
    ])
    .optional(),
  favoritedOnly: z.boolean().optional(),
  childName: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'child_age']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listAnalysesProcedure = protectedProcedure
  .input(listAnalysesInputSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[listAnalyses] Fetching analyses for user:', userId);

    const supabase = await getSecureClient(ctx);

    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
      .range(input.offset, input.offset + input.limit - 1);

    // Apply filters
    if (input.taskType) {
      query = query.eq('task_type', input.taskType);
    }

    if (input.favoritedOnly) {
      query = query.eq('favorited', true);
    }

    if (input.childName) {
      query = query.ilike('child_name', `%${input.childName}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('[listAnalyses] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Analizler listelenirken bir hata oluştu',
      });
    }

    logger.info('[listAnalyses] Found', count, 'analyses');

    return {
      analyses: data || [],
      total: count || 0,
      hasMore: input.offset + input.limit < (count || 0),
      offset: input.offset,
      limit: input.limit,
    };
  });
