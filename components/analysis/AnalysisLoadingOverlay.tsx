/**
 * AnalysisLoadingOverlay - Enhanced loading state for analysis
 *
 * Shows:
 * - Beautiful loading animation
 * - Estimated time remaining
 * - Progress tips
 * - Cancel option
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Clock, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface AnalysisLoadingOverlayProps {
  message?: string;
  estimatedDuration?: string; // e.g., "15-30 saniye"
  testType?: string;
  onCancel?: () => void;
  showCancel?: boolean;
}

const ANALYSIS_TIPS = [
  'Yapay zeka çizim detaylarını analiz ediyor...',
  'Renk kullanımı ve kompozisyon değerlendiriliyor...',
  'Psikolojik göstergeler inceleniyor...',
  'Yaşa uygun kriterler değerlendiriliyor...',
  'Rapor hazırlanıyor...',
];

export function AnalysisLoadingOverlay({
  message = 'Analiz yapılıyor...',
  estimatedDuration = '15-30 saniye',
  testType,
  onCancel,
  showCancel = false,
}: AnalysisLoadingOverlayProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rotate tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % ANALYSIS_TIPS.length);
    }, 3500);

    return () => clearInterval(tipInterval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const tipOpacity = useSharedValue(1);

  useEffect(() => {
    tipOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTipIndex]);

  const tipStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
  }));

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} saniye`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.background.analysis} style={styles.gradient}>
        {/* Main Loading Animation */}
        <LoadingAnimation type="analysis" message={message} />

        {/* Time Info Card */}
        <View style={styles.timeCard}>
          <View style={styles.timeRow}>
            <Clock
              size={iconSizes.inline}
              color={Colors.secondary.lavender}
              strokeWidth={iconStroke.standard}
            />
            <Text style={styles.timeLabel}>Tahmini süre:</Text>
            <Text style={styles.timeValue}>{estimatedDuration}</Text>
          </View>
          <View style={styles.elapsedRow}>
            <Text style={styles.elapsedLabel}>Geçen süre:</Text>
            <Text style={styles.elapsedValue}>{formatElapsedTime(elapsedSeconds)}</Text>
          </View>
        </View>

        {/* Rotating Tips */}
        <Animated.View style={[styles.tipContainer, tipStyle]}>
          <Text style={styles.tipText}>{ANALYSIS_TIPS[currentTipIndex]}</Text>
        </Animated.View>

        {/* Test Type Badge */}
        {testType && (
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>{testType} Testi</Text>
          </View>
        )}

        {/* Cancel Button */}
        {showCancel && onCancel && (
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
          >
            <X
              size={iconSizes.small}
              color={Colors.neutral.medium}
              strokeWidth={iconStroke.standard}
            />
            <Text style={styles.cancelText}>İptal Et</Text>
          </Pressable>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 280,
    ...shadows.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  timeValue: {
    fontSize: typography.size.sm,
    color: Colors.secondary.lavender,
    fontWeight: typography.weight.bold,
  },
  elapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  elapsedLabel: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  elapsedValue: {
    fontSize: typography.size.sm,
    color: Colors.neutral.darkest,
    fontWeight: typography.weight.semibold,
  },
  tipContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  tipText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  testBadge: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  testBadgeText: {
    fontSize: typography.size.xs,
    color: Colors.secondary.lavender,
    fontWeight: typography.weight.semibold,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
});

export default AnalysisLoadingOverlay;
