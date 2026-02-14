import { logger } from '../../../lib/utils.js';
import { publicProcedure } from '../../create-context.js';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase.js';
import { sendPasswordResetEmail, generateVerificationCode } from '../../../lib/email.js';
import { authRateLimit } from '../../middleware/rate-limit.js';
import { TRPCError } from '@trpc/server';

const requestPasswordResetInputSchema = z.object({
  email: z.string().email(),
});

const requestPasswordResetResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const requestPasswordResetProcedure = publicProcedure
  .use(authRateLimit)
  .input(requestPasswordResetInputSchema)
  .output(requestPasswordResetResponseSchema)
  .mutation(async ({ input }) => {
    logger.info('[Auth] 📧 Password reset requested for:', input.email);

    try {
      // Debug: Check Supabase client
      logger.info('[Auth] 🔍 Supabase client status:', supabase ? 'OK' : 'NULL');

      // Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', input.email)
        .single();

      // Debug: Log query result
      logger.info(
        '[Auth] 🔍 Password reset query - error:',
        error?.message,
        error?.code,
        'user:',
        user ? 'found' : 'null'
      );

      // Always return success even if user not found (security)
      if (error || !user) {
        logger.info('[Auth] ⚠️ User not found, but returning success for security');
        return {
          success: true,
          message: 'Eğer bu email kayıtlıysa, şifre sıfırlama kodu gönderildi',
        };
      }

      // Generate reset code
      const resetCode = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Store reset token
      const { error: insertError } = await supabase.from('password_reset_tokens').insert([
        {
          email: input.email,
          code: resetCode,
          expires_at: expiresAt.toISOString(),
          user_id: user.id,
        },
      ]);

      if (insertError) {
        logger.error('[Auth] ❌ Error storing reset token:', insertError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Şifre sıfırlama kodu kaydedilemedi',
        });
      }

      // Send email
      await sendPasswordResetEmail(input.email, resetCode, user.name);

      logger.info('[Auth] ✅ Password reset code sent to:', input.email);

      return {
        success: true,
        message: 'Şifre sıfırlama kodu email adresinize gönderildi',
      };
    } catch (error) {
      logger.error('[Auth] ❌ Password reset error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Şifre sıfırlama kodu gönderilemedi',
      });
    }
  });
