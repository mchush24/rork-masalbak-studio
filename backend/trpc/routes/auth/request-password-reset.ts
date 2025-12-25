import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";
import { sendPasswordResetEmail, generateVerificationCode } from "../../../lib/email";

const requestPasswordResetInputSchema = z.object({
  email: z.string().email(),
});

const requestPasswordResetResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const requestPasswordResetProcedure = publicProcedure
  .input(requestPasswordResetInputSchema)
  .output(requestPasswordResetResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] 📧 Password reset requested for:", input.email);

    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', input.email)
        .single();

      // Always return success even if user not found (security)
      if (error || !user) {
        console.log("[Auth] ⚠️ User not found, but returning success for security");
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
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert([
          {
            email: input.email,
            code: resetCode,
            expires_at: expiresAt.toISOString(),
            user_id: user.id,
          },
        ]);

      if (insertError) {
        console.error("[Auth] ❌ Error storing reset token:", insertError);
        throw new Error('Failed to store reset token');
      }

      // Send email
      await sendPasswordResetEmail(input.email, resetCode, user.name);

      console.log("[Auth] ✅ Password reset code sent to:", input.email);

      return {
        success: true,
        message: 'Şifre sıfırlama kodu email adresinize gönderildi',
      };
    } catch (error) {
      console.error("[Auth] ❌ Password reset error:", error);
      throw new Error('Şifre sıfırlama kodu gönderilemedi');
    }
  });
