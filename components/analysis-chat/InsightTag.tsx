/**
 * Insight Tag Component
 *
 * Clickable tag showing a referenced insight
 */

import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius } from '@/constants/design-system';
import type { Insight } from '@/types/analysis';

interface InsightTagProps {
  insight: Insight;
  index: number;
  onPress?: (index: number) => void;
}

export function InsightTag({ insight, index, onPress }: InsightTagProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(index);
  };

  const getStrengthColor = (strength: Insight['strength']): string => {
    switch (strength) {
      case 'strong':
        return Colors.secondary.grass;
      case 'moderate':
        return Colors.secondary.sunshine;
      case 'weak':
        return Colors.semantic.warning;
      default:
        return Colors.neutral.medium;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        { borderColor: getStrengthColor(insight.strength) },
        pressed && styles.pressed,
      ]}
    >
      <Lightbulb size={12} color={getStrengthColor(insight.strength)} />
      <Text style={styles.text} numberOfLines={1}>
        {insight.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing['1'],
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    maxWidth: 150,
  },
});
