/**
 * ErrorState Component
 * Part of #1: Hata Ekranı UI/UX Yeniden Tasarımı
 *
 * Role-aware, human-centered error displays with:
 * - Empathetic, role-appropriate messaging
 * - Solution-focused guidance
 * - Ioo mascot support (for parents) / Professional icons (for experts)
 * - Retry mechanisms with progressive disclosure
 * - Integration with copywriting service
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
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
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  Copy,
} from 'lucide-react-native';
import { Colors, ProfessionalColors } from '@/constants/colors';
import { typography, spacing, radius, shadows, iconSizes, iconStroke, iconColors, getRoleStrokeWidth } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { IooRoleAware } from '@/components/Ioo';
import { useRole, useMascotSettings, useIsProfessional } from '@/lib/contexts/RoleContext';
import { useCopywriting, useErrorsCopy } from '@/lib/hooks/useCopywriting';

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
  /** Error code for support reference */
  errorCode?: string;
  /** Additional context for debugging */
  debugInfo?: string;
}

// Error configurations with role-specific adaptations
const ERROR_CONFIG: Record<ErrorType, {
  icon: React.ComponentType<any>;
  gradient: {
    parent: readonly [string, string, ...string[]];
    professional: readonly [string, string, ...string[]];
  };
  iconColor: {
    parent: string;
    professional: string;
  };
  mascotMood: 'sad' | 'concerned' | 'thinking' | 'curious';
  recoveryActions: string[];
}> = {
  network: {
    icon: WifiOff,
    gradient: {
      parent: ['#FFF8F0', '#FEF3C7', '#FFF8F0'],
      professional: ['#FEFCE8', '#FEF9C3', '#FEFCE8'],
    },
    iconColor: {
      parent: Colors.semantic.warning,
      professional: '#CA8A04',
    },
    mascotMood: 'concerned',
    recoveryActions: ['checkWifi', 'checkMobileData', 'retry'],
  },
  server: {
    icon: ServerCrash,
    gradient: {
      parent: ['#F0F9FF', '#DBEAFE', '#F0F9FF'],
      professional: ['#EFF6FF', '#DBEAFE', '#EFF6FF'],
    },
    iconColor: {
      parent: Colors.secondary.sky,
      professional: '#2563EB',
    },
    mascotMood: 'sad',
    recoveryActions: ['waitAndRetry', 'contactSupport'],
  },
  auth: {
    icon: KeyRound,
    gradient: {
      parent: ['#F5F3FF', '#EDE9FE', '#F5F3FF'],
      professional: ['#F5F3FF', '#E9D5FF', '#F5F3FF'],
    },
    iconColor: {
      parent: Colors.secondary.lavender,
      professional: '#7C3AED',
    },
    mascotMood: 'thinking',
    recoveryActions: ['reLogin'],
  },
  notfound: {
    icon: FileQuestion,
    gradient: {
      parent: ['#FFF5F2', '#FFE8E8', '#FFF5F2'],
      professional: ['#FEF2F2', '#FEE2E2', '#FEF2F2'],
    },
    iconColor: {
      parent: Colors.primary.sunset,
      professional: '#DC2626',
    },
    mascotMood: 'curious',
    recoveryActions: ['goBack', 'goHome'],
  },
  generic: {
    icon: AlertTriangle,
    gradient: {
      parent: ['#FEF2F2', '#FEE2E2', '#FEF2F2'],
      professional: ['#FEF2F2', '#FECACA', '#FEF2F2'],
    },
    iconColor: {
      parent: Colors.semantic.error,
      professional: '#DC2626',
    },
    mascotMood: 'sad',
    recoveryActions: ['retry', 'contactSupport'],
  },
  timeout: {
    icon: Clock,
    gradient: {
      parent: ['#FFF8F0', '#FED7AA', '#FFF8F0'],
      professional: ['#FFFBEB', '#FEF3C7', '#FFFBEB'],
    },
    iconColor: {
      parent: Colors.semantic.warning,
      professional: '#D97706',
    },
    mascotMood: 'concerned',
    recoveryActions: ['checkConnection', 'retry'],
  },
  permission: {
    icon: Shield,
    gradient: {
      parent: ['#F5F3FF', '#E9D5FF', '#F5F3FF'],
      professional: ['#F5F3FF', '#DDD6FE', '#F5F3FF'],
    },
    iconColor: {
      parent: Colors.secondary.lavender,
      professional: '#7C3AED',
    },
    mascotMood: 'thinking',
    recoveryActions: ['checkPermissions', 'contactAdmin'],
  },
};

