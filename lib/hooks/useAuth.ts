import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';

const USER_KEY = '@masalbak_user';
const ONBOARDING_KEY = '@masalbak_onboarding_completed';

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

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [userData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      console.log('[useAuth] 🔍 Loading user data...');
      console.log('[useAuth] 👤 User data:', userData);
      console.log('[useAuth] ✅ Onboarding data:', onboardingData);

      if (userData) {
        setUser(JSON.parse(userData));
        console.log('[useAuth] ✅ User loaded:', JSON.parse(userData));
      } else {
        console.log('[useAuth] ❌ No user found - should show onboarding');
      }

      if (onboardingData) {
        setHasCompletedOnboarding(JSON.parse(onboardingData));
        console.log('[useAuth] ✅ Onboarding completed:', JSON.parse(onboardingData));
      } else {
        console.log('[useAuth] ❌ Onboarding not completed');
      }
    } catch (error) {
      console.error('[useAuth] ❌ Error loading user:', error);
    } finally {
      setIsLoading(false);
      console.log('[useAuth] 🏁 Loading complete');
    }
  };

  const login = async (userData: UserSession) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([USER_KEY, ONBOARDING_KEY]);
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(true));
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const refreshUserFromBackend = async () => {
    if (!user?.userId) return;

    try {
      // This will be implemented when we add the tRPC query
      console.log('[useAuth] Refreshing user data from backend...');
      // const profile = await trpc.user.getProfile.useQuery({ userId: user.userId });
      // if (profile) {
      //   const updatedUser = { ...user, ...profile };
      //   await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      //   setUser(updatedUser);
      // }
    } catch (error) {
      console.error('[useAuth] Error refreshing user:', error);
    }
  };

  return {
    user,
    isLoading,
    hasCompletedOnboarding,
    login,
    logout,
    completeOnboarding,
    refreshUserFromBackend,
    isAuthenticated: !!user,
  };
}
