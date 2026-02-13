/**
 * 🌈 Gradient Picker
 *
 * 2-color linear gradient picker for advanced coloring.
 *
 * Features:
 * - 2-color gradient creation
 * - Preset gradients (sunset, ocean, rainbow, etc.)
 * - Direction control (horizontal, vertical, diagonal)
 * - Live preview
 * - Child-friendly UI with emojis
 *
 * Premium Feature:
 * - Only available on Advanced/Premium tier devices
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

import { typography } from '@/constants/design-system';
export interface GradientConfig {
  colors: [string, string];
  direction: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left';
  name: string;
}

export interface GradientPickerProps {
  onGradientSelect: (gradient: GradientConfig) => void;
  selectedGradient?: GradientConfig;
}

// ============================================================================
// PRESET GRADIENTS
// ============================================================================

const PRESET_GRADIENTS: GradientConfig[] = [
  {
    colors: ['#FF6B6B', '#FFD93D'],
    direction: 'horizontal',
    name: 'Gün Batımı 🌅',
  },
  {
    colors: ['#4D96FF', '#6BCB77'],
    direction: 'horizontal',
    name: 'Okyanus 🌊',
  },
  {
    colors: ['#9D4EDD', '#FF69B4'],
    direction: 'horizontal',
    name: 'Lavanta 💜',
  },
  {
    colors: ['#FF6B6B', '#9D4EDD'],
    direction: 'vertical',
    name: 'Gökkuşağı 🌈',
  },
  {
    colors: ['#FFD93D', '#6BCB77'],
    direction: 'diagonal-right',
    name: 'Bahar 🌸',
  },
  {
    colors: ['#4D96FF', '#FF69B4'],
    direction: 'diagonal-left',
    name: 'Şeker 🍬',
  },
  {
    colors: ['#FF9B7A', '#FFB299'],
    direction: 'horizontal',
    name: 'Şeftali 🍑',
  },
  {
    colors: ['#00D4FF', '#7ED99C'],
    direction: 'horizontal',
    name: 'Tropikal 🏝️',
  },
];

export function GradientPicker({ onGradientSelect, selectedGradient }: GradientPickerProps) {
  const [customColor1, _setCustomColor1] = useState('#FF6B6B');
  const [customColor2, _setCustomColor2] = useState('#4D96FF');
  const [customDirection, setCustomDirection] = useState<GradientConfig['direction']>('horizontal');

  const createCustomGradient = () => {
    const gradient: GradientConfig = {
      colors: [customColor1, customColor2],
      direction: customDirection,
      name: 'Özel Gradient',
    };
    onGradientSelect(gradient);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌈 Gradient Seç</Text>
        <Text style={styles.subtitle}>İki renk arasında geçiş</Text>
      </View>

      {/* Preset Gradients */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetsScroll}
        contentContainerStyle={styles.presetsContent}
      >
        {PRESET_GRADIENTS.map((gradient, index) => (
          <GradientPreset
            key={index}
            gradient={gradient}
            onSelect={() => onGradientSelect(gradient)}
            isSelected={
              selectedGradient?.colors[0] === gradient.colors[0] &&
              selectedGradient?.colors[1] === gradient.colors[1]
            }
          />
        ))}
      </ScrollView>

      {/* Custom Gradient Builder */}
      <View style={styles.customSection}>
        <Text style={styles.sectionTitle}>✨ Kendi Gradientini Yarat</Text>

        {/* Color selectors */}
        <View style={styles.colorSelectors}>
          <View style={styles.colorSelector}>
            <Text style={styles.colorLabel}>Renk 1</Text>
            <View style={[styles.colorBox, { backgroundColor: customColor1 }]} />
          </View>

          <Text style={styles.arrow}>→</Text>

          <View style={styles.colorSelector}>
            <Text style={styles.colorLabel}>Renk 2</Text>
            <View style={[styles.colorBox, { backgroundColor: customColor2 }]} />
          </View>
        </View>

        {/* Direction selector */}
        <View style={styles.directionSelector}>
          <Text style={styles.directionLabel}>Yön:</Text>
          <View style={styles.directionButtons}>
            <DirectionButton
              direction="horizontal"
              label="→"
              active={customDirection === 'horizontal'}
              onPress={() => setCustomDirection('horizontal')}
            />
            <DirectionButton
              direction="vertical"
              label="↓"
              active={customDirection === 'vertical'}
              onPress={() => setCustomDirection('vertical')}
            />
            <DirectionButton
              direction="diagonal-right"
              label="↘"
              active={customDirection === 'diagonal-right'}
              onPress={() => setCustomDirection('diagonal-right')}
            />
            <DirectionButton
              direction="diagonal-left"
              label="↙"
              active={customDirection === 'diagonal-left'}
              onPress={() => setCustomDirection('diagonal-left')}
            />
          </View>
        </View>

        {/* Preview and Create */}
        <View style={styles.previewContainer}>
          <LinearGradient
            colors={[customColor1, customColor2]}
            start={getGradientStart(customDirection)}
            end={getGradientEnd(customDirection)}
            style={styles.preview}
          />
          <Pressable style={styles.createButton} onPress={createCustomGradient}>
            <Text style={styles.createButtonText}>Kullan</Text>
          </Pressable>
        </View>
      </View>

      {/* Helper text */}
      <Text style={styles.helperText}>
        💡 İpucu: Gradientler büyük alanları boyamak için harikadır!
      </Text>
    </View>
  );
}

