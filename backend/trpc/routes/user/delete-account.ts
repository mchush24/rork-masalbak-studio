import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { getSecureClient } from "../../../lib/supabase-secure";

const deleteAccountInputSchema = z.object({
  confirmEmail: z.string().email(),
  confirmPassword: z.string().min(6),
});

export const deleteAccountProcedure = protectedProcedure
  .input(deleteAccountInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log("[deleteAccount] User requesting account deletion:", userId);

    const supabase = getSecureClient(ctx);

    // First, verify user email matches
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, password_hash")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("[deleteAccount] User not found:", userError);
      throw new Error("User not found");
    }

    if (userData.email !== input.confirmEmail) {
      console.error("[deleteAccount] Email mismatch");
      throw new Error("Email does not match");
    }

    // Verify password
    const bcrypt = require("bcryptjs");
    const isPasswordValid = await bcrypt.compare(input.confirmPassword, userData.password_hash);

    if (!isPasswordValid) {
      console.error("[deleteAccount] Invalid password");
      throw new Error("Invalid password");
    }

    console.log("[deleteAccount] Verification successful, proceeding with cascade delete");

    // Cascade delete: Delete all user data
    // Order matters: delete child records first, then parent

    // 1. Delete analyses
    const { error: analysesError } = await supabase
      .from("analyses")
      .delete()
      .eq("user_id", userId);

    if (analysesError) {
      console.error("[deleteAccount] Error deleting analyses:", analysesError);
      // Continue anyway - best effort
    }

    // 2. Delete storybooks
    const { error: storybooksError } = await supabase
      .from("storybooks")
      .delete()
      .eq("user_id_fk", userId);

    if (storybooksError) {
      console.error("[deleteAccount] Error deleting storybooks:", storybooksError);
      // Continue anyway
    }

    // 3. Delete colorings
    const { error: coloringsError } = await supabase
      .from("colorings")
      .delete()
      .eq("user_id_fk", userId);

    if (coloringsError) {
      console.error("[deleteAccount] Error deleting colorings:", coloringsError);
      // Continue anyway
    }

    // 4. Delete verification codes
    const { error: verificationError } = await supabase
      .from("verification_codes")
      .delete()
      .eq("user_id", userId);

    if (verificationError) {
      console.error("[deleteAccount] Error deleting verification codes:", verificationError);
      // Continue anyway
    }

    // 5. Delete user settings
    const { error: settingsError } = await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    if (settingsError) {
      console.error("[deleteAccount] Error deleting settings:", settingsError);
      // Continue anyway
    }

    // 6. Finally, delete the user record
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteUserError) {
      console.error("[deleteAccount] Error deleting user:", deleteUserError);
      throw new Error("Failed to delete account. Please contact support.");
    }

    console.log("[deleteAccount] ✅ Account deleted successfully:", userId);

    return {
      success: true,
      message: "Your account and all associated data have been permanently deleted",
    };
  });
