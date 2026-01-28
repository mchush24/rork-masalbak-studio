/**
 * IooEmotionCheckIn Component
 *
 * Daily emotion check-in with Ioo mascot
 * - Morning/evening prompts
 * - Emotion tracking integration
 * - Gamification rewards
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { X, Sparkles, Star, Flame, Calendar } from 'lucide-react-native';
import { IooMascotFinal as IooMascot } from './IooMascotFinal';
import { IooEmotionPicker, Emotion, EMOTIONS } from './IooEmotionPicker';
import { useEmotionTracker } from '@/lib/hooks/useEmotionTracker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IooEmotionCheckInProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: (emotion: Emotion, xpEarned: number) => void;
}

type CheckInStep = 'greeting' | 'select' | 'confirm' | 'complete';

export function IooEmotionCheckIn({
  visible,
  onClose,
  onComplete,
}: IooEmotionCheckInProps) {
  const [step, setStep] = useState<CheckInStep>('greeting');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  const {
    currentStreak,
    checkedInToday,
    recordEmotion,
    getTodayLastEmotion,
  } = useEmotionTracker();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setStep('greeting');
      setSelectedEmotion(null);

      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible]);

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: 'Günaydın!',
        subtitle: 'Bugün nasıl uyandın?',
        iooMood: 'happy' as const,
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        title: 'İyi Günler!',
        subtitle: 'Bugün nasıl geçiyor?',
        iooMood: 'curious' as const,
      };
    }
    if (hour >= 17 && hour < 21) {
      return {
        title: 'İyi Akşamlar!',
        subtitle: 'Bugün nasıl geçti?',
        iooMood: 'happy' as const,
      };
    }
    return {
      title: 'İyi Geceler!',
      subtitle: 'Uyumadan önce nasıl hissediyorsun?',
      iooMood: 'sleepy' as const,
    };
  };

  const handleStartCheckIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setStep('select');
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleConfirm = async () => {
    if (!selectedEmotion) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Record the emotion
    const result = await recordEmotion(
      selectedEmotion.id,
      selectedEmotion.name,
      selectedEmotion.emoji
    );

    setXpEarned(result.xpEarned);
    setStep('complete');

    // Confetti animation
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    onComplete?.(selectedEmotion, result.xpEarned);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const greeting = getGreetingByTime();

  return (
    <View style={styles.overlay}>
      <BlurView
        intensity={Platform.OS === 'web' ? 0 : 40}
        tint="dark"
        style={styles.blurView}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
      </BlurView>

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={
            selectedEmotion
              ? selectedEmotion.gradient
              : (['#FFF8F0', '#F5E8FF', '#FFE8F5'] as const)
          }
          style={styles.content}
        >
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={20} color="#9CA3AF" />
          </Pressable>

          {/* Step Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP: Greeting */}
            {step === 'greeting' && (
              <View style={styles.stepContent}>
                <IooMascot
                  size="large"
                  mood={greeting.iooMood}
                  animated
                  showGlow
                />

                <View style={styles.greetingText}>
                  <Text style={styles.greetingTitle}>{greeting.title}</Text>
                  <Text style={styles.greetingSubtitle}>{greeting.subtitle}</Text>
                </View>

                {/* Streak Info */}
                {currentStreak > 0 && (
                  <View style={styles.streakBadge}>
                    <Flame size={16} color="#FF6B6B" />
                    <Text style={styles.streakText}>
                      {currentStreak} gün seri!
                    </Text>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.startButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleStartCheckIn}
                >
                  <LinearGradient
                    colors={['#A78BFA', '#818CF8']}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>
                      Duygumu Paylaş
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}

            {/* STEP: Select Emotion */}
            {step === 'select' && (
              <View style={styles.stepContent}>
                <IooEmotionPicker
                  onEmotionSelect={handleEmotionSelect}
                  showIoo={true}
                  size="compact"
                  initialEmotion={selectedEmotion?.id}
                />

                {selectedEmotion && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButton,
                      { backgroundColor: selectedEmotion.color },
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>
                      {selectedEmotion.emoji} Bu Benim Duygum!
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* STEP: Complete */}
            {step === 'complete' && selectedEmotion && (
              <View style={styles.stepContent}>
                <View style={styles.completeSection}>
                  <Animated.View
                    style={[
                      styles.confettiContainer,
                      {
                        opacity: confettiAnim,
                        transform: [
                          {
                            scale: confettiAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Sparkles size={40} color="#FFD93D" />
                  </Animated.View>

                  <IooMascot
                    size="large"
                    mood={selectedEmotion.iooMood}
                    animated
                    showGlow
                  />

                  <View style={styles.completeText}>
                    <Text style={styles.completeTitle}>Harika!</Text>
                    <Text style={styles.completeMessage}>
                      {selectedEmotion.message}
                    </Text>
                  </View>

                  {/* XP Earned */}
                  <View style={styles.xpBadge}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.xpText}>+{xpEarned} XP</Text>
                  </View>

                  {/* Streak Update */}
                  {currentStreak > 0 && (
                    <View style={styles.streakUpdate}>
                      <Flame size={14} color="#FF6B6B" />
                      <Text style={styles.streakUpdateText}>
                        {currentStreak} gün seri devam ediyor!
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={({ pressed }) => [
                      styles.doneButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={styles.doneButtonText}>Tamam!</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    minHeight: SCREEN_HEIGHT * 0.7,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },

  // Greeting Step
  greetingText: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 24,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },

  // Confirm Button
  confirmButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Complete Step
  completeSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
  },
  completeText: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  completeMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
    marginBottom: 12,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  streakUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  streakUpdateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default IooEmotionCheckIn;
