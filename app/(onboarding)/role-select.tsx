/**
 * Role Selection Screen - Professional User Onboarding
 *
 * Allows users to select their role for personalized experience:
 * - Parent: Simplified UI with gamification
 * - Teacher: Classroom management focus
 * - Expert/Clinician: Full clinical tools
 *
 * Part of #16: Professional/Adult-Focused UI Revision
 */

import { View, Text, Pressable, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  Heart,
  GraduationCap,
  Stethoscope,
  ChevronRight,
  Check,
  Sparkles,
  Users,
  BarChart3,
  FileText,
  Shield,
} from 'lucide-react-native';
import {
  spacing,
  shadows,
  typography,
  iconSizes,
  iconStroke,
  iconColors,
} from '@/constants/design-system';
import { useRole, UserRole } from '@/lib/contexts/RoleContext';
import { ProfessionalColors, Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width: _SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// Role card configurations with icons and features
const ROLE_CARDS = {
  parent: {
    icon: Heart,
    title: 'Ebeveyn',
    subtitle: 'Çocuğunuzun gelişimini takip edin',
    color: ProfessionalColors.roles.parent.primary,
    gradient: ProfessionalColors.roles.parent.gradient,
    features: [
      { icon: Sparkles, text: 'Kolay kullanım' },
      { icon: BarChart3, text: 'Gelişim takibi' },
      { icon: FileText, text: 'PDF raporlar' },
    ],
  },
  teacher: {
    icon: GraduationCap,
    title: 'Öğretmen',
    subtitle: 'Sınıfınızı değerlendirin ve yönetin',
    color: ProfessionalColors.roles.teacher.primary,
    gradient: ProfessionalColors.roles.teacher.gradient,
    features: [
      { icon: Users, text: 'Sınıf yönetimi' },
      { icon: BarChart3, text: 'Toplu değerlendirme' },
      { icon: FileText, text: 'Karşılaştırmalı analiz' },
    ],
  },
  expert: {
    icon: Stethoscope,
    title: 'Uzman / Klinisyen',
    subtitle: 'Profesyonel değerlendirme araçları',
    color: ProfessionalColors.roles.expert.primary,
    gradient: ProfessionalColors.roles.expert.gradient,
    features: [
      { icon: Shield, text: 'Klinik skorlama' },
      { icon: BarChart3, text: 'Norm referansları' },
      { icon: FileText, text: 'Denetim kaydı' },
    ],
  },
};

type RoleKey = keyof typeof ROLE_CARDS;

export default function RoleSelectScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(Object.keys(ROLE_CARDS).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Stagger card animations
    cardAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 100,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleSelect = (role: RoleKey) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole || isSubmitting) return;

    setIsSubmitting(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await setRole(selectedRole as UserRole);
      router.push('/(onboarding)/register' as Href);
    } catch (error) {
      console.error('Failed to set role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleKeys = Object.keys(ROLE_CARDS) as RoleKey[];

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Sizi tanıyalım</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Deneyiminizi kişiselleştirmek için rolünüzü seçin
            </Text>
          </View>

          {/* Role Cards */}
          <View style={styles.cardsContainer}>
            {roleKeys.map((roleKey, index) => {
              const card = ROLE_CARDS[roleKey];
              const IconComponent = card.icon;
              const isSelected = selectedRole === roleKey;

              return (
                <Animated.View
                  key={roleKey}
                  style={[
                    styles.cardWrapper,
                    {
                      opacity: cardAnims[index],
                      transform: [
                        {
                          translateY: cardAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => handleRoleSelect(roleKey)}
                    style={({ pressed }) => [
                      styles.card,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      isSelected && styles.cardSelected,
                      isSelected && {
                        borderColor: card.color,
                        backgroundColor: colors.surface.elevated,
                      },
                      pressed && styles.cardPressed,
                    ]}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: card.color }]}>
                        <Check
                          size={iconSizes.badge}
                          color={iconColors.inverted}
                          strokeWidth={iconStroke.bold}
                        />
                      </View>
                    )}

                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: `${card.color}15` }]}>
                      <IconComponent
                        size={iconSizes.navigation}
                        color={card.color}
                        strokeWidth={iconStroke.standard}
                      />
                    </View>

                    {/* Text Content */}
                    <View style={styles.cardTextContent}>
                      <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                        {card.title}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>
                        {card.subtitle}
                      </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                      {card.features.map((feature, fIndex) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <View
                            key={fIndex}
                            style={[
                              styles.featureItem,
                              { backgroundColor: colors.neutral.lightest },
                            ]}
                          >
                            <FeatureIcon
                              size={iconSizes.badge}
                              color={isSelected ? card.color : colors.text.tertiary}
                              strokeWidth={iconStroke.standard}
                            />
                            <Text
                              style={[
                                styles.featureText,
                                { color: colors.text.tertiary },
                                isSelected && { color: colors.text.primary },
                              ]}
                            >
                              {feature.text}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Continue Button */}
          <View style={styles.ctaSection}>
            <Pressable
              onPress={handleContinue}
              disabled={!selectedRole || isSubmitting}
              style={({ pressed }) => [
                styles.continueButton,
                !selectedRole && styles.continueButtonDisabled,
                pressed && selectedRole && styles.buttonPressed,
              ]}
            >
              {selectedRole ? (
                <LinearGradient
                  colors={ROLE_CARDS[selectedRole].gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    {isSubmitting ? 'Yükleniyor...' : 'Devam Et'}
                  </Text>
                  <ChevronRight
                    size={iconSizes.action}
                    color={iconColors.inverted}
                    strokeWidth={iconStroke.standard}
                  />
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.continueButtonDisabledInner,
                    { backgroundColor: colors.border.light },
                  ]}
                >
                  <Text
                    style={[styles.continueButtonTextDisabled, { color: colors.text.tertiary }]}
                  >
                    Bir rol seçin
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Info Text */}
            <Text style={[styles.infoText, { color: colors.text.tertiary }]}>
              Rolünüzü daha sonra ayarlardan değiştirebilirsiniz
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
    paddingTop: isSmallDevice ? spacing.md : spacing.xl,
    paddingBottom: spacing.md,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? spacing.lg : spacing.xl,
  },
  title: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontFamily: typography.family.bold,
    color: ProfessionalColors.neutral.black,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: ProfessionalColors.neutral.gray,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Cards
  cardsContainer: {
    flex: 1,
    gap: spacing.md,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: Colors.neutral.gray200,
    position: 'relative',
    ...shadows.md,
  },
  cardSelected: {
    borderWidth: 2,
    backgroundColor: Colors.neutral.white,
    ...shadows.lg,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },

  // Selected Indicator
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Icon
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  // Card Text
  cardTextContent: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.neutral.black,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.size.sm,
    color: ProfessionalColors.neutral.gray,
    lineHeight: 18,
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.gray50,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  featureText: {
    fontSize: typography.size.xs,
    color: ProfessionalColors.neutral.grayLight,
    fontFamily: typography.family.medium,
  },

  // CTA
  ctaSection: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  continueButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.neutral.white,
  },
  continueButtonDisabled: {
    opacity: 1,
  },
  continueButtonDisabledInner: {
    backgroundColor: Colors.neutral.gray200,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderRadius: 16,
  },
  continueButtonTextDisabled: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.neutral.grayLight,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  // Info
  infoText: {
    fontSize: typography.size.xs,
    color: ProfessionalColors.neutral.grayLight,
    textAlign: 'center',
  },
});
