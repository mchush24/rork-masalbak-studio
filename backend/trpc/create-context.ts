import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "../lib/auth/jwt.js";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract token from Authorization header
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | null = null;
  let email: string | null = null;

  if (token) {
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
      email = payload.email;
    } catch (error) {
      // Token invalid or expired - don't throw here, let procedures handle it
      console.warn('[Auth] Invalid token in request:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return {
    req: opts.req,
    userId,
    email,
    isAuthenticated: !!userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED error if user is not authenticated
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
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
