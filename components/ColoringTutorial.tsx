/**
 * 🎨 Interactive Coloring Tutorial
 *
 * Features:
 * - Step-by-step guide
 * - Interactive spotlights
 * - Skip/Next navigation
 * - Beautiful animations
 * - AsyncStorage persistence
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { spacing, radius, shadows, typography, zIndex } from '@/constants/design-system';
import {
  Paintbrush,
  PaintBucket,
  Eraser,
  Palette,
  X,
  ArrowRight,
  CheckCircle,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TutorialStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Hoş Geldin! 🎨',
    description: 'Boyama macerası için hazır mısın? Hadi sana nasıl kullanacağını gösterelim!',
    icon: <CheckCircle size={48} color="#6BCB77" />,
  },
  {
    id: 2,
    title: 'Fırça Aracı 🖌️',
    description: 'Fırça ile özgürce çiz! Kalınlığı ayarlayabilir, istediğin gibi boyayabilirsin.',
    icon: <Paintbrush size={48} color={Colors.primary.sunset} />,
  },
  {
    id: 3,
    title: 'Dolgu Aracı 💧',
    description: 'Bir alana dokun, hızlıca dolsun! Büyük alanları doldurmanın en kolay yolu.',
    icon: <PaintBucket size={48} color="#4D96FF" />,
  },
  {
    id: 4,
    title: 'Silgi 🧹',
    description: 'Hata mı yaptın? Sorun değil! Silgi ile kolayca temizle.',
    icon: <Eraser size={48} color="#9D4EDD" />,
  },
  {
    id: 5,
    title: 'Renk Paleti 🎨',
    description:
      'Renkleri keşfet! 🌈 simgesine bas ve HSV renk tekerleği, şeffaflık ayarı ve favori renkler ile harikalar yarat!',
    icon: <Palette size={48} color="#FFD93D" />,
  },
  {
    id: 6,
    title: 'Fırça Ayarları ⚙️',
    description:
      'Fırça seçiliyken ⚙️ simgesine bas! Kalınlık, şeffaflık ve yumuşaklık ayarlarını keşfet.',
    icon: <Paintbrush size={48} color="#FF69B4" />,
  },
  {
    id: 7,
    title: 'Geri Al & İleri Al ↩️',
    description: 'Hata mı yaptın? Geri al butonu ile son işlemi geri al. İleri al ile tekrar yap!',
    icon: <CheckCircle size={48} color="#9D4EDD" />,
  },
  {
    id: 8,
    title: 'Kaydet & Paylaş 💾',
    description:
      "Eserini tamamladın mı? 'Kaydet ve Paylaş' butonuna bas! Harika bir kutlama seni bekliyor! 🎉",
    icon: <CheckCircle size={48} color="#6BCB77" />,
  },
  {
    id: 9,
    title: 'Hazırsın! 🌟',
    description: 'Artık her şeyi biliyorsun! Hadi başlayalım ve harika bir eser çıkaralım!',
    icon: <CheckCircle size={48} color="#6BCB77" />,
  },
];

const STORAGE_KEY = '@coloring_tutorial_completed';

type ColoringTutorialProps = {
  onComplete: () => void;
  onSkip: () => void;
};

export function ColoringTutorial({ onComplete, onSkip }: ColoringTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      // Fade out
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
    await markTutorialComplete();
    onSkip();
  };

  const handleComplete = async () => {
    await markTutorialComplete();
    onComplete();
  };

  const markTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Failed to save tutorial completion:', error);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <View style={styles.overlay}>
      {/* Dark Background */}
      <Pressable style={styles.backdrop} onPress={handleSkip} />

      {/* Tutorial Card */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[Colors.neutral.white, '#F8F9FA']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </Text>
          </View>

          {/* Skip Button */}
          {!isLastStep && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <X size={20} color={Colors.neutral.dark} />
              <Text style={styles.skipText}>Atla</Text>
            </Pressable>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>{step.icon}</View>

          {/* Title */}
          <Text style={styles.title}>{step.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{step.description}</Text>

          {/* Step Indicators */}
          <View style={styles.indicators}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep && styles.indicatorActive,
                  index < currentStep && styles.indicatorCompleted,
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {currentStep > 0 && (
              <Pressable onPress={() => setCurrentStep(currentStep - 1)} style={styles.backButton}>
                <Text style={styles.backText}>Geri</Text>
              </Pressable>
            )}

            <Pressable onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={isLastStep ? ['#6BCB77', '#4CAF50'] : ['#FF9B7A', '#FFB299']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextText}>{isLastStep ? 'Başla!' : 'İleri'}</Text>
                {!isLastStep && <ArrowRight size={20} color={Colors.neutral.white} />}
                {isLastStep && <CheckCircle size={20} color={Colors.neutral.white} />}
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// Helper function to check if tutorial should be shown
export async function shouldShowTutorial(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(STORAGE_KEY);
    return completed !== 'true';
  } catch (error) {
    console.error('Failed to check tutorial status:', error);
    return true; // Show tutorial on error to be safe
  }
}

// Helper function to reset tutorial (for testing)
export async function resetTutorial(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset tutorial:', error);
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: zIndex.modal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  card: {
    width: Math.min(SCREEN_WIDTH - spacing['8'], 400),
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    ...shadows.xl,
  },
  cardGradient: {
    padding: spacing['6'],
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['4'],
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.sunset,
    borderRadius: radius.full,
  },
  progressText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  skipButton: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: radius.lg,
  },
  skipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
  iconContainer: {
    marginVertical: spacing['6'],
    padding: spacing['4'],
    backgroundColor: 'rgba(255, 155, 122, 0.1)',
    borderRadius: radius.full,
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['3'],
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.lg,
    color: Colors.neutral.dark,
    textAlign: 'center',
    lineHeight: typography.size.lg * 1.5,
    marginBottom: spacing['6'],
    paddingHorizontal: spacing['2'],
  },
  indicators: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginBottom: spacing['6'],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.gray200,
  },
  indicatorActive: {
    backgroundColor: Colors.primary.sunset,
    width: 24,
  },
  indicatorCompleted: {
    backgroundColor: '#6BCB77',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing['3'],
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    backgroundColor: Colors.neutral.gray100,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  backText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
  },
  nextButton: {
    flex: 2,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  nextButtonGradient: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  nextText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
  },
});
