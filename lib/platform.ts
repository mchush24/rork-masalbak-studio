/**
 * Platform Utilities
 *
 * Cross-platform helper functions for iOS, Android, and Web
 */

import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Platform-safe confirmation dialog
 * Uses window.confirm on web, Alert.alert on native
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: {
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }
): void {
  const { confirmText = 'Tamam', cancelText = 'İptal', destructive = false } = options || {};

  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(title, message, [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
}

/**
 * Platform-safe alert dialog (single button)
 * Uses window.alert on web, Alert.alert on native
 */
export function showAlert(title: string, message?: string, onDismiss?: () => void): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onDismiss?.();
  } else {
    Alert.alert(title, message, [{ text: 'Tamam', onPress: onDismiss }]);
  }
}

/**
 * Platform-safe prompt dialog
 * Uses window.prompt on web, custom implementation on native would be needed
 * For now, returns null on native (not supported natively)
 */
export function showPrompt(title: string, message?: string, defaultValue?: string): string | null {
  if (Platform.OS === 'web') {
    return window.prompt(message ? `${title}\n\n${message}` : title, defaultValue);
  }
  // Native doesn't support window.prompt - would need a custom modal
  console.warn('[Platform] showPrompt is not supported on native platforms');
  return null;
}

/**
 * Check if running on web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Check if running on iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if running on Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Check if running on native (iOS or Android)
 */
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Get KeyboardAvoidingView behavior for current platform
 */
export function getKeyboardBehavior(): 'padding' | 'height' | 'position' | undefined {
  if (Platform.OS === 'ios') {
    return 'padding';
  }
  if (Platform.OS === 'android') {
    return 'height';
  }
  // Web doesn't need KeyboardAvoidingView behavior
  return undefined;
}

/**
 * Get KeyboardAvoidingView vertical offset for current platform
 */
export function getKeyboardVerticalOffset(headerHeight: number = 0): number {
  if (Platform.OS === 'ios') {
    return headerHeight || 64;
  }
  // Android and web typically don't need offset
  return 0;
}

/**
 * Platform-safe haptic feedback
 * No-op on web where Haptics API is unavailable
 */
export function hapticImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
): void {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
}

export function hapticNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): void {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(type);
  }
}

export function hapticSelection(): void {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
}

/**
 * Platform-specific styles helper
 * Returns the appropriate style based on platform
 */
export function platformSelect<T>(options: {
  ios?: T;
  android?: T;
  web?: T;
  native?: T;
  default: T;
}): T {
  if (Platform.OS === 'ios' && options.ios !== undefined) {
    return options.ios;
  }
  if (Platform.OS === 'android' && options.android !== undefined) {
    return options.android;
  }
  if (Platform.OS === 'web' && options.web !== undefined) {
    return options.web;
  }
  if (isNative && options.native !== undefined) {
    return options.native;
  }
  return options.default;
}
