/**
 * Auth Context Provider (Singleton)
 *
 * Provides a single source of truth for authentication state across the app.
 * Previously useAuth() was a plain hook that created independent state in each
 * component - now all consumers share the same state via React Context.
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';
import {
  getSupabaseFrontend,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
} from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Subscription } from '@supabase/auth-js';
import { getErrorMessage } from '@/lib/utils/error';
import { secureStorage, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/secure-storage';

const ONBOARDING_KEY = '@renkioo_onboarding_completed';
const MANUAL_SESSION_KEY = '@renkioo_manual_session';

// Legacy keys for migration
const LEGACY_ONBOARDING_KEY = '@masalbak_onboarding_completed';
const LEGACY_MANUAL_SESSION_KEY = '@masalbak_manual_session';

export interface Child {
  name: string;
  age: number;
  birthDate?: string;
  gender?: 'male' | 'female';
  avatarId?: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name?: string;
  childAge?: number;
  children?: Child[];
  avatarUrl?: string;
  language?: string;
  preferences?: Record<string, unknown>;
}

interface AuthContextType {
  user: UserSession | null;
  session: Session | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ user: unknown; session: unknown }>;
  login: (email: string, password: string) => Promise<{ user: unknown; session: unknown }>;
  loginWithPassword: (email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshUserFromBackend: () => Promise<void>;
  setUserSession: (
    userId: string,
    email: string,
    name?: string,
    accessToken?: string,
    refreshToken?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const authSubscriptionRef = useRef<Subscription | null>(null);

  const migrateLegacyKeys = async () => {
    try {
      const legacyOnboarding = await AsyncStorage.getItem(LEGACY_ONBOARDING_KEY);
      if (legacyOnboarding) {
        await AsyncStorage.setItem(ONBOARDING_KEY, legacyOnboarding);
        await AsyncStorage.removeItem(LEGACY_ONBOARDING_KEY);
        console.log('[Auth] Migrated onboarding status from legacy key');
      }

      const legacySession = await AsyncStorage.getItem(LEGACY_MANUAL_SESSION_KEY);
      if (legacySession) {
        await AsyncStorage.setItem(MANUAL_SESSION_KEY, legacySession);
        await AsyncStorage.removeItem(LEGACY_MANUAL_SESSION_KEY);
        console.log('[Auth] Migrated manual session from legacy key');
      }
    } catch (error) {
      console.error('[Auth] Error migrating legacy keys:', error);
    }
  };

  useEffect(() => {
    initAuth();

    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Try to refresh the access token using the stored refresh token.
   * Returns true if refresh was successful, false otherwise.
   */
  const tryRefreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      console.log('[Auth] Attempting token refresh...');
      const result = await trpcClient.auth.refreshToken.mutate({ refreshToken });

      if (result.success && result.accessToken && result.refreshToken) {
        await secureStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
        await secureStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
        console.log('[Auth] Token refreshed successfully');

        // Re-fetch profile with new token
        try {
          const profile = await trpcClient.user.getProfile.query();
          if (profile) {
            const updatedUser: UserSession = {
              userId: profile.id,
              email: profile.email,
              name: profile.name || undefined,
              children: profile.children as unknown as Child[] | undefined,
              avatarUrl: profile.avatar_url || undefined,
              language: profile.language || undefined,
              preferences: profile.preferences as Record<string, unknown> | undefined,
            };
            setUser(updatedUser);
            await AsyncStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify(updatedUser));
          }
        } catch {
          // Profile fetch failed but token is refreshed
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', getErrorMessage(error));
      return false;
    }
  };

  const initAuth = async () => {
    try {
      console.log('[Auth] Initializing...');

      await migrateLegacyKeys();

      const client = await getSupabaseFrontend();

      const {
        data: { session: currentSession },
        error,
      } = await client.auth.getSession();

      if (error) {
        console.error('[Auth] Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (currentSession) {
        await handleAuthSession(currentSession);
      } else {
        const manualSessionData = await AsyncStorage.getItem(MANUAL_SESSION_KEY);
        if (manualSessionData) {
          console.log('[Auth] Restoring manual session');
          const manualUser = JSON.parse(manualSessionData) as UserSession;

          const accessToken = await secureStorage.getItem(ACCESS_TOKEN_KEY);
          if (accessToken) {
            try {
              const profile = await trpcClient.user.getProfile.query();
              if (profile) {
                const updatedUser: UserSession = {
                  userId: profile.id,
                  email: profile.email,
                  name: profile.name || undefined,
                  children: profile.children as unknown as Child[] | undefined,
                  avatarUrl: profile.avatar_url || undefined,
                  language: profile.language || undefined,
                  preferences: profile.preferences as Record<string, unknown> | undefined,
                };
                setUser(updatedUser);
                await AsyncStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify(updatedUser));
                console.log('[Auth] Token validated, session restored:', updatedUser.email);
              }
            } catch (tokenError) {
              console.error('[Auth] Token validation failed:', getErrorMessage(tokenError));
              // Try to refresh the token before clearing session
              const refreshed = await tryRefreshToken();
              if (!refreshed) {
                await AsyncStorage.removeItem(MANUAL_SESSION_KEY);
                await secureStorage.deleteItem(ACCESS_TOKEN_KEY);
                await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
                console.log('[Auth] Invalid session cleared');
              }
            }
          } else {
            console.warn('[Auth] No access token found, using cached session');
            setUser(manualUser);
          }
        }
      }

      const onboardingData = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboardingData) {
        setHasCompletedOnboarding(JSON.parse(onboardingData));
      }

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(async (event, newSession) => {
        console.log('[Auth] State changed:', event);

        if (event === 'SIGNED_IN' && newSession) {
          await handleAuthSession(newSession);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
        }
      });

      authSubscriptionRef.current = subscription;

      setIsLoading(false);
      console.log('[Auth] Initialized');
    } catch (error) {
      console.error('[Auth] Error initializing:', error);
      setIsLoading(false);
    }
  };

  const handleAuthSession = async (authSession: Session) => {
    try {
      setSession(authSession);

      const supabaseUser = authSession.user;
      console.log('[Auth] Supabase user:', supabaseUser.email);

      const profile = await trpcClient.user.getProfile.query();

      if (profile) {
        const userSession: UserSession = {
          userId: profile.id,
          email: profile.email,
          name: profile.name || undefined,
          children: profile.children as unknown as Child[] | undefined,
          avatarUrl: profile.avatar_url || undefined,
          language: profile.language || undefined,
          preferences: profile.preferences as Record<string, unknown> | undefined,
        };

        setUser(userSession);
        console.log('[Auth] Profile loaded:', userSession.email);
      }
    } catch (error) {
      console.error('[Auth] Error handling session:', error);

      const basicUser: UserSession = {
        userId: authSession.user.id,
        email: authSession.user.email!,
        name: authSession.user.user_metadata?.name,
      };

      setUser(basicUser);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('[Auth] Signing up:', email);

      const { user: supabaseUser, session: authSession } = await supabaseSignUp(email, password, {
        name,
      });

      if (!supabaseUser || !authSession) {
        throw new Error('Sign up failed - no user or session returned');
      }

      console.log('[Auth] Sign up successful:', supabaseUser.email);
      return { user: supabaseUser, session: authSession };
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      throw new Error(getErrorMessage(error) || 'Sign up failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Logging in:', email);

      const { user: supabaseUser, session: authSession } = await supabaseSignIn(email, password);

      if (!supabaseUser || !authSession) {
        throw new Error('Login failed - no user or session returned');
      }

      console.log('[Auth] Login successful:', supabaseUser.email);
      return { user: supabaseUser, session: authSession };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw new Error(getErrorMessage(error) || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logging out...');

      await supabaseSignOut();

      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(MANUAL_SESSION_KEY);

      await secureStorage.deleteItem(ACCESS_TOKEN_KEY);
      await secureStorage.deleteItem(REFRESH_TOKEN_KEY);

      setUser(null);
      setSession(null);
      setHasCompletedOnboarding(false);

      console.log('[Auth] Logged out');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await trpcClient.auth.completeOnboarding.mutate();
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(true));
      setHasCompletedOnboarding(true);
      console.log('[Auth] Onboarding completed');
    } catch (error) {
      console.error('[Auth] Error completing onboarding:', error);
      throw error;
    }
  };

  const refreshUserFromBackend = async () => {
    if (!user?.userId) return;

    try {
      console.log('[Auth] Refreshing user profile...');

      const profile = await trpcClient.user.getProfile.query();

      if (profile) {
        const updatedUser: UserSession = {
          userId: profile.id,
          email: profile.email,
          name: profile.name || undefined,
          children: profile.children as unknown as Child[] | undefined,
          avatarUrl: profile.avatar_url || undefined,
          language: profile.language || undefined,
          preferences: profile.preferences as Record<string, unknown> | undefined,
        };

        setUser(updatedUser);
        await AsyncStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify(updatedUser));
        console.log('[Auth] Profile refreshed');
      }
    } catch (error) {
      console.error('[Auth] Error refreshing user:', error);
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    try {
      console.log('[Auth] Logging in with password:', email);

      const result = await trpcClient.auth.loginWithPassword.mutate({
        email,
        password,
      });

      if (result.success && result.userId) {
        await setUserSessionInternal(
          result.userId,
          result.email!,
          result.name,
          result.accessToken,
          result.refreshToken
        );
        return result;
      }

      return result;
    } catch (error) {
      console.error('[Auth] Password login error:', getErrorMessage(error));
      throw error;
    }
  };

  const setUserSessionInternal = async (
    userId: string,
    email: string,
    name?: string,
    accessToken?: string,
    refreshToken?: string
  ) => {
    try {
      console.log('[Auth] Setting user session:', email);

      if (accessToken) {
        await secureStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      }
      if (refreshToken) {
        await secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      const userSession: UserSession = { userId, email, name };

      let finalSession = userSession;
      try {
        const profile = await trpcClient.user.getProfile.query();
        if (profile) {
          finalSession = {
            userId: profile.id,
            email: profile.email,
            name: profile.name || undefined,
            children: profile.children as unknown as Child[] | undefined,
            avatarUrl: profile.avatar_url || undefined,
            language: profile.language || undefined,
            preferences: profile.preferences as Record<string, unknown> | undefined,
          };
        }
      } catch (_profileError) {
        console.log('[Auth] Could not fetch full profile, using basic session');
      }

      setUser(finalSession);
      await AsyncStorage.setItem(MANUAL_SESSION_KEY, JSON.stringify(finalSession));

      console.log('[Auth] Session set:', finalSession.email);
    } catch (error) {
      console.error('[Auth] Error setting user session:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        hasCompletedOnboarding,
        isAuthenticated: !!user,
        signUp,
        login,
        loginWithPassword,
        logout,
        completeOnboarding,
        refreshUserFromBackend,
        setUserSession: setUserSessionInternal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
