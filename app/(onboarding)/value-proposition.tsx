/**
 * Value Proposition Screen
 *
 * 3-scene onboarding:
 * 1. "Cizimler Cok Sey Anlatir" - Emotional hook
 * 2. "Renkioo Neler Yapabilir?" - Features overview
 * 3. "Kesfetmeye Hazir misiniz?" - CTA
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import {
  Palette,
  BookOpen,
  Brain,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
  iconColors,
} from '@/constants/design-system';
import { Ioo as IooMascot } from '@/components/Ioo';
import { useHapticFeedback } from '@/lib/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// Pre-defined illustration styles
const illustrationStyles = StyleSheet.create({
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 250,
  },
  toolCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface Scene {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  features?: { icon: React.ReactNode; text: string }[];
  gradient: readonly [string, string, ...string[]];
  illustration: React.ReactNode;
}

const SCENES: Scene[] = [
  {
    id: 'language',
    title: 'Çizimler Çok Şey Anlatır',
    description:
      'Çocuklar duygularını her zaman kelimelerle ifade edemez. Ama çizimleri, renk seçimleri ve hikayeleri iç dünyalarının penceresidir.',
    gradient: ['#FFF8F0', '#F5E8FF', '#FFE8F5'],
    illustration: (
      <View style={illustrationStyles.illustrationContainer}>
        <IooMascot size="large" mood="curious" animated showGlow />
      </View>
    ),
  },
  {
    id: 'tools',
    title: 'Renkioo Neler Yapabilir?',
    description: 'Çocukların duygusal dünyasını anlamak için ihtiyacınız olan her şey.',
    features: [
      {
        icon: (
          <Brain
            size={iconSizes.action}
            color={Colors.secondary.lavender}
            strokeWidth={iconStroke.standard}
          />
        ),
        text: 'AI Çizim Analizi: Duygusal ipuçları',
      },
      {
        icon: (
          <BookOpen
            size={iconSizes.action}
            color={Colors.secondary.sunshine}
            strokeWidth={iconStroke.standard}
          />
        ),
        text: 'İnteraktif Hikayeler: Karar süreçleri',
      },
      {
        icon: (
          <Palette
            size={iconSizes.action}
            color={Colors.secondary.mint}
            strokeWidth={iconStroke.standard}
          />
        ),
        text: 'Dijital Boyama: Yaratıcılık',
      },
      {
        icon: (
          <TrendingUp
            size={iconSizes.action}
            color={Colors.secondary.grass}
            strokeWidth={iconStroke.standard}
          />
        ),
        text: 'Gelişim Takibi: Zaman içi değişim',
      },
    ],
    gradient: ['#F0F9FF', '#E8FFF5', '#F5F3FF'],
    illustration: (
      <View style={illustrationStyles.toolsGrid}>
        <View
          style={[illustrationStyles.toolCard, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}
        >
          <Brain
            size={iconSizes.feature}
            color={Colors.secondary.lavender}
            strokeWidth={iconStroke.standard}
          />
        </View>
        <View
          style={[illustrationStyles.toolCard, { backgroundColor: 'rgba(255, 213, 107, 0.15)' }]}
        >
          <BookOpen
            size={iconSizes.feature}
            color={Colors.secondary.sunshine}
            strokeWidth={iconStroke.standard}
          />
        </View>
        <View
          style={[illustrationStyles.toolCard, { backgroundColor: 'rgba(111, 237, 214, 0.15)' }]}
        >
          <Palette
            size={iconSizes.feature}
            color={Colors.secondary.mint}
            strokeWidth={iconStroke.standard}
          />
        </View>
        <View
          style={[illustrationStyles.toolCard, { backgroundColor: 'rgba(126, 217, 156, 0.15)' }]}
        >
          <TrendingUp
            size={iconSizes.feature}
            color={Colors.secondary.grass}
            strokeWidth={iconStroke.standard}
          />
        </View>
      </View>
    ),
  },
  {
    id: 'start',
    title: 'Keşfetmeye Hazır mısınız?',
    subtitle: 'Renkioo ve Ioo yanınızda',
    description: 'Çocukların gelişim yolculuğunda size rehberlik edecek.',
    gradient: ['#FFF8F0', '#F5E8FF', '#FFE8F5'],
    illustration: (
      <View style={illustrationStyles.illustrationContainer}>
        <IooMascot size="large" mood="happy" animated showGlow showSparkles />
      </View>
    ),
  },
];

export default function ValuePropositionScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { tapMedium, selection } = useHapticFeedback();
  const [currentScene, setCurrentScene] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(currentScene / (SCENES.length - 1));
  }, [currentScene, progress]);

  const handleNext = () => {
    selection();
    if (currentScene < SCENES.length - 1) {
      setCurrentScene(currentScene + 1);
      scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentScene + 1), animated: true });
    }
  };

  const handlePrev = () => {
    selection();
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
      scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentScene - 1), animated: true });
    }
  };

  const handleSkip = () => {
    tapMedium();
    router.push('/(onboarding)/role-select' as Href);
  };

  const handleGetStarted = () => {
    tapMedium();
    router.push('/(onboarding)/role-select' as Href);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newScene = Math.round(offsetX / SCREEN_WIDTH);
    if (newScene !== currentScene && newScene >= 0 && newScene < SCENES.length) {
      setCurrentScene(newScene);
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [20, 100])}%`,
  }));

  const scene = SCENES[currentScene];
  const isLastScene = currentScene === SCENES.length - 1;

  return (
    <LinearGradient
      colors={
        isDark
          ? ([...colors.background.pageGradient] as [string, string, ...string[]])
          : scene.gradient
      }
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Skip */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
          </View>
          {!isLastScene && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: colors.text.tertiary }]}>Atla</Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {SCENES.map(s => (
            <View key={s.id} style={styles.sceneContainer}>
              {/* Illustration */}
              <View style={styles.illustrationWrapper}>{s.illustration}</View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <Text style={[styles.title, { color: colors.text.primary }]}>{s.title}</Text>
                {s.subtitle && (
                  <Text style={[styles.subtitle, { color: colors.secondary.lavender }]}>
                    {s.subtitle}
                  </Text>
                )}
                <Text style={[styles.description, { color: colors.text.secondary }]}>
                  {s.description}
                </Text>

                {/* Features List */}
                {s.features && (
                  <View style={styles.featuresList}>
                    {s.features.map((feature, fIndex) => (
                      <View
                        key={fIndex}
                        style={[styles.featureItem, { backgroundColor: colors.surface.card }]}
                      >
                        {feature.icon}
                        <Text style={[styles.featureText, { color: colors.text.primary }]}>
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {SCENES.map((_, index) => (
              <View key={index} style={[styles.dot, index === currentScene && styles.dotActive]} />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {currentScene > 0 && (
              <Pressable
                onPress={handlePrev}
                style={({ pressed }) => [
                  styles.prevButton,
                  { backgroundColor: colors.surface.card },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ChevronLeft
                  size={iconSizes.navigation}
                  color={colors.text.tertiary}
                  strokeWidth={iconStroke.standard}
                />
              </Pressable>
            )}

            {isLastScene ? (
              <View style={styles.finalButtons}>
                <Pressable
                  onPress={handleGetStarted}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                >
                  <LinearGradient
                    colors={[colors.secondary.lavender, colors.secondary.sky] as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={[styles.primaryButtonText, { color: Colors.neutral.white }]}>
                      Devam Et
                    </Text>
                    <ArrowRight
                      size={iconSizes.action}
                      color={iconColors.inverted}
                      strokeWidth={iconStroke.standard}
                    />
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [styles.nextButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.nextButtonText}>Devam</Text>
                <ChevronRight
                  size={iconSizes.action}
                  color={iconColors.inverted}
                  strokeWidth={iconStroke.standard}
                />
              </Pressable>
            )}
          </View>
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
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
  },
  progressContainer: {
    flex: 1,
    marginRight: spacing['4'],
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary.lavender,
    borderRadius: radius.full,
  },
  skipButton: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
  },
  skipText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.medium,
    color: Colors.neutral.medium,
  },

  // Scene
  sceneContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: spacing['5'],
  },
  illustrationWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: SCREEN_HEIGHT * 0.35,
  },

  // Text Content
  textContent: {
    flex: 1,
    paddingTop: spacing['4'],
  },
  title: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
    lineHeight: isSmallDevice ? 32 : 40,
  },
  subtitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.medium,
    color: Colors.secondary.lavender,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  description: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing['4'],
  },

  // Features
  featuresList: {
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
  },
  featureText: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    fontFamily: typography.family.medium,
    flex: 1,
  },

  // Bottom Nav
  bottomNav: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['4'],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
  },
  dotActive: {
    backgroundColor: Colors.secondary.lavender,
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
  },
  prevButton: {
    padding: spacing['3'],
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.full,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary.lavender,
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.full,
    gap: spacing['2'],
    ...shadows.md,
  },
  nextButtonText: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  // Final buttons
  finalButtons: {
    flex: 1,
    gap: spacing['3'],
  },
  primaryButton: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.lg,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    gap: spacing['2'],
  },
  primaryButtonText: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
});
