import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { supa } from '../../../lib/supabase.js';

export const getProfileProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.userId; // Get from authenticated context
  logger.info('[getProfile] Fetching profile:', userId);

  const supabase = await getSecureClient(ctx);

  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

  if (error) {
    logger.error('[getProfile] Error:', error);
    throw new Error(error.message);
  }

  // Quota freshness check: lazy reset if quota_reset_at has passed
  if (data?.quota_reset_at) {
    const resetAt = new Date(data.quota_reset_at);
    if (resetAt <= new Date()) {
      const newResetAt = new Date();
      newResetAt.setMonth(newResetAt.getMonth() + 1);
      const freshQuota = { analyses: 0, storybooks: 0, colorings: 0 };

      Promise.resolve(
        supa
          .from('users')
          .update({ quota_used: freshQuota, quota_reset_at: newResetAt.toISOString() })
          .eq('id', userId)
      )
        .then(() => logger.info(`[getProfile] Quota reset for user ${userId}`))
        .catch((err: unknown) => logger.error('[getProfile] Quota reset error:', err));

      // Return fresh data to the client immediately
      data.quota_used = freshQuota;
      data.quota_reset_at = newResetAt.toISOString();
    }
  }

  logger.info('[getProfile] Profile found:', data?.email);
  return data;
});
