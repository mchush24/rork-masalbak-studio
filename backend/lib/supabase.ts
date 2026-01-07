import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supa: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supa) return _supa;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env missing: SUPABASE_URL + SUPABASE_SERVICE_ROLE/ANON");
  }

  _supa = createClient(url, key, { auth: { persistSession: false } });
  return _supa;
}

export const supa = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function uploadBuffer(bucket: string, filePath: string, buf: Buffer, contentType: string) {
  const { error } = await supa.storage.from(bucket).upload(filePath, buf, {
    contentType, upsert: true
  });
  if (error) throw error;
  const { data } = supa.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
