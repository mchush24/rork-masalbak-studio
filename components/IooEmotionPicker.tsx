/**
 * IooEmotionPicker Component
 *
 * Interactive emotion picker where children can select how they feel
 * Ioo mascot reacts to the selected emotion with animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { IooMascotFinal as IooMascot, IooMood } from './IooMascotFinal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Child-friendly emotion definitions
export interface Emotion {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: readonly [string, string];
  iooMood: IooMood;
  message: string;
  encouragement: string;
}

export const EMOTIONS: Emotion[] = [
  {
    id: 'happy',
    name: 'Mutlu',
    emoji: '😊',
    color: '#FFD93D',
    gradient: ['#FFF8E1', '#FFECB3'] as const,
    iooMood: 'happy',
    message: 'Harika! Mutlu olduğuna çok sevindim!',
    encouragement: 'Bu güzel gün devam etsin!',
  },
  {
    id: 'excited',
    name: 'Heyecanlı',
    emoji: '🤩',
    color: '#FF6B6B',
    gradient: ['#FFEBEE', '#FFCDD2'] as const,
    iooMood: 'excited',
    message: 'Vay canına! Ne heyecan verici!',
    encouragement: 'Bu enerjiyi seviyorum!',
  },
  {
    id: 'calm',
    name: 'Sakin',
    emoji: '😌',
    color: '#6BCB77',
    gradient: ['#E8F5E9', '#C8E6C9'] as const,
    iooMood: 'sleepy',
    message: 'Sakin hissetmek çok güzel...',
    encouragement: 'Huzurlu anların tadını çıkar!',
  },
  {
    id: 'curious',
    name: 'Meraklı',
    emoji: '🧐',
    color: '#4ECDC4',
    gradient: ['#E0F7FA', '#B2EBF2'] as const,
    iooMood: 'curious',
    message: 'Hmm, merak çok güzel bir duygu!',
    encouragement: 'Keşfetmeye devam et!',
  },
  {
    id: 'loved',
    name: 'Sevgi Dolu',
    emoji: '🥰',
    color: '#FF9EBF',
    gradient: ['#FCE4EC', '#F8BBD0'] as const,
    iooMood: 'love',
    message: 'Aww, ne tatlı! Ben de seni seviyorum!',
    encouragement: 'Sevgi her şeyi güzelleştirir!',
  },
  {
    id: 'tired',
    name: 'Yorgun',
    emoji: '😴',
    color: '#9E9E9E',
    gradient: ['#ECEFF1', '#CFD8DC'] as const,
    iooMood: 'sleepy',
    message: 'Dinlenmek istiyorsun, tamam mı?',
    encouragement: 'Biraz mola ver, yeniden güçlen!',
  },
  {
    id: 'sad',
    name: 'Üzgün',
    emoji: '😢',
    color: '#64B5F6',
    gradient: ['#E3F2FD', '#BBDEFB'] as const,
    iooMood: 'sleepy',
    message: 'Üzgün olman da tamam. Yanındayım.',
    encouragement: 'Her şey daha iyi olacak!',
  },
  {
    id: 'angry',
    name: 'Kızgın',
    emoji: '😤',
    color: '#FF7043',
    gradient: ['#FBE9E7', '#FFCCBC'] as const,
    iooMood: 'curious',
    message: 'Kızgın hissediyorsun, anlıyorum.',
    encouragement: 'Derin nefes al, sakinleş.',
  },
];

interface IooEmotionPickerProps {
  onEmotionSelect?: (emotion: Emotion) => void;
  showIoo?: boolean;
  size?: 'compact' | 'full';
  initialEmotion?: string;
}

export function IooEmotionPicker({
  onEmotionSelect,
  showIoo = true,
  size = 'full',
  initialEmotion,
}: IooEmotionPickerProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(
    initialEmotion ? EMOTIONS.find((e) => e.id === initialEmotion) || null : null
  );
  const [showMessage, setShowMessage] = useState(false);

  // Animation refs
  const messageAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(EMOTIONS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Initial entrance animation for cards
    cardAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        delay: index * 50,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  }, []);

  useEffect(() => {
    if (selectedEmotion) {
      setShowMessage(true);
      Animated.spring(messageAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [selectedEmotion]);

  const handleEmotionPress = (emotion: Emotion, index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Bounce animation on selected card
    Animated.sequence([
      Animated.timing(cardAnims[index], {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(cardAnims[index], {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    setSelectedEmotion(emotion);
    onEmotionSelect?.(emotion);
  };

  const isCompact = size === 'compact';

  return (
    <View style={styles.container}>
      {/* Ioo Mascot */}
      {showIoo && (
        <View style={styles.mascotSection}>
          <IooMascot
            size={isCompact ? 'medium' : 'large'}
            mood={selectedEmotion?.iooMood || 'curious'}
            animated
            showGlow
          />

          {/* Speech Bubble with Message */}
          {showMessage && selectedEmotion && (
            <Animated.View
              style={[
                styles.speechBubble,
                {
                  opacity: messageAnim,
                  transform: [
                    {
                      scale: messageAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.speechBubbleArrow} />
              <Text style={styles.speechText}>{selectedEmotion.message}</Text>
              <Text style={styles.encouragementText}>
                {selectedEmotion.encouragement}
              </Text>
            </Animated.View>
          )}
        </View>
      )}

      {/* Question */}
      <View style={styles.questionSection}>
        <Text style={styles.questionText}>Bugün nasıl hissediyorsun?</Text>
        <Text style={styles.questionSubtext}>
          Bir duygu seç, Ioo&apos;ya göster
        </Text>
      </View>

      {/* Emotion Grid */}
      <View style={[styles.emotionGrid, isCompact && styles.emotionGridCompact]}>
        {EMOTIONS.map((emotion, index) => (
          <Animated.View
            key={emotion.id}
            style={[
              { transform: [{ scale: cardAnims[index] }] },
              isCompact && styles.compactCardWrapper,
            ]}
          >
            <Pressable
              onPress={() => handleEmotionPress(emotion, index)}
              style={({ pressed }) => [
                styles.emotionCard,
                isCompact && styles.emotionCardCompact,
                selectedEmotion?.id === emotion.id && styles.emotionCardSelected,
                selectedEmotion?.id === emotion.id && {
                  borderColor: emotion.color,
                },
                pressed && styles.emotionCardPressed,
              ]}
            >
              <LinearGradient
                colors={emotion.gradient}
                style={[
                  styles.emotionGradient,
                  isCompact && styles.emotionGradientCompact,
                ]}
              >
                <Text style={[styles.emotionEmoji, isCompact && styles.emotionEmojiCompact]}>
                  {emotion.emoji}
                </Text>
                <Text
                  style={[
                    styles.emotionName,
                    isCompact && styles.emotionNameCompact,
                    { color: emotion.color },
                  ]}
                >
                  {emotion.name}
                </Text>

                {/* Selection indicator */}
                {selectedEmotion?.id === emotion.id && (
                  <View
                    style={[
                      styles.selectedIndicator,
                      { backgroundColor: emotion.color },
                    ]}
                  >
                    <Text style={styles.selectedCheck}>✓</Text>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Mascot Section
  mascotSection: {
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 200,
  },
  speechBubble: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    maxWidth: SCREEN_WIDTH * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  speechBubbleArrow: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFF',
  },
  speechText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Question Section
  questionSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  questionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Emotion Grid
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  emotionGridCompact: {
    gap: 8,
  },
  compactCardWrapper: {
    width: '30%',
  },

  // Emotion Card
  emotionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emotionCardCompact: {
    borderRadius: 16,
    borderWidth: 2,
  },
  emotionCardSelected: {
    borderWidth: 3,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  emotionCardPressed: {
    opacity: 0.9,
  },
  emotionGradient: {
    width: 90,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  emotionGradientCompact: {
    width: '100%',
    height: 80,
    padding: 8,
    gap: 4,
  },
  emotionEmoji: {
    fontSize: 36,
  },
  emotionEmojiCompact: {
    fontSize: 28,
  },
  emotionName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emotionNameCompact: {
    fontSize: 11,
  },

  // Selection Indicator
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default IooEmotionPicker;
