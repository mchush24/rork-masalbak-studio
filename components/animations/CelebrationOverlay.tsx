/**
 * CelebrationOverlay Component
 *
 * Full-screen celebration for:
 * - Analysis complete
 * - Badge unlocked
 * - Streak achieved
 * - First-time achievements
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ConfettiAnimation, SuccessAnimation, SparkleAnimation } from './MicroInteractions';
import { RenkooColors, Colors } from '@/constants/colors';
import { shadows, typography } from '@/constants/design-system';

export type CelebrationType =
  | 'analysis_complete'
  | 'badge_unlocked'
  | 'streak_achieved'
  | 'first_analysis'
  | 'milestone';

interface CelebrationOverlayProps {
  visible: boolean;
  type: CelebrationType;
  title?: string;
  subtitle?: string;
  emoji?: string;
  onDismiss: () => void;
  autoDismissDelay?: number;
}

const CELEBRATION_CONFIG: Record<
  CelebrationType,
  {
    defaultTitle: string;
    defaultSubtitle: string;
    emoji: string;
    gradient: readonly string[];
    showConfetti: boolean;
  }
> = {
  analysis_complete: {
    defaultTitle: 'Analiz Tamamlandı!',
    defaultSubtitle: 'Harika bir adım attınız',
    emoji: '🎉',
    gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A'] as const,
    showConfetti: true,
  },
  badge_unlocked: {
    defaultTitle: 'Rozet Kazandın!',
    defaultSubtitle: 'Tebrikler, yeni bir başarı',
    emoji: '🏆',
    gradient: ['#FFD93D', '#FFCBA4', '#FFB347'],
    showConfetti: true,
  },
  streak_achieved: {
    defaultTitle: 'Seri Devam Ediyor!',
    defaultSubtitle: 'Muhteşem bir tutarlılık',
    emoji: '🔥',
    gradient: ['#FF6B6B', '#FFB347', '#FFD93D'],
    showConfetti: false,
  },
  first_analysis: {
    defaultTitle: 'İlk Analiz!',
    defaultSubtitle: 'Yolculuğa başladınız',
    emoji: '⭐',
    gradient: RenkooColors.gradients.homeScreen,
    showConfetti: true,
  },
  milestone: {
    defaultTitle: 'Kilometre Taşı!',
    defaultSubtitle: 'Büyük bir başarı',
    emoji: '🎯',
    gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A'] as const,
    showConfetti: true,
  },
};

export function CelebrationOverlay({
  visible,
  type,
  title,
  subtitle,
  emoji,
  onDismiss,
  autoDismissDelay = 3000,
}: CelebrationOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const config = CELEBRATION_CONFIG[type];

  const displayTitle = title || config.defaultTitle;
  const displaySubtitle = subtitle || config.defaultSubtitle;
  const displayEmoji = emoji || config.emoji;

  useEffect(() => {
    if (visible) {
      // Trigger haptic
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Show confetti after card appears
      if (config.showConfetti) {
        setTimeout(() => setShowConfetti(true), 500);
      }

      // Auto dismiss
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <BlurView
          intensity={Platform.OS === 'web' ? 0 : 40}
          tint="dark"
          style={styles.blurContainer}
        >
          {/* Confetti */}
          {showConfetti && <ConfettiAnimation count={30} duration={2500} />}

          {/* Main Card */}
          <Animated.View entering={SlideInUp.springify().damping(15)} style={styles.cardContainer}>
            <LinearGradient
              colors={[...config.gradient] as [string, string, ...string[]]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Sparkles around emoji */}
              <View style={styles.emojiContainer}>
                <SparkleAnimation size={120} color={RenkooColors.brand.starGold} />
                <Text style={styles.emoji}>{displayEmoji}</Text>
              </View>

              {/* Success checkmark */}
              <View style={styles.successContainer}>
                <SuccessAnimation size={60} color={RenkooColors.brand.jellyMint} />
              </View>

              {/* Text */}
              <Animated.Text entering={FadeIn.delay(300)} style={styles.title}>
                {displayTitle}
              </Animated.Text>

              <Animated.Text entering={FadeIn.delay(500)} style={styles.subtitle}>
                {displaySubtitle}
              </Animated.Text>

              {/* Dismiss hint */}
              <Animated.Text entering={FadeIn.delay(1000)} style={styles.dismissHint}>
                Kapatmak için dokun
              </Animated.Text>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    overflow: 'hidden',
    ...shadows.xl,
  },
  card: {
    padding: 32,
    alignItems: 'center',
  },
  emojiContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 64,
    position: 'absolute',
  },
  successContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.family.extrabold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.family.medium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  dismissHint: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.4)',
  },
});

export default CelebrationOverlay;
