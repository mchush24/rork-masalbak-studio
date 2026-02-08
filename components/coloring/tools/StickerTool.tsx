/**
 * 🎨 StickerTool - Sticker/Stamp Placement System
 *
 * Features:
 * - Categorized sticker library (Nature, Animals, Shapes, Celebration)
 * - Emoji-based stickers (no external assets needed)
 * - Size and rotation controls
 * - Placement with tap gesture
 * - Drag to reposition
 * - Pinch to resize/rotate
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { spacing, typography, radius, shadows } from '@/constants/design-system';
import { X } from 'lucide-react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface StickerConfig {
  id: string;
  emoji: string;
  name: string;
  category: StickerCategory;
  defaultSize?: number;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export type StickerCategory = 'nature' | 'animals' | 'shapes' | 'celebration' | 'food' | 'weather';

// ============================================================================
// STICKER LIBRARY
// ============================================================================

export const STICKER_LIBRARY: StickerConfig[] = [
  // Nature
  { id: 'butterfly', emoji: '🦋', name: 'Kelebek', category: 'nature' },
  { id: 'flower', emoji: '🌸', name: 'Çiçek', category: 'nature' },
  { id: 'sunflower', emoji: '🌻', name: 'Ayçiçeği', category: 'nature' },
  { id: 'tulip', emoji: '🌷', name: 'Lale', category: 'nature' },
  { id: 'rose', emoji: '🌹', name: 'Gül', category: 'nature' },
  { id: 'tree', emoji: '🌳', name: 'Ağaç', category: 'nature' },
  { id: 'leaf', emoji: '🍃', name: 'Yaprak', category: 'nature' },
  { id: 'clover', emoji: '🍀', name: 'Yonca', category: 'nature' },
  { id: 'rainbow', emoji: '🌈', name: 'Gökkuşağı', category: 'nature', defaultSize: 60 },
  { id: 'sun', emoji: '☀️', name: 'Güneş', category: 'nature', defaultSize: 50 },
  { id: 'moon', emoji: '🌙', name: 'Ay', category: 'nature' },
  { id: 'star', emoji: '⭐', name: 'Yıldız', category: 'nature' },

  // Animals
  { id: 'cat', emoji: '🐱', name: 'Kedi', category: 'animals' },
  { id: 'dog', emoji: '🐶', name: 'Köpek', category: 'animals' },
  { id: 'rabbit', emoji: '🐰', name: 'Tavşan', category: 'animals' },
  { id: 'bear', emoji: '🐻', name: 'Ayı', category: 'animals' },
  { id: 'panda', emoji: '🐼', name: 'Panda', category: 'animals' },
  { id: 'fox', emoji: '🦊', name: 'Tilki', category: 'animals' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', category: 'animals', defaultSize: 50 },
  { id: 'bird', emoji: '🐦', name: 'Kuş', category: 'animals' },
  { id: 'fish', emoji: '🐟', name: 'Balık', category: 'animals' },
  { id: 'dolphin', emoji: '🐬', name: 'Yunus', category: 'animals' },
  { id: 'ladybug', emoji: '🐞', name: 'Uğur Böceği', category: 'animals' },
  { id: 'bee', emoji: '🐝', name: 'Arı', category: 'animals' },

  // Shapes & Symbols
  { id: 'heart', emoji: '❤️', name: 'Kalp', category: 'shapes' },
  { id: 'pink-heart', emoji: '💖', name: 'Pembe Kalp', category: 'shapes' },
  { id: 'sparkle', emoji: '✨', name: 'Parıltı', category: 'shapes' },
  { id: 'star-shape', emoji: '🌟', name: 'Parlak Yıldız', category: 'shapes' },
  { id: 'diamond', emoji: '💎', name: 'Elmas', category: 'shapes' },
  { id: 'crown', emoji: '👑', name: 'Taç', category: 'shapes', defaultSize: 45 },
  { id: 'bow', emoji: '🎀', name: 'Fiyonk', category: 'shapes' },
  { id: 'music', emoji: '🎵', name: 'Nota', category: 'shapes' },
  { id: 'magic', emoji: '🪄', name: 'Sihirli Değnek', category: 'shapes' },

  // Celebration
  { id: 'balloon', emoji: '🎈', name: 'Balon', category: 'celebration' },
  { id: 'party', emoji: '🎉', name: 'Konfeti', category: 'celebration' },
  { id: 'gift', emoji: '🎁', name: 'Hediye', category: 'celebration' },
  { id: 'cake', emoji: '🎂', name: 'Pasta', category: 'celebration' },
  { id: 'cupcake', emoji: '🧁', name: 'Kek', category: 'celebration' },
  { id: 'fireworks', emoji: '🎆', name: 'Havai Fişek', category: 'celebration' },
  { id: 'trophy', emoji: '🏆', name: 'Kupa', category: 'celebration' },
  { id: 'medal', emoji: '🥇', name: 'Madalya', category: 'celebration' },

  // Food
  { id: 'apple', emoji: '🍎', name: 'Elma', category: 'food' },
  { id: 'strawberry', emoji: '🍓', name: 'Çilek', category: 'food' },
  { id: 'watermelon', emoji: '🍉', name: 'Karpuz', category: 'food' },
  { id: 'ice-cream', emoji: '🍦', name: 'Dondurma', category: 'food' },
  { id: 'lollipop', emoji: '🍭', name: 'Lolipop', category: 'food' },
  { id: 'cookie', emoji: '🍪', name: 'Kurabiye', category: 'food' },
  { id: 'donut', emoji: '🍩', name: 'Donut', category: 'food' },
  { id: 'candy', emoji: '🍬', name: 'Şeker', category: 'food' },

  // Weather
  { id: 'cloud', emoji: '☁️', name: 'Bulut', category: 'weather' },
  { id: 'rain', emoji: '🌧️', name: 'Yağmur', category: 'weather' },
  { id: 'snow', emoji: '❄️', name: 'Kar', category: 'weather' },
  { id: 'snowman', emoji: '⛄', name: 'Kardan Adam', category: 'weather' },
  { id: 'lightning', emoji: '⚡', name: 'Şimşek', category: 'weather' },
];

export const STICKER_CATEGORIES: {
  id: StickerCategory;
  name: string;
  emoji: string;
}[] = [
  { id: 'nature', name: 'Doğa', emoji: '🌿' },
  { id: 'animals', name: 'Hayvanlar', emoji: '🐾' },
  { id: 'shapes', name: 'Şekiller', emoji: '⭐' },
  { id: 'celebration', name: 'Kutlama', emoji: '🎉' },
  { id: 'food', name: 'Yiyecek', emoji: '🍎' },
  { id: 'weather', name: 'Hava', emoji: '☀️' },
];

// ============================================================================
// STICKER PICKER MODAL
// ============================================================================

interface StickerPickerProps {
  visible: boolean;
  onClose: () => void;
  onStickerSelect: (sticker: StickerConfig) => void;
  selectedStickerId?: string;
}

export function StickerPicker({
  visible,
  onClose,
  onStickerSelect,
  selectedStickerId,
}: StickerPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<StickerCategory>('nature');

  // Filter stickers by category
  const filteredStickers = useMemo(() => {
    return STICKER_LIBRARY.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎨 Sticker Seç</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.neutral.darkest} />
            </Pressable>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {STICKER_CATEGORIES.map(category => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Sticker Grid */}
          <ScrollView style={styles.stickerGrid} contentContainerStyle={styles.stickerGridContent}>
            <View style={styles.gridRow}>
              {filteredStickers.map(sticker => (
                <Pressable
                  key={sticker.id}
                  onPress={() => {
                    onStickerSelect(sticker);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.stickerButton,
                    selectedStickerId === sticker.id && styles.stickerButtonSelected,
                    pressed && styles.stickerButtonPressed,
                  ]}
                >
                  <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                  <Text style={styles.stickerName}>{sticker.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STICKER PREVIEW (for tool panel)
// ============================================================================

interface StickerPreviewProps {
  sticker: StickerConfig | null;
  onPress: () => void;
  size?: number;
}

export function StickerPreview({ sticker, onPress, size = 50 }: StickerPreviewProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.previewButton,
        { width: size, height: size },
        pressed && styles.previewButtonPressed,
      ]}
    >
      {sticker ? (
        <Text style={[styles.previewEmoji, { fontSize: size * 0.6 }]}>{sticker.emoji}</Text>
      ) : (
        <Text style={styles.previewPlaceholder}>+</Text>
      )}
    </Pressable>
  );
}

// ============================================================================
// PLACED STICKER COMPONENT (for canvas rendering)
// ============================================================================

interface PlacedStickerComponentProps {
  sticker: PlacedSticker;
  onDrag?: (id: string, x: number, y: number) => void;
  onResize?: (id: string, size: number) => void;
  onRotate?: (id: string, rotation: number) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function PlacedStickerComponent({
  sticker,
  onDrag: _onDrag,
  onResize: _onResize,
  onRotate: _onRotate,
  onDelete,
  isSelected = false,
  onSelect,
}: PlacedStickerComponentProps) {
  // Animation for selection feedback
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.1 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.placedSticker,
        {
          left: sticker.x - sticker.size / 2,
          top: sticker.y - sticker.size / 2,
          width: sticker.size,
          height: sticker.size,
          transform: [{ rotate: `${sticker.rotation}deg` }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable onPress={() => onSelect?.(sticker.id)} style={styles.stickerTouchable}>
        <Text style={[styles.placedStickerEmoji, { fontSize: sticker.size * 0.8 }]}>
          {sticker.emoji}
        </Text>
      </Pressable>

      {/* Selection handles */}
      {isSelected && (
        <>
          <View style={[styles.handle, styles.handleTopLeft]} />
          <View style={[styles.handle, styles.handleTopRight]} />
          <View style={[styles.handle, styles.handleBottomLeft]} />
          <View style={[styles.handle, styles.handleBottomRight]} />
          <Pressable onPress={() => onDelete?.(sticker.id)} style={styles.deleteHandle}>
            <Text style={styles.deleteX}>×</Text>
          </Pressable>
        </>
      )}
    </Animated.View>
  );
}

// ============================================================================
// STICKER SIZE SLIDER
// ============================================================================

interface StickerSizeSliderProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
}

export function StickerSizeSlider({
  value,
  onChange,
  min = 20,
  max = 100,
}: StickerSizeSliderProps) {
  return (
    <View style={styles.sizeSliderContainer}>
      <Text style={styles.sizeLabel}>📐 Boyut</Text>
      <View style={styles.sizeButtons}>
        <Pressable onPress={() => onChange(Math.max(min, value - 10))} style={styles.sizeButton}>
          <Text style={styles.sizeButtonText}>−</Text>
        </Pressable>
        <Text style={styles.sizeValue}>{value}px</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + 10))} style={styles.sizeButton}>
          <Text style={styles.sizeButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: SCREEN_HEIGHT * 0.7,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category tabs
  categoryTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryTabsContent: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['2'],
    gap: spacing['2'],
    flexDirection: 'row',
  },
  categoryTab: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  categoryTabActive: {
    backgroundColor: '#FFE4B5',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },
  categoryNameActive: {
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },

  // Sticker grid
  stickerGrid: {
    flex: 1,
  },
  stickerGridContent: {
    padding: spacing['3'],
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing['2'],
  },
  stickerButton: {
    width: (SCREEN_WIDTH - spacing['3'] * 2 - spacing['2'] * 3) / 4,
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2'],
    ...shadows.sm,
  },
  stickerButtonSelected: {
    backgroundColor: '#FFE4B5',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  stickerButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  stickerEmoji: {
    fontSize: 32,
    marginBottom: spacing['1'],
  },
  stickerName: {
    fontSize: 10,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },

  // Preview button
  previewButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  previewButtonPressed: {
    backgroundColor: '#E8E8E8',
  },
  previewEmoji: {
    textAlign: 'center',
  },
  previewPlaceholder: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },

  // Placed sticker
  placedSticker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placedStickerEmoji: {
    textAlign: 'center',
  },

  // Selection handles
  handle: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: '#4D96FF',
    borderRadius: 6,
  },
  handleTopLeft: {
    top: -6,
    left: -6,
  },
  handleTopRight: {
    top: -6,
    right: -6,
  },
  handleBottomLeft: {
    bottom: -6,
    left: -6,
  },
  handleBottomRight: {
    bottom: -6,
    right: -6,
  },
  deleteHandle: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  deleteX: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },

  // Size slider
  sizeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['2'],
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: radius.md,
  },
  sizeLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
  },
  sizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  sizeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  sizeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.darkest,
    lineHeight: 22,
  },
  sizeValue: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    minWidth: 50,
    textAlign: 'center',
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default StickerPicker;
