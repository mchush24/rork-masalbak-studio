import { View, Text, Pressable, Animated, StyleSheet, Platform, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Brain, FileText, TrendingUp, Sparkles } from 'lucide-react-native';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;
const isMediumDevice = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      // Content fade and slide
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
      // Logo scale animation
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 5,
        useNativeDriver: Platform.OS !== 'web',
      }),
      // Subtle logo rotation
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '0deg'],
  });

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/tour');
  };

  return (
    <LinearGradient
      colors={colors.gradients.professional}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }
          ]}
        >
          {/* Hero Section with Logo */}
          <View style={styles.heroSection}>
            {/* Animated Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: logoScaleAnim },
                    { rotate: logoRotate },
                  ],
                },
              ]}
            >
              <Image
                source={require('@/assets/images/app-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Brand Name with Modern Typography */}
            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>Renkioo</Text>
              <View style={styles.sparkleContainer}>
                <Sparkles size={isSmallDevice ? 16 : 20} color="#FBBF24" fill="#FBBF24" />
              </View>
            </View>

            {/* Modern Tagline with Emoji */}
            <Text style={styles.tagline}>
              Her çizim bir hikaye ✨
            </Text>

            {/* Feature Pills - Horizontal */}
            <View style={styles.pillsContainer}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>🎨 Çizim Analizi</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>📖 Hikaye Yarat</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>🖍️ Boyama</Text>
              </View>
            </View>
          </View>

          {/* Modern Feature Highlights - Icon Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBubble, { backgroundColor: 'rgba(139, 92, 246, 0.3)' }]}>
                <Brain size={isSmallDevice ? 28 : 36} color="white" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureLabel}>Akıllı Analiz</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconBubble, { backgroundColor: 'rgba(236, 72, 153, 0.3)' }]}>
                <FileText size={isSmallDevice ? 28 : 36} color="white" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureLabel}>Özel Raporlar</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconBubble, { backgroundColor: 'rgba(34, 197, 94, 0.3)' }]}>
                <TrendingUp size={isSmallDevice ? 28 : 36} color="white" strokeWidth={2.5} />
              </View>
              <Text style={styles.featureLabel}>Gelişim İzle</Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startButton,
                shadows.xl,
                pressed && styles.startButtonPressed
              ]}
            >
              <Text style={styles.startButtonText}>Keşfetmeye Başlayın</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(onboarding)/login');
              }}
              style={{ marginTop: spacing.md }}
            >
              <Text style={[styles.disclaimerText, { textDecorationLine: 'underline' }]}>
                Zaten hesabınız var mı? Giriş yapın
              </Text>
            </Pressable>

            <Text style={styles.disclaimerText}>
              Ücretsiz deneme • KVKK uyumlu veri güvenliği
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
    paddingBottom: spacing.lg,
  },

  // Hero Section - flex: 2.5
  heroSection: {
    flex: isSmallDevice ? 2 : 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },

  // Logo Styles
  logoContainer: {
    marginBottom: isSmallDevice ? spacing.md : spacing.lg,
  },
  logo: {
    width: isSmallDevice ? 100 : isMediumDevice ? 120 : 140,
    height: isSmallDevice ? 100 : isMediumDevice ? 120 : 140,
  },

  // Brand Name
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandName: {
    fontSize: isSmallDevice ? 42 : isMediumDevice ? 52 : 64,
    fontFamily: 'Fredoka_700Bold',
    color: 'white',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  sparkleContainer: {
    marginLeft: spacing.xs,
    marginTop: -spacing.md,
  },

  // Tagline
  tagline: {
    fontSize: isSmallDevice ? typography.fontSize.lg : typography.fontSize.xl,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255, 255, 255, 0.98)',
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Feature Pills
  pillsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pillText: {
    fontSize: isSmallDevice ? typography.fontSize.xs : typography.fontSize.sm,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Features Grid - Modern Icon Bubbles
  featuresGrid: {
    flex: isSmallDevice ? 3 : 3,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  featureItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  featureIconBubble: {
    width: isSmallDevice ? 70 : 85,
    height: isSmallDevice ? 70 : 85,
    borderRadius: isSmallDevice ? 35 : 42.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  featureLabel: {
    fontSize: isSmallDevice ? typography.fontSize.xs : typography.fontSize.sm,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: spacing.xs,
  },

  // CTA Section - flex: 1.5
  ctaSection: {
    flex: isSmallDevice ? 1.5 : 1.5,
    justifyContent: 'flex-end',
  },
  startButton: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xxxl,
    paddingVertical: isSmallDevice ? spacing.md : spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  startButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  startButtonText: {
    fontSize: isSmallDevice ? typography.fontSize.base : typography.fontSize.md,
    fontFamily: 'Poppins_700Bold',
    color: '#2E5266',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  disclaimerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});
