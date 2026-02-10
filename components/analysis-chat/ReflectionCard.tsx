/**
 * Reflection Card Component
 *
 * Displays reflection prompts for parents
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronRight, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import type { ReflectionPrompt } from '@/types/analysis';

interface ReflectionCardProps {
  prompts: ReflectionPrompt[];
  onSelect: (question: string) => void;
  onDismiss: () => void;
}

export function ReflectionCard({ prompts, onSelect, onDismiss }: ReflectionCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const currentPrompt = prompts[currentIndex];

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(currentPrompt.question);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!currentPrompt) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#F5F3FF', '#EDE9FE']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={18} color={Colors.secondary.lavender} />
            <Text style={styles.headerTitle}>Yansıtma Sorusu</Text>
          </View>
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <X size={18} color={Colors.neutral.medium} />
          </Pressable>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.emoji}>{currentPrompt.emoji}</Text>
          <Text style={styles.question}>{currentPrompt.question}</Text>
        </View>

        {/* Category Tag */}
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>
            {getCategoryLabel(currentPrompt.category)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleSelect}
            style={({ pressed }) => [
              styles.answerButton,
              pressed && styles.answerButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
              style={styles.answerButtonGradient}
            >
              <Text style={styles.answerButtonText}>Bu Soruyu Cevapla</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <Text style={styles.nextButtonText}>Diğer Soru</Text>
            <ChevronRight size={16} color={Colors.neutral.medium} />
          </Pressable>
        </View>

        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {prompts.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function getCategoryLabel(category: ReflectionPrompt['category']): string {
  switch (category) {
    case 'observation':
      return 'Gözlem';
    case 'emotional':
      return 'Duygusal';
    case 'developmental':
      return 'Gelişimsel';
    case 'action':
      return 'Eylem';
    default:
      return 'Genel';
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing['4'],
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    padding: spacing['4'],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  headerTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  emoji: {
    fontSize: 28,
    marginTop: 2,
  },
  question: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
    lineHeight: 24,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    marginBottom: spacing['4'],
  },
  categoryText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  actions: {
    gap: spacing['2'],
  },
  answerButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  answerButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  answerButtonGradient: {
    paddingVertical: spacing['3'],
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  answerButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2'],
    gap: spacing['1'],
  },
  nextButtonPressed: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2'],
    marginTop: spacing['3'],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
  },
  dotActive: {
    backgroundColor: Colors.secondary.lavender,
    width: 18,
  },
});
