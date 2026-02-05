/**
 * useHaptics hook - React hook for haptic feedback
 * Phase 2: Haptic System Enhancement
 *
 * Provides easy access to haptic patterns with:
 * - Automatic initialization
 * - Settings management
 * - Memoized callbacks
 */

import { useCallback, useEffect, useState } from 'react';
import { hapticService, HapticPattern } from './HapticService';

interface UseHapticsOptions {
  /** Initialize haptic service on mount */
  autoInitialize?: boolean;
}

interface UseHapticsReturn {
  /** Play a haptic pattern */
  playHaptic: (pattern: HapticPattern) => Promise<void>;
  /** Light tap */
  tapLight: () => Promise<void>;
  /** Medium tap */
  tapMedium: () => Promise<void>;
  /** Heavy tap */
  tapHeavy: () => Promise<void>;
  /** Success feedback */
  success: () => Promise<void>;
  /** Error feedback */
  error: () => Promise<void>;
  /** Warning feedback */
  warning: () => Promise<void>;
  /** Selection feedback */
  selection: () => Promise<void>;
  /** Celebration pattern */
  celebrate: () => Promise<void>;
  /** Haptics enabled status */
  isEnabled: boolean;
  /** Set haptics enabled/disabled */
  setEnabled: (enabled: boolean) => Promise<void>;
  /** Toggle haptics on/off */
  toggleHaptics: () => Promise<void>;
  /** Check if haptics are supported */
  isSupported: boolean;
}

/**
 * Hook for haptic feedback in React components
 *
 * @example
 * ```tsx
 * const { tapMedium, success, isEnabled, toggleHaptics } = useHaptics();
 *
 * // Play on button press
 * <Pressable onPress={() => { tapMedium(); doSomething(); }}>
 *
 * // Success after action
 * const handleSubmit = async () => {
 *   await submitForm();
 *   success();
 * };
 *
 * // Toggle haptics
 * <Switch value={isEnabled} onValueChange={toggleHaptics} />
 * ```
 */
export function useHaptics(options: UseHapticsOptions = {}): UseHapticsReturn {
  const { autoInitialize = true } = options;

  const [isEnabled, setIsEnabledState] = useState(hapticService.isEnabled());
  const isSupported = hapticService.isHapticSupported();

  // Initialize haptic service
  useEffect(() => {
    if (!autoInitialize) return;

    let mounted = true;

    const init = async () => {
      await hapticService.initialize();
      if (mounted) {
        setIsEnabledState(hapticService.isEnabled());
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [autoInitialize]);

  // Play any pattern
  const playHaptic = useCallback(async (pattern: HapticPattern) => {
    await hapticService.play(pattern);
  }, []);

  // Light tap
  const tapLight = useCallback(async () => {
    await hapticService.tapLight();
  }, []);

  // Medium tap
  const tapMedium = useCallback(async () => {
    await hapticService.tapMedium();
  }, []);

  // Heavy tap
  const tapHeavy = useCallback(async () => {
    await hapticService.tapHeavy();
  }, []);

  // Success
  const success = useCallback(async () => {
    await hapticService.success();
  }, []);

  // Error
  const error = useCallback(async () => {
    await hapticService.error();
  }, []);

  // Warning
  const warning = useCallback(async () => {
    await hapticService.warning();
  }, []);

  // Selection
  const selection = useCallback(async () => {
    await hapticService.selection();
  }, []);

  // Celebration
  const celebrate = useCallback(async () => {
    await hapticService.play('CELEBRATION');
  }, []);

  // Set enabled
  const setEnabled = useCallback(async (enabled: boolean) => {
    await hapticService.setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  // Toggle
  const toggleHaptics = useCallback(async () => {
    const newEnabled = !hapticService.isEnabled();
    await hapticService.setEnabled(newEnabled);
    setIsEnabledState(newEnabled);
  }, []);

  return {
    playHaptic,
    tapLight,
    tapMedium,
    tapHeavy,
    success,
    error,
    warning,
    selection,
    celebrate,
    isEnabled,
    setEnabled,
    toggleHaptics,
    isSupported,
  };
}

/**
 * Lightweight hook that only provides feedback functions
 * Use this when you don't need settings management
 */
export function useHapticFeedback() {
  const playHaptic = useCallback(async (pattern: HapticPattern) => {
    await hapticService.play(pattern);
  }, []);

  const tapLight = useCallback(async () => {
    await hapticService.tapLight();
  }, []);

  const tapMedium = useCallback(async () => {
    await hapticService.tapMedium();
  }, []);

  const tapHeavy = useCallback(async () => {
    await hapticService.tapHeavy();
  }, []);

  const success = useCallback(async () => {
    await hapticService.success();
  }, []);

  const error = useCallback(async () => {
    await hapticService.error();
  }, []);

  const selection = useCallback(async () => {
    await hapticService.selection();
  }, []);

  const warning = useCallback(async () => {
    await hapticService.warning();
  }, []);

  return { playHaptic, tapLight, tapMedium, tapHeavy, success, error, warning, selection };
}

export default useHaptics;