// ============================================================================
// GRADIENT PRESET COMPONENT
// ============================================================================

interface GradientPresetProps {
  gradient: GradientConfig;
  onSelect: () => void;
  isSelected: boolean;
}

function GradientPreset({ gradient, onSelect, isSelected }: GradientPresetProps) {
  return (
    <Pressable
      style={[styles.presetContainer, isSelected && styles.presetContainerSelected]}
      onPress={onSelect}
    >
      <LinearGradient
        colors={gradient.colors}
        start={getGradientStart(gradient.direction)}
        end={getGradientEnd(gradient.direction)}
        style={styles.presetGradient}
      />
      <Text style={styles.presetName}>{gradient.name}</Text>
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedCheck}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

// ============================================================================
// DIRECTION BUTTON
// ============================================================================

interface DirectionButtonProps {
  direction: GradientConfig['direction'];
  label: string;
  active: boolean;
  onPress: () => void;
}

function DirectionButton({ label, active, onPress }: DirectionButtonProps) {
  return (
    <Pressable
      style={[styles.directionButton, active && styles.directionButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.directionIcon, active && styles.directionIconActive]}>{label}</Text>
    </Pressable>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getGradientStart(direction: GradientConfig['direction']): { x: number; y: number } {
  switch (direction) {
    case 'horizontal':
      return { x: 0, y: 0.5 };
    case 'vertical':
      return { x: 0.5, y: 0 };
    case 'diagonal-right':
      return { x: 0, y: 0 };
    case 'diagonal-left':
      return { x: 1, y: 0 };
  }
}

function getGradientEnd(direction: GradientConfig['direction']): { x: number; y: number } {
  switch (direction) {
    case 'horizontal':
      return { x: 1, y: 0.5 };
    case 'vertical':
      return { x: 0.5, y: 1 };
    case 'diagonal-right':
      return { x: 1, y: 1 };
    case 'diagonal-left':
      return { x: 0, y: 1 };
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  presetsScroll: {
    marginBottom: 20,
  },
  presetsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  presetContainer: {
    width: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  presetContainerSelected: {
    borderColor: '#FF9B7A',
  },
  presetGradient: {
    width: '100%',
    height: 80,
  },
  presetName: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: Colors.neutral.white,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9B7A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontFamily: typography.family.bold,
  },
  customSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: '#333',
    marginBottom: 12,
  },
  colorSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  colorSelector: {
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
    marginHorizontal: 16,
  },
  directionSelector: {
    marginBottom: 16,
  },
  directionLabel: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: '#666',
    marginBottom: 8,
  },
  directionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  directionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  directionButtonActive: {
    backgroundColor: '#FF9B7A',
    borderColor: '#FF9B7A',
  },
  directionIcon: {
    fontSize: 18,
    color: '#666',
  },
  directionIconActive: {
    color: Colors.neutral.white,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: '#FF9B7A',
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
});
