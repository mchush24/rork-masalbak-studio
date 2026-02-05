/**
 * Query Module
 *
 * React Query configuration and cache management utilities
 *
 * @example
 * import {
 *   createOptimizedQueryClient,
 *   queryKeys,
 *   CACHE_TIMES,
 *   initializeQueryIntegrations,
 * } from '@/lib/query';
 *
 * // Create client
 * const queryClient = createOptimizedQueryClient();
 *
 * // Use standardized query keys
 * const { data } = useQuery({
 *   queryKey: queryKeys.user.profile(),
 *   queryFn: () => api.getUserProfile(),
 * });
 */

export {
  // Configuration
  createOptimizedQueryClient,
  CACHE_TIMES,
  RETRY_CONFIG,

  // Query keys
  queryKeys,

  // Cache helpers
  invalidateUserQueries,
  invalidateAnalysisQueries,
  clearAllCache,
  prefetchUserProfile,

  // Platform integrations
  setupFocusManager,
  setupOnlineManager,
  initializeQueryIntegrations,
} from './queryClientConfig';
