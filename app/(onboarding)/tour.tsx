import { View, Text, Pressable, Animated, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';

const tourSteps = [
  {
    emoji: '🎨',
    title: 'Çizimleri Keşfet',
    description: 'Zuna ile çocuğunuzun çizimlerini anlamak artık çok kolay!',
    benefits: ['Duygusal gelişim', 'İç dünya keşfi', 'Yaratıcılık analizi'],
    gradient: colors.gradients.primary,
  },
  {
    emoji: '📚',
    title: 'Hikayeler Yarat',
    description: 'Her çizim benzersiz bir hikayeye dönüşüyor',
    benefits: ['Kişiselleştirilmiş', 'Eğitici içerik', 'Hayal gücü'],
    gradient: colors.gradients.ocean,
  },
  {
    emoji: '🌈',
    title: 'Renkli Aktiviteler',
    description: 'Çocuğunuza özel boyama ve aktivitelerle eğlenceli öğrenme',
    benefits: ['Yaş uyumlu', 'Gelişim odaklı', 'Oyun gibi öğrenme'],
    gradient: colors.gradients.forest,
  },
  {
    emoji: '⭐',
    title: 'Gelişimi İzle',
    description: 'Sanatsal ve duygusal gelişim adım adım takip edilir',
    benefits: ['Detaylı raporlar', 'İlerleme grafiği', 'Uzman önerileri'],
    gradient: colors.gradients.sunset,
  },
];

export default function TourScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isLastStep = currentStep === tourSteps.length - 1;
  const currentStepData = tourSteps[currentStep];

  useEffect(() => {
    // Animate in when step changes
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.slow,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...animations.easing.gentle,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [currentStep]);

  const handleNext = () => {
    console.log('[Tour] handleNext called, currentStep:', currentStep, 'isLastStep:', isLastStep);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isLastStep) {
      console.log('[Tour] Navigating to register screen...');
      router.push('/(onboarding)/register');
    } else {
      console.log('[Tour] Moving to next step...');
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/register');
  };

  return (
    <LinearGradient
      colors={currentStepData.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepCounter}>
            {currentStep + 1} / {tourSteps.length}
          </Text>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Atla</Text>
          </Pressable>
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
          {/* Emoji Icon */}
          <View style={[styles.iconContainer, shadows.xl]}>
            <Text style={styles.emoji}>{currentStepData.emoji}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentStepData.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Benefits */}
          <View style={[styles.benefitsCard, shadows.md]}>
            {currentStepData.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.benefitItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {tourSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotPassed,
                ]}
              />
            ))}
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={() => {
              console.log('[Tour] Button pressed!');
              handleNext();
            }}
            style={({ pressed }) => [
              styles.nextButton,
              shadows.lg,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Zuna ile Başla! 🚀' : 'Devam Et →'}
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
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  stepCounter: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: typography.fontSize.xxl + 4,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.6,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  // Benefits
  benefitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: spacing.md,
  },
  benefitText: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    flex: 1,
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.xs,
  },
  progressDotActive: {
    width: 32,
    backgroundColor: 'white',
  },
  progressDotPassed: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  // CTA Button
  nextButton: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  nextButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.brand.primary,
    textAlign: 'center',
  },
});
