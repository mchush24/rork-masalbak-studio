/**
 * useGamificationWithDelight Hook
 *
 * Extends useGamification with delight milestone integration
 * Phase 21: Polish & Delight
 */

import { useCallback, useEffect } from 'react';
import { useGamification } from './useGamification';
import { useDelight } from '@/lib/delight';

export function useGamificationWithDelight() {
  const gamification = useGamification();
  const { checkAnalysisCount, checkStreak, checkAnniversary } = useDelight();

  // Check anniversary on mount
  useEffect(() => {
    checkAnniversary();
  }, [checkAnniversary]);

  // Enhanced recordAnalysis that triggers delight milestones
  const recordAnalysisWithDelight = useCallback(
    async (testType: string) => {
      const result = await gamification.recordAnalysis(testType);

      // Check for analysis milestones
      const newAnalysisCount = gamification.userStats.totalAnalyses + 1;
      checkAnalysisCount(newAnalysisCount);

      // Check for streak milestones
      if (result.newStreak) {
        checkStreak(result.newStreak);
      }

      return result;
    },
    [gamification, checkAnalysisCount, checkStreak]
  );

  // Enhanced recordColoring that checks streak
  const recordColoringWithDelight = useCallback(async () => {
    const result = await gamification.recordColoring();

    // Check streak on any activity
    if (gamification.streakData?.currentStreak) {
      checkStreak(gamification.streakData.currentStreak);
    }

    return result;
  }, [gamification, checkStreak]);

  // Enhanced recordStory that checks streak
  const recordStoryWithDelight = useCallback(async () => {
    const result = await gamification.recordStory();

    // Check streak on any activity
    if (gamification.streakData?.currentStreak) {
      checkStreak(gamification.streakData.currentStreak);
    }

    return result;
  }, [gamification, checkStreak]);

  return {
    ...gamification,
    recordAnalysis: recordAnalysisWithDelight,
    recordColoring: recordColoringWithDelight,
    recordStory: recordStoryWithDelight,
  };
}

export default useGamificationWithDelight;
