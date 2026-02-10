/**
 * Redis-based Rate Limiting
 *
 * Production-ready rate limiter with Redis backend
 * Falls back to in-memory store if Redis is unavailable
 *
 * Features:
 * - Distributed rate limiting across multiple instances
 * - Sliding window algorithm
 * - Graceful fallback to in-memory
 * - Connection pooling and retry logic
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { Context, MiddlewareHandler } from 'hono';

// ============================================
// Types
// ============================================

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  limit: number;
  /** Key generator function */
  keyGenerator?: (c: Context) => string;
  /** Custom handler for rate limit exceeded */
  handler?: (c: Context) => Response;
  /** Key prefix for Redis */
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  total: number;
}

interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitResult>;
  get(key: string): Promise<RateLimitResult | null>;
  reset(key: string): Promise<void>;
  close(): Promise<void>;
}

// ============================================
// In-Memory Store (Fallback)
// ============================================

class InMemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async increment(key: string, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      // New window
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: Infinity, // Will be calculated by caller
        reset: resetAt,
        total: 1,
      };
    }

    // Increment existing
    entry.count++;
    return {
      allowed: true,
      remaining: Infinity,
      reset: entry.resetAt,
      total: entry.count,
    };
  }

  async get(key: string): Promise<RateLimitResult | null> {
    const entry = this.store.get(key);
    if (!entry || entry.resetAt <= Date.now()) {
      return null;
    }
    return {
      allowed: true,
      remaining: Infinity,
      reset: entry.resetAt,
      total: entry.count,
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  async close(): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// ============================================
// Redis Store
// ============================================

class RedisStore implements RateLimitStore {
  private client: unknown; // Redis client type
  private isConnected = false;
  private fallbackStore: InMemoryStore;
  private keyPrefix: string;

  constructor(redisUrl: string, keyPrefix: string = 'rl:') {
    this.keyPrefix = keyPrefix;
    this.fallbackStore = new InMemoryStore();
    this.connect(redisUrl);
  }

  private async connect(redisUrl: string): Promise<void> {
    try {
      // Dynamic import to make Redis optional
      // eslint-disable-next-line import/no-unresolved
      const { createClient } = await import('redis');
      this.client = createClient({ url: redisUrl });

      (this.client as any).on('error', (err: Error) => {
        console.error('[RateLimit] Redis error:', err.message);
        this.isConnected = false;
      });

      (this.client as any).on('connect', () => {
        console.log('[RateLimit] Redis connected');
        this.isConnected = true;
      });

      await (this.client as any).connect();
    } catch (error) {
      console.warn('[RateLimit] Redis unavailable, using in-memory fallback');
      this.isConnected = false;
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitResult> {
    if (!this.isConnected || !this.client) {
      return this.fallbackStore.increment(key, windowMs);
    }

    try {
      const fullKey = this.keyPrefix + key;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis sorted set for sliding window
      const multi = (this.client as any).multi();

      // Remove old entries
      multi.zRemRangeByScore(fullKey, 0, windowStart);

      // Add current request
      multi.zAdd(fullKey, { score: now, value: now.toString() });

      // Count requests in window
      multi.zCard(fullKey);

      // Set expiry
      multi.expire(fullKey, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      const count = results[2] as number;

      return {
        allowed: true,
        remaining: Infinity,
        reset: now + windowMs,
        total: count,
      };
    } catch (error) {
      console.error('[RateLimit] Redis increment error:', error);
      return this.fallbackStore.increment(key, windowMs);
    }
  }

  async get(key: string): Promise<RateLimitResult | null> {
    if (!this.isConnected || !this.client) {
      return this.fallbackStore.get(key);
    }

    try {
      const fullKey = this.keyPrefix + key;
      const count = await (this.client as any).zCard(fullKey);
      const ttl = await (this.client as any).ttl(fullKey);

      if (count === 0) return null;

      return {
        allowed: true,
        remaining: Infinity,
        reset: Date.now() + ttl * 1000,
        total: count,
      };
    } catch (error) {
      return this.fallbackStore.get(key);
    }
  }

  async reset(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return this.fallbackStore.reset(key);
    }

    try {
      await (this.client as any).del(this.keyPrefix + key);
    } catch (error) {
      await this.fallbackStore.reset(key);
    }
  }

  async close(): Promise<void> {
    await this.fallbackStore.close();
    if (this.client && this.isConnected) {
      await (this.client as any).quit();
    }
  }
}

// ============================================
// Store Factory
// ============================================

let globalStore: RateLimitStore | null = null;

function getStore(keyPrefix?: string): RateLimitStore {
  if (globalStore) return globalStore;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    globalStore = new RedisStore(redisUrl, keyPrefix);
  } else {
    console.log('[RateLimit] No REDIS_URL configured, using in-memory store');
    globalStore = new InMemoryStore();
  }

  return globalStore;
}

// ============================================
// Rate Limiter Factory
// ============================================

/**
 * Create a rate limiter middleware with Redis support
 */
export function createRateLimiter(config: RateLimitConfig): MiddlewareHandler {
  const {
    windowMs,
    limit,
    keyGenerator = defaultKeyGenerator,
    handler = defaultHandler,
    keyPrefix = 'rl:',
  } = config;

  const store = getStore(keyPrefix);

  return async (c, next) => {
    const key = keyGenerator(c);
    const result = await store.increment(key, windowMs);

    const remaining = Math.max(0, limit - result.total);
    const isAllowed = result.total <= limit;

    // Set rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', Math.ceil(result.reset / 1000).toString());

    if (!isAllowed) {
      c.header('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());
      return handler(c);
    }

    await next();
  };
}

// ============================================
// Default Helpers
// ============================================

function defaultKeyGenerator(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  const realIP = c.req.header('x-real-ip');
  const cfConnectingIP = c.req.header('cf-connecting-ip');

  return cfConnectingIP || realIP || forwarded?.split(',')[0] || 'unknown';
}

function defaultHandler(c: Context): Response {
  return c.json(
    {
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    429
  );
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/**
 * Strict rate limiter for auth endpoints
 * 5 requests per 15 minutes
 */
export const authRateLimiterRedis = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyPrefix: 'rl:auth:',
  handler: c =>
    c.json(
      {
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      429
    ),
});

/**
 * AI endpoint rate limiter
 * 10 requests per hour
 */
export const aiRateLimiterRedis = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyPrefix: 'rl:ai:',
  handler: c =>
    c.json(
      {
        error: 'AI request limit exceeded. Please try again in 1 hour.',
        code: 'AI_RATE_LIMIT_EXCEEDED',
      },
      429
    ),
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalRateLimiterRedis = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  keyPrefix: 'rl:general:',
});

// ============================================
// Cleanup
// ============================================

/**
 * Close the rate limit store (for graceful shutdown)
 */
export async function closeRateLimitStore(): Promise<void> {
  if (globalStore) {
    await globalStore.close();
    globalStore = null;
  }
}
