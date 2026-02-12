/**
 * NewBadgeModal Component
 *
 * Celebration modal when a user unlocks a new badge
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Sparkles } from 'lucide-react-native';
import { Badge, RARITY_COLORS, BadgeRarity } from '@/lib/gamification/badges';
import { USE_NATIVE_DRIVER } from '@/utils/animation';
import { shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NewBadgeModalProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export function NewBadgeModal({ visible, badge, onClose }: NewBadgeModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      sparkleAnim.setValue(0);

      // Badge pop-in animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();

      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      ).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, badge]);

  if (!badge) return null;

  const rarityColors = RARITY_COLORS[badge.rarity];

  const getRarityLabel = (rarity: BadgeRarity): string => {
    const labels: Record<BadgeRarity, string> = {
      common: 'Yaygın',
      rare: 'Nadir',
      epic: 'Epik',
      legendary: 'Efsanevi',
    };
    return labels[rarity];
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (badge.rarity) {
      case 'legendary':
        return ['#FFF8E1', '#FFECB3', '#FFE082'] as const;
      case 'epic':
        return ['#F3E5F5', '#E1BEE7', '#CE93D8'] as const;
      case 'rare':
        return ['#E8EAF6', '#C5CAE9', '#9FA8DA'] as const;
      default:
        return ['#FAFAFA', '#F5F5F5', '#EEEEEE'] as const;
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={Platform.OS === 'web' ? 0 : 40} tint="dark" style={styles.overlay}>
        <Pressable style={styles.overlayPressable} onPress={onClose}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Pressable onPress={e => e.stopPropagation()}>
              <LinearGradient
                colors={getGradientColors()}
                style={styles.modalContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Close Button */}
                <Pressable style={styles.closeButton} onPress={onClose} hitSlop={20}>
                  <X size={20} color="#9E9E9E" />
                </Pressable>

                {/* Header */}
                <View style={styles.header}>
                  <Animated.View
                    style={[
                      styles.sparkleLeft,
                      {
                        opacity: sparkleAnim,
                        transform: [
                          {
                            translateY: sparkleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -10],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Sparkles size={24} color={rarityColors.border} />
                  </Animated.View>
                  <Text style={styles.headerText}>Yeni Rozet!</Text>
                  <Animated.View
                    style={[
                      styles.sparkleRight,
                      {
                        opacity: sparkleAnim,
                        transform: [
                          {
                            translateY: sparkleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -10],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Sparkles size={24} color={rarityColors.border} />
                  </Animated.View>
                </View>

                {/* Badge Icon */}
                <Animated.View
                  style={[
                    styles.badgeIconContainer,
                    {
                      borderColor: rarityColors.border,
                      backgroundColor: rarityColors.bg,
                      transform: [{ rotate: spin }],
                    },
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </Animated.View>

                {/* Badge Info */}
                <Text style={[styles.badgeName, { color: rarityColors.text }]}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>

                {/* Rarity Badge */}
                <View style={[styles.rarityBadge, { backgroundColor: `${rarityColors.border}20` }]}>
                  <Text style={[styles.rarityText, { color: rarityColors.text }]}>
                    {getRarityLabel(badge.rarity)} Rozet
                  </Text>
                </View>

                {/* XP Reward */}
                <View style={styles.xpRewardContainer}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.xpRewardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.xpRewardText}>+{badge.xpReward} XP</Text>
                  </LinearGradient>
                </View>

                {/* Continue Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.continueButton,
                    { backgroundColor: rarityColors.border },
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.continueText}>Harika!</Text>
                </Pressable>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Pressable>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
  },
  overlayPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: Math.min(SCREEN_WIDTH - 48, 340),
  },
  modalContent: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    ...shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  sparkleLeft: {
    position: 'absolute',
    left: -36,
  },
  sparkleRight: {
    position: 'absolute',
    right: -36,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#424242',
  },
  badgeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeIcon: {
    fontSize: 48,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  rarityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  xpRewardContainer: {
    marginBottom: 24,
  },
  xpRewardGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  xpRewardText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
});

export default NewBadgeModal;
