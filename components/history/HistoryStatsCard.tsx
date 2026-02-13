/**
 * HistoryStatsCard - Statistics summary for history screen
 *
 * Shows:
 * - Total analysis count
 * - Favorite count
 * - Recent activity trend
 * - Test type breakdown
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Brain, Heart, TrendingUp, Activity } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';

interface HistoryStatsCardProps {
  totalCount: number;
  favoriteCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
}

export function HistoryStatsCard({
  totalCount,
  favoriteCount,
  thisWeekCount,
  thisMonthCount,
}: HistoryStatsCardProps) {
  const trendPercentage =
    thisMonthCount > 0 ? Math.round((thisWeekCount / thisMonthCount) * 100) : 0;

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <LinearGradient
        colors={[Colors.neutral.white, Colors.neutral.lightest]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analiz Özeti</Text>
          <View style={styles.badge}>
            <Activity
              size={iconSizes.inline}
              color={Colors.secondary.lavender}
              strokeWidth={iconStroke.standard}
            />
            <Text style={styles.badgeText}>Bu Hafta: {thisWeekCount}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {/* Total Analyses */}
          <View style={styles.statItem}>
            <LinearGradient
              colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
              style={styles.statIcon}
            >
              <Brain
                size={iconSizes.small}
                color={Colors.neutral.white}
                strokeWidth={iconStroke.standard}
              />
            </LinearGradient>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Toplam</Text>
          </View>

          {/* Favorites */}
          <View style={styles.statItem}>
            <LinearGradient colors={[Colors.semantic.error, '#FF8A8A']} style={styles.statIcon}>
              <Heart
                size={iconSizes.small}
                color={Colors.neutral.white}
                strokeWidth={iconStroke.standard}
              />
            </LinearGradient>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>

          {/* This Month */}
          <View style={styles.statItem}>
            <LinearGradient
              colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
              style={styles.statIcon}
            >
              <TrendingUp
                size={iconSizes.small}
                color={Colors.neutral.white}
                strokeWidth={iconStroke.standard}
              />
            </LinearGradient>
            <Text style={styles.statValue}>{thisMonthCount}</Text>
            <Text style={styles.statLabel}>Bu Ay</Text>
          </View>

          {/* Trend */}
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                styles.trendIcon,
                {
                  backgroundColor:
                    trendPercentage >= 50 ? Colors.semantic.success : Colors.secondary.sunshine,
                },
              ]}
            >
              <Text style={styles.trendText}>%{trendPercentage}</Text>
            </View>
            <Text style={styles.statValue}>{thisWeekCount}</Text>
            <Text style={styles.statLabel}>Haftalık</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius['2xl'],
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.secondary.lavender,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  trendIcon: {
    backgroundColor: Colors.semantic.success,
  },
  trendText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
});

export default HistoryStatsCard;
