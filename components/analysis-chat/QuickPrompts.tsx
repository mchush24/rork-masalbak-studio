/**
 * Quick Prompts Component
 *
 * Displays quick prompt chips for starting conversations
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';

interface QuickPrompt {
  id: string;
  label: string;
  emoji?: string;
  question: string;
  category?: string;
}

interface QuickPromptsProps {
  prompts: QuickPrompt[];
  onSelect: (question: string) => void;
  isLoading?: boolean;
}

export function QuickPrompts({ prompts, onSelect, isLoading }: QuickPromptsProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && prompts.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, prompts.length]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary.sunset} />
        <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
      </View>
    );
  }

  if (prompts.length === 0) {
    return null;
  }

  const handleSelect = (prompt: QuickPrompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(prompt.question);
  };

  // Group prompts by category
  const categorizedPrompts = prompts.reduce((acc, prompt) => {
    const category = prompt.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(prompt);
    return acc;
  }, {} as Record<string, QuickPrompt[]>);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>Hızlı Sorular</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt, index) => (
          <PromptChip
            key={prompt.id}
            prompt={prompt}
            onPress={() => handleSelect(prompt)}
            delay={index * 50}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

interface PromptChipProps {
  prompt: QuickPrompt;
  onPress: () => void;
  delay?: number;
}

function PromptChip({ prompt, onPress, delay = 0 }: PromptChipProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getCategoryColor = (category?: string): [string, string] => {
    switch (category) {
      case 'general':
        return ['#F0F4FF', '#E8EFFF'];
      case 'action':
        return ['#F0FDF4', '#DCFCE7'];
      case 'emotional':
        return ['#FFF1F2', '#FFE4E6'];
      case 'developmental':
        return ['#FEF3C7', '#FDE68A'];
      case 'insight':
        return ['#F5F3FF', '#EDE9FE'];
      case 'professional':
        return ['#F0FDFA', '#CCFBF1'];
      default:
        return ['#FFFFFF', '#F8FAFC'];
    }
  };

  return (
    <Animated.View
      style={[
        styles.chipWrapper,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.chip,
          pressed && styles.chipPressed,
        ]}
      >
        <LinearGradient
          colors={getCategoryColor(prompt.category)}
          style={styles.chipGradient}
        >
          {prompt.emoji && <Text style={styles.chipEmoji}>{prompt.emoji}</Text>}
          <Text style={styles.chipLabel} numberOfLines={2}>
            {prompt.label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing['4'],
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
    marginBottom: spacing['2'],
    paddingHorizontal: spacing['1'],
  },
  scrollContent: {
    paddingHorizontal: spacing['1'],
    gap: spacing['2'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4'],
    gap: spacing['2'],
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  chipWrapper: {
    marginRight: spacing['2'],
  },
  chip: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.lg,
    gap: spacing['2'],
    minWidth: 120,
    maxWidth: 180,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
    flex: 1,
  },
});
