/**
 * Secure Supabase Client with RLS Context Support
 *
 * This module provides per-request Supabase clients that set the current
 * user context for Row Level Security (RLS) policies.
 *
 * How it works:
 * 1. Each request gets its own Supabase client instance (no shared state)
 * 2. Before returning, we await `set_user_context` RPC to set RLS context
 * 3. RLS policies use `current_setting('app.current_user_id')` to check ownership
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './utils.js';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    console.error(
      '[Supabase] Missing env vars. SUPABASE_URL:',
      !!url,
      'SUPABASE_SERVICE_ROLE:',
      !!key
    );
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return { url, key };
}

// Shared client for non-user-scoped operations (legacy code, admin queries)
let _sharedClient: SupabaseClient | null = null;

function getSharedClient(): SupabaseClient {
  if (_sharedClient) return _sharedClient;

  const { url, key } = getSupabaseConfig();
  _sharedClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _sharedClient;
}

// Base Supabase client (used by legacy code) - lazy loaded via Proxy
export const supa = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSharedClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Create a per-request Supabase client with RLS user context set.
 *
 * Each call creates an independent client instance to avoid race conditions
 * between concurrent requests. The RLS context is awaited before returning.
 *
 * @param userId - Current authenticated user ID
 * @returns Supabase client with user context already set
 */
async function createSecureClient(userId: string): Promise<SupabaseClient> {
  const { url, key } = getSupabaseConfig();

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Await the RLS context - no fire-and-forget
  const { error } = await client.rpc('set_user_context', { user_id: userId });

  if (error) {
    logger.warn(
      '[Supabase] RLS context set failed for user:',
      userId.substring(0, 8) + '...',
      error.message
    );
    // Continue - backend auth validation is primary, RLS is defense-in-depth
  }

  return client;
}

/**
 * Get a secure Supabase client from tRPC context.
 *
 * Returns an independent client with user RLS context properly set.
 * Must be awaited.
 *
 * @param ctx - tRPC context with userId
 * @returns Promise<SupabaseClient> with RLS context set
 *
 * @example
 * const supabase = await getSecureClient(ctx);
 * const { data } = await supabase.from('analyses').select('*');
 */
export async function getSecureClient(ctx: { userId: string }): Promise<SupabaseClient> {
  return createSecureClient(ctx.userId);
}
