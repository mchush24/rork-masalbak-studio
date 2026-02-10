/**
 * AppLockSettings - Security settings with PIN/Biometric
 * Phase 18: Professional Tools
 *
 * App lock settings for data protection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Shield,
  Lock,
  Fingerprint,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  X,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';

const STORAGE_KEYS = {
  APP_LOCK_ENABLED: '@renkioo_app_lock_enabled',
  APP_LOCK_PIN: '@renkioo_app_lock_pin',
  BIOMETRIC_ENABLED: '@renkioo_biometric_enabled',
  AUTO_LOCK_TIMEOUT: '@renkioo_auto_lock_timeout',
};

type AutoLockTimeout = 'immediate' | '1min' | '5min' | '15min' | 'never';

interface AppLockSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function AppLockSettings({ visible, onClose }: AppLockSettingsProps) {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState<AutoLockTimeout>('immediate');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinVerify, setShowPinVerify] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useSharedValue(0);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  const loadSettings = async () => {
    try {
      const [lockEnabled, biometricEnabled, timeout] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOCK_TIMEOUT),
      ]);

      setIsLockEnabled(lockEnabled === 'true');
      setIsBiometricEnabled(biometricEnabled === 'true');
      setAutoLockTimeout((timeout as AutoLockTimeout) || 'immediate');
    } catch (error) {
      console.error('Error loading lock settings:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setBiometricAvailable(compatible && enrolled);

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Parmak İzi');
      }
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const shakeAnimation = () => {
    shakeAnim.value = withSequence(
      withSpring(10, { damping: 2 }),
      withSpring(-10, { damping: 2 }),
      withSpring(10, { damping: 2 }),
      withSpring(0)
    );
  };

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const handleEnableLock = () => {
    if (isLockEnabled) {
      // Verify PIN before disabling
      setShowPinVerify(true);
    } else {
      // Setup new PIN
      setShowPinSetup(true);
      setPinStep('enter');
      setPin('');
      setConfirmPin('');
      setError('');
    }
  };

  const handlePinSubmit = async () => {
    if (pinStep === 'enter') {
      if (pin.length < 4) {
        setError('PIN en az 4 karakter olmalı');
        shakeAnimation();
        return;
      }
      setPinStep('confirm');
      setError('');
    } else {
      if (pin !== confirmPin) {
        setError('PIN\'ler eşleşmiyor');
        shakeAnimation();
        setConfirmPin('');
        return;
      }

      // Save PIN
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_PIN, pin);
        await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_ENABLED, 'true');
        setIsLockEnabled(true);
        setShowPinSetup(false);
        setPin('');
        setConfirmPin('');
      } catch (error) {
        console.error('Error saving PIN:', error);
        setError('PIN kaydedilemedi');
      }
    }
  };

  const handleVerifyPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_PIN);
      if (pin === savedPin) {
        // Disable lock
        await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_ENABLED, 'false');
        await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
        setIsLockEnabled(false);
        setIsBiometricEnabled(false);
        setShowPinVerify(false);
        setPin('');
      } else {
        setError('Yanlış PIN');
        shakeAnimation();
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
    }
  };

  const handleBiometricToggle = async () => {
    if (!biometricAvailable) {
      Alert.alert('Uyarı', 'Cihazınızda biyometrik doğrulama kullanılamıyor.');
      return;
    }

    if (!isBiometricEnabled) {
      // Verify biometric before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Biyometrik Doğrulama',
        cancelLabel: 'İptal',
        disableDeviceFallback: true,
      });

      if (result.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        setIsBiometricEnabled(true);
      }
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      setIsBiometricEnabled(false);
    }
  };

  const handleTimeoutChange = async (timeout: AutoLockTimeout) => {
    setAutoLockTimeout(timeout);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOCK_TIMEOUT, timeout);
  };

  const timeoutLabels: Record<AutoLockTimeout, string> = {
    immediate: 'Hemen',
    '1min': '1 dakika',
    '5min': '5 dakika',
    '15min': '15 dakika',
    never: 'Hiçbir zaman',
  };

  const renderPinInput = (
    value: string,
    onChange: (text: string) => void,
    title: string,
    onSubmit: () => void
  ) => (
    <Animated.View
      entering={SlideInUp}
      exiting={FadeOut}
      style={styles.pinOverlay}
    >
      <View style={styles.pinModal}>
        <View style={styles.pinHeader}>
          <Lock size={32} color={Colors.secondary.lavender} />
          <Text style={styles.pinTitle}>{title}</Text>
        </View>

        <Animated.View style={[styles.pinInputContainer, animatedShakeStyle]}>
          <TextInput
            style={styles.pinInput}
            value={value}
            onChangeText={onChange}
            placeholder="••••"
            placeholderTextColor={Colors.neutral.light}
            keyboardType="numeric"
            secureTextEntry={!showPin}
            maxLength={6}
            autoFocus
          />
          <Pressable style={styles.eyeButton} onPress={() => setShowPin(!showPin)}>
            {showPin ? (
              <EyeOff size={20} color={Colors.neutral.medium} />
            ) : (
              <Eye size={20} color={Colors.neutral.medium} />
            )}
          </Pressable>
        </Animated.View>

        {error && (
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <AlertTriangle size={14} color={Colors.status.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        <View style={styles.pinButtons}>
          <Pressable
            style={styles.pinCancelButton}
            onPress={() => {
              setShowPinSetup(false);
              setShowPinVerify(false);
              setPin('');
              setConfirmPin('');
              setError('');
              setPinStep('enter');
            }}
          >
            <Text style={styles.pinCancelText}>İptal</Text>
          </Pressable>
          <Pressable
            style={[styles.pinSubmitButton, value.length < 4 && styles.pinButtonDisabled]}
            onPress={onSubmit}
            disabled={value.length < 4}
          >
            <Text style={styles.pinSubmitText}>
              {pinStep === 'enter' && showPinSetup ? 'İleri' : 'Onayla'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Shield size={24} color={Colors.secondary.lavender} />
          </View>
          <Text style={styles.headerTitle}>Uygulama Kilidi</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.neutral.medium} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Enable Lock Toggle */}
          <Pressable style={styles.settingRow} onPress={handleEnableLock}>
            <View style={styles.settingIcon}>
              <Lock size={20} color={Colors.secondary.lavender} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Uygulama Kilidi</Text>
              <Text style={styles.settingDescription}>
                Uygulamayı açmak için PIN gerekli
              </Text>
            </View>
            <View style={[styles.toggle, isLockEnabled && styles.toggleActive]}>
              <View style={[styles.toggleKnob, isLockEnabled && styles.toggleKnobActive]} />
            </View>
          </Pressable>

          {isLockEnabled && (
            <Animated.View entering={FadeIn}>
              {/* Biometric Option */}
              {biometricAvailable && (
                <Pressable style={styles.settingRow} onPress={handleBiometricToggle}>
                  <View style={styles.settingIcon}>
                    <Fingerprint size={20} color={Colors.emotion.trust} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{biometricType}</Text>
                    <Text style={styles.settingDescription}>
                      PIN yerine {biometricType.toLowerCase()} kullan
                    </Text>
                  </View>
                  <View style={[styles.toggle, isBiometricEnabled && styles.toggleActive]}>
                    <View
                      style={[styles.toggleKnob, isBiometricEnabled && styles.toggleKnobActive]}
                    />
                  </View>
                </Pressable>
              )}

              {/* Auto-lock Timeout */}
              <View style={styles.timeoutSection}>
                <View style={styles.timeoutHeader}>
                  <Clock size={18} color={Colors.neutral.medium} />
                  <Text style={styles.timeoutTitle}>Otomatik Kilitleme</Text>
                </View>
                <Text style={styles.timeoutDescription}>
                  Arka plana alındıktan sonra ne zaman kilitlensin?
                </Text>
                <View style={styles.timeoutOptions}>
                  {(Object.keys(timeoutLabels) as AutoLockTimeout[]).map((timeout) => (
                    <Pressable
                      key={timeout}
                      style={[
                        styles.timeoutOption,
                        autoLockTimeout === timeout && styles.timeoutOptionActive,
                      ]}
                      onPress={() => handleTimeoutChange(timeout)}
                    >
                      <Text
                        style={[
                          styles.timeoutOptionText,
                          autoLockTimeout === timeout && styles.timeoutOptionTextActive,
                        ]}
                      >
                        {timeoutLabels[timeout]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Change PIN */}
              <Pressable
                style={styles.changePinButton}
                onPress={() => {
                  setShowPinSetup(true);
                  setPinStep('enter');
                  setPin('');
                  setConfirmPin('');
                  setError('');
                }}
              >
                <Lock size={16} color={Colors.secondary.lavender} />
                <Text style={styles.changePinText}>PIN Değiştir</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Shield size={16} color={Colors.neutral.medium} />
            <Text style={styles.privacyNoteText}>
              Uygulama kilidi, çocuk verilerini yetkisiz erişime karşı korur.
              KVKK ve GDPR uyumlu veri güvenliği sağlanır.
            </Text>
          </View>
        </View>

        {/* PIN Setup Modal */}
        {showPinSetup &&
          renderPinInput(
            pinStep === 'enter' ? pin : confirmPin,
            pinStep === 'enter' ? setPin : setConfirmPin,
            pinStep === 'enter' ? 'Yeni PIN Belirle' : 'PIN\'i Onayla',
            handlePinSubmit
          )}

        {/* PIN Verify Modal */}
        {showPinVerify &&
          renderPinInput(pin, setPin, 'PIN\'inizi Girin', handleVerifyPin)}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.secondary.lavender + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.neutral.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.lighter,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.secondary.lavender,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    ...shadows.xs,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  timeoutSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  timeoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timeoutTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  timeoutDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginBottom: spacing['3'],
  },
  timeoutOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeoutOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
  },
  timeoutOptionActive: {
    backgroundColor: Colors.secondary.lavender + '15',
    borderColor: Colors.secondary.lavender,
  },
  timeoutOptionText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  timeoutOptionTextActive: {
    color: Colors.secondary.lavender,
    fontWeight: typography.weight.semibold,
  },
  changePinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: Colors.secondary.lavender + '10',
  },
  changePinText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 'auto',
    padding: 16,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    lineHeight: typography.lineHeightPx.sm,
  },
  // PIN Modal Styles
  pinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pinModal: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
  },
  pinHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pinTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginTop: spacing['3'],
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    marginBottom: 12,
  },
  pinInput: {
    flex: 1,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    letterSpacing: 8,
  },
  eyeButton: {
    padding: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: Colors.status.error,
  },
  pinButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pinCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
  },
  pinCancelText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
  },
  pinSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.secondary.lavender,
  },
  pinButtonDisabled: {
    opacity: 0.5,
  },
  pinSubmitText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
  },
});

export default AppLockSettings;
