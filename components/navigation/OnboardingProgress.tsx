/**
 * OnboardingProgress Component
 * Phase 3: UX Enhancement
 *
 * Progress indicator for onboarding flow with:
 * - Step dots with animated transitions
 * - Skip button option
 * - Back button
 * - Current step indicator
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';

interface OnboardingProgressProps {
  /** Current step (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Show back button */
  showBack?: boolean;
  /** Show skip button */
  showSkip?: boolean;
  /** Skip button text */
  skipText?: string;
  /** Called when skip is pressed */
  onSkip?: () => void;
  /** Called when back is pressed */
  onBack?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Use light theme (for dark backgrounds) */
  light?: boolean;
}

const _AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OnboardingProgress({
  currentStep,
  totalSteps,
  showBack = true,
  showSkip = true,
  skipText = 'Atla',
  onSkip,
  onBack,
  style,
  light = false,
}: OnboardingProgressProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tapLight } = useHapticFeedback();

  const handleBack = () => {
    tapLight();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    tapLight();
    onSkip?.();
  };

  const colors = {
    active: light ? Colors.neutral.white : Colors.primary.sunset,
    inactive: light ? 'rgba(255,255,255,0.3)' : Colors.neutral.lighter,
    text: light ? Colors.neutral.white : Colors.neutral.dark,
    textMuted: light ? 'rgba(255,255,255,0.7)' : Colors.neutral.medium,
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { paddingTop: insets.top + spacing['2'] }, style]}
    >
      {/* Back Button */}
      <View style={styles.leftSection}>
        {showBack && currentStep > 1 ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              light && styles.backButtonLight,
              pressed && { opacity: 0.6 },
            ]}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <ProgressDot
              key={index}
              isActive={isActive}
              isCompleted={isCompleted}
              activeColor={colors.active}
              inactiveColor={colors.inactive}
            />
          );
        })}
      </View>

      {/* Skip Button */}
      <View style={styles.rightSection}>
        {showSkip && onSkip ? (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <Text style={[styles.skipText, { color: colors.textMuted }]}>{skipText}</Text>
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </Animated.View>
  );
}

// Individual Progress Dot
interface ProgressDotProps {
  isActive: boolean;
  isCompleted: boolean;
  activeColor: string;
  inactiveColor: string;
}

function ProgressDot({ isActive, isCompleted, activeColor, inactiveColor }: ProgressDotProps) {
  const scale = useSharedValue(isActive ? 1 : 0.7);
  const width = useSharedValue(isActive ? 24 : 8);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.8, { damping: 15, stiffness: 200 });
    width.value = withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 200 });
  }, [isActive, scale, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ scale: scale.value }],
    backgroundColor: isActive || isCompleted ? activeColor : inactiveColor,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

// Step Counter variant
interface StepCounterProps {
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  showSkip?: boolean;
  skipText?: string;
  onSkip?: () => void;
  onBack?: () => void;
  style?: ViewStyle;
  light?: boolean;
}

export function OnboardingStepCounter({
  currentStep,
  totalSteps,
  showBack = true,
  showSkip = true,
  skipText = 'Atla',
  onSkip,
  onBack,
  style,
  light = false,
}: StepCounterProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tapLight } = useHapticFeedback();

  const handleBack = () => {
    tapLight();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    tapLight();
    onSkip?.();
  };

  const colors = {
    text: light ? Colors.neutral.white : Colors.neutral.darkest,
    textMuted: light ? 'rgba(255,255,255,0.7)' : Colors.neutral.medium,
    accent: light ? Colors.neutral.white : Colors.primary.sunset,
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { paddingTop: insets.top + spacing['2'] }, style]}
    >
      {/* Back Button */}
      <View style={styles.leftSection}>
        {showBack && currentStep > 1 ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              light && styles.backButtonLight,
              pressed && { opacity: 0.6 },
            ]}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Step Counter */}
      <View style={styles.counterContainer}>
        <Text style={[styles.counterText, { color: colors.textMuted }]}>
          <Text style={[styles.counterCurrent, { color: colors.accent }]}>{currentStep}</Text>
          {' / '}
          {totalSteps}
        </Text>
      </View>

      {/* Skip Button */}
      <View style={styles.rightSection}>
        {showSkip && onSkip ? (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <Text style={[styles.skipText, { color: colors.textMuted }]}>{skipText}</Text>
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </Animated.View>
  );
}

// Progress Bar variant
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  showSkip?: boolean;
  skipText?: string;
  onSkip?: () => void;
  onBack?: () => void;
  style?: ViewStyle;
  light?: boolean;
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  showBack = true,
  showSkip = true,
  skipText = 'Atla',
  onSkip,
  onBack,
  style,
  light = false,
}: ProgressBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tapLight } = useHapticFeedback();
  const progress = useSharedValue((currentStep - 1) / (totalSteps - 1));

  React.useEffect(() => {
    progress.value = withSpring((currentStep - 1) / (totalSteps - 1), {
      damping: 20,
      stiffness: 100,
    });
  }, [currentStep, totalSteps, progress]);

  const handleBack = () => {
    tapLight();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    tapLight();
    onSkip?.();
  };

  const colors = {
    text: light ? Colors.neutral.white : Colors.neutral.darkest,
    textMuted: light ? 'rgba(255,255,255,0.7)' : Colors.neutral.medium,
    barBg: light ? 'rgba(255,255,255,0.2)' : Colors.neutral.lighter,
    barFill: light ? Colors.neutral.white : Colors.primary.sunset,
  };

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.container,
        styles.containerWithBar,
        { paddingTop: insets.top + spacing['2'] },
        style,
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        {/* Back Button */}
        <View style={styles.leftSection}>
          {showBack && currentStep > 1 ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                light && styles.backButtonLight,
                pressed && { opacity: 0.6 },
              ]}
              hitSlop={8}
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Step Counter */}
        <Text style={[styles.barStepText, { color: colors.textMuted }]}>
          Adım {currentStep}/{totalSteps}
        </Text>

        {/* Skip Button */}
        <View style={styles.rightSection}>
          {showSkip && onSkip ? (
            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
              hitSlop={8}
            >
              <Text style={[styles.skipText, { color: colors.textMuted }]}>{skipText}</Text>
            </Pressable>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarBg, { backgroundColor: colors.barBg }]}>
        <Animated.View
          style={[styles.progressBarFill, { backgroundColor: colors.barFill }, animatedBarStyle]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['3'],
  },
  containerWithBar: {
    flexDirection: 'column',
    gap: spacing['3'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backButtonLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipButton: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['1'],
  },
  skipText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },

  // Counter
  counterContainer: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
  counterCurrent: {
    fontFamily: typography.family.bold,
  },

  // Progress Bar
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  barStepText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
});

export default OnboardingProgress;
