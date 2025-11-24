import { View, Text, Pressable, Animated, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        ...animations.easing.gentle,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/tour');
  };

  return (
    <LinearGradient
      colors={colors.gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Section - Logo & Brand */}
        <Animated.View
          style={[
            styles.topSection,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }
          ]}
        >
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, shadows.xl]}>
              <Image
                source={require('@/assets/images/app-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Brand Text */}
          <Text style={styles.brandName}>Zuna</Text>
          <Text style={styles.tagline}>
            Her çizim bir hikaye,{'\n'}her hikaye bir macera! 🌟
          </Text>
        </Animated.View>

        {/* Middle Section - Features */}
        <Animated.View
          style={[
            styles.featuresSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[styles.featureCard, shadows.md]}>
            <FeatureItem emoji="🎨" text="Çizimleri analiz edin" />
            <FeatureItem emoji="📚" text="Hikayeler oluşturun" />
            <FeatureItem emoji="🌟" text="Gelişimi takip edin" />
          </View>
        </Animated.View>

        {/* Bottom Section - CTA */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim }
          ]}
        >
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              shadows.lg,
              pressed && styles.startButtonPressed
            ]}
          >
            <Text style={styles.startButtonText}>Hadi Başlayalım! 🚀</Text>
          </Pressable>

          <Text style={styles.disclaimerText}>
            Ücretsiz deneyin • İstediğiniz zaman iptal edin
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  // Top Section
  topSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.5,
    paddingHorizontal: spacing.xl,
  },

  // Features Section
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    backdropFilter: 'blur(10px)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    flex: 1,
  },

  // Bottom Section
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  startButton: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  startButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  startButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.brand.primary,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
