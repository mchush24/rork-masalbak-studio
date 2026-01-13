import { logger } from "../../../lib/utils.js";
import { publicProcedure } from "../../create-context.js";
import { z } from "zod";
import { supabase } from "../../../lib/supabase.js";

const checkEmailInputSchema = z.object({
  email: z.string().email(),
});

const checkEmailResponseSchema = z.object({
  exists: z.boolean(),
  hasPassword: z.boolean(),
});

export const checkEmailProcedure = publicProcedure
  .input(checkEmailInputSchema)
  .output(checkEmailResponseSchema)
  .mutation(async ({ input }) => {
    logger.info("[Auth] 🔍 Checking email:", input.email);

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, password_hash')
        .eq('email', input.email)
        .single();

      if (error || !user) {
        logger.info("[Auth] 📧 Email not registered:", input.email);
        return {
          exists: false,
          hasPassword: false,
        };
      }

      logger.info("[Auth] ✅ Email exists:", input.email);
      return {
        exists: true,
        hasPassword: !!user.password_hash,
      };
    } catch (error) {
      logger.error("[Auth] ❌ Check email error:", error);
      return {
        exists: false,
        hasPassword: false,
      };
    }
  });
