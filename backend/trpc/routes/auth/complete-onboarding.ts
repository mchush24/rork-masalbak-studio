import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";

const completeOnboardingResponseSchema = z.object({
  success: z.boolean(),
});

export const completeOnboardingProcedure = protectedProcedure
  .output(completeOnboardingResponseSchema)
  .mutation(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[Auth] ✅ Completing onboarding for user:", userId);

    const supabase = getSecureClient(ctx);

    try {
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      if (error) {
        console.error("[Auth] ❌ Error completing onboarding:", error);
        throw new Error(`Failed to complete onboarding: ${error.message}`);
      }

      console.log("[Auth] ✅ Onboarding completed successfully");

      return { success: true };
    } catch (error) {
      console.error("[Auth] ❌ Onboarding error:", error);
      throw new Error(
        `Onboarding failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
