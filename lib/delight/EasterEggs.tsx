/**
 * Easter Eggs
 * Phase 21: Polish & Delight
 *
 * Hidden surprises and delightful interactions
 */

import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { Colors as _Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: _SCREEN_WIDTH, height: _SCREEN_HEIGHT } = Dimensions.get('window');

// Storage keys
const STORAGE_KEYS = {
  EASTER_EGGS_FOUND: 'renkioo_easter_eggs_found',
  KONAMI_UNLOCKED: 'renkioo_konami_unlocked',
};

// Easter egg types
export type EasterEggType =
  | 'ioo_dance'
  | 'konami_code'
  | 'birthday_surprise'
  | 'secret_palette'
  | 'dev_mode';

interface EasterEggState {
  found: Set<EasterEggType>;
  totalFound: number;
}

// Global easter egg state
const easterEggState: EasterEggState = {
  found: new Set(),
  totalFound: 0,
};

/**
 * Load easter egg state from storage
 */
async function loadEasterEggState(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.EASTER_EGGS_FOUND);
    if (stored) {
      const parsed = JSON.parse(stored);
      easterEggState.found = new Set(parsed);
      easterEggState.totalFound = easterEggState.found.size;
    }
  } catch (error) {
    console.error('[EasterEggs] Failed to load state:', error);
  }
}

/**
 * Save easter egg state
 */
async function saveEasterEggState(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EASTER_EGGS_FOUND,
      JSON.stringify(Array.from(easterEggState.found))
    );
  } catch (error) {
    console.error('[EasterEggs] Failed to save state:', error);
  }
}

/**
 * Mark an easter egg as found
 */
export async function markEasterEggFound(type: EasterEggType): Promise<boolean> {
  const isNew = !easterEggState.found.has(type);
  if (isNew) {
    easterEggState.found.add(type);
    easterEggState.totalFound++;
    await saveEasterEggState();
  }
  return isNew;
}

/**
 * Check if easter egg has been found
 */
export function isEasterEggFound(type: EasterEggType): boolean {
  return easterEggState.found.has(type);
}

/**
 * Get total easter eggs found
 */
export function getTotalEasterEggsFound(): number {
  return easterEggState.totalFound;
}

// Initialize on load
loadEasterEggState();

/**
 * Hook for tracking tap count on elements
 */
export function useTapCounter(
  threshold: number,
  onThresholdReached: () => void,
  timeout: number = 2000
) {
  const [tapCount, setTapCount] = useState(0);
  const lastTapTime = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();

    // Reset if too much time has passed
    if (now - lastTapTime.current > timeout) {
      setTapCount(1);
    } else {
      setTapCount(prev => {
        const newCount = prev + 1;
        if (newCount >= threshold) {
          onThresholdReached();
          return 0; // Reset after triggering
        }
        return newCount;
      });
    }

    lastTapTime.current = now;
  }, [threshold, onThresholdReached, timeout]);

  return { tapCount, handleTap };
}

/**
 * Ioo Dance Easter Egg - tap Ioo 10 times
 */
interface IooDanceWrapperProps {
  children: React.ReactNode;
  onDanceTriggered?: () => void;
}

export const IooDanceWrapper = memo(function IooDanceWrapper({
  children,
  onDanceTriggered,
}: IooDanceWrapperProps) {
  const [isDancing, setIsDancing] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const triggerDance = useCallback(async () => {
    const _isNew = await markEasterEggFound('ioo_dance');
    setIsDancing(true);
    onDanceTriggered?.();

    // Dance animation sequence
    rotation.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 200 }),
        withTiming(-15, { duration: 200 }),
        withTiming(0, { duration: 100 })
      ),
      4,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withSpring(1.2, { damping: 5 }),
        withSpring(0.9, { damping: 5 }),
        withSpring(1.1, { damping: 5 }),
        withSpring(1, { damping: 8 })
      ),
      4,
      false
    );

    translateY.value = withRepeat(
      withSequence(withTiming(-20, { duration: 150 }), withTiming(0, { duration: 150 })),
      8,
      false
    );

    // End dance after animation
    setTimeout(() => {
      setIsDancing(false);
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDanceTriggered]);

  const { handleTap } = useTapCounter(10, triggerDance);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: rotation.value + 'deg' },
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <TouchableOpacity onPress={handleTap} activeOpacity={1} disabled={isDancing}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </TouchableOpacity>
  );
});

/**
 * Easter Egg Badge Component
 */
export const EasterEggBadge = memo(function EasterEggBadge({
  type,
  size = 48,
}: {
  type: EasterEggType;
  size?: number;
}) {
  const found = isEasterEggFound(type);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (found) {
      scale.value = withSpring(1, { damping: 8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const badges: Record<EasterEggType, { emoji: string; label: string }> = {
    ioo_dance: { emoji: '💃', label: 'Dance Master' },
    konami_code: { emoji: '🎮', label: 'Code Breaker' },
    birthday_surprise: { emoji: '🎂', label: 'Birthday Star' },
    secret_palette: { emoji: '🌈', label: 'Color Hunter' },
    dev_mode: { emoji: '👩‍💻', label: 'Developer' },
  };

  const badge = badges[type];

  return (
    <Animated.View style={[styles.badge, { width: size, height: size }, animatedStyle]}>
      <Text style={[styles.badgeEmoji, { fontSize: size * 0.5 }]}>
        {found ? badge.emoji : '❓'}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    backgroundColor: '#1E2235',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B3F54',
  },
  badgeEmoji: {
    textAlign: 'center',
  },
});
