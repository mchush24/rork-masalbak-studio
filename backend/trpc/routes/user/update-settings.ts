import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const updateSettingsInputSchema = z.object({
  userId: z.string().uuid(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  language: z.enum(["tr", "en", "de", "ar"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  profileVisibility: z.enum(["public", "private"]).optional(),
  dataSharingConsent: z.boolean().optional(),
  analyticsConsent: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  showTips: z.boolean().optional(),
  childLockEnabled: z.boolean().optional(),
  customSettings: z.record(z.any()).optional(),
});

export const updateSettingsProcedure = publicProcedure
  .input(updateSettingsInputSchema)
  .mutation(async ({ input }) => {
    console.log("[updateSettings] Updating settings for user:", input.userId);

    const { userId, ...settings } = input;

    // Prepare update object (convert camelCase to snake_case)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (settings.theme !== undefined) updateData.theme = settings.theme;
    if (settings.language !== undefined) updateData.language = settings.language;
    if (settings.notificationsEnabled !== undefined) updateData.notifications_enabled = settings.notificationsEnabled;
    if (settings.emailNotifications !== undefined) updateData.email_notifications = settings.emailNotifications;
    if (settings.pushNotifications !== undefined) updateData.push_notifications = settings.pushNotifications;
    if (settings.profileVisibility !== undefined) updateData.profile_visibility = settings.profileVisibility;
    if (settings.dataSharingConsent !== undefined) updateData.data_sharing_consent = settings.dataSharingConsent;
    if (settings.analyticsConsent !== undefined) updateData.analytics_consent = settings.analyticsConsent;
    if (settings.autoSave !== undefined) updateData.auto_save = settings.autoSave;
    if (settings.showTips !== undefined) updateData.show_tips = settings.showTips;
    if (settings.childLockEnabled !== undefined) updateData.child_lock_enabled = settings.childLockEnabled;
    if (settings.customSettings !== undefined) updateData.custom_settings = settings.customSettings;

    // Check if settings exist
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          ...updateData,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      result = data;
    }

    console.log("[updateSettings] Settings updated successfully");
    return result;
  });
