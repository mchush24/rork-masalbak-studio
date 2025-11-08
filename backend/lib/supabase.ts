import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY!;
if (!url || !key) throw new Error("Supabase env missing: SUPABASE_URL + SUPABASE_SERVICE_ROLE/ANON");

export const supa = createClient(url, key, { auth: { persistSession: false } });

export async function uploadBuffer(bucket: string, filePath: string, buf: Buffer, contentType: string) {
  const { error } = await supa.storage.from(bucket).upload(filePath, buf, {
    contentType, upsert: true
  });
  if (error) throw error;
  const { data } = supa.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
