/**
 * EmptyState Component
 * Phase 4: Empty State Design
 *
 * Transforms empty states into opportunities to motivate users
 * Features:
 * - Custom illustrations with Ioo mascot
 * - Engaging animations
 * - Clear call-to-action
 * - Context-aware messaging
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  BookOpen,
  Palette,
  Brain,
  Calendar,
  AlertCircle,
  Sparkles,
  Hand,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { Ioo, IooMood as NewIooMood } from '@/components/Ioo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type EmptyStateIllustration =
  | 'no-analysis'
  | 'no-stories'
  | 'no-coloring'
  | 'no-history'
  | 'welcome'
  | 'search-empty'
  | 'error'
  | 'no-children'
  | 'no-badges';

export type IooMood = 'happy' | 'curious' | 'excited' | 'sad' | 'thinking';

interface EmptyStateProps {
  /** Type of empty state illustration */
  illustration: EmptyStateIllustration;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** CTA button label */
  actionLabel?: string;
  /** CTA button handler */
  onAction?: () => void;
  /** Secondary action label */
  secondaryLabel?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Ioo mascot mood */
  mascotMood?: IooMood;
  /** Custom style */
  style?: ViewStyle;
  /** Compact mode for smaller spaces */
  compact?: boolean;
}

// Illustration configurations
const ILLUSTRATIONS: Record<EmptyStateIllustration, {
  icon: React.ComponentType<any>;
  gradient: readonly [string, string, ...string[]];
  iconColor: string;
  message: string;
}> = {
  'no-analysis': {
    icon: Brain,
    gradient: Colors.background.analysis,
    iconColor: Colors.secondary.lavender,
    message: 'Henüz analiz yok',
  },
  'no-stories': {
    icon: BookOpen,
    gradient: Colors.background.stories,
    iconColor: Colors.secondary.sunshine,
    message: 'Hikaye zamanı!',
  },
  'no-coloring': {
    icon: Palette,
    gradient: ['#E8FFF5', '#F0FFFF', '#E8FFF5'],
    iconColor: Colors.secondary.mint,
    message: 'Renklere hazır mısın?',
  },
  'no-history': {
    icon: Calendar,
    gradient: ['#FFF5F2', '#FFE8F5', '#FFF5F2'],
    iconColor: Colors.primary.sunset,
    message: 'Macera başlasın!',
  },
  'welcome': {
    icon: Hand,
    gradient: ['#FFF8F0', '#F5E8FF', '#FFF8F0'],
    iconColor: Colors.secondary.lavender,
    message: 'Hoş geldin!',
  },
  'search-empty': {
    icon: Search,
    gradient: ['#F0F9FF', '#E8F4FD', '#F0F9FF'],
    iconColor: Colors.secondary.sky,
    message: 'Bulamadım ama...',
  },
  'error': {
    icon: AlertCircle,
    gradient: ['#FFF5F5', '#FEE2E2', '#FFF5F5'],
    iconColor: Colors.semantic.error,
    message: 'Bir şeyler ters gitti',
  },
  'no-children': {
    icon: Sparkles,
    gradient: ['#F5F3FF', '#EDE9FE', '#F5F3FF'],
    iconColor: Colors.secondary.lavender,
    message: 'Çocuk profili ekleyin',
  },
  'no-badges': {
    icon: Sparkles,
    gradient: ['#FFF9E6', '#FFE8CC', '#FFF9E6'],
    iconColor: Colors.secondary.sunshine,
    message: 'Rozetler seni bekliyor!',
  },
};

// Map old mood types to new Ioo moods
const MOOD_MAP: Record<IooMood, NewIooMood> = {
  happy: 'happy',
  curious: 'curious',
  excited: 'excited',
  sad: 'sleepy', // sleepy is closest to sad in new Ioo
  thinking: 'curious',
};

