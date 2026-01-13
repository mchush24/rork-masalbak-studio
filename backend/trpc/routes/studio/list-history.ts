import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure.js";

const deleteStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

const deleteColoringInputSchema = z.object({
  coloringId: z.string().uuid(),
});

export const listStorybooksProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[History] Listing storybooks for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("storybooks")
      .select("*")
      .eq("user_id_fk", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[History] Error listing storybooks:", error);
      throw new Error(error.message);
    }

    return data || [];
  });

export const listColoringsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[History] Listing colorings for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("colorings")
      .select("*")
      .eq("user_id_fk", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[History] Error listing colorings:", error);
      throw new Error(error.message);
    }

    return data || [];
  });

export const deleteStorybookProcedure = protectedProcedure
  .input(deleteStorybookInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info("[History] Deleting storybook:", input.storybookId, "for user:", userId);

    const supabase = getSecureClient(ctx);

    const { error } = await supabase
      .from("storybooks")
      .delete()
      .eq("id", input.storybookId)
      .eq("user_id_fk", userId);

    if (error) {
      logger.error("[History] Error deleting storybook:", error);
      throw new Error(error.message);
    }

    return { success: true };
  });

export const deleteColoringProcedure = protectedProcedure
  .input(deleteColoringInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info("[History] Deleting coloring:", input.coloringId, "for user:", userId);

    const supabase = getSecureClient(ctx);

    const { error } = await supabase
      .from("colorings")
      .delete()
      .eq("id", input.coloringId)
      .eq("user_id_fk", userId);

    if (error) {
      logger.error("[History] Error deleting coloring:", error);
      throw new Error(error.message);
    }

    return { success: true };
  });
