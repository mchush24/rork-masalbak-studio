import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { hashPassword, validatePasswordStrength } from '../../../lib/password.js';
import { TRPCError } from '@trpc/server';

const setPasswordInputSchema = z.object({
  password: z.string().min(6),
});

const setPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const setPasswordProcedure = protectedProcedure
  .input(setPasswordInputSchema)
  .output(setPasswordResponseSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[Auth] 🔐 Setting password for user:', userId);

    const supabase = await getSecureClient(ctx);

    try {
      // Validate password strength
      const strength = validatePasswordStrength(input.password);
      if (!strength.isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: strength.feedback.join(', '),
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Update user
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          password_reset_required: false,
          last_password_change: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        logger.error('[Auth] ❌ DB Error:', error);
        throw new Error('Şifre kaydedilemedi. Lütfen tekrar deneyin.');
      }

      logger.info('[Auth] ✅ Password set successfully');

      return {
        success: true,
        message: 'Şifreniz başarıyla oluşturuldu',
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      logger.error('[Auth] ❌ Set password error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Şifre oluşturma başarısız oldu',
      });
    }
  });
