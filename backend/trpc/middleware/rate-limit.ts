/**
 * tRPC Rate Limiting Middleware
 * Provides procedure-level rate limiting for auth and AI endpoints
 */
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { Context } from "../create-context.js";

const t = initTRPC.context<Context>().create();

// Simple in-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const authStore: RateLimitStore = {};
const aiStore: RateLimitStore = {};

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(authStore).forEach((key) => {
    if (authStore[key].resetTime < now) {
      delete authStore[key];
    }
  });
  Object.keys(aiStore).forEach((key) => {
    if (aiStore[key].resetTime < now) {
      delete aiStore[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Get client identifier from context
 * Uses IP address and user agent for better tracking
 */
function getClientKey(ctx: Context): string {
  const ip = ctx.req?.headers.get("x-forwarded-for") ||
             ctx.req?.headers.get("x-real-ip") ||
             "unknown";
  const userAgent = ctx.req?.headers.get("user-agent") || "unknown";
  return `${ip}-${userAgent.substring(0, 50)}`;
}

/**
 * Check rate limit and throw error if exceeded
 */
function checkRateLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number,
  errorMessage: string
): void {
  const now = Date.now();
  const entry = store[key];

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return;
  }

  if (entry.count >= limit) {
    const resetInMinutes = Math.ceil((entry.resetTime - now) / 60000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `${errorMessage} Please try again in ${resetInMinutes} minute(s).`,
    });
  }

  entry.count++;
}

/**
 * Auth endpoint rate limiter middleware
 * Limit: 5 requests per 15 minutes per client
 * Use this for login, register, password reset, etc.
 */
export const authRateLimit = t.middleware(async ({ ctx, next }) => {
  const clientKey = getClientKey(ctx);

  checkRateLimit(
    authStore,
    clientKey,
    5,
    15 * 60 * 1000, // 15 minutes
    "Too many authentication attempts."
  );

  console.log(`[Auth Rate Limit] ${clientKey}: ${authStore[clientKey].count}/5`);
  return next();
});

/**
 * AI endpoint rate limiter middleware
 * Limit: 10 requests per hour per client
 * Use this for expensive AI operations (OpenAI, FAL.ai, etc.)
 */
export const aiRateLimit = t.middleware(async ({ ctx, next }) => {
  const clientKey = getClientKey(ctx);

  checkRateLimit(
    aiStore,
    clientKey,
    10,
    60 * 60 * 1000, // 1 hour
    "AI request limit exceeded."
  );

  console.log(`[AI Rate Limit] ${clientKey}: ${aiStore[clientKey].count}/10`);
  return next();
});

/**
 * Authenticated user rate limiter (less strict)
 * Limit: 20 requests per hour per user
 * Use this for authenticated AI operations with user-specific tracking
 */
export const authenticatedAiRateLimit = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const userKey = `user-${ctx.userId}`;

  checkRateLimit(
    aiStore,
    userKey,
    20,
    60 * 60 * 1000, // 1 hour
    "AI request limit exceeded."
  );

  console.log(`[AI Rate Limit (User)] ${ctx.userId}: ${aiStore[userKey].count}/20`);
  return next();
});
