/**
 * MoodPalette - Ruh Haline Göre Renk Önerileri
 *
 * Phase 2: Mood-based Color Suggestions
 * - Farklı duygulara göre renk paletleri
 * - Çocuk dostu ikonlar ve açıklamalar
 * - Animasyonlu seçim deneyimi
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { shadows, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export type MoodType =
  | 'happy' // Mutlu
  | 'calm' // Sakin
  | 'energetic' // Enerjik
  | 'dreamy' // Hayalperest
  | 'nature' // Doğa
  | 'ocean' // Okyanus
  | 'sunset' // Gün Batımı
  | 'night' // Gece
  | 'rainbow' // Gökkuşağı
  | 'princess' // Prenses
  | 'superhero' // Süper Kahraman
  | 'dinosaur'; // Dinozor

interface MoodDefinition {
  id: MoodType;
  name: string;
  icon: string;
  description: string;
  colors: string[];
  gradient: [string, string];
}

interface MoodPaletteProps {
  onColorSelect: (color: string) => void;
  onPaletteSelect?: (colors: string[]) => void;
  onClose?: () => void;
}

// ============================================
// MOOD DEFINITIONS
// ============================================

const MOODS: MoodDefinition[] = [
  {
    id: 'happy',
    name: 'Mutlu',
    icon: '😊',
    description: 'Neşeli ve parlak renkler',
    colors: ['#FFD93D', '#FF6B6B', '#4ECDC4', '#FF9F43', '#F8B500', '#FF6B9D'],
    gradient: ['#FFD93D', '#FF6B6B'],
  },
  {
    id: 'calm',
    name: 'Sakin',
    icon: '😌',
    description: 'Huzurlu ve yumuşak tonlar',
    colors: ['#A8D8EA', '#AA96DA', '#FCBAD3', '#D4E2D4', '#B5C7D3', '#E8D5B7'],
    gradient: ['#A8D8EA', '#AA96DA'],
  },
  {
    id: 'energetic',
    name: 'Enerjik',
    icon: '🤩',
    description: 'Canlı ve dinamik renkler',
    colors: ['#FF0099', '#00FF88', '#00D4FF', '#FFE600', '#FF6600', '#8B00FF'],
    gradient: ['#FF0099', '#00D4FF'],
  },
  {
    id: 'dreamy',
    name: 'Hayalperest',
    icon: '🦄',
    description: 'Büyülü ve pastel tonlar',
    colors: ['#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3', '#B5EAD7'],
    gradient: ['#E0BBE4', '#FEC8D8'],
  },
  {
    id: 'nature',
    name: 'Doğa',
    icon: '🌿',
    description: 'Orman ve yaprak tonları',
    colors: ['#2D5A27', '#4A7C23', '#7CB342', '#A5D610', '#8D6E63', '#4E342E'],
    gradient: ['#4A7C23', '#2D5A27'],
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    icon: '🌊',
    description: 'Deniz ve dalga renkleri',
    colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A', '#48CAE4'],
    gradient: ['#0077B6', '#90E0EF'],
  },
  {
    id: 'sunset',
    name: 'Gün Batımı',
    icon: '🌅',
    description: 'Sıcak ve romantik tonlar',
    colors: ['#FF6B35', '#F7931E', '#FFB627', '#FF3366', '#C41E3A', '#FF8C00'],
    gradient: ['#FF6B35', '#FF3366'],
  },
  {
    id: 'night',
    name: 'Gece',
    icon: '🌙',
    description: 'Gizemli ve koyu tonlar',
    colors: ['#1A1A2E', '#16213E', '#0F3460', '#533483', '#E94560', '#FFD700'],
    gradient: ['#1A1A2E', '#533483'],
  },
  {
    id: 'rainbow',
    name: 'Gökkuşağı',
    icon: '🌈',
    description: 'Tüm gökkuşağı renkleri',
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'],
    gradient: ['#FF0000', '#8B00FF'],
  },
  {
    id: 'princess',
    name: 'Prenses',
    icon: '👑',
    description: 'Zarif ve ışıltılı renkler',
    colors: ['#FFB6C1', '#DDA0DD', '#E6E6FA', '#FFD700', '#FF69B4', '#BA55D3'],
    gradient: ['#FFB6C1', '#BA55D3'],
  },
  {
    id: 'superhero',
    name: 'Süper Kahraman',
    icon: '🦸',
    description: 'Güçlü ve cesur renkler',
    colors: ['#DC143C', '#0000CD', '#FFD700', '#000000', '#228B22', '#FF4500'],
    gradient: ['#DC143C', '#0000CD'],
  },
  {
    id: 'dinosaur',
    name: 'Dinozor',
    icon: '🦕',
    description: 'Tarih öncesi tonları',
    colors: ['#3D5A3D', '#6B8E23', '#8B4513', '#D2691E', '#556B2F', '#A0522D'],
    gradient: ['#3D5A3D', '#8B4513'],
  },
];

// ============================================
// COMPONENT
// ============================================

export function MoodPalette({ onColorSelect, onPaletteSelect, onClose }: MoodPaletteProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const scaleAnims = useRef(MOODS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMoodSelect = (mood: MoodDefinition, index: number) => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedMood(mood.id);

    // Auto-select first color or entire palette
    if (onPaletteSelect) {
      onPaletteSelect(mood.colors);
    }
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onClose?.();
    });
  };

  const selectedMoodData = selectedMood ? MOODS.find(m => m.id === selectedMood) : null;

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nasıl Hissediyorsun?</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Mood Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.moodGrid}
        showsVerticalScrollIndicator={false}
      >
        {MOODS.map((mood, index) => (
          <Animated.View key={mood.id} style={[{ transform: [{ scale: scaleAnims[index] }] }]}>
            <TouchableOpacity
              style={[
                styles.moodCard,
                selectedMood === mood.id && styles.moodCardSelected,
                {
                  backgroundColor: mood.gradient[0] + '20',
                  borderColor: mood.gradient[0],
                },
              ]}
              onPress={() => handleMoodSelect(mood, index)}
              activeOpacity={0.7}
            >
              {/* Gradient Background */}
              <View
                style={[
                  styles.moodGradient,
                  {
                    backgroundColor: mood.gradient[0],
                    opacity: selectedMood === mood.id ? 0.3 : 0.1,
                  },
                ]}
              />

              {/* Icon */}
              <Text style={styles.moodIcon}>{mood.icon}</Text>

              {/* Name */}
              <Text style={styles.moodName}>{mood.name}</Text>

              {/* Color Preview */}
              <View style={styles.colorPreview}>
                {mood.colors.slice(0, 4).map((color, i) => (
                  <View key={i} style={[styles.colorDot, { backgroundColor: color }]} />
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Selected Mood Palette */}
      {selectedMoodData && (
        <View style={styles.paletteSection}>
          <View style={styles.paletteHeader}>
            <Text style={styles.paletteTitle}>
              {selectedMoodData.icon} {selectedMoodData.name} Paleti
            </Text>
            <Text style={styles.paletteDescription}>{selectedMoodData.description}</Text>
          </View>

          <View style={styles.paletteColors}>
            {selectedMoodData.colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.paletteColor, { backgroundColor: color }]}
                onPress={() => handleColorSelect(color)}
                activeOpacity={0.8}
              >
                <View style={styles.colorShine} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Use All Colors Button */}
          <TouchableOpacity
            style={[styles.useAllButton, { backgroundColor: selectedMoodData.gradient[0] }]}
            onPress={() => onPaletteSelect?.(selectedMoodData.colors)}
          >
            <Text style={styles.useAllButtonText}>Tüm Paleti Kullan</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

// ============================================
// MOOD BUTTON (Trigger for the palette)
// ============================================

interface MoodButtonProps {
  onPress: () => void;
  size?: number;
}

export function MoodButton({ onPress, size = 44 }: MoodButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.moodButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={[styles.moodButtonIcon, { fontSize: size * 0.5 }]}>🎭</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================
// EXPORT MOOD DATA
// ============================================

export { MOODS };
export type { MoodDefinition };

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: '#1A1A1A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  moodCard: {
    width: (SCREEN_WIDTH * 0.85 - 48) / 3,
    aspectRatio: 0.9,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  moodCardSelected: {
    borderWidth: 3,
    ...shadows.sm,
  },
  moodGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  moodIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodName: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 3,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  paletteSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  paletteHeader: {
    marginBottom: 12,
  },
  paletteTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: '#1A1A1A',
  },
  paletteDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paletteColors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paletteColor: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#FFF',
    ...shadows.sm,
    overflow: 'hidden',
  },
  colorShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  useAllButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  useAllButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: typography.family.semibold,
  },
  moodButton: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  moodButtonIcon: {
    textAlign: 'center',
  },
});
