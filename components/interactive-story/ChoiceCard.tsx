/**
 * ChoiceCard - Interaktif hikaye secim karti
 *
 * Cocuklarin hikaye akisini belirledigi secim kartlari.
 * Buyuk, dokunulabilir ve animasyonlu tasarim.
 */

import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { shadows } from '@/constants/design-system';
import { ChoiceOption, TRAIT_DEFINITIONS } from '@/types/InteractiveStory';
import { Colors } from '@/constants/colors';

interface ChoiceCardProps {
  option: ChoiceOption;
  onSelect: () => void;
  isSelected: boolean;
  disabled: boolean;
  index: number;
}

// Kart renk paleti
const CARD_GRADIENTS: string[][] = [
  ['#9333EA', '#7C3AED'], // Mor
  ['#3B82F6', '#2563EB'], // Mavi
  ['#10B981', '#059669'], // Yesil
  [Colors.semantic.amber, '#D97706'], // Turuncu
  ['#EC4899', '#DB2777'], // Pembe
];

export function ChoiceCard({ option, onSelect, isSelected, disabled, index }: ChoiceCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const _traitInfo = TRAIT_DEFINITIONS[option.trait];
  const gradientColors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    if (disabled) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Secim animasyonu
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Pariltis animasyonu
    Animated.sequence([
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.pressable}
      >
        <LinearGradient
          colors={
            isSelected ? ['#22C55E', '#16A34A'] : (gradientColors as [string, string, ...string[]])
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, isSelected && styles.selectedGradient]}
        >
          {/* Emoji / Icon */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </View>

          {/* Metin */}
          <Text style={styles.text}>{option.text}</Text>

          {/* Secildi isareti */}
          {isSelected && (
            <Animated.View
              style={[
                styles.checkmark,
                {
                  opacity: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.7],
                  }),
                },
              ]}
            >
              <Text style={styles.checkmarkText}>✓</Text>
            </Animated.View>
          )}

          {/* Pariltis efekti */}
          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkleAnim,
                transform: [
                  {
                    scale: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
    minHeight: 140,
    maxWidth: 160,
  },
  pressable: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedGradient: {
    borderWidth: 3,
    borderColor: Colors.neutral.white,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
  },
  text: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sparkle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  },
  sparkleText: {
    fontSize: 40,
  },
});

export default ChoiceCard;
