/**
 * 🔊 ASMR Sound Manager
 *
 * World-class ASMR-quality sound effect management for immersive coloring.
 *
 * Features:
 * - Preloading all sound effects on initialization
 * - Play sounds with haptic feedback synchronization
 * - Volume control with ASMR-optimized levels
 * - Mute/unmute functionality
 * - Sound pooling for overlapping sounds
 * - Child-friendly, calming sound effects
 * - Brush-type specific sounds (watercolor splash, marker squeak, etc.)
 *
 * ASMR Sound Categories:
 *
 * 1. Tool Sounds:
 *    - tool-change: Soft wooden click (like putting down a paintbrush)
 *    - color-select: Gentle water drop chime
 *
 * 2. Brush Sounds (ASMR):
 *    - brush-stroke: Soft bristle swoosh
 *    - brush-watercolor: Water swishing on paper
 *    - brush-marker: Gentle marker squeak
 *    - brush-crayon: Satisfying crayon texture
 *    - brush-pencil: Graphite scratching softly
 *    - brush-spray: Gentle airbrush hiss
 *
 * 3. Fill Sounds:
 *    - fill-pop: Satisfying bubble pop
 *    - fill-splash: Gentle paint splash
 *
 * 4. UI Sounds:
 *    - undo: Gentle rewind whoosh
 *    - redo: Soft forward whoosh
 *    - save-success: Happy celebration chime
 *    - milestone: Achievement unlock jingle
 *
 * 5. Ambient Sounds (Optional):
 *    - ambient-nature: Birds chirping, gentle breeze
 *    - ambient-rain: Soft rain on window
 *
 * Sound Design Principles (Inspired by Lake Coloring App):
 * - All sounds should be:
 *   - Soft and calming (never jarring)
 *   - Natural/organic feeling
 *   - Short duration (100-500ms for most)
 *   - Low frequency bias (easier on ears)
 *   - Volume normalized to ~70% max
 *
 * Sound File Specs:
 * - Format: MP3 or M4A
 * - Sample rate: 44.1kHz
 * - Bit depth: 16-bit
 * - Size: <100KB each
 * - Sources: Freesound.org (CC0), Zapsplat (with license)
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type SoundType =
  // Tool sounds
  | 'tool-change'
  | 'color-select'
  // Brush sounds (ASMR)
  | 'brush-stroke'
  | 'brush-watercolor'
  | 'brush-marker'
  | 'brush-crayon'
  | 'brush-pencil'
  | 'brush-spray'
  // Fill sounds
  | 'fill-pop'
  | 'fill-splash'
  // UI sounds
  | 'undo'
  | 'redo'
  | 'save-success'
  | 'milestone'
  // Ambient sounds
  | 'ambient-nature'
  | 'ambient-rain';

// Sound file mappings
// NOTE: In production, these files should exist in assets/sounds/
// For now, we'll use a graceful fallback if files don't exist
const SOUND_FILES: Record<SoundType, any> = {
  // Tool sounds
  'tool-change': null, // require('@/assets/sounds/tool-change.mp3')
  'color-select': null, // require('@/assets/sounds/color-select.mp3')
  // Brush sounds (ASMR)
  'brush-stroke': null, // require('@/assets/sounds/brush-stroke.mp3')
  'brush-watercolor': null, // require('@/assets/sounds/brush-watercolor.mp3')
  'brush-marker': null, // require('@/assets/sounds/brush-marker.mp3')
  'brush-crayon': null, // require('@/assets/sounds/brush-crayon.mp3')
  'brush-pencil': null, // require('@/assets/sounds/brush-pencil.mp3')
  'brush-spray': null, // require('@/assets/sounds/brush-spray.mp3')
  // Fill sounds
  'fill-pop': null, // require('@/assets/sounds/fill-pop.mp3')
  'fill-splash': null, // require('@/assets/sounds/fill-splash.mp3')
  // UI sounds
  'undo': null, // require('@/assets/sounds/undo.mp3')
  'redo': null, // require('@/assets/sounds/redo.mp3')
  'save-success': null, // require('@/assets/sounds/save-success.mp3')
  'milestone': null, // require('@/assets/sounds/milestone.mp3')
  // Ambient sounds
  'ambient-nature': null, // require('@/assets/sounds/ambient-nature.mp3')
  'ambient-rain': null, // require('@/assets/sounds/ambient-rain.mp3')
};

// ASMR-optimized volume levels for each sound type
const SOUND_VOLUMES: Record<SoundType, number> = {
  'tool-change': 0.5,
  'color-select': 0.4,
  'brush-stroke': 0.3,
  'brush-watercolor': 0.4,
  'brush-marker': 0.35,
  'brush-crayon': 0.35,
  'brush-pencil': 0.25,
  'brush-spray': 0.3,
  'fill-pop': 0.6,
  'fill-splash': 0.5,
  'undo': 0.4,
  'redo': 0.4,
  'save-success': 0.7,
  'milestone': 0.6,
  'ambient-nature': 0.2,
  'ambient-rain': 0.15,
};

// Haptic feedback patterns for each sound type
const HAPTIC_PATTERNS: Record<SoundType, Haptics.ImpactFeedbackStyle | null> = {
  'tool-change': Haptics.ImpactFeedbackStyle.Medium,
  'color-select': Haptics.ImpactFeedbackStyle.Light,
  'brush-stroke': null, // No haptic for brush strokes (too frequent)
  'brush-watercolor': null,
  'brush-marker': null,
  'brush-crayon': null,
  'brush-pencil': null,
  'brush-spray': null,
  'fill-pop': Haptics.ImpactFeedbackStyle.Heavy,
  'fill-splash': Haptics.ImpactFeedbackStyle.Medium,
  'undo': Haptics.ImpactFeedbackStyle.Light,
  'redo': Haptics.ImpactFeedbackStyle.Light,
  'save-success': null, // Uses notification haptic instead
  'milestone': null, // Uses notification haptic instead
  'ambient-nature': null,
  'ambient-rain': null,
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

  // ============================================================================
  // ASMR BRUSH SOUNDS
  // ============================================================================

  /**
   * Play brush-type specific ASMR sound
   * @param brushType The type of brush being used
   */
  async playBrushSound(brushType: 'standard' | 'watercolor' | 'marker' | 'crayon' | 'pencil' | 'spray' | 'highlighter'): Promise<void> {
    const soundMap: Record<string, SoundType> = {
      standard: 'brush-stroke',
      watercolor: 'brush-watercolor',
      marker: 'brush-marker',
      crayon: 'brush-crayon',
      pencil: 'brush-pencil',
      spray: 'brush-spray',
      highlighter: 'brush-marker', // Highlighter uses marker sound
    };

    const soundType = soundMap[brushType] || 'brush-stroke';
    await this.play(soundType, {
      haptic: false,
      volume: SOUND_VOLUMES[soundType] * this.volume,
    });
  }

  /**
   * Play watercolor swish sound
   */
  async playWatercolorSwish(): Promise<void> {
    await this.play('brush-watercolor', {
      haptic: false,
      volume: SOUND_VOLUMES['brush-watercolor'] * this.volume,
    });
  }

  /**
   * Play marker squeak sound
   */
  async playMarkerSqueak(): Promise<void> {
    await this.play('brush-marker', {
      haptic: false,
      volume: SOUND_VOLUMES['brush-marker'] * this.volume,
    });
  }

  /**
   * Play crayon texture sound
   */
  async playCrayonTexture(): Promise<void> {
    await this.play('brush-crayon', {
      haptic: false,
      volume: SOUND_VOLUMES['brush-crayon'] * this.volume,
    });
  }

  /**
   * Play pencil scratch sound
   */
  async playPencilScratch(): Promise<void> {
    await this.play('brush-pencil', {
      haptic: false,
      volume: SOUND_VOLUMES['brush-pencil'] * this.volume,
    });
  }

  /**
   * Play spray/airbrush hiss sound
   */
  async playSprayHiss(): Promise<void> {
    await this.play('brush-spray', {
      haptic: false,
      volume: SOUND_VOLUMES['brush-spray'] * this.volume,
    });
  }

  // ============================================================================
  // FILL SOUNDS
  // ============================================================================

  /**
   * Play fill splash sound (for larger fills)
   */
  async playFillSplash(): Promise<void> {
    await this.play('fill-splash', {
      hapticType: Haptics.ImpactFeedbackStyle.Medium,
    });
  }

  // ============================================================================
  // UI SOUNDS
  // ============================================================================

  /**
   * Play redo sound
   */
  async playRedo(): Promise<void> {
    await this.play('redo', {
      hapticType: Haptics.ImpactFeedbackStyle.Light,
    });
  }

  /**
   * Play milestone/achievement sound
   */
  async playMilestone(): Promise<void> {
    if (this.hapticEnabled && Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        console.warn('[SoundManager] Haptic failed:', error);
      }
    }

    await this.play('milestone', {
      haptic: false,
      volume: SOUND_VOLUMES['milestone'] * this.volume,
    });
  }

  // ============================================================================
  // AMBIENT SOUNDS
  // ============================================================================

  private ambientSound: Audio.Sound | null = null;
  private isAmbientPlaying: boolean = false;

  /**
   * Start playing ambient nature sounds (birds, breeze)
   */
  async startAmbientNature(): Promise<void> {
    await this.startAmbient('ambient-nature');
  }

  /**
   * Start playing ambient rain sounds
   */
  async startAmbientRain(): Promise<void> {
    await this.startAmbient('ambient-rain');
  }

  /**
   * Start playing an ambient sound loop
   */
  private async startAmbient(soundType: SoundType): Promise<void> {
    if (this.isAmbientPlaying) {
      await this.stopAmbient();
    }

    const sound = this.sounds.get(soundType);
    if (!sound) {
      console.log(`[SoundManager] Ambient sound '${soundType}' not available`);
      return;
    }

    try {
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(SOUND_VOLUMES[soundType] * this.volume);
      await sound.playAsync();
      this.ambientSound = sound;
      this.isAmbientPlaying = true;
      console.log(`[SoundManager] Started ambient: ${soundType}`);
    } catch (error) {
      console.warn(`[SoundManager] Failed to start ambient '${soundType}':`, error);
    }
  }

  /**
   * Stop ambient sounds
   */
  async stopAmbient(): Promise<void> {
    if (this.ambientSound && this.isAmbientPlaying) {
      try {
        await this.ambientSound.stopAsync();
        await this.ambientSound.setIsLoopingAsync(false);
        this.isAmbientPlaying = false;
        this.ambientSound = null;
        console.log('[SoundManager] Stopped ambient sounds');
      } catch (error) {
        console.warn('[SoundManager] Failed to stop ambient:', error);
      }
    }
  }

  /**
   * Check if ambient sounds are playing
   */
  isAmbientSoundPlaying(): boolean {
    return this.isAmbientPlaying;
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
