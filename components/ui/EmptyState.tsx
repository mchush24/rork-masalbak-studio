/**
 * EmptyState Component
 * Phase 4: Empty State Design - Role-Aware Edition
 *
 * Transforms empty states into opportunities to motivate users
 * Features:
 * - Role-aware design (parent mode with mascot, professional mode minimal)
 * - Custom illustrations with Ioo mascot for parents
 * - Engaging animations
 * - Clear call-to-action
 * - Context-aware messaging
 * - Consistent copywriting
 *
 * Part of #5: Empty State Tasarımları
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  BookOpen,
  Palette,
  Brain,
  Calendar,
  AlertCircle,
  Hand,
  Users,
  Trophy,
  WifiOff,
  Clock,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Star,
} from 'lucide-react-native';
import { Colors, ProfessionalColors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { Ioo, IooMood as NewIooMood } from '@/components/Ioo';
import { useIsProfessional, useMascotSettings } from '@/lib/contexts/RoleContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type EmptyStateIllustration =
  | 'no-analysis'
  | 'no-stories'
  | 'no-coloring'
  | 'no-history'
  | 'no-children'
  | 'no-badges'
  | 'no-clients'
  | 'no-favorites'
  | 'no-notes'
  | 'no-messages'
  | 'no-images'
  | 'welcome'
  | 'search-empty'
  | 'error'
  | 'offline'
  | 'coming-soon';

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
  /** Force professional styling regardless of role */
  forceProStyle?: boolean;
}

// Illustration configurations with role-aware messaging
interface IllustrationConfig {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  gradient: readonly [string, string, ...string[]];
  iconColor: string;
  // Parent-friendly message (warm, encouraging)
  parentMessage: string;
  // Professional message (concise, informative)
  professionalMessage: string;
  // Default mascot mood for this state
  defaultMood: IooMood;
}

const ILLUSTRATIONS: Record<EmptyStateIllustration, IllustrationConfig> = {
  'no-analysis': {
    icon: Brain,
    gradient: Colors.background.analysis,
    iconColor: Colors.secondary.lavender,
    parentMessage: 'Henüz analiz yok',
    professionalMessage: 'Analiz bulunamadı',
    defaultMood: 'curious',
  },
  'no-stories': {
    icon: BookOpen,
    gradient: Colors.background.stories,
    iconColor: Colors.secondary.sunshine,
    parentMessage: 'Hikaye zamanı!',
    professionalMessage: 'Hikaye bulunamadı',
    defaultMood: 'excited',
  },
  'no-coloring': {
    icon: Palette,
    gradient: ['#E8FFF5', '#F0FFFF', '#E8FFF5'],
    iconColor: Colors.secondary.mint,
    parentMessage: 'Renklere hazır mısın?',
    professionalMessage: 'Boyama bulunamadı',
    defaultMood: 'happy',
  },
  'no-history': {
    icon: Calendar,
    gradient: ['#FFF5F2', '#FFE8F5', '#FFF5F2'],
    iconColor: Colors.primary.sunset,
    parentMessage: 'Macera başlasın!',
    professionalMessage: 'Geçmiş aktivite yok',
    defaultMood: 'excited',
  },
  'no-children': {
    icon: Users,
    gradient: ['#F5F3FF', '#EDE9FE', '#F5F3FF'],
    iconColor: Colors.secondary.lavender,
    parentMessage: 'Çocuk profili ekleyin',
    professionalMessage: 'Danışan profili eklenmemiş',
    defaultMood: 'curious',
  },
  'no-badges': {
    icon: Trophy,
    gradient: ['#FFF9E6', '#FFE8CC', '#FFF9E6'],
    iconColor: Colors.secondary.sunshine,
    parentMessage: 'Rozetler seni bekliyor!',
    professionalMessage: 'Başarı rozeti yok',
    defaultMood: 'excited',
  },
  'no-clients': {
    icon: Users,
    gradient: ['#F0F9FF', '#E8F4FD', '#F0F9FF'],
    iconColor: Colors.secondary.sky,
    parentMessage: 'Profil ekleyin',
    professionalMessage: 'Henüz danışan yok',
    defaultMood: 'curious',
  },
  'no-favorites': {
    icon: Star,
    gradient: ['#FFF9E6', '#FFE8CC', '#FFF9E6'],
    iconColor: Colors.semantic.amber,
    parentMessage: 'Favorilerin burada görünecek',
    professionalMessage: 'Favori öğe yok',
    defaultMood: 'curious',
  },
  'no-notes': {
    icon: FileText,
    gradient: ['#F0F9FF', '#E8F4FD', '#F0F9FF'],
    iconColor: Colors.secondary.sky,
    parentMessage: 'Henüz not yok',
    professionalMessage: 'Not eklenmemiş',
    defaultMood: 'thinking',
  },
  'no-messages': {
    icon: MessageCircle,
    gradient: ['#F5F3FF', '#EDE9FE', '#F5F3FF'],
    iconColor: Colors.secondary.lavender,
    parentMessage: 'Henüz mesaj yok',
    professionalMessage: 'Mesaj bulunamadı',
    defaultMood: 'curious',
  },
  'no-images': {
    icon: ImageIcon,
    gradient: ['#E8FFF5', '#F0FFFF', '#E8FFF5'],
    iconColor: Colors.secondary.mint,
    parentMessage: 'Görsel eklenmemiş',
    professionalMessage: 'Görsel yok',
    defaultMood: 'curious',
  },
  welcome: {
    icon: Hand,
    gradient: ['#FFF8F0', '#F5E8FF', '#FFF8F0'],
    iconColor: Colors.secondary.lavender,
    parentMessage: 'Hoş geldin!',
    professionalMessage: 'Hoş geldiniz',
    defaultMood: 'happy',
  },
  'search-empty': {
    icon: Search,
    gradient: ['#F0F9FF', '#E8F4FD', '#F0F9FF'],
    iconColor: Colors.secondary.sky,
    parentMessage: 'Bulamadım ama...',
    professionalMessage: 'Sonuç bulunamadı',
    defaultMood: 'thinking',
  },
  error: {
    icon: AlertCircle,
    gradient: ['#FFF5F5', '#FEE2E2', '#FFF5F5'],
    iconColor: Colors.semantic.error,
    parentMessage: 'Bir şeyler ters gitti',
    professionalMessage: 'Hata oluştu',
    defaultMood: 'sad',
  },
  offline: {
    icon: WifiOff,
    gradient: ['#FFF5F5', '#FEE2E2', '#FFF5F5'],
    iconColor: Colors.neutral.medium,
    parentMessage: 'İnternet bağlantısı yok',
    professionalMessage: 'Bağlantı yok',
    defaultMood: 'sad',
  },
  'coming-soon': {
    icon: Clock,
    gradient: ['#F5F3FF', '#EDE9FE', '#F5F3FF'],
    iconColor: Colors.secondary.lavender,
    parentMessage: 'Çok yakında!',
    professionalMessage: 'Yakında',
    defaultMood: 'excited',
  },
};

