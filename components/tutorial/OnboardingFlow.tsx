/**
 * OnboardingFlow - First-time user onboarding
 * Phase 14: Tutorial System
 *
 * Provides guided onboarding experience:
 * - Multi-step onboarding screens
 * - Progress indicators
 * - Skip/complete actions
 * - Animated illustrations
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ViewStyle,
  StyleProp,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInRight,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRight,
  Check,
  Palette,
  Brain,
  Heart,
  Sparkles,
  BookOpen,
  Shield,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/lib/haptics';
import { shadows } from '@/constants/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = 'onboarding_completed';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  colors: readonly [string, string];
  illustration?: React.ReactNode;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Renkioo\'ya Hoş Geldiniz',
    description: 'Çocuğunuzun duygusal dünyasını keşfetmek için doğru yerdesiniz.',
    icon: Heart,
    colors: [Colors.secondary.lavender, Colors.secondary.rose] as const,
  },
  {
    id: 'coloring',
    title: 'Boyama Analizi',
    description: 'Çocuğunuzun çizimlerini yükleyin, AI destekli analiz ile duygusal içgörüler kazanın.',
    icon: Palette,
    colors: [Colors.emotion.joy, Colors.primary.sunset] as const,
  },
  {
    id: 'stories',
    title: 'Etkileşimli Hikayeler',
    description: 'Kişiselleştirilmiş hikayelerle duygusal zeka geliştirin.',
    icon: BookOpen,
    colors: [Colors.secondary.mint, Colors.emotion.trust] as const,
  },
  {
    id: 'insights',
    title: 'Gelişim Takibi',
    description: 'Detaylı raporlar ve grafiklerle çocuğunuzun duygusal gelişimini izleyin.',
    icon: Brain,
    colors: [Colors.secondary.lavender, Colors.secondary.mint] as const,
  },
  {
    id: 'privacy',
    title: 'Güvenlik & Gizlilik',
    description: 'Verileriniz şifrelenir ve güvende tutulur. Tam kontrol sizde.',
    icon: Shield,
    colors: [Colors.emotion.trust, Colors.secondary.mint] as const,
  },
];

interface OnboardingFlowProps {
  steps?: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Full-screen onboarding flow
 */
export function OnboardingFlow({
  steps = defaultSteps,
  onComplete,
  onSkip,
  showSkip = true,
  style,
}: OnboardingFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const { tapLight, tapMedium, tapHeavy, success, warning, error: hapticError } = useHaptics();

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollX.value = event.nativeEvent.contentOffset.x;
    },
    []
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentIndex(index);
    },
    []
  );

  const goToNext = async () => {
    tapMedium();
    if (currentIndex < steps.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    success();
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete?.();
  };

  const handleSkip = async () => {
    tapLight();
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onSkip?.();
  };

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => (
    <OnboardingStepView
      step={item}
      index={index}
      scrollX={scrollX}
      totalSteps={steps.length}
    />
  );

  const isLastStep = currentIndex === steps.length - 1;

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      {/* Skip button */}
      {showSkip && !isLastStep && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Animated.Text style={styles.skipButtonText}>Atla</Animated.Text>
        </Pressable>
      )}

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <PageIndicator
          total={steps.length}
          current={currentIndex}
          scrollX={scrollX}
        />

        <Pressable
          style={[styles.nextButton, isLastStep && styles.completeButton]}
          onPress={goToNext}
        >
          <LinearGradient
            colors={isLastStep
              ? [Colors.emotion.trust, Colors.secondary.mint]
              : [Colors.secondary.lavender, Colors.secondary.rose]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {isLastStep ? (
              <>
                <Animated.Text style={styles.nextButtonText}>Başla</Animated.Text>
                <Sparkles size={20} color={Colors.neutral.white} />
              </>
            ) : (
              <>
                <Animated.Text style={styles.nextButtonText}>Devam</Animated.Text>
                <ChevronRight size={20} color={Colors.neutral.white} />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

interface OnboardingStepViewProps {
  step: OnboardingStep;
  index: number;
  scrollX: SharedValue<number>;
  totalSteps: number;
}

function OnboardingStepView({
  step,
  index,
  scrollX,
  totalSteps,
}: OnboardingStepViewProps) {
  const Icon = step.icon;

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const rotate = interpolate(
      scrollX.value,
      inputRange,
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <View style={styles.stepContainer}>
      <LinearGradient
        colors={step.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stepGradient}
      >
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <View style={styles.iconBackground}>
            <Icon size={60} color={step.colors[0]} />
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.stepContent, animatedStyle]}>
        <Animated.Text style={styles.stepTitle}>{step.title}</Animated.Text>
        <Animated.Text style={styles.stepDescription}>
          {step.description}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

interface PageIndicatorProps {
  total: number;
  current: number;
  scrollX: SharedValue<number>;
}

function PageIndicator({ total, current, scrollX }: PageIndicatorProps) {
  return (
    <View style={styles.pageIndicatorContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <PageDot
          key={index}
          index={index}
          current={current}
          scrollX={scrollX}
        />
      ))}
    </View>
  );
}

interface PageDotProps {
  index: number;
  current: number;
  scrollX: SharedValue<number>;
}

function PageDot({ index, current, scrollX }: PageDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.pageDot,
        index === current && styles.pageDotActive,
        animatedStyle,
      ]}
    />
  );
}

/**
 * Check if onboarding is completed
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Reset onboarding status
 */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  stepGradient: {
    height: SCREEN_HEIGHT * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  stepContent: {
    flex: 1,
    padding: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },

  // Skip button
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },

  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Page indicator
  pageIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.light,
  },
  pageDotActive: {
    backgroundColor: Colors.secondary.lavender,
  },

  // Next button
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.colored(Colors.secondary.lavender),
  },
  completeButton: {
    shadowColor: Colors.emotion.trust,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
});

export default OnboardingFlow;
