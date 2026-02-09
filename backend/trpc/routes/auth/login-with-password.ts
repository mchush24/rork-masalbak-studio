import { logger } from '../../../lib/utils.js';
import { publicProcedure } from '../../create-context.js';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase.js';
import { verifyPassword } from '../../../lib/password.js';
import { generateAccessToken, generateRefreshToken } from '../../../lib/auth/jwt.js';
import { storeRefreshToken } from '../../../lib/auth/refresh-tokens.js';
import { TRPCError } from '@trpc/server';
import { authRateLimit } from '../../middleware/rate-limit.js';

const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(), // seconds
  requiresPasswordSetup: z.boolean().optional(),
  message: z.string().optional(),
});

export const loginWithPasswordProcedure = publicProcedure
  .use(authRateLimit)
  .input(loginInputSchema)
  .output(loginResponseSchema)
  .mutation(async ({ input }) => {
    logger.info('[Auth] 🔐 Login attempt:', input.email);

    try {
      // Debug: Check Supabase client
      logger.info('[Auth] 🔍 Supabase client status:', supabase ? 'OK' : 'NULL');

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', input.email)
        .single();

      // Debug: Log query result
      logger.info(
        '[Auth] 🔍 Query result - error:',
        error?.message,
        'user:',
        user ? 'found' : 'null'
      );

      if (error || !user) {
        logger.error('[Auth] ❌ User not found:', input.email, 'Error:', error?.message);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Email veya şifre hatalı',
        });
      }

      // Check if user needs to set password (migration case)
      if (!user.password_hash || user.password_reset_required) {
        logger.info('[Auth] ⚠️ User needs password setup:', input.email);
        return {
          success: false,
          userId: user.id,
          requiresPasswordSetup: true,
          message: 'Lütfen şifrenizi oluşturun',
        };
      }

      // Verify password
      const isValidPassword = await verifyPassword(input.password, user.password_hash);

      if (!isValidPassword) {
        logger.error('[Auth] ❌ Invalid password for:', input.email);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Email veya şifre hatalı',
        });
      }

      // Update last_seen_at
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Store refresh token hash for revocation support
      storeRefreshToken(user.id, refreshToken).catch(() => {});

      logger.info('[Auth] ✅ Login successful:', user.email);

      return {
        success: true,
        userId: user.id,
        email: user.email,
        name: user.name || undefined,
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      logger.error('[Auth] ❌ Login error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Giriş sırasında bir hata oluştu',
      });
    }
  });
