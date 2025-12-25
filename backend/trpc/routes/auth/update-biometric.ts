import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";

const updateBiometricInputSchema = z.object({
  userId: z.string(),
  enabled: z.boolean(),
});

const updateBiometricResponseSchema = z.object({
  success: z.boolean(),
});

export const updateBiometricProcedure = publicProcedure
  .input(updateBiometricInputSchema)
  .output(updateBiometricResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] 🔐 Updating biometric for user:", input.userId, "enabled:", input.enabled);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          biometric_enabled: input.enabled,
          biometric_enrolled_at: input.enabled ? new Date().toISOString() : null,
        })
        .eq('id', input.userId);

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
