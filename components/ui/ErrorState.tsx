/**
 * ErrorState Component
 * Phase 5: Error State Design
 *
 * Human-centered error displays with:
 * - Empathetic messaging
 * - Solution-focused guidance
 * - Ioo mascot support
 * - Retry mechanisms
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Linking,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  WifiOff,
  ServerCrash,
  KeyRound,
  FileQuestion,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { Ioo } from '@/components/Ioo';

export type ErrorType = 'network' | 'server' | 'auth' | 'notfound' | 'generic' | 'timeout' | 'permission';

interface ErrorStateProps {
  /** Type of error */
  type: ErrorType;
  /** Override title */
  title?: string;
  /** Override description */
  description?: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Go back handler */
  onGoBack?: () => void;
  /** Show support contact option */
  showSupport?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Compact mode */
  compact?: boolean;
}

// Error configurations
const ERROR_CONFIG: Record<ErrorType, {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  gradient: readonly [string, string, ...string[]];
  iconColor: string;
  suggestion: string;
}> = {
  network: {
    icon: WifiOff,
    title: 'İnternet Bağlantısı Yok',
    description: 'Bağlantını kontrol edip tekrar dene.',
    gradient: ['#FFF8F0', '#FEF3C7', '#FFF8F0'],
    iconColor: Colors.semantic.warning,
    suggestion: 'Wi-Fi veya mobil veri açık mı kontrol et',
  },
  server: {
    icon: ServerCrash,
    title: 'Sunucuya Ulaşamadık',
    description: 'Biraz sonra tekrar deneyin.',
    gradient: ['#F0F9FF', '#DBEAFE', '#F0F9FF'],
    iconColor: Colors.secondary.sky,
    suggestion: 'Sunucularımız yoğunluk yaşıyor olabilir',
  },
  auth: {
    icon: KeyRound,
    title: 'Oturum Süresi Doldu',
    description: 'Güvenliğiniz için tekrar giriş yapmanız gerekiyor.',
    gradient: ['#F5F3FF', '#EDE9FE', '#F5F3FF'],
    iconColor: Colors.secondary.lavender,
    suggestion: 'Bilgileriniz güvende, sadece tekrar giriş yapın',
  },
  notfound: {
    icon: FileQuestion,
    title: 'Aradığın Şey Bulunamadı',
    description: 'Bu içerik silinmiş veya taşınmış olabilir.',
    gradient: ['#FFF5F2', '#FFE8E8', '#FFF5F2'],
    iconColor: Colors.primary.sunset,
    suggestion: 'Ana sayfaya dönüp tekrar arayabilirsin',
  },
  generic: {
    icon: AlertTriangle,
    title: 'Bir Şeyler Ters Gitti',
    description: 'Beklenmeyen bir hata oluştu.',
    gradient: ['#FEF2F2', '#FEE2E2', '#FEF2F2'],
    iconColor: Colors.semantic.error,
    suggestion: 'Sayfayı yenileyerek tekrar deneyebilirsin',
  },
  timeout: {
    icon: RefreshCw,
    title: 'İşlem Zaman Aşımına Uğradı',
    description: 'Bağlantı çok uzun sürdü.',
    gradient: ['#FFF8F0', '#FED7AA', '#FFF8F0'],
    iconColor: Colors.semantic.warning,
    suggestion: 'Daha iyi bir bağlantı ile tekrar dene',
  },
  permission: {
    icon: KeyRound,
    title: 'Erişim İzni Gerekli',
    description: 'Bu içeriğe erişim için izin vermeniz gerekiyor.',
    gradient: ['#F5F3FF', '#E9D5FF', '#F5F3FF'],
    iconColor: Colors.secondary.lavender,
    suggestion: 'Ayarlardan gerekli izinleri kontrol edin',
  },
};

