/**
 * Delight Moments
 * Phase 21: Polish & Delight
 *
 * Special milestone celebrations and "wow" moments
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shadows, typography } from '@/constants/design-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Milestone types
export type MilestoneType =
  | 'first_analysis'
  | 'tenth_analysis'
  | 'hundredth_analysis'
  | 'first_story'
  | 'first_coloring'
  | 'week_streak'
  | 'month_streak'
  | 'year_anniversary'
  | 'og_user';

interface Milestone {
  type: MilestoneType;
  title: string;
  subtitle: string;
  emoji: string;
  badgeColor: string;
  confettiColors: string[];
}

const MILESTONES: Record<MilestoneType, Milestone> = {
  first_analysis: {
    type: 'first_analysis',
    title: 'First Analysis!',
    subtitle: 'Your journey begins',
    emoji: '🔍',
    badgeColor: '#8B5CF6',
    confettiColors: ['#8B5CF6', '#C084FC', '#DDD6FE', Colors.neutral.white],
  },
  tenth_analysis: {
    type: 'tenth_analysis',
    title: '10 Analyses!',
    subtitle: 'Getting the hang of it',
    emoji: '📊',
    badgeColor: '#3B82F6',
    confettiColors: ['#3B82F6', '#60A5FA', '#93C5FD', Colors.neutral.white],
  },
  hundredth_analysis: {
    type: 'hundredth_analysis',
    title: '100 Analyses!',
    subtitle: 'Master Analyst',
    emoji: '🏆',
    badgeColor: '#F59E0B',
    confettiColors: ['#F59E0B', '#FBBF24', '#FCD34D', Colors.neutral.white],
  },
  first_story: {
    type: 'first_story',
    title: 'First Story!',
    subtitle: 'The adventure begins',
    emoji: '📖',
    badgeColor: '#EC4899',
    confettiColors: ['#EC4899', '#F472B6', '#FBCFE8', Colors.neutral.white],
  },
  first_coloring: {
    type: 'first_coloring',
    title: 'First Coloring!',
    subtitle: 'Colors of joy',
    emoji: '🎨',
    badgeColor: '#10B981',
    confettiColors: ['#10B981', '#34D399', '#6EE7B7', Colors.neutral.white],
  },
  week_streak: {
    type: 'week_streak',
    title: '7 Day Streak!',
    subtitle: 'Consistency is key',
    emoji: '🔥',
    badgeColor: '#EF4444',
    confettiColors: ['#EF4444', '#F97316', '#FBBF24', Colors.neutral.white],
  },
  month_streak: {
    type: 'month_streak',
    title: '30 Day Streak!',
    subtitle: 'Incredible dedication',
    emoji: '⚡',
    badgeColor: '#8B5CF6',
    confettiColors: ['#8B5CF6', '#A855F7', '#D946EF', Colors.neutral.white],
  },
  year_anniversary: {
    type: 'year_anniversary',
    title: '1 Year Together!',
    subtitle: 'Thank you for being here',
    emoji: '🎂',
    badgeColor: '#F59E0B',
    confettiColors: ['#F59E0B', '#EC4899', '#8B5CF6', Colors.neutral.white],
  },
  og_user: {
    type: 'og_user',
    title: 'OG User!',
    subtitle: 'One of the originals',
    emoji: '⭐',
    badgeColor: '#FFD700',
    confettiColors: ['#FFD700', '#FCD34D', '#FEF3C7', Colors.neutral.white],
  },
};

// Storage key for achieved milestones
const ACHIEVED_MILESTONES_KEY = 'renkioo_achieved_milestones';

/**
 * Load achieved milestones
 */
async function loadAchievedMilestones(): Promise<Set<MilestoneType>> {
  try {
    const stored = await AsyncStorage.getItem(ACHIEVED_MILESTONES_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('[DelightMoments] Failed to load milestones:', error);
  }
  return new Set();
}

/**
 * Save achieved milestone
 */
async function saveAchievedMilestone(type: MilestoneType): Promise<void> {
  try {
    const achieved = await loadAchievedMilestones();
    achieved.add(type);
    await AsyncStorage.setItem(ACHIEVED_MILESTONES_KEY, JSON.stringify(Array.from(achieved)));
  } catch (error) {
    console.error('[DelightMoments] Failed to save milestone:', error);
  }
}

/**
 * Check if milestone was already achieved
 */
export async function isMilestoneAchieved(type: MilestoneType): Promise<boolean> {
  const achieved = await loadAchievedMilestones();
  return achieved.has(type);
}

/**
 * Confetti Particle Component
 */
const ConfettiParticle = memo(function ConfettiParticle({
  color,
  delay,
  startX,
}: {
  color: string;
  delay: number;
  startX: number;
}) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 50, { duration: 3000, easing: Easing.out(Easing.cubic) })
    );

    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(startX + (Math.random() - 0.5) * 100, { duration: 1000 }),
        withTiming(startX + (Math.random() - 0.5) * 150, { duration: 2000 })
      )
    );

    rotation.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 3, { duration: 3000 })
    );

    opacity.value = withDelay(2500 + delay, withTiming(0, { duration: 500 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: rotation.value + 'deg' },
    ],
    opacity: opacity.value,
  }));

  const size = 8 + Math.random() * 8;
  const isSquare = Math.random() > 0.5;

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          backgroundColor: color,
          width: size,
          height: isSquare ? size : size * 0.6,
          borderRadius: isSquare ? 2 : size / 2,
          left: startX,
        },
        animatedStyle,
      ]}
    />
  );
});

