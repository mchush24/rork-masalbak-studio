import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = '@renkioo_biometric_credentials';

export interface BiometricCapability {
  isAvailable: boolean;
  biometricType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'None';
  isEnrolled: boolean;
}

export interface StoredCredentials {
  email: string;
  userId: string;
  enrolledAt: string;
}

/**
 * Hook for biometric authentication (Face ID / Touch ID)
 */
export function useBiometric() {
  const [capability, setCapability] = useState<BiometricCapability>({
    isAvailable: false,
    biometricType: 'None',
    isEnrolled: false,
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkBiometricCapability();
  }, []);

  /**
   * Check device biometric capabilities
   */
  const checkBiometricCapability = async () => {
    try {
      setIsChecking(true);

      // Check if hardware supports biometric
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setCapability({
          isAvailable: false,
          biometricType: 'None',
          isEnrolled: false,
        });
        return;
      }

      // Check if user has enrolled biometrics
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      // Determine biometric type
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometricType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'None' = 'None';

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'FaceID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = Platform.OS === 'ios' ? 'TouchID' : 'Fingerprint';
      }

      setCapability({
        isAvailable: compatible && enrolled,
        biometricType,
        isEnrolled: enrolled,
      });
    } catch (error) {
      console.error('[Biometric] Error checking capability:', error);
      setCapability({
        isAvailable: false,
        biometricType: 'None',
        isEnrolled: false,
      });
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Authenticate with biometrics
   */
  const authenticate = async (promptMessage?: string): Promise<boolean> => {
    try {
      if (!capability.isAvailable) {
        console.warn('[Biometric] Not available on this device');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Giriş yapmak için doğrulayın',
        fallbackLabel: 'Şifre Kullan',
        cancelLabel: 'İptal',
        disableDeviceFallback: false, // Allow PIN/Pattern fallback
      });

      return result.success;
    } catch (error) {
      console.error('[Biometric] Authentication error:', error);
      return false;
    }
  };

  /**
   * Store credentials securely for biometric login
   */
  const enrollBiometric = async (email: string, userId: string): Promise<boolean> => {
    try {
      if (!capability.isAvailable) {
        throw new Error('Biometric not available');
      }

      // First, authenticate to ensure user consent
      const authenticated = await authenticate('Face ID\'yi etkinleştirmek için doğrulayın');

      if (!authenticated) {
        return false;
      }

      // Store credentials in secure store
      const credentials: StoredCredentials = {
        email,
        userId,
        enrolledAt: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(
        BIOMETRIC_CREDENTIALS_KEY,
        JSON.stringify(credentials)
      );

      console.log('[Biometric] ✅ Enrollment successful');
      return true;
    } catch (error) {
      console.error('[Biometric] Enrollment error:', error);
      return false;
    }
  };

  /**
   * Get stored credentials if biometric auth succeeds
   */
  const getStoredCredentials = async (): Promise<StoredCredentials | null> => {
    try {
      const credentialsString = await SecureStore.getItemAsync(
        BIOMETRIC_CREDENTIALS_KEY
      );

      if (!credentialsString) {
        return null;
      }

      return JSON.parse(credentialsString) as StoredCredentials;
    } catch (error) {
      console.error('[Biometric] Error getting credentials:', error);
      return null;
    }
  };

  /**
   * Check if user has enrolled biometric login
   */
  const hasBiometricCredentials = async (): Promise<boolean> => {
    const credentials = await getStoredCredentials();
    return credentials !== null;
  };

  /**
   * Disable biometric login (remove stored credentials)
   */
  const disableBiometric = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      console.log('[Biometric] ✅ Biometric disabled');
    } catch (error) {
      console.error('[Biometric] Error disabling:', error);
      throw error;
    }
  };

  /**
   * Full biometric login flow
   */
  const loginWithBiometric = async (): Promise<StoredCredentials | null> => {
    try {
      // Check if credentials exist
      const hasCredentials = await hasBiometricCredentials();
      if (!hasCredentials) {
        console.log('[Biometric] No stored credentials');
        return null;
      }

      // Authenticate
      const authenticated = await authenticate('Giriş yapmak için doğrulayın');
      if (!authenticated) {
        console.log('[Biometric] Authentication failed');
        return null;
      }

      // Return stored credentials
      return await getStoredCredentials();
    } catch (error) {
      console.error('[Biometric] Login error:', error);
      return null;
    }
  };

  return {
    capability,
    isChecking,
    authenticate,
    enrollBiometric,
    disableBiometric,
    loginWithBiometric,
    hasBiometricCredentials,
    getStoredCredentials,
    checkBiometricCapability,
  };
}
