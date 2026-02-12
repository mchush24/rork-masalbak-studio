/**
 * AnalysisStepper - Visual progress indicator for analysis flows
 *
 * Shows the current step in the analysis process:
 * 1. Image Selection
 * 2. Analysis in Progress
 * 3. Results Ready
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Image as ImageIcon, Brain, CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';

export type AnalysisStep = 'select' | 'analyzing' | 'results';

interface AnalysisStepperProps {
  currentStep: AnalysisStep;
  showLabels?: boolean;
  compact?: boolean;
}

const STEPS = [
  { id: 'select', label: 'Resim Seç', icon: ImageIcon },
  { id: 'analyzing', label: 'Analiz', icon: Brain },
  { id: 'results', label: 'Sonuçlar', icon: CheckCircle },
] as const;

export function AnalysisStepper({
  currentStep,
  showLabels = true,
  compact = false,
}: AnalysisStepperProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <React.Fragment key={step.id}>
            <StepItem
              step={step}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isUpcoming={isUpcoming}
              showLabel={showLabels}
              compact={compact}
            />
            {index < STEPS.length - 1 && (
              <StepConnector isCompleted={isCompleted} isCurrent={isCurrent} compact={compact} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

interface StepItemProps {
  step: (typeof STEPS)[number];
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  showLabel: boolean;
  compact: boolean;
}

function StepItem({ step, isCompleted, isCurrent, showLabel, compact }: StepItemProps) {
  const scale = useSharedValue(1);
  const IconComponent = step.icon;

  React.useEffect(() => {
    if (isCurrent) {
      scale.value = withSpring(1.1, { damping: 10, stiffness: 100 });
    } else {
      scale.value = withSpring(1, { damping: 15 });
    }
  }, [isCurrent, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getIconColor = () => {
    if (isCompleted) return Colors.neutral.white;
    if (isCurrent) return Colors.neutral.white;
    return Colors.neutral.medium;
  };

  const getBackgroundColor = () => {
    if (isCompleted) return Colors.semantic.success;
    if (isCurrent) return Colors.secondary.lavender;
    return Colors.neutral.lighter;
  };

  const getLabelColor = () => {
    if (isCompleted) return Colors.semantic.success;
    if (isCurrent) return Colors.secondary.lavender;
    return Colors.neutral.medium;
  };

  const dotSize = compact ? 32 : 40;
  const iconSize = compact ? iconSizes.small : iconSizes.action;

  return (
    <View style={styles.stepItemContainer}>
      <Animated.View
        style={[
          styles.stepDot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: getBackgroundColor(),
          },
          isCurrent && styles.stepDotActive,
          animatedStyle,
        ]}
      >
        {isCompleted ? (
          <CheckCircle size={iconSize} color={getIconColor()} strokeWidth={iconStroke.bold} />
        ) : isCurrent && step.id === 'analyzing' ? (
          <Animated.View entering={FadeIn} style={styles.pulsingIcon}>
            <Brain size={iconSize} color={getIconColor()} strokeWidth={iconStroke.standard} />
          </Animated.View>
        ) : (
          <IconComponent size={iconSize} color={getIconColor()} strokeWidth={iconStroke.standard} />
        )}
      </Animated.View>
      {showLabel && (
        <Text
          style={[
            styles.stepLabel,
            compact && styles.stepLabelCompact,
            { color: getLabelColor() },
            isCurrent && styles.stepLabelActive,
          ]}
        >
          {step.label}
        </Text>
      )}
    </View>
  );
}

interface StepConnectorProps {
  isCompleted: boolean;
  isCurrent: boolean;
  compact: boolean;
}

function StepConnector({ isCompleted, isCurrent, compact }: StepConnectorProps) {
  const progress = useSharedValue(isCompleted ? 1 : isCurrent ? 0.5 : 0);

  React.useEffect(() => {
    progress.value = withTiming(isCompleted ? 1 : isCurrent ? 0.5 : 0, { duration: 300 });
  }, [isCompleted, isCurrent, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.connectorContainer, compact && styles.connectorContainerCompact]}>
      <View style={styles.connectorBackground} />
      <Animated.View
        style={[
          styles.connectorProgress,
          { backgroundColor: isCompleted ? Colors.semantic.success : Colors.secondary.lavender },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  containerCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
    ...shadows.none,
  },
  stepItemContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  stepDot: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  stepDotActive: {
    ...shadows.md,
  },
  pulsingIcon: {
    // Animation handled by parent
  },
  stepLabel: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  stepLabelCompact: {
    fontSize: 10,
  },
  stepLabelActive: {
    fontWeight: typography.weight.bold,
  },
  connectorContainer: {
    flex: 1,
    height: 4,
    marginHorizontal: spacing.xs,
    marginTop: 18, // Align with center of dot
    position: 'relative',
    maxWidth: 60,
  },
  connectorContainerCompact: {
    marginTop: 14,
    maxWidth: 40,
  },
  connectorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 2,
  },
  connectorProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    borderRadius: 2,
  },
});

export default AnalysisStepper;
