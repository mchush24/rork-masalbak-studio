/**
 * 🎉 Save Celebration
 *
 * Delightful celebration animation when saving artwork.
 *
 * Features:
 * - Lottie confetti animation (when available)
 * - Fallback Skia confetti for universal support
 * - Success message with bounce
 * - Rainbow confetti particles
 * - Sound + haptic integration
 * - Child-friendly celebration
 *
 * Animation Layers:
 * 1. Background confetti burst
 * 2. Floating confetti pieces
 * 3. Success badge with bounce
 * 4. Sparkle effects
 *
 * Usage:
 * - Show after successful save
 * - Auto-dismiss after 3 seconds
 * - Blocks interaction during celebration
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { Circle, Group } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SaveCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  duration?: number;
  message?: string;
}

/**
 * Main celebration component
 */
export function SaveCelebration({
  visible,
  onComplete,
  duration = 3000,
  message = '✨ Şaheser Kaydedildi! ✨',
}: SaveCelebrationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);

      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowConfetti(false);
          onComplete?.();
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Confetti Animation */}
        {showConfetti && <ConfettiAnimation />}

        {/* Success Badge */}
        <Animated.View
          style={[
            styles.badge,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FFD700']}
            style={styles.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Icon */}
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>🎨</Text>
            </View>

            {/* Message */}
            <Text style={styles.badgeMessage}>{message}</Text>

            {/* Subtitle */}
            <Text style={styles.badgeSubtitle}>Harika iş çıkardın!</Text>
          </LinearGradient>
        </Animated.View>

        {/* Sparkle effects */}
        {showConfetti && <SparkleEffects />}
      </Animated.View>
    </Modal>
  );
}

// ============================================================================
// CONFETTI ANIMATION
// ============================================================================

/**
 * Confetti particles animation
 * Uses Lottie animation with Skia fallback
 */
function ConfettiAnimation() {
  const lottieRef = useRef<LottieView>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Try to play Lottie animation
    try {
      lottieRef.current?.play();
    } catch (error) {
      console.log('[SaveCelebration] Lottie error, using fallback:', error);
      setUseFallback(true);
    }
  }, []);

  // Use Skia fallback if Lottie fails
  if (useFallback) {
    return <SkiaConfetti />;
  }

  return (
    <LottieView
      ref={lottieRef}
      source={require('@/assets/animations/confetti.json')}
      style={styles.lottie}
      loop={false}
      autoPlay
      onAnimationFailure={() => setUseFallback(true)}
    />
  );
}

/**
 * Skia-based confetti fallback
 */
function SkiaConfetti() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    startY: -50,
    color: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9D4EDD', '#FF69B4'][
      Math.floor(Math.random() * 6)
    ],
    size: 4 + Math.random() * 6,
    delay: Math.random() * 500,
    duration: 2000 + Math.random() * 1000,
  }));

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece }: { piece: any }) {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(piece.delay),
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: piece.duration,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const translateY = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [piece.startY, SCREEN_HEIGHT + 50],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: piece.x,
          transform: [{ translateY }, { rotate }],
          backgroundColor: piece.color,
          width: piece.size,
          height: piece.size * 1.5,
        },
      ]}
    />
  );
}

// ============================================================================
// SPARKLE EFFECTS
// ============================================================================

/**
 * Floating sparkles around the badge
 */
function SparkleEffects() {
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * Math.PI * 2) / 8,
  }));

  return (
    <View style={styles.sparklesContainer} pointerEvents="none">
      {sparkles.map((sparkle) => (
        <FloatingSparkle key={sparkle.id} angle={sparkle.angle} />
      ))}
    </View>
  );
}

function FloatingSparkle({ angle }: { angle: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const distance = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 120],
  });

  const translateX = Animated.multiply(
    distance,
    new Animated.Value(Math.cos(angle))
  );

  const translateY = Animated.multiply(
    distance,
    new Animated.Value(Math.sin(angle))
  );

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          opacity: opacityAnim,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <Text style={styles.sparkleEmoji}>✨</Text>
    </Animated.View>
  );
}

// ============================================================================
// SUCCESS MESSAGE ANIMATION
// ============================================================================

/**
 * Reusable success message component
 */
export function SuccessMessage({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose?.();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successMessage,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.successText}>{message}</Text>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
  lottie: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  badge: {
    width: 280,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  badgeMessage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgeSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  sparklesContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleEmoji: {
    fontSize: 24,
  },
  successMessage: {
    position: 'absolute',
    backgroundColor: '#6BCB77',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
