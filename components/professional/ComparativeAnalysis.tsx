/**
 * Comparative Analysis Component
 * Compare analyses across clients or over time
 * Part of #18: Uzman/Klinisyen Modu UI Tasarımı
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  ChevronDown,
  CheckCircle,
} from 'lucide-react-native';
import { spacing, radius, shadows, typography } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

interface AnalysisDataPoint {
  id: string;
  clientId: string;
  clientName: string;
  testType: string;
  date: string;
  rawScore: number;
  maxScore: number;
  percentile: number;
  zScore: number;
}

interface ComparisonGroup {
  label: string;
  data: AnalysisDataPoint[];
  average: number;
  trend?: 'up' | 'down' | 'stable';
}

interface ComparativeAnalysisProps {
  analyses: AnalysisDataPoint[];
  comparisonMode: 'client' | 'time' | 'group';
  onModeChange?: (mode: 'client' | 'time' | 'group') => void;
  onAnalysisSelect?: (analysisId: string) => void;
}

const COMPARISON_MODES = [
  { id: 'client', label: 'Danışanlar Arası', icon: Users },
  { id: 'time', label: 'Zaman İçinde', icon: Calendar },
  { id: 'group', label: 'Grup Karşılaştırma', icon: BarChart2 },
] as const;

const TEST_TYPE_COLORS: Record<string, string> = {
  DAP: Colors.secondary.violet,
  HTP: '#3B82F6',
  Family: '#10B981',
  Bender: Colors.semantic.amber,
  default: ProfessionalColors.trust.primary,
};

export function ComparativeAnalysis({
  analyses,
  comparisonMode,
  onModeChange,
  onAnalysisSelect,
}: ComparativeAnalysisProps) {
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Get unique test types
  const testTypes = useMemo(() => {
    const types = new Set(analyses.map(a => a.testType));
    return Array.from(types);
  }, [analyses]);

  // Filter and group analyses
  const groupedData = useMemo((): ComparisonGroup[] => {
    const filtered = selectedTestType
      ? analyses.filter(a => a.testType === selectedTestType)
      : analyses;

    switch (comparisonMode) {
      case 'client': {
        // Group by client
        const byClient = filtered.reduce(
          (acc, analysis) => {
            if (!acc[analysis.clientId]) {
              acc[analysis.clientId] = {
                label: analysis.clientName,
                data: [],
              };
            }
            acc[analysis.clientId].data.push(analysis);
            return acc;
          },
          {} as Record<string, { label: string; data: AnalysisDataPoint[] }>
        );

        return Object.values(byClient).map(group => ({
          ...group,
          average: group.data.reduce((sum, d) => sum + d.percentile, 0) / group.data.length,
          trend: calculateTrend(group.data),
        }));
      }

      case 'time': {
        // Group by month
        const byMonth = filtered.reduce(
          (acc, analysis) => {
            const date = new Date(analysis.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });

            if (!acc[monthKey]) {
              acc[monthKey] = {
                label: monthLabel,
                data: [],
              };
            }
            acc[monthKey].data.push(analysis);
            return acc;
          },
          {} as Record<string, { label: string; data: AnalysisDataPoint[] }>
        );

        const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
        return sorted.map(([_, group], index, arr) => {
          const avg = group.data.reduce((sum, d) => sum + d.percentile, 0) / group.data.length;
          let trend: 'up' | 'down' | 'stable' = 'stable';

          if (index > 0) {
            const prevAvg =
              arr[index - 1][1].data.reduce((sum, d) => sum + d.percentile, 0) /
              arr[index - 1][1].data.length;
            if (avg > prevAvg + 5) trend = 'up';
            else if (avg < prevAvg - 5) trend = 'down';
          }

          return {
            ...group,
            average: avg,
            trend,
          };
        });
      }

      case 'group': {
        // Group by test type
        const byTest = filtered.reduce(
          (acc, analysis) => {
            if (!acc[analysis.testType]) {
              acc[analysis.testType] = {
                label: analysis.testType,
                data: [],
              };
            }
            acc[analysis.testType].data.push(analysis);
            return acc;
          },
          {} as Record<string, { label: string; data: AnalysisDataPoint[] }>
        );

        return Object.values(byTest).map(group => ({
          ...group,
          average: group.data.reduce((sum, d) => sum + d.percentile, 0) / group.data.length,
        }));
      }

      default:
        return [];
    }
  }, [analyses, comparisonMode, selectedTestType]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (analyses.length === 0) return null;

    const percentiles = analyses.map(a => a.percentile);
    const avgPercentile = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;
    const maxPercentile = Math.max(...percentiles);
    const minPercentile = Math.min(...percentiles);

    return {
      totalAnalyses: analyses.length,
      uniqueClients: new Set(analyses.map(a => a.clientId)).size,
      avgPercentile: Math.round(avgPercentile),
      range: { min: minPercentile, max: maxPercentile },
    };
  }, [analyses]);

  const calculateTrend = (data: AnalysisDataPoint[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const avgFirst = firstHalf.reduce((sum, d) => sum + d.percentile, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, d) => sum + d.percentile, 0) / secondHalf.length;

    if (avgSecond > avgFirst + 5) return 'up';
    if (avgSecond < avgFirst - 5) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const currentMode = COMPARISON_MODES.find(m => m.id === comparisonMode);
  const ModeIcon = currentMode?.icon || BarChart2;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Karşılaştırmalı Analiz</Text>

        {/* Mode Selector */}
        <Pressable
          style={styles.modeSelector}
          onPress={() => setShowModeSelector(!showModeSelector)}
        >
          <ModeIcon size={16} color={ProfessionalColors.trust.primary} />
          <Text style={styles.modeSelectorText}>{currentMode?.label}</Text>
          <ChevronDown size={16} color={ProfessionalColors.text.tertiary} />
        </Pressable>
      </View>

      {/* Mode Dropdown */}
      {showModeSelector && (
        <View style={styles.modeDropdown}>
          {COMPARISON_MODES.map(mode => {
            const Icon = mode.icon;
            const isSelected = mode.id === comparisonMode;
            return (
              <Pressable
                key={mode.id}
                style={[styles.modeOption, isSelected && styles.modeOptionSelected]}
                onPress={() => {
                  onModeChange?.(mode.id);
                  setShowModeSelector(false);
                }}
              >
                <Icon
                  size={18}
                  color={
                    isSelected
                      ? ProfessionalColors.trust.primary
                      : ProfessionalColors.text.secondary
                  }
                />
                <Text style={[styles.modeOptionText, isSelected && styles.modeOptionTextSelected]}>
                  {mode.label}
                </Text>
                {isSelected && <CheckCircle size={16} color={ProfessionalColors.trust.primary} />}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Test Type Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Pressable
          style={[styles.filterChip, !selectedTestType && styles.filterChipActive]}
          onPress={() => setSelectedTestType(null)}
        >
          <Text style={[styles.filterChipText, !selectedTestType && styles.filterChipTextActive]}>
            Tümü
          </Text>
        </Pressable>
        {testTypes.map(type => (
          <Pressable
            key={type}
            style={[
              styles.filterChip,
              selectedTestType === type && styles.filterChipActive,
              { borderColor: TEST_TYPE_COLORS[type] || TEST_TYPE_COLORS.default },
            ]}
            onPress={() => setSelectedTestType(type)}
          >
            <View
              style={[
                styles.filterDot,
                { backgroundColor: TEST_TYPE_COLORS[type] || TEST_TYPE_COLORS.default },
              ]}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedTestType === type && styles.filterChipTextActive,
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Overall Statistics */}
      {overallStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStats.totalAnalyses}</Text>
            <Text style={styles.statLabel}>Analiz</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStats.uniqueClients}</Text>
            <Text style={styles.statLabel}>Danışan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStats.avgPercentile}%</Text>
            <Text style={styles.statLabel}>Ort. Yüzdelik</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {overallStats.range.min}-{overallStats.range.max}
            </Text>
            <Text style={styles.statLabel}>Aralık</Text>
          </View>
        </View>
      )}

      {/* Comparison Bars */}
      <ScrollView style={styles.comparisonContainer} showsVerticalScrollIndicator={false}>
        {groupedData.map((group, index) => {
          const TrendIcon = getTrendIcon(group.trend);
          const trendColor = getTrendColor(group.trend);
          const barWidth = Math.max(10, (group.average / 100) * 100);

          return (
            <View key={index} style={styles.comparisonRow}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonLabel} numberOfLines={1}>
                  {group.label}
                </Text>
                <View style={styles.comparisonMeta}>
                  <Text style={styles.comparisonCount}>{group.data.length} analiz</Text>
                  {group.trend && (
                    <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
                      <TrendIcon size={12} color={trendColor} />
                    </View>
                  )}
                </View>
              </View>

              {/* Bar Chart */}
              <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                  <LinearGradient
                    colors={[
                      TEST_TYPE_COLORS[group.data[0]?.testType] || ProfessionalColors.trust.primary,
                      `${TEST_TYPE_COLORS[group.data[0]?.testType] || ProfessionalColors.trust.primary}CC`,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${barWidth}%` }]}
                  />
                </View>
                <Text style={styles.barValue}>{Math.round(group.average)}%</Text>
              </View>

              {/* Individual data points */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dataPointsContainer}
              >
                {group.data.slice(0, 5).map(point => (
                  <Pressable
                    key={point.id}
                    style={styles.dataPoint}
                    onPress={() => onAnalysisSelect?.(point.id)}
                  >
                    <Text style={styles.dataPointScore}>{point.percentile}%</Text>
                    <Text style={styles.dataPointDate}>
                      {new Date(point.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </Pressable>
                ))}
                {group.data.length > 5 && (
                  <View style={styles.moreIndicator}>
                    <Text style={styles.moreIndicatorText}>+{group.data.length - 5}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}

        {groupedData.length === 0 && (
          <View style={styles.emptyState}>
            <BarChart2 size={48} color={ProfessionalColors.text.tertiary} />
            <Text style={styles.emptyTitle}>Karşılaştırılacak veri yok</Text>
            <Text style={styles.emptySubtitle}>
              Analiz verisi eklendiğinde karşılaştırma görüntülenecek
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  title: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ProfessionalColors.trust.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  modeSelectorText: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.trust.primary,
  },
  modeDropdown: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    marginBottom: spacing['3'],
    ...shadows.md,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  modeOptionSelected: {
    backgroundColor: ProfessionalColors.trust.background,
  },
  modeOptionText: {
    flex: 1,
    fontSize: 14,
    color: ProfessionalColors.text.primary,
  },
  modeOptionTextSelected: {
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.trust.primary,
  },
  filterContainer: {
    marginBottom: spacing['3'],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginRight: spacing['2'],
  },
  filterChipActive: {
    backgroundColor: ProfessionalColors.trust.background,
    borderColor: ProfessionalColors.trust.primary,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
  },
  filterChipTextActive: {
    color: ProfessionalColors.trust.primary,
    fontFamily: typography.family.semibold,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral.gray200,
    marginHorizontal: spacing['2'],
  },
  comparisonContainer: {
    maxHeight: 400,
  },
  comparisonRow: {
    marginBottom: spacing['4'],
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  comparisonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  comparisonCount: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
  },
  trendBadge: {
    padding: 4,
    borderRadius: 4,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
  },
  barBackground: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barValue: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
    width: 45,
    textAlign: 'right',
  },
  dataPointsContainer: {
    flexDirection: 'row',
  },
  dataPoint: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: spacing['2'],
    alignItems: 'center',
  },
  dataPointScore: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.trust.primary,
  },
  dataPointDate: {
    fontSize: 10,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  moreIndicator: {
    backgroundColor: Colors.neutral.gray200,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIndicatorText: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginTop: spacing['3'],
  },
  emptySubtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing['1'],
  },
});

export default ComparativeAnalysis;
