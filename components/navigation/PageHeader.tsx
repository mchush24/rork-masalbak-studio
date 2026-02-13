/**
 * PageHeader Component
 * Phase 3: UX Enhancement
 *
 * Reusable page header with:
 * - Back button
 * - Title and subtitle
 * - Optional gradient background
 * - Right action buttons
 * - Icon badge
 * - Animated entrance
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, layout } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';

interface HeaderAction {
  icon: LucideIcon;
  onPress: () => void;
  color?: string;
  badge?: number;
}

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show back button */
  showBack?: boolean;
  /** Custom back handler */
  onBack?: () => void;
  /** Header icon (shows in gradient badge) */
  icon?: LucideIcon;
  /** Icon gradient colors */
  iconGradient?: readonly [string, string, ...string[]];
  /** Right action buttons */
  actions?: HeaderAction[];
  /** Gradient background colors */
  gradientColors?: readonly [string, string, ...string[]];
  /** Custom style */
  style?: ViewStyle;
  /** Content below header */
  children?: React.ReactNode;
  /** Compact mode */
  compact?: boolean;
  /** Animate entrance */
  animated?: boolean;
  /** Light theme (white text) */
  light?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PageHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  icon: Icon,
  iconGradient = [Colors.secondary.grass, Colors.secondary.grassLight],
  actions = [],
  gradientColors,
  style,
  children,
  compact = false,
  animated = true,
  light = false,
}: PageHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tapLight } = useHapticFeedback();

  const handleBack = () => {
    tapLight();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const colors = {
    title: light ? Colors.neutral.white : Colors.neutral.darkest,
    subtitle: light ? 'rgba(255,255,255,0.8)' : Colors.neutral.medium,
    icon: light ? Colors.neutral.white : Colors.neutral.darkest,
    buttonBg: light ? 'rgba(255,255,255,0.2)' : Colors.neutral.white,
  };

  const content = (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (compact ? spacing['2'] : spacing['4']),
          paddingBottom: compact ? spacing['3'] : spacing['5'],
        },
        style,
      ]}
    >
      {/* Top Row: Back + Actions */}
      <View style={styles.topRow}>
        {/* Back Button */}
        {showBack ? (
          <AnimatedPressable
            entering={animated ? SlideInLeft.delay(100).springify() : undefined}
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.buttonBg },
              pressed && { opacity: 0.6 },
            ]}
            hitSlop={8}
          >
            <ArrowLeft size={compact ? 20 : 24} color={colors.icon} />
          </AnimatedPressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {/* Action Buttons */}
        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <AnimatedPressable
                  key={index}
                  entering={animated ? FadeIn.delay(200 + index * 100) : undefined}
                  onPress={() => {
                    tapLight();
                    action.onPress();
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.buttonBg },
                    pressed && { opacity: 0.6 },
                  ]}
                  hitSlop={8}
                >
                  <ActionIcon size={20} color={action.color || colors.icon} />
                  {action.badge !== undefined && action.badge > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {action.badge > 99 ? '99+' : action.badge}
                      </Text>
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Main Header Content */}
      <Animated.View
        entering={animated ? FadeInDown.delay(150).springify() : undefined}
        style={[styles.headerContent, compact && styles.headerContentCompact]}
      >
        {/* Icon Badge */}
        {Icon && (
          <LinearGradient
            colors={iconGradient}
            style={[styles.iconBadge, compact && styles.iconBadgeCompact]}
          >
            <Icon size={compact ? 28 : layout.icon.medium} color={Colors.neutral.white} />
          </LinearGradient>
        )}

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, compact && styles.titleCompact, { color: colors.title }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                compact && styles.subtitleCompact,
                { color: colors.subtitle },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Additional Content */}
      {children && (
        <Animated.View
          entering={animated ? FadeInDown.delay(250).springify() : undefined}
          style={styles.childrenContainer}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );

  // With gradient background
  if (gradientColors) {
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        {content}
      </LinearGradient>
    );
  }

  return content;
}

// Simple Header variant (just title + back)
interface SimpleHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: LucideIcon;
    onPress: () => void;
  };
  style?: ViewStyle;
  light?: boolean;
}

export function SimpleHeader({
  title,
  showBack = true,
  onBack,
  rightAction,
  style,
  light = false,
}: SimpleHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tapLight } = useHapticFeedback();

  const handleBack = () => {
    tapLight();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const colors = {
    title: light ? Colors.neutral.white : Colors.neutral.darkest,
    icon: light ? Colors.neutral.white : Colors.neutral.darkest,
    buttonBg: light ? 'rgba(255,255,255,0.2)' : Colors.neutral.white,
  };

  return (
    <View style={[styles.simpleContainer, { paddingTop: insets.top + spacing['2'] }, style]}>
      {/* Back Button */}
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.simpleBackButton,
            { backgroundColor: colors.buttonBg },
            pressed && { opacity: 0.6 },
          ]}
          hitSlop={8}
        >
          <ArrowLeft size={20} color={colors.icon} />
        </Pressable>
      ) : (
        <View style={styles.simpleBackPlaceholder} />
      )}

      {/* Title */}
      <Text style={[styles.simpleTitle, { color: colors.title }]} numberOfLines={1}>
        {title}
      </Text>

      {/* Right Action */}
      {rightAction ? (
        <Pressable
          onPress={() => {
            tapLight();
            rightAction.onPress();
          }}
          style={({ pressed }) => [
            styles.simpleBackButton,
            { backgroundColor: colors.buttonBg },
            pressed && { opacity: 0.6 },
          ]}
          hitSlop={8}
        >
          <rightAction.icon size={20} color={colors.icon} />
        </Pressable>
      ) : (
        <View style={styles.simpleBackPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Header
  container: {
    paddingHorizontal: layout.screenPadding,
  },
  gradient: {
    // Gradient wrapper
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  backPlaceholder: {
    width: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  headerContentCompact: {
    gap: spacing['3'],
  },
  iconBadge: {
    width: layout.icon.mega,
    height: layout.icon.mega,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  iconBadgeCompact: {
    width: 56,
    height: 56,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing['1'],
  },
  titleCompact: {
    fontSize: typography.size.xl,
  },
  subtitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
  subtitleCompact: {
    fontSize: typography.size.xs,
  },
  childrenContainer: {
    marginTop: spacing['4'],
  },

  // Simple Header
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing['3'],
  },
  simpleBackButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  simpleBackPlaceholder: {
    width: 36,
  },
  simpleTitle: {
    flex: 1,
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    textAlign: 'center',
    marginHorizontal: spacing['2'],
  },
});

export default PageHeader;
