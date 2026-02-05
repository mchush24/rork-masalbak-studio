/**
 * Development Chart Component
 * Phase 18: Professional Tools
 *
 * Displays emotional development trends over time
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Info,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { shadows } from '@/constants/design-system';
import { ChartDataService, TimeRange, EmotionChartData } from '@/lib/professional';
import { useFeedback } from '@/hooks/useFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 20, bottom: 40, left: 50 };

interface DevelopmentChartProps {
  analyses: Array<{
    id: string;
    date: string;
    emotionalTones: Array<{ name: string; percentage: number; color: string }>;
  }>;
  childName?: string;
  onInsightPress?: (insight: string) => void;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'week', label: '1H' },
  { value: 'month', label: '1A' },
  { value: '3months', label: '3A' },
  { value: '6months', label: '6A' },
  { value: 'year', label: '1Y' },
  { value: 'all', label: 'Tümü' },
];

export function DevelopmentChart({
  analyses,
  childName,
  onInsightPress,
}: DevelopmentChartProps) {
  const { feedback } = useFeedback();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return ChartDataService.getAllEmotionsChartData(analyses, selectedRange);
  }, [analyses, selectedRange]);

  const insights = useMemo(() => {
    return ChartDataService.generateInsights(chartData);
  }, [chartData]);

  const selectedData = useMemo(() => {
    if (!selectedEmotion) return chartData[0] || null;
    return chartData.find((c) => c.emotion === selectedEmotion) || chartData[0] || null;
  }, [chartData, selectedEmotion]);

  const generatePath = (data: EmotionChartData['data']): string => {
    if (!data.length) return '';
    const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const xScale = innerWidth / Math.max(data.length - 1, 1);
    const yScale = innerHeight / 100;
    const points = data.map((point, index) => ({
      x: PADDING.left + index * xScale,
      y: PADDING.top + innerHeight - point.y * yScale,
    }));
    let path = \`M \${points[0]?.x || 0} \${points[0]?.y || 0}\`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 3;
      const cp2x = prev.x + (2 * (curr.x - prev.x)) / 3;
      path += \` C \${cp1x} \${prev.y} \${cp2x} \${curr.y} \${curr.x} \${curr.y}\`;
    }
    return path;
  };

  const gridLines = useMemo(() => {
    const lines = [];
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    for (let i = 0; i <= 4; i++) {
      const y = PADDING.top + (innerHeight * i) / 4;
      const value = 100 - i * 25;
      lines.push({ y, value });
    }
    return lines;
  }, []);

  const handleRangeChange = (range: TimeRange) => {
    feedback('tap');
    setSelectedRange(range);
  };

  const handleEmotionSelect = (emotion: string) => {
    feedback('tap');
    setSelectedEmotion(emotion === selectedEmotion ? null : emotion);
  };

  const TrendIcon = selectedData?.trend === 'up'
    ? TrendingUp
    : selectedData?.trend === 'down'
    ? TrendingDown
    : Minus;

  const trendColor = selectedData?.trend === 'up'
    ? Colors.status.success
    : selectedData?.trend === 'down'
    ? Colors.status.error
    : Colors.neutral.medium;

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Duygusal Gelisim</Text>
          {childName && <Text style={styles.subtitle}>{childName}</Text>}
        </View>
        <Calendar size={20} color={Colors.neutral.medium} />
      </View>

      <View style={styles.rangeSelector}>
        {TIME_RANGE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleRangeChange(option.value)}
            style={[styles.rangeButton, selectedRange === option.value && styles.rangeButtonActive]}
          >
            <Text style={[styles.rangeButtonText, selectedRange === option.value && styles.rangeButtonTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedData && selectedData.data.length > 0 ? (
        <View style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {gridLines.map((line) => (
              <G key={line.value}>
                <Line x1={PADDING.left} y1={line.y} x2={CHART_WIDTH - PADDING.right} y2={line.y}
                  stroke={Colors.neutral.lighter} strokeWidth={1} strokeDasharray="4,4" />
                <SvgText x={PADDING.left - 8} y={line.y + 4} fontSize={10} fill={Colors.neutral.medium} textAnchor="end">
                  {line.value}%
                </SvgText>
              </G>
            ))}
            <Path
              d={\`\${generatePath(selectedData.data)} L \${CHART_WIDTH - PADDING.right} \${CHART_HEIGHT - PADDING.bottom} L \${PADDING.left} \${CHART_HEIGHT - PADDING.bottom} Z\`}
              fill={\`\${selectedData.color}20\`}
            />
            <Path d={generatePath(selectedData.data)} fill="none" stroke={selectedData.color}
              strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            {selectedData.data.map((point, index) => {
              const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
              const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
              const x = PADDING.left + (index * innerWidth) / Math.max(selectedData.data.length - 1, 1);
              const y = PADDING.top + innerHeight - (point.y * innerHeight) / 100;
              return <Circle key={index} cx={x} cy={y} r={4} fill={Colors.neutral.white}
                stroke={selectedData.color} strokeWidth={2} />;
            })}
          </Svg>
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Bu donem icin yeterli veri yok</Text>
        </View>
      )}

      {selectedData && (
        <Animated.View entering={FadeInUp.delay(100)} style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ortalama</Text>
            <Text style={[styles.statValue, { color: selectedData.color }]}>%{selectedData.average}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trend</Text>
            <View style={styles.trendContainer}>
              <TrendIcon size={16} color={trendColor} />
              <Text style={[styles.trendText, { color: trendColor }]}>
                {selectedData.change > 0 ? '+' : ''}{selectedData.change}%
              </Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Analiz</Text>
            <Text style={styles.statValue}>{selectedData.data.length}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.emotionScroll} contentContainerStyle={styles.emotionContainer}>
        {chartData.map((emotion) => (
          <Pressable key={emotion.emotion} onPress={() => handleEmotionSelect(emotion.emotion)}
            style={[styles.emotionPill, selectedData?.emotion === emotion.emotion && {
              backgroundColor: \`\${emotion.color}20\`, borderColor: emotion.color }]}>
            <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
            <Text style={[styles.emotionPillText,
              selectedData?.emotion === emotion.emotion && { color: emotion.color }]}>
              {emotion.emotion}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {insights.length > 0 && (
        <Animated.View entering={FadeInUp.delay(200)} style={styles.insightsContainer}>
          <View style={styles.insightsHeader}>
            <Info size={16} color={Colors.secondary.lavender} />
            <Text style={styles.insightsTitle}>Analizler</Text>
          </View>
          {insights.map((insight, index) => (
            <Pressable key={index} onPress={() => onInsightPress?.(insight)} style={styles.insightItem}>
              <Text style={styles.insightText}>{insight}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.neutral.white, borderRadius: 20, padding: 20,
    marginHorizontal: 16, marginVertical: 12, ...shadows.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.neutral.dark },
  subtitle: { fontSize: 14, color: Colors.neutral.medium, marginTop: 2 },
  rangeSelector: { flexDirection: 'row', backgroundColor: Colors.neutral.lighter, borderRadius: 10, padding: 4, marginBottom: 16 },
  rangeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  rangeButtonActive: { backgroundColor: Colors.neutral.white, ...shadows.xs },
  rangeButtonText: { fontSize: 12, fontWeight: '600', color: Colors.neutral.medium },
  rangeButtonTextActive: { color: Colors.primary.purple },
  chartContainer: { alignItems: 'center', marginBottom: 16 },
  emptyChart: { height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.neutral.lighter, borderRadius: 12, marginBottom: 16 },
  emptyText: { fontSize: 14, color: Colors.neutral.medium },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: Colors.neutral.lighter, borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter, marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: Colors.neutral.medium, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.neutral.dark },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: 16, fontWeight: '600' },
  emotionScroll: { marginBottom: 16 },
  emotionContainer: { gap: 8, paddingHorizontal: 4 },
  emotionPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: Colors.neutral.lighter, borderRadius: 20, borderWidth: 1, borderColor: 'transparent', gap: 6 },
  emotionDot: { width: 8, height: 8, borderRadius: 4 },
  emotionPillText: { fontSize: 13, fontWeight: '500', color: Colors.neutral.dark },
  insightsContainer: { backgroundColor: \`\${Colors.secondary.lavender}10\`, borderRadius: 12, padding: 16 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  insightsTitle: { fontSize: 14, fontWeight: '600', color: Colors.secondary.lavender },
  insightItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: \`\${Colors.secondary.lavender}20\` },
  insightText: { fontSize: 13, color: Colors.neutral.dark, lineHeight: 18 },
});

export default DevelopmentChart;
