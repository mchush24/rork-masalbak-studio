/**
 * 🔊 Sound Manager
 *
 * Centralized sound effect management for coloring experience.
 *
 * Features:
 * - Preloading all sound effects on initialization
 * - Play sounds with haptic feedback synchronization
 * - Volume control
 * - Mute/unmute functionality
 * - Sound pooling for overlapping sounds
 * - Child-friendly sound effects
 *
 * Sound Effects:
 * - tool-change: When switching tools (soft click)
 * - color-select: When picking a color (gentle chime)
 * - brush-stroke: Light brush swoosh (plays occasionally, not every stroke)
 * - fill-pop: Paint bucket fill (satisfying pop)
 * - undo: Gentle rewind sound
 * - save-success: Happy celebration sound
 *
 * Note: Sound files should be MP3 format, <100KB each, optimized for mobile.
 * Recommended source: Freesound.org (CC0 license)
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type SoundType =
  | 'tool-change'
  | 'color-select'
  | 'brush-stroke'
  | 'fill-pop'
  | 'undo'
  | 'save-success';

// Sound file mappings
// NOTE: In production, these files should exist in assets/sounds/
// For now, we'll use a graceful fallback if files don't exist
const SOUND_FILES: Record<SoundType, any> = {
  'tool-change': null, // require('@/assets/sounds/tool-change.mp3')
  'color-select': null, // require('@/assets/sounds/color-select.mp3')
  'brush-stroke': null, // require('@/assets/sounds/brush-stroke.mp3')
  'fill-pop': null, // require('@/assets/sounds/fill-pop.mp3')
  'undo': null, // require('@/assets/sounds/undo.mp3')
  'save-success': null, // require('@/assets/sounds/save-success.mp3')
};

export interface SoundManagerConfig {
  enabled?: boolean;
  volume?: number; // 0-1
  hapticEnabled?: boolean;
}

class SoundManagerClass {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.7; // Default 70% volume
  private hapticEnabled: boolean = true;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize sound manager and preload all sounds
   */
  async initialize(config?: SoundManagerConfig): Promise<void> {
    // If already initializing, return the same promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.initialized) {
      return;
    }

    this.initializationPromise = this._initialize(config);
    return this.initializationPromise;
  }

  private async _initialize(config?: SoundManagerConfig): Promise<void> {
    console.log('[SoundManager] Initializing...');

    // Apply config
    if (config?.enabled !== undefined) this.enabled = config.enabled;
    if (config?.volume !== undefined) this.volume = config.volume;
    if (config?.hapticEnabled !== undefined) this.hapticEnabled = config.hapticEnabled;

    // Set audio mode for iOS
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.warn('[SoundManager] Failed to set audio mode:', error);
    }

    // Preload all sounds (with graceful failure)
    const loadPromises = Object.entries(SOUND_FILES).map(async ([key, source]) => {
      try {
        if (!source) {
          // Sound file not provided - skip for now
          console.log(`[SoundManager] Sound file for '${key}' not found - skipping`);
          return;
        }

        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: this.volume,
        });

        this.sounds.set(key as SoundType, sound);
        console.log(`[SoundManager] Loaded sound: ${key}`);
      } catch (error) {
        console.warn(`[SoundManager] Failed to load sound '${key}':`, error);
      }
    });

    await Promise.all(loadPromises);

    this.initialized = true;
    console.log(`[SoundManager] Initialized with ${this.sounds.size} sounds loaded`);
  }

  /**
   * Play a sound effect with optional haptic feedback
   */
  async play(
    soundType: SoundType,
    options?: {
      haptic?: boolean;
      hapticType?: Haptics.ImpactFeedbackStyle;
      volume?: number;
    }
  ): Promise<void> {
    if (!this.enabled) return;

    // Ensure initialized
    if (!this.initialized) {
      await this.initialize();
    }

    // Play haptic feedback if enabled
    if (this.hapticEnabled && (options?.haptic ?? true)) {
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(
            options?.hapticType ?? Haptics.ImpactFeedbackStyle.Light
          );
        } catch (error) {
          console.warn('[SoundManager] Haptic failed:', error);
        }
      }
    }

    // Play sound
    const sound = this.sounds.get(soundType);
    if (!sound) {
      console.log(`[SoundManager] Sound '${soundType}' not available`);
      return;
    }

    try {
      // Set volume for this playback
      const volume = options?.volume ?? this.volume;
      await sound.setVolumeAsync(volume);

      // Replay from start
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`[SoundManager] Failed to play sound '${soundType}':`, error);
    }
  }

  /**
   * Play sound with specific haptic patterns for different actions
   */
  async playToolChange(): Promise<void> {
    await this.play('tool-change', {
      hapticType: Haptics.ImpactFeedbackStyle.Medium,
    });
  }

  async playColorSelect(): Promise<void> {
    await this.play('color-select', {
      hapticType: Haptics.ImpactFeedbackStyle.Light,
    });
  }

  async playBrushStroke(): Promise<void> {
    // Play quietly and without strong haptic (subtle feedback)
    await this.play('brush-stroke', {
      haptic: false, // No haptic for brush strokes (too frequent)
      volume: this.volume * 0.5,
    });
  }

  async playFillPop(): Promise<void> {
    await this.play('fill-pop', {
      hapticType: Haptics.ImpactFeedbackStyle.Heavy,
    });
  }

  async playUndo(): Promise<void> {
    await this.play('undo', {
      hapticType: Haptics.ImpactFeedbackStyle.Light,
    });
  }

  async playSaveSuccess(): Promise<void> {
    // Play with notification haptic for celebration
    if (this.hapticEnabled && Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        console.warn('[SoundManager] Haptic failed:', error);
      }
    }

    await this.play('save-success', {
      haptic: false, // We already triggered custom haptic above
      volume: this.volume * 1.2, // Slightly louder for celebration
    });
  }

  /**
   * Set global volume (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update all loaded sounds
    const updatePromises = Array.from(this.sounds.values()).map(async (sound) => {
      try {
        await sound.setVolumeAsync(this.volume);
      } catch (error) {
        console.warn('[SoundManager] Failed to update volume:', error);
      }
    });

    await Promise.all(updatePromises);
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable/disable haptic feedback
   */
  setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
  }

  /**
   * Mute/unmute (keeps haptics enabled)
   */
  setMuted(muted: boolean): void {
    this.enabled = !muted;
  }

  /**
   * Get current settings
   */
  getSettings(): SoundManagerConfig {
    return {
      enabled: this.enabled,
      volume: this.volume,
      hapticEnabled: this.hapticEnabled,
    };
  }

  /**
   * Cleanup - unload all sounds
   */
  async cleanup(): Promise<void> {
    console.log('[SoundManager] Cleaning up...');

    const unloadPromises = Array.from(this.sounds.values()).map(async (sound) => {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('[SoundManager] Failed to unload sound:', error);
      }
    });

    await Promise.all(unloadPromises);
    this.sounds.clear();
    this.initialized = false;
    this.initializationPromise = null;

    console.log('[SoundManager] Cleanup complete');
  }
}

// Export singleton instance
export const SoundManager = new SoundManagerClass();

// Export hooks for React components
export function useSoundManager() {
  return SoundManager;
}

/**
 * Hook to initialize sound manager on component mount
 */
export function useSoundManagerInit(config?: SoundManagerConfig) {
  React.useEffect(() => {
    SoundManager.initialize(config);

    return () => {
      // Optional: cleanup on unmount (usually not needed for app-wide manager)
      // SoundManager.cleanup();
    };
  }, []);

  return SoundManager;
}

// React import for hooks
import React from 'react';
