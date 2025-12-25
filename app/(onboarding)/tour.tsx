import { View, Text, Pressable, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Brain, FileCheck, Shield, CheckCircle } from 'lucide-react-native';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;
const isMediumDevice = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

const tourSteps = [
  {
    icon: Brain,
    title: 'Çocuğunuzun İç Dünyasını Anlayın',
    description: 'Bilimsel çizim analizleri ile duygusal ve psikolojik gelişimi destekleyin',
    benefits: ['Uzman onaylı değerlendirmeler', 'DAP, HTP, Aile Çizimi testleri', 'Kişiselleştirilmiş raporlar'],
    gradient: colors.gradients.professional,
  },
  {
    icon: FileCheck,
    title: 'Profesyonel Değerlendirme Araçları',
    description: 'Her çizim yapay zeka ve bilimsel yöntemlerle derinlemesine analiz edilir',
    benefits: ['Otomatik analiz sistemi', 'Gelişim izleme ve raporlama', 'Ebeveyn-öğretmen işbirliği'],
    gradient: colors.gradients.scientific,
  },
  {
    icon: Shield,
    title: 'Güvenli ve Hızlı',
    description: 'KVKK uyumlu veri güvenliği ile dakikalar içinde sonuç alın',
    benefits: ['Güvenli veri saklama', 'Gizlilik garantisi', 'Anında sonuç bildirimi'],
    gradient: colors.gradients.expertise,
  },
  {
    icon: CheckCircle,
    title: 'Hemen Başlayın',
    description: 'Ücretsiz deneme ile çocuğunuzun gelişimini takip etmeye başlayın',
    benefits: ['Kolay kurulum', 'Ücretsiz ilk analiz', 'İptal garantisi'],
    gradient: colors.gradients.accessible,
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
          {/* Icon */}
          {!isSmallDevice && (
            <View style={[styles.iconContainer, shadows.xl]}>
              <currentStepData.icon
                size={isMediumDevice ? 56 : 64}
                color="white"
                strokeWidth={1.5}
              />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>
            {currentStepData.title}
          </Text>

          {/* Description */}
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Benefits */}
          <View style={[styles.benefitsCard, shadows.lg]}>
            {currentStepData.benefits.slice(0, isSmallDevice ? 2 : 3).map((benefit, idx) => (
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
              {isLastStep ? 'Hesap Oluştur' : 'Devam Et →'}
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
    paddingVertical: isSmallDevice ? spacing.sm : spacing.md,
    minHeight: isSmallDevice ? 50 : 60,
  },
  stepCounter: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isSmallDevice ? spacing.md : spacing.xl,
  },
  iconContainer: {
    width: isMediumDevice ? 100 : 120,
    height: isMediumDevice ? 100 : 120,
    borderRadius: isMediumDevice ? 50 : 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: isSmallDevice ? typography.fontSize.lg : isMediumDevice ? typography.fontSize.xl : typography.fontSize.xxl,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: isSmallDevice ? spacing.sm : spacing.md,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: spacing.md,
  },
  description: {
    fontSize: isSmallDevice ? typography.fontSize.sm : typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: isSmallDevice ? typography.fontSize.sm * 1.5 : typography.fontSize.base * 1.5,
    marginBottom: isSmallDevice ? spacing.md : spacing.lg,
    paddingHorizontal: spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '500',
  },

  // Benefits
  benefitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: borderRadius.lg,
    padding: isSmallDevice ? spacing.md : spacing.lg,
    width: '100%',
    maxWidth: isSmallDevice ? 320 : 380,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isSmallDevice ? spacing.sm : spacing.md,
  },
  bulletPoint: {
    width: isSmallDevice ? 4 : 5,
    height: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 2 : 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: spacing.sm,
    marginTop: isSmallDevice ? 6 : 7,
  },
  benefitText: {
    fontSize: isSmallDevice ? typography.fontSize.sm - 1 : typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '500',
    flex: 1,
    lineHeight: isSmallDevice ? typography.fontSize.sm * 1.4 : typography.fontSize.sm * 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    paddingBottom: isSmallDevice ? spacing.lg : spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressDot: {
    width: isSmallDevice ? 6 : 8,
    height: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 3 : 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: spacing.xs,
  },
  progressDotActive: {
    width: isSmallDevice ? 24 : 32,
    backgroundColor: 'white',
  },
  progressDotPassed: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },

  // CTA Button
  nextButton: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xxxl,
    paddingVertical: isSmallDevice ? spacing.md : spacing.md + spacing.xs,
    paddingHorizontal: spacing.xl,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  nextButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  nextButtonText: {
    fontSize: isSmallDevice ? typography.fontSize.base : typography.fontSize.md,
    fontWeight: '900',
    color: colors.brand.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});
