/**
 * BadgeGrid - Rozet Listesi Komponenti
 *
 * Özellikleri:
 * - Kategori bazlı gruplama
 * - İlerleme özeti
 * - Boş durum gösterimi
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Award, Lock, TrendingUp } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import {
  BADGES,
  BADGE_CATEGORY_LABELS,
  BADGE_CATEGORY_ICONS,
  getBadgesGroupedByCategory,
  type BadgeCategory,
  type Badge,
} from "@/constants/badges";
import { BadgeCard } from "./BadgeCard";

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  unlockedAt: string;
}

interface BadgeProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  current: number;
  target: number;
  percentage: number;
}

interface BadgeGridProps {
  userBadges: UserBadge[];
  progress?: BadgeProgress[];
  isLoading?: boolean;
  showProgress?: boolean;
  onBadgePress?: (badgeId: string, isUnlocked: boolean, badgeInfo?: Badge) => void;
}

export function BadgeGrid({
  userBadges,
  progress = [],
  isLoading = false,
  showProgress = true,
  onBadgePress,
}: BadgeGridProps) {
  // Create a set of unlocked badge IDs for quick lookup
  const unlockedBadgeIds = useMemo(
    () => new Set(userBadges.map(b => b.id)),
    [userBadges]
  );

  // Create progress map
  const progressMap = useMemo(
    () => new Map(progress.map(p => [p.id, p])),
    [progress]
  );

  // Group all badges by category
  const badgesByCategory = useMemo(() => getBadgesGroupedByCategory(), []);

  // Calculate stats
  const totalBadges = BADGES.filter(b => !b.isSecret).length;
  const unlockedCount = userBadges.length;
  const percentage = Math.round((unlockedCount / totalBadges) * 100);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.sunset} />
        <Text style={styles.loadingText}>Rozetler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <LinearGradient
        colors={[Colors.primary.sunset, Colors.primary.peach]}
        style={styles.summaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.summaryIcon}>
          <Award size={32} color={Colors.neutral.white} />
        </View>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>Rozetlerim</Text>
          <Text style={styles.summaryCount}>
            {unlockedCount} / {totalBadges} rozet
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
        </View>
        <Text style={styles.summaryPercentage}>{percentage}%</Text>
      </LinearGradient>

      {/* Next Badges (Progress) */}
      {showProgress && progress.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={Colors.secondary.grass} />
            <Text style={styles.sectionTitle}>Yaklaşan Rozetler</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {progress.slice(0, 5).map(progressBadge => {
              const fullBadge = BADGES.find(b => b.id === progressBadge.id);
              return (
                <BadgeCard
                  key={progressBadge.id}
                  id={progressBadge.id}
                  name={progressBadge.name}
                  description={progressBadge.description}
                  icon={progressBadge.icon}
                  rarity={progressBadge.rarity as any}
                  isUnlocked={false}
                  isSecret={fullBadge?.isSecret}
                  progress={{
                    current: progressBadge.current,
                    target: progressBadge.target,
                    percentage: progressBadge.percentage,
                  }}
                  size="medium"
                  onPress={() => onBadgePress?.(progressBadge.id, false, fullBadge)}
                />
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Badges by Category */}
      {(Object.keys(badgesByCategory) as BadgeCategory[]).map(category => {
        const categoryBadges = badgesByCategory[category];
        if (!categoryBadges || categoryBadges.length === 0) return null;

        // Skip secret category if no secret badges are unlocked
        if (category === "secret") {
          const hasUnlockedSecret = categoryBadges.some(b => unlockedBadgeIds.has(b.id));
          if (!hasUnlockedSecret) return null;
        }

        const categoryIcon = BADGE_CATEGORY_ICONS[category];
        const categoryLabel = BADGE_CATEGORY_LABELS[category];
        const unlockedInCategory = categoryBadges.filter(b => unlockedBadgeIds.has(b.id)).length;

        return (
          <View key={category} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.categoryIcon}>{categoryIcon}</Text>
              <Text style={styles.sectionTitle}>{categoryLabel}</Text>
              <Text style={styles.categoryCount}>
                {unlockedInCategory}/{categoryBadges.filter(b => !b.isSecret).length}
              </Text>
            </View>
            <View style={styles.badgeGrid}>
              {categoryBadges.map(badge => {
                // Don't show locked secret badges
                if (badge.isSecret && !unlockedBadgeIds.has(badge.id)) return null;

                const isUnlocked = unlockedBadgeIds.has(badge.id);
                const badgeProgress = progressMap.get(badge.id);

                return (
                  <BadgeCard
                    key={badge.id}
                    id={badge.id}
                    name={badge.name}
                    description={badge.description}
                    icon={badge.icon}
                    rarity={badge.rarity as any}
                    isUnlocked={isUnlocked}
                    isSecret={badge.isSecret}
                    progress={badgeProgress ? {
                      current: badgeProgress.current,
                      target: badgeProgress.target,
                      percentage: badgeProgress.percentage,
                    } : undefined}
                    size="small"
                    onPress={() => onBadgePress?.(badge.id, isUnlocked, badge)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Empty State */}
      {unlockedCount === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Lock size={48} color={Colors.neutral.light} />
          </View>
          <Text style={styles.emptyTitle}>Henüz rozet kazanmadın</Text>
          <Text style={styles.emptySubtitle}>
            Analiz yap, masal oluştur ve düzenli kullanarak rozetler kazan!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing["8"],
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing["4"],
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  // Summary Card
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing["4"],
    borderRadius: radius.xl,
    marginBottom: spacing["4"],
    ...shadows.md,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing["4"],
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    marginBottom: spacing["1"],
  },
  summaryCount: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.9,
    marginBottom: spacing["2"],
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.neutral.white,
    borderRadius: 3,
  },
  summaryPercentage: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
    marginLeft: spacing["3"],
  },
  // Section
  sectionContainer: {
    marginBottom: spacing["6"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["3"],
    gap: spacing["2"],
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryCount: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  horizontalScroll: {
    paddingRight: spacing["4"],
    gap: spacing["4"],
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["3"],
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    padding: spacing["8"],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
    marginBottom: spacing["2"],
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: "center",
  },
});

export default BadgeGrid;
