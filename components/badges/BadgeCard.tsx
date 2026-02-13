/**
 * BadgeCard - Tek Rozet Kartı Komponenti
 *
 * Özellikleri:
 * - Kilitli/Açık durum gösterimi
 * - Nadirlik renklendirilmesi
 * - İlerleme göstergesi
 * - Animasyonlu geçişler
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { spacing, shadows, typography } from '@/constants/design-system';
import { BADGE_RARITY_CONFIG, type BadgeRarity } from '@/constants/badges';

export interface BadgeCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  isUnlocked: boolean;
  isSecret?: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

// Memoized to prevent unnecessary re-renders in badge grids
export const BadgeCard = memo(function BadgeCard({
  name,

  icon,
  rarity,
  isUnlocked,
  isSecret = false,

  progress,
  onPress,
  size = 'medium',
  showDetails = true,
}: BadgeCardProps) {
  const rarityConfig = BADGE_RARITY_CONFIG[rarity];

  const sizeStyles = {
    small: { iconSize: 32, cardSize: 70 },
    medium: { iconSize: 40, cardSize: 90 },
    large: { iconSize: 56, cardSize: 120 },
  };

  const { iconSize, cardSize } = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { width: cardSize }, pressed && styles.pressed]}
    >
      {/* Badge Icon Container */}
      {isUnlocked ? (
        <LinearGradient
          colors={rarityConfig.gradient}
          style={[
            styles.iconContainer,
            {
              width: cardSize - 10,
              height: cardSize - 10,
              borderRadius: (cardSize - 10) / 2,
              borderColor: rarityConfig.color,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
          <View style={[styles.rarityDot, { backgroundColor: rarityConfig.color }]} />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.iconContainer,
            styles.lockedContainer,
            {
              width: cardSize - 10,
              height: cardSize - 10,
              borderRadius: (cardSize - 10) / 2,
              backgroundColor: Colors.secondary.lavender + '18',
              borderColor: Colors.secondary.lavender + '35',
            },
          ]}
        >
          <View style={styles.lockedOverlay}>
            <Text style={[styles.icon, styles.lockedIcon, { fontSize: iconSize * 0.8 }]}>
              {icon}
            </Text>
            <View style={styles.lockBadge}>
              <Lock size={12} color={Colors.secondary.lavender} />
            </View>
          </View>
        </View>
      )}

      {/* Badge Info */}
      {showDetails && (
        <View style={styles.infoContainer}>
          <Text style={[styles.name, !isUnlocked && styles.lockedText]} numberOfLines={1}>
            {isUnlocked ? name : isSecret ? '???' : name}
          </Text>

          {/* Progress bar for locked badges */}
          {!isUnlocked && progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {progress.current}/{progress.target}
              </Text>
            </View>
          )}

          {/* Rarity label for unlocked badges */}
          {isUnlocked && (
            <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>
              {rarityConfig.label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
});

/**
 * Compact Badge - Sadece ikon gösteren mini rozet
 * Memoized to prevent unnecessary re-renders
 */
export const CompactBadge = memo(function CompactBadge({
  icon,
  rarity,
  isUnlocked,
  size = 40,
}: {
  icon: string;
  rarity: BadgeRarity;
  isUnlocked: boolean;
  size?: number;
}) {
  const rarityConfig = BADGE_RARITY_CONFIG[rarity];

  return (
    <View
      style={[
        styles.compactContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isUnlocked ? rarityConfig.bgColor : Colors.secondary.lavender + '18',
          borderColor: isUnlocked ? rarityConfig.color : Colors.secondary.lavender + '35',
        },
      ]}
    >
      {isUnlocked ? (
        <Text style={{ fontSize: size * 0.5 }}>{icon}</Text>
      ) : (
        <Lock size={size * 0.4} color={Colors.secondary.lavender} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...shadows.sm,
  },
  icon: {
    textAlign: 'center',
  },
  lockedContainer: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  lockedOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.65,
  },
  lockedIcon: {
    opacity: 0.7,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 3,
    ...shadows.xs,
  },
  rarityDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  infoContainer: {
    marginTop: spacing['2'],
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
  },
  lockedText: {
    color: Colors.neutral.medium,
  },
  rarityLabel: {
    fontSize: 10,
    fontFamily: typography.family.medium,
    marginTop: 2,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing['1'],
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.secondary.lavender + '25',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary.lavender,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  // Compact badge
  compactContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});

export default BadgeCard;
