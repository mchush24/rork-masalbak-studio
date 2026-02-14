/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ---------------------------------------------------------------------------
// Import the module under test AFTER all mocks are set up
// ---------------------------------------------------------------------------
import { BadgeService } from '../badge-service.js';

// Set env before imports
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

// Mock push notifications (fire-and-forget in badge service)
const mockSendPushNotification = jest.fn().mockResolvedValue(undefined) as jest.MockedFunction<any>;
jest.mock('../push-notifications.js', () => ({
  sendPushNotification: mockSendPushNotification,
}));

// Mock logger to suppress output in tests and allow assertion
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};
jest.mock('../utils.js', () => ({
  logger: mockLogger,
}));

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------
// The badge service uses `supa` (a Proxy) from ./supabase.js. We mock it with
// a `mockFrom` function that returns chainable query builders per table.
// ---------------------------------------------------------------------------
const mockFrom = jest.fn() as jest.MockedFunction<any>;

jest.mock('../supabase.js', () => ({
  supa: { from: mockFrom },
}));

// ---------------------------------------------------------------------------
// Helpers to build chainable Supabase query mocks
// ---------------------------------------------------------------------------

/** A chainable mock that resolves to { data, error, count? } at the terminal call. */
function chainMock(resolvedValue: { data?: any; error?: any; count?: any }) {
  const chain: Record<string, jest.Mock> = {};
  const self = () => chain;

  // Every method returns the same chain object so they can be called in any order.
  for (const method of [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'order',
    'limit',
    'single',
    'maybeSingle',
  ]) {
    chain[method] = jest.fn().mockImplementation(self) as any;
  }

  // Attach the resolved value so that `await` on the chain resolves correctly.
  (chain as any).then = (resolve: any) => resolve(resolvedValue);

  return chain;
}

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------
const TEST_USER_ID = 'user-test-uuid-1234';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BadgeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // getUserBadges
  // =========================================================================
  describe('getUserBadges', () => {
    it('should return mapped user badges from the database', async () => {
      const dbRows = [
        { badge_id: 'first_analysis', unlocked_at: '2026-01-15T10:00:00Z' },
        { badge_id: 'first_story', unlocked_at: '2026-01-16T12:00:00Z' },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return chainMock({ data: dbRows, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.getUserBadges(TEST_USER_ID);

      expect(mockFrom).toHaveBeenCalledWith('user_badges');
      expect(result).toHaveLength(2);
      expect(result[0].badgeId).toBe('first_analysis');
      expect(result[0].badge.name).toBe('\u0130lk \u00C7izgi'); // İlk Çizgi
      expect(result[0].badge.id).toBe('first_analysis');
      expect(result[0].unlockedAt).toBeInstanceOf(Date);
      expect(result[1].badgeId).toBe('first_story');
    });

    it('should filter out badges not found in BADGES definition', async () => {
      const dbRows = [
        { badge_id: 'first_analysis', unlocked_at: '2026-01-15T10:00:00Z' },
        { badge_id: 'non_existent_badge', unlocked_at: '2026-01-16T12:00:00Z' },
      ];

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return chainMock({ data: dbRows, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.getUserBadges(TEST_USER_ID);

      // non_existent_badge should be filtered out (no matching BADGES entry)
      expect(result).toHaveLength(1);
      expect(result[0].badgeId).toBe('first_analysis');
    });

    it('should return empty array on database error', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return chainMock({ data: null, error: { message: 'DB connection error' } });
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.getUserBadges(TEST_USER_ID);

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Error fetching user badges:',
        expect.anything()
      );
    });

    it('should return empty array when data is null', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.getUserBadges(TEST_USER_ID);

      expect(result).toEqual([]);
    });

    it('should not throw even if an unexpected error occurs', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected crash');
      });

      const result = await BadgeService.getUserBadges(TEST_USER_ID);

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Error in getUserBadges:',
        expect.any(Error)
      );
    });
  });

  // =========================================================================
  // recordActivity
  // =========================================================================
  describe('recordActivity', () => {
    it('should insert a new activity row when none exists for today', async () => {
      const insertMock = jest.fn().mockReturnValue(chainMock({ data: null, error: null }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_activity') {
          // First call: SELECT (single) returns no existing row
          const selectChain = chainMock({ data: null, error: { code: 'PGRST116' } });
          // Override insert on subsequent call
          return {
            ...selectChain,
            insert: insertMock,
          };
        }
        // For user_badges (called by checkTimeBadges / checkSpecialDayBadges -> awardBadge)
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordActivity(TEST_USER_ID, 'analysis');

      expect(mockFrom).toHaveBeenCalledWith('user_activity');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: TEST_USER_ID,
          analyses_count: 1,
          stories_count: 0,
          colorings_count: 0,
        })
      );
    });

    it('should update existing activity row when one exists for today', async () => {
      const existingRow = {
        id: 'activity-row-id',
        analyses_count: 2,
        stories_count: 1,
        colorings_count: 0,
      };

      const updateChain = chainMock({ data: null, error: null });
      const updateMock = jest.fn().mockReturnValue(updateChain);

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_activity') {
          const selectChain = chainMock({ data: existingRow, error: null });
          return {
            ...selectChain,
            update: updateMock,
          };
        }
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordActivity(TEST_USER_ID, 'story');

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          stories_count: 2,
        })
      );
    });

    it('should increment the correct counter based on activity type', async () => {
      const existingRow = {
        id: 'activity-row-id',
        analyses_count: 0,
        stories_count: 0,
        colorings_count: 3,
      };

      const updateChain = chainMock({ data: null, error: null });
      const updateMock = jest.fn().mockReturnValue(updateChain);

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_activity') {
          const selectChain = chainMock({ data: existingRow, error: null });
          return {
            ...selectChain,
            update: updateMock,
          };
        }
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordActivity(TEST_USER_ID, 'coloring');

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          colorings_count: 4,
        })
      );
    });

    it('should not throw on database error (catches and logs)', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('DB unavailable');
      });

      // Should NOT throw
      await expect(BadgeService.recordActivity(TEST_USER_ID, 'analysis')).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Error recording activity:',
        expect.any(Error)
      );
    });
  });

  // =========================================================================
  // checkAndAwardBadges
  // =========================================================================
  describe('checkAndAwardBadges', () => {
    /**
     * Helper: set up mockFrom so getUserStats returns controlled values and
     * getUserBadges returns the specified existing badges.
     */
    function setupCheckAndAwardMocks(opts: {
      existingBadgeIds?: string[];
      totalAnalyses?: number;
      totalStories?: number;
      totalColorings?: number;
      uniqueTestTypes?: string[];
      consecutiveDays?: number;
      childrenCount?: number;
      profileComplete?: boolean;
      coloringStats?: Record<string, any> | null;
      upsertResult?: { data: any; error: any };
    }) {
      const {
        existingBadgeIds = [],
        totalAnalyses = 0,
        totalStories = 0,
        totalColorings = 0,
        uniqueTestTypes = [],
        consecutiveDays = 0,
        childrenCount = 0,
        profileComplete = false,
        coloringStats = null,
        upsertResult = { data: [], error: null },
      } = opts;

      // Build user_badges DB rows for existing badges
      const existingBadgeRows = existingBadgeIds.map(id => ({
        badge_id: id,
        unlocked_at: '2026-01-01T00:00:00Z',
      }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          // getUserBadges SELECT and upsert both go through user_badges.
          // We chain the mock so that select returns existing badges, upsert returns insert result.
          const chain = chainMock({ data: existingBadgeRows, error: null });
          chain.upsert = jest.fn().mockReturnValue(chainMock(upsertResult)) as any;
          chain.insert = jest.fn().mockReturnValue(chainMock({ data: null, error: null })) as any;
          return chain;
        }

        if (table === 'analyses') {
          // Called twice in getUserStats: once for count, once for task_type select
          const chain = chainMock({
            data: uniqueTestTypes.map(t => ({ task_type: t })),
            error: null,
            count: totalAnalyses,
          });
          return chain;
        }

        if (table === 'storybooks') {
          return chainMock({ data: null, error: null, count: totalStories });
        }

        if (table === 'colorings') {
          return chainMock({ data: null, error: null, count: totalColorings });
        }

        if (table === 'users') {
          const children = Array(childrenCount).fill({ name: 'child' });
          return chainMock({
            data: {
              name: profileComplete ? 'Test User' : null,
              children,
              current_streak: consecutiveDays,
            },
            error: null,
          });
        }

        if (table === 'user_coloring_stats') {
          return chainMock({ data: coloringStats, error: null });
        }

        return chainMock({ data: null, error: null });
      });
    }

    it('should return empty newBadges when no new badges are earned', async () => {
      setupCheckAndAwardMocks({
        existingBadgeIds: [],
        totalAnalyses: 0,
        totalStories: 0,
        totalColorings: 0,
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      expect(result.newBadges).toEqual([]);
    });

    it('should award first_analysis badge when user has 1+ analyses', async () => {
      const upsertResult = {
        data: [{ badge_id: 'first_analysis' }],
        error: null,
      };

      setupCheckAndAwardMocks({
        existingBadgeIds: [],
        totalAnalyses: 1,
        totalStories: 0,
        totalColorings: 0,
        upsertResult,
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      // Should have awarded first_analysis (and potentially others)
      const firstAnalysisBadge = result.newBadges.find(b => b.badgeId === 'first_analysis');
      expect(firstAnalysisBadge).toBeDefined();
      expect(firstAnalysisBadge!.badge.id).toBe('first_analysis');
    });

    it('should not re-award badges the user already has', async () => {
      setupCheckAndAwardMocks({
        existingBadgeIds: ['first_analysis'],
        totalAnalyses: 5,
        totalStories: 0,
        totalColorings: 0,
        upsertResult: { data: [{ badge_id: 'analysis_5' }], error: null },
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      // first_analysis should NOT be in newBadges (already owned)
      const reAwarded = result.newBadges.find(b => b.badgeId === 'first_analysis');
      expect(reAwarded).toBeUndefined();

      // allBadges should include both existing and new
      const allIds = result.allBadges.map(b => b.badgeId);
      expect(allIds).toContain('first_analysis');
    });

    it('should award multiple badges at once when multiple criteria are met', async () => {
      const upsertResult = {
        data: [
          { badge_id: 'first_analysis' },
          { badge_id: 'first_story' },
          { badge_id: 'first_coloring' },
          { badge_id: 'first_child' },
          { badge_id: 'profile_complete' },
        ],
        error: null,
      };

      setupCheckAndAwardMocks({
        existingBadgeIds: [],
        totalAnalyses: 1,
        totalStories: 1,
        totalColorings: 1,
        childrenCount: 1,
        profileComplete: true,
        upsertResult,
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      const newIds = result.newBadges.map(b => b.badgeId);
      expect(newIds).toContain('first_analysis');
      expect(newIds).toContain('first_story');
      expect(newIds).toContain('first_coloring');
      expect(newIds).toContain('first_child');
      expect(newIds).toContain('profile_complete');
    });

    it('should send push notifications for each new badge', async () => {
      const upsertResult = {
        data: [{ badge_id: 'first_analysis' }],
        error: null,
      };

      setupCheckAndAwardMocks({
        existingBadgeIds: [],
        totalAnalyses: 1,
        upsertResult,
      });

      await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      expect(mockSendPushNotification).toHaveBeenCalledWith(
        TEST_USER_ID,
        expect.objectContaining({
          title: expect.stringContaining('Rozet'),
          data: expect.objectContaining({ type: 'badge_earned' }),
        })
      );
    });

    it('should handle upsert error gracefully (logs but does not throw)', async () => {
      setupCheckAndAwardMocks({
        existingBadgeIds: [],
        totalAnalyses: 1,
        upsertResult: { data: null, error: { message: 'upsert failed' } },
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      // Should return empty newBadges but NOT throw
      expect(result.newBadges).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Batch badge insert error:',
        expect.anything()
      );
    });

    it('should return empty result and not throw when getUserStats throws', async () => {
      // Make the first mockFrom call throw (will crash getUserBadges or getUserStats)
      mockFrom.mockImplementation(() => {
        throw new Error('Total failure');
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      expect(result).toEqual({ newBadges: [], allBadges: [] });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should check coloring-specific stats for Phase 2 badges', async () => {
      const coloringStats = {
        completed_colorings: 5,
        colors_used_total: 30,
        colors_used_single_max: 8,
        brush_types_used: 4,
        premium_brushes_used: 1,
        ai_suggestions_used: 2,
        harmony_colors_used: 0,
        reference_images_used: 0,
        coloring_streak: 3,
        coloring_time_total: 45,
        quick_colorings: 1,
        marathon_colorings: 0,
        undo_and_continue: 2,
      };

      // The upsert result should contain the badges we expect to be awarded
      const upsertResult = {
        data: [
          { badge_id: 'gallery_starter' }, // completed_colorings >= 5
          { badge_id: 'rainbow_chaser' }, // colors_used_total >= 25
          { badge_id: 'colorful_creation' }, // colors_used_single >= 5
          { badge_id: 'brush_beginner' }, // brush_types_used >= 3
          { badge_id: 'premium_curious' }, // premium_brushes_used >= 1
          { badge_id: 'ai_curious' }, // ai_suggestions_used >= 1
          { badge_id: 'coloring_streak_3' }, // coloring_streak >= 3
          { badge_id: 'time_spent_30' }, // coloring_time_total >= 30
          { badge_id: 'speed_artist' }, // quick_colorings >= 1
          { badge_id: 'never_give_up' }, // undo_and_continue >= 1
          { badge_id: 'first_masterpiece' }, // completed_colorings >= 1
        ],
        error: null,
      };

      setupCheckAndAwardMocks({
        existingBadgeIds: [],
        totalAnalyses: 0,
        totalStories: 0,
        totalColorings: 0,
        coloringStats,
        upsertResult,
      });

      const result = await BadgeService.checkAndAwardBadges(TEST_USER_ID);

      const newIds = result.newBadges.map(b => b.badgeId);
      expect(newIds).toContain('gallery_starter');
      expect(newIds).toContain('rainbow_chaser');
      expect(newIds).toContain('coloring_streak_3');
      expect(newIds).toContain('time_spent_30');
      expect(newIds).toContain('speed_artist');
      expect(newIds).toContain('never_give_up');
    });
  });

  // =========================================================================
  // getBadgeProgress
  // =========================================================================
  describe('getBadgeProgress', () => {
    function setupProgressMocks(opts: {
      existingBadgeIds?: string[];
      totalAnalyses?: number;
      totalStories?: number;
      totalColorings?: number;
      consecutiveDays?: number;
      childrenCount?: number;
      profileComplete?: boolean;
    }) {
      const {
        existingBadgeIds = [],
        totalAnalyses = 0,
        totalStories = 0,
        totalColorings = 0,
        consecutiveDays = 0,
        childrenCount = 0,
        profileComplete = false,
      } = opts;

      const existingBadgeRows = existingBadgeIds.map(id => ({
        badge_id: id,
        unlocked_at: '2026-01-01T00:00:00Z',
      }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return chainMock({ data: existingBadgeRows, error: null });
        }
        if (table === 'analyses') {
          return chainMock({ data: [], error: null, count: totalAnalyses });
        }
        if (table === 'storybooks') {
          return chainMock({ data: null, error: null, count: totalStories });
        }
        if (table === 'colorings') {
          return chainMock({ data: null, error: null, count: totalColorings });
        }
        if (table === 'users') {
          const children = Array(childrenCount).fill({ name: 'child' });
          return chainMock({
            data: {
              name: profileComplete ? 'Test User' : null,
              children,
              current_streak: consecutiveDays,
            },
            error: null,
          });
        }
        if (table === 'user_coloring_stats') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });
    }

    it('should return progress for unearned non-secret badges', async () => {
      setupProgressMocks({
        totalAnalyses: 3,
        totalStories: 0,
        totalColorings: 0,
      });

      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      // Should have progress entries for badges not yet earned
      expect(progress.length).toBeGreaterThan(0);

      // first_analysis (needs 1, user has 3) should NOT be in progress (already completed threshold)
      // analysis_5 (needs 5, user has 3) SHOULD be in progress
      const analysis5 = progress.find(p => p.badge.id === 'analysis_5');
      expect(analysis5).toBeDefined();
      expect(analysis5!.current).toBe(3);
      expect(analysis5!.target).toBe(5);
      expect(analysis5!.percentage).toBe(60);
    });

    it('should exclude already-earned badges from progress', async () => {
      setupProgressMocks({
        existingBadgeIds: ['first_analysis', 'analysis_5'],
        totalAnalyses: 7,
      });

      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      const earnedInProgress = progress.filter(
        p => p.badge.id === 'first_analysis' || p.badge.id === 'analysis_5'
      );
      expect(earnedInProgress).toHaveLength(0);
    });

    it('should exclude secret badges from progress', async () => {
      setupProgressMocks({});

      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      const secretBadges = progress.filter(p => p.badge.isSecret);
      expect(secretBadges).toHaveLength(0);
    });

    it('should sort by percentage descending (closest to completion first)', async () => {
      setupProgressMocks({
        totalAnalyses: 4, // 80% of 5, 40% of 10
        totalStories: 1, // 20% of 5
        totalColorings: 9, // 90% of 10
      });

      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      // Verify sorting: each percentage should be >= next one
      for (let i = 0; i < progress.length - 1; i++) {
        expect(progress[i].percentage).toBeGreaterThanOrEqual(progress[i + 1].percentage);
      }
    });

    it('should exclude badges that are already at or above target (current >= target)', async () => {
      setupProgressMocks({
        totalAnalyses: 5, // exactly meets analysis_5 target
      });

      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      // analysis_5 requires 5, user has 5 => current >= target, so NOT in progress
      const analysis5 = progress.find(p => p.badge.id === 'analysis_5');
      expect(analysis5).toBeUndefined();

      // first_analysis requires 1, user has 5 => NOT in progress either
      const firstAnalysis = progress.find(p => p.badge.id === 'first_analysis');
      expect(firstAnalysis).toBeUndefined();
    });

    it('should calculate profile_complete progress correctly', async () => {
      setupProgressMocks({
        profileComplete: false,
        childrenCount: 0,
      });

      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      const profileBadge = progress.find(p => p.badge.id === 'profile_complete');
      expect(profileBadge).toBeDefined();
      expect(profileBadge!.current).toBe(0);
      expect(profileBadge!.target).toBe(1);
      expect(profileBadge!.percentage).toBe(0);
    });
  });

  // =========================================================================
  // awardBadge
  // =========================================================================
  describe('awardBadge', () => {
    it('should insert a badge row and return true on success', async () => {
      const insertMock = jest.fn().mockReturnValue(chainMock({ data: null, error: null }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return { insert: insertMock };
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.awardBadge(TEST_USER_ID, 'first_analysis');

      expect(result).toBe(true);
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: TEST_USER_ID,
          badge_id: 'first_analysis',
        })
      );
    });

    it('should return false and not throw on duplicate (unique constraint 23505)', async () => {
      const insertMock = jest
        .fn()
        .mockReturnValue(
          chainMock({ data: null, error: { code: '23505', message: 'duplicate key' } })
        );

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return { insert: insertMock };
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.awardBadge(TEST_USER_ID, 'first_analysis');

      expect(result).toBe(false);
      // Should log info, not error, for duplicates
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('already awarded'));
    });

    it('should return false and log error on other database errors', async () => {
      const insertMock = jest
        .fn()
        .mockReturnValue(
          chainMock({ data: null, error: { code: '42P01', message: 'table not found' } })
        );

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return { insert: insertMock };
        }
        return chainMock({ data: null, error: null });
      });

      const result = await BadgeService.awardBadge(TEST_USER_ID, 'first_analysis');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Error awarding badge:',
        expect.anything()
      );
    });

    it('should catch unexpected exceptions and return false', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Catastrophic failure');
      });

      const result = await BadgeService.awardBadge(TEST_USER_ID, 'first_analysis');

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Error in awardBadge:',
        expect.any(Error)
      );
    });
  });

  // =========================================================================
  // Error handling - general resilience
  // =========================================================================
  describe('error handling / resilience', () => {
    it('getUserBadges never throws - returns empty array', async () => {
      mockFrom.mockImplementation(() => {
        throw new TypeError('Cannot read properties of undefined');
      });

      await expect(BadgeService.getUserBadges(TEST_USER_ID)).resolves.toEqual([]);
    });

    it('checkAndAwardBadges never throws - returns empty result', async () => {
      mockFrom.mockImplementation(() => {
        throw new RangeError('Maximum call stack');
      });

      await expect(BadgeService.checkAndAwardBadges(TEST_USER_ID)).resolves.toEqual({
        newBadges: [],
        allBadges: [],
      });
    });

    it('recordActivity never throws - returns void', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Network timeout');
      });

      await expect(BadgeService.recordActivity(TEST_USER_ID, 'analysis')).resolves.toBeUndefined();
    });

    it('awardBadge never throws - returns false', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Socket hang up');
      });

      await expect(BadgeService.awardBadge(TEST_USER_ID, 'any_badge')).resolves.toBe(false);
    });

    it('getBadgeProgress falls back gracefully when getUserStats fails', async () => {
      // getUserBadges will succeed (empty), but getUserStats will fail
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_badges') {
          return chainMock({ data: [], error: null });
        }
        // All other tables (analyses, storybooks, etc.) throw to simulate getUserStats failure
        // But getUserStats has its own try-catch that returns defaults
        throw new Error('Stats fetch failed');
      });

      // getBadgeProgress doesn't have its own try-catch, but getUserStats does.
      // getUserStats returns all-zero defaults on error, so getBadgeProgress should
      // return progress entries with current=0.
      const progress = await BadgeService.getBadgeProgress(TEST_USER_ID);

      // Should still return progress entries (all at 0%)
      expect(progress.length).toBeGreaterThan(0);
      expect(progress.every(p => p.current === 0)).toBe(true);
    });
  });

  // =========================================================================
  // recordColoringActivity
  // =========================================================================
  describe('recordColoringActivity', () => {
    it('should create new stats row when no existing stats', async () => {
      const insertMock = jest.fn().mockReturnValue(chainMock({ data: null, error: null }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_coloring_stats') {
          const selectChain = chainMock({ data: null, error: null });
          return {
            ...selectChain,
            insert: insertMock,
            update: jest.fn().mockReturnValue(chainMock({ data: null, error: null })),
          };
        }
        // For awardBadge calls from checkColoringTimeBadges / updateColoringStreak
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordColoringActivity(TEST_USER_ID, {
        type: 'coloring_completed',
        colorsInSession: 5,
        sessionDuration: 10,
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: TEST_USER_ID,
          completed_colorings: 1,
        })
      );
    });

    it('should update existing stats when row exists', async () => {
      const existingStats = {
        completed_colorings: 3,
        colors_used_single_max: 4,
        quick_colorings: 0,
        marathon_colorings: 0,
      };

      const updateMock = jest.fn().mockReturnValue(chainMock({ data: null, error: null }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_coloring_stats') {
          const selectChain = chainMock({ data: existingStats, error: null });
          return {
            ...selectChain,
            update: updateMock,
            insert: jest.fn().mockReturnValue(chainMock({ data: null, error: null })),
          };
        }
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordColoringActivity(TEST_USER_ID, {
        type: 'coloring_completed',
        colorsInSession: 8,
        sessionDuration: 3, // Under 5 min = quick coloring
      });

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          completed_colorings: 4,
          colors_used_single_max: 8, // 8 > 4, should update
          quick_colorings: 1,
        })
      );
    });

    it('should track brush types including premium brushes', async () => {
      const existingStats = {
        brush_types_array: ['pencil', 'eraser'],
        brush_types_used: 2,
        premium_brushes_array: [],
        premium_brushes_used: 0,
      };

      const updateMock = jest.fn().mockReturnValue(chainMock({ data: null, error: null }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_coloring_stats') {
          const selectChain = chainMock({ data: existingStats, error: null });
          return {
            ...selectChain,
            update: updateMock,
          };
        }
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordColoringActivity(TEST_USER_ID, {
        type: 'brush_used',
        value: 'watercolor', // premium brush
      });

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          brush_types_used: 3,
          premium_brushes_used: 1,
        })
      );
    });

    it('should increment ai_suggestions_used counter', async () => {
      const existingStats = {
        ai_suggestions_used: 5,
      };

      const updateMock = jest.fn().mockReturnValue(chainMock({ data: null, error: null }));

      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_coloring_stats') {
          const selectChain = chainMock({ data: existingStats, error: null });
          return {
            ...selectChain,
            update: updateMock,
          };
        }
        if (table === 'user_badges') {
          return chainMock({ data: null, error: null });
        }
        return chainMock({ data: null, error: null });
      });

      await BadgeService.recordColoringActivity(TEST_USER_ID, {
        type: 'ai_suggestion',
      });

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_suggestions_used: 6,
        })
      );
    });

    it('should not throw on error (catches and logs)', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Connection refused');
      });

      await expect(
        BadgeService.recordColoringActivity(TEST_USER_ID, {
          type: 'coloring_completed',
        })
      ).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[BadgeService] Error recording coloring activity:',
        expect.any(Error)
      );
    });
  });
});
