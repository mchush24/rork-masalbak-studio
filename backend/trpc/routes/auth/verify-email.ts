import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";

const verifyEmailInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const verifyEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const verifyEmailProcedure = publicProcedure
  .input(verifyEmailInputSchema)
  .output(verifyEmailResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] 🔐 Verifying email code:", input.email);

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
        console.error("[Auth] ❌ No verification code found for:", input.email);
        return {
          success: false,
          message: "Doğrulama kodu bulunamadı. Lütfen tekrar kayıt olun.",
        };
      }

      // Check if code has expired
      const expiresAt = new Date(verificationRecord.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        console.error("[Auth] ❌ Verification code expired for:", input.email);
        return {
          success: false,
          message: "Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olun.",
        };
      }

      // Check if code matches
      console.log("[Auth] 🔍 Comparing codes - Database:", verificationRecord.code, "| Input:", input.code);
      console.log("[Auth] 🔍 Code types - Database:", typeof verificationRecord.code, "| Input:", typeof input.code);
      console.log("[Auth] 🔍 Trimmed comparison - Database:", verificationRecord.code.trim(), "| Input:", input.code.trim());

      if (verificationRecord.code.trim() !== input.code.trim()) {
        console.error("[Auth] ❌ Invalid verification code for:", input.email);
        console.error("[Auth] ❌ Expected:", verificationRecord.code, "| Got:", input.code);
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

      console.log("[Auth] ✅ Email verified successfully:", input.email);

      return {
        success: true,
        message: "Email adresiniz başarıyla doğrulandı!",
      };
    } catch (error) {
      console.error("[Auth] ❌ Verification error:", error);
      return {
        success: false,
        message: "Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      };
    }
  });
