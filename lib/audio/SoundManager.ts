/**
 * SoundManager - Ses yönetim servisi
 *
 * Uygulama genelinde ses efektlerini yönetir:
 * - Ses açma/kapama
 * - Ses seviyesi kontrolü
 * - Preload sistemi
 * - Platform uyumluluğu (web sessiz)
 */

import { useAudioPlayer, AudioSource } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SOUNDS, SoundName, SoundCategory } from './sounds';

// Storage keys
const STORAGE_KEYS = {
  SOUND_ENABLED: '@renkioo/sound_enabled',
  SOUND_VOLUME: '@renkioo/sound_volume',
  CATEGORY_ENABLED: '@renkioo/sound_category_',
};

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  volume: 0.7,
  categoryEnabled: {
    ui: true,
    gamification: true,
    celebration: true,
    mascot: true,
    coloring: true,
    story: true,
    analysis: true,
  } as Record<SoundCategory, boolean>,
};

interface SoundSettings {
  enabled: boolean;
  volume: number;
  categoryEnabled: Record<SoundCategory, boolean>;
}

class SoundManagerClass {
  private settings: SoundSettings = { ...DEFAULT_SETTINGS };
  private initialized: boolean = false;
  private isWeb: boolean = Platform.OS === 'web';

  /**
   * Initialize the sound manager
   * Should be called once at app startup
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load settings from storage
      await this.loadSettings();

      this.initialized = true;
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
      const [enabledStr, volumeStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.SOUND_VOLUME),
      ]);

      if (enabledStr !== null) {
        this.settings.enabled = enabledStr === 'true';
      }

      if (volumeStr !== null) {
        this.settings.volume = parseFloat(volumeStr);
      }

      // Load category settings
      for (const category of Object.keys(DEFAULT_SETTINGS.categoryEnabled) as SoundCategory[]) {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_ENABLED + category);
        if (value !== null) {
          this.settings.categoryEnabled[category] = value === 'true';
        }
      }
    } catch (error) {
      console.error('[SoundManager] Failed to load settings:', error);
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  private async saveSettings(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(this.settings.enabled)),
        AsyncStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, String(this.settings.volume)),
      ]);

      for (const [category, enabled] of Object.entries(this.settings.categoryEnabled)) {
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_ENABLED + category, String(enabled));
      }
    } catch (error) {
      console.error('[SoundManager] Failed to save settings:', error);
    }
  }

  /**
   * Play a sound by name
   * Note: expo-audio uses a hook-based approach. For imperative usage,
   * we create a simple audio player inline.
   */
  async play(soundName: SoundName): Promise<void> {
    // Skip on web or if sounds disabled
    if (this.isWeb || !this.settings.enabled) return;

    const soundDef = SOUNDS[soundName];
    if (!soundDef) {
      console.warn(`[SoundManager] Sound not found: ${soundName}`);
      return;
    }

    // Check if category is enabled
    if (!this.settings.categoryEnabled[soundDef.category]) {
      return;
    }

    try {
      // expo-audio is primarily hook-based, but for imperative playback
      // in a class-based manager, we use a simple approach
      // Note: Sound files are placeholder URIs - actual implementation
      // would use local require() statements
      const soundAsset = this.getSoundAsset(soundName);

      // For expo-audio, we'd typically use the useAudioPlayer hook in components
      // For now, log that sound would play (actual files not implemented)
      console.debug(`[SoundManager] Would play sound: ${soundName} at volume ${soundDef.volume * this.settings.volume}`);
    } catch (error) {
      // Silently fail - sounds are optional
      console.debug(`[SoundManager] Failed to play sound: ${soundName}`, error);
    }
  }

  /**
   * Get sound asset - placeholder for now
   * In production, this would return require() statements
   */
  private getSoundAsset(soundName: SoundName): AudioSource {
    // Placeholder - will be replaced with actual assets
    // Example: return require(`@/assets/sounds/${SOUNDS[soundName].file}`);

    // For now, return a dummy that will fail gracefully
    return { uri: `https://example.com/sounds/${SOUNDS[soundName].file}` };
  }

  // ============================================================================
  // Settings API
  // ============================================================================

  /**
   * Enable or disable all sounds
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    await this.saveSettings();
  }

  /**
   * Get whether sounds are enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Set master volume (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    await this.saveSettings();
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.settings.volume;
  }

  /**
   * Enable or disable a category
   */
  async setCategoryEnabled(category: SoundCategory, enabled: boolean): Promise<void> {
    this.settings.categoryEnabled[category] = enabled;
    await this.saveSettings();
  }

  /**
   * Get whether a category is enabled
   */
  isCategoryEnabled(category: SoundCategory): boolean {
    return this.settings.categoryEnabled[category];
  }

  /**
   * Get all settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  // ============================================================================
  // Convenience methods
  // ============================================================================

  /**
   * Play tap sound
   */
  async playTap(): Promise<void> {
    await this.play('tap_light');
  }

  /**
   * Play success sound
   */
  async playSuccess(): Promise<void> {
    await this.play('success');
  }

  /**
   * Play error sound
   */
  async playError(): Promise<void> {
    await this.play('error');
  }

  /**
   * Play celebration sound
   */
  async playCelebration(): Promise<void> {
    await this.play('celebration');
  }
}

// Export singleton instance (both naming conventions for compatibility)
export const SoundManager = new SoundManagerClass();
export const soundManager = SoundManager;
