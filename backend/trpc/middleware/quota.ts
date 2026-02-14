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
 * - Atomic reservation via DB function (prevents race conditions)
 * - Lazy monthly reset (resets when quota_reset_at has passed)
 * - Factory pattern: createTokenMiddleware(actionType)
 * - Turkish error messages with remaining token info
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
 * Fetch user token quota info (read-only, for display purposes).
 * Does NOT reserve tokens — use reserveTokens() for that.
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
  const tokensUsed = ((user.quota_used as Record<string, number>)?.tokens ?? 0) as number;

  return { tier, tokensUsed, tokenLimit, quotaResetAt: resetAt, wasReset: false };
}

// =============================================================================
// Atomic Token Reservation
// =============================================================================

interface ReservationResult {
  allowed: boolean;
  tokens_used?: number;
  remaining?: number;
  tier?: string;
  token_limit?: number;
  cost?: number;
  was_reset?: boolean;
  error?: string;
}

/**
 * Atomically reserve tokens using DB function with row-level locking.
 * Prevents race conditions where concurrent requests exceed the quota.
 *
 * The DB function (reserve_quota_tokens) does:
 * 1. SELECT ... FOR UPDATE (locks the user row)
 * 2. Checks if enough tokens remain
 * 3. Increments quota_used atomically
 * 4. Returns success/failure with quota details
 */
async function reserveTokens(userId: string, cost: number): Promise<ReservationResult> {
  const { data, error } = await supa.rpc('reserve_quota_tokens', {
    p_user_id: userId,
    p_cost: cost,
  });

  if (error) {
    logger.error('[Quota] reserve_quota_tokens RPC failed:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Kota kontrolü yapılamadı',
    });
  }

  return data as ReservationResult;
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

    const actionNameTr = ACTION_NAMES_TR[actionType];

    // Atomic reservation: check + reserve in one DB transaction
    const result = await reserveTokens(ctx.userId, cost);

    if (result.error === 'user_not_found') {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Kullanıcı bulunamadı',
      });
    }

    if (!result.allowed) {
      const remaining = result.remaining ?? 0;
      const tier = (result.tier || 'free') as SubscriptionTier;

      logger.info(
        `[Quota] User ${ctx.userId} (${tier}) insufficient tokens for ${actionType}: ${result.tokens_used}/${result.token_limit}, need ${cost}`
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
          tokensUsed: result.tokens_used,
          tokenLimit: result.token_limit,
          remaining,
          tier,
        },
      });
    }

    if (result.was_reset) {
      logger.info(`[Quota] Monthly token reset for user ${ctx.userId}`);
    }

    logger.debug(
      `[Quota] User ${ctx.userId} (${result.tier}): ${actionType} reserved ${cost} tokens, ${result.remaining} remaining`
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
