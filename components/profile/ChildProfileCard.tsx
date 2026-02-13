/**
 * ChildProfileCard - Enhanced child profile card
 *
 * Shows:
 * - Avatar and name
 * - Age with visual badge
 * - Last activity indicator
 * - Mini stats (analyses count)
 * - Quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Trash2, Edit2, Brain, Clock, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { AvatarDisplay } from '@/components/AvatarPicker';

export interface ChildProfile {
  name: string;
  age: number;
  avatarId?: string;
  lastActivity?: string;
  analysisCount?: number;
  isFavorite?: boolean;
}

interface ChildProfileCardProps {
  child: ChildProfile;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function ChildProfileCard({
  child,
  index,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}: ChildProfileCardProps) {
  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Henüz aktivite yok';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getAgeColor = (age: number) => {
    if (age <= 4) return [Colors.secondary.peach, Colors.secondary.peachLight];
    if (age <= 7) return [Colors.secondary.sky, Colors.secondary.skyLight];
    if (age <= 11) return [Colors.secondary.grass, Colors.secondary.grassLight];
    return [Colors.secondary.lavender, Colors.secondary.lavenderLight];
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          isSelected && styles.containerSelected,
          pressed && styles.containerPressed,
        ]}
        onPress={onSelect}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Star
              size={iconSizes.inline}
              color={Colors.secondary.sunshine}
              fill={Colors.secondary.sunshine}
              strokeWidth={iconStroke.standard}
            />
          </View>
        )}

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <AvatarDisplay avatarId={child.avatarId} size={64} />
          <LinearGradient
            colors={getAgeColor(child.age) as [string, string]}
            style={styles.ageBadge}
          >
            <Text style={styles.ageText}>{child.age}</Text>
          </LinearGradient>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={1}>
            {child.name}
          </Text>

          {/* Last Activity */}
          <View style={styles.activityRow}>
            <Clock
              size={iconSizes.inline}
              color={Colors.neutral.medium}
              strokeWidth={iconStroke.thin}
            />
            <Text style={styles.activityText}>{formatLastActivity(child.lastActivity)}</Text>
          </View>

          {/* Mini Stats */}
          {child.analysisCount !== undefined && child.analysisCount > 0 && (
            <View style={styles.statsRow}>
              <Brain
                size={iconSizes.inline}
                color={Colors.secondary.grass}
                strokeWidth={iconStroke.standard}
              />
              <Text style={styles.statsText}>{child.analysisCount} analiz</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onEdit && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit2
                size={iconSizes.inline}
                color={Colors.secondary.sky}
                strokeWidth={iconStroke.standard}
              />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2
                size={iconSizes.inline}
                color={Colors.semantic.error}
                strokeWidth={iconStroke.standard}
              />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.md,
  },
  containerSelected: {
    borderColor: Colors.secondary.sunshine,
    backgroundColor: 'rgba(255, 248, 230, 0.95)',
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  selectionIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.full,
    padding: spacing.xs,
    ...shadows.sm,
  },
  avatarSection: {
    position: 'relative',
  },
  ageBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  ageText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  infoSection: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activityText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsText: {
    fontSize: typography.size.xs,
    color: Colors.secondary.grass,
    fontFamily: typography.family.semibold,
  },
  actions: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: Colors.neutral.lightest,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
});

export default ChildProfileCard;
