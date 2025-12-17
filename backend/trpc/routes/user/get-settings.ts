import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supa as supabase } from "../../../lib/supabase.js";



const getSettingsInputSchema = z.object({
  userId: z.string().uuid(),
});

export const getSettingsProcedure = publicProcedure
  .input(getSettingsInputSchema)
  .query(async ({ input }) => {
    console.log("[getSettings] Fetching settings for user:", input.userId);

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", input.userId)
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
