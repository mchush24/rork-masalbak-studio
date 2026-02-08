/**
 * Secure Token Storage
 *
 * Platform-aware storage for sensitive data like JWT tokens.
 * - Native (iOS/Android): Uses expo-secure-store (encrypted keychain/keystore)
 * - Web: Falls back to AsyncStorage (localStorage-based)
 *
 * Extracted into its own module to avoid circular dependencies
 * between AuthContext and tRPC client.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage key constants - shared between auth and tRPC
export const ACCESS_TOKEN_KEY = 'renkioo_access_token';
export const REFRESH_TOKEN_KEY = 'renkioo_refresh_token';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`@${key}`, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(`@${key}`);
    } else {
      return SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(`@${key}`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
