/**
 * Tour Screen - Emotion-Driven Onboarding
 *
 * 3-step simplified tour focusing on:
 * - Parent emotions and concerns
 * - Clear value propositions
 * - Beautiful, engaging animations
 */

import { View, Text, Pressable, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Heart, Sparkles, Eye, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react-native';
import {
  spacing,
  shadows,
  typography,
  iconSizes,
  iconStroke,
  iconColors,
} from '@/constants/design-system';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;
const _isMediumDevice = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

// Emotion-driven tour steps
const tourSteps = [
  {
    id: 'understand',
    icon: Eye,
    emoji: '👁️',
    title: 'İç Dünyasını Görün',
    subtitle: 'Çocuğunuz size söyleyemediği şeyleri çiziyor',
    description:
      'Çizimler, çocukların duygusal dünyasının penceresidir. Renkioo ile bu pencereden içeri bakın.',
    highlight: 'Her çizim bir hikaye anlatır',
    gradient: ['#FFF5F5', '#FFE4E6', '#FDF2F8'] as const,
    iconBg: '#FDA4AF',
    iconColor: '#BE123C',
  },
  {
    id: 'support',
    icon: Heart,
    emoji: '💗',
    title: 'Doğru Destek Verin',
    subtitle: 'Ne hissettiklerini anladığınızda daha iyi yardım edebilirsiniz',
    description:
      'Analiz sonuçları size çocuğunuzun ihtiyaçlarını gösterir. Böylece tam zamanında, doğru desteği verebilirsiniz.',
    highlight: 'Uzman önerileri ile yol gösterin',
    gradient: ['#F5F3FF', '#EDE9FE', '#E9D5FF'] as const,
    iconBg: Colors.secondary.lavenderLight,
    iconColor: '#7C3AED',
  },
  {
    id: 'grow',
    icon: TrendingUp,
    emoji: '🌱',
    title: 'Birlikte Büyüyün',
    subtitle: 'Gelişimini izleyin, zamanla değişimi görün',
    description:
      'Haftalık raporlar ve gelişim grafikleri ile çocuğunuzun duygusal yolculuğunu takip edin.',
    highlight: 'Her adımda yanınızda',
    gradient: ['#F0FDF4', '#DCFCE7', '#D1FAE5'] as const,
    iconBg: '#86EFAC',
    iconColor: '#15803D',
  },
];

export default function TourScreen() {
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isLastStep = currentStep === tourSteps.length - 1;
  const currentStepData = tourSteps[currentStep];

  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    iconScaleAnim.setValue(0.8);

    // Animate in when step changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / tourSteps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isLastStep) {
      router.push('/(onboarding)/register' as Href);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(onboarding)/register' as Href);
  };

  const IconComponent = currentStepData.icon;

  return (
    <LinearGradient
      colors={
        isDark
          ? ([...colors.background.pageGradient] as [string, string, ...string[]])
          : currentStepData.gradient
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 ? (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ChevronLeft
                size={iconSizes.action}
                color={colors.text.secondary}
                strokeWidth={iconStroke.standard}
              />
              <Text style={[styles.backText, { color: colors.text.secondary }]}>Geri</Text>
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.text.tertiary }]}>Atla</Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBg, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: currentStepData.iconColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.stepCounter, { color: colors.text.tertiary }]}>
            {currentStep + 1} / {tourSteps.length}
          </Text>
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: currentStepData.iconBg,
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          >
            <IconComponent
              size={isSmallDevice ? iconSizes.large : iconSizes.empty}
              color={currentStepData.iconColor}
              strokeWidth={iconStroke.standard}
            />
          </Animated.View>

          {/* Emoji Badge */}
          <View style={[styles.emojiBadge, { backgroundColor: colors.surface.card }]}>
            <Text style={styles.emoji}>{currentStepData.emoji}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: currentStepData.iconColor }]}>
            {currentStepData.title}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {currentStepData.subtitle}
          </Text>

          {/* Description Card */}
          <View
            style={[
              styles.descriptionCard,
              { backgroundColor: colors.surface.card, borderColor: colors.border.light },
            ]}
          >
            <Text style={[styles.description, { color: colors.text.primary }]}>
              {currentStepData.description}
            </Text>

            {/* Highlight */}
            <View
              style={[
                styles.highlightContainer,
                { backgroundColor: `${currentStepData.iconBg}40` },
              ]}
            >
              <Sparkles
                size={iconSizes.badge}
                color={currentStepData.iconColor}
                strokeWidth={iconStroke.standard}
              />
              <Text style={[styles.highlightText, { color: currentStepData.iconColor }]}>
                {currentStepData.highlight}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Step Indicators */}
          <View style={styles.dotsContainer}>
            {tourSteps.map((step, index) => (
              <Pressable
                key={step.id}
                onPress={() => setCurrentStep(index)}
                style={[
                  styles.dot,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  index === currentStep && {
                    backgroundColor: currentStepData.iconColor,
                    width: 24,
                  },
                  index < currentStep && {
                    backgroundColor: `${currentStepData.iconColor}60`,
                  },
                ]}
              />
            ))}
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: currentStepData.iconColor },
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text style={styles.ctaText}>{isLastStep ? 'Hesap Oluştur' : 'Devam Et'}</Text>
            <ChevronRight
              size={iconSizes.action}
              color={iconColors.inverted}
              strokeWidth={iconStroke.standard}
            />
          </Pressable>

          {/* Login Link */}
          <Pressable
            onPress={() => router.push('/(onboarding)/login' as Href)}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.loginText, { color: colors.text.secondary }]}>
              Zaten hesabınız var mı?{' '}
              <Text style={[styles.loginLink, { color: currentStepData.iconColor }]}>
                Giriş Yapın
              </Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    minWidth: 60,
  },
  backText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  skipButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
    minWidth: 32,
    textAlign: 'right',
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  iconWrapper: {
    width: isSmallDevice ? 90 : 110,
    height: isSmallDevice ? 90 : 110,
    borderRadius: isSmallDevice ? 45 : 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  emojiBadge: {
    position: 'absolute',
    top: isSmallDevice ? 60 : 80,
    right: SCREEN_WIDTH / 2 - (isSmallDevice ? 65 : 75),
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  emoji: {
    fontSize: 16,
  },
  title: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    textAlign: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: isSmallDevice ? 20 : 24,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  description: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.darker,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 22 : 24,
    marginBottom: spacing.md,
  },
  highlightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  highlightText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 14 : 18,
    borderRadius: 16,
    gap: spacing.xs,
    ...shadows.md,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaText: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  loginText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: typography.weight.semibold,
  },
});
