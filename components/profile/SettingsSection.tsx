/**
 * SettingsSection - Categorized settings section
 *
 * Groups settings with:
 * - Category header with icon
 * - Collapsible content
 * - Clean visual hierarchy
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, iconSizes, iconStroke } from '@/constants/design-system';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
}

export function SettingsSection({
  title,
  icon,
  children,
  defaultExpanded = true,
  badge,
}: SettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    rotation.value = withTiming(isExpanded ? 0 : 180, { duration: 200 });
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed,
        ]}
        onPress={toggleExpanded}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <Text style={styles.title}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={iconStyle}>
          <ChevronDown
            size={iconSizes.small}
            color={Colors.neutral.medium}
            strokeWidth={iconStroke.standard}
          />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <Animated.View style={styles.content}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.neutral.lightest,
  },
  headerPressed: {
    opacity: 0.8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  badge: {
    backgroundColor: Colors.secondary.sunshineLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: Colors.secondary.sunshine,
  },
  content: {
    padding: spacing.md,
    paddingTop: 0,
  },
});

export default SettingsSection;
