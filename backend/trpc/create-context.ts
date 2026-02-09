import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { verifyToken, TokenExpiredError, InvalidTokenError } from '../lib/auth/jwt.js';
import { logger } from '../lib/utils.js';
import { supa } from '../lib/supabase.js';
import { recordRequest } from '../lib/monitoring.js';

// Generate a simple request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Get client IP for audit logging
function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const requestId = generateRequestId();
  const clientIP = getClientIP(opts.req);

  // Extract token from Authorization header
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | null = null;
  let email: string | null = null;
  let tokenError: string | null = null;

  if (token) {
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
      email = payload.email;
      logger.debug(`[Auth] Token verified for user ${userId}`, { requestId, clientIP });
    } catch (error) {
      // Distinguish between expired and invalid tokens for better UX
      if (error instanceof TokenExpiredError) {
        tokenError = 'expired';
        logger.warn('[Auth] Token expired', {
          requestId,
          clientIP,
          message: error.message,
        });
      } else if (error instanceof InvalidTokenError) {
        tokenError = 'invalid';
        logger.warn('[Auth] Invalid token', {
          requestId,
          clientIP,
          message: error.message,
        });
      } else {
        tokenError = 'unknown';
        logger.error('[Auth] Token verification failed', {
          requestId,
          clientIP,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  return {
    req: opts.req,
    userId,
    email,
    isAuthenticated: !!userId,
    requestId,
    clientIP,
    tokenError, // 'expired' | 'invalid' | 'unknown' | null
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

// Monitoring middleware - tracks latency, errors, request counts per procedure
const monitoringMiddleware = t.middleware(async ({ path, next }) => {
  const start = Date.now();
  try {
    const result = await next();
    recordRequest(path, Date.now() - start, !result.ok);
    return result;
  } catch (error) {
    recordRequest(path, Date.now() - start, true);
    throw error;
  }
});

// All procedures derive from baseProcedure to get monitoring
const baseProcedure = t.procedure.use(monitoringMiddleware);

export const publicProcedure = baseProcedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED error if user is not authenticated
 */
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Bu işlem için giriş yapmanız gerekiyor',
    });
  }

  // Pass userId (now guaranteed to be defined) to the next handler
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // TypeScript now knows this is string, not string | null
      email: ctx.email!, // Same here
    },
  });
});

// Cache for user existence checks (5 minute TTL)
const userExistsCache = new Map<string, { exists: boolean; timestamp: number }>();
const USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function checkUserExists(userId: string): Promise<boolean> {
  // Check cache first
  const cached = userExistsCache.get(userId);
  if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
    return cached.exists;
  }

  // Query database
  const { data, error } = await supa.from('users').select('id').eq('id', userId).single();

  const exists = !error && !!data;

  // Update cache
  userExistsCache.set(userId, { exists, timestamp: Date.now() });

  // Clean old cache entries periodically
  if (userExistsCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of userExistsCache.entries()) {
      if (now - value.timestamp > USER_CACHE_TTL) {
        userExistsCache.delete(key);
      }
    }
  }

  return exists;
}

/**
 * Verified procedure - requires authentication AND user must exist in database
 * Use this for sensitive operations where user deletion should invalidate access
 */
export const verifiedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Bu işlem için giriş yapmanız gerekiyor',
    });
  }

  // Check if user exists in database
  const userExists = await checkUserExists(ctx.userId);
  if (!userExists) {
    logger.warn('[Auth] User not found in database', {
      requestId: ctx.requestId,
      userId: ctx.userId,
    });
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      email: ctx.email!,
    },
  });
});
