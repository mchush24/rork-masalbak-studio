/**
 * Welcome Screen - Renkioo Brand Introduction
 *
 * Clean, brand-focused welcome with:
 * - Renkioo logo (hero position)
 * - Ioo mascot (supporting role)
 * - Emotional hook text for parents
 * - CTA to value-proposition
 * - Login link for existing users
 * - Trust badge
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
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Shield } from 'lucide-react-native';
import {
  spacing,
  shadows,
  typography,
  iconSizes,
  iconStroke,
  iconColors,
} from '@/constants/design-system';
import { Colors } from '@/constants/colors';
import { Ioo as IooMascot } from '@/components/Ioo';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const mascotFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo and content animate first
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

    // Mascot fades in slightly delayed
    Animated.timing(mascotFadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartJourney = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(onboarding)/value-proposition' as Href);
  };

  const handleLogin = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(onboarding)/login' as Href);
  };

  return (
    <LinearGradient
      colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}
        >
          {/* Brand Section - Logo at top */}
          <View style={styles.brandSection}>
            <Animated.View style={{ transform: [{ scale: logoScaleAnim }] }}>
              <Image source={require('@/assets/images/app-logo.png')} style={styles.logoImage} />
            </Animated.View>
          </View>

          {/* Hero Section - Mascot + Text */}
          <View style={styles.heroSection}>
            {/* Mascot (medium, supporting role) */}
            <Animated.View style={[styles.mascotContainer, { opacity: mascotFadeAnim }]}>
              <IooMascot size="medium" animated showGlow mood="happy" />
            </Animated.View>

            {/* Emotional hook text */}
            <View style={styles.emotionalHook}>
              <Text style={[styles.hookTitle, { color: colors.text.primary }]}>
                {'Çocukların iç dünyasını\nbirlikte keşfedelim'}
              </Text>
              <Text style={[styles.hookSubtitle, { color: colors.text.secondary }]}>
                {'Ebeveyn, öğretmen ya da uzman — '}
                <Text
                  style={{
                    color: colors.secondary.lavender,
                    fontFamily: typography.family.semibold,
                  }}
                >
                  Ioo
                </Text>
                {' bu yolculukta yanınızda'}
              </Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            {/* Primary CTA */}
            <Pressable
              onPress={handleStartJourney}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            >
              <LinearGradient
                colors={[colors.primary.sunset, colors.secondary.peach] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={[styles.primaryButtonText, { color: Colors.neutral.white }]}>
                  Keşfetmeye Başlayın
                </Text>
                <ChevronRight
                  size={iconSizes.action}
                  color={iconColors.inverted}
                  strokeWidth={iconStroke.standard}
                />
              </LinearGradient>
            </Pressable>

            {/* Login Link */}
            <Pressable onPress={handleLogin} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Text style={[styles.loginText, { color: colors.text.secondary }]}>
                Hesabınız var mı?{' '}
                <Text style={[styles.loginLink, { color: colors.secondary.lavender }]}>
                  Giriş Yapın
                </Text>
              </Text>
            </Pressable>
          </View>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <Shield size={12} color={colors.text.tertiary} strokeWidth={iconStroke.standard} />
            <Text style={[styles.trustText, { color: colors.text.tertiary }]}>
              KVKK uyumlu · Verileriniz güvende
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
    paddingTop: isSmallDevice ? spacing.md : spacing.lg,
    paddingBottom: spacing.md,
  },

  // Brand Section (logo at top)
  brandSection: {
    alignItems: 'center',
    marginTop: isSmallDevice ? spacing.sm : spacing.lg,
    marginBottom: isSmallDevice ? spacing.md : spacing.lg,
  },
  logoImage: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
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
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 32 : 38,
    marginBottom: spacing.sm,
  },
  hookSubtitle: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.dark,
    textAlign: 'center',
    fontFamily: typography.family.medium,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
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
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loginText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  loginLink: {
    color: Colors.secondary.lavender,
    fontFamily: typography.family.semibold,
  },

  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  trustText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
});
