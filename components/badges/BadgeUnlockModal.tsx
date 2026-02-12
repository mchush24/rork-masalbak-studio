/**
 * BadgeUnlockModal - Rozet Detay ve Kazanma Modalı
 *
 * Özellikleri:
 * - Açık rozetler için konfeti efekti
 * - Kilitli rozetler için nasıl açılacağı bilgisi
 * - İlerleme göstergesi
 * - Rozet detayları
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, Lock, Target, TrendingUp } from 'lucide-react-native';
import { Colors, RenkooColors } from '@/constants/colors';
import { spacing, radius, shadows, typography } from '@/constants/design-system';
import { BADGE_RARITY_CONFIG, type BadgeRarity } from '@/constants/badges';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BadgeUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: BadgeRarity;
    isUnlocked?: boolean;
    progress?: {
      current: number;
      target: number;
      percentage: number;
    };
  } | null;
  onAction?: () => void;
}

export function BadgeUnlockModal({ visible, onClose, badge, onAction }: BadgeUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const isUnlocked = badge?.isUnlocked ?? true;

  useEffect(() => {
    if (visible && badge) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      progressAnim.setValue(0);

      // Badge entrance animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          // Slight rotation
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          // Glow pulse
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0.5,
                duration: 1000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]).start();

      // Progress bar animation for locked badges
      if (!isUnlocked && badge.progress) {
        Animated.timing(progressAnim, {
          toValue: badge.progress.percentage,
          duration: 800,
          useNativeDriver: false,
        }).start();
      }

      // Confetti animation only for unlocked badges
      if (isUnlocked) {
        confettiAnims.forEach((anim, index) => {
          const angle = (Math.PI * 2 * index) / confettiAnims.length;
          const distance = 150 + Math.random() * 100;
          const delay = Math.random() * 300;

          anim.translateX.setValue(0);
          anim.translateY.setValue(0);
          anim.rotate.setValue(0);
          anim.opacity.setValue(0);

          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: Math.cos(angle) * distance,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: Math.sin(angle) * distance + 100,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: Math.random() * 4 - 2,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, badge, isUnlocked]);

  if (!badge) return null;

  const rarityConfig = BADGE_RARITY_CONFIG[badge.rarity];
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'];

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Confetti - only for unlocked */}
        {isUnlocked &&
          confettiAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  backgroundColor: confettiColors[index % confettiColors.length],
                  transform: [
                    { translateX: anim.translateX },
                    { translateY: anim.translateY },
                    {
                      rotate: anim.rotate.interpolate({
                        inputRange: [-2, 2],
                        outputRange: ['-180deg', '180deg'],
                      }),
                    },
                  ],
                  opacity: anim.opacity,
                },
              ]}
            />
          ))}

        {/* Badge Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }, { rotate }],
            },
          ]}
        >
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={20} color={Colors.neutral.dark} />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            {isUnlocked ? (
              <>
                <Sparkles size={24} color={Colors.primary.sunset} />
                <Text style={styles.headerText}>Rozet Kazandın!</Text>
              </>
            ) : (
              <>
                <Target size={24} color={RenkooColors.brand.jellyPurple} />
                <Text style={styles.headerText}>Rozet Hedefi</Text>
              </>
            )}
          </View>

          {/* Badge Icon with Glow */}
          <View style={styles.badgeContainer}>
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: isUnlocked ? rarityConfig.color : Colors.neutral.gray300,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, isUnlocked ? 0.5 : 0.3],
                  }),
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      }),
                    },
                  ],
                },
              ]}
            />
            <LinearGradient
              colors={
                isUnlocked
                  ? [rarityConfig.bgColor, Colors.neutral.white]
                  : [Colors.neutral.gray100, Colors.neutral.gray200]
              }
              style={[styles.badgeIconContainer, !isUnlocked && styles.badgeIconLocked]}
            >
              <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLockedText]}>
                {badge.icon}
              </Text>
              {!isUnlocked && (
                <View style={styles.lockOverlay}>
                  <Lock size={32} color={Colors.neutral.gray400} />
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Badge Info */}
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>

          {/* Rarity */}
          <View style={[styles.rarityBadge, { backgroundColor: rarityConfig.bgColor }]}>
            <Text style={[styles.rarityText, { color: rarityConfig.color }]}>
              {rarityConfig.label}
            </Text>
          </View>

          {/* Progress Section for locked badges */}
          {!isUnlocked && badge.progress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <TrendingUp size={16} color={RenkooColors.brand.jellyPurple} />
                <Text style={styles.progressTitle}>İlerleme Durumu</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                </View>
                <Text style={styles.progressText}>
                  {badge.progress.current} / {badge.progress.target}
                </Text>
              </View>

              <Text style={styles.progressHint}>
                {badge.progress.target - badge.progress.current} tane daha!
              </Text>
            </View>
          )}

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.8 }]}
            onPress={() => {
              if (onAction && !isUnlocked) {
                onAction();
              }
              onClose();
            }}
          >
            <LinearGradient
              colors={
                isUnlocked
                  ? [Colors.primary.sunset, Colors.primary.peach]
                  : [RenkooColors.brand.jellyPurple, RenkooColors.brand.dreamLavender]
              }
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>{isUnlocked ? 'Harika!' : 'Hemen Başla!'}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  card: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    alignItems: 'center',
    ...shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['6'],
  },
  headerText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: spacing['4'],
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -10,
    left: -10,
  },
  badgeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.neutral.white,
    ...shadows.lg,
  },
  badgeIconLocked: {
    borderColor: Colors.neutral.gray200,
  },
  badgeIcon: {
    fontSize: 56,
  },
  badgeIconLockedText: {
    opacity: 0.4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 60,
  },
  badgeName: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginBottom: spacing['4'],
  },
  rarityBadge: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    marginBottom: spacing['4'],
  },
  rarityText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  // Progress section
  progressSection: {
    width: '100%',
    backgroundColor: 'rgba(185, 142, 255, 0.08)',
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginBottom: spacing['4'],
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  progressTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: RenkooColors.brand.jellyPurple,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(185, 142, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: RenkooColors.brand.jellyPurple,
    borderRadius: 6,
  },
  progressText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: RenkooColors.brand.jellyPurple,
    minWidth: 50,
    textAlign: 'right',
  },
  progressHint: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginTop: spacing['2'],
  },
  actionButton: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: spacing['4'],
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
});

export default BadgeUnlockModal;
