import { logger } from "./utils.js";
import { supa } from "./supabase.js";

export async function saveStorybookRecord(
  user_id: string | null,
  title: string,
  pages: any[],
  pdf_url?: string|null,
  voice_urls?: string[]|null
) {
  logger.info("[Persist] Saving storybook record:", title);

  const { data, error } = await supa
    .from("storybooks")
    .insert({
      user_id_fk: user_id,  // Use user_id_fk foreign key column
      title,
      pages,
      pdf_url: pdf_url || null,
      voice_urls: voice_urls || null
    })
    .select("*")
    .single();

  if (error) {
    logger.error("[Persist] Storybook save failed:", error);
    throw error;
  }

  logger.info("[Persist] Storybook saved:", data.id);
  return data;
}

export async function saveColoringRecord(
  user_id: string | null,
  title: string,
  pdf_url: string,
  page_count: number
) {
  logger.info("[Persist] Saving coloring record:", title);

  const { data, error } = await supa
    .from("colorings")
    .insert({
      user_id_fk: user_id,  // Use user_id_fk foreign key column
      title,
      pdf_url,
      page_count
    })
    .select("*")
    .single();

  if (error) {
    logger.error("[Persist] Coloring save failed:", error);
    throw error;
  }

  logger.info("[Persist] Coloring saved:", data.id);
  return data;
}

export async function listStorybooks(user_id: string | null, limit = 20) {
  const q = supa
    .from("storybooks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Use user_id_fk for filtering
  const { data, error } = user_id ? await q.eq("user_id_fk", user_id) : await q;

  if (error) {
    logger.error("[Persist] List storybooks failed:", error);
    throw error;
  }

  return data;
}

export async function listColorings(user_id: string | null, limit = 20) {
  const q = supa
    .from("colorings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = user_id ? await q.eq("user_id_fk", user_id) : await q;

  if (error) {
    logger.error("[Persist] List colorings failed:", error);
    throw error;
  }

  return data;
}

export async function deleteStorybook(storybookId: string) {
  logger.info("[Persist] Deleting storybook:", storybookId);

  const { error } = await supa
    .from("storybooks")
    .delete()
    .eq("id", storybookId);

  if (error) {
    logger.error("[Persist] Delete storybook failed:", error);
    throw error;
  }

  logger.info("[Persist] Storybook deleted successfully");
  return { success: true };
}

export async function deleteColoring(coloringId: string) {
  logger.info("[Persist] Deleting coloring:", coloringId);

  const { error } = await supa
    .from("colorings")
    .delete()
    .eq("id", coloringId);

  if (error) {
    logger.error("[Persist] Delete coloring failed:", error);
    throw error;
  }

  logger.info("[Persist] Coloring deleted successfully");
  return { success: true };
}