export function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  mascotMood = 'curious',
  style,
  compact = false,
}: EmptyStateProps) {
  const { tapMedium } = useHapticFeedback();
  const config = ILLUSTRATIONS[illustration];
  const mappedMood = MOOD_MAP[mascotMood] || 'happy';

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      // Ioo entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Text fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Button slide up
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for Ioo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, fadeAnim, floatAnim, buttonAnim]);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const IconComponent = config.icon;

  const handleAction = () => {
    tapMedium();
    onAction?.();
  };

  const handleSecondaryAction = () => {
    tapMedium();
    onSecondaryAction?.();
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {/* Illustration with Ioo */}
      <Animated.View
        style={[
          styles.illustrationContainer,
          compact && styles.illustrationCompact,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: floatTranslateY },
            ],
          },
        ]}
      >
        {/* Use actual Ioo mascot instead of text-based face */}
        <View style={styles.iooContainer}>
          <Ioo
            mood={mappedMood}
            size={compact ? 'sm' : 'md'}
            animated={true}
          />
        </View>

        {/* Icon Badge */}
        <LinearGradient
          colors={config.gradient}
          style={[styles.iconBadge, compact && styles.iconBadgeCompact]}
        >
          <IconComponent size={compact ? 18 : 24} color={config.iconColor} />
        </LinearGradient>
      </Animated.View>

      {/* Text Content */}
      <Animated.View
        style={[
          styles.textContainer,
          { opacity: fadeAnim },
        ]}
      >
        <Text style={[styles.title, compact && styles.titleCompact]}>
          {title}
        </Text>
        <Text style={[styles.description, compact && styles.descriptionCompact]}>
          {description}
        </Text>
      </Animated.View>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <Pressable
            onPress={handleAction}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[config.iconColor, Colors.secondary.lavender]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </LinearGradient>
          </Pressable>

          {secondaryLabel && onSecondaryAction && (
            <Pressable
              onPress={handleSecondaryAction}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// Pre-configured empty states
export function NoAnalysisEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      illustration="no-analysis"
      title="Henüz Analiz Yok"
      description="Çocuğunuzun bir çizimini yükleyerek duygusal analiz yapabilirsiniz."
      actionLabel="Analiz Başlat"
      onAction={onAction}
      mascotMood="curious"
    />
  );
}

export function NoStoriesEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      illustration="no-stories"
      title="Hikaye Zamanı!"
      description="İnteraktif hikayelerle çocuğunuzun hayal dünyasını keşfedin."
      actionLabel="Hikaye Seç"
      onAction={onAction}
      mascotMood="excited"
    />
  );
}

export function NoColoringEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      illustration="no-coloring"
      title="Renklere Hazır mısın?"
      description="Boyama sayfaları ile yaratıcılığınızı ortaya koyun."
      actionLabel="Boyamaya Başla"
      onAction={onAction}
      mascotMood="happy"
    />
  );
}

export function NoHistoryEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      illustration="no-history"
      title="Macera Başlasın!"
      description="Henüz bir aktivite yok. Keşfetmeye başlayın!"
      actionLabel="Keşfet"
      onAction={onAction}
      mascotMood="excited"
    />
  );
}

export function SearchEmpty({ query }: { query?: string }) {
  return (
    <EmptyState
      illustration="search-empty"
      title="Sonuç Bulunamadı"
      description={query ? `"${query}" için sonuç bulunamadı.` : 'Aramanızla eşleşen sonuç yok.'}
      mascotMood="thinking"
      compact
    />
  );
}

export function ErrorEmpty({
  onRetry,
  message,
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      illustration="error"
      title="Bir Şeyler Ters Gitti"
      description={message || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
      actionLabel="Tekrar Dene"
      onAction={onRetry}
      mascotMood="sad"
    />
  );
}

export function WelcomeEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      illustration="welcome"
      title="Hoş Geldiniz!"
      description="Çocuğunuzun duygusal dünyasını keşfetmeye hazır mısınız?"
      actionLabel="Başlayalım"
      onAction={onAction}
      mascotMood="happy"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['8'],
    minHeight: 300,
  },
  containerCompact: {
    padding: spacing['4'],
    minHeight: 200,
  },

  // Illustration
  illustrationContainer: {
    marginBottom: spacing['6'],
    alignItems: 'center',
  },
  illustrationCompact: {
    marginBottom: spacing['4'],
  },
  iooContainer: {
    marginBottom: spacing['2'],
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing['4'],
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...shadows.md,
  },
  iconBadgeCompact: {
    width: 36,
    height: 36,
    marginTop: -spacing['3'],
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing['6'],
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  titleCompact: {
    fontSize: typography.size.xl,
  },
  description: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
  descriptionCompact: {
    fontSize: typography.size.sm,
  },

  // Buttons
  buttonContainer: {
    alignItems: 'center',
    gap: spacing['3'],
  },
  actionButton: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  actionButtonGradient: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['8'],
  },
  actionButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
  },
  secondaryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
  },
});

export default EmptyState;
