import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles, Gamepad2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  textShadows,
} from '@/constants/design-system';

type StoryMode = 'normal' | 'interactive';

type StepInfo = {
  name: string;
  message: string;
  icon: string;
  duration: number;
};

type ProgressState = {
  step: number;
  total: number;
  message: string;
  percentage: number;
};

type StoryLoadingProgressProps = {
  progress: ProgressState;
  steps: StepInfo[];
  storyMode: StoryMode;
};

export function StoryLoadingProgress({ progress, steps, storyMode }: StoryLoadingProgressProps) {
  return (
    <View style={styles.loadingAnimationContainer}>
      <LinearGradient
        colors={['#9333EA', '#7C3AED', Colors.secondary.indigo]}
        style={styles.storyLoadingGradient}
      >
        {/* Progress Header */}
        <View style={styles.storyLoadingHeader}>
          {storyMode === 'interactive' ? (
            <Gamepad2 size={48} color="#FFD700" />
          ) : (
            <Sparkles size={48} color="#FFD700" />
          )}
          <Text style={styles.storyLoadingTitle}>
            {storyMode === 'interactive' ? 'İnteraktif Masal Hazırlanıyor' : 'Masal Hazırlanıyor'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFillAnimated, { width: `${progress.percentage}%` }]} />
          </View>
          <Text style={styles.progressPercentageText}>{progress.percentage}%</Text>
        </View>

        {/* Steps Indicator */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isCompleted = progress.step > index + 1;
            const isActive = progress.step === index + 1;
            return (
              <View key={index} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isActive && styles.stepCircleActive,
                  ]}
                >
                  <Text style={styles.stepCircleText}>{isCompleted ? '✓' : step.icon}</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text
                    style={[
                      styles.stepName,
                      isActive && styles.stepNameActive,
                      isCompleted && styles.stepNameCompleted,
                    ]}
                  >
                    {step.message}
                  </Text>
                  <Text style={styles.stepDuration}>~{step.duration} saniye</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Estimated Time */}
        <View style={styles.estimatedTimeContainer}>
          <Text style={styles.estimatedTimeLabel}>Tahmini toplam süre</Text>
          <Text style={styles.estimatedTimeValue}>1-2 dakika</Text>
        </View>

        {/* Fun Tip */}
        <View style={styles.funTipContainer}>
          <Text style={styles.funTipText}>
            {storyMode === 'interactive'
              ? '💡 AI, çocuğunuzun seçimlerini analiz edebilecek interaktif bir macera oluşturuyor!'
              : '💡 AI, çiziminizdeki detaylardan ilham alarak benzersiz bir masal yazıyor!'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingAnimationContainer: {
    flex: 1,
    marginHorizontal: layout.screenPadding,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    ...shadows.xl,
  },
  storyLoadingGradient: {
    flex: 1,
    padding: spacing['6'],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing['6'],
  },
  storyLoadingHeader: {
    alignItems: 'center',
    gap: spacing['3'],
  },
  storyLoadingTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
    ...textShadows.lg,
  },
  progressBarWrapper: {
    width: '100%',
    gap: spacing['2'],
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFillAnimated: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: radius.full,
  },
  progressPercentageText: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    gap: spacing['3'],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing['4'],
    borderRadius: radius.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFD700',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepCircleText: {
    fontSize: typography.size.lg,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepName: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: typography.family.medium,
  },
  stepNameActive: {
    color: Colors.neutral.white,
    fontFamily: typography.family.bold,
  },
  stepNameCompleted: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'line-through',
  },
  stepDuration: {
    fontSize: typography.size.xs,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  estimatedTimeContainer: {
    alignItems: 'center',
    gap: spacing['1'],
  },
  estimatedTimeLabel: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  estimatedTimeValue: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  funTipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing['4'],
    borderRadius: radius.lg,
    marginTop: spacing['2'],
  },
  funTipText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.size.sm,
  },
});
