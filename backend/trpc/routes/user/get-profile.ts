import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { getSecureClient } from '../../../lib/supabase-secure.js';

export const getProfileProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.userId; // Get from authenticated context
  logger.info('[getProfile] Fetching profile:', userId);

  const supabase = await getSecureClient(ctx);

  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

  if (error) {
    logger.error('[getProfile] Error:', error);
    throw new Error(error.message);
  }

  logger.info('[getProfile] Profile found:', data?.email);
  return data;
});
