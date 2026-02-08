import { z } from 'zod';
import { publicProcedure } from '../../create-context.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenExpiredError,
  InvalidTokenError,
} from '../../../lib/auth/jwt.js';
import { logger } from '../../../lib/utils.js';
import { supa } from '../../../lib/supabase.js';
import { authRateLimit } from '../../middleware/rate-limit.js';

/**
 * Refresh Token Endpoint
 *
 * Exchanges a valid refresh token for a new access token + refresh token pair.
 * The old refresh token is implicitly invalidated by issuing a new one.
 */
export const refreshTokenProcedure = publicProcedure
  .use(authRateLimit)
  .input(
    z.object({
      refreshToken: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Verify the refresh token
      const payload = verifyRefreshToken(input.refreshToken);

      // Verify user still exists in database
      const { data: user, error } = await supa
        .from('users')
        .select('id, email')
        .eq('id', payload.userId)
        .single();

      if (error || !user) {
        logger.warn(
          '[Auth] Refresh token for deleted user:',
          payload.userId.substring(0, 8) + '...'
        );
        return {
          success: false,
          error: 'user_not_found',
          message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.',
        };
      }

      // Generate new token pair
      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info('[Auth] Token refreshed for user:', user.id.substring(0, 8) + '...');

      return {
        success: true,
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        logger.info('[Auth] Refresh token expired');
        return {
          success: false,
          error: 'refresh_token_expired',
          message: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.',
        };
      }

      if (error instanceof InvalidTokenError) {
        logger.warn('[Auth] Invalid refresh token attempt');
        return {
          success: false,
          error: 'invalid_refresh_token',
          message: 'Geçersiz token. Lütfen tekrar giriş yapın.',
        };
      }

      logger.error('[Auth] Refresh token error:', error);
      return {
        success: false,
        error: 'unknown',
        message: 'Token yenileme hatası.',
      };
    }
  });
