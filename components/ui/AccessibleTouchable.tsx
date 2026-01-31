/**
 * AccessibleTouchable Component
 *
 * Child-friendly touchable with proper accessibility support
 * - Large touch targets (56px minimum)
 * - Screen reader labels
 * - Haptic feedback
 * - Visual feedback
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
  View,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  TOUCH_TARGETS,
  useReduceMotion,
  getAccessibilityProps,
} from '@/utils/accessibility';

interface AccessibleTouchableProps {
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
  minSize?: 'minimum' | 'comfortable' | 'large' | 'extraLarge';
}

export function AccessibleTouchable({
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  selected = false,
  style,
  pressedStyle,
  disabledStyle,
  children,
  hapticFeedback = 'medium',
  minSize = 'large',
}: AccessibleTouchableProps) {
  const reduceMotion = useReduceMotion();

  const handlePress = useCallback(() => {
    if (disabled) return;

    // Haptic feedback
    if (hapticFeedback !== 'none' && Platform.OS !== 'web') {
      const feedbackStyle = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[hapticFeedback];

      Haptics.impactAsync(feedbackStyle);
    }

    onPress();
  }, [disabled, hapticFeedback, onPress]);

  const handleLongPress = useCallback(() => {
    if (disabled || !onLongPress) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    onLongPress();
  }, [disabled, onLongPress]);

  const minTouchSize = TOUCH_TARGETS[minSize];

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.touchable,
        { minWidth: minTouchSize, minHeight: minTouchSize },
        style,
        pressed && !reduceMotion && styles.pressed,
        pressed && pressedStyle,
        disabled && styles.disabled,
        disabled && disabledStyle,
      ]}
      {...getAccessibilityProps({
        label: accessibilityLabel,
        hint: accessibilityHint,
        role: accessibilityRole,
        state: {
          disabled,
          selected,
        },
      })}
    >
      {children}
    </Pressable>
  );
}

/**
 * Accessible Icon Button
 * Pre-configured button for icon-only actions
 */
interface AccessibleIconButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  icon: React.ReactNode;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function AccessibleIconButton({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  icon,
  disabled = false,
  size = 'medium',
  backgroundColor,
  style,
}: AccessibleIconButtonProps) {
  const sizeConfig = {
    small: { container: 44, icon: 20 },
    medium: { container: 56, icon: 24 },
    large: { container: 64, icon: 28 },
  }[size];

  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      style={[
        styles.iconButton,
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
          borderRadius: sizeConfig.container / 2,
          backgroundColor: backgroundColor || 'rgba(167, 139, 250, 0.1)',
        },
        style,
      ]}
      minSize="minimum"
    >
      {icon}
    </AccessibleTouchable>
  );
}

/**
 * Accessible Card
 * Touchable card with proper semantics
 */
interface AccessibleCardProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AccessibleCard({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  children,
  style,
}: AccessibleCardProps) {
  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      style={[styles.card, style]}
      pressedStyle={styles.cardPressed}
      hapticFeedback="light"
      minSize="comfortable"
    >
      {children}
    </AccessibleTouchable>
  );
}

/**
 * Accessible List Item
 * For navigation lists and menus
 */
interface AccessibleListItemProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  selected?: boolean;
}

export function AccessibleListItem({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  leftIcon,
  rightIcon,
  title,
  subtitle,
  selected = false,
}: AccessibleListItemProps) {
  return (
    <AccessibleTouchable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      selected={selected}
      style={[styles.listItem, selected && styles.listItemSelected]}
      hapticFeedback="light"
      minSize="comfortable"
    >
      {leftIcon && <View style={styles.listItemIcon}>{leftIcon}</View>}
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, selected && styles.listItemTitleSelected]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.listItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      {rightIcon && <View style={styles.listItemIcon}>{rightIcon}</View>}
    </AccessibleTouchable>
  );
}

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },

  // Icon Button
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 12,
  },
  listItemSelected: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  listItemIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    gap: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  listItemTitleSelected: {
    color: '#7C3AED',
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default AccessibleTouchable;
