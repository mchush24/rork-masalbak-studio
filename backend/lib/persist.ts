import { supa } from "./supabase.js";

export async function saveStorybookRecord(user_id: string | null, title: string, pages: any[], pdf_url?: string|null, voice_urls?: string[]|null) {
  const { data, error } = await supa
    .from("storybooks")
    .insert({ user_id, title, pages, pdf_url: pdf_url || null, voice_urls: voice_urls || null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function saveColoringRecord(user_id: string | null, title: string, pdf_url: string, page_count: number) {
  const { data, error } = await supa
    .from("colorings")
    .insert({ user_id, title, pdf_url, page_count })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listStorybooks(user_id: string | null, limit = 20) {
  const q = supa.from("storybooks").select("*").order("created_at", { ascending: false }).limit(limit);
  const { data, error } = user_id ? await q.eq("user_id", user_id) : await q;
  if (error) throw error;
  return data;
}

export async function listColorings(user_id: string | null, limit = 20) {
  const q = supa.from("colorings").select("*").order("created_at", { ascending: false }).limit(limit);
  const { data, error } = user_id ? await q.eq("user_id", user_id) : await q;
  if (error) throw error;
  return data;
}
