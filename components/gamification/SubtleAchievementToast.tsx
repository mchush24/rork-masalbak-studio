/**
 * Subtle Achievement Toast
 * Part of #22: Gamification'ı Opsiyonel/Subtle Yap
 *
 * A minimal, professional toast notification for acknowledging milestones
 * without the playful gamification elements.
 *
 * Used for:
 * - Professionals (teachers/experts) who have gamification disabled
 * - Acknowledging completed assessments, milestones, etc.
 * - Providing feedback without childish celebrations
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { Check, Info, X } from 'lucide-react-native';
import { useIsProfessional, useGamification } from '@/lib/contexts/RoleContext';
import { spacing, radius, zIndex } from '@/constants/design-system';
import { ProfessionalColors, Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'info' | 'milestone';

interface SubtleAchievementToastProps {
  visible: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Position of the toast */
  position?: 'top' | 'bottom';
}

const TYPE_CONFIG: Record<ToastType, { icon: typeof Check; color: string; bg: string }> = {
  success: {
    icon: Check,
    color: '#059669',
    bg: '#ECFDF5',
  },
  info: {
    icon: Info,
    color: ProfessionalColors.trust.primary,
    bg: ProfessionalColors.trust.background,
  },
  milestone: {
    icon: Check,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
};

export const SubtleAchievementToast = memo(function SubtleAchievementToast({
  visible,
  type = 'success',
  title,
  message,
  onClose,
  duration = 4000,
  position = 'bottom',
}: SubtleAchievementToastProps) {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration, position]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.containerTop : styles.containerBottom,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: config.bg }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <Icon size={18} color={config.color} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>

        <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={10}>
          <X size={16} color={Colors.neutral.gray400} />
        </Pressable>
      </View>
    </Animated.View>
  );
});

/**
 * Role-aware achievement notification
 * Shows gamification celebration for parents, subtle toast for professionals
 */
interface RoleAwareAchievementProps {
  visible: boolean;
  title: string;
  /** Message for parents (can include emojis, excitement) */
  parentMessage?: string;
  /** Message for professionals (neutral tone) */
  professionalMessage?: string;
  onClose: () => void;
  /** What to show for parents (can be a custom celebration component) */
  parentComponent?: React.ReactNode;
  type?: ToastType;
}

export const RoleAwareAchievement = memo(function RoleAwareAchievement({
  visible,
  title,
  parentMessage,
  professionalMessage,
  onClose,
  parentComponent,
  type = 'milestone',
}: RoleAwareAchievementProps) {
  const isProfessional = useIsProfessional();
  const gamification = useGamification();

  // If parent and celebrations enabled, show parent component or nothing
  if (!isProfessional && gamification.showCelebrations) {
    return parentComponent ? <>{parentComponent}</> : null;
  }

  // For professionals or when celebrations disabled, show subtle toast
  return (
    <SubtleAchievementToast
      visible={visible}
      type={type}
      title={title}
      message={professionalMessage || parentMessage}
      onClose={onClose}
    />
  );
});

/**
 * Hook for showing role-appropriate achievement notifications
 */
export function useAchievementNotification() {
  const isProfessional = useIsProfessional();
  const gamification = useGamification();

  const getNotificationStyle = () => {
    if (isProfessional || !gamification.showCelebrations) {
      return 'subtle';
    }
    return 'celebration';
  };

  return {
    isProfessional,
    showCelebrations: gamification.showCelebrations,
    notificationStyle: getNotificationStyle(),
    shouldShowSubtle: isProfessional || !gamification.showCelebrations,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    // Use design system toast z-index
    zIndex: zIndex.toast,
  },
  containerTop: {
    top: 60,
  },
  containerBottom: {
    bottom: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    paddingRight: spacing['2'],
    borderRadius: radius.xl,
    maxWidth: Math.min(SCREEN_WIDTH - 32, 400),
    width: '100%',
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: spacing['3'],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  message: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  closeButton: {
    padding: spacing['2'],
  },
});

export default SubtleAchievementToast;
