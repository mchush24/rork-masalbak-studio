import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { getSecureClient } from "../../../lib/supabase-secure.js";

export const getSettingsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[getSettings] Fetching settings for user:", userId);

    const supabase = getSecureClient(ctx);

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no settings found, return defaults
      if (error.code === "PGRST116") {
        logger.info("[getSettings] No settings found, returning defaults");
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

    logger.info("[getSettings] Settings found");
    return data;
  });
