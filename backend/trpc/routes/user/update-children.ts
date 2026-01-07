import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";

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
    console.log("[updateChildren] Updating children for user:", userId);
    console.log("[updateChildren] New children data:", input.children);

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
      console.error("[updateChildren] Error:", error);
      throw new Error(error.message);
    }

    console.log("[updateChildren] Children updated successfully:", data?.children?.length || 0);
    return data?.children || [];
  });
