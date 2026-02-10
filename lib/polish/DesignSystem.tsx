/**
 * DesignSystem - Refined design tokens and utilities
 * Phase 21: Polish & Micro-details
 *
 * Provides design system utilities:
 * - Spacing scale
 * - Typography scale
 * - Border radius tokens
 * - Shadow presets
 * - Color utilities
 * - Layout components
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Colors } from '@/constants/colors';

// ============================================
// SPACING SCALE
// ============================================

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
} as const;

// ============================================
// TYPOGRAPHY SCALE
// ============================================

export const Typography = {
  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ============================================
// SHADOWS
// ============================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  colored: (color: string, opacity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: opacity,
    shadowRadius: 16,
    elevation: 8,
  }),
} as const;

// ============================================
// COLOR UTILITIES
// ============================================

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

export function darken(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

// ============================================
// LAYOUT COMPONENTS
// ============================================

interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: keyof typeof Spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Flexible stack layout component
 */
export function Stack({
  children,
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  style,
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: Spacing[gap],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface SpacerProps {
  size?: keyof typeof Spacing;
  flex?: number;
}

/**
 * Spacer component for layout
 */
export function Spacer({ size, flex }: SpacerProps) {
  if (flex) {
    return <View style={{ flex }} />;
  }
  return <View style={{ width: size ? Spacing[size] : undefined, height: size ? Spacing[size] : undefined }} />;
}

interface CenterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Center content both horizontally and vertically
 */
export function Center({ children, style }: CenterProps) {
  return (
    <View style={[styles.center, style]}>
      {children}
    </View>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof Spacing;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Container with max-width and padding
 */
export function Container({
  children,
  padding = 'lg',
  maxWidth = 600,
  style,
}: ContainerProps) {
  return (
    <View
      style={[
        styles.container,
        {
          padding: Spacing[padding],
          maxWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  spacing?: keyof typeof Spacing;
  style?: StyleProp<ViewStyle>;
}

/**
 * Divider line
 */
export function Divider({
  orientation = 'horizontal',
  color = Colors.neutral.lighter,
  thickness = 1,
  spacing = 'md',
  style,
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        {
          backgroundColor: color,
          width: isHorizontal ? '100%' : thickness,
          height: isHorizontal ? thickness : '100%',
          marginVertical: isHorizontal ? Spacing[spacing] : 0,
          marginHorizontal: isHorizontal ? 0 : Spacing[spacing],
        },
        style,
      ]}
    />
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

/**
 * Badge component
 */
export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  style,
}: BadgeProps) {
  const variantStyles = {
    primary: { backgroundColor: Colors.secondary.lavender + '20', color: Colors.secondary.lavender },
    secondary: { backgroundColor: Colors.neutral.lighter, color: Colors.neutral.dark },
    success: { backgroundColor: Colors.emotion.trust + '20', color: Colors.emotion.trust },
    warning: { backgroundColor: Colors.emotion.joy + '20', color: Colors.emotion.joy },
    error: { backgroundColor: Colors.emotion.fear + '20', color: Colors.emotion.fear },
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    md: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    lg: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
  };

  const { backgroundColor, color } = variantStyles[variant];
  const { paddingHorizontal, paddingVertical, fontSize } = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor, paddingHorizontal, paddingVertical },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color, fontSize }]}>{children}</Text>
    </View>
  );
}

interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Avatar component with fallback initials
 */
export function Avatar({
  source,
  name,
  size = 48,
  color = Colors.secondary.lavender,
  style,
}: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (source?.uri) {
    return (
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        {/* Image would go here */}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: hexToRgba(color, 0.15),
        },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { color, fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Chip component for selections
 */
export function Chip({
  children,
  selected = false,
  onPress,
  leftIcon,
  rightIcon,
  style,
}: ChipProps) {
  return (
    <View
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
    >
      {leftIcon}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {children}
      </Text>
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: Typography.weight.semibold,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontWeight: Typography.weight.bold,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.lighter,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.secondary.lavender + '15',
    borderColor: Colors.secondary.lavender,
  },
  chipText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.neutral.dark,
  },
  chipTextSelected: {
    color: Colors.secondary.lavender,
  },
});

export default {
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  hexToRgba,
  lighten,
  darken,
  Stack,
  Spacer,
  Center,
  Container,
  Divider,
  Badge,
  Avatar,
  Chip,
};
