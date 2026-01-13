import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure.js";

const childSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
  age: z.number().min(0, "Yaş 0'dan büyük olmalı").max(18, "Yaş 18'den küçük olmalı"),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  avatarId: z.string().optional(),
});

const updateChildrenInputSchema = z.object({
  children: z.array(childSchema),
});

export const updateChildrenProcedure = protectedProcedure
  .input(updateChildrenInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[updateChildren] Updating children for user:", userId);
    logger.info("[updateChildren] New children data:", input.children);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("users")
      .update({
        children: input.children,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("children")
      .single();

    if (error) {
      logger.error("[updateChildren] Error:", error);
      throw new Error(error.message);
    }

    logger.info("[updateChildren] Children updated successfully:", data?.children?.length || 0);
    return data?.children || [];
  });
