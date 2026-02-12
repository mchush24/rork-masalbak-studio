/**
 * 🎨 PaintTubeRow - Scrollable Row of Paint Tubes
 *
 * Displays a collection of paint tubes with:
 * - Horizontal scrolling
 * - Category headers
 * - Texture indicator badges
 * - Selection state management
 */

import React, { useRef, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, ViewStyle } from 'react-native';
import { PaintTube } from './PaintTube';
import { TextureType } from '../effects/TextureShaders';
import { Colors } from '@/constants/colors';
import { spacing, typography } from '@/constants/design-system';

// ============================================================================
// TYPES
// ============================================================================

export interface PaintTubeColor {
  id: string;
  color: string;
  name: string;
  emoji?: string;
  hasGlitter?: boolean;
  texture?: TextureType;
  category?: string;
}

export interface PaintTubeRowProps {
  colors: PaintTubeColor[];
  selectedColorId?: string;
  onColorSelect?: (color: PaintTubeColor) => void;
  showCategories?: boolean;
  orientation?: 'horizontal' | 'vertical';
  tubeSize?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  title?: string;
}

// ============================================================================
// DEFAULT COLORS WITH GLITTER VARIANTS
// ============================================================================

export const DEFAULT_PAINT_COLORS: PaintTubeColor[] = [
  // Standard Colors
  { id: 'red', color: Colors.secondary.coral, name: 'Kırmızı', emoji: '🔴', category: 'Temel' },
  { id: 'orange', color: '#FFA500', name: 'Turuncu', emoji: '🟠', category: 'Temel' },
  { id: 'yellow', color: '#FFD93D', name: 'Sarı', emoji: '🟡', category: 'Temel' },
  { id: 'green', color: '#6BCB77', name: 'Yeşil', emoji: '🟢', category: 'Temel' },
  { id: 'blue', color: '#4D96FF', name: 'Mavi', emoji: '🔵', category: 'Temel' },
  { id: 'purple', color: '#9D4EDD', name: 'Mor', emoji: '🟣', category: 'Temel' },
  { id: 'pink', color: '#FF69B4', name: 'Pembe', emoji: '💗', category: 'Temel' },

  // Glitter Colors
  {
    id: 'glitter-gold',
    color: '#FFD700',
    name: 'Altın Sim',
    emoji: '✨',
    hasGlitter: true,
    texture: 'glitter',
    category: 'Simli',
  },
  {
    id: 'glitter-silver',
    color: '#C0C0C0',
    name: 'Gümüş Sim',
    emoji: '✨',
    hasGlitter: true,
    texture: 'glitter',
    category: 'Simli',
  },
  {
    id: 'glitter-pink',
    color: '#FF69B4',
    name: 'Pembe Sim',
    emoji: '✨',
    hasGlitter: true,
    texture: 'glitter',
    category: 'Simli',
  },
  {
    id: 'glitter-blue',
    color: '#4D96FF',
    name: 'Mavi Sim',
    emoji: '✨',
    hasGlitter: true,
    texture: 'glitter',
    category: 'Simli',
  },
  {
    id: 'glitter-purple',
    color: '#9D4EDD',
    name: 'Mor Sim',
    emoji: '✨',
    hasGlitter: true,
    texture: 'glitter',
    category: 'Simli',
  },

  // Pastel Colors
  { id: 'pastel-pink', color: '#FFB3D9', name: 'Pastel Pembe', emoji: '🌸', category: 'Pastel' },
  { id: 'pastel-blue', color: '#B3D9FF', name: 'Pastel Mavi', emoji: '💙', category: 'Pastel' },
  { id: 'pastel-yellow', color: '#FFF9B3', name: 'Pastel Sarı', emoji: '⭐', category: 'Pastel' },
  { id: 'pastel-green', color: '#B3FFD9', name: 'Pastel Yeşil', emoji: '🍃', category: 'Pastel' },
  { id: 'pastel-purple', color: '#E6B3FF', name: 'Pastel Mor', emoji: '🦄', category: 'Pastel' },

  // Natural Colors
  { id: 'brown', color: '#8B4513', name: 'Kahverengi', emoji: '🟤', category: 'Doğal' },
  { id: 'tan', color: '#D2B48C', name: 'Ten', emoji: '🤎', category: 'Doğal' },
  { id: 'olive', color: '#808000', name: 'Zeytin Yeşili', emoji: '🫒', category: 'Doğal' },
  { id: 'forest', color: '#228B22', name: 'Orman Yeşili', emoji: '🌲', category: 'Doğal' },
  { id: 'sky', color: '#87CEEB', name: 'Gök Mavisi', emoji: '🌤️', category: 'Doğal' },

  // Monochrome
  { id: 'black', color: '#2C2C2C', name: 'Siyah', emoji: '⚫', category: 'Nötr' },
  { id: 'gray', color: '#9E9E9E', name: 'Gri', emoji: '🔘', category: 'Nötr' },
  { id: 'white', color: Colors.neutral.white, name: 'Beyaz', emoji: '⚪', category: 'Nötr' },
];

