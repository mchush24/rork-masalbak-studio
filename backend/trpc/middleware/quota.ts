/**
 * tRPC Quota Enforcement Middleware
 * Enforces monthly usage quotas based on subscription tier
 *
 * Quota limits per tier:
 * - Free:    5 analyses, 3 storybooks, 5 colorings / month
 * - Pro:     50 analyses, 20 storybooks, 50 colorings / month
 * - Premium: unlimited
 *
 * Features:
 * - Lazy monthly reset (resets quota_used when quota_reset_at has passed)
 * - Factory pattern: createQuotaMiddleware(resourceType)
 * - Turkish error messages with remaining quota info
 */
import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from '../create-context.js';
import { supa } from '../../lib/supabase.js';
import { logger } from '../../lib/utils.js';

const t = initTRPC.context<Context>().create();

// =============================================================================
// Quota Limits Configuration
// =============================================================================

type ResourceType = 'analyses' | 'storybooks' | 'colorings';
type SubscriptionTier = 'free' | 'pro' | 'premium';

const QUOTA_LIMITS: Record<SubscriptionTier, Record<ResourceType, number>> = {
  free: { analyses: 5, storybooks: 3, colorings: 5 },
  pro: { analyses: 50, storybooks: 20, colorings: 50 },
  premium: { analyses: Infinity, storybooks: Infinity, colorings: Infinity },
};

const RESOURCE_NAMES_TR: Record<ResourceType, string> = {
  analyses: 'analiz',
  storybooks: 'masal',
  colorings: 'boyama',
};

// =============================================================================
// Quota Helper
// =============================================================================

interface QuotaInfo {
  tier: SubscriptionTier;
  quotaUsed: Record<ResourceType, number>;
  quotaResetAt: Date;
  wasReset: boolean;
}

/**
 * Fetch user quota info with lazy monthly reset.
 * If quota_reset_at has passed, resets quota_used and advances reset date.
 */
async function getUserQuotaInfo(userId: string): Promise<QuotaInfo> {
  const { data: user, error } = await supa
    .from('users')
    .select('subscription_tier, quota_used, quota_reset_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    logger.error('[Quota] Failed to fetch user quota:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Kota bilgileri alınamadı',
    });
  }

  const tier = (user.subscription_tier || 'free') as SubscriptionTier;
  const now = new Date();
  const resetAt = user.quota_reset_at ? new Date(user.quota_reset_at) : now;
  let quotaUsed = (user.quota_used || {
    analyses: 0,
    storybooks: 0,
    colorings: 0,
  }) as Record<ResourceType, number>;
  let wasReset = false;

  // Lazy reset: if the reset date has passed, zero out and advance by 1 month
  if (resetAt <= now) {
    quotaUsed = { analyses: 0, storybooks: 0, colorings: 0 };
    const newResetAt = new Date(now);
    newResetAt.setMonth(newResetAt.getMonth() + 1);

    const { error: updateError } = await supa
      .from('users')
      .update({
        quota_used: quotaUsed,
        quota_reset_at: newResetAt.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('[Quota] Failed to reset quota:', updateError);
      // Non-fatal: proceed with stale data rather than blocking user
    } else {
      wasReset = true;
      logger.info(`[Quota] Monthly quota reset for user ${userId}`);
    }

    return { tier, quotaUsed, quotaResetAt: newResetAt, wasReset };
  }

  return { tier, quotaUsed, quotaResetAt: resetAt, wasReset };
}

// =============================================================================
// Middleware Factory
// =============================================================================

function createQuotaMiddleware(resourceType: ResourceType) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Bu işlem için giriş yapmanız gerekiyor',
      });
    }

    const { tier, quotaUsed } = await getUserQuotaInfo(ctx.userId);
    const limit = QUOTA_LIMITS[tier][resourceType];
    const used = quotaUsed[resourceType] || 0;
    const resourceNameTr = RESOURCE_NAMES_TR[resourceType];

    // Premium has unlimited
    if (limit === Infinity) {
      logger.debug(`[Quota] Premium user ${ctx.userId} - no limit for ${resourceType}`);
      return next();
    }

    if (used >= limit) {
      const remaining = 0;
      logger.info(
        `[Quota] User ${ctx.userId} (${tier}) exceeded ${resourceType} quota: ${used}/${limit}`
      );
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          `Aylık ${resourceNameTr} kotanız doldu (${used}/${limit}). ` +
          `Daha fazla ${resourceNameTr} için aboneliğinizi yükseltin.`,
        cause: {
          quotaExceeded: true,
          resourceType,
          used,
          limit,
          remaining,
          tier,
        },
      });
    }

    logger.debug(`[Quota] User ${ctx.userId} (${tier}): ${resourceType} ${used}/${limit}`);

    return next();
  });
}

// =============================================================================
// Exported Middlewares
// =============================================================================

export const analysisQuota = createQuotaMiddleware('analyses');
export const storybookQuota = createQuotaMiddleware('storybooks');
export const coloringQuota = createQuotaMiddleware('colorings');

// Export helper for get-quota endpoint
export { getUserQuotaInfo, QUOTA_LIMITS };
export type { ResourceType, SubscriptionTier, QuotaInfo };
