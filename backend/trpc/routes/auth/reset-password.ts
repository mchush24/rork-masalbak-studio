import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../lib/supabase";
import { hashPassword, validatePasswordStrength } from "../../../lib/password";
import { TRPCError } from "@trpc/server";

const resetPasswordInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

const resetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
});

export const resetPasswordProcedure = publicProcedure
  .input(resetPasswordInputSchema)
  .output(resetPasswordResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] 🔐 Password reset for:", input.email);

    try {
      // Validate password strength
      const strength = validatePasswordStrength(input.newPassword);
      if (!strength.isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: strength.feedback.join(', '),
        });
      }

      // Verify reset code
      const { data: resetToken, error: fetchError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('email', input.email)
        .eq('code', input.code)
        .is('used_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !resetToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Geçersiz veya süresi dolmuş kod',
        });
      }

      // Check expiration
      const expiresAt = new Date(resetToken.expires_at);
      if (new Date() > expiresAt) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Kod süresi dolmuş. Yeni kod isteyin',
        });
      }

      // Hash new password
      const passwordHash = await hashPassword(input.newPassword);

      // Update user password
      const { data: user, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          password_reset_required: false,
          last_password_change: new Date().toISOString(),
        })
        .eq('email', input.email)
        .select('id')
        .single();

      if (updateError || !user) {
        throw new Error('Failed to update password');
      }

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', resetToken.id);

      console.log("[Auth] ✅ Password reset successful for:", input.email);

      return {
        success: true,
        message: 'Şifreniz başarıyla değiştirildi',
        userId: user.id,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("[Auth] ❌ Password reset error:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Şifre sıfırlama başarısız oldu',
      });
    }
  });
