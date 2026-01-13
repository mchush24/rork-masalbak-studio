import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supa: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supa) return _supa;

  const url = process.env.SUPABASE_URL;
  // SECURITY: Backend MUST use service role key - NEVER fallback to anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url) {
    throw new Error("[Supabase] SUPABASE_URL environment variable is required");
  }

  if (!key) {
    throw new Error(
      "[Supabase] SUPABASE_SERVICE_ROLE_KEY is required for backend operations. " +
      "ANON_KEY is NOT allowed in backend for security reasons."
    );
  }

  _supa = createClient(url, key, { auth: { persistSession: false } });
  return _supa;
}

/**
 * Factory function to create/get Supabase client
 * Used for direct database operations in tRPC routes
 */
export function createSupabaseClient(): SupabaseClient {
  return getSupabaseClient();
}

export const supa = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Alias for backward compatibility with auth routes
export const supabase = supa;

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
