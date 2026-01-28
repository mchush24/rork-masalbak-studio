import { Platform } from 'react-native';

/**
 * Animation utilities for cross-platform compatibility
 *
 * Note: useNativeDriver is not supported on web platform.
 * This causes warnings and potential issues when running in browser.
 */

/**
 * Whether to use native driver for animations.
 * Set to true on native platforms, false on web.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Default animation config that works across platforms
 */
export const defaultAnimationConfig = {
  useNativeDriver: USE_NATIVE_DRIVER,
};

/**
 * Spring animation config
 */
export const springConfig = {
  useNativeDriver: USE_NATIVE_DRIVER,
  tension: 65,
  friction: 11,
};

/**
 * Timing animation config
 */
export const timingConfig = {
  useNativeDriver: USE_NATIVE_DRIVER,
  duration: 300,
};
