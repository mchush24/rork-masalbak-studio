import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";
import { hashPassword, validatePasswordStrength } from "../../../lib/password";
import { TRPCError } from "@trpc/server";

const setPasswordInputSchema = z.object({
  userId: z.string(),
  password: z.string().min(6),
});

const setPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const setPasswordProcedure = publicProcedure
  .input(setPasswordInputSchema)
  .output(setPasswordResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] 🔐 Setting password for user:", input.userId);

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
        .eq('id', input.userId);

      if (error) {
        throw new Error(`Failed to set password: ${error.message}`);
      }

      console.log("[Auth] ✅ Password set successfully");

      return {
        success: true,
        message: 'Şifreniz başarıyla oluşturuldu',
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("[Auth] ❌ Set password error:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Şifre oluşturma başarısız oldu',
      });
    }
  });
