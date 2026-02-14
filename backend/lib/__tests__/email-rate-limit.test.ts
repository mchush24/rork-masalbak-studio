/**
 * Email Rate Limiting Tests
 *
 * Tests the per-address, in-memory email rate limiting logic
 * used in backend/lib/email.ts.
 *
 * Since checkEmailRateLimit is a private (non-exported) function,
 * we replicate the exact same pattern here for isolated unit testing.
 * This validates the Map-based sliding-window rate limiter without
 * needing to mock the Resend email service.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// ---------------------------------------------------------------------------
// Replicate the exact rate limiter from backend/lib/email.ts
// ---------------------------------------------------------------------------

const EMAIL_RATE_LIMIT = 5;
const EMAIL_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

let emailRateStore: Map<string, number[]>;

/**
 * Mirrors the private checkEmailRateLimit in email.ts:
 *  - normalizes email to lowercase + trim
 *  - filters timestamps within the window
 *  - throws a Turkish-language error when the limit is exceeded
 *  - pushes the current timestamp on success
 */
function checkEmailRateLimit(email: string, now: number = Date.now()): void {
  const key = email.toLowerCase().trim();
  const timestamps = emailRateStore.get(key) || [];

  // Remove expired entries
  const valid = timestamps.filter(t => now - t < EMAIL_RATE_WINDOW_MS);

  if (valid.length >= EMAIL_RATE_LIMIT) {
    throw new Error('Çok fazla e-posta gönderildi. Lütfen bir süre bekleyin.');
  }

  valid.push(now);
  emailRateStore.set(key, valid);
}

/**
 * Mirrors the cleanup interval logic in email.ts:
 *  - iterates all entries
 *  - removes timestamps outside the window
 *  - deletes entries with no remaining timestamps
 */
