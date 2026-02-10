/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useAuth Hook Tests
 *
 * Tests for the authentication hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// Import after mocks
import { useAuth } from '../useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Mock dependencies before importing the hook
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
/* eslint-enable @typescript-eslint/no-require-imports */

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/trpc', () => ({
  trpc: {
    user: {
      getProfile: {
        useQuery: jest.fn(() => ({
          data: null,
          isLoading: false,
          error: null,
        })),
      },
    },
  },
  trpcClient: {
    user: {
      getProfile: {
        query: jest.fn(() => Promise.resolve(null)),
      },
    },
  },
}));

jest.mock('@/lib/supabase', () => ({
  getSupabaseFrontend: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
  })),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initial state', () => {
    it('starts with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('resolves loading state after initialization', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('starts with user not authenticated', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('onboarding state', () => {
    it('checks onboarding completion from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // AsyncStorage.getItem should have been called to check onboarding
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it('marks onboarding as complete', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.completeOnboarding();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('onboarding'),
        'true'
      );
    });
  });

  describe('authentication helpers', () => {
    it('provides isAuthenticated computed value', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.isAuthenticated).toBe('boolean');
    });

    it('exposes login function', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.login).toBe('function');
    });

    it('exposes logout function', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.logout).toBe('function');
    });

    it('exposes register function', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof (result.current as any).register).toBe('function');
    });
  });

  describe('logout', () => {
    it('clears user on logout', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('clears tokens from secure storage on logout', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('child management', () => {
    it('exposes addChild function', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof (result.current as any).addChild).toBe('function');
    });

    it('exposes updateChild function', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof (result.current as any).updateChild).toBe('function');
    });
  });
});
