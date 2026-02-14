/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Token-Based Quota Middleware Tests
 *
 * Tests for:
 * - TOKEN_COSTS and TOKEN_LIMITS constants
 * - getUserQuotaInfo() helper
 * - createTokenMiddleware() factory (via exported middleware instances)
 *   - Allows request when quota sufficient
 *   - Blocks request when quota exceeded (FORBIDDEN)
 *   - Handles user_not_found response (NOT_FOUND)
 *   - Handles monthly reset (was_reset = true)
 *   - Requires authentication (UNAUTHORIZED)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { initTRPC, TRPCError } from '@trpc/server';

// Import after mocks are set up
import {
  TOKEN_COSTS,
  TOKEN_LIMITS,
  getUserQuotaInfo,
  analysisQuota,
  storybookQuota,
  coloringQuota,
  chatbotQuota,
} from '../quota';

// Set test environment variables before imports
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE = 'test-service-role-key';

// Mock superjson to avoid ESM issues
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((v: any) => JSON.stringify(v)),
    parse: jest.fn((v: string) => JSON.parse(v)),
    serialize: jest.fn((v: any) => ({ json: v, meta: undefined })),
    deserialize: jest.fn((v: any) => v.json),
  },
}));

// Mock supabase - rpc for reserveTokens, from for getUserQuotaInfo
const mockRpc = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('../../../lib/supabase', () => ({
  supa: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

// Mock logger to suppress output during tests
jest.mock('../../../lib/utils', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock monitoring to avoid side effects
jest.mock('../../../lib/monitoring', () => ({
  recordRequest: jest.fn(),
}));

// =============================================================================
// Helper: Create a real tRPC caller with the middleware applied
// =============================================================================

const t = initTRPC.context<any>().create();

const testRouter = t.router({
  testAnalysis: t.procedure.use(analysisQuota).query(() => ({ ok: true })),
  testStorybook: t.procedure.use(storybookQuota).query(() => ({ ok: true })),
  testColoring: t.procedure.use(coloringQuota).query(() => ({ ok: true })),
  testChatbot: t.procedure.use(chatbotQuota).query(() => ({ ok: true })),
});

const createCaller = t.createCallerFactory(testRouter);

type ProcedureName = 'testAnalysis' | 'testStorybook' | 'testColoring' | 'testChatbot';

const middlewareMap: Record<string, ProcedureName> = {
  analysis: 'testAnalysis',
  storybook: 'testStorybook',
  coloring: 'testColoring',
  chatbot: 'testChatbot',
};

/**
 * Runs a quota middleware by calling the corresponding test procedure
 * through tRPC's createCallerFactory. This tests the actual middleware
 * behavior without relying on internal tRPC data structures.
 */
async function runMiddleware(
  actionType: string,
  ctx: Record<string, any>
): Promise<{ passed: boolean; error?: TRPCError }> {
  const procedureName = middlewareMap[actionType];
  if (!procedureName) {
    throw new Error(`Unknown action type: ${actionType}`);
  }

  const caller = createCaller(ctx);
  try {
    await caller[procedureName]();
    return { passed: true };
  } catch (err) {
    if (err instanceof TRPCError) {
      return { passed: false, error: err };
    }
    throw err;
  }
}

// =============================================================================
// Tests
// =============================================================================

describe('Quota Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // TOKEN_COSTS
  // ---------------------------------------------------------------------------
  describe('TOKEN_COSTS', () => {
    it('has correct cost for analysis', () => {
      expect(TOKEN_COSTS.analysis).toBe(10);
    });

    it('has correct cost for storybook', () => {
      expect(TOKEN_COSTS.storybook).toBe(15);
    });

    it('has correct cost for coloring', () => {
      expect(TOKEN_COSTS.coloring).toBe(8);
    });

    it('has correct cost for chatbot', () => {
      expect(TOKEN_COSTS.chatbot).toBe(2);
    });

    it('has exactly 4 action types', () => {
      expect(Object.keys(TOKEN_COSTS)).toHaveLength(4);
    });
  });

  // ---------------------------------------------------------------------------
  // TOKEN_LIMITS
  // ---------------------------------------------------------------------------
  describe('TOKEN_LIMITS', () => {
    it('has correct limit for free tier', () => {
      expect(TOKEN_LIMITS.free).toBe(50);
    });

    it('has correct limit for pro tier', () => {
      expect(TOKEN_LIMITS.pro).toBe(500);
    });

    it('has correct limit for premium tier (unlimited)', () => {
      expect(TOKEN_LIMITS.premium).toBe(Infinity);
    });

    it('has exactly 3 subscription tiers', () => {
      expect(Object.keys(TOKEN_LIMITS)).toHaveLength(3);
    });
  });

  // ---------------------------------------------------------------------------
  // getUserQuotaInfo
  // ---------------------------------------------------------------------------
  describe('getUserQuotaInfo', () => {
    it('returns correct quota info for a free user', async () => {
      const resetDate = new Date('2026-03-01T00:00:00Z').toISOString();
      mockSingle.mockResolvedValue({
        data: {
          subscription_tier: 'free',
          quota_used: { tokens: 30 },
          quota_reset_at: resetDate,
        },
        error: null,
      });

      const info = await getUserQuotaInfo('user-123');

      expect(info.tier).toBe('free');
      expect(info.tokensUsed).toBe(30);
      expect(info.tokenLimit).toBe(50);
      expect(info.quotaResetAt).toEqual(new Date(resetDate));
      expect(info.wasReset).toBe(false);

      // Verify supabase query chain
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('subscription_tier, quota_used, quota_reset_at');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockSingle).toHaveBeenCalled();
    });

    it('returns correct quota info for a pro user', async () => {
      mockSingle.mockResolvedValue({
        data: {
          subscription_tier: 'pro',
          quota_used: { tokens: 200 },
          quota_reset_at: new Date('2026-03-01T00:00:00Z').toISOString(),
        },
        error: null,
      });

      const info = await getUserQuotaInfo('user-pro');

      expect(info.tier).toBe('pro');
      expect(info.tokensUsed).toBe(200);
      expect(info.tokenLimit).toBe(500);
    });

    it('returns correct quota info for a premium user', async () => {
      mockSingle.mockResolvedValue({
        data: {
          subscription_tier: 'premium',
          quota_used: { tokens: 999 },
          quota_reset_at: new Date('2026-03-01T00:00:00Z').toISOString(),
        },
        error: null,
      });

      const info = await getUserQuotaInfo('user-premium');

      expect(info.tier).toBe('premium');
      expect(info.tokensUsed).toBe(999);
      expect(info.tokenLimit).toBe(Infinity);
    });

    it('defaults tier to free when subscription_tier is null', async () => {
      mockSingle.mockResolvedValue({
        data: {
          subscription_tier: null,
          quota_used: { tokens: 5 },
          quota_reset_at: null,
        },
        error: null,
      });

      const info = await getUserQuotaInfo('user-no-tier');

      expect(info.tier).toBe('free');
      expect(info.tokenLimit).toBe(50);
    });

    it('defaults tokens to 0 when quota_used has no tokens key', async () => {
      mockSingle.mockResolvedValue({
        data: {
          subscription_tier: 'free',
          quota_used: {},
          quota_reset_at: null,
        },
        error: null,
      });

      const info = await getUserQuotaInfo('user-empty-quota');

      expect(info.tokensUsed).toBe(0);
    });

    it('defaults tokens to 0 when quota_used is null', async () => {
      mockSingle.mockResolvedValue({
        data: {
          subscription_tier: 'free',
          quota_used: null,
          quota_reset_at: null,
        },
        error: null,
      });

      const info = await getUserQuotaInfo('user-null-quota');

      expect(info.tokensUsed).toBe(0);
    });

    it('throws INTERNAL_SERVER_ERROR when supabase returns an error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: '500' },
      });

      await expect(getUserQuotaInfo('user-err')).rejects.toThrow(TRPCError);
      await expect(getUserQuotaInfo('user-err')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Kota bilgileri alınamadı',
      });
    });

    it('throws INTERNAL_SERVER_ERROR when user data is null', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getUserQuotaInfo('user-null')).rejects.toThrow(TRPCError);
      await expect(getUserQuotaInfo('user-null')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // createTokenMiddleware - authentication check
  // ---------------------------------------------------------------------------
  describe('createTokenMiddleware - authentication', () => {
    it('throws UNAUTHORIZED when ctx.userId is null', async () => {
      const result = await runMiddleware('analysis', {
        userId: null,
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error).toBeInstanceOf(TRPCError);
      expect(result.error!.code).toBe('UNAUTHORIZED');
      expect(result.error!.message).toBe('Bu işlem için giriş yapmanız gerekiyor');
    });

    it('throws UNAUTHORIZED when ctx.userId is undefined', async () => {
      const result = await runMiddleware('storybook', {
        userId: undefined,
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('UNAUTHORIZED');
    });
  });

  // ---------------------------------------------------------------------------
  // createTokenMiddleware - quota allowed
  // ---------------------------------------------------------------------------
  describe('createTokenMiddleware - quota allowed', () => {
    it('allows request when analysis quota is sufficient', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: true,
          tokens_used: 20,
          remaining: 20,
          tier: 'free',
          token_limit: 50,
          cost: 10,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('reserve_quota_tokens', {
        p_user_id: 'user-123',
        p_cost: 10, // TOKEN_COSTS.analysis
      });
    });

    it('allows request when storybook quota is sufficient', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: true,
          tokens_used: 30,
          remaining: 455,
          tier: 'pro',
          token_limit: 500,
          cost: 15,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('storybook', {
        userId: 'user-pro',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('reserve_quota_tokens', {
        p_user_id: 'user-pro',
        p_cost: 15, // TOKEN_COSTS.storybook
      });
    });

    it('allows request when coloring quota is sufficient', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: true,
          tokens_used: 8,
          remaining: 34,
          tier: 'free',
          token_limit: 50,
          cost: 8,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('coloring', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('reserve_quota_tokens', {
        p_user_id: 'user-123',
        p_cost: 8, // TOKEN_COSTS.coloring
      });
    });

    it('allows request when chatbot quota is sufficient', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: true,
          tokens_used: 10,
          remaining: 38,
          tier: 'free',
          token_limit: 50,
          cost: 2,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('chatbot', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(true);
      expect(mockRpc).toHaveBeenCalledWith('reserve_quota_tokens', {
        p_user_id: 'user-123',
        p_cost: 2, // TOKEN_COSTS.chatbot
      });
    });
  });

  // ---------------------------------------------------------------------------
  // createTokenMiddleware - quota exceeded (FORBIDDEN)
  // ---------------------------------------------------------------------------
  describe('createTokenMiddleware - quota exceeded', () => {
    it('throws FORBIDDEN when analysis quota is exceeded', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 45,
          remaining: 5,
          tier: 'free',
          token_limit: 50,
          cost: 10,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('FORBIDDEN');
      expect(result.error!.message).toContain('analiz');
      expect(result.error!.message).toContain('10 jeton gerektirir');
      expect(result.error!.message).toContain('5 jetonunuz kaldı');
      expect(result.error!.message).toContain('aboneliğinizi yükseltin');
    });

    it('throws FORBIDDEN when storybook quota is exceeded', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 490,
          remaining: 10,
          tier: 'pro',
          token_limit: 500,
          cost: 15,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('storybook', {
        userId: 'user-pro',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('FORBIDDEN');
      expect(result.error!.message).toContain('masal');
      expect(result.error!.message).toContain('15 jeton gerektirir');
      expect(result.error!.message).toContain('10 jetonunuz kaldı');
    });

    it('throws FORBIDDEN when coloring quota is exceeded', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 48,
          remaining: 2,
          tier: 'free',
          token_limit: 50,
          cost: 8,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('coloring', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('FORBIDDEN');
      expect(result.error!.message).toContain('boyama');
      expect(result.error!.message).toContain('8 jeton gerektirir');
    });

    it('throws FORBIDDEN when chatbot quota is exceeded', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 50,
          remaining: 0,
          tier: 'free',
          token_limit: 50,
          cost: 2,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('chatbot', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('FORBIDDEN');
      expect(result.error!.message).toContain('sohbet');
      expect(result.error!.message).toContain('2 jeton gerektirir');
      expect(result.error!.message).toContain('0 jetonunuz kaldı');
    });

    it('includes quota details in the error cause', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 45,
          remaining: 5,
          tier: 'free',
          token_limit: 50,
          cost: 10,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      const cause = result.error!.cause as any;
      expect(cause).toMatchObject({
        quotaExceeded: true,
        actionType: 'analysis',
        cost: 10,
        tokensUsed: 45,
        tokenLimit: 50,
        remaining: 5,
        tier: 'free',
      });
    });

    it('defaults remaining to 0 when remaining is null', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 50,
          remaining: null,
          tier: 'free',
          token_limit: 50,
          cost: 10,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.message).toContain('0 jetonunuz kaldı');
      expect((result.error!.cause as any).remaining).toBe(0);
    });

    it('defaults tier to free when tier is null in result', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          tokens_used: 50,
          remaining: 0,
          tier: null,
          token_limit: 50,
          cost: 10,
          was_reset: false,
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect((result.error!.cause as any).tier).toBe('free');
    });
  });

  // ---------------------------------------------------------------------------
  // createTokenMiddleware - user_not_found
  // ---------------------------------------------------------------------------
  describe('createTokenMiddleware - user not found', () => {
    it('throws NOT_FOUND when RPC returns user_not_found error', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: false,
          error: 'user_not_found',
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'nonexistent-user',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('NOT_FOUND');
      expect(result.error!.message).toBe('Kullanıcı bulunamadı');
    });
  });

  // ---------------------------------------------------------------------------
  // createTokenMiddleware - monthly reset
  // ---------------------------------------------------------------------------
  describe('createTokenMiddleware - monthly reset', () => {
    it('passes through when was_reset is true (quota was reset)', async () => {
      mockRpc.mockResolvedValue({
        data: {
          allowed: true,
          tokens_used: 10,
          remaining: 40,
          tier: 'free',
          token_limit: 50,
          cost: 10,
          was_reset: true,
        },
        error: null,
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(true);
      // The middleware logs the reset but does not block
    });

    it('logs the monthly reset when was_reset is true', async () => {
      const { logger } = await import('../../../lib/utils');

      mockRpc.mockResolvedValue({
        data: {
          allowed: true,
          tokens_used: 15,
          remaining: 485,
          tier: 'pro',
          token_limit: 500,
          cost: 15,
          was_reset: true,
        },
        error: null,
      });

      await runMiddleware('storybook', {
        userId: 'user-reset',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Monthly token reset for user user-reset')
      );
    });
  });

  // ---------------------------------------------------------------------------
  // createTokenMiddleware - RPC error
  // ---------------------------------------------------------------------------
  describe('createTokenMiddleware - RPC errors', () => {
    it('throws INTERNAL_SERVER_ERROR when RPC call fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'function reserve_quota_tokens does not exist', code: '42883' },
      });

      const result = await runMiddleware('analysis', {
        userId: 'user-123',
        requestId: 'req_test',
        clientIP: '127.0.0.1',
      });

      expect(result.passed).toBe(false);
      expect(result.error!.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error!.message).toBe('Kota kontrolü yapılamadı');
    });
  });

  // ---------------------------------------------------------------------------
  // Exported middleware instances
  // ---------------------------------------------------------------------------
  describe('exported middleware instances', () => {
    it('exports analysisQuota middleware', () => {
      expect(analysisQuota).toBeDefined();
    });

    it('exports storybookQuota middleware', () => {
      expect(storybookQuota).toBeDefined();
    });

    it('exports coloringQuota middleware', () => {
      expect(coloringQuota).toBeDefined();
    });

    it('exports chatbotQuota middleware', () => {
      expect(chatbotQuota).toBeDefined();
    });

    it('each middleware uses the correct token cost', async () => {
      // We verify each middleware passes the correct cost to reserveTokens
      // by checking the p_cost argument in the RPC call
      const testCases = [
        { actionType: 'analysis', expectedCost: 10 },
        { actionType: 'storybook', expectedCost: 15 },
        { actionType: 'coloring', expectedCost: 8 },
        { actionType: 'chatbot', expectedCost: 2 },
      ];

      for (const { actionType, expectedCost } of testCases) {
        mockRpc.mockResolvedValue({
          data: {
            allowed: true,
            tokens_used: expectedCost,
            remaining: 50 - expectedCost,
            tier: 'free',
            token_limit: 50,
            cost: expectedCost,
            was_reset: false,
          },
          error: null,
        });

        await runMiddleware(actionType, {
          userId: 'user-cost-test',
          requestId: 'req_test',
          clientIP: '127.0.0.1',
        });

        expect(mockRpc).toHaveBeenLastCalledWith('reserve_quota_tokens', {
          p_user_id: 'user-cost-test',
          p_cost: expectedCost,
        });
      }
    });
  });
});
