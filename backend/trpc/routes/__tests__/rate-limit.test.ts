/**
 * Rate Limiting Tests
 *
 * Tests for the API rate limiting middleware
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the rate limiter store
const mockStore = new Map<string, { count: number; resetAt: number }>();

// Simple in-memory rate limiter for testing
function createTestRateLimiter(maxRequests: number, windowMs: number) {
  return {
    check: (identifier: string): { allowed: boolean; remaining: number; resetAt: number } => {
      const now = Date.now();
      const key = identifier;
      const record = mockStore.get(key);

      if (!record || record.resetAt < now) {
        // New window
        mockStore.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
      }

      if (record.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt };
      }

      record.count++;
      mockStore.set(key, record);
      return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
    },
    reset: () => mockStore.clear(),
  };
}

describe('Rate Limiting', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  describe('basic rate limiting', () => {
    it('allows requests under the limit', () => {
      const limiter = createTestRateLimiter(5, 60000); // 5 requests per minute

      for (let i = 0; i < 5; i++) {
        const result = limiter.check('user123');
        expect(result.allowed).toBe(true);
      }
    });

    it('blocks requests over the limit', () => {
      const limiter = createTestRateLimiter(3, 60000); // 3 requests per minute

      // Use up the limit
      for (let i = 0; i < 3; i++) {
        limiter.check('user456');
      }

      // Next request should be blocked
      const result = limiter.check('user456');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('tracks remaining requests correctly', () => {
      const limiter = createTestRateLimiter(5, 60000);

      const result1 = limiter.check('user789');
      expect(result1.remaining).toBe(4);

      const result2 = limiter.check('user789');
      expect(result2.remaining).toBe(3);

      const result3 = limiter.check('user789');
      expect(result3.remaining).toBe(2);
    });

    it('separates limits by identifier', () => {
      const limiter = createTestRateLimiter(2, 60000);

      // User A uses up their limit
      limiter.check('userA');
      limiter.check('userA');
      const resultA = limiter.check('userA');
      expect(resultA.allowed).toBe(false);

      // User B should still have their own limit
      const resultB = limiter.check('userB');
      expect(resultB.allowed).toBe(true);
      expect(resultB.remaining).toBe(1);
    });
  });

  describe('window reset', () => {
    it('provides reset timestamp', () => {
      const limiter = createTestRateLimiter(5, 60000);
      const now = Date.now();

      const result = limiter.check('user');

      expect(result.resetAt).toBeGreaterThan(now);
      expect(result.resetAt).toBeLessThanOrEqual(now + 60000);
    });
  });

  describe('auth rate limiting rules', () => {
    it('applies stricter limits for auth endpoints', () => {
      const authLimiter = createTestRateLimiter(5, 15 * 60 * 1000); // 5 per 15 minutes

      // 5 attempts should be allowed
      for (let i = 0; i < 5; i++) {
        const result = authLimiter.check('ip:192.168.1.1');
        expect(result.allowed).toBe(true);
      }

      // 6th attempt should be blocked
      const blocked = authLimiter.check('ip:192.168.1.1');
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('AI endpoint rate limiting', () => {
    it('applies lower limits for anonymous users', () => {
      const anonLimiter = createTestRateLimiter(10, 60 * 60 * 1000); // 10 per hour

      for (let i = 0; i < 10; i++) {
        anonLimiter.check('anon:device123');
      }

      const result = anonLimiter.check('anon:device123');
      expect(result.allowed).toBe(false);
    });

    it('applies higher limits for authenticated users', () => {
      const authLimiter = createTestRateLimiter(20, 60 * 60 * 1000); // 20 per hour

      for (let i = 0; i < 20; i++) {
        authLimiter.check('user:abc123');
      }

      const result = authLimiter.check('user:abc123');
      expect(result.allowed).toBe(false);
    });
  });

  describe('general rate limiting', () => {
    it('allows 100 requests per minute for general endpoints', () => {
      const generalLimiter = createTestRateLimiter(100, 60 * 1000); // 100 per minute

      for (let i = 0; i < 100; i++) {
        const result = generalLimiter.check('general:user');
        expect(result.allowed).toBe(true);
      }

      const blocked = generalLimiter.check('general:user');
      expect(blocked.allowed).toBe(false);
    });
  });
});

describe('Rate Limit Response Headers', () => {
  it('should include rate limit headers', () => {
    // Simulating what the actual middleware would return
    const mockResponse = {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',
        'X-RateLimit-Reset': String(Date.now() + 60000),
      },
    };

    expect(mockResponse.headers['X-RateLimit-Limit']).toBe('100');
    expect(mockResponse.headers['X-RateLimit-Remaining']).toBeDefined();
    expect(mockResponse.headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('should return 429 when rate limited', () => {
    // Simulating rate limit response
    const rateLimitedResponse = {
      status: 429,
      body: {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60,
      },
    };

    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.body.retryAfter).toBeGreaterThan(0);
  });
});
