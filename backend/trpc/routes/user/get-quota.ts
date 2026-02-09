import { protectedProcedure } from '../../create-context.js';
import { getUserQuotaInfo, QUOTA_LIMITS } from '../../middleware/quota.js';
import type { ResourceType } from '../../middleware/quota.js';

export const getQuotaProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.userId;
  const { tier, quotaUsed, quotaResetAt } = await getUserQuotaInfo(userId);

  const limits = QUOTA_LIMITS[tier];

  const resources = (Object.keys(limits) as ResourceType[]).map(key => ({
    resource: key,
    used: quotaUsed[key] || 0,
    limit: limits[key] === Infinity ? null : limits[key],
    remaining: limits[key] === Infinity ? null : Math.max(0, limits[key] - (quotaUsed[key] || 0)),
  }));

  return {
    tier,
    resources,
    resetsAt: quotaResetAt.toISOString(),
  };
});
