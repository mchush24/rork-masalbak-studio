/**
 * XPProgressBar Component
 *
 * Shows the user's XP progress towards the next level
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Zap, TrendingUp } from 'lucide-react-native';
import { USE_NATIVE_DRIVER } from '@/utils/animation';
import { shadows, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

interface XPProgressBarProps {
  level: number;
  xpProgress: number;
  xpNeeded: number;
  totalXp: number;
  progressPercent: number;
  onPress?: () => void;
  size?: 'compact' | 'full';
}

export function XPProgressBar({
  level,
  xpProgress,
  xpNeeded,
  totalXp,
  progressPercent,
  onPress,
  size = 'compact',
}: XPProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 1000,
      useNativeDriver: false, // We need layout animation
    }).start();

    // Star pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(starAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressPercent]);

  const getLevelColor = () => {
    if (level >= 20) return ['#FFD700', '#FFC107'] as const; // Gold
    if (level >= 15) return ['#C0C0C0', '#9E9E9E'] as const; // Silver
    if (level >= 10) return ['#CD7F32', '#8D6E63'] as const; // Bronze
    if (level >= 5) return ['#A78BFA', '#7C3AED'] as const; // Purple
    return ['#60A5FA', '#3B82F6'] as const; // Blue
  };

  const getLevelTitle = () => {
    if (level >= 20) return 'Usta';
    if (level >= 15) return 'Uzman';
    if (level >= 10) return 'Deneyimli';
    if (level >= 5) return 'Keşifçi';
    return 'Başlangıç';
  };

  if (size === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.compactContainer, pressed && { opacity: 0.9 }]}
      >
        <LinearGradient
          colors={getLevelColor()}
          style={styles.levelBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.levelNumber}>{level}</Text>
        </LinearGradient>
        <View style={styles.compactProgress}>
          <View style={styles.compactProgressBg}>
            <Animated.View
              style={[
                styles.compactProgressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.compactXpText}>
            {xpProgress}/{xpNeeded} XP
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <View style={styles.fullContainer}>
        {/* Level Badge */}
        <View style={styles.levelSection}>
          <LinearGradient
            colors={getLevelColor()}
            style={styles.fullLevelBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={{ transform: [{ scale: starAnim }] }}>
              <Star size={20} color={Colors.neutral.white} fill={Colors.neutral.white} />
            </Animated.View>
            <Text style={styles.fullLevelNumber}>{level}</Text>
          </LinearGradient>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{getLevelTitle()}</Text>
            <Text style={styles.totalXpText}>{totalXp} toplam XP</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={getLevelColor()}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          <View style={styles.progressLabels}>
            <View style={styles.progressLabelLeft}>
              <Zap size={12} color={Colors.secondary.lavender} />
              <Text style={styles.progressText}>{xpProgress} XP</Text>
            </View>
            <View style={styles.progressLabelRight}>
              <TrendingUp size={12} color="#9E9E9E" />
              <Text style={styles.nextLevelText}>
                Seviye {level + 1}&apos;e {xpNeeded - xpProgress} XP
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 14,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
  },
  compactProgress: {
    flex: 1,
    gap: 2,
  },
  compactProgressBg: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: Colors.secondary.lavender,
    borderRadius: 3,
  },
  compactXpText: {
    fontSize: 10,
    color: '#9E9E9E',
  },

  // Full styles
  fullContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    ...shadows.colored(Colors.secondary.lavender),
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fullLevelBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  fullLevelNumber: {
    fontSize: 18,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
    marginTop: -4,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: '#424242',
  },
  totalXpText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 2,
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 6,
  },
  progressGradient: {
    flex: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressLabelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: Colors.secondary.lavender,
  },
  nextLevelText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});

export default XPProgressBar;
