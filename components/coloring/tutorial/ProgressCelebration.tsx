/**
 * 🏆 Progress Celebration
 *
 * Milestone celebrations to encourage children during coloring.
 *
 * Features:
 * - Auto-detection of milestones
 * - Encouraging messages
 * - Badge/star animations
 * - Sound + haptic feedback
 * - Progress tracking
 * - Child-friendly rewards
 *
 * Milestones:
 * - First stroke: "Harika başlangıç!"
 * - 5 colors used: "Çok yaratıcısın!"
 * - 10 fills: "Renk dolu!"
 * - 50% complete: "Neredeyse bitti!"
 * - First save: "İlk eserin!"
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { shadows, textShadows, zIndex } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type MilestoneType =
  | 'first_stroke'
  | 'first_fill'
  | 'colors_5'
  | 'fills_10'
  | 'progress_25'
  | 'progress_50'
  | 'progress_75'
  | 'first_save'
  | 'streak_3';

export interface Milestone {
  type: MilestoneType;
  title: string;
  message: string;
  emoji: string;
  color: string[];
}

export const MILESTONES: Record<MilestoneType, Milestone> = {
  first_stroke: {
    type: 'first_stroke',
    title: 'Harika Başlangıç!',
    message: 'İlk çizgini yaptın! Devam et! ✨',
    emoji: '🎨',
    color: ['#FF9B7A', '#FFB299'],
  },
  first_fill: {
    type: 'first_fill',
    title: 'İlk Dolgu!',
    message: 'Dolgu aracını kullandın! Harika! 💧',
    emoji: '💧',
    color: ['#4D96FF', '#6BAAFF'],
  },
  colors_5: {
    type: 'colors_5',
    title: 'Renk Ustası!',
    message: '5 farklı renk kullandın! Çok yaratıcısın! 🌈',
    emoji: '🌈',
    color: ['#9D4EDD', '#B86EFF'],
  },
  fills_10: {
    type: 'fills_10',
    title: 'Dolgu Şampiyonu!',
    message: '10 alan doldurdun! Mükemmel! 🏆',
    emoji: '🏆',
    color: ['#FFD93D', '#FFE55D'],
  },
  progress_25: {
    type: 'progress_25',
    title: 'İyi Gidiyorsun!',
    message: '%25 tamamlandı! Devam et! 💪',
    emoji: '⭐',
    color: ['#6BCB77', '#7DD688'],
  },
  progress_50: {
    type: 'progress_50',
    title: 'Yarı Yol!',
    message: 'Yarısını bitirdin! Neredeyse bitti! 🎯',
    emoji: '🎯',
    color: ['#FF9B7A', '#FFB299'],
  },
  progress_75: {
    type: 'progress_75',
    title: 'Son Sürat!',
    message: '%75 tamam! Biraz daha! 🚀',
    emoji: '🚀',
    color: ['#FF69B4', '#FF8BC8'],
  },
  first_save: {
    type: 'first_save',
    title: 'İlk Eserin!',
    message: 'İlk eserini kaydett in! Tebrikler! 🎉',
    emoji: '🎉',
    color: ['#6BCB77', '#4CAF50'],
  },
  streak_3: {
    type: 'streak_3',
    title: 'Üst Üste 3 Gün!',
    message: '3 gün üst üste boyama yaptın! Harika! 🔥',
    emoji: '🔥',
    color: ['#FF6B6B', '#FF8585'],
  },
};

export interface ProgressCelebrationProps {
  milestone: MilestoneType;
  visible: boolean;
  onComplete?: () => void;
}

/**
 * Celebration component for milestones
 */
export function ProgressCelebration({
  milestone,
  visible,
  onComplete,
}: ProgressCelebrationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const milestoneData = MILESTONES[milestone];

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!visible || !milestoneData) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={milestoneData.color as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Emoji */}
        <Text style={styles.emoji}>{milestoneData.emoji}</Text>

        {/* Title */}
        <Text style={styles.title}>{milestoneData.title}</Text>

        {/* Message */}
        <Text style={styles.message}>{milestoneData.message}</Text>

        {/* Stars decoration */}
        <View style={styles.stars}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.star}>✨</Text>
          <Text style={styles.star}>⭐</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ============================================================================
// PROGRESS TRACKER
// ============================================================================

/**
 * Track coloring progress and detect milestones
 */
export class ProgressTracker {
  private strokeCount: number = 0;
  private fillCount: number = 0;
  private colorsUsed: Set<string> = new Set();
  private milestonesAchieved: Set<MilestoneType> = new Set();
  private onMilestone?: (milestone: MilestoneType) => void;

  constructor(onMilestone?: (milestone: MilestoneType) => void) {
    this.onMilestone = onMilestone;
  }

  /**
   * Record a stroke action
   */
  recordStroke(color: string) {
    this.strokeCount++;
    this.colorsUsed.add(color);

    // Check milestones
    if (this.strokeCount === 1 && !this.milestonesAchieved.has('first_stroke')) {
      this.achieveMilestone('first_stroke');
    }

    if (this.colorsUsed.size === 5 && !this.milestonesAchieved.has('colors_5')) {
      this.achieveMilestone('colors_5');
    }
  }

  /**
   * Record a fill action
   */
  recordFill(color: string) {
    this.fillCount++;
    this.colorsUsed.add(color);

    // Check milestones
    if (this.fillCount === 1 && !this.milestonesAchieved.has('first_fill')) {
      this.achieveMilestone('first_fill');
    }

    if (this.fillCount === 10 && !this.milestonesAchieved.has('fills_10')) {
      this.achieveMilestone('fills_10');
    }
  }

  /**
   * Update progress percentage (0-100)
   */
  updateProgress(percent: number) {
    if (percent >= 25 && !this.milestonesAchieved.has('progress_25')) {
      this.achieveMilestone('progress_25');
    }

    if (percent >= 50 && !this.milestonesAchieved.has('progress_50')) {
      this.achieveMilestone('progress_50');
    }

    if (percent >= 75 && !this.milestonesAchieved.has('progress_75')) {
      this.achieveMilestone('progress_75');
    }
  }

  /**
   * Record first save
   */
  recordSave() {
    if (!this.milestonesAchieved.has('first_save')) {
      this.achieveMilestone('first_save');
    }
  }

  /**
   * Private method to achieve a milestone
   */
  private achieveMilestone(milestone: MilestoneType) {
    this.milestonesAchieved.add(milestone);
    this.onMilestone?.(milestone);
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      strokeCount: this.strokeCount,
      fillCount: this.fillCount,
      colorsUsed: this.colorsUsed.size,
      milestonesAchieved: Array.from(this.milestonesAchieved),
    };
  }

  /**
   * Reset tracker
   */
  reset() {
    this.strokeCount = 0;
    this.fillCount = 0;
    this.colorsUsed.clear();
    this.milestonesAchieved.clear();
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to use progress tracker
 */
export function useProgressTracker() {
  const [currentMilestone, setCurrentMilestone] = React.useState<MilestoneType | null>(null);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const tracker = React.useRef(
    new ProgressTracker((milestone) => {
      setCurrentMilestone(milestone);
      setShowCelebration(true);
    })
  ).current;

  const hideCelebration = () => {
    setShowCelebration(false);
  };

  return {
    tracker,
    currentMilestone,
    showCelebration,
    hideCelebration,
  };
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: (SCREEN_WIDTH - 300) / 2,
    width: 300,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
    zIndex: zIndex.modal,
  },
  gradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: 8,
    textAlign: 'center',
    ...textShadows.md,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 22,
  },
  stars: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  star: {
    fontSize: 20,
  },
});
