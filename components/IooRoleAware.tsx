/**
 * IooRoleAware - Role-Aware Mascot Component
 * Part of #21: Maskot Kullanımını Yetişkin Odaklı Yap
 *
 * Adapts mascot presentation based on user role:
 * - Parent: Full animated mascot with glow effects
 * - Teacher: Subtle, professional mascot with reduced animations
 * - Expert: Minimal icon representation or hidden
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { Brain, Sparkles, Bot } from 'lucide-react-native';
import { useRole, useMascotSettings } from '@/lib/contexts/RoleContext';
import { IooMascotImage } from './IooMascotImage';
import { IooMood, IooSize } from '@/constants/ioo-config';
import { ProfessionalColors, Colors } from '@/constants/colors';
import { spacing, radius, shadows } from '@/constants/design-system';

// Re-export types for use by consumers
export type { IooMood, IooSize } from '@/constants/ioo-config';

export interface IooRoleAwareProps {
  /** Size of the mascot */
  size?: IooSize | number;
  /** Mood of the mascot */
  mood?: IooMood;
  /** Whether to animate */
  animated?: boolean;
  /** Whether to show glow effects */
  showGlow?: boolean;
  /** Context where mascot is shown */
  context?: 'dashboard' | 'empty' | 'error' | 'loading' | 'chat' | 'general';
  /** Press handler */
  onPress?: () => void;
  /** Custom style */
  style?: StyleProp<ViewStyle>;
  /** Force show even if role settings hide it */
  forceShow?: boolean;
}

// Size mapping for professional icon mode
const ICON_SIZE_MAP: Record<string, number> = {
  xs: 20,
  sm: 24,
  tiny: 24,
  small: 28,
  md: 32,
  medium: 36,
  lg: 40,
  large: 44,
  hero: 48,
  giant: 56,
};

/**
 * Professional Icon Mascot
 * A minimal, icon-based representation for experts
 */
const ProfessionalIcon = memo(function ProfessionalIcon({
  size,
  onPress,
  style,
}: {
  size: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <View style={[styles.professionalIcon, { width: size + 16, height: size + 16 }, style]}>
      <Brain size={size} color={ProfessionalColors.trust.primary} strokeWidth={1.5} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
});

/**
 * Subtle Mascot
 * Reduced animation version for teachers
 */
const SubtleMascot = memo(function SubtleMascot({
  size,
  mood,
  onPress,
  style,
}: {
  size: IooSize | number;
  mood?: IooMood;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.subtleContainer, style]}>
      <IooMascotImage
        size={size}
        mood={mood}
        animated={false} // No animation for subtle mode
        showGlow={false} // No glow for subtle mode
        onPress={onPress}
      />
    </View>
  );
});

/**
 * Main Role-Aware Mascot Component
 */
export const IooRoleAware = memo(function IooRoleAware({
  size = 'medium',
  mood = 'happy',
  animated = true,
  showGlow = true,
  context = 'general',
  onPress,
  style,
  forceShow = false,
}: IooRoleAwareProps) {
  const { role } = useRole();
  const mascotSettings = useMascotSettings();

  // Check if mascot should be shown based on context
  const shouldShow = useMemo(() => {
    if (forceShow) return true;

    switch (context) {
      case 'dashboard':
        return mascotSettings.showOnDashboard;
      case 'empty':
        return mascotSettings.showOnEmptyStates;
      case 'error':
        return mascotSettings.showOnErrors;
      case 'loading':
        return mascotSettings.showOnLoading;
      case 'chat':
        return mascotSettings.showAsChat;
      default:
        return mascotSettings.prominence !== 'hidden';
    }
  }, [context, mascotSettings, forceShow]);

  // Calculate numeric size for icon mode
  const numericSize = useMemo(() => {
    if (typeof size === 'number') return size;
    return ICON_SIZE_MAP[size] || 32;
  }, [size]);

  // Don't render if should be hidden
  if (!shouldShow) {
    return null;
  }

  // Render based on role and prominence
  switch (mascotSettings.prominence) {
    case 'hidden':
      return null;

    case 'low':
      // Professional icon for experts, subtle mascot for others with low prominence
      if (role === 'expert') {
        return <ProfessionalIcon size={numericSize} onPress={onPress} style={style} />;
      }
      return <SubtleMascot size={size} mood={mood} onPress={onPress} style={style} />;

    case 'medium':
      // Subtle mascot with reduced effects
      return (
        <View style={style}>
          <IooMascotImage
            size={size}
            mood={mood}
            animated={animated && role !== 'expert'} // Experts get no animation
            showGlow={false} // Medium prominence = no glow
            onPress={onPress}
          />
        </View>
      );

    case 'high':
    default:
      // Full mascot experience for parents
      return (
        <View style={style}>
          <IooMascotImage
            size={size}
            mood={mood}
            animated={animated}
            showGlow={showGlow}
            onPress={onPress}
          />
        </View>
      );
  }
});

