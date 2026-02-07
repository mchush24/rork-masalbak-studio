import { logger } from "../../../lib/utils.js";
import { publicProcedure } from "../../create-context.js";
import { z } from "zod";
import { supabase } from "../../../lib/supabase.js";
import { generateAccessToken, generateRefreshToken } from "../../../lib/auth/jwt.js";

const verifyEmailInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const verifyEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export const verifyEmailProcedure = publicProcedure
  .input(verifyEmailInputSchema)
  .output(verifyEmailResponseSchema)
  .mutation(async ({ input }) => {
    logger.info("[Auth] 🔐 Verifying email code:", input.email);

    try {
      // Get the latest verification code for this email
      const { data: verificationRecord, error: fetchError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', input.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !verificationRecord) {
        logger.error("[Auth] ❌ No verification code found for:", input.email);
        return {
          success: false,
          message: "Doğrulama kodu bulunamadı. Lütfen tekrar kayıt olun.",
        };
      }

      // Check if code has expired
      const expiresAt = new Date(verificationRecord.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        logger.error("[Auth] ❌ Verification code expired for:", input.email);
        return {
          success: false,
          message: "Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olun.",
        };
      }

      // Check if code matches (codes are masked in logs for security)
      logger.info("[Auth] 🔍 Comparing verification codes for:", input.email);

      if (verificationRecord.code.trim() !== input.code.trim()) {
        logger.error("[Auth] ❌ Invalid verification code for:", input.email);
        return {
          success: false,
          message: "Doğrulama kodu hatalı. Lütfen tekrar deneyin.",
        };
      }

      // Delete used verification code
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', input.email);

      logger.info("[Auth] ✅ Email verified successfully:", input.email);

      // Get user for token generation
      const { data: user } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', input.email)
        .single();

      if (!user) {
        throw new Error("User not found after verification");
      }

      // Generate JWT tokens
      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info("[Auth] 🔑 Generated JWT tokens for user:", user.id);

      return {
        success: true,
        message: "Email adresiniz başarıyla doğrulandı!",
        userId: user.id,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error("[Auth] ❌ Verification error:", error);
      return {
        success: false,
        message: "Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      };
    }
  });
