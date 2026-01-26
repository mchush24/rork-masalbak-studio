import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { IooMascotFinal as IooMascot } from '@/components/IooMascotFinal';
import { RenkooColors } from '@/constants/colors';
import { useRouter, Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Platform-safe haptics
const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style).catch(() => {});
  }
};
const isSmallDevice = SCREEN_HEIGHT < 700;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Button animations
  const primaryButtonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);

  // Floating particles animation
  const particle1Y = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle3Y = useSharedValue(0);

  useEffect(() => {
    // Floating particles
    particle1Y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(20, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
    particle2Y.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-15, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
    particle3Y.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, []);

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle1Y.value }],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle2Y.value }],
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle3Y.value }],
  }));

  const primaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryButtonScale.value }],
  }));

  const secondaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));

  const handlePrimaryPressIn = () => {
    primaryButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePrimaryPressOut = () => {
    primaryButtonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const handleSecondaryPressIn = () => {
    secondaryButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSecondaryPressOut = () => {
    secondaryButtonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const handleStartAnalysis = () => {
    router.push('/(onboarding)/welcome' as Href);
  };

  const handleLogin = () => {
    router.push('/(onboarding)/welcome' as Href);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent />

      {/* Background Gradient - Dream Sky */}
      <LinearGradient
        colors={['#FFF8F0', '#F5E8FF', '#FFE8F5', '#E8FFF5', '#FFF5E8']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Floating Dream Particles */}
      <Animated.View style={[styles.particle, styles.particle1, particle1Style]}>
        <LinearGradient
          colors={['rgba(232,213,255,0.4)', 'rgba(255,203,164,0.4)']}
          style={styles.particleGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.particle2, particle2Style]}>
        <LinearGradient
          colors={['rgba(255,214,224,0.4)', 'rgba(255,217,61,0.35)']}
          style={styles.particleGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.particle3, particle3Style]}>
        <LinearGradient
          colors={['rgba(184,244,232,0.4)', 'rgba(232,213,255,0.4)']}
          style={styles.particleGradient}
        />
      </Animated.View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Brand Badge */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <View style={styles.brandBadge}>
              <BlurView intensity={80} tint="light" style={styles.brandBadgeBlur}>
                <Text style={styles.brandBadgeText}>RENKİOO</Text>
              </BlurView>
            </View>
          </Animated.View>

          {/* Mascot - Ioo Dream Guardian */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(1000).springify()}
            style={styles.mascotWrapper}
          >
            <IooMascot size="hero" animated showGlow showSparkles mood="happy" />
          </Animated.View>

          {/* Mascot Name & Tagline */}
          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.mascotInfo}>
            <Text style={styles.mascotName}>Ioo</Text>
            <View style={styles.taglineContainer}>
              <LinearGradient
                colors={['rgba(232,213,255,0.25)', 'rgba(255,203,164,0.25)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.taglineGradient}
              >
                <Text style={styles.taglineText}>Birlikte Hayal Kuralım!</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </View>

        {/* Welcome Card */}
        <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.welcomeCard}>
          <BlurView intensity={70} tint="light" style={styles.welcomeCardBlur}>
            <View style={styles.welcomeCardContent}>
              <Text style={styles.welcomeTitle}>Merhaba!</Text>
              <Text style={styles.welcomeSubtitle}>
                Çocuğunuzun renkli dünyasını keşfedin
              </Text>
            </View>
          </BlurView>
          <View style={styles.welcomeCardBorder} />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(1000).duration(800)} style={styles.actionsContainer}>
          {/* Primary Button - Dream Gradient */}
          <AnimatedPressable
            style={[styles.primaryButton, primaryButtonStyle]}
            onPress={handleStartAnalysis}
            onPressIn={handlePrimaryPressIn}
            onPressOut={handlePrimaryPressOut}
            accessibilityRole="button"
            accessibilityLabel="Hayallere Başla"
            accessibilityHint="Uygulamaya başlamak için dokunun"
          >
            <LinearGradient
              colors={['#B98EFF', '#FFCBA4', '#FFD6E0', '#B8F4E8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <View style={styles.primaryButtonInner}>
                <Text style={styles.primaryButtonEmoji}>⭐</Text>
                <Text style={styles.primaryButtonText}>Hayallere Başla</Text>
              </View>
            </LinearGradient>
            <View style={styles.primaryButtonShadow} />
          </AnimatedPressable>

          {/* Secondary Button */}
          <AnimatedPressable
            style={[styles.secondaryButton, secondaryButtonStyle]}
            onPress={handleLogin}
            onPressIn={handleSecondaryPressIn}
            onPressOut={handleSecondaryPressOut}
            accessibilityRole="button"
            accessibilityLabel="Hesabım Var"
            accessibilityHint="Mevcut hesabınızla giriş yapmak için dokunun"
          >
            <BlurView intensity={60} tint="light" style={styles.secondaryButtonBlur}>
              <Text style={styles.secondaryButtonText}>Hesabım Var</Text>
            </BlurView>
            <View style={styles.secondaryButtonBorder} />
          </AnimatedPressable>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(1200).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>2035 Organic Biomimicry Design</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },

  // Floating Particles
  particle: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
  },
  particleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  particle1: {
    width: 120,
    height: 120,
    top: SCREEN_HEIGHT * 0.15,
    left: -30,
  },
  particle2: {
    width: 80,
    height: 80,
    top: SCREEN_HEIGHT * 0.3,
    right: -20,
  },
  particle3: {
    width: 100,
    height: 100,
    bottom: SCREEN_HEIGHT * 0.25,
    left: SCREEN_WIDTH * 0.6,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: isSmallDevice ? 10 : 20,
  },
  brandBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: isSmallDevice ? 16 : 24,
  },
  brandBadgeBlur: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  brandBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: RenkooColors.brand.jellyPurple,
    letterSpacing: 3,
  },
  mascotWrapper: {
    marginBottom: isSmallDevice ? 8 : 16,
  },
  mascotInfo: {
    alignItems: 'center',
    gap: 8,
  },
  mascotName: {
    fontSize: isSmallDevice ? 32 : 40,
    fontWeight: '800',
    color: RenkooColors.text.primary,
    letterSpacing: 4,
  },
  taglineContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  taglineGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  taglineText: {
    fontSize: 15,
    fontWeight: '600',
    color: RenkooColors.text.secondary,
    letterSpacing: 0.5,
  },

  // Welcome Card
  welcomeCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginVertical: isSmallDevice ? 16 : 24,
  },
  welcomeCardBlur: {
    padding: isSmallDevice ? 20 : 28,
  },
  welcomeCardContent: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  welcomeTitle: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '800',
    color: RenkooColors.text.primary,
  },
  welcomeSubtitle: {
    fontSize: isSmallDevice ? 15 : 17,
    color: RenkooColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Action Buttons
  actionsContainer: {
    gap: 14,
    marginBottom: isSmallDevice ? 16 : 24,
  },
  primaryButton: {
    borderRadius: 28,
    overflow: 'visible',
  },
  primaryButtonGradient: {
    borderRadius: 28,
    padding: 2,
  },
  primaryButtonInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 26,
    paddingVertical: isSmallDevice ? 18 : 22,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonEmoji: {
    fontSize: 22,
  },
  primaryButtonText: {
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  primaryButtonShadow: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    right: 20,
    height: 20,
    backgroundColor: 'rgba(185, 142, 255, 0.35)',
    borderRadius: 20,
    zIndex: -1,
  },
  secondaryButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  secondaryButtonBlur: {
    paddingVertical: isSmallDevice ? 16 : 18,
    alignItems: 'center',
  },
  secondaryButtonBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(185, 142, 255, 0.4)',
  },
  secondaryButtonText: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '600',
    color: RenkooColors.brand.jellyPurple,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: RenkooColors.text.muted,
    letterSpacing: 1,
  },
});
