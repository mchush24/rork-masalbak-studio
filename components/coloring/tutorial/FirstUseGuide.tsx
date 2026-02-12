/**
 * 👋 First Use Guide
 *
 * Interactive guided tour for first-time users.
 *
 * Features:
 * - Spotlight on UI elements
 * - Interactive step-by-step guide
 * - Skip anytime
 * - Large touch targets
 * - Child-friendly animations
 * - AsyncStorage persistence
 *
 * Guide Steps:
 * 1. Welcome message
 * 2. Point to canvas - "Draw here!"
 * 3. Point to tools - "Choose your tool"
 * 4. Point to colors - "Pick a color"
 * 5. Point to save - "Save your art"
 * 6. Completion - "You're ready!"
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { shadows, zIndex } from '@/constants/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOverlay } from '@/lib/overlay';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STORAGE_KEY = '@first_use_guide_completed';

export interface SpotlightRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface GuideStep {
  id: number;
  title: string;
  description: string;
  spotlight?: SpotlightRegion;
  messagePosition: 'top' | 'bottom' | 'center';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 1,
    title: 'Hoş Geldin! 👋',
    description: 'Hadi sana kısa bir tur atalım!',
    messagePosition: 'center',
  },
  {
    id: 2,
    title: 'Burası Canvas! 🎨',
    description: 'Burada çizim yapacaksın. Parmağını sürükleyerek dene!',
    spotlight: {
      x: 20,
      y: 120,
      width: SCREEN_WIDTH - 140,
      height: SCREEN_HEIGHT - 300,
      borderRadius: 16,
    },
    messagePosition: 'bottom',
  },
  {
    id: 3,
    title: 'Araçlar 🛠️',
    description: 'Fırça, dolgu ve silgi! Hangisini kullanmak istersin?',
    spotlight: {
      x: SCREEN_WIDTH - 120,
      y: 200,
      width: 100,
      height: 200,
      borderRadius: 16,
    },
    messagePosition: 'top',
  },
  {
    id: 4,
    title: 'Renkler 🌈',
    description: 'İstediğin rengi seç! Daha fazla renk için 🎨 simgesine bas.',
    spotlight: {
      x: SCREEN_WIDTH - 120,
      y: 420,
      width: 100,
      height: 300,
      borderRadius: 16,
    },
    messagePosition: 'top',
  },
  {
    id: 5,
    title: 'Kaydet & Paylaş 💾',
    description: 'Eserini tamamladığında buraya basarak kaydedebilirsin!',
    spotlight: {
      x: 20,
      y: SCREEN_HEIGHT - 100,
      width: SCREEN_WIDTH - 40,
      height: 80,
      borderRadius: 16,
    },
    messagePosition: 'top',
  },
  {
    id: 6,
    title: 'Hazırsın! 🌟',
    description: 'Şimdi harika eserler yaratmanın zamanı!',
    messagePosition: 'center',
  },
];

export interface FirstUseGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * First use guide component
 */
export function FirstUseGuide({ onComplete, onSkip }: FirstUseGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Overlay coordination - first use guide has low priority
  const { request: requestOverlay, release: releaseOverlay } = useOverlay(
    'first_use_guide',
    'first_use_guide'
  );

  // Request overlay on mount
  useEffect(() => {
    requestOverlay();
    return () => releaseOverlay();
  }, [requestOverlay, releaseOverlay]);

  const step = GUIDE_STEPS[currentStep];
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for spotlight
    if (step.spotlight) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNext = () => {
    if (!isLastStep) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await markGuideComplete();
    releaseOverlay(); // Release overlay before closing
    onSkip();
  };

  const handleComplete = async () => {
    await markGuideComplete();
    releaseOverlay(); // Release overlay before closing
    onComplete();
  };

  const markGuideComplete = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      console.error('[FirstUseGuide] Failed to save completion:', error);
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Darkened background with spotlight hole */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        {/* Dark overlay */}
        <View style={styles.darkOverlay} />

        {/* Spotlight (clear area) */}
        {step.spotlight && (
          <Animated.View
            style={[
              styles.spotlight,
              {
                left: step.spotlight.x,
                top: step.spotlight.y,
                width: step.spotlight.width,
                height: step.spotlight.height,
                borderRadius: step.spotlight.borderRadius || 0,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Message card */}
      <Animated.View
        style={[
          styles.messageCard,
          getMessagePosition(step.messagePosition, step.spotlight),
          { opacity: fadeAnim },
        ]}
      >
        {/* Progress indicator */}
        <View style={styles.progressDots}>
          {GUIDE_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
                index < currentStep && styles.dotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          {!isLastStep && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Atla</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNext}
            style={[styles.nextButton, isLastStep && styles.nextButtonComplete]}
          >
            <Text style={styles.nextText}>{isLastStep ? 'Başla! 🚀' : 'İleri →'}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if guide should be shown
 */
export async function shouldShowFirstUseGuide(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(STORAGE_KEY);
    return completed !== 'true';
  } catch (error) {
    console.error('[FirstUseGuide] Failed to check status:', error);
    return true;
  }
}

/**
 * Reset guide (for testing)
 */
export async function resetFirstUseGuide(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[FirstUseGuide] Failed to reset:', error);
  }
}

/**
 * Calculate message card position
 */
function getMessagePosition(position: 'top' | 'bottom' | 'center', spotlight?: SpotlightRegion) {
  const CARD_HEIGHT = 200;

  switch (position) {
    case 'top':
      if (spotlight) {
        return {
          top: Math.max(20, spotlight.y - CARD_HEIGHT - 20),
        };
      }
      return { top: 80 };

    case 'bottom':
      if (spotlight) {
        return {
          top: Math.min(SCREEN_HEIGHT - CARD_HEIGHT - 20, spotlight.y + spotlight.height + 20),
        };
      }
      return { bottom: 80 };

    case 'center':
      return {
        top: (SCREEN_HEIGHT - CARD_HEIGHT) / 2,
      };
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: zIndex.modal,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: Colors.primary.sunset,
    ...shadows.colored(Colors.primary.sunset),
  },
  messageCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    ...shadows.lg,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: Colors.primary.sunset,
    width: 24,
  },
  dotCompleted: {
    backgroundColor: '#6BCB77',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral.darkest,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.neutral.medium,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary.sunset,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonComplete: {
    backgroundColor: '#6BCB77',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
});
