/**
 * tRPC Token-Based Quota Enforcement Middleware
 * Enforces monthly token quotas based on subscription tier
 *
 * Token costs per action:
 * - Analysis:          10 tokens
 * - Storybook:         15 tokens
 * - Interactive Story: 15 tokens
 * - Coloring:           8 tokens
 * - Chatbot message:    2 tokens
 *
 * Token limits per tier:
 * - Free:    50 tokens/month
 * - Pro:     500 tokens/month
 * - Premium: unlimited
 *
 * Features:
 * - Lazy monthly reset (resets when quota_reset_at has passed)
 * - Factory pattern: createTokenMiddleware(actionType)
 * - Turkish error messages with remaining token info
 * - DB triggers handle token deduction on INSERT (analyses/storybooks/colorings)
 */
import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from '../create-context.js';
import { supa } from '../../lib/supabase.js';
import { logger } from '../../lib/utils.js';

const t = initTRPC.context<Context>().create();

// =============================================================================
// Token Configuration
// =============================================================================

type ActionType = 'analysis' | 'storybook' | 'coloring' | 'chatbot';
type SubscriptionTier = 'free' | 'pro' | 'premium';

const TOKEN_COSTS: Record<ActionType, number> = {
  analysis: 10,
  storybook: 15,
  coloring: 8,
  chatbot: 2,
};

const TOKEN_LIMITS: Record<SubscriptionTier, number> = {
  free: 50,
  pro: 500,
  premium: Infinity,
};

const ACTION_NAMES_TR: Record<ActionType, string> = {
  analysis: 'analiz',
  storybook: 'masal',
  coloring: 'boyama',
  chatbot: 'sohbet',
};

// =============================================================================
// Quota Helper
// =============================================================================

interface QuotaInfo {
  tier: SubscriptionTier;
  tokensUsed: number;
  tokenLimit: number;
  quotaResetAt: Date;
  wasReset: boolean;
}

/**
 * Fetch user token quota info with lazy monthly reset.
 * If quota_reset_at has passed, resets tokens to 0 and advances reset date.
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
  const tokenLimit = TOKEN_LIMITS[tier];
  const now = new Date();
  const resetAt = user.quota_reset_at ? new Date(user.quota_reset_at) : now;
  let tokensUsed = ((user.quota_used as Record<string, number>)?.tokens ?? 0) as number;
  let wasReset = false;

  // Lazy reset: if the reset date has passed, zero out and advance by 1 month
  if (resetAt <= now) {
    tokensUsed = 0;
    const newResetAt = new Date(now);
    newResetAt.setMonth(newResetAt.getMonth() + 1);

    const { error: updateError } = await supa
      .from('users')
      .update({
        quota_used: { tokens: 0 },
        quota_reset_at: newResetAt.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('[Quota] Failed to reset quota:', updateError);
    } else {
      wasReset = true;
      logger.info(`[Quota] Monthly token reset for user ${userId}`);
    }

    return { tier, tokensUsed, tokenLimit, quotaResetAt: newResetAt, wasReset };
  }

  return { tier, tokensUsed, tokenLimit, quotaResetAt: resetAt, wasReset };
}

// =============================================================================
// Middleware Factory
// =============================================================================

function createTokenMiddleware(actionType: ActionType) {
  const cost = TOKEN_COSTS[actionType];

  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Bu işlem için giriş yapmanız gerekiyor',
      });
    }

    const { tier, tokensUsed, tokenLimit } = await getUserQuotaInfo(ctx.userId);
    const actionNameTr = ACTION_NAMES_TR[actionType];

    // Premium has unlimited
    if (tokenLimit === Infinity) {
      logger.debug(`[Quota] Premium user ${ctx.userId} - unlimited tokens`);
      return next();
    }

    const remaining = tokenLimit - tokensUsed;

    if (remaining < cost) {
      logger.info(
        `[Quota] User ${ctx.userId} (${tier}) insufficient tokens for ${actionType}: ${tokensUsed}/${tokenLimit}, need ${cost}`
      );
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          `Bu ${actionNameTr} işlemi ${cost} jeton gerektirir, ${remaining} jetonunuz kaldı. ` +
          `Daha fazla jeton için aboneliğinizi yükseltin.`,
        cause: {
          quotaExceeded: true,
          actionType,
          cost,
          tokensUsed,
          tokenLimit,
          remaining,
          tier,
        },
      });
    }

    logger.debug(
      `[Quota] User ${ctx.userId} (${tier}): ${actionType} costs ${cost}, ${remaining} tokens remaining`
    );

    return next();
  });
}

// =============================================================================
// Exported Middlewares
// =============================================================================

export const analysisQuota = createTokenMiddleware('analysis');
export const storybookQuota = createTokenMiddleware('storybook');
export const coloringQuota = createTokenMiddleware('coloring');
export const chatbotQuota = createTokenMiddleware('chatbot');

// Export helpers
export { getUserQuotaInfo, TOKEN_COSTS, TOKEN_LIMITS };
export type { ActionType, SubscriptionTier, QuotaInfo };
