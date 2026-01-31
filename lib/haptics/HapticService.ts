/**
 * HapticService - Central haptic feedback management for Renkioo
 * Phase 2: Haptic System Enhancement
 *
 * Provides consistent haptic feedback patterns with:
 * - Platform awareness (iOS/Android)
 * - User preference setting
 * - Predefined patterns for different interactions
 */

import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage key
const HAPTIC_ENABLED_KEY = '@renkioo_haptic_enabled';

/**
 * Predefined haptic patterns
 */
export type HapticPattern =
  // Basic taps
  | 'TAP_LIGHT'      // Small button, icon button
  | 'TAP_MEDIUM'     // Regular button, toggle
  | 'TAP_HEAVY'      // Delete, destructive action
  // Feedback
  | 'SUCCESS'        // Operation completed successfully
  | 'ERROR'          // Error occurred
  | 'WARNING'        // Warning/attention needed
  // Celebrations
  | 'CELEBRATION'    // Achievement unlocked
  | 'LEVEL_UP'       // Level up
  | 'XP_TICK'        // XP increment
  | 'BADGE_UNLOCK'   // Badge earned
  | 'STREAK_FIRE'    // Streak maintained
  // UI
  | 'SELECTION'      // Item selected
  | 'TOGGLE'         // Toggle switched
  | 'SLIDER_TICK'    // Slider value change
  | 'PULL_REFRESH'   // Pull to refresh triggered
  | 'SWIPE_ACTION';  // Swipe action triggered

class HapticService {
  private static instance: HapticService;
  private enabled: boolean = true;
  private isInitialized: boolean = false;
  private isSupported: boolean = Platform.OS !== 'web';

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  /**
   * Initialize service and load settings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const savedSetting = await AsyncStorage.getItem(HAPTIC_ENABLED_KEY);
      this.enabled = savedSetting !== null ? JSON.parse(savedSetting) : true;
      this.isInitialized = true;
    } catch (error) {
      console.error('[HapticService] Init error:', error);
      this.enabled = true;
    }
  }

  /**
   * Enable or disable haptics
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    try {
      await AsyncStorage.setItem(HAPTIC_ENABLED_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('[HapticService] Save error:', error);
    }
  }

  /**
   * Get enabled status
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if haptics are supported on this device
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Play a haptic pattern
   */
  async play(pattern: HapticPattern): Promise<void> {
    if (!this.enabled || !this.isSupported) return;

    try {
      switch (pattern) {
        // Basic taps
        case 'TAP_LIGHT':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'TAP_MEDIUM':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'TAP_HEAVY':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        // Feedback
        case 'SUCCESS':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;

        case 'ERROR':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case 'WARNING':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;

        // Celebrations - compound patterns
        case 'CELEBRATION':
          await this.playCelebrationPattern();
          break;

        case 'LEVEL_UP':
          await this.playLevelUpPattern();
          break;

        case 'XP_TICK':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'BADGE_UNLOCK':
          await this.playBadgeUnlockPattern();
          break;

        case 'STREAK_FIRE':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await this.sleep(50);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        // UI
        case 'SELECTION':
          await Haptics.selectionAsync();
          break;

        case 'TOGGLE':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'SLIDER_TICK':
          await Haptics.selectionAsync();
          break;

        case 'PULL_REFRESH':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'SWIPE_ACTION':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silently fail - haptics are not critical
      console.warn('[HapticService] Play error:', error);
    }
  }

  /**
   * Celebration haptic pattern: light-medium-light-heavy
   */
  private async playCelebrationPattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await this.sleep(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await this.sleep(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await this.sleep(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  /**
   * Level up haptic pattern: heavy-heavy-heavy with increasing intensity
   */
  private async playLevelUpPattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await this.sleep(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await this.sleep(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await this.sleep(50);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  /**
   * Badge unlock haptic pattern
   */
  private async playBadgeUnlockPattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await this.sleep(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await this.sleep(50);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  /**
   * Utility: Sleep for a duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods

  /**
   * Light tap - for small interactions
   */
  async tapLight(): Promise<void> {
    await this.play('TAP_LIGHT');
  }

  /**
   * Medium tap - for regular buttons
   */
  async tapMedium(): Promise<void> {
    await this.play('TAP_MEDIUM');
  }

  /**
   * Heavy tap - for destructive actions
   */
  async tapHeavy(): Promise<void> {
    await this.play('TAP_HEAVY');
  }

  /**
   * Success feedback
   */
  async success(): Promise<void> {
    await this.play('SUCCESS');
  }

  /**
   * Error feedback
   */
  async error(): Promise<void> {
    await this.play('ERROR');
  }

  /**
   * Warning feedback
   */
  async warning(): Promise<void> {
    await this.play('WARNING');
  }

  /**
   * Selection feedback - for list items, options
   */
  async selection(): Promise<void> {
    await this.play('SELECTION');
  }
}

// Export singleton instance
export const hapticService = HapticService.getInstance();

// Export class for testing
export { HapticService };
