/**
 * Simple in-memory TTL cache for frequently accessed data.
 * Reduces database queries for data that changes infrequently.
 */

import { logger } from './utils.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly name: string;
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(name: string, defaultTTLMs: number, maxSize = 100) {
    this.name = name;
    this.defaultTTL = defaultTTLMs;
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T, ttlMs?: number): void {
    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
    });
  }

  /**
   * Get cached data or fetch it if not cached/expired
   */
  async getOrFetch(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      logger.debug(`[Cache:${this.name}] HIT: ${key}`);
      return cached;
    }

    logger.debug(`[Cache:${this.name}] MISS: ${key}`);
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// ============================================
// Pre-configured cache instances
// ============================================

/** Daily tips cache - refreshes every 1 hour */
export const dailyTipCache = new TTLCache<unknown>('DailyTip', 60 * 60 * 1000);

/** Discover feed cache - refreshes every 5 minutes */
export const discoverFeedCache = new TTLCache<unknown>('DiscoverFeed', 5 * 60 * 1000);

/** Expert tips cache - refreshes every 1 hour */
export const expertTipsCache = new TTLCache<unknown>('ExpertTips', 60 * 60 * 1000);
