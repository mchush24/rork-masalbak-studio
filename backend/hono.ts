import 'dotenv/config';
import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { requestId } from 'hono/request-id';
import { bodyLimit } from 'hono/body-limit';
import { appRouter } from './trpc/app-router.js';
import { createContext } from './trpc/create-context.js';
import { generalRateLimiter } from './middleware/rate-limit.js';
import { healthRouter } from './health/index.js';

const app = new Hono();

// ============================================
// REQUEST ID - For tracing and debugging
// ============================================
app.use('*', requestId());

// ============================================
// SECURITY HEADERS - OWASP Best Practices
// ============================================
const isDev = process.env.NODE_ENV !== 'production';

app.use(
  '*',
  secureHeaders({
    // Prevents clickjacking attacks
    xFrameOptions: 'DENY',
    // Prevents MIME type sniffing
    xContentTypeOptions: 'nosniff',
    // Enables XSS filtering in older browsers
    xXssProtection: '1; mode=block',
    // Controls referrer information sent with requests
    referrerPolicy: 'strict-origin-when-cross-origin',
    // Enforces HTTPS (only in production)
    strictTransportSecurity: isDev ? false : 'max-age=31536000; includeSubDomains',
    // Prevents loading in Adobe products
    xPermittedCrossDomainPolicies: 'none',
    // Content Security Policy
    contentSecurityPolicy: isDev
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (false as any)
      : {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.openai.com', 'https://*.supabase.co'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
  })
);

// ============================================
// CORS Configuration - Production Ready
// ============================================
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(',')
    .map(o => o.trim())
    .filter(Boolean) || [];
const isDevelopment = process.env.NODE_ENV !== 'production';

// Only log CORS config at startup, not for every request
if (isDev) {
  console.log('[CORS] Environment:', process.env.NODE_ENV || 'development');
  console.log('[CORS] Allowed origins:', allowedOrigins);
}

// Helper function to check if origin is a localhost development origin
function isLocalhostOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

// Helper function to check if origin is allowed
function isOriginAllowed(origin: string): boolean {
  // Always allow localhost for local development
  if (isLocalhostOrigin(origin)) {
    return true;
  }

  return allowedOrigins.some(allowedOrigin => {
    // Support wildcard patterns (e.g., exp://192.168.*)
    if (allowedOrigin.includes('*')) {
      // Escape regex special chars except *, then replace * with .*
      const escaped = allowedOrigin.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp('^' + escaped.replace(/\*/g, '.*') + '$');
      return pattern.test(origin);
    }
    return origin === allowedOrigin;
  });
}

app.use(
  '*',
  cors({
    origin: origin => {
      // In development, allow all origins for easier testing
      if (isDevelopment) {
        return origin || '*';
      }

      // No origin = mobile apps, Postman, server-to-server
      // These are controlled by authentication, not CORS
      if (!origin) {
        return '*';
      }

      // Check if origin matches any allowed pattern
      if (isOriginAllowed(origin)) {
        return origin;
      }

      // SECURITY: In production, reject unknown origins
      // This prevents unauthorized web clients from making requests
      console.warn('[CORS] ❌ Blocked origin:', origin);
      return null; // Returning null/undefined blocks the request
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // Cache preflight for 24 hours (reduce preflight requests)
  })
);

// ============================================
// BODY SIZE LIMITS - Prevent large payload abuse
// ============================================
// General limit: 1MB for most endpoints
app.use('*', bodyLimit({ maxSize: 1 * 1024 * 1024 }));
// tRPC endpoints: 10MB (base64 image uploads in analyze-drawing)
app.use('/api/trpc/*', bodyLimit({ maxSize: 10 * 1024 * 1024 }));

// ============================================
// CSRF Protection - Defense in Depth
// ============================================
// JWT Bearer auth (not cookies) makes this API inherently CSRF-safe.
// This middleware adds extra protection by rejecting non-JSON POST requests.
app.use('/api/trpc/*', async (c, next) => {
  if (c.req.method === 'POST') {
    const contentType = c.req.header('content-type') || '';
    if (!contentType.includes('application/json')) {
      return c.json({ error: 'Content-Type must be application/json' }, 415);
    }
  }
  await next();
});

// Apply rate limiting to all tRPC endpoints
app.use('/api/trpc/*', generalRateLimiter);

app.use(
  '/api/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: '/api/trpc',
  })
);

app.get('/', c => {
  return c.json({ status: 'ok', message: 'API is running' });
});

// Mount comprehensive health check router
app.route('/', healthRouter);

export default app;
