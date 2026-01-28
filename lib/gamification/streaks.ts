/**
 * Streak Tracking System
 *
 * Tracks daily activity streaks for user engagement
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  STREAK_DATA: 'renkioo_streak_data',
  LAST_ACTIVITY: 'renkioo_last_activity',
};

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeUsedDate: string | null;
  totalActiveDays: number;
}

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  streakFreezeAvailable: true,
  streakFreezeUsedDate: null,
  totalActiveDays: 0,
};

/**
 * Get today's date in YYYY-MM-DD format
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Load streak data from storage
 */
export async function loadStreakData(): Promise<StreakData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
    if (stored) {
      const data = JSON.parse(stored) as StreakData;
      // Check if streak is still valid
      return validateStreak(data);
    }
  } catch (error) {
    console.error('[Streaks] Failed to load streak data:', error);
  }
  return DEFAULT_STREAK_DATA;
}

/**
 * Save streak data to storage
 */
export async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('[Streaks] Failed to save streak data:', error);
  }
}

/**
 * Validate and update streak based on last activity
 */
function validateStreak(data: StreakData): StreakData {
  const today = getToday();
  const yesterday = getYesterday();

  if (!data.lastActivityDate) {
    return data;
  }

  // Already active today - no change needed
  if (data.lastActivityDate === today) {
    return data;
  }

  // Active yesterday - streak continues (will be incremented on next activity)
  if (data.lastActivityDate === yesterday) {
    return data;
  }

  // Check if streak freeze can save us
  const daysMissed = daysBetween(data.lastActivityDate, today);

  if (daysMissed === 2 && data.streakFreezeAvailable) {
    // Use streak freeze
    return {
      ...data,
      streakFreezeAvailable: false,
      streakFreezeUsedDate: yesterday,
    };
  }

  // Streak broken
  if (daysMissed > 1) {
    return {
      ...data,
      currentStreak: 0,
      // Reset streak freeze weekly
      streakFreezeAvailable: data.streakFreezeUsedDate
        ? daysBetween(data.streakFreezeUsedDate, today) >= 7
        : true,
    };
  }

  return data;
}

/**
 * Record an activity and update streak
 */
export async function recordActivity(): Promise<{
  streakData: StreakData;
  streakIncreased: boolean;
  newStreak: number;
  isNewRecord: boolean;
}> {
  const data = await loadStreakData();
  const today = getToday();
  const yesterday = getYesterday();

  let streakIncreased = false;
  let isNewRecord = false;

  // Already recorded today
  if (data.lastActivityDate === today) {
    return {
      streakData: data,
      streakIncreased: false,
      newStreak: data.currentStreak,
      isNewRecord: false,
    };
  }

  // Calculate new streak
  let newStreak = data.currentStreak;

  if (!data.lastActivityDate) {
    // First activity ever
    newStreak = 1;
    streakIncreased = true;
  } else if (data.lastActivityDate === yesterday) {
    // Continuing streak
    newStreak = data.currentStreak + 1;
    streakIncreased = true;
  } else if (data.streakFreezeUsedDate === yesterday) {
    // Streak saved by freeze, continue
    newStreak = data.currentStreak + 1;
    streakIncreased = true;
  } else {
    // Streak broken, start fresh
    newStreak = 1;
    streakIncreased = true;
  }

  // Check for new record
  const newLongestStreak = Math.max(data.longestStreak, newStreak);
  isNewRecord = newLongestStreak > data.longestStreak;

  const updatedData: StreakData = {
    ...data,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: today,
    totalActiveDays: data.totalActiveDays + 1,
  };

  await saveStreakData(updatedData);

  return {
    streakData: updatedData,
    streakIncreased,
    newStreak,
    isNewRecord,
  };
}

/**
 * Check if user was active today
 */
export async function wasActiveToday(): Promise<boolean> {
  const data = await loadStreakData();
  return data.lastActivityDate === getToday();
}

/**
 * Get streak status for display
 */
export async function getStreakStatus(): Promise<{
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  streakAtRisk: boolean;
  hasFreezeAvailable: boolean;
}> {
  const data = await loadStreakData();
  const today = getToday();
  const yesterday = getYesterday();

  const isActiveToday = data.lastActivityDate === today;
  const wasActiveYesterday = data.lastActivityDate === yesterday;
  const streakAtRisk = !isActiveToday && data.currentStreak > 0 && !wasActiveYesterday;

  return {
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    isActiveToday,
    streakAtRisk,
    hasFreezeAvailable: data.streakFreezeAvailable,
  };
}

/**
 * Reset streak data (for testing)
 */
export async function resetStreakData(): Promise<void> {
  await saveStreakData(DEFAULT_STREAK_DATA);
}
