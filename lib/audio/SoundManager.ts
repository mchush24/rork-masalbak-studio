/**
 * SoundManager - Central audio management for Renkioo
 * Phase 1: Sound Foundation
 *
 * Uses expo-av for audio playback with:
 * - Sound on/off setting
 * - Volume control
 * - Preload system
 * - Platform-aware (web silent by default)
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SOUNDS, SoundName, SoundCategory } from './sounds';

// Storage keys
const STORAGE_KEYS = {
  SOUND_ENABLED: '@renkioo_sound_enabled',
  SOUND_VOLUME: '@renkioo_sound_volume',
  CATEGORY_SETTINGS: '@renkioo_sound_categories',
};

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  volume: 0.7,
  categorySettings: {
    ui: true,
    celebration: true,
    gamification: true,
    mascot: true,
    analysis: true,
  } as Record<SoundCategory, boolean>,
};

interface SoundSettings {
  enabled: boolean;
  volume: number;
  categorySettings: Record<SoundCategory, boolean>;
}

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<SoundName, Audio.Sound> = new Map();
  private settings: SoundSettings = DEFAULT_SETTINGS;
  private isInitialized: boolean = false;
  private isWeb: boolean = Platform.OS === 'web';

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize the sound manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load settings from storage
      await this.loadSettings();

      // Preload frequently used sounds
      await this.preloadSounds(['UI_TAP', 'UI_SUCCESS', 'UI_ERROR', 'XP_GAIN']);

      this.isInitialized = true;
      console.log('[SoundManager] Initialized successfully');
    } catch (error) {
      console.error('[SoundManager] Initialization error:', error);
    }
  }

  /**
   * Load settings from AsyncStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const [enabledStr, volumeStr, categoryStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_VOLUME),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_SETTINGS),
      ]);

      this.settings = {
        enabled: enabledStr !== null ? JSON.parse(enabledStr) : DEFAULT_SETTINGS.enabled,
        volume: volumeStr !== null ? parseFloat(volumeStr) : DEFAULT_SETTINGS.volume,
        categorySettings: categoryStr !== null
          ? JSON.parse(categoryStr)
          : DEFAULT_SETTINGS.categorySettings,
      };
    } catch (error) {
      console.error('[SoundManager] Load settings error:', error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  private async saveSettings(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(this.settings.enabled)),
        AsyncStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, this.settings.volume.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_SETTINGS, JSON.stringify(this.settings.categorySettings)),
      ]);
    } catch (error) {
      console.error('[SoundManager] Save settings error:', error);
    }
  }

  /**
   * Preload specific sounds for instant playback
   */
  async preloadSounds(soundNames: SoundName[]): Promise<void> {
    // Skip on web for now
    if (this.isWeb) return;

    for (const name of soundNames) {
      try {
        if (this.sounds.has(name)) continue;

        const config = SOUNDS[name];
        const soundFile = this.getSoundFile(config.file);

        if (soundFile) {
          const { sound } = await Audio.Sound.createAsync(soundFile, {
            shouldPlay: false,
            volume: config.volume * this.settings.volume,
          });
          this.sounds.set(name, sound);
        }
      } catch (error) {
        console.warn(`[SoundManager] Failed to preload ${name}:`, error);
      }
    }
  }

  /**
   * Get sound file require statement
   * Note: In production, you would have actual audio files
   */
  private getSoundFile(filename: string): any {
    // Sound file mapping - will be populated with actual files
    // For now, return null as placeholder
    const soundFiles: Record<string, any> = {
      // UI Sounds
      // 'tap.mp3': require('../../assets/sounds/tap.mp3'),
      // 'success.mp3': require('../../assets/sounds/success.mp3'),
      // etc.
    };

    return soundFiles[filename] || null;
  }

  /**
   * Play a sound by name
   */
  async play(name: SoundName): Promise<void> {
    // Check if sounds are enabled
    if (!this.settings.enabled) return;

    // Skip on web
    if (this.isWeb) return;

    const config = SOUNDS[name];
    if (!config) {
      console.warn(`[SoundManager] Unknown sound: ${name}`);
      return;
    }

    // Check category setting
    if (!this.settings.categorySettings[config.category]) return;

    try {
      // Check if preloaded
      let sound = this.sounds.get(name);

      if (!sound) {
        // Load on demand
        const soundFile = this.getSoundFile(config.file);
        if (!soundFile) {
          // No sound file available, skip silently
          return;
        }

        const { sound: newSound } = await Audio.Sound.createAsync(soundFile, {
          shouldPlay: true,
          volume: config.volume * this.settings.volume,
        });

        // Clean up after playback
        newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            newSound.unloadAsync();
          }
        });

        return;
      }

      // Play preloaded sound
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(config.volume * this.settings.volume);
      await sound.playAsync();
    } catch (error) {
      console.warn(`[SoundManager] Play error for ${name}:`, error);
    }
  }

  /**
   * Play success sound shortcut
   */
  async playSuccess(): Promise<void> {
    await this.play('UI_SUCCESS');
  }

  /**
   * Play error sound shortcut
   */
  async playError(): Promise<void> {
    await this.play('UI_ERROR');
  }

  /**
   * Play tap sound shortcut
   */
  async playTap(): Promise<void> {
    await this.play('UI_TAP');
  }

  /**
   * Enable or disable sounds
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    await this.saveSettings();
  }

  /**
   * Get enabled status
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Set master volume (0.0 - 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    await this.saveSettings();

    // Update volume for preloaded sounds
    for (const [name, sound] of this.sounds) {
      const config = SOUNDS[name];
      await sound.setVolumeAsync(config.volume * this.settings.volume);
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.settings.volume;
  }

  /**
   * Enable/disable a sound category
   */
  async setCategoryEnabled(category: SoundCategory, enabled: boolean): Promise<void> {
    this.settings.categorySettings[category] = enabled;
    await this.saveSettings();
  }

  /**
   * Get category enabled status
   */
  isCategoryEnabled(category: SoundCategory): boolean {
    return this.settings.categorySettings[category];
  }

  /**
   * Get all settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  /**
   * Clean up all sounds
   */
  async cleanup(): Promise<void> {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    this.sounds.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Export class for testing
export { SoundManager };