/**
 * Hook to get role-appropriate mascot props
 */
export function useRoleMascotProps(baseProps: Partial<IooRoleAwareProps> = {}) {
  const { role } = useRole();
  const mascotSettings = useMascotSettings();

  return useMemo(() => {
    const props = { ...baseProps };

    // Adjust based on role
    switch (role) {
      case 'expert':
        props.animated = false;
        props.showGlow = false;
        break;
      case 'teacher':
        props.showGlow = false;
        if (mascotSettings.prominence === 'low') {
          props.animated = false;
        }
        break;
      case 'parent':
      default:
        // Full experience for parents
        break;
    }

    return props;
  }, [role, mascotSettings, baseProps]);
}

/**
 * Minimal Assistant Icon
 * For use in professional contexts where full mascot is too playful
 */
export const AssistantIcon = memo(function AssistantIcon({
  size = 24,
  color,
  onPress,
  style,
}: {
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { role } = useRole();

  const iconColor =
    color ||
    (role === 'expert'
      ? ProfessionalColors.trust.primary
      : role === 'teacher'
        ? ProfessionalColors.roles.teacher.primary
        : Colors.secondary.violet); // Parent default purple

  const content = (
    <View style={[styles.assistantIcon, style]}>
      <Bot size={size} color={iconColor} strokeWidth={1.5} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
});

/**
 * Chat Avatar
 * Role-aware chat avatar for messaging contexts
 */
export const ChatAvatar = memo(function ChatAvatar({
  size = 40,
  isUser = false,

  style,
}: {
  size?: number;
  isUser?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { role } = useRole();
  const mascotSettings = useMascotSettings();

  if (isUser) {
    // User avatar - simple circle with initial
    return (
      <View
        style={[styles.userAvatar, { width: size, height: size, borderRadius: size / 2 }, style]}
      >
        {/* Could add user initial here */}
      </View>
    );
  }

  // Bot avatar - role-aware
  if (mascotSettings.prominence === 'hidden' || mascotSettings.prominence === 'low') {
    return (
      <View
        style={[styles.botAvatarPro, { width: size, height: size, borderRadius: size / 2 }, style]}
      >
        <Sparkles
          size={size * 0.5}
          color={
            role === 'expert'
              ? ProfessionalColors.trust.primary
              : ProfessionalColors.roles.teacher.primary
          }
        />
      </View>
    );
  }

  // Full mascot for high prominence
  return (
    <View style={[{ width: size, height: size }, style]}>
      <IooMascotImage size={size} mood="happy" animated={false} showGlow={false} />
    </View>
  );
});

const styles = StyleSheet.create({
  professionalIcon: {
    backgroundColor: ProfessionalColors.trust.background,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  subtleContainer: {
    opacity: 0.9,
  },
  assistantIcon: {
    padding: spacing['1'],
  },
  userAvatar: {
    backgroundColor: Colors.neutral.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatarPro: {
    backgroundColor: ProfessionalColors.trust.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});

export default IooRoleAware;
