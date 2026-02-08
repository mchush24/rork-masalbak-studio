/**
 * useGamification Hook
 *
 * Provides gamification features to components:
 * - Badge tracking
 * - Streak management
 * - XP calculation
 * - Achievement notifications
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BADGES, Badge, BadgeCategory } from './badges';
import { loadStreakData, recordActivity, StreakData } from './streaks';

const STORAGE_KEYS = {
  UNLOCKED_BADGES: 'renkioo_unlocked_badges',
  USER_STATS: 'renkioo_user_stats',
  TOTAL_XP: 'renkioo_total_xp',
};

export interface UserStats {
  totalAnalyses: number;
  totalColorings: number;
  totalStories: number;
  uniqueTestTypes: string[];
  totalXp: number;
}

interface GamificationState {
  isLoading: boolean;
  unlockedBadges: string[];
  userStats: UserStats;
  totalXp: number;
  streakData: StreakData | null;
  newlyUnlockedBadge: Badge | null;
}

const DEFAULT_STATS: UserStats = {
  totalAnalyses: 0,
  totalColorings: 0,
  totalStories: 0,
  uniqueTestTypes: [],
  totalXp: 0,
};

export function useGamification() {
  const [state, setState] = useState<GamificationState>({
    isLoading: true,
    unlockedBadges: [],
    userStats: DEFAULT_STATS,
    totalXp: 0,
    streakData: null,
    newlyUnlockedBadge: null,
  });

  // Load gamification data on mount
  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const [unlockedBadgesJson, userStatsJson, totalXpStr, streakData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_BADGES),
        AsyncStorage.getItem(STORAGE_KEYS.USER_STATS),
        AsyncStorage.getItem(STORAGE_KEYS.TOTAL_XP),
        loadStreakData(),
      ]);

      const unlockedBadges = unlockedBadgesJson ? JSON.parse(unlockedBadgesJson) : [];
      const userStats = userStatsJson ? JSON.parse(userStatsJson) : DEFAULT_STATS;
      const totalXp = totalXpStr ? parseInt(totalXpStr, 10) : 0;

      setState({
        isLoading: false,
        unlockedBadges,
        userStats,
        totalXp,
        streakData,
        newlyUnlockedBadge: null,
      });
    } catch (error) {
      console.error('[Gamification] Failed to load data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Save gamification data
  const saveGamificationData = async (
    unlockedBadges: string[],
    userStats: UserStats,
    totalXp: number
  ) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify(unlockedBadges)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(userStats)),
        AsyncStorage.setItem(STORAGE_KEYS.TOTAL_XP, totalXp.toString()),
      ]);
    } catch (error) {
      console.error('[Gamification] Failed to save data:', error);
    }
  };

  // Check and unlock badges based on current stats
  const checkBadges = useCallback(
    (stats: UserStats, currentStreak: number): Badge | null => {
      const metricsMap: Record<string, number> = {
        total_analyses: stats.totalAnalyses,
        total_colorings: stats.totalColorings,
        total_stories: stats.totalStories,
        unique_test_types: stats.uniqueTestTypes.length,
        total_xp: stats.totalXp,
        daily_streak: currentStreak,
      };

      for (const badge of BADGES) {
        // Skip already unlocked badges
        if (state.unlockedBadges.includes(badge.id)) {
          continue;
        }

        // Skip special badges (handled separately)
        if (badge.requirement.type === 'special') {
          continue;
        }

        const metricValue = metricsMap[badge.requirement.metric] || 0;

        if (metricValue >= badge.requirement.target) {
          return badge;
        }
      }

      return null;
    },
    [state.unlockedBadges]
  );

  // Record an analysis completion
  const recordAnalysis = useCallback(
    async (testType: string) => {
      const newStats = {
        ...state.userStats,
        totalAnalyses: state.userStats.totalAnalyses + 1,
        uniqueTestTypes: state.userStats.uniqueTestTypes.includes(testType)
          ? state.userStats.uniqueTestTypes
          : [...state.userStats.uniqueTestTypes, testType],
      };

      // Record activity for streak
      const { streakData, streakIncreased, newStreak } = await recordActivity();

      // Check for new badges
      const newBadge = checkBadges(newStats, newStreak);

      let newXp = state.totalXp + 25; // Base XP for analysis
      const newUnlockedBadges = [...state.unlockedBadges];

      if (newBadge) {
        newXp += newBadge.xpReward;
        newUnlockedBadges.push(newBadge.id);
      }

      // Update stats with new XP
      newStats.totalXp = newXp;

      await saveGamificationData(newUnlockedBadges, newStats, newXp);

      setState(prev => ({
        ...prev,
        userStats: newStats,
        totalXp: newXp,
        unlockedBadges: newUnlockedBadges,
        streakData,
        newlyUnlockedBadge: newBadge,
      }));

      return {
        xpEarned: 25 + (newBadge?.xpReward || 0),
        newBadge,
        streakIncreased,
        newStreak,
      };
    },
    [state, checkBadges]
  );

  // Record a coloring completion
  const recordColoring = useCallback(async () => {
    const newStats = {
      ...state.userStats,
      totalColorings: state.userStats.totalColorings + 1,
    };

    const { streakData, newStreak } = await recordActivity();
    const newBadge = checkBadges(newStats, newStreak);

    let newXp = state.totalXp + 15; // Base XP for coloring
    const newUnlockedBadges = [...state.unlockedBadges];

    if (newBadge) {
      newXp += newBadge.xpReward;
      newUnlockedBadges.push(newBadge.id);
    }

    newStats.totalXp = newXp;

    await saveGamificationData(newUnlockedBadges, newStats, newXp);

    setState(prev => ({
      ...prev,
      userStats: newStats,
      totalXp: newXp,
      unlockedBadges: newUnlockedBadges,
      streakData,
      newlyUnlockedBadge: newBadge,
    }));

    return { xpEarned: 15 + (newBadge?.xpReward || 0), newBadge };
  }, [state, checkBadges]);

  // Record a story completion
  const recordStory = useCallback(async () => {
    const newStats = {
      ...state.userStats,
      totalStories: state.userStats.totalStories + 1,
    };

    const { streakData, newStreak } = await recordActivity();
    const newBadge = checkBadges(newStats, newStreak);

    let newXp = state.totalXp + 20; // Base XP for story
    const newUnlockedBadges = [...state.unlockedBadges];

    if (newBadge) {
      newXp += newBadge.xpReward;
      newUnlockedBadges.push(newBadge.id);
    }

    newStats.totalXp = newXp;

    await saveGamificationData(newUnlockedBadges, newStats, newXp);

    setState(prev => ({
      ...prev,
      userStats: newStats,
      totalXp: newXp,
      unlockedBadges: newUnlockedBadges,
      streakData,
      newlyUnlockedBadge: newBadge,
    }));

    return { xpEarned: 20 + (newBadge?.xpReward || 0), newBadge };
  }, [state, checkBadges]);

  // Clear newly unlocked badge notification
  const clearNewBadge = useCallback(() => {
    setState(prev => ({ ...prev, newlyUnlockedBadge: null }));
  }, []);

  // Get all badges with unlock status
  const getAllBadges = useCallback(() => {
    return BADGES.map(badge => ({
      ...badge,
      isUnlocked: state.unlockedBadges.includes(badge.id),
    }));
  }, [state.unlockedBadges]);

  // Get badges by category with unlock status
  const getBadgesByCategory = useCallback(
    (category: BadgeCategory) => {
      return BADGES.filter(badge => badge.category === category).map(badge => ({
        ...badge,
        isUnlocked: state.unlockedBadges.includes(badge.id),
      }));
    },
    [state.unlockedBadges]
  );

  // Calculate user level from XP
  const getUserLevel = useCallback(() => {
    const xp = state.totalXp;
    // Simple level formula: level = floor(sqrt(xp / 100)) + 1
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
    const xpForNextLevel = Math.pow(level, 2) * 100;
    const xpProgress = xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    return {
      level,
      xpProgress,
      xpNeeded,
      progressPercent: Math.min((xpProgress / xpNeeded) * 100, 100),
    };
  }, [state.totalXp]);

  return {
    isLoading: state.isLoading,
    unlockedBadges: state.unlockedBadges,
    userStats: state.userStats,
    totalXp: state.totalXp,
    streakData: state.streakData,
    newlyUnlockedBadge: state.newlyUnlockedBadge,
    recordAnalysis,
    recordColoring,
    recordStory,
    clearNewBadge,
    getAllBadges,
    getBadgesByCategory,
    getUserLevel,
    refreshData: loadGamificationData,
  };
}

export default useGamification;
