/**
 * Supabase Client Configuration
 *
 * This file provides Supabase clients for both:
 * - Frontend (React Native): Uses ANON key with AsyncStorage
 * - Backend (Node.js): Uses SERVICE_ROLE key for admin operations
 *
 * Features:
 * - Auto-refresh tokens
 * - Persist sessions in AsyncStorage (mobile)
 * - Type-safe auth methods
 */

import { createClient } from '@supabase/supabase-js';

// Detect if we're running in React Native, Web, or Node.js
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// App URL scheme - must match app.config.js scheme
// Used for deep linking (e.g., password reset redirect)
const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME || 'renkioo';

// Backend Supabase Client (Service Role - Admin Access)
// Only initialize in Node.js environment (backend)
const supabaseUrl = process.env.SUPABASE_URL || '';
// Support both naming conventions
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';

// Only create backend client in Node.js environment
export const supabase = !isBrowser && supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any; // In browser, this will be null (not used)

// Frontend Supabase Client (Anon Key - User Access)
let supabaseFrontend: ReturnType<typeof createClient> | null = null;

/**
 * Get Supabase client for frontend (React Native & Web)
 * This client uses the ANON key and AsyncStorage for session persistence
 */
export async function getSupabaseFrontend() {
  if (supabaseFrontend) return supabaseFrontend;

  const Constants = (await import('expo-constants')).default;

  const frontendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const frontendAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!frontendUrl || !frontendAnonKey) {
    throw new Error(
      'Supabase URL and Anon Key must be set in environment variables.\n' +
      'Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
    );
  }

  // React Native: Use AsyncStorage for session persistence
  if (isReactNative) {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    supabaseFrontend = createClient(frontendUrl, frontendAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } else {
    // Web: Use localStorage (default)
    supabaseFrontend = createClient(frontendUrl, frontendAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseFrontend;
}

/**
 * Auth Helper Functions (Frontend)
 */

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, metadata?: { name?: string }) {
  const client = await getSupabaseFrontend();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string) {
  const client = await getSupabaseFrontend();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const client = await getSupabaseFrontend();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session
 */
export async function getSession() {
  const client = await getSupabaseFrontend();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const client = await getSupabaseFrontend();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const client = await getSupabaseFrontend();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_SCHEME}://reset-password`,
  });
  if (error) throw error;
}

/**
 * Update password with reset token
 */
export async function updatePassword(newPassword: string) {
  const client = await getSupabaseFrontend();
  const { error } = await client.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}

/**
 * Listen to auth state changes
 *
 * @example
 * const client = await getSupabaseFrontend();
 * const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
 *   if (event === 'SIGNED_IN') console.log('User signed in:', session?.user);
 *   if (event === 'SIGNED_OUT') console.log('User signed out');
 * });
 *
 * // Cleanup
 * subscription.unsubscribe();
 */

// Type Exports
export type User = {
  id: string;
  email: string;
  name?: string;
  child_age?: number;
  created_at: string;
  onboarding_completed: boolean;
};