/**
 * Milestone Celebration Modal
 */
interface MilestoneCelebrationProps {
  milestone: MilestoneType | null;
  onDismiss: () => void;
}

export const MilestoneCelebration = memo(function MilestoneCelebration({
  milestone,
  onDismiss,
}: MilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const badgeScale = useSharedValue(0);
  const badgeRotation = useSharedValue(-180);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (milestone) {
      setShowConfetti(true);

      // Badge entrance
      badgeScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 100 }));
      badgeRotation.value = withDelay(300, withSpring(0, { damping: 12 }));

      // Text fade in
      textOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

      // Button fade in
      buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));

      // Save milestone
      saveAchievedMilestone(milestone);
    } else {
      setShowConfetti(false);
      badgeScale.value = 0;
      badgeRotation.value = -180;
      textOpacity.value = 0;
      buttonOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }, { rotate: badgeRotation.value + 'deg' }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  if (!milestone) return null;

  const data = MILESTONES[milestone];
  const confettiParticles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    color: data.confettiColors[i % data.confettiColors.length],
    delay: Math.random() * 500,
    startX: Math.random() * SCREEN_WIDTH,
  }));

  return (
    <Modal visible={!!milestone} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.celebrationOverlay}>
        {/* Confetti */}
        {showConfetti &&
          confettiParticles.map(particle => (
            <ConfettiParticle
              key={particle.id}
              color={particle.color}
              delay={particle.delay}
              startX={particle.startX}
            />
          ))}

        {/* Content */}
        <View style={styles.celebrationContent}>
          {/* Badge */}
          <Animated.View
            style={[styles.milestoneBadge, { backgroundColor: data.badgeColor }, badgeStyle]}
          >
            <Text style={styles.milestoneEmoji}>{data.emoji}</Text>
          </Animated.View>

          {/* Text */}
          <Animated.View style={textStyle}>
            <Text style={styles.milestoneTitle}>{data.title}</Text>
            <Text style={styles.milestoneSubtitle}>{data.subtitle}</Text>
          </Animated.View>

          {/* Button */}
          <Animated.View style={buttonStyle}>
            <TouchableOpacity style={styles.celebrationButton} onPress={onDismiss}>
              <Text style={styles.celebrationButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
});

/**
 * Hook for tracking and triggering milestones
 */
export function useMilestones() {
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneType | null>(null);

  const checkMilestone = useCallback(
    async (type: MilestoneType, condition: boolean): Promise<boolean> => {
      if (!condition) return false;

      const achieved = await isMilestoneAchieved(type);
      if (achieved) return false;

      setPendingMilestone(type);
      return true;
    },
    []
  );

  const dismissMilestone = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  const triggerMilestone = useCallback((type: MilestoneType) => {
    setPendingMilestone(type);
  }, []);

  return {
    pendingMilestone,
    checkMilestone,
    dismissMilestone,
    triggerMilestone,
  };
}

/**
 * Check analysis count milestones
 */
export async function checkAnalysisMilestones(count: number): Promise<MilestoneType | null> {
  if (count === 1) {
    const achieved = await isMilestoneAchieved('first_analysis');
    if (!achieved) return 'first_analysis';
  }
  if (count === 10) {
    const achieved = await isMilestoneAchieved('tenth_analysis');
    if (!achieved) return 'tenth_analysis';
  }
  if (count === 100) {
    const achieved = await isMilestoneAchieved('hundredth_analysis');
    if (!achieved) return 'hundredth_analysis';
  }
  return null;
}

/**
 * Check streak milestones
 */
export async function checkStreakMilestones(streakDays: number): Promise<MilestoneType | null> {
  if (streakDays === 7) {
    const achieved = await isMilestoneAchieved('week_streak');
    if (!achieved) return 'week_streak';
  }
  if (streakDays === 30) {
    const achieved = await isMilestoneAchieved('month_streak');
    if (!achieved) return 'month_streak';
  }
  return null;
}

/**
 * Check anniversary milestone
 */
export async function checkAnniversaryMilestone(
  registrationDate: Date
): Promise<MilestoneType | null> {
  const now = new Date();
  const yearsSinceRegistration =
    (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  if (yearsSinceRegistration >= 1) {
    const achieved = await isMilestoneAchieved('year_anniversary');
    if (!achieved) return 'year_anniversary';
  }
  return null;
}

const styles = StyleSheet.create({
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContent: {
    alignItems: 'center',
    padding: 24,
  },
  confettiParticle: {
    position: 'absolute',
    top: -20,
  },
  milestoneBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...shadows.lg,
  },
  milestoneEmoji: {
    fontSize: 56,
  },
  milestoneTitle: {
    fontSize: 32,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  milestoneSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  celebrationButton: {
    backgroundColor: Colors.secondary.lavender,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  celebrationButtonText: {
    fontSize: 18,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
});
