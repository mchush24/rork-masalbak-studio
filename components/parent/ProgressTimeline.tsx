/**
 * Progress Timeline Component
 * Child's progress over time visualization
 * Part of #20: Ebeveyn Modu - Rehberli Deneyim UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Star,
  ChevronRight,
  Award,
  Sparkles,
  Heart,
  Smile,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressEntry {
  id: string;
  date: string;
  testType: string;
  milestone?: string;
  highlights: string[];
  overallLevel: 'excellent' | 'good' | 'developing' | 'emerging';
  trend: 'up' | 'down' | 'stable';
  imageUri?: string;
}

interface ProgressStats {
  totalAnalyses: number;
  monthsActive: number;
  currentStreak: number;
  improvements: number;
}

interface ProgressTimelineProps {
  childName: string;
  childAge: number;
  entries: ProgressEntry[];
  stats: ProgressStats;
  onEntryPress?: (entryId: string) => void;
  onViewAllPress?: () => void;
}

const LEVEL_CONFIG = {
  excellent: { label: 'Mükemmel', color: '#059669', bgColor: '#ECFDF5', icon: Star },
  good: { label: 'İyi', color: '#3B82F6', bgColor: '#EFF6FF', icon: Smile },
  developing: { label: 'Gelişiyor', color: '#F59E0B', bgColor: '#FFFBEB', icon: Sparkles },
  emerging: { label: 'Başlangıç', color: '#8B5CF6', bgColor: '#F5F3FF', icon: Heart },
};

const TEST_TYPE_LABELS: Record<string, string> = {
  DAP: 'İnsan Çizimi',
  HTP: 'Ev-Ağaç-İnsan',
  Family: 'Aile Çizimi',
  Tree: 'Ağaç Çizimi',
  Bender: 'Bender Gestalt',
};

export function ProgressTimeline({
  childName,
  childAge,
  entries,
  stats,
  onEntryPress,
  onViewAllPress,
}: ProgressTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredEntries = selectedFilter === 'all'
    ? entries
    : entries.filter(e => e.testType === selectedFilter);

  const testTypes = Array.from(new Set(entries.map(e => e.testType)));

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.mint, Colors.primary.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{childName}'ın Gelişim Yolculuğu</Text>
          <Text style={styles.headerSubtitle}>{childAge} yaş</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalAnalyses}</Text>
            <Text style={styles.statLabel}>Analiz</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.monthsActive}</Text>
            <Text style={styles.statLabel}>Ay</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.streakBadge}>
              <Award size={16} color={Colors.primary.sunset} />
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
            </View>
            <Text style={styles.statLabel}>Seri</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.improvements}</Text>
            <Text style={styles.statLabel}>Gelişim</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
            Tümü
          </Text>
        </Pressable>
        {testTypes.map((type) => (
          <Pressable
            key={type}
            style={[styles.filterChip, selectedFilter === type && styles.filterChipActive]}
            onPress={() => setSelectedFilter(type)}
          >
            <Text style={[styles.filterChipText, selectedFilter === type && styles.filterChipTextActive]}>
              {TEST_TYPE_LABELS[type] || type}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Timeline */}
      <View style={styles.timeline}>
        {filteredEntries.map((entry, index) => {
          const levelConfig = LEVEL_CONFIG[entry.overallLevel];
          const LevelIcon = levelConfig.icon;
          const TrendIcon = getTrendIcon(entry.trend);
          const trendColor = getTrendColor(entry.trend);
          const isLast = index === filteredEntries.length - 1;

          return (
            <View key={entry.id} style={styles.timelineEntry}>
              {/* Timeline Line */}
              <View style={styles.timelineLineContainer}>
                <View style={[styles.timelineDot, { backgroundColor: levelConfig.color }]}>
                  <LevelIcon size={12} color="#FFFFFF" />
                </View>
                {!isLast && <View style={styles.timelineLine} />}
              </View>

              {/* Entry Card */}
              <Pressable
                style={({ pressed }) => [
                  styles.entryCard,
                  pressed && styles.entryCardPressed,
                ]}
                onPress={() => onEntryPress?.(entry.id)}
              >
                {/* Entry Header */}
                <View style={styles.entryHeader}>
                  <View style={styles.entryDateContainer}>
                    <Calendar size={14} color={Colors.neutral.medium} />
                    <Text style={styles.entryDate}>{formatRelativeDate(entry.date)}</Text>
                  </View>
                  <View style={styles.entryTrend}>
                    <TrendIcon size={16} color={trendColor} />
                  </View>
                </View>

                {/* Test Type Badge */}
                <View style={styles.testTypeBadge}>
                  <Text style={styles.testTypeText}>{TEST_TYPE_LABELS[entry.testType] || entry.testType}</Text>
                </View>

                {/* Milestone (if any) */}
                {entry.milestone && (
                  <View style={styles.milestoneBadge}>
                    <Award size={14} color={Colors.primary.sunset} />
                    <Text style={styles.milestoneText}>{entry.milestone}</Text>
                  </View>
                )}

                {/* Level Badge */}
                <View style={[styles.levelBadge, { backgroundColor: levelConfig.bgColor }]}>
                  <LevelIcon size={14} color={levelConfig.color} />
                  <Text style={[styles.levelText, { color: levelConfig.color }]}>
                    {levelConfig.label}
                  </Text>
                </View>

                {/* Highlights */}
                {entry.highlights.length > 0 && (
                  <View style={styles.highlightsContainer}>
                    {entry.highlights.slice(0, 2).map((highlight, idx) => (
                      <View key={idx} style={styles.highlightItem}>
                        <Sparkles size={12} color={Colors.primary.mint} />
                        <Text style={styles.highlightText} numberOfLines={1}>
                          {highlight}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* View Details */}
                <View style={styles.viewDetails}>
                  <Text style={styles.viewDetailsText}>Detayları Gör</Text>
                  <ChevronRight size={14} color={Colors.primary.sky} />
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <View style={styles.emptyState}>
          <Calendar size={48} color={Colors.neutral.light} />
          <Text style={styles.emptyTitle}>Henüz analiz yok</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter !== 'all'
              ? 'Bu test türünde henüz analiz yapılmamış'
              : 'İlk analizi yaparak yolculuğa başlayın'
            }
          </Text>
        </View>
      )}

      {/* View All Button */}
      {entries.length > 5 && (
        <Pressable
          style={({ pressed }) => [styles.viewAllButton, pressed && styles.viewAllButtonPressed]}
          onPress={onViewAllPress}
        >
          <Text style={styles.viewAllButtonText}>Tüm Geçmişi Gör</Text>
          <ChevronRight size={18} color={Colors.primary.sky} />
        </Pressable>
      )}

      {/* Encouragement Card */}
      <View style={styles.encouragementCard}>
        <View style={styles.encouragementIcon}>
          <Heart size={24} color={Colors.primary.sunset} />
        </View>
        <View style={styles.encouragementContent}>
          <Text style={styles.encouragementTitle}>Harika gidiyorsunuz!</Text>
          <Text style={styles.encouragementText}>
            {childName}'ın gelişimini düzenli olarak takip etmeniz çok değerli.
            Her çizim, onun iç dünyasına açılan bir pencere.
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: spacing['6'],
    paddingBottom: spacing['4'],
    paddingHorizontal: spacing['4'],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerContent: {
    marginBottom: spacing['4'],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.lg,
    padding: spacing['2'],
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterContainer: {
    marginTop: spacing['4'],
  },
  filterContent: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: spacing['2'],
  },
  filterChipActive: {
    backgroundColor: Colors.primary.sky,
    borderColor: Colors.primary.sky,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral.dark,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  timeline: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
  },
  timelineEntry: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: -4,
  },
  entryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['3'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  entryCardPressed: {
    backgroundColor: '#FAFAFA',
    transform: [{ scale: 0.99 }],
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  entryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.neutral.medium,
  },
  entryTrend: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.softPeach,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing['2'],
  },
  testTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.sunset,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing['2'],
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing['2'],
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  highlightsContainer: {
    gap: spacing['1'],
    marginBottom: spacing['2'],
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: Colors.neutral.dark,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: spacing['2'],
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.sky,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
    paddingHorizontal: spacing['4'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.dark,
    marginTop: spacing['3'],
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginTop: spacing['2'],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: spacing['4'],
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary.sky,
  },
  viewAllButtonPressed: {
    backgroundColor: '#F0F9FF',
  },
  viewAllButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.sky,
  },
  encouragementCard: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['4'],
    padding: spacing['4'],
    backgroundColor: Colors.primary.softPeach,
    borderRadius: radius.xl,
  },
  encouragementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encouragementContent: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.darker,
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 13,
    color: Colors.neutral.dark,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProgressTimeline;