// Role-specific error titles and descriptions
const getErrorContent = (
  type: ErrorType,
  role: 'parent' | 'teacher' | 'expert',
  errorsCopy: ReturnType<typeof useErrorsCopy>
) => {
  const content: Record<ErrorType, { title: string; description: string; suggestion: string }> = {
    network: {
      title: role === 'parent' ? 'Bağlantı Koptu' : 'Ağ Bağlantı Hatası',
      description: errorsCopy.network,
      suggestion: role === 'parent'
        ? 'Wi-Fi veya mobil verinizi kontrol edin'
        : 'Ağ bağlantınızı kontrol edin',
    },
    server: {
      title: role === 'parent' ? 'Sunucuya Ulaşamadık' : 'Sunucu Hatası',
      description: role === 'parent'
        ? 'Ekibimiz sorunu çözmek için çalışıyor. Biraz sonra tekrar deneyin.'
        : 'Sunucu geçici olarak yanıt vermiyor. Lütfen bekleyin.',
      suggestion: role === 'parent'
        ? 'Genellikle birkaç dakika içinde düzelir'
        : 'Sorun devam ederse destek ekibiyle iletişime geçin',
    },
    auth: {
      title: role === 'parent' ? 'Oturum Süresi Doldu' : 'Yetkilendirme Gerekli',
      description: errorsCopy.unauthorized,
      suggestion: role === 'parent'
        ? 'Güvenliğiniz için tekrar giriş yapmanız gerekiyor'
        : 'Oturumunuzu yenilemek için tekrar giriş yapın',
    },
    notfound: {
      title: role === 'parent' ? 'Sayfa Bulunamadı' : 'Kayıt Bulunamadı',
      description: errorsCopy.notFound,
      suggestion: role === 'parent'
        ? 'Aradığınız içerik silinmiş veya taşınmış olabilir'
        : 'İstenen kayıt sistemde mevcut değil',
    },
    generic: {
      title: role === 'parent' ? 'Bir Şeyler Ters Gitti' : 'Beklenmeyen Hata',
      description: errorsCopy.generic,
      suggestion: role === 'parent'
        ? 'Endişelenmeyin, verileriniz güvende!'
        : 'Hata kaydedildi. Sorun devam ederse destek alın.',
    },
    timeout: {
      title: role === 'parent' ? 'İşlem Çok Uzun Sürdü' : 'Zaman Aşımı',
      description: errorsCopy.timeout,
      suggestion: role === 'parent'
        ? 'Daha güçlü bir bağlantı ile tekrar deneyin'
        : 'Bağlantı kalitesini kontrol edip tekrar deneyin',
    },
    permission: {
      title: role === 'parent' ? 'İzin Gerekli' : 'Erişim Yetkisi Yok',
      description: role === 'parent'
        ? 'Bu özelliği kullanmak için izin vermeniz gerekiyor.'
        : 'Bu işlem için gerekli yetkiniz bulunmuyor.',
      suggestion: role === 'parent'
        ? 'Ayarlardan gerekli izinleri açabilirsiniz'
        : 'Yöneticinizle iletişime geçin',
    },
  };

  return content[type];
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
  errorCode,
  debugInfo,
}: ErrorStateProps) {
  const { tapMedium, error: errorHaptic } = useHapticFeedback();
  const { role } = useRole();
  const mascotSettings = useMascotSettings();
  const isProfessional = useIsProfessional();
  const errorsCopy = useErrorsCopy();

  const config = ERROR_CONFIG[type];
  const errorContent = useMemo(
    () => getErrorContent(type, role, errorsCopy),
    [type, role, errorsCopy]
  );

  // Animations
  const shake = useSharedValue(0);
  const iconScale = useSharedValue(0.8);

  useEffect(() => {
    // Initial haptic
    errorHaptic();

    // Icon entrance animation
    iconScale.value = withSpring(1, { damping: 12, stiffness: 150 });

    // Subtle shake
    shake.value = withSequence(
      withTiming(5, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const IconComponent = config.icon;
  const showMascot = mascotSettings.showOnErrors && mascotSettings.prominence !== 'hidden' && !isProfessional;

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
    const subject = encodeURIComponent(`Uygulama Hatası${errorCode ? ` - ${errorCode}` : ''}`);
    const body = encodeURIComponent(
      `Hata Türü: ${type}\nHata Kodu: ${errorCode || 'N/A'}\nPlatform: ${Platform.OS}\n\nAçıklama:\n`
    );
    Linking.openURL(`mailto:destek@renkioo.com?subject=${subject}&body=${body}`);
  };

  const handleCopyError = () => {
    tapMedium();
    // Copy error code to clipboard
    if (errorCode) {
      // Would need Clipboard API
    }
  };

  const gradientColors = isProfessional ? config.gradient.professional : config.gradient.parent;
  const iconColor = isProfessional ? config.iconColor.professional : config.iconColor.parent;

  return (
    <Animated.View
      style={[
        styles.container,
        compact && styles.containerCompact,
        isProfessional && styles.containerProfessional,
        containerAnimatedStyle,
        style,
      ]}
    >
      {/* Mascot or Professional Icon */}
      <Animated.View
        entering={FadeIn.delay(100).duration(300)}
        style={[styles.visualContainer, compact && styles.visualContainerCompact]}
      >
        {showMascot ? (
          <IooRoleAware
            mood={config.mascotMood === 'sad' ? 'sleepy' : 'curious'}
            size={compact ? 'small' : 'medium'}
            context="error"
            animated={true}
          />
        ) : (
          <LinearGradient
            colors={gradientColors}
            style={[
              styles.iconContainer,
              compact && styles.iconContainerCompact,
              isProfessional && styles.iconContainerProfessional,
            ]}
          >
            <Animated.View style={iconAnimatedStyle}>
              <IconComponent
                size={compact ? iconSizes.header : iconSizes.feature}
                color={iconColor}
                strokeWidth={getRoleStrokeWidth(isProfessional)}
              />
            </Animated.View>
          </LinearGradient>
        )}
      </Animated.View>

      {/* Error Type Badge */}
      {!compact && (
        <Animated.View entering={FadeInDown.delay(150).duration(300)}>
          <LinearGradient
            colors={gradientColors}
            style={[styles.typeBadge, isProfessional && styles.typeBadgeProfessional]}
          >
            <IconComponent size={iconSizes.badge} color={iconColor} strokeWidth={iconStroke.standard} />
            <Text style={[styles.typeBadgeText, { color: iconColor }]}>
              {type === 'network' ? 'Bağlantı' :
               type === 'server' ? 'Sunucu' :
               type === 'auth' ? 'Oturum' :
               type === 'notfound' ? 'Bulunamadı' :
               type === 'timeout' ? 'Zaman Aşımı' :
               type === 'permission' ? 'İzin' : 'Hata'}
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Error Message */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(300)}
        style={styles.textContainer}
      >
        <Text style={[
          styles.title,
          compact && styles.titleCompact,
          isProfessional && styles.titleProfessional
        ]}>
          {title || errorContent.title}
        </Text>
        <Text style={[
          styles.description,
          compact && styles.descriptionCompact,
          isProfessional && styles.descriptionProfessional
        ]}>
          {description || errorContent.description}
        </Text>

        {/* Suggestion - only for parents or when not compact */}
        {!compact && !isProfessional && (
          <View style={styles.suggestionContainer}>
            <HelpCircle size={iconSizes.badge} color={iconColors.medium} strokeWidth={iconStroke.standard} />
            <Text style={styles.suggestion}>
              {errorContent.suggestion}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(300)}
        style={styles.buttonContainer}
      >
        {onRetry && (
          <Pressable
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.primaryButton,
              isProfessional && styles.primaryButtonProfessional,
              pressed && styles.buttonPressed,
            ]}
          >
            <RefreshCw size={iconSizes.small} color={iconColors.inverted} strokeWidth={iconStroke.standard} />
            <Text style={styles.primaryButtonText}>
              {errorsCopy.tryAgain}
            </Text>
          </Pressable>
        )}

        {onGoBack && (
          <Pressable
            onPress={handleGoBack}
            style={({ pressed }) => [
              styles.secondaryButton,
              isProfessional && styles.secondaryButtonProfessional,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ArrowLeft size={iconSizes.inline} color={isProfessional ? ProfessionalColors.text.secondary : iconColors.medium} strokeWidth={iconStroke.standard} />
            <Text style={[styles.secondaryButtonText, isProfessional && styles.secondaryButtonTextProfessional]}>
              Geri Dön
            </Text>
          </Pressable>
        )}

        {showSupport && (
          <Pressable
            onPress={handleSupport}
            style={({ pressed }) => [
              styles.supportButton,
              isProfessional && styles.supportButtonProfessional,
              pressed && { opacity: 0.7 },
            ]}
          >
            <MessageCircle size={iconSizes.badge} color={isProfessional ? ProfessionalColors.trust.primary : iconColors.secondary} strokeWidth={iconStroke.standard} />
            <Text style={[styles.supportButtonText, isProfessional && styles.supportButtonTextProfessional]}>
              Destek Al
            </Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Error Code - Professional mode shows more details */}
      {errorCode && (
        <Animated.View
          entering={FadeIn.delay(400).duration(200)}
          style={styles.errorCodeContainer}
        >
          <Text style={[styles.errorCode, isProfessional && styles.errorCodeProfessional]}>
            {isProfessional ? `Hata Kodu: ${errorCode}` : `Referans: ${errorCode}`}
          </Text>
          {isProfessional && (
            <Pressable onPress={handleCopyError} style={styles.copyButton}>
              <Copy size={iconSizes.badge - 2} color={ProfessionalColors.text.tertiary} strokeWidth={iconStroke.thin} />
            </Pressable>
          )}
        </Animated.View>
      )}

      {/* Debug Info - Development only */}
      {__DEV__ && debugInfo && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      )}
    </Animated.View>
  );
}

// Pre-configured error states
export function NetworkError({ onRetry, errorCode }: { onRetry?: () => void; errorCode?: string }) {
  return <ErrorState type="network" onRetry={onRetry} errorCode={errorCode} />;
}

export function ServerError({ onRetry, errorCode }: { onRetry?: () => void; errorCode?: string }) {
  return <ErrorState type="server" onRetry={onRetry} showSupport errorCode={errorCode} />;
}

export function AuthError({ onRetry, errorCode }: { onRetry?: () => void; errorCode?: string }) {
  return <ErrorState type="auth" onRetry={onRetry} errorCode={errorCode} />;
}

export function NotFoundError({ onGoBack, errorCode }: { onGoBack?: () => void; errorCode?: string }) {
  return <ErrorState type="notfound" onGoBack={onGoBack} errorCode={errorCode} />;
}

export function TimeoutError({ onRetry, errorCode }: { onRetry?: () => void; errorCode?: string }) {
  return <ErrorState type="timeout" onRetry={onRetry} errorCode={errorCode} />;
}

export function PermissionError({ onRetry, onGoBack, errorCode }: {
  onRetry?: () => void;
  onGoBack?: () => void;
  errorCode?: string
}) {
  return <ErrorState type="permission" onRetry={onRetry} onGoBack={onGoBack} errorCode={errorCode} />;
}

export function GenericError({
  onRetry,
  message,
  errorCode,
}: {
  onRetry?: () => void;
  message?: string;
  errorCode?: string;
}) {
  return (
    <ErrorState
      type="generic"
      description={message}
      onRetry={onRetry}
      showSupport
      errorCode={errorCode}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['8'],
    minHeight: 380,
  },
  containerCompact: {
    padding: spacing['4'],
    minHeight: 260,
  },
  containerProfessional: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.xl,
    margin: spacing['4'],
  },

  // Visual Container (Mascot or Icon)
  visualContainer: {
    marginBottom: spacing['4'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualContainerCompact: {
    marginBottom: spacing['3'],
  },

  // Icon Container (for professional mode)
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  iconContainerCompact: {
    width: 60,
    height: 60,
  },
  iconContainerProfessional: {
    borderRadius: radius.lg,
    ...shadows.sm,
  },

  // Type Badge
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.full,
    marginBottom: spacing['4'],
  },
  typeBadgeProfessional: {
    borderRadius: radius.md,
  },
  typeBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing['6'],
    maxWidth: 320,
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
  titleProfessional: {
    fontSize: typography.size.xl,
    color: ProfessionalColors.text.primary,
  },
  description: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['3'],
  },
  descriptionCompact: {
    fontSize: typography.size.sm,
    marginBottom: spacing['2'],
  },
  descriptionProfessional: {
    color: ProfessionalColors.text.secondary,
    lineHeight: 22,
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.neutral.lightest,
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
  },
  suggestion: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontStyle: 'italic',
    flex: 1,
  },

  // Buttons
  buttonContainer: {
    alignItems: 'center',
    gap: spacing['3'],
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
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
  primaryButtonProfessional: {
    backgroundColor: ProfessionalColors.trust.primary,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  secondaryButtonProfessional: {
    borderWidth: 1,
    borderColor: ProfessionalColors.border.light,
    borderRadius: radius.md,
    paddingHorizontal: spacing['5'],
  },
  secondaryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
  },
  secondaryButtonTextProfessional: {
    color: ProfessionalColors.text.secondary,
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
  supportButtonProfessional: {
    borderColor: ProfessionalColors.trust.background,
    backgroundColor: ProfessionalColors.trust.background,
    borderRadius: radius.md,
  },
  supportButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.secondary.sky,
  },
  supportButtonTextProfessional: {
    color: ProfessionalColors.trust.primary,
  },

  // Error Code
  errorCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['4'],
  },
  errorCode: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorCodeProfessional: {
    color: ProfessionalColors.text.tertiary,
  },
  copyButton: {
    padding: spacing['1'],
  },

  // Debug Info
  debugContainer: {
    marginTop: spacing['4'],
    padding: spacing['3'],
    backgroundColor: '#1a1a2e',
    borderRadius: radius.md,
    maxWidth: 300,
  },
  debugText: {
    fontSize: 10,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ErrorState;
