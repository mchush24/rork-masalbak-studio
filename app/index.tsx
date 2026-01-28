/**
 * Symbiosis Home Screen - "Emotional Symbiosis" Landing
 *
 * Immersive, bioluminescent experience with:
 * - Fluid shader background
 * - Holographic glass cards
 * - Symbiotic heart button
 * - Ioo mascot integration
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
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
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from 'react-native-reanimated';
import { useRouter, Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Advanced Components
import { FluidBackground } from '@/components/advanced/FluidBackground';
import { HolographicCard } from '@/components/advanced/HolographicCard';
import { SymbioticHeartButton } from '@/components/advanced/SymbioticHeartButton';
import { IooMascotFinal as IooMascot } from '@/components/IooMascotFinal';

// Theme
import { SymbiosisTheme } from '@/constants/SymbiosisTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// ============================================
// ANIMATED COMPONENTS
// ============================================
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================
// PLATFORM UTILITIES
// ============================================
const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style).catch(() => {});
  }
};

// ============================================
// FLOATING ORB COMPONENT
// ============================================
interface FloatingOrbProps {
  colors: readonly string[];
  size: number;
  initialX: number;
  initialY: number;
  delay: number;
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({
  colors,
  size,
  initialX,
  initialY,
  delay,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-25, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
          withTiming(25, { duration: 3500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingOrb,
        {
          width: size,
          height: size,
          left: initialX,
          top: initialY,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[...colors] as [string, string, ...string[]]}
        style={styles.orbGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </Animated.View>
  );
};

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export default function SymbiosisHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Animation values
  const mascotY = useSharedValue(0);
  const titleGlow = useSharedValue(0.6);
  const secondaryButtonScale = useSharedValue(1);

  useEffect(() => {
    // Mascot floating animation
    mascotY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(12, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Title glow pulse
    titleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotY.value }],
  }));

  const titleGlowStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'web') {
      // Web uses CSS shorthand
      return {
        textShadow: `0px 0px ${20 * titleGlow.value}px rgba(0, 245, 255, ${titleGlow.value * 0.8})`,
      };
    }
    // Native uses individual props
    return {
      textShadowColor: `rgba(0, 245, 255, ${titleGlow.value * 0.8})`,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20 * titleGlow.value,
    };
  });

  const secondaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));

  // Handlers
  const handleStartJourney = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(onboarding)/welcome' as Href);
  }, [router]);

  const handleLogin = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/welcome' as Href);
  }, [router]);

  const handleSecondaryPressIn = () => {
    secondaryButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSecondaryPressOut = () => {
    secondaryButtonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <View style={styles.container}>
      {/* Immersive Status Bar */}
      <StatusBar style="light" translucent />

      {/* Layer 1: Fluid Shader Background */}
      <FluidBackground
        intensity={1.2}
        speed={0.8}
        showOrbs={true}
      />

      {/* Layer 2: Additional Floating Orbs */}
      <FloatingOrb
        colors={['rgba(185, 142, 255, 0.5)', 'rgba(185, 142, 255, 0.1)', 'transparent']}
        size={100}
        initialX={-30}
        initialY={SCREEN_HEIGHT * 0.2}
        delay={0}
      />
      <FloatingOrb
        colors={['rgba(255, 158, 191, 0.5)', 'rgba(255, 158, 191, 0.1)', 'transparent']}
        size={70}
        initialX={SCREEN_WIDTH - 50}
        initialY={SCREEN_HEIGHT * 0.35}
        delay={500}
      />
      <FloatingOrb
        colors={['rgba(112, 255, 214, 0.4)', 'rgba(112, 255, 214, 0.1)', 'transparent']}
        size={85}
        initialX={SCREEN_WIDTH * 0.7}
        initialY={SCREEN_HEIGHT * 0.75}
        delay={1000}
      />

      {/* Content Layer */}
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

        {/* Header: Brand Badge */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.headerSection}
        >
          <View style={styles.brandBadge}>
            <BlurView intensity={40} tint="dark" style={styles.brandBadgeBlur}>
              <Text style={styles.brandBadgeText}>RENKİOO</Text>
            </BlurView>
            <View style={styles.brandBadgeBorder} />
          </View>
        </Animated.View>

        {/* Hero Section: Mascot + Heart Button */}
        <View style={styles.heroSection}>
          {/* Page Title with Glow */}
          <Animated.View
            entering={FadeIn.delay(400).duration(800)}
            style={styles.titleContainer}
          >
            <Animated.Text style={[styles.pageTitle, titleGlowStyle]}>
              Ana Sayfa
            </Animated.Text>
          </Animated.View>

          {/* Mascot floating */}
          <Animated.View
            entering={SlideInUp.delay(600).duration(1000).springify()}
            style={[styles.mascotWrapper, mascotAnimatedStyle]}
          >
            <IooMascot
              size="hero"
              animated
              showGlow
              showSparkles
              mood="happy"
            />
          </Animated.View>

          {/* Heart Button positioned at mascot's "hands" */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(800)}
            style={styles.heartButtonWrapper}
          >
            <SymbioticHeartButton
              label="Dokun ve Hisset"
              subLabel="Hayallere Baslayalim"
              size={isSmallDevice ? SCREEN_WIDTH * 0.4 : SCREEN_WIDTH * 0.45}
              onPress={handleStartJourney}
            />
          </Animated.View>
        </View>

        {/* Welcome Card */}
        <Animated.View
          entering={FadeInUp.delay(1200).duration(800)}
          style={styles.welcomeCardWrapper}
        >
          <HolographicCard
            variant="rainbow"
            glowIntensity={0.5}
            pulsing={true}
            breathing={false}
            blurIntensity={60}
            borderRadius={28}
            style={styles.welcomeCard}
          >
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>Merhaba!</Text>
              <Text style={styles.welcomeSubtitle}>
                Cocugunuzun renkli dunyasini birlikte kesfedin
              </Text>
            </View>
          </HolographicCard>
        </Animated.View>

        {/* Secondary Action */}
        <Animated.View
          entering={FadeInUp.delay(1400).duration(600)}
          style={styles.secondarySection}
        >
          <AnimatedPressable
            style={[styles.secondaryButton, secondaryButtonStyle]}
            onPress={handleLogin}
            onPressIn={handleSecondaryPressIn}
            onPressOut={handleSecondaryPressOut}
            accessibilityRole="button"
            accessibilityLabel="Hesabim Var"
          >
            <BlurView intensity={30} tint="dark" style={styles.secondaryButtonBlur}>
              <Text style={styles.secondaryButtonText}>Hesabim Var</Text>
            </BlurView>
            <View style={styles.secondaryButtonBorder} />
          </AnimatedPressable>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeIn.delay(1600).duration(600)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>2035 Emotional Symbiosis</Text>
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
    backgroundColor: '#0A0E1A',
  },

  // Floating Orbs
  floatingOrb: {
    position: 'absolute',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },

  // Content Layout
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 8 : 16,
  },
  brandBadge: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  brandBadgeBlur: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  brandBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 4,
    ...Platform.select({
      web: {
        textShadow: '0px 0px 10px rgba(0, 245, 255, 0.5)',
      },
      default: {
        textShadowColor: 'rgba(0, 245, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      },
    }),
  },
  brandBadgeBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.3)',
  },

  // Hero Section
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.45,
  },
  titleContainer: {
    marginBottom: isSmallDevice ? 8 : 16,
  },
  pageTitle: {
    fontSize: isSmallDevice ? 28 : 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  mascotWrapper: {
    marginBottom: isSmallDevice ? -60 : -80,
    zIndex: 10,
  },
  heartButtonWrapper: {
    zIndex: 5,
  },

  // Welcome Card
  welcomeCardWrapper: {
    marginTop: isSmallDevice ? 16 : 24,
    marginBottom: isSmallDevice ? 12 : 20,
  },
  welcomeCard: {
    minHeight: isSmallDevice ? 80 : 100,
  },
  welcomeContent: {
    alignItems: 'center',
    gap: 6,
  },
  welcomeTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: '#FFFFFF',
    ...Platform.select({
      web: {
        textShadow: '0px 0px 15px rgba(185, 142, 255, 0.5)',
      },
      default: {
        textShadowColor: 'rgba(185, 142, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
      },
    }),
  },
  welcomeSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Secondary Section
  secondarySection: {
    marginBottom: isSmallDevice ? 12 : 20,
  },
  secondaryButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  secondaryButtonBlur: {
    paddingVertical: isSmallDevice ? 14 : 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  secondaryButtonBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(185, 142, 255, 0.4)',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
