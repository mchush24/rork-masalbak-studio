import { protectedProcedure } from "../../create-context";
import { getSecureClient } from "../../../lib/supabase-secure";

export const getSettingsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[getSettings] Fetching settings for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no settings found, return defaults
      if (error.code === "PGRST116") {
        console.log("[getSettings] No settings found, returning defaults");
        return {
          theme: "light",
          language: "tr",
          notifications_enabled: true,
          email_notifications: true,
          push_notifications: true,
          profile_visibility: "private",
          data_sharing_consent: false,
          analytics_consent: true,
          auto_save: true,
          show_tips: true,
          child_lock_enabled: false,
          custom_settings: {},
        };
      }
      throw new Error(error.message);
    }

    console.log("[getSettings] Settings found");
    return data;
  });
