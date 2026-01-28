/**
 * useEmotionTracker Hook
 *
 * Tracks and manages child's emotional journey
 * - Records daily emotions
 * - Provides emotion history and patterns
 * - Awards XP for daily check-ins
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  EMOTION_HISTORY: 'renkioo_emotion_history',
  LAST_CHECKIN: 'renkioo_last_emotion_checkin',
  STREAK: 'renkioo_emotion_streak',
};

export interface EmotionEntry {
  id: string;
  emotionId: string;
  emotionName: string;
  emoji: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  note?: string;
}

export interface EmotionStats {
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  mostFrequentEmotion: string | null;
  emotionCounts: Record<string, number>;
  todayEmotions: EmotionEntry[];
  weekEmotions: EmotionEntry[];
}

export interface EmotionPattern {
  emotion: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function useEmotionTracker() {
  const [isLoading, setIsLoading] = useState(true);
  const [emotionHistory, setEmotionHistory] = useState<EmotionEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Load emotion data on mount
  useEffect(() => {
    loadEmotionData();
  }, []);

  const loadEmotionData = async () => {
    try {
      const [historyJson, lastCheckin, streakJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EMOTION_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECKIN),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK),
      ]);

      const history: EmotionEntry[] = historyJson ? JSON.parse(historyJson) : [];
      setEmotionHistory(history);

      // Check if already checked in today
      const today = getToday();
      setCheckedInToday(lastCheckin === today);

      // Load streak data
      if (streakJson) {
        const streakData = JSON.parse(streakJson);
        setCurrentStreak(streakData.current || 0);
        setLongestStreak(streakData.longest || 0);
      }
    } catch (error) {
      console.error('[EmotionTracker] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Record a new emotion
  const recordEmotion = useCallback(
    async (
      emotionId: string,
      emotionName: string,
      emoji: string,
      note?: string
    ): Promise<{ xpEarned: number; isFirstToday: boolean; newStreak: number }> => {
      const today = getToday();
      const isFirstToday = !checkedInToday;

      const newEntry: EmotionEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emotionId,
        emotionName,
        emoji,
        timestamp: new Date().toISOString(),
        date: today,
        timeOfDay: getTimeOfDay(),
        note,
      };

      // Update history
      const updatedHistory = [newEntry, ...emotionHistory].slice(0, 100); // Keep last 100 entries

      // Calculate streak
      let newCurrentStreak = currentStreak;
      let newLongestStreak = longestStreak;

      if (isFirstToday) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const checkedYesterday = emotionHistory.some(
          (e) => e.date === yesterdayStr
        );

        if (checkedYesterday || currentStreak === 0) {
          newCurrentStreak = currentStreak + 1;
        } else {
          newCurrentStreak = 1; // Streak broken
        }

        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
      }

      // Save to storage
      try {
        await Promise.all([
          AsyncStorage.setItem(
            STORAGE_KEYS.EMOTION_HISTORY,
            JSON.stringify(updatedHistory)
          ),
          AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECKIN, today),
          AsyncStorage.setItem(
            STORAGE_KEYS.STREAK,
            JSON.stringify({
              current: newCurrentStreak,
              longest: newLongestStreak,
            })
          ),
        ]);

        setEmotionHistory(updatedHistory);
        setCurrentStreak(newCurrentStreak);
        setLongestStreak(newLongestStreak);
        setCheckedInToday(true);
      } catch (error) {
        console.error('[EmotionTracker] Failed to save emotion:', error);
      }

      // Calculate XP earned
      const xpEarned = isFirstToday ? 20 : 5; // More XP for daily check-in

      return {
        xpEarned,
        isFirstToday,
        newStreak: newCurrentStreak,
      };
    },
    [emotionHistory, currentStreak, longestStreak, checkedInToday]
  );

  // Get emotion statistics
  const getStats = useCallback((): EmotionStats => {
    const today = getToday();
    const weekStart = getWeekStart();

    const todayEmotions = emotionHistory.filter((e) => e.date === today);
    const weekEmotions = emotionHistory.filter((e) => e.date >= weekStart);

    // Count emotions
    const emotionCounts: Record<string, number> = {};
    emotionHistory.forEach((e) => {
      emotionCounts[e.emotionId] = (emotionCounts[e.emotionId] || 0) + 1;
    });

    // Find most frequent
    let mostFrequentEmotion: string | null = null;
    let maxCount = 0;
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentEmotion = emotion;
      }
    });

    return {
      totalCheckIns: emotionHistory.length,
      currentStreak,
      longestStreak,
      mostFrequentEmotion,
      emotionCounts,
      todayEmotions,
      weekEmotions,
    };
  }, [emotionHistory, currentStreak, longestStreak]);

  // Get emotion patterns for last N days
  const getPatterns = useCallback(
    (days: number = 7): EmotionPattern[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      const recentEmotions = emotionHistory.filter((e) => e.date >= cutoffStr);
      const total = recentEmotions.length;

      if (total === 0) return [];

      // Count by emotion
      const counts: Record<string, number> = {};
      recentEmotions.forEach((e) => {
        counts[e.emotionId] = (counts[e.emotionId] || 0) + 1;
      });

      // Calculate patterns
      const patterns: EmotionPattern[] = Object.entries(counts).map(
        ([emotion, count]) => ({
          emotion,
          count,
          percentage: Math.round((count / total) * 100),
          trend: 'stable' as const, // Could be calculated with more data
        })
      );

      // Sort by count
      return patterns.sort((a, b) => b.count - a.count);
    },
    [emotionHistory]
  );

  // Get today's last emotion
  const getTodayLastEmotion = useCallback((): EmotionEntry | null => {
    const today = getToday();
    return emotionHistory.find((e) => e.date === today) || null;
  }, [emotionHistory]);

  // Clear all data (for testing)
  const clearData = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.EMOTION_HISTORY),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_CHECKIN),
      AsyncStorage.removeItem(STORAGE_KEYS.STREAK),
    ]);
    setEmotionHistory([]);
    setCurrentStreak(0);
    setLongestStreak(0);
    setCheckedInToday(false);
  };

  return {
    isLoading,
    emotionHistory,
    currentStreak,
    longestStreak,
    checkedInToday,
    recordEmotion,
    getStats,
    getPatterns,
    getTodayLastEmotion,
    refresh: loadEmotionData,
    clearData,
  };
}

export default useEmotionTracker;
