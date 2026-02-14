import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { BookOpen, Gamepad2, Star, ChevronRight, Brain, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';

type StoryMode = 'normal' | 'interactive';

type ThemeColors = {
  secondary: { sunshine: string };
  cards: { story: { border: string } };
  neutral: { dark: string; medium: string };
  surface: { card: string; elevated: string };
};

type StoryModeSelectorProps = {
  storyMode: StoryMode;
  onModeChange: (mode: StoryMode) => void;
  colors: ThemeColors;
  isDark: boolean;
};

export function StoryModeSelector({
  storyMode,
  onModeChange,
  colors,
  isDark,
}: StoryModeSelectorProps) {
  return (
    <View style={styles.storyModeSection}>
      <Text style={[styles.storyModeSectionTitle, { color: colors.neutral.dark }]}>
        Masal Türü Seçin
      </Text>
      <View style={styles.storyModeToggle}>
        {/* Normal Story Option */}
        <Pressable
          style={[styles.storyModeOption, storyMode === 'normal' && styles.storyModeOptionSelected]}
          onPress={() => onModeChange('normal')}
        >
          <LinearGradient
            colors={
              storyMode === 'normal'
                ? [colors.secondary.sunshine, colors.cards.story.border]
                : isDark
                  ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                  : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)']
            }
            style={styles.storyModeOptionGradient}
          >
            <BookOpen
              size={28}
              color={storyMode === 'normal' ? Colors.neutral.white : colors.neutral.medium}
            />
            <Text
              style={[
                styles.storyModeOptionTitle,
                { color: colors.neutral.dark },
                storyMode === 'normal' && styles.storyModeOptionTitleSelected,
              ]}
            >
              Klasik Masal
            </Text>
            <Text
              style={[
                styles.storyModeOptionDesc,
                { color: colors.neutral.medium },
                storyMode === 'normal' && styles.storyModeOptionDescSelected,
              ]}
            >
              Görsellerle hikaye
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Interactive Story Option */}
        <Pressable
          style={[
            styles.storyModeOption,
            storyMode === 'interactive' && styles.storyModeOptionSelected,
          ]}
          onPress={() => onModeChange('interactive')}
        >
          <LinearGradient
            colors={
              storyMode === 'interactive'
                ? ['#9333EA', '#7C3AED']
                : isDark
                  ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                  : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)']
            }
            style={styles.storyModeOptionGradient}
          >
            <View style={styles.interactiveBadgeContainer}>
              <Gamepad2
                size={28}
                color={storyMode === 'interactive' ? Colors.neutral.white : colors.neutral.medium}
              />
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>YENİ</Text>
              </View>
            </View>
            <Text
              style={[
                styles.storyModeOptionTitle,
                { color: colors.neutral.dark },
                storyMode === 'interactive' && styles.storyModeOptionTitleSelected,
              ]}
            >
              İnteraktif Masal
            </Text>
            <Text
              style={[
                styles.storyModeOptionDesc,
                { color: colors.neutral.medium },
                storyMode === 'interactive' && styles.storyModeOptionDescSelected,
              ]}
            >
              Seçimli macera
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Interactive Story Info Card - Show when interactive mode selected */}
      {storyMode === 'interactive' && (
        <View style={styles.interactiveInfoCard}>
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.1)', 'rgba(124, 58, 237, 0.05)']}
            style={styles.interactiveInfoGradient}
          >
            <View style={styles.interactiveInfoHeader}>
              <Star size={20} color="#9333EA" />
              <Text style={[styles.interactiveInfoTitle, { color: '#9333EA' }]}>
                İnteraktif Masal Nedir?
              </Text>
            </View>
            <View style={styles.interactiveInfoFeatures}>
              <View style={styles.interactiveInfoFeature}>
                <View style={styles.featureIconCircle}>
                  <ChevronRight size={14} color="#9333EA" />
                </View>
                <Text style={[styles.featureText, { color: colors.neutral.dark }]}>
                  Çocuğunuz hikayede seçimler yapar
                </Text>
              </View>
              <View style={styles.interactiveInfoFeature}>
                <View style={styles.featureIconCircle}>
                  <Brain size={14} color="#9333EA" />
                </View>
                <Text style={[styles.featureText, { color: colors.neutral.dark }]}>
                  Seçimler kişilik özelliklerini yansıtır
                </Text>
              </View>
              <View style={styles.interactiveInfoFeature}>
                <View style={styles.featureIconCircle}>
                  <Users size={14} color="#9333EA" />
                </View>
                <Text style={[styles.featureText, { color: colors.neutral.dark }]}>
                  Ebeveynler için detaylı analiz raporu
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  storyModeSection: {
    marginBottom: spacing['4'],
  },
  storyModeSectionTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
    marginBottom: spacing['3'],
  },
  storyModeToggle: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  storyModeOption: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  storyModeOptionSelected: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadows.md,
  },
  storyModeOptionGradient: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['3'],
    alignItems: 'center',
    gap: spacing['2'],
  },
  storyModeOptionTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
  storyModeOptionTitleSelected: {
    color: Colors.neutral.white,
  },
  storyModeOptionDesc: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
  },
  storyModeOptionDescSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  interactiveBadgeContainer: {
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -16,
    backgroundColor: '#EF4444',
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  newBadgeText: {
    fontSize: 8,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  interactiveInfoCard: {
    marginTop: spacing['4'],
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  interactiveInfoGradient: {
    padding: spacing['4'],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  interactiveInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  interactiveInfoTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: '#9333EA',
  },
  interactiveInfoFeatures: {
    gap: spacing['2'],
  },
  interactiveInfoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  featureIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    flex: 1,
  },
});
