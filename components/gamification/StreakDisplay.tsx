/**
 * StreakDisplay Component
 *
 * Shows the user's current streak with animated fire icon
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Snowflake, Calendar } from 'lucide-react-native';
import { USE_NATIVE_DRIVER } from '@/utils/animation';
import { Colors } from '@/constants/colors';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  streakAtRisk?: boolean;
  hasFreezeAvailable?: boolean;
  onPress?: () => void;
  size?: 'compact' | 'full';
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  isActiveToday,
  streakAtRisk = false,
  hasFreezeAvailable = false,
  onPress,
  size = 'compact',
}: StreakDisplayProps) {
  const flameAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Flame animation
    if (currentStreak > 0 && isActiveToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      ).start();
    }

    // Pulse animation for streak at risk
    if (streakAtRisk) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      ).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStreak, isActiveToday, streakAtRisk]);

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    if (streakAtRisk) return ['#FFE4E1', '#FFCDD2'] as const;
    if (currentStreak === 0) return ['#F5F5F5', '#EEEEEE'] as const;
    if (currentStreak >= 30) return ['#FFF3E0', '#FFCC80'] as const; // Gold
    if (currentStreak >= 14) return ['#FFF8E1', '#FFECB3'] as const; // Yellow
    if (currentStreak >= 7) return ['#FFF3E0', '#FFE0B2'] as const; // Orange
    return ['#FFEBEE', '#FFCDD2'] as const; // Red/Pink
  };

  const getFlameColor = () => {
    if (currentStreak === 0) return '#9E9E9E';
    if (currentStreak >= 30) return '#FF6D00';
    if (currentStreak >= 14) return '#FF9100';
    if (currentStreak >= 7) return '#FF9800';
    return '#FF5722';
  };

  if (size === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.compactContainer, pressed && { opacity: 0.8 }]}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={styles.compactGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
            <Flame size={18} color={getFlameColor()} fill={getFlameColor()} />
          </Animated.View>
          <Text style={styles.compactNumber}>{currentStreak}</Text>
          {streakAtRisk && (
            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>!</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={getGradientColors()}
          style={styles.fullContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.streakRow}>
            <Animated.View style={[styles.flameContainer, { transform: [{ scale: flameAnim }] }]}>
              <Flame size={32} color={getFlameColor()} fill={getFlameColor()} />
            </Animated.View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>Gün Serisi</Text>
            </View>
            {hasFreezeAvailable && (
              <View style={styles.freezeBadge}>
                <Snowflake size={14} color="#4FC3F7" />
                <Text style={styles.freezeText}>1</Text>
              </View>
            )}
          </View>

          {streakAtRisk && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>Bugün aktif ol, seriyi kaybetme!</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Calendar size={14} color="#9E9E9E" />
              <Text style={styles.statText}>En Uzun: {longestStreak} gün</Text>
            </View>
            {isActiveToday && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Bugün Aktif</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  compactNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#424242',
  },
  riskBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.white,
  },

  // Full styles
  fullContainer: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#424242',
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  freezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  freezeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4FC3F7',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 10,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D32F2F',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#757575',
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default StreakDisplay;
