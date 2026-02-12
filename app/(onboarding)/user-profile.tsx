/**
 * User Profile Setup Screen
 * Phase 7: User Profile & Personalization
 *
 * Multi-step profile setup:
 * 1. Usage Purpose (Parent, Professional, Teacher)
 * 2. Experience Level (for professionals) / Family Structure (for parents)
 * 3. Priority Needs
 * 4. Preferences
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import {
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Baby,
  Clock,
  Shield,
  Lightbulb,
  Bell,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { assistantEngine, UserType } from '@/lib/coaching';

const { width: _SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const _isSmallDevice = SCREEN_HEIGHT < 700;

type UsagePurpose = 'parent' | 'professional' | 'teacher';
type ExperienceLevel = 'student' | '1-3' | '4-10' | '10+';
type PriorityNeed =
  | 'emotional_awareness'
  | 'communication'
  | 'trauma_recognition'
  | 'creativity'
  | 'development_tracking'
  | 'professional_reporting';
type NotificationFrequency = 'daily' | 'weekly' | 'off';
type Theme = 'light' | 'dark' | 'system';

interface UserProfile {
  usagePurpose: UsagePurpose | null;
  experienceLevel: ExperienceLevel | null;
  childrenCount: number;
  childrenAges: number[];
  priorityNeeds: PriorityNeed[];
  notificationFrequency: NotificationFrequency;
  language: string;
  theme: Theme;
}

const INITIAL_PROFILE: UserProfile = {
  usagePurpose: null,
  experienceLevel: null,
  childrenCount: 1,
  childrenAges: [],
  priorityNeeds: [],
  notificationFrequency: 'weekly',
  language: 'tr',
  theme: 'system',
};

const USAGE_OPTIONS = [
  {
    id: 'parent' as UsagePurpose,
    icon: <Heart size={28} color={Colors.primary.sunset} />,
    title: 'Ebeveyn',
    description: 'Çocuğumun duygusal gelişimini takip etmek istiyorum',
    gradient: [Colors.primary.soft, Colors.primary.blush] as readonly [string, string],
  },
  {
    id: 'professional' as UsagePurpose,
    icon: <Briefcase size={28} color={Colors.secondary.lavender} />,
    title: 'Psikolog / Pedagog',
    description: 'Danışanlarımla çalışmak için kullanacağım',
    gradient: ['#F5F3FF', '#EDE9FE'] as readonly [string, string],
  },
  {
    id: 'teacher' as UsagePurpose,
    icon: <GraduationCap size={28} color={Colors.secondary.sky} />,
    title: 'Öğretmen',
    description: 'Sınıfımdaki öğrencileri değerlendirmek istiyorum',
    gradient: ['#F0F9FF', '#E8F4FD'] as readonly [string, string],
  },
];

const EXPERIENCE_OPTIONS = [
  { id: 'student' as ExperienceLevel, label: 'Öğrenci / Stajyer' },
  { id: '1-3' as ExperienceLevel, label: '1-3 yıl deneyimli' },
  { id: '4-10' as ExperienceLevel, label: '4-10 yıl deneyimli' },
  { id: '10+' as ExperienceLevel, label: '10+ yıl uzman' },
];

const PRIORITY_NEEDS = [
  {
    id: 'emotional_awareness' as PriorityNeed,
    icon: <Heart size={18} color={Colors.primary.sunset} />,
    label: 'Duygusal farkındalık geliştirme',
  },
  {
    id: 'communication' as PriorityNeed,
    icon: <Users size={18} color={Colors.secondary.sky} />,
    label: 'İletişim sorunlarını anlama',
  },
  {
    id: 'trauma_recognition' as PriorityNeed,
    icon: <Shield size={18} color={Colors.semantic.warning} />,
    label: 'Travma/stres belirtilerini tanıma',
  },
  {
    id: 'creativity' as PriorityNeed,
    icon: <Sparkles size={18} color={Colors.secondary.lavender} />,
    label: 'Yaratıcılığı destekleme',
  },
  {
    id: 'development_tracking' as PriorityNeed,
    icon: <Clock size={18} color={Colors.secondary.grass} />,
    label: 'Gelişimsel takip yapma',
  },
  {
    id: 'professional_reporting' as PriorityNeed,
    icon: <Briefcase size={18} color={Colors.neutral.dark} />,
    label: 'Profesyonel raporlama',
  },
];

export default function UserProfileScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { tapMedium, selection, success } = useHapticFeedback();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const totalSteps = profile.usagePurpose === 'parent' ? 4 : 4;

  const handleSelectPurpose = (purpose: UsagePurpose) => {
    selection();
    setProfile({ ...profile, usagePurpose: purpose });
  };

  const handleSelectExperience = (level: ExperienceLevel) => {
    selection();
    setProfile({ ...profile, experienceLevel: level });
  };

  const handleToggleNeed = (need: PriorityNeed) => {
    selection();
    const current = profile.priorityNeeds;
    if (current.includes(need)) {
      setProfile({ ...profile, priorityNeeds: current.filter(n => n !== need) });
    } else if (current.length < 3) {
      setProfile({ ...profile, priorityNeeds: [...current, need] });
    }
  };

  const handleNext = () => {
    tapMedium();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    selection();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    tapMedium();
    router.push('/(onboarding)/register' as Href);
  };

  const handleComplete = async () => {
    success();
    // Save user type to assistant engine
    if (profile.usagePurpose) {
      const userType: UserType =
        profile.usagePurpose === 'parent'
          ? 'parent'
          : profile.usagePurpose === 'professional'
            ? 'professional'
            : 'teacher';
      await assistantEngine.setUserType(userType);
    }
    router.push('/(onboarding)/register' as Href);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.usagePurpose !== null;
      case 2:
        if (profile.usagePurpose === 'parent') {
          return profile.childrenCount > 0;
        }
        return profile.experienceLevel !== null;
      case 3:
        return profile.priorityNeeds.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Kullanım Amacı</Text>
            <Text style={[styles.stepDescription, { color: colors.text.secondary }]}>
              {"Renkioo'yu nasıl kullanacaksınız?"}
            </Text>

            <View style={styles.optionsContainer}>
              {USAGE_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectPurpose(option.id)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    profile.usagePurpose === option.id && styles.optionCardSelected,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? ([colors.surface.card, colors.surface.elevated] as [string, string])
                        : option.gradient
                    }
                    style={styles.optionGradient}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        isDark && { backgroundColor: colors.surface.elevated },
                      ]}
                    >
                      {option.icon}
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                        {option.title}
                      </Text>
                      <Text style={[styles.optionDescription, { color: colors.text.secondary }]}>
                        {option.description}
                      </Text>
                    </View>
                    {profile.usagePurpose === option.id && (
                      <View style={styles.checkMark}>
                        <Check size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 2:
        if (profile.usagePurpose === 'parent') {
          return (
            <Animated.View
              entering={SlideInRight}
              exiting={SlideOutLeft}
              style={styles.stepContent}
            >
              <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Aile Yapısı</Text>
              <Text style={[styles.stepDescription, { color: colors.text.secondary }]}>
                Kaç çocuğunuz var?
              </Text>

              <View style={styles.childrenSelector}>
                {[1, 2, 3, 4].map(count => (
                  <Pressable
                    key={count}
                    onPress={() => {
                      selection();
                      setProfile({ ...profile, childrenCount: count });
                    }}
                    style={[
                      styles.countButton,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      profile.childrenCount === count && styles.countButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        { color: colors.text.primary },
                        profile.childrenCount === count && styles.countTextSelected,
                      ]}
                    >
                      {count === 4 ? '4+' : count}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                style={[
                  styles.infoBox,
                  isDark && { backgroundColor: colors.secondary.lavender + '1F' },
                ]}
              >
                <Baby size={20} color={colors.secondary.lavender} />
                <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                  Her çocuk için ayrı profil oluşturarak analizleri düzenli tutabilirsiniz.
                </Text>
              </View>
            </Animated.View>
          );
        }

        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Deneyim Seviyesi</Text>
            <Text style={[styles.stepDescription, { color: colors.text.secondary }]}>
              Çocuk psikolojisi alanındaki deneyiminiz?
            </Text>

            <View style={styles.experienceOptions}>
              {EXPERIENCE_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectExperience(option.id)}
                  style={[
                    styles.experienceOption,
                    { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                    profile.experienceLevel === option.id && styles.experienceOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.experienceText,
                      { color: colors.text.primary },
                      profile.experienceLevel === option.id && styles.experienceTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {profile.experienceLevel === option.id && (
                    <Check size={20} color={colors.secondary.lavender} />
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text.primary }]}>
              Öncelikli İhtiyaçlar
            </Text>
            <Text style={[styles.stepDescription, { color: colors.text.secondary }]}>
              En çok hangi konularda destek istiyorsunuz? (Maks. 3)
            </Text>

            <View style={styles.needsGrid}>
              {PRIORITY_NEEDS.map(need => {
                const isSelected = profile.priorityNeeds.includes(need.id);
                const isDisabled = !isSelected && profile.priorityNeeds.length >= 3;

                return (
                  <Pressable
                    key={need.id}
                    onPress={() => !isDisabled && handleToggleNeed(need.id)}
                    style={[
                      styles.needCard,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      isSelected && styles.needCardSelected,
                      isDisabled && styles.needCardDisabled,
                    ]}
                  >
                    {need.icon}
                    <Text
                      style={[
                        styles.needText,
                        { color: colors.text.primary },
                        isSelected && styles.needTextSelected,
                      ]}
                    >
                      {need.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.needCheck}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text.primary }]}>Tercihler</Text>
            <Text style={[styles.stepDescription, { color: colors.text.secondary }]}>
              Uygulama deneyiminizi özelleştirin
            </Text>

            {/* Notifications */}
            <View style={styles.preferenceSection}>
              <View style={styles.preferenceLabelRow}>
                <Bell size={18} color={Colors.secondary.sunshine} />
                <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                  Bildirimler
                </Text>
              </View>
              <View style={styles.notificationOptions}>
                {(['daily', 'weekly', 'off'] as NotificationFrequency[]).map(freq => (
                  <Pressable
                    key={freq}
                    onPress={() => {
                      selection();
                      setProfile({ ...profile, notificationFrequency: freq });
                    }}
                    style={[
                      styles.notificationOption,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      profile.notificationFrequency === freq && styles.notificationOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.notificationText,
                        { color: colors.text.primary },
                        profile.notificationFrequency === freq && styles.notificationTextSelected,
                      ]}
                    >
                      {freq === 'daily' ? 'Günlük' : freq === 'weekly' ? 'Haftalık' : 'Kapalı'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Theme */}
            <View style={styles.preferenceSection}>
              <View style={styles.preferenceLabelRow}>
                <Sun size={18} color={Colors.secondary.sky} />
                <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>Tema</Text>
              </View>
              <View style={styles.themeOptions}>
                {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                  <Pressable
                    key={theme}
                    onPress={() => {
                      selection();
                      setProfile({ ...profile, theme });
                    }}
                    style={[
                      styles.themeOption,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      profile.theme === theme && styles.themeOptionSelected,
                    ]}
                  >
                    {theme === 'light' && (
                      <Sun
                        size={16}
                        color={profile.theme === theme ? '#FFFFFF' : colors.text.tertiary}
                      />
                    )}
                    {theme === 'dark' && (
                      <Moon
                        size={16}
                        color={profile.theme === theme ? '#FFFFFF' : colors.text.tertiary}
                      />
                    )}
                    {theme === 'system' && (
                      <Lightbulb
                        size={16}
                        color={profile.theme === theme ? '#FFFFFF' : colors.text.tertiary}
                      />
                    )}
                    <Text
                      style={[
                        styles.themeText,
                        profile.theme === theme && styles.themeTextSelected,
                      ]}
                    >
                      {theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : 'Sistem'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info about personalization */}
            <View
              style={[
                styles.personalizationInfo,
                isDark && { backgroundColor: colors.secondary.lavender + '1F' },
              ]}
            >
              <Sparkles size={20} color={colors.secondary.lavender} />
              <Text style={[styles.personalizationText, { color: colors.text.secondary }]}>
                {profile.usagePurpose === 'parent'
                  ? 'Ebeveyn modunda sıcak ve destekleyici bir deneyim sunulacak.'
                  : profile.usagePurpose === 'professional'
                    ? 'Profesyonel modda detaylı analiz araçları ve raporlama aktif olacak.'
                    : 'Öğretmen modunda sınıf yönetimi özellikleri sunulacak.'}
              </Text>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={[styles.backButton, step === 1 && { opacity: 0 }]}
            disabled={step === 1}
          >
            <ChevronLeft size={24} color={colors.text.tertiary} />
          </Pressable>

          {/* Progress */}
          <View style={styles.progressDots}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: colors.border.light },
                  i < step && [
                    styles.progressDotCompleted,
                    { backgroundColor: colors.secondary.lavender },
                  ],
                  i === step - 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.text.tertiary }]}>Atla</Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <Pressable
            onPress={handleNext}
            disabled={!canProceed()}
            style={({ pressed }) => [
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
              pressed && canProceed() && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.nextButtonText,
                { color: '#FFFFFF' },
                !canProceed() && styles.nextButtonTextDisabled,
              ]}
            >
              {step === totalSteps ? 'Tamamla' : 'Devam'}
            </Text>
            <ChevronRight size={20} color={canProceed() ? '#FFFFFF' : colors.text.tertiary} />
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
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  backButton: {
    padding: spacing['2'],
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.lighter,
  },
  progressDotCompleted: {
    backgroundColor: Colors.secondary.lavender,
  },
  progressDotActive: {
    width: 24,
  },
  skipButton: {
    padding: spacing['2'],
  },
  skipText: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['8'],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
  },
  stepDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    marginBottom: spacing['6'],
  },

  // Usage Options
  optionsContainer: {
    gap: spacing['3'],
  },
  optionCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.md,
  },
  optionCardSelected: {
    borderColor: Colors.secondary.lavender,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['4'],
    gap: spacing['4'],
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  optionDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  checkMark: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Children selector
  childrenSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['4'],
    marginBottom: spacing['6'],
  },
  countButton: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    ...shadows.sm,
  },
  countButtonSelected: {
    backgroundColor: Colors.secondary.lavender,
    borderColor: Colors.secondary.lavender,
  },
  countText: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
  },
  countTextSelected: {
    color: Colors.neutral.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    padding: spacing['4'],
    borderRadius: radius.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },

  // Experience options
  experienceOptions: {
    gap: spacing['3'],
  },
  experienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.white,
    padding: spacing['4'],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  experienceOptionSelected: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: Colors.secondary.lavender,
  },
  experienceText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
  experienceTextSelected: {
    color: Colors.secondary.lavender,
    fontWeight: typography.weight.semibold,
  },

  // Needs grid
  needsGrid: {
    gap: spacing['3'],
  },
  needCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: Colors.neutral.white,
    padding: spacing['4'],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  needCardSelected: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: Colors.secondary.lavender,
  },
  needCardDisabled: {
    opacity: 0.5,
  },
  needText: {
    flex: 1,
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
  },
  needTextSelected: {
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
  needCheck: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Preferences
  preferenceSection: {
    marginBottom: spacing['6'],
  },
  preferenceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  preferenceLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  notificationOptions: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  notificationOption: {
    flex: 1,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['2'],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  notificationOptionSelected: {
    backgroundColor: Colors.secondary.lavender,
    borderColor: Colors.secondary.lavender,
  },
  notificationText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
  notificationTextSelected: {
    color: Colors.neutral.white,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  themeOptionSelected: {
    backgroundColor: Colors.secondary.sky,
    borderColor: Colors.secondary.sky,
  },
  themeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
  themeTextSelected: {
    color: Colors.neutral.white,
  },
  personalizationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    padding: spacing['4'],
    borderRadius: radius.lg,
    marginTop: spacing['4'],
  },
  personalizationText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },

  // Bottom
  bottomContainer: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary.lavender,
    paddingVertical: spacing['4'],
    borderRadius: radius.full,
    gap: spacing['2'],
    ...shadows.md,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.neutral.lighter,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  nextButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  nextButtonTextDisabled: {
    color: Colors.neutral.light,
  },
});