// Map old mood types to new Ioo moods
const MOOD_MAP: Record<IooMood, NewIooMood> = {
  happy: 'happy',
  curious: 'curious',
  excited: 'excited',
  sad: 'sleepy',
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
  mascotMood,
  style,
  compact = false,
  forceProStyle = false,
}: EmptyStateProps) {
  const { tapMedium } = useHapticFeedback();
  const config = ILLUSTRATIONS[illustration];
  const isProfessional = useIsProfessional();
  const mascotSettings = useMascotSettings();

  // Use config default mood if not provided
  const effectiveMood = mascotMood || config.defaultMood;
  const mappedMood = MOOD_MAP[effectiveMood] || 'happy';

  // Determine if we should use professional styling
  const useProfessionalStyle = forceProStyle || isProfessional;

  // Check if mascot should be shown
  const showMascot =
    !useProfessionalStyle &&
    mascotSettings.showOnEmptyStates &&
    mascotSettings.prominence !== 'hidden';

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations - faster for professional mode
    const animDuration = useProfessionalStyle ? 200 : 300;

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: useProfessionalStyle ? 100 : 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animDuration,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: useProfessionalStyle ? 100 : 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation only for parent mode with mascot
    if (showMascot) {
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
    }
  }, [scaleAnim, fadeAnim, floatAnim, buttonAnim, useProfessionalStyle, showMascot]);

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

  // Professional mode render
  if (useProfessionalStyle) {
    return (
      <View
        style={[
          styles.container,
          compact && styles.containerCompact,
          styles.containerProfessional,
          style,
        ]}
      >
        {/* Professional Icon */}
        <Animated.View
          style={[
            styles.professionalIconContainer,
            compact && styles.professionalIconCompact,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <IconComponent
            size={compact ? 32 : 48}
            color={ProfessionalColors.text.tertiary}
            strokeWidth={1.5}
          />
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.title, styles.titleProfessional, compact && styles.titleCompact]}>
            {title}
          </Text>
          <Text
            style={[
              styles.description,
              styles.descriptionProfessional,
              compact && styles.descriptionCompact,
            ]}
          >
            {description}
          </Text>
        </Animated.View>

        {/* Action Button - Professional */}
        {actionLabel && onAction && (
          <Animated.View
            style={[
              styles.buttonContainer,
              { opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] },
            ]}
          >
            <Pressable
              onPress={handleAction}
              style={({ pressed }) => [
                styles.actionButtonProfessional,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.actionButtonTextProfessional}>{actionLabel}</Text>
            </Pressable>

            {secondaryLabel && onSecondaryAction && (
              <Pressable
                onPress={handleSecondaryAction}
                style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.secondaryButtonTextProfessional}>{secondaryLabel}</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </View>
    );
  }

  // Parent mode render (with mascot and playful design)
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {/* Illustration with Ioo or Icon */}
      <Animated.View
        style={[
          styles.illustrationContainer,
          compact && styles.illustrationCompact,
          {
            transform: [
              { scale: scaleAnim },
              ...(showMascot ? [{ translateY: floatTranslateY }] : []),
            ],
          },
        ]}
      >
        {showMascot ? (
          <View style={styles.iooContainer}>
            <Ioo
              mood={mappedMood}
              size={compact ? 'sm' : 'md'}
              animated={true}
              showGlow={!compact}
            />
          </View>
        ) : (
          <LinearGradient
            colors={config.gradient}
            style={[styles.iconOnlyContainer, compact && styles.iconOnlyCompact]}
          >
            <IconComponent size={compact ? 36 : 48} color={config.iconColor} />
          </LinearGradient>
        )}

        {/* Icon Badge - only when mascot is shown */}
        {showMascot && (
          <LinearGradient
            colors={config.gradient}
            style={[styles.iconBadge, compact && styles.iconBadgeCompact]}
          >
            <IconComponent size={compact ? 18 : 24} color={config.iconColor} />
          </LinearGradient>
        )}
      </Animated.View>

      {/* Text Content */}
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <Text style={[styles.description, compact && styles.descriptionCompact]}>
          {description}
        </Text>
      </Animated.View>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Animated.View
          style={[
            styles.buttonContainer,
            { opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] },
          ]}
        >
          <Pressable
            onPress={handleAction}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
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
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// =============================================================================
// Pre-configured Empty States
// Role-aware: messages adapt based on user role automatically
// =============================================================================

interface PresetEmptyProps {
  onAction?: () => void;
  compact?: boolean;
}

export function NoAnalysisEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="no-analysis"
      title={isProfessional ? 'Analiz Bulunamadı' : 'İlk çizim analizini yapalım!'}
      description={
        isProfessional
          ? 'Yeni analiz oluşturmak için çizim yükleyin.'
          : 'Bir çizim yükleyin, duygusal dünyayı birlikte keşfedelim.'
      }
      actionLabel={isProfessional ? 'Yeni Analiz' : 'Çizim Yükle'}
      onAction={onAction}
      compact={compact}
    />
  );
}

