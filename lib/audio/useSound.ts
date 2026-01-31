/**
 * useSound hook - React hook for sound playback
 * Phase 1: Sound Foundation
 *
 * Provides easy access to sound playback with:
 * - Automatic initialization
 * - Settings management
 * - Memoized callbacks
 */

import { useCallback, useEffect, useState } from 'react';
import { soundManager } from './SoundManager';
import { SoundName, SoundCategory } from './sounds';

interface UseSoundOptions {
  /** Initialize sound manager on mount */
  autoInitialize?: boolean;
}

interface UseSoundReturn {
  /** Play a sound by name */
  playSound: (name: SoundName) => Promise<void>;
  /** Play tap sound */
  playTap: () => Promise<void>;
  /** Play success sound */
  playSuccess: () => Promise<void>;
  /** Play error sound */
  playError: () => Promise<void>;
  /** Sound enabled status */
  isEnabled: boolean;
  /** Set sound enabled/disabled */
  setEnabled: (enabled: boolean) => Promise<void>;
  /** Toggle sound on/off */
  toggleSound: () => Promise<void>;
  /** Current volume (0-1) */
  volume: number;
  /** Set volume */
  setVolume: (volume: number) => Promise<void>;
  /** Check if category is enabled */
  isCategoryEnabled: (category: SoundCategory) => boolean;
  /** Set category enabled/disabled */
  setCategoryEnabled: (category: SoundCategory, enabled: boolean) => Promise<void>;
  /** Sound manager initialized */
  isInitialized: boolean;
}

/**
 * Hook for playing sounds in React components
 *
 * @example
 * ```tsx
 * const { playTap, playSuccess, isEnabled, toggleSound } = useSound();
 *
 * // Play on button press
 * <Pressable onPress={() => { playTap(); doSomething(); }}>
 *
 * // Toggle sound
 * <Switch value={isEnabled} onValueChange={toggleSound} />
 * ```
 */
export function useSound(options: UseSoundOptions = {}): UseSoundReturn {
  const { autoInitialize = true } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabledState] = useState(soundManager.isEnabled());
  const [volume, setVolumeState] = useState(soundManager.getVolume());

  // Initialize sound manager
  useEffect(() => {
    if (!autoInitialize) return;

    let mounted = true;

    const init = async () => {
      await soundManager.initialize();
      if (mounted) {
        setIsInitialized(true);
        setIsEnabledState(soundManager.isEnabled());
        setVolumeState(soundManager.getVolume());
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [autoInitialize]);

  // Play any sound
  const playSound = useCallback(async (name: SoundName) => {
    await soundManager.play(name);
  }, []);

  // Play tap sound
  const playTap = useCallback(async () => {
    await soundManager.playTap();
  }, []);

  // Play success sound
  const playSuccess = useCallback(async () => {
    await soundManager.playSuccess();
  }, []);

  // Play error sound
  const playError = useCallback(async () => {
    await soundManager.playError();
  }, []);

  // Set enabled
  const setEnabled = useCallback(async (enabled: boolean) => {
    await soundManager.setEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(async () => {
    const newEnabled = !soundManager.isEnabled();
    await soundManager.setEnabled(newEnabled);
    setIsEnabledState(newEnabled);
  }, []);

  // Set volume
  const setVolume = useCallback(async (newVolume: number) => {
    await soundManager.setVolume(newVolume);
    setVolumeState(newVolume);
  }, []);

  // Check category enabled
  const isCategoryEnabled = useCallback((category: SoundCategory) => {
    return soundManager.isCategoryEnabled(category);
  }, []);

  // Set category enabled
  const setCategoryEnabled = useCallback(async (category: SoundCategory, enabled: boolean) => {
    await soundManager.setCategoryEnabled(category, enabled);
  }, []);

  return {
    playSound,
    playTap,
    playSuccess,
    playError,
    isEnabled,
    setEnabled,
    toggleSound,
    volume,
    setVolume,
    isCategoryEnabled,
    setCategoryEnabled,
    isInitialized,
  };
}

/**
 * Lightweight hook that only provides playback functions
 * Use this when you don't need settings management
 */
export function useSoundPlayer() {
  const playSound = useCallback(async (name: SoundName) => {
    await soundManager.play(name);
  }, []);

  const playTap = useCallback(async () => {
    await soundManager.playTap();
  }, []);

  const playSuccess = useCallback(async () => {
    await soundManager.playSuccess();
  }, []);

  const playError = useCallback(async () => {
    await soundManager.playError();
  }, []);

  return { playSound, playTap, playSuccess, playError };
}

export default useSound;
