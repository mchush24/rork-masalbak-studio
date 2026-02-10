import { useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';

export function useQuota() {
  const { user } = useAuth();
  const lowQuotaShownRef = useRef(false);

  const { data, isLoading, refetch } = trpc.user.getQuota.useQuery(undefined, {
    enabled: !!user?.userId,
    staleTime: 60_000, // 1 minute
  });

  const tokensUsed = data?.tokensUsed ?? 0;
  const tokenLimit = data?.tokenLimit ?? null; // null = unlimited
  const tokensRemaining = data?.tokensRemaining ?? null;
  const tier = data?.tier ?? 'free';
  const resetsAt = data?.resetsAt ?? null;

  const isLoaded = !isLoading && !!data;

  // Low if remaining < 20% of limit (only for non-unlimited tiers)
  const isLow = tokenLimit != null && tokensRemaining != null && tokensRemaining < tokenLimit * 0.2;

  const isExceeded = tokenLimit != null && tokensRemaining != null && tokensRemaining <= 0;

  // Returns true if this is the first time we're showing low quota warning this session
  const shouldShowLowWarning = () => {
    if (!isLow || lowQuotaShownRef.current) return false;
    lowQuotaShownRef.current = true;
    return true;
  };

  // Days until reset
  const daysUntilReset = resetsAt
    ? Math.max(0, Math.ceil((new Date(resetsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    tokensUsed,
    tokenLimit,
    tokensRemaining,
    tier,
    resetsAt,
    daysUntilReset,
    isLoaded,
    isLoading,
    isLow,
    isExceeded,
    shouldShowLowWarning,
    refetch,
  };
}
