import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc, trpcClient } from '@/lib/trpc';
import { getSupabaseFrontend, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

const ONBOARDING_KEY = '@masalbak_onboarding_completed';
const MANUAL_SESSION_KEY = '@masalbak_manual_session';

export interface Child {
  name: string;
  age: number;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UserSession {
  userId: string;
  email: string;
  name?: string;
  childAge?: number; // Deprecated: use children array instead
  children?: Child[];
  avatarUrl?: string;
  language?: string;
  preferences?: Record<string, any>;
}

/**
 * Auth Hook with Supabase Integration
 *
 * Features:
 * - Supabase Auth for real authentication
 * - Session persistence via AsyncStorage
 * - Auto-refresh tokens
 * - Auth state listener
 */
export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Load user and listen to auth changes
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      console.log('[useAuth] 🔍 Initializing auth...');

      const client = await getSupabaseFrontend();

      // Get current session
      const { data: { session: currentSession }, error } = await client.auth.getSession();

      if (error) {
        console.error('[useAuth] ❌ Error getting session:', error);
        setIsLoading(false);
        return;
      }

      console.log('[useAuth] 📦 Current session:', currentSession ? 'Found' : 'None');

      if (currentSession) {
        await handleAuthSession(currentSession);
      } else {
        // No Supabase session - check for manual session
        const manualSessionData = await AsyncStorage.getItem(MANUAL_SESSION_KEY);
        if (manualSessionData) {
          console.log('[useAuth] 📱 Restoring manual session from AsyncStorage');
          const manualUser = JSON.parse(manualSessionData) as UserSession;
          setUser(manualUser);
        }
      }

      // Load onboarding status
      const onboardingData = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboardingData) {
        setHasCompletedOnboarding(JSON.parse(onboardingData));
      }

      // Listen to auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, newSession) => {
        console.log('[useAuth] 🔔 Auth state changed:', event);

        if (event === 'SIGNED_IN' && newSession) {
          await handleAuthSession(newSession);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
        }
      });

      setIsLoading(false);
      console.log('[useAuth] ✅ Auth initialized');

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('[useAuth] ❌ Error initializing auth:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle auth session and sync with backend
   */
  const handleAuthSession = async (authSession: Session) => {
    try {
      setSession(authSession);

      const supabaseUser = authSession.user;
      console.log('[useAuth] 👤 Supabase user:', supabaseUser.email);

      // Fetch user profile from backend
      const profile = await trpcClient.user.getProfile.query({
        userId: supabaseUser.id,
      });

      if (profile) {
        const userSession: UserSession = {
          userId: profile.id,
          email: profile.email,
          name: profile.name || undefined,
          children: profile.children as Child[] | undefined,
          avatarUrl: profile.avatar_url || undefined,
          language: profile.language || undefined,
          preferences: profile.preferences as Record<string, any> | undefined,
        };

        setUser(userSession);
        console.log('[useAuth] ✅ User profile loaded:', userSession.email);
      }
    } catch (error) {
      console.error('[useAuth] ❌ Error handling auth session:', error);

      // If backend profile doesn't exist, create basic user session from Supabase user
      const basicUser: UserSession = {
        userId: authSession.user.id,
        email: authSession.user.email!,
        name: authSession.user.user_metadata?.name,
      };

      setUser(basicUser);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('[useAuth] 📝 Signing up:', email);

      const { user: supabaseUser, session: authSession } = await supabaseSignUp(email, password, { name });

      if (!supabaseUser || !authSession) {
        throw new Error('Sign up failed - no user or session returned');
      }

      console.log('[useAuth] ✅ Sign up successful:', supabaseUser.email);

      // Session will be handled by onAuthStateChange listener
      return { user: supabaseUser, session: authSession };
    } catch (error: any) {
      console.error('[useAuth] ❌ Sign up error:', error);
      throw new Error(error.message || 'Sign up failed');
    }
  };

  /**
   * Sign in with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      console.log('[useAuth] 🔐 Logging in:', email);

      const { user: supabaseUser, session: authSession } = await supabaseSignIn(email, password);

      if (!supabaseUser || !authSession) {
        throw new Error('Login failed - no user or session returned');
      }

      console.log('[useAuth] ✅ Login successful:', supabaseUser.email);

      // Session will be handled by onAuthStateChange listener
      return { user: supabaseUser, session: authSession };
    } catch (error: any) {
      console.error('[useAuth] ❌ Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      console.log('[useAuth] 👋 Logging out...');

      await supabaseSignOut();
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(MANUAL_SESSION_KEY);

      setUser(null);
      setSession(null);
      setHasCompletedOnboarding(false);

      console.log('[useAuth] ✅ Logged out successfully');
    } catch (error) {
      console.error('[useAuth] ❌ Logout error:', error);
      throw error;
    }
  };

  /**
   * Complete onboarding
   */
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(true));
      setHasCompletedOnboarding(true);
      console.log('[useAuth] ✅ Onboarding completed');
    } catch (error) {
      console.error('[useAuth] ❌ Error completing onboarding:', error);
      throw error;
    }
  };

  /**
   * Refresh user profile from backend
   */
  const refreshUserFromBackend = async () => {
    if (!user?.userId) return;

    try {
      console.log('[useAuth] 🔄 Refreshing user profile...');

      const profile = await trpcClient.user.getProfile.query({
        userId: user.userId,
      });

      if (profile) {
        const updatedUser: UserSession = {
          userId: profile.id,
          email: profile.email,
          name: profile.name || undefined,
          children: profile.children as Child[] | undefined,
          avatarUrl: profile.avatar_url || undefined,
          language: profile.language || undefined,
          preferences: profile.preferences as Record<string, any> | undefined,
        };

        setUser(updatedUser);
        // Also update AsyncStorage for persistence
        await AsyncStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify(updatedUser));
        console.log('[useAuth] ✅ User profile refreshed and persisted');
      }
    } catch (error) {
      console.error('[useAuth] ❌ Error refreshing user:', error);
    }
  };

  /**
   * Manually set user session (for custom auth flows like email verification)
   */
  const setUserSession = async (userId: string, email: string, name?: string) => {
    try {
      console.log('[useAuth] 📝 Setting user session manually:', email);

      // Create basic user session
      const userSession: UserSession = {
        userId,
        email,
        name,
      };

      // Refresh from backend to get full profile (triggers session creation)
      let finalSession = userSession;
      try {
        const profile = await trpcClient.user.getProfile.query({ userId });
        if (profile) {
          finalSession = {
            userId: profile.id,
            email: profile.email,
            name: profile.name || undefined,
            children: profile.children as Child[] | undefined,
            avatarUrl: profile.avatar_url || undefined,
            language: profile.language || undefined,
            preferences: profile.preferences as Record<string, any> | undefined,
          };
          console.log('[useAuth] ✅ Full profile loaded from backend');
        }
      } catch (profileError) {
        console.log('[useAuth] ⚠️ Could not fetch full profile, using basic session');
      }

      // Save to both state and AsyncStorage
      setUser(finalSession);
      await AsyncStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify(finalSession));

      console.log('[useAuth] ✅ User session set and persisted:', finalSession.email);
    } catch (error) {
      console.error('[useAuth] ❌ Error setting user session:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    isLoading,
    hasCompletedOnboarding,
    signUp,
    login,
    logout,
    completeOnboarding,
    refreshUserFromBackend,
    setUserSession,
    isAuthenticated: !!user && !!session,
  };
}
