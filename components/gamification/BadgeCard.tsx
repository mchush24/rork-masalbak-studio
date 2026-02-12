/**
 * BadgeCard Component
 *
 * Displays a single badge with unlock status
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Lock } from 'lucide-react-native';
import { Badge, RARITY_COLORS, BadgeRarity } from '@/lib/gamification/badges';
import { USE_NATIVE_DRIVER } from '@/utils/animation';
import { Colors } from '@/constants/colors';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  showXp?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export function BadgeCard({
  badge,
  isUnlocked,
  showXp = true,
  onPress,
  size = 'medium',
  animated = false,
}: BadgeCardProps) {
  const scaleAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Pop-in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();

      // Glow animation for unlocked legendary badges
      if (isUnlocked && badge.rarity === 'legendary') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ])
        ).start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, isUnlocked, badge.rarity]);

  const rarityColors = RARITY_COLORS[badge.rarity];

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          icon: styles.smallIcon,
          iconText: styles.smallIconText,
          name: styles.smallName,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          icon: styles.largeIcon,
          iconText: styles.largeIconText,
          name: styles.largeName,
        };
      default:
        return {
          container: styles.mediumContainer,
          icon: styles.mediumIcon,
          iconText: styles.mediumIconText,
          name: styles.mediumName,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getRarityLabel = (rarity: BadgeRarity): string => {
    const labels: Record<BadgeRarity, string> = {
      common: 'Yaygın',
      rare: 'Nadir',
      epic: 'Epik',
      legendary: 'Efsanevi',
    };
    return labels[rarity];
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <Animated.View
        style={[
          sizeStyles.container,
          {
            transform: [{ scale: scaleAnim }],
            borderColor: isUnlocked ? rarityColors.border : '#E0E0E0',
            backgroundColor: isUnlocked ? rarityColors.bg : Colors.neutral.lightest,
          },
        ]}
      >
        {/* Badge Icon */}
        <View
          style={[
            sizeStyles.icon,
            {
              backgroundColor: isUnlocked
                ? `${rarityColors.border}20`
                : 'rgba(158, 158, 158, 0.15)',
            },
          ]}
        >
          {isUnlocked ? (
            <Text style={sizeStyles.iconText}>{badge.icon}</Text>
          ) : (
            <Lock size={size === 'small' ? 16 : size === 'large' ? 28 : 22} color="#BDBDBD" />
          )}
        </View>

        {/* Badge Info */}
        <Text
          style={[sizeStyles.name, { color: isUnlocked ? rarityColors.text : '#9E9E9E' }]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>

        {size !== 'small' && (
          <Text
            style={[styles.description, { color: isUnlocked ? '#757575' : '#BDBDBD' }]}
            numberOfLines={2}
          >
            {badge.description}
          </Text>
        )}

        {/* Rarity Badge */}
        {size === 'large' && (
          <View style={[styles.rarityBadge, { backgroundColor: `${rarityColors.border}20` }]}>
            <Text style={[styles.rarityText, { color: rarityColors.text }]}>
              {getRarityLabel(badge.rarity)}
            </Text>
          </View>
        )}

        {/* XP Reward */}
        {showXp && isUnlocked && size !== 'small' && (
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{badge.xpReward} XP</Text>
          </View>
        )}

        {/* Locked Overlay */}
        {!isUnlocked && <View style={styles.lockedOverlay} />}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Small size
  smallContainer: {
    width: 72,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconText: {
    fontSize: 20,
  },
  smallName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Medium size
  mediumContainer: {
    width: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 6,
  },
  mediumIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumIconText: {
    fontSize: 26,
  },
  mediumName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Large size
  largeContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  largeIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeIconText: {
    fontSize: 32,
  },
  largeName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  // Common styles
  description: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  xpBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4CAF50',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
  },
});

export default BadgeCard;
