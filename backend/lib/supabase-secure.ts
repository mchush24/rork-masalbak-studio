/**
 * Secure Supabase Client with RLS Context Support
 *
 * This module provides a wrapper around Supabase client that automatically
 * sets the current user context for Row Level Security (RLS) policies.
 *
 * How it works:
 * 1. Before each query, we set `app.current_user_id` session variable
 * 2. RLS policies use `current_setting('app.current_user_id')` to check ownership
 * 3. This provides database-level security on top of backend JWT validation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _secureClient: SupabaseClient | null = null;

function getSecureSupabaseClient(): SupabaseClient {
  if (_secureClient) return _secureClient;

  const url = process.env.SUPABASE_URL;
  // Support both naming conventions
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    console.error('[Supabase] Missing env vars. SUPABASE_URL:', !!url, 'SUPABASE_SERVICE_ROLE:', !!key);
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  _secureClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _secureClient;
}

// Base Supabase client (used by legacy code) - lazy loaded via Proxy
export const supa = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSecureSupabaseClient() as any)[prop];
  }
});

/**
 * Execute a query with user context set for RLS
 *
 * @param userId - Current authenticated user ID
 * @param callback - Database operation to execute
 * @returns Result from the callback
 *
 * @example
 * const profile = await withUserContext(userId, async (client) => {
 *   return await client.from('users').select('*').eq('id', userId).single();
 * });
 */
export async function withUserContext<T>(
  userId: string,
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  // Set the user context for this session
  const { error: setError } = await supa.rpc('set_user_context', { user_id: userId });

  if (setError) {
    console.error('[Supabase] Failed to set user context:', setError);
    // Continue anyway - backend validation is primary, RLS is secondary
  }

  try {
    // Execute the query with context set
    return await callback(supa);
  } finally {
    // Clear the context after query (optional, as session is short-lived)
    try {
      await supa.rpc('clear_user_context');
    } catch {
      // Ignore errors on cleanup
    }
  }
}

/**
 * Create a Supabase client wrapper that automatically sets user context
 *
 * @param userId - Current authenticated user ID
 * @returns Supabase client with user context pre-configured
 *
 * @example
 * const client = createSecureClient(ctx.userId);
 * const { data } = await client.from('analyses').select('*');
 */
export function createSecureClient(userId: string): SupabaseClient {
  // Create a proxy that intercepts .from() calls to set context
  const client = supa;

  const originalFrom = client.from.bind(client);

  // @ts-ignore - Monkey patching for context injection
  client.from = function(table: string) {
    // Set context before query (fire and forget for performance)
    supa.rpc('set_user_context', { user_id: userId }).then(
      () => {},
      (err: any) => console.warn('[Supabase] Context set warning:', err?.message)
    );

    return originalFrom(table);
  };

  return client;
}

/**
 * Helper to get a secure client from tRPC context
 *
 * @param ctx - tRPC context with userId
 * @returns Secure Supabase client
 */
export function getSecureClient(ctx: { userId: string }): SupabaseClient {
  return createSecureClient(ctx.userId);
}
