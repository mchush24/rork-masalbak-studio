import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supa: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supa) return _supa;

  const url = process.env.SUPABASE_URL;
  // Check both env var names for service role key (SUPABASE_SERVICE_ROLE_KEY is the standard name)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env missing: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE/ANON");
  }

  console.log("[Supabase Storage] Using key type:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' :
    process.env.SUPABASE_SERVICE_ROLE ? 'SERVICE_ROLE' : 'ANON_KEY'
  );

  _supa = createClient(url, key, { auth: { persistSession: false } });
  return _supa;
}

export const supa = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function uploadBuffer(bucket: string, filePath: string, buf: Buffer, contentType: string) {
  console.log(`[Supabase Upload] Starting upload to ${bucket}/${filePath} (${buf.length} bytes, ${contentType})`);

  const { error, data: uploadData } = await supa.storage.from(bucket).upload(filePath, buf, {
    contentType, upsert: true
  });

  if (error) {
    console.error(`[Supabase Upload] ❌ Upload failed:`, {
      bucket,
      filePath,
      errorMessage: error.message,
      errorName: error.name,
      statusCode: (error as any).statusCode,
      error: JSON.stringify(error, null, 2)
    });
    throw error;
  }

  console.log(`[Supabase Upload] ✅ Upload successful: ${bucket}/${filePath}`);
  const { data } = supa.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
