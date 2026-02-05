/**
 * React Query Client Configuration
 *
 * Optimized cache settings for different query types
 * Includes offline support and error handling
 */

import { QueryClient, QueryClientConfig, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, AppStateStatus, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// ============================================
// Cache Time Constants (in milliseconds)
// ============================================

export const CACHE_TIMES = {
  /** Data that rarely changes (user profile, settings) */
  STATIC: 1000 * 60 * 60, // 1 hour

  /** Data that changes occasionally (analysis history) */
  SEMI_STATIC: 1000 * 60 * 15, // 15 minutes

  /** Data that changes frequently (notifications, feed) */
  DYNAMIC: 1000 * 60 * 5, // 5 minutes

  /** Real-time data (chat messages, live updates) */
  REAL_TIME: 1000 * 30, // 30 seconds

  /** Garbage collection time */
  GC_TIME: 1000 * 60 * 30, // 30 minutes
} as const;

// ============================================
// Retry Configuration
// ============================================

export const RETRY_CONFIG = {
  /** Number of retry attempts */
  retries: 3,

  /** Base delay between retries (exponential backoff) */
  baseDelay: 1000,

  /** Maximum delay between retries */
  maxDelay: 30000,

  /** Calculate delay with exponential backoff */
  getDelay: (attempt: number): number => {
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
      RETRY_CONFIG.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  },

  /** Determine if error should be retried */
  shouldRetry: (error: unknown, attempt: number): boolean => {
    if (attempt >= RETRY_CONFIG.retries) return false;

    // Don't retry client errors (4xx)
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      if (status >= 400 && status < 500) return false;
    }

    // Don't retry network errors in offline mode
    if (!onlineManager.isOnline()) return false;

    return true;
  },
} as const;

// ============================================
// Query Client Factory
// ============================================

/**
 * Create optimized QueryClient with best practices
 */
export function createOptimizedQueryClient(): QueryClient {
  const config: QueryClientConfig = {
    defaultOptions: {
      queries: {
        // Cache configuration
        staleTime: CACHE_TIMES.DYNAMIC,
        gcTime: CACHE_TIMES.GC_TIME,

        // Retry configuration
        retry: (failureCount, error) =>
          RETRY_CONFIG.shouldRetry(error, failureCount),
        retryDelay: RETRY_CONFIG.getDelay,

        // Refetch configuration
        refetchOnMount: true,
        refetchOnWindowFocus: Platform.OS === 'web',
        refetchOnReconnect: true,

        // Network mode - fetch only when online
        networkMode: 'offlineFirst',

        // Structure sharing for performance
        structuralSharing: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,

        // Network mode
        networkMode: 'offlineFirst',
      },
    },
  };

  return new QueryClient(config);
}

// ============================================
// Query Key Factories
// ============================================

/**
 * Standardized query key factories for type-safe cache management
 */
export const queryKeys = {
  // User related
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
    children: () => [...queryKeys.user.all, 'children'] as const,
    child: (id: string) => [...queryKeys.user.children(), id] as const,
  },

  // Analysis related
  analysis: {
    all: ['analysis'] as const,
    lists: () => [...queryKeys.analysis.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.analysis.lists(), filters] as const,
    details: () => [...queryKeys.analysis.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.analysis.details(), id] as const,
  },

  // Stories related
  stories: {
    all: ['stories'] as const,
    lists: () => [...queryKeys.stories.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.stories.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.stories.all, 'detail', id] as const,
  },

  // Chat related
  chat: {
    all: ['chat'] as const,
    messages: (conversationId: string) =>
      [...queryKeys.chat.all, 'messages', conversationId] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
  },

  // Feed related
  feed: {
    all: ['feed'] as const,
    posts: (filters?: Record<string, unknown>) =>
      [...queryKeys.feed.all, 'posts', filters] as const,
    post: (id: string) => [...queryKeys.feed.all, 'post', id] as const,
  },
} as const;

// ============================================
// Cache Invalidation Helpers
// ============================================

/**
 * Invalidate all user-related queries
 */
export function invalidateUserQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
}

/**
 * Invalidate all analysis queries
 */
export function invalidateAnalysisQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.analysis.all });
}

/**
 * Clear all cache (for logout)
 */
export function clearAllCache(queryClient: QueryClient): void {
  queryClient.clear();
}

/**
 * Prefetch user profile for faster navigation
 */
export async function prefetchUserProfile(
  queryClient: QueryClient,
  fetchFn: () => Promise<unknown>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchFn,
    staleTime: CACHE_TIMES.STATIC,
  });
}

// ============================================
// Platform-specific Configuration
// ============================================

/**
 * Setup focus management for React Native
 */
export function setupFocusManager(): () => void {
  const handleAppStateChange = (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
  };
}

/**
 * Setup online manager for React Native
 */
export function setupOnlineManager(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    onlineManager.setOnline(
      state.isConnected !== null && state.isConnected && Boolean(state.isInternetReachable)
    );
  });

  return unsubscribe;
}

/**
 * Initialize all React Query platform integrations
 */
export function initializeQueryIntegrations(): () => void {
  const cleanupFocus = setupFocusManager();
  const cleanupOnline = setupOnlineManager();

  return () => {
    cleanupFocus();
    cleanupOnline();
  };
}
