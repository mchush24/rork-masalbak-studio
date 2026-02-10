/**
 * Welcome Screen - Value-First Onboarding
 *
 * Shows immediate value proposition with:
 * - Emotional hook
 * - Interactive preview
 * - Social proof
 */

import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  Heart,
  Sparkles,
  Star,
  Users,
  ChevronRight,
  Play,
} from 'lucide-react-native';
import {
  spacing,
  radius,
  shadows,
  typography,
  iconSizes,
  iconStroke,
  iconColors,
} from '@/constants/design-system';
import { Colors } from '@/constants/colors';
import { Ioo as IooMascot } from '@/components/Ioo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;
const isMediumDevice = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

// Sample emotional insights to show value
const SAMPLE_INSIGHTS = [
  { emotion: 'Mutluluk', level: 85, color: '#FFD93D', icon: '😊' },
  { emotion: 'Güvenlik', level: 72, color: '#6BCB77', icon: '🛡️' },
  { emotion: 'Yaratıcılık', level: 91, color: Colors.secondary.lavender, icon: '✨' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const insightAnims = useRef(
    SAMPLE_INSIGHTS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 5,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Auto-trigger preview after delay
    const timer = setTimeout(() => {
      triggerPreview();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const triggerPreview = () => {
    setShowPreview(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate preview card
    Animated.timing(previewAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Animate insights one by one
    insightAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 150,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  };

  const handleStartJourney = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(onboarding)/tour' as Href);
  };

  const handleTryNow = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    // Skip to main app for try-before-signup
    router.push('/(tabs)' as Href);
  };

  const handleLogin = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(onboarding)/login' as Href);
  };

  return (
    <LinearGradient
      colors={['#FFF8F0', '#F5E8FF', '#FFE8F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {/* Mascot */}
            <Animated.View
              style={[
                styles.mascotContainer,
                { transform: [{ scale: logoScaleAnim }] },
              ]}
            >
              <IooMascot
                size={isSmallDevice ? 'medium' : 'large'}
                animated
                showGlow
                showSparkles
                mood="happy"
              />
            </Animated.View>

            {/* Emotional Hook - Turkish */}
            <View style={styles.emotionalHook}>
              <Text style={styles.hookTitle}>
                Çocuğunuzun çizimleri{'\n'}
                <Text style={styles.hookHighlight}>sırlarını fısıldıyor</Text>
              </Text>
              <Text style={styles.hookSubtitle}>
                Her renk bir duygu, her çizgi bir mesaj taşır
              </Text>
            </View>

            {/* Value Preview Card */}
            {showPreview && (
              <Animated.View
                style={[
                  styles.previewCard,
                  {
                    opacity: previewAnim,
                    transform: [
                      {
                        translateY: previewAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.previewHeader}>
                  <Sparkles size={iconSizes.inline} color={Colors.secondary.lavender} strokeWidth={iconStroke.standard} />
                  <Text style={styles.previewHeaderText}>
                    Örnek Çizim Analizi
                  </Text>
                </View>

                {/* Sample Insights */}
                <View style={styles.insightsContainer}>
                  {SAMPLE_INSIGHTS.map((insight, index) => (
                    <Animated.View
                      key={insight.emotion}
                      style={[
                        styles.insightItem,
                        {
                          opacity: insightAnims[index],
                          transform: [
                            {
                              translateX: insightAnims[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.insightIcon}>{insight.icon}</Text>
                      <View style={styles.insightInfo}>
                        <Text style={styles.insightLabel}>{insight.emotion}</Text>
                        <View style={styles.insightBarBg}>
                          <Animated.View
                            style={[
                              styles.insightBarFill,
                              {
                                backgroundColor: insight.color,
                                width: insightAnims[index].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0%', `${insight.level}%`],
                                }),
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <Text style={[styles.insightPercent, { color: insight.color }]}>
                        {insight.level}%
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <View style={styles.socialProofItem}>
              <Users size={iconSizes.badge} color={Colors.secondary.lavender} strokeWidth={iconStroke.standard} />
              <Text style={styles.socialProofText}>10,000+ aile</Text>
            </View>
            <View style={styles.socialProofDot} />
            <View style={styles.socialProofItem}>
              <Star size={iconSizes.badge} color={Colors.secondary.sunshine} fill={Colors.secondary.sunshine} strokeWidth={iconStroke.standard} />
              <Text style={styles.socialProofText}>4.9 puan</Text>
            </View>
            <View style={styles.socialProofDot} />
            <View style={styles.socialProofItem}>
              <Heart size={iconSizes.badge} color={Colors.secondary.peach} fill={Colors.secondary.peach} strokeWidth={iconStroke.standard} />
              <Text style={styles.socialProofText}>Psikolog onaylı</Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            {/* Primary CTA - Try Now (Value First) */}
            <Pressable
              onPress={handleTryNow}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.lavender, '#818CF8', Colors.secondary.indigo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Play size={iconSizes.action} color={iconColors.inverted} fill={iconColors.inverted} strokeWidth={iconStroke.standard} />
                <Text style={styles.primaryButtonText}>
                  Hemen Deneyin - Ücretsiz
                </Text>
                <ChevronRight size={iconSizes.action} color={iconColors.inverted} strokeWidth={iconStroke.standard} />
              </LinearGradient>
            </Pressable>

            {/* Secondary CTA - Learn More */}
            <Pressable
              onPress={handleStartJourney}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                Nasıl Çalışır? Keşfedin
              </Text>
            </Pressable>

            {/* Login Link */}
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.loginText}>
                Zaten hesabınız var mı?{' '}
                <Text style={styles.loginLink}>Giriş Yapın</Text>
              </Text>
            </Pressable>
          </View>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>
              🔒 KVKK uyumlu • Verileriniz güvende
            </Text>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: isSmallDevice ? spacing.sm : spacing.md,
    paddingBottom: spacing.md,
  },

  // Hero Section
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    marginBottom: isSmallDevice ? spacing.md : spacing.lg,
  },

  // Emotional Hook
  emotionalHook: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? spacing.md : spacing.lg,
  },
  hookTitle: {
    fontSize: isSmallDevice ? typography.size.xl : typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 32 : 38,
    marginBottom: spacing.sm,
  },
  hookHighlight: {
    color: Colors.secondary.lavender,
  },
  hookSubtitle: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.dark,
    textAlign: 'center',
    fontWeight: typography.weight.medium,
  },

  // Preview Card
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing.md,
    width: '100%',
    maxWidth: 320,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167, 139, 250, 0.15)',
  },
  previewHeaderText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
  insightsContainer: {
    gap: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightInfo: {
    flex: 1,
  },
  insightLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  insightBarBg: {
    height: 6,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  insightBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightPercent: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    width: 36,
    textAlign: 'right',
  },

  // Social Proof
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  socialProofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialProofText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  socialProofDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral.gray300,
  },

  // CTA Section
  ctaSection: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 14 : 18,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
  loginText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  loginLink: {
    color: Colors.secondary.lavender,
    fontWeight: typography.weight.semibold,
  },

  // Trust Badge
  trustBadge: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  trustText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
});