// ============================================================================
// PAINT TUBE ROW COMPONENT
// ============================================================================

export function PaintTubeRow({
  colors = DEFAULT_PAINT_COLORS,
  selectedColorId,
  onColorSelect,
  showCategories = false,
  orientation = 'vertical',
  tubeSize = 'small',
  style,
  title,
}: PaintTubeRowProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Group colors by category
  const groupedColors = useCallback(() => {
    if (!showCategories) {
      return { Tümü: colors };
    }

    const groups: Record<string, PaintTubeColor[]> = {};
    colors.forEach(color => {
      const category = color.category || 'Diğer';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(color);
    });
    return groups;
  }, [colors, showCategories]);

  const handleColorSelect = (color: PaintTubeColor) => {
    onColorSelect?.(color);
  };

  const isHorizontal = orientation === 'horizontal';
  const groups = groupedColors();

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <ScrollView
        ref={scrollRef}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isHorizontal ? styles.horizontalContent : styles.verticalContent,
        ]}
      >
        {Object.entries(groups).map(([category, categoryColors]) => (
          <View key={category} style={styles.categoryContainer}>
            {showCategories && category !== 'Tümü' && (
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>
            )}

            <View
              style={[
                styles.tubesContainer,
                isHorizontal ? styles.tubesHorizontal : styles.tubesVertical,
              ]}
            >
              {categoryColors.map(color => (
                <PaintTube
                  key={color.id}
                  color={color.color}
                  isSelected={selectedColorId === color.id}
                  onPress={() => handleColorSelect(color)}
                  hasGlitter={color.hasGlitter}
                  texture={color.texture}
                  size={tubeSize}
                  style={styles.tube}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// COMPACT PAINT TUBE SELECTOR (for tool panel)
// ============================================================================

export interface CompactPaintTubeSelectorProps {
  colors?: PaintTubeColor[];
  selectedColorId?: string;
  onColorSelect?: (color: PaintTubeColor) => void;
  maxVisible?: number;
}

export function CompactPaintTubeSelector({
  colors = DEFAULT_PAINT_COLORS.slice(0, 12),
  selectedColorId,
  onColorSelect,
  maxVisible = 8,
}: CompactPaintTubeSelectorProps) {
  const visibleColors = colors.slice(0, maxVisible);

  return (
    <ScrollView style={styles.compactContainer} showsVerticalScrollIndicator={false}>
      {visibleColors.map(color => (
        <PaintTube
          key={color.id}
          color={color.color}
          isSelected={selectedColorId === color.id}
          onPress={() => onColorSelect?.(color)}
          hasGlitter={color.hasGlitter}
          texture={color.texture}
          size="small"
          style={styles.compactTube}
        />
      ))}
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    marginBottom: spacing['2'],
    paddingHorizontal: spacing['2'],
  },
  scrollContent: {
    paddingVertical: spacing['2'],
  },
  horizontalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing['2'],
  },
  verticalContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: spacing['1'],
  },
  categoryContainer: {
    marginBottom: spacing['3'],
  },
  categoryHeader: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    marginBottom: spacing['1'],
  },
  categoryTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tubesContainer: {
    flexWrap: 'wrap',
  },
  tubesHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  tubesVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing['1'],
  },
  tube: {
    marginVertical: spacing['1'],
  },
  // Compact selector styles
  compactContainer: {
    flex: 1,
  },
  compactTube: {
    marginVertical: spacing['1'],
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default PaintTubeRow;