export function ErrorState({
  type,
  title,
  description,
  onRetry,
  onGoBack,
  showSupport = false,
  style,
  compact = false,
}: ErrorStateProps) {
  const { tapMedium, error: errorHaptic } = useHapticFeedback();
  const config = ERROR_CONFIG[type];

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Initial haptic
    errorHaptic();

    // Entrance animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle shake
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [errorHaptic, scaleAnim, fadeAnim, shakeAnim]);

  const IconComponent = config.icon;

  const handleRetry = () => {
    tapMedium();
    onRetry?.();
  };

  const handleGoBack = () => {
    tapMedium();
    onGoBack?.();
  };

  const handleSupport = () => {
    tapMedium();
    Linking.openURL('mailto:destek@renkioo.com?subject=Uygulama%20Hatası');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        compact && styles.containerCompact,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
        },
        style,
      ]}
    >
      {/* Ioo with supportive mood */}
      <View style={[styles.iooContainer, compact && styles.iooContainerCompact]}>
        <Ioo
          mood="sad"
          size={compact ? 'sm' : 'md'}
          animated={true}
        />
      </View>

      {/* Icon Badge */}
      <LinearGradient
        colors={config.gradient}
        style={[styles.iconBadge, compact && styles.iconBadgeCompact]}
      >
        <IconComponent
          size={compact ? 18 : 24}
          color={config.iconColor}
        />
      </LinearGradient>

      {/* Error Message */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, compact && styles.titleCompact]}>
          {title || config.title}
        </Text>
        <Text style={[styles.description, compact && styles.descriptionCompact]}>
          {description || config.description}
        </Text>
        <Text style={styles.suggestion}>
          💡 {config.suggestion}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {onRetry && (
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <RefreshCw size={20} color={Colors.neutral.white} />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </Pressable>
        )}

        {onGoBack && (
          <Pressable
            onPress={handleGoBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ArrowLeft size={18} color={Colors.neutral.medium} />
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </Pressable>
        )}

        {showSupport && (
          <Pressable
            onPress={handleSupport}
            style={({ pressed }) => [
              styles.supportButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <MessageCircle size={16} color={Colors.secondary.sky} />
            <Text style={styles.supportButtonText}>Destek Al</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

// Pre-configured error states
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState type="network" onRetry={onRetry} />;
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState type="server" onRetry={onRetry} showSupport />;
}

export function AuthError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState type="auth" onRetry={onRetry} />;
}

export function NotFoundError({ onGoBack }: { onGoBack?: () => void }) {
  return <ErrorState type="notfound" onGoBack={onGoBack} />;
}

export function GenericError({
  onRetry,
  message,
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <ErrorState
      type="generic"
      description={message}
      onRetry={onRetry}
      showSupport
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['8'],
    minHeight: 350,
  },
  containerCompact: {
    padding: spacing['4'],
    minHeight: 250,
  },

  // Ioo Container
  iooContainer: {
    marginBottom: spacing['4'],
    position: 'relative',
  },
  iooContainerCompact: {
    marginBottom: spacing['3'],
  },

  // Icon Badge (positioned relative to Ioo)
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing['4'],
    marginBottom: spacing['4'],
    ...shadows.md,
    borderWidth: 3,
    borderColor: Colors.neutral.white,
  },
  iconBadgeCompact: {
    width: 36,
    height: 36,
    marginTop: -spacing['3'],
    marginBottom: spacing['3'],
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing['6'],
    maxWidth: 300,
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
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing['3'],
  },
  descriptionCompact: {
    fontSize: typography.size.sm,
  },
  suggestion: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: Colors.neutral.lightest,
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
  },

  // Buttons
  buttonContainer: {
    alignItems: 'center',
    gap: spacing['3'],
    width: '100%',
    maxWidth: 250,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.secondary.grass,
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.full,
    width: '100%',
    ...shadows.md,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  retryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  backButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderWidth: 1,
    borderColor: Colors.secondary.skyLight,
    borderRadius: radius.lg,
  },
  supportButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.secondary.sky,
  },
});

export default ErrorState;
