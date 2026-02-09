import { protectedProcedure } from '../../create-context.js';
import { getUserQuotaInfo, TOKEN_COSTS, TOKEN_LIMITS } from '../../middleware/quota.js';

export const getQuotaProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.userId;
  const { tier, tokensUsed, tokenLimit, quotaResetAt } = await getUserQuotaInfo(userId);

  return {
    tier,
    tokensUsed,
    tokenLimit: tokenLimit === Infinity ? null : tokenLimit,
    tokensRemaining: tokenLimit === Infinity ? null : Math.max(0, tokenLimit - tokensUsed),
    costs: TOKEN_COSTS,
    allLimits: {
      free: TOKEN_LIMITS.free,
      pro: TOKEN_LIMITS.pro,
      premium: null,
    },
    resetsAt: quotaResetAt.toISOString(),
  };
});
