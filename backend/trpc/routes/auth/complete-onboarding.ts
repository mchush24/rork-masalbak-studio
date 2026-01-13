import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure.js";

const completeOnboardingResponseSchema = z.object({
  success: z.boolean(),
});

export const completeOnboardingProcedure = protectedProcedure
  .output(completeOnboardingResponseSchema)
  .mutation(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[Auth] ✅ Completing onboarding for user:", userId);

    const supabase = getSecureClient(ctx);

    try {
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      if (error) {
        logger.error("[Auth] ❌ Error completing onboarding:", error);
        throw new Error(`Failed to complete onboarding: ${error.message}`);
      }

      logger.info("[Auth] ✅ Onboarding completed successfully");

      return { success: true };
    } catch (error) {
      logger.error("[Auth] ❌ Onboarding error:", error);
      throw new Error(
        `Onboarding failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