export function NoStoriesEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="no-stories"
      title={isProfessional ? 'Hikaye Bulunamadı' : 'Masallar seni bekliyor!'}
      description={
        isProfessional
          ? 'Bu danışan için henüz hikaye oluşturulmamış.'
          : 'Birlikte hayal gücünü keşfedecek masallar oluşturalım.'
      }
      actionLabel={isProfessional ? 'Hikaye Oluştur' : 'Masal Oluştur'}
      onAction={onAction}
      compact={compact}
    />
  );
}

export function NoColoringEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="no-coloring"
      title={isProfessional ? 'Boyama Bulunamadı' : 'İlk sanat eserini burada göreceksin!'}
      description={
        isProfessional
          ? 'Henüz boyama aktivitesi kaydedilmemiş.'
          : 'Boyama sayfalarıyla yaratıcılığı keşfedin.'
      }
      actionLabel={isProfessional ? 'Boyama Ekle' : 'Boyamaya Başla'}
      onAction={onAction}
      compact={compact}
    />
  );
}

export function NoHistoryEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="no-history"
      title={isProfessional ? 'Geçmiş Aktivite Yok' : 'Gelişim yolculuğu başlıyor!'}
      description={
        isProfessional
          ? 'Bu dönem için aktivite kaydı bulunmuyor.'
          : 'İlk aktivitenizi tamamladığınızda burada göreceksiniz.'
      }
      actionLabel={isProfessional ? 'Yeni Aktivite' : 'Keşfet'}
      onAction={onAction}
      compact={compact}
    />
  );
}

export function NoChildrenEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="no-children"
      title={isProfessional ? 'Danışan Profili Yok' : 'Çocuğunuzun profilini oluşturun'}
      description={
        isProfessional
          ? 'Yeni danışan ekleyerek takibe başlayın.'
          : 'Kişiselleştirilmiş gelişim takibi için profil ekleyin.'
      }
      actionLabel={isProfessional ? 'Danışan Ekle' : 'Profil Oluştur'}
      onAction={onAction}
      compact={compact}
    />
  );
}

export function NoClientsEmpty({ onAction, compact }: PresetEmptyProps) {
  return (
    <EmptyState
      illustration="no-clients"
      title="Henüz Danışan Yok"
      description="Yeni danışan ekleyerek vaka takibine başlayın."
      actionLabel="Danışan Ekle"
      onAction={onAction}
      compact={compact}
      forceProStyle
    />
  );
}

