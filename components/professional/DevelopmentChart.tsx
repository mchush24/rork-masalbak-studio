/**
 * DevelopmentChart - Analysis trend visualization
 * Phase 18: Professional Tools
 *
 * Shows emotional development trends over time
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronDown,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { SavedAnalysis, Insight } from '@/types/analysis';
import { format, subDays, subMonths, subYears, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 200;

interface DevelopmentChartProps {
  analyses: SavedAnalysis[];
  title?: string;
}

type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

interface ChartDataPoint {
  date: Date;
  value: number;
  label: string;
  insights: Insight[];
}

interface TrendInfo {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
}

export function DevelopmentChart({ analyses, title }: DevelopmentChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);

  const rangeLabels: Record<TimeRange, string> = {
    week: 'Son 7 Gün',
    month: 'Son 30 Gün',
    '3months': 'Son 3 Ay',
    year: 'Son 1 Yıl',
    all: 'Tümü',
  };

  // Filter analyses by time range
  const filteredAnalyses = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = subYears(now, 1);
        break;
      case 'all':
        return analyses;
    }

    return analyses.filter((a) => isAfter(new Date(a.createdAt), startDate));
  }, [analyses, timeRange]);

  // Calculate chart data points
  const chartData = useMemo((): ChartDataPoint[] => {
    if (filteredAnalyses.length === 0) return [];

    // Group by date and calculate average "positivity" score
    const dataByDate = new Map<string, { values: number[]; insights: Insight[] }>();

    filteredAnalyses.forEach((analysis) => {
      const dateKey = format(new Date(analysis.createdAt), 'yyyy-MM-dd');
      const insights = analysis.analysisResult.insights;

      // Calculate a simple positivity score based on insight strengths
      let score = 50; // Base score
      insights.forEach((insight) => {
        // Check if insight seems positive or concerning
        const isPositive =
          insight.title.toLowerCase().includes('güçlü') ||
          insight.title.toLowerCase().includes('pozitif') ||
          insight.title.toLowerCase().includes('strong') ||
          insight.title.toLowerCase().includes('positive');

        if (isPositive) {
          score += insight.strength === 'strong' ? 15 : insight.strength === 'moderate' ? 10 : 5;
        }

        // Risk flags lower the score
        if (analysis.analysisResult.riskFlags.length > 0) {
          score -= 10 * analysis.analysisResult.riskFlags.length;
        }
      });

      // Clamp score between 0 and 100
      score = Math.max(0, Math.min(100, score));

      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { values: [], insights: [] });
      }
      const data = dataByDate.get(dateKey)!;
      data.values.push(score);
      data.insights.push(...insights);
    });

    // Convert to array and calculate averages
    const result: ChartDataPoint[] = [];
    dataByDate.forEach((data, dateKey) => {
      const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
      result.push({
        date: new Date(dateKey),
        value: Math.round(avg),
        label: format(new Date(dateKey), 'd MMM', { locale: tr }),
        insights: data.insights,
      });
    });

    // Sort by date
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredAnalyses]);

  // Calculate trend
  const trend = useMemo((): TrendInfo => {
    if (chartData.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }

    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const percentage = Math.abs(Math.round((diff / firstAvg) * 100));

    if (diff > 5) {
      return { direction: 'up', percentage };
    } else if (diff < -5) {
      return { direction: 'down', percentage };
    }
    return { direction: 'stable', percentage: 0 };
  }, [chartData]);

  // Chart dimensions
  const maxValue = Math.max(...chartData.map((d) => d.value), 100);
  const minValue = Math.min(...chartData.map((d) => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Render chart line
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>
            Bu dönemde analiz verisi yok
          </Text>
        </View>
      );
    }

    const pointSpacing = CHART_WIDTH / Math.max(chartData.length - 1, 1);

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>100</Text>
          <Text style={styles.yAxisLabel}>75</Text>
          <Text style={styles.yAxisLabel}>50</Text>
          <Text style={styles.yAxisLabel}>25</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <View
              key={val}
              style={[
                styles.gridLine,
                { bottom: (val / 100) * CHART_HEIGHT },
              ]}
            />
          ))}

          {/* Data line */}
          <View style={styles.dataLine}>
            {chartData.map((point, index) => {
              const x = index * pointSpacing;
              const y = ((point.value - minValue) / valueRange) * CHART_HEIGHT;

              return (
                <React.Fragment key={index}>
                  {/* Line to next point */}
                  {index < chartData.length - 1 && (
                    <View
                      style={[
                        styles.lineSegment,
                        {
                          left: x,
                          bottom: y,
                          width: pointSpacing,
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                ((chartData[index + 1].value - minValue) / valueRange) *
                                  CHART_HEIGHT -
                                  y,
                                pointSpacing
                              )}rad`,
                            },
                          ],
                        },
                      ]}
                    />
                  )}

                  {/* Data point */}
                  <Pressable
                    style={[
                      styles.dataPoint,
                      {
                        left: x - 6,
                        bottom: y - 6,
                      },
                      selectedPoint === point && styles.dataPointSelected,
                    ]}
                    onPress={() => setSelectedPoint(point === selectedPoint ? null : point)}
                  >
                    <View style={styles.dataPointInner} />
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>

          {/* Gradient fill under line */}
          <LinearGradient
            colors={[Colors.primary.purple + '40', Colors.primary.purple + '05']}
            style={[
              styles.gradientFill,
              {
                height:
                  ((chartData[chartData.length - 1]?.value || 50) / 100) * CHART_HEIGHT,
              },
            ]}
          />

          {/* X-axis labels */}
          <View style={styles.xAxis}>
            {chartData.length <= 7
              ? chartData.map((point, index) => (
                  <Text
                    key={index}
                    style={[styles.xAxisLabel, { left: index * pointSpacing - 15 }]}
                  >
                    {point.label}
                  </Text>
                ))
              : [0, Math.floor(chartData.length / 2), chartData.length - 1].map(
                  (index) => (
                    <Text
                      key={index}
                      style={[
                        styles.xAxisLabel,
                        { left: index * pointSpacing - 15 },
                      ]}
                    >
                      {chartData[index]?.label}
                    </Text>
                  )
                )}
          </View>
        </View>
      </View>
    );
  };

  // Render selected point details
  const renderSelectedDetails = () => {
    if (!selectedPoint) return null;

    return (
      <View style={styles.selectedDetails}>
        <View style={styles.selectedHeader}>
          <Calendar size={14} color={Colors.primary.purple} />
          <Text style={styles.selectedDate}>
            {format(selectedPoint.date, 'd MMMM yyyy', { locale: tr })}
          </Text>
          <View style={styles.selectedScore}>
            <Text style={styles.selectedScoreText}>{selectedPoint.value}</Text>
          </View>
        </View>
        <Text style={styles.selectedInsightsTitle}>
          {selectedPoint.insights.length} bulgu kaydedildi
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.insightChips}>
            {selectedPoint.insights.slice(0, 5).map((insight, index) => (
              <View key={index} style={styles.insightChip}>
                <Text style={styles.insightChipText} numberOfLines={1}>
                  {insight.title}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title || 'Gelişim Grafiği'}</Text>

        {/* Time range selector */}
        <Pressable
          style={styles.rangeSelector}
          onPress={() => setShowRangeSelector(!showRangeSelector)}
        >
          <Text style={styles.rangeSelectorText}>{rangeLabels[timeRange]}</Text>
          <ChevronDown size={16} color={Colors.primary.purple} />
        </Pressable>
      </View>

      {/* Range dropdown */}
      {showRangeSelector && (
        <View style={styles.rangeDropdown}>
          {(Object.keys(rangeLabels) as TimeRange[]).map((range) => (
            <Pressable
              key={range}
              style={[
                styles.rangeOption,
                timeRange === range && styles.rangeOptionActive,
              ]}
              onPress={() => {
                setTimeRange(range);
                setShowRangeSelector(false);
              }}
            >
              <Text
                style={[
                  styles.rangeOptionText,
                  timeRange === range && styles.rangeOptionTextActive,
                ]}
              >
                {rangeLabels[range]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Trend indicator */}
      <View style={styles.trendContainer}>
        {trend.direction === 'up' && (
          <>
            <TrendingUp size={20} color={Colors.emotion.trust} />
            <Text style={[styles.trendText, { color: Colors.emotion.trust }]}>
              {trend.percentage}% artış
            </Text>
          </>
        )}
        {trend.direction === 'down' && (
          <>
            <TrendingDown size={20} color={Colors.emotion.sadness} />
            <Text style={[styles.trendText, { color: Colors.emotion.sadness }]}>
              {trend.percentage}% düşüş
            </Text>
          </>
        )}
        {trend.direction === 'stable' && (
          <>
            <Minus size={20} color={Colors.neutral.gray} />
            <Text style={[styles.trendText, { color: Colors.neutral.gray }]}>
              Stabil
            </Text>
          </>
        )}
        <Text style={styles.trendPeriod}>
          {filteredAnalyses.length} analiz
        </Text>
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Selected point details */}
      {renderSelectedDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.darkest,
  },
  rangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary.purple + '10',
    borderRadius: 20,
  },
  rangeSelectorText: {
    fontSize: 13,
    color: Colors.primary.purple,
    fontWeight: '500',
  },
  rangeDropdown: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
    overflow: 'hidden',
  },
  rangeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  rangeOptionActive: {
    backgroundColor: Colors.primary.purple + '10',
  },
  rangeOptionText: {
    fontSize: 14,
    color: Colors.neutral.dark,
  },
  rangeOptionTextActive: {
    color: Colors.primary.purple,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendPeriod: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginLeft: 'auto',
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 40,
  },
  yAxis: {
    width: 30,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.neutral.gray,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  dataLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CHART_HEIGHT,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary.purple,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataPointSelected: {
    backgroundColor: Colors.primary.purple,
    transform: [{ scale: 1.3 }],
  },
  dataPointInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.purple,
  },
  gradientFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  xAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -24,
    height: 20,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    color: Colors.neutral.gray,
    width: 40,
    textAlign: 'center',
  },
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  selectedDetails: {
    marginTop: 24,
    padding: 12,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.darkest,
    flex: 1,
  },
  selectedScore: {
    backgroundColor: Colors.primary.purple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  selectedInsightsTitle: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 8,
  },
  insightChips: {
    flexDirection: 'row',
    gap: 8,
  },
  insightChip: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 150,
  },
  insightChipText: {
    fontSize: 12,
    color: Colors.neutral.dark,
  },
});

export default DevelopmentChart;