function cleanupExpiredEntries(now: number): void {
  for (const [email, timestamps] of emailRateStore.entries()) {
    const valid = timestamps.filter(t => now - t < EMAIL_RATE_WINDOW_MS);
    if (valid.length === 0) {
      emailRateStore.delete(email);
    } else {
      emailRateStore.set(email, valid);
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Email Rate Limiting (checkEmailRateLimit)', () => {
  beforeEach(() => {
    emailRateStore = new Map();
  });

  it('allows the first email for a given address', () => {
    expect(() => checkEmailRateLimit('user@example.com')).not.toThrow();
    expect(emailRateStore.get('user@example.com')?.length).toBe(1);
  });

  it('allows up to 5 emails within the rate window', () => {
    const now = Date.now();

    for (let i = 0; i < EMAIL_RATE_LIMIT; i++) {
      expect(() => checkEmailRateLimit('user@example.com', now + i)).not.toThrow();
    }

    // All 5 timestamps should be stored
    expect(emailRateStore.get('user@example.com')?.length).toBe(5);
  });

  it('blocks the 6th email within the rate window with a Turkish error message', () => {
    const now = Date.now();

    // Send 5 emails (the limit)
    for (let i = 0; i < EMAIL_RATE_LIMIT; i++) {
      checkEmailRateLimit('user@example.com', now + i);
    }

    // The 6th should throw
    expect(() => checkEmailRateLimit('user@example.com', now + EMAIL_RATE_LIMIT)).toThrow(
      'Çok fazla e-posta gönderildi. Lütfen bir süre bekleyin.'
    );
  });

  it('normalizes email to lowercase before rate-checking', () => {
    const now = Date.now();

    // Mixed-case emails should all count toward the same key
    checkEmailRateLimit('User@Example.COM', now);
    checkEmailRateLimit('USER@EXAMPLE.COM', now + 1);
    checkEmailRateLimit('user@example.com', now + 2);

    // There should be exactly one key, lowercased
    expect(emailRateStore.has('user@example.com')).toBe(true);
    expect(emailRateStore.size).toBe(1);
    expect(emailRateStore.get('user@example.com')?.length).toBe(3);
  });

  it('trims whitespace from email before rate-checking', () => {
    const now = Date.now();

    checkEmailRateLimit('  user@example.com  ', now);
    checkEmailRateLimit('user@example.com', now + 1);

    expect(emailRateStore.size).toBe(1);
    expect(emailRateStore.get('user@example.com')?.length).toBe(2);
  });

  it('tracks different email addresses independently', () => {
    const now = Date.now();

    // Exhaust the limit for alice
    for (let i = 0; i < EMAIL_RATE_LIMIT; i++) {
      checkEmailRateLimit('alice@example.com', now + i);
    }

    // alice is now blocked
    expect(() => checkEmailRateLimit('alice@example.com', now + EMAIL_RATE_LIMIT)).toThrow();

    // bob should still be allowed
    expect(() => checkEmailRateLimit('bob@example.com', now)).not.toThrow();

    expect(emailRateStore.get('bob@example.com')?.length).toBe(1);
  });

  it('allows emails again after the rate window expires', () => {
    const now = Date.now();

    // Use up the full limit
    for (let i = 0; i < EMAIL_RATE_LIMIT; i++) {
      checkEmailRateLimit('user@example.com', now + i);
    }

    // Blocked right now
    expect(() => checkEmailRateLimit('user@example.com', now + 100)).toThrow();

    // After the window passes (all 5 timestamps must be expired), should be allowed again
    const afterWindow = now + EMAIL_RATE_WINDOW_MS + EMAIL_RATE_LIMIT + 1;
    expect(() => checkEmailRateLimit('user@example.com', afterWindow)).not.toThrow();

    // Old timestamps were pruned, only the new one remains
    expect(emailRateStore.get('user@example.com')?.length).toBe(1);
  });

  it('does not increment the stored count when the rate limit is exceeded', () => {
    const now = Date.now();

    for (let i = 0; i < EMAIL_RATE_LIMIT; i++) {
      checkEmailRateLimit('user@example.com', now + i);
    }

    // Attempt blocked sends
    for (let i = 0; i < 3; i++) {
      try {
        checkEmailRateLimit('user@example.com', now + EMAIL_RATE_LIMIT + i);
      } catch {
        // expected
      }
    }

    // Count should still be 5 (blocked attempts must not be recorded)
    expect(emailRateStore.get('user@example.com')?.length).toBe(5);
  });
});

describe('Email Rate Limiter Cleanup', () => {
  beforeEach(() => {
    emailRateStore = new Map();
  });

  it('removes entries whose timestamps are all expired', () => {
    const past = Date.now() - EMAIL_RATE_WINDOW_MS - 1000;
    emailRateStore.set('old@example.com', [past, past + 100, past + 200]);

    cleanupExpiredEntries(Date.now());

    expect(emailRateStore.has('old@example.com')).toBe(false);
    expect(emailRateStore.size).toBe(0);
  });

  it('retains entries with at least one non-expired timestamp', () => {
    const now = Date.now();
    const expired = now - EMAIL_RATE_WINDOW_MS - 1000;
    const recent = now - 1000; // 1 second ago, well within the window

    emailRateStore.set('mixed@example.com', [expired, expired + 100, recent]);

    cleanupExpiredEntries(now);

    expect(emailRateStore.has('mixed@example.com')).toBe(true);
    // Only the recent timestamp should remain
    expect(emailRateStore.get('mixed@example.com')).toEqual([recent]);
  });

  it('handles cleanup when the store is empty', () => {
    expect(() => cleanupExpiredEntries(Date.now())).not.toThrow();
    expect(emailRateStore.size).toBe(0);
  });

  it('cleans up multiple addresses in one pass', () => {
    const now = Date.now();
    const expired = now - EMAIL_RATE_WINDOW_MS - 5000;
    const recent = now - 500;

    emailRateStore.set('gone1@example.com', [expired]);
    emailRateStore.set('gone2@example.com', [expired, expired + 100]);
    emailRateStore.set('stays@example.com', [expired, recent]);

    cleanupExpiredEntries(now);

    expect(emailRateStore.has('gone1@example.com')).toBe(false);
    expect(emailRateStore.has('gone2@example.com')).toBe(false);
    expect(emailRateStore.has('stays@example.com')).toBe(true);
    expect(emailRateStore.get('stays@example.com')).toEqual([recent]);
    expect(emailRateStore.size).toBe(1);
  });
});
