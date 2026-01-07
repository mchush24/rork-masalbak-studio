import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";



const childSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(18),
  birthDate: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  avatarId: z.string().optional(),
});

const updateProfileInputSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().optional(), // Can be avatar ID or URL
  language: z.enum(["tr", "en", "de", "ru"]).optional(),
  children: z.array(childSchema).optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

export const updateProfileProcedure = protectedProcedure
  .input(updateProfileInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[updateProfile] Updating profile:", userId);

    const supabase = getSecureClient(ctx);

    const updates = input;

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.language !== undefined) updateData.language = updates.language;
    if (updates.children !== undefined) updateData.children = updates.children;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("[updateProfile] Error:", error);
      throw new Error(error.message);
    }

    console.log("[updateProfile] Profile updated successfully");
    return data;
  });
