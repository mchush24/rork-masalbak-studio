/**
 * Renkioo Premium Home Screen
 *
 * World-class opening experience inspired by:
 * - Calm: Warm gradients, breathing animations
 * - Headspace: Playful mascot, clear hierarchy
 * - Duolingo: Friendly character, bold CTA
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter, Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Components
import { Ioo as IooMascot } from '@/components/Ioo';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// ============================================
// PLATFORM UTILITIES
// ============================================
const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style).catch(() => {});
  }
};

// ============================================
// FLOATING PARTICLE COMPONENT
// ============================================
interface FloatingParticleProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay: number;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({
  size,
  color,
  initialX,
  initialY,
  delay,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Fade in
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 2000 }));
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.back(1.5)) })
    );

    // Float
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(20, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          left: initialX,
          top: initialY,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export default function PremiumHomeScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mascot state
  const [mascotMood, setMascotMood] = React.useState<'happy' | 'excited' | 'love'>('happy');

  // Animation values
  const mascotY = useSharedValue(0);
  const mascotRotate = useSharedValue(0);
  const ctaScale = useSharedValue(1);
  const ctaGlow = useSharedValue(0);
  const secondaryScale = useSharedValue(1);
  const _gradientProgress = useSharedValue(0);

  useEffect(() => {
    // Mascot gentle floating
    mascotY.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(12, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Subtle rotation
    mascotRotate.value = withRepeat(
      withSequence(
        withTiming(-1.5, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // CTA button glow pulse
    ctaGlow.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Background gradient animation (reserved for future use)
    _gradientProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animated styles
  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotY.value }, { rotate: `${mascotRotate.value}deg` }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const ctaGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + ctaGlow.value * 0.4,
    transform: [{ scale: 1 + ctaGlow.value * 0.1 }],
  }));

  const secondaryAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryScale.value }],
  }));

  // Handlers
  const handleStartJourney = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(onboarding)/welcome' as Href);
  }, [router]);

  const handleLogin = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/login' as Href);
  }, [router]);

  const handleCtaPressIn = useCallback(() => {
    ctaScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCtaPressOut = useCallback(() => {
    ctaScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSecondaryPressIn = useCallback(() => {
    secondaryScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSecondaryPressOut = useCallback(() => {
    secondaryScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMascotTap = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const moods: ('happy' | 'excited' | 'love')[] = ['excited', 'love', 'happy'];
    const currentIndex = moods.indexOf(mascotMood);
    setMascotMood(moods[(currentIndex + 1) % moods.length]);
  }, [mascotMood]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />

      {/* Premium Gradient Background */}
      <LinearGradient
        colors={
          isDark
            ? ([...Colors.welcome.backgroundDark] as [string, string, ...string[]])
            : ([...Colors.welcome.background] as [string, string, ...string[]])
        }
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Warm overlay gradient */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255, 150, 180, 0.08)',
          'rgba(255, 200, 150, 0.05)',
          'transparent',
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient light effects */}
      <View style={styles.ambientLight1} />
      <View style={styles.ambientLight2} />
      <View style={styles.ambientLight3} />

      {/* Floating particles */}
      <FloatingParticle
        size={8}
        color="rgba(255, 200, 255, 0.6)"
        initialX={SCREEN_WIDTH * 0.1}
        initialY={SCREEN_HEIGHT * 0.15}
        delay={0}
      />
      <FloatingParticle
        size={6}
        color="rgba(200, 220, 255, 0.5)"
        initialX={SCREEN_WIDTH * 0.85}
        initialY={SCREEN_HEIGHT * 0.2}
        delay={300}
      />
      <FloatingParticle
        size={10}
        color="rgba(255, 220, 200, 0.5)"
        initialX={SCREEN_WIDTH * 0.15}
        initialY={SCREEN_HEIGHT * 0.4}
        delay={600}
      />
      <FloatingParticle
        size={7}
        color="rgba(220, 200, 255, 0.6)"
        initialX={SCREEN_WIDTH * 0.9}
        initialY={SCREEN_HEIGHT * 0.5}
        delay={900}
      />
      <FloatingParticle
        size={5}
        color="rgba(255, 180, 200, 0.5)"
        initialX={SCREEN_WIDTH * 0.05}
        initialY={SCREEN_HEIGHT * 0.7}
        delay={400}
      />
      <FloatingParticle
        size={9}
        color="rgba(200, 255, 230, 0.4)"
        initialX={SCREEN_WIDTH * 0.8}
        initialY={SCREEN_HEIGHT * 0.75}
        delay={700}
      />

      {/* Content */}
      <View
        style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      >
        {/* Brand Badge */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.brandContainer}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>RENKİOO</Text>
          </View>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Tagline above mascot */}
          <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.taglineContainer}>
            <Text style={styles.taglineHighlight}>Merhaba!</Text>
          </Animated.View>

          {/* Mascot */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(1000).springify()}
            style={[styles.mascotContainer, mascotAnimatedStyle]}
          >
            <Pressable onPress={handleMascotTap} accessibilityLabel="Maskot">
              <IooMascot size="large" animated showGlow showSparkles mood={mascotMood} />
            </Pressable>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View
            entering={FadeIn.delay(800).duration(800)}
            style={styles.subtitleContainer}
          >
            <Text style={styles.subtitle}>Küçük kalplerden büyük mesajlar</Text>
          </Animated.View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          {/* Primary CTA Button */}
          <Animated.View entering={FadeInUp.delay(1000).duration(800)} style={ctaAnimatedStyle}>
            {/* Glow effect behind button */}
            <Animated.View style={[styles.ctaGlow, ctaGlowStyle]} />

            <Pressable
              onPress={handleStartJourney}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              style={styles.ctaButton}
              accessibilityRole="button"
              accessibilityLabel="Yolculuğa Başla"
            >
              <LinearGradient
                colors={[...Colors.welcome.cta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Renklendir</Text>
                <Text style={styles.ctaSubtext}>Her Duygu Bir Renk</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Secondary Button */}
          <Animated.View
            entering={FadeInUp.delay(1200).duration(600)}
            style={secondaryAnimatedStyle}
          >
            <Pressable
              onPress={handleLogin}
              onPressIn={handleSecondaryPressIn}
              onPressOut={handleSecondaryPressOut}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel="Hesabım Var"
            >
              <Text style={styles.secondaryText}>Hesabım Var</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View entering={FadeIn.delay(1400).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>Çocuğunuzun duygusal dünyası</Text>
        </Animated.View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.welcome.containerBg,
  },

  // Ambient lights
  ambientLight1: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.0,
    height: SCREEN_WIDTH * 1.0,
    borderRadius: SCREEN_WIDTH * 0.5,
    backgroundColor:
      Platform.OS === 'web' ? 'rgba(147, 112, 219, 0.15)' : 'rgba(147, 112, 219, 0.08)',
    top: -SCREEN_WIDTH * 0.35,
    left: -SCREEN_WIDTH * 0.25,
    ...Platform.select({
      web: { filter: 'blur(60px)' } as Record<string, string>,
      default: {},
    }),
  },
  ambientLight2: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor:
      Platform.OS === 'web' ? 'rgba(255, 150, 180, 0.12)' : 'rgba(255, 150, 180, 0.06)',
    top: SCREEN_HEIGHT * 0.3,
    right: -SCREEN_WIDTH * 0.25,
    ...Platform.select({
      web: { filter: 'blur(50px)' } as Record<string, string>,
      default: {},
    }),
  },
  ambientLight3: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH * 0.45,
    backgroundColor:
      Platform.OS === 'web' ? 'rgba(100, 200, 255, 0.1)' : 'rgba(100, 200, 255, 0.05)',
    bottom: -SCREEN_WIDTH * 0.25,
    left: -SCREEN_WIDTH * 0.15,
    ...Platform.select({
      web: { filter: 'blur(55px)' } as Record<string, string>,
      default: {},
    }),
  },

  // Particles
  particle: {
    position: 'absolute',
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px currentColor',
      },
      default: {
        shadowColor: Colors.neutral.white,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
    }),
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Brand
  brandContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 6 : 10,
  },
  brandBadge: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  brandText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: 6,
  },

  // Hero
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 8 : 12,
  },
  taglineHighlight: {
    fontSize: isSmallDevice ? 40 : 52,
    fontWeight: '800',
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.neutral.white,
    letterSpacing: -1,
    ...Platform.select({
      web: {
        textShadow: '0 0 60px rgba(255, 120, 180, 0.7), 0 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        textShadowColor: 'rgba(255, 120, 180, 0.7)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 30,
      },
    }),
  },
  mascotContainer: {
    marginTop: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 8 : 12,
  },
  subtitleContainer: {
    marginTop: isSmallDevice ? 16 : 20,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: isSmallDevice ? 17 : 20,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 26 : 30,
    letterSpacing: 0.3,
  },

  // CTA Section
  ctaSection: {
    gap: 14,
    marginBottom: isSmallDevice ? 12 : 20,
  },
  ctaGlow: {
    position: 'absolute',
    top: -20,
    left: 5,
    right: 5,
    bottom: -20,
    borderRadius: 44,
    backgroundColor:
      Platform.OS === 'web' ? 'rgba(255, 100, 130, 0.5)' : 'rgba(255, 100, 130, 0.25)',
    ...Platform.select({
      web: {
        filter: 'blur(25px)',
      } as Record<string, string>,
      default: {
        shadowColor: '#FF5080',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
      },
    }),
  },
  ctaButton: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(255, 80, 120, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: Colors.welcome.ctaShadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
      },
    }),
  },
  ctaGradient: {
    paddingVertical: isSmallDevice ? 20 : 24,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '800',
    fontFamily: 'Poppins_800ExtraBold',
    color: Colors.neutral.white,
    letterSpacing: 1,
    ...Platform.select({
      web: {
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
  ctaSubtext: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: isSmallDevice ? 16 : 18,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.5,
  },
});
