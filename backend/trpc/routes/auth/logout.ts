import { z } from 'zod';
import { protectedProcedure } from '../../create-context.js';
import { revokeToken, revokeAllUserTokens } from '../../../lib/auth/refresh-tokens.js';
import { logger } from '../../../lib/utils.js';

export const logoutProcedure = protectedProcedure
  .input(
    z.object({
      refreshToken: z.string().min(1).optional(),
      allDevices: z.boolean().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    if (input.allDevices) {
      // Revoke all refresh tokens for this user (logout everywhere)
      await revokeAllUserTokens(userId);
      logger.info('[Auth] Logged out from all devices:', userId.substring(0, 8) + '...');
    } else if (input.refreshToken) {
      // Revoke only the provided refresh token (single device logout)
      await revokeToken(input.refreshToken);
      logger.info('[Auth] Logged out single device:', userId.substring(0, 8) + '...');
    }

    return { success: true };
  });
