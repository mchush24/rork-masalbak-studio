/**
 * BadgeUnlockModal - Rozet Kazanma Animasyonu
 *
 * Özellikleri:
 * - Konfeti efekti
 * - Parlama animasyonu
 * - Rozet detayları
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Sparkles } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import { BADGE_RARITY_CONFIG, type BadgeRarity } from "@/constants/badges";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface BadgeUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: BadgeRarity;
  } | null;
}

export function BadgeUnlockModal({
  visible,
  onClose,
  badge,
}: BadgeUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible && badge) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);

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

      // Confetti animation
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
  }, [visible, badge]);

  if (!badge) return null;

  const rarityConfig = BADGE_RARITY_CONFIG[badge.rarity];
  const confettiColors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96E6A1", "#DDA0DD"];

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-5deg", "0deg", "5deg"],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
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
                      outputRange: ["-180deg", "180deg"],
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
            <Sparkles size={24} color={Colors.primary.sunset} />
            <Text style={styles.headerText}>Yeni Rozet!</Text>
          </View>

          {/* Badge Icon with Glow */}
          <View style={styles.badgeContainer}>
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: rarityConfig.color,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.5],
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
              colors={[rarityConfig.bgColor, "#FFFFFF"]}
              style={styles.badgeIconContainer}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
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

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onClose}
          >
            <LinearGradient
              colors={[Colors.primary.sunset, Colors.primary.peach]}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Harika!</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  card: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius["2xl"],
    padding: spacing["6"],
    alignItems: "center",
    ...shadows.xl,
  },
  closeButton: {
    position: "absolute",
    top: spacing["4"],
    right: spacing["4"],
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    marginBottom: spacing["6"],
  },
  headerText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  badgeContainer: {
    position: "relative",
    marginBottom: spacing["4"],
  },
  glow: {
    position: "absolute",
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.neutral.white,
    ...shadows.lg,
  },
  badgeIcon: {
    fontSize: 56,
  },
  badgeName: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    textAlign: "center",
  },
  badgeDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: "center",
    marginBottom: spacing["4"],
  },
  rarityBadge: {
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    marginBottom: spacing["6"],
  },
  rarityText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  actionButton: {
    width: "100%",
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: spacing["4"],
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
});

export default BadgeUnlockModal;