export function NoFavoritesEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="no-favorites"
      title={isProfessional ? 'Favori Öğe Yok' : 'Favorilerin burada görünecek'}
      description={
        isProfessional
          ? 'Favori olarak işaretlediğiniz öğeler burada görünür.'
          : 'Beğendiğiniz analizleri ve hikayeleri favorilere ekleyin.'
      }
      actionLabel={isProfessional ? undefined : 'Keşfet'}
      onAction={onAction}
      compact={compact}
    />
  );
}

export function NoBadgesEmpty({ onAction, compact }: PresetEmptyProps) {
  return (
    <EmptyState
      illustration="no-badges"
      title="Rozetler seni bekliyor!"
      description="Aktiviteleri tamamlayarak özel rozetler kazanın."
      actionLabel="Keşfet"
      onAction={onAction}
      compact={compact}
    />
  );
}

export function SearchEmpty({ query, compact = true }: { query?: string; compact?: boolean }) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="search-empty"
      title={isProfessional ? 'Sonuç Bulunamadı' : 'Bulamadım'}
      description={
        query
          ? `"${query}" için sonuç bulunamadı.`
          : isProfessional
            ? 'Aramanızla eşleşen sonuç yok.'
            : 'Farklı bir şey aramayı dene.'
      }
      compact={compact}
    />
  );
}

export function ErrorEmpty({
  onRetry,
  message,
  compact,
}: {
  onRetry?: () => void;
  message?: string;
  compact?: boolean;
}) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="error"
      title={isProfessional ? 'Hata Oluştu' : 'Bir Şeyler Ters Gitti'}
      description={
        message ||
        (isProfessional
          ? 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'
          : 'Bir hata oluştu. Lütfen tekrar deneyin.')
      }
      actionLabel="Tekrar Dene"
      onAction={onRetry}
      compact={compact}
    />
  );
}

export function OfflineEmpty({ onRetry, compact }: { onRetry?: () => void; compact?: boolean }) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="offline"
      title={isProfessional ? 'Bağlantı Yok' : 'İnternet Bağlantısı Yok'}
      description={
        isProfessional
          ? 'Bağlantınızı kontrol edin.'
          : 'İnternet bağlantınızı kontrol edip tekrar deneyin.'
      }
      actionLabel="Tekrar Dene"
      onAction={onRetry}
      compact={compact}
    />
  );
}

export function ComingSoonEmpty({ compact }: { compact?: boolean }) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="coming-soon"
      title={isProfessional ? 'Yakında' : 'Çok Yakında!'}
      description={
        isProfessional
          ? 'Bu özellik geliştirme aşamasında.'
          : 'Bu özellik üzerinde çalışıyoruz. Çok yakında burada!'
      }
      compact={compact}
    />
  );
}

export function WelcomeEmpty({ onAction, compact }: PresetEmptyProps) {
  const isProfessional = useIsProfessional();
  return (
    <EmptyState
      illustration="welcome"
      title={isProfessional ? 'Hoş Geldiniz' : 'Hoş Geldin!'}
      description={
        isProfessional
          ? 'Platformu kullanmaya başlamak için ilk danışanınızı ekleyin.'
          : 'Çocuğunuzun duygusal dünyasını keşfetmeye hazır mısınız?'
      }
      actionLabel={isProfessional ? 'Başlayın' : 'Başlayalım'}
      onAction={onAction}
      compact={compact}
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
  containerProfessional: {
    minHeight: 250,
  },

  // Illustration - Parent Mode
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
  iconOnlyContainer: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconOnlyCompact: {
    width: 72,
    height: 72,
  },

  // Illustration - Professional Mode
  professionalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: Colors.neutral.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    marginBottom: spacing['5'],
  },
  professionalIconCompact: {
    width: 60,
    height: 60,
    marginBottom: spacing['4'],
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing['6'],
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  titleCompact: {
    fontSize: typography.size.xl,
  },
  titleProfessional: {
    fontSize: typography.size.lg,
    color: ProfessionalColors.text.primary,
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
  descriptionProfessional: {
    fontSize: typography.size.sm,
    color: ProfessionalColors.text.secondary,
    lineHeight: 20,
  },

  // Buttons - Parent Mode
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
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
  },
  secondaryButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.medium,
    color: Colors.neutral.medium,
  },

  // Buttons - Professional Mode
  actionButtonProfessional: {
    backgroundColor: ProfessionalColors.trust.primary,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.lg,
  },
  actionButtonTextProfessional: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  secondaryButtonTextProfessional: {
    fontSize: typography.size.sm,
    color: ProfessionalColors.text.secondary,
  },
});

export default EmptyState;
