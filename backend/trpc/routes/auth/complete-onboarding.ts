import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";

const completeOnboardingInputSchema = z.object({
  userId: z.string(),
});

const completeOnboardingResponseSchema = z.object({
  success: z.boolean(),
});

export const completeOnboardingProcedure = publicProcedure
  .input(completeOnboardingInputSchema)
  .output(completeOnboardingResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] ✅ Completing onboarding for user:", input.userId);

    try {
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', input.userId);

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
