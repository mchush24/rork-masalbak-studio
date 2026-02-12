/**
 * ChoiceScreen - Tam ekran secim arayuzu
 *
 * Karakter soruyu sorar, cocuk seceneklerden birini secer.
 * Animasyonlu ve cocuk dostu tasarim.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChoiceCard } from './ChoiceCard';
import { ChoicePoint, InteractiveCharacter } from '@/types/InteractiveStory';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChoiceScreenProps {
  choicePoint: ChoicePoint;
  character: InteractiveCharacter;
  onChoiceMade: (optionId: string) => void;
  disabled?: boolean;
  currentChoice: number;
  totalChoices: number;
}

export function ChoiceScreen({
  choicePoint,
  character,
  onChoiceMade,
  disabled = false,
  currentChoice,
  totalChoices,
}: ChoiceScreenProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const characterBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Giris animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Karakter bounce animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(characterBounce, {
          toValue: -8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(characterBounce, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = async (optionId: string) => {
    if (disabled || selectedOptionId) return;

    setSelectedOptionId(optionId);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Kisa gecikme sonra secimi bildir
    setTimeout(() => {
      onChoiceMade(optionId);
    }, 600);
  };

  return (
    <LinearGradient colors={['#1E1B4B', '#312E81', '#4338CA']} style={styles.container}>
      {/* Ilerleme gostergesi */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          {Array.from({ length: totalChoices }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < currentChoice && styles.progressDotCompleted,
                i === currentChoice && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          Secim {currentChoice + 1} / {totalChoices}
        </Text>
      </View>

      {/* Karakter ve soru */}
      <Animated.View
        style={[
          styles.questionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Karakter avatar */}
        <Animated.View
          style={[styles.characterContainer, { transform: [{ translateY: characterBounce }] }]}
        >
          <View style={styles.characterAvatar}>
            <Text style={styles.characterEmoji}>{getCharacterEmoji(character.type)}</Text>
          </View>
          <Text style={styles.characterName}>{character.name}</Text>
        </Animated.View>

        {/* Soru balonu */}
        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>{choicePoint.question}</Text>
        </View>
      </Animated.View>

      {/* Secim kartlari */}
      <Animated.View
        style={[
          styles.choicesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 1.5) }],
          },
        ]}
      >
        <View style={styles.choicesRow}>
          {choicePoint.options.map((option, index) => (
            <ChoiceCard
              key={option.id}
              option={option}
              onSelect={() => handleSelect(option.id)}
              isSelected={selectedOptionId === option.id}
              disabled={disabled || selectedOptionId !== null}
              index={index}
            />
          ))}
        </View>
      </Animated.View>

      {/* Yardimci metin */}
      <Animated.Text style={[styles.helpText, { opacity: fadeAnim }]}>
        Bir secenek dokun
      </Animated.Text>

      {/* Dekoratif yildizlar */}
      <View style={styles.starsContainer}>
        {[...Array(6)].map((_, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.star,
              {
                left: `${10 + i * 15}%`,
                top: `${5 + (i % 3) * 10}%`,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3 + (i % 3) * 0.2],
                }),
              },
            ]}
          >
            ✦
          </Animated.Text>
        ))}
      </View>
    </LinearGradient>
  );
}

// Karakter turune gore emoji
function getCharacterEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    tilki: '🦊',
    tavsan: '🐰',
    ayi: '🐻',
    kedi: '🐱',
    kopek: '🐶',
    kus: '🐦',
    balik: '🐟',
    kelebek: '🦋',
    sincap: '🐿️',
    fil: '🐘',
    aslan: '🦁',
    panda: '🐼',
    penguen: '🐧',
    fare: '🐭',
    kirpi: '🦔',
    fox: '🦊',
    rabbit: '🐰',
    bear: '🐻',
    cat: '🐱',
    dog: '🐶',
  };
  return emojiMap[type.toLowerCase()] || '🌟';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotCompleted: {
    backgroundColor: '#22C55E',
  },
  progressDotCurrent: {
    backgroundColor: Colors.semantic.amber,
    width: 20,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  characterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  characterEmoji: {
    fontSize: 44,
  },
  characterName: {
    color: Colors.neutral.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxWidth: SCREEN_WIDTH - 60,
    // Konusma balonu ok
    position: 'relative',
  },
  questionText: {
    color: '#1E1B4B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  choicesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  helpText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    color: '#FCD34D',
    fontSize: 16,
  },
});

export default ChoiceScreen;
