/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */
import { rateLimiter } from "hono-rate-limiter";
import type { Context } from "hono";

// Helper to get client IP from request
const getIP = (c: Context): string => {
  // Check various headers for real IP (important for proxied requests)
  const forwarded = c.req.header("x-forwarded-for");
  const realIP = c.req.header("x-real-ip");
  const cfConnectingIP = c.req.header("cf-connecting-ip");

  return cfConnectingIP || realIP || forwarded?.split(",")[0] || "unknown";
};

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force login attempts and registration spam
 * Limit: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-7",
  keyGenerator: (c) => getIP(c),
  handler: (c) => {
    return c.json(
      {
        error: "Too many authentication attempts. Please try again in 15 minutes.",
        code: "RATE_LIMIT_EXCEEDED",
      },
      429
    );
  },
});

/**
 * AI endpoint rate limiter
 * Prevents excessive usage of expensive AI operations
 * Limit: 10 requests per hour per IP
 */
export const aiRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: "draft-7",
  keyGenerator: (c) => getIP(c),
  handler: (c) => {
    return c.json(
      {
        error: "AI request limit exceeded. Please try again in 1 hour.",
        code: "AI_RATE_LIMIT_EXCEEDED",
      },
      429
    );
  },
});

/**
 * General API rate limiter
 * Protects against general API abuse
 * Limit: 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-7",
  keyGenerator: (c) => getIP(c),
  handler: (c) => {
    return c.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
      },
      429
    );
  },
});
