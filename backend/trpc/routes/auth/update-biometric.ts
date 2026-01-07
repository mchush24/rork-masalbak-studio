import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";

const updateBiometricInputSchema = z.object({
  enabled: z.boolean(),
});

const updateBiometricResponseSchema = z.object({
  success: z.boolean(),
});

export const updateBiometricProcedure = protectedProcedure
  .input(updateBiometricInputSchema)
  .output(updateBiometricResponseSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[Auth] 🔐 Updating biometric for user:", userId, "enabled:", input.enabled);

    const supabase = getSecureClient(ctx);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          biometric_enabled: input.enabled,
          biometric_enrolled_at: input.enabled ? new Date().toISOString() : null,
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to update biometric: ${error.message}`);
      }

      console.log("[Auth] ✅ Biometric updated successfully");

      return { success: true };
    } catch (error) {
      console.error("[Auth] ❌ Biometric update error:", error);
      throw error;
    }
  });
