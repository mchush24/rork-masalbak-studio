/**
 * ⭐ Favorite Colors
 *
 * 10-slot favorite colors manager with persistence.
 *
 * Features:
 * - 10 favorite color slots (2 rows × 5 columns)
 * - AsyncStorage persistence
 * - Add/remove colors
 * - Long-press to remove
 * - Visual feedback animations
 * - Empty slot placeholders with "+"
 * - Child-friendly UI with emojis
 *
 * Storage:
 * - Key: @renkioo_favorite_colors
 * - Format: string[] (up to 10 hex colors)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

import { typography } from '@/constants/design-system';
const STORAGE_KEY = '@renkioo_favorite_colors';
const MAX_FAVORITES = 10;

export interface FavoriteColorsProps {
  currentColor?: string;
  onColorSelect: (color: string) => void;
}

export function FavoriteColors({ currentColor, onColorSelect }: FavoriteColorsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from AsyncStorage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorite colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to save favorite colors:', error);
    }
  };

  // Add current color to favorites
  const addToFavorites = useCallback(() => {
    if (!currentColor) return;

    // Check if already in favorites
    if (favorites.includes(currentColor)) {
      Alert.alert('Zaten Favorilerde', 'Bu renk zaten favorilerinizde!');
      return;
    }

    // Check if favorites full
    if (favorites.length >= MAX_FAVORITES) {
      Alert.alert(
        'Favoriler Dolu',
        'En fazla 10 favori renk ekleyebilirsiniz. Bir rengi silmek için üzerine uzun basın.'
      );
      return;
    }

    const newFavorites = [...favorites, currentColor];
    saveFavorites(newFavorites);
  }, [currentColor, favorites]);

  // Remove color from favorites
  const removeFromFavorites = useCallback(
    (color: string) => {
      Alert.alert('Favorilerden Çıkar', `${color} rengini favorilerden çıkarmak istiyor musunuz?`, [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: () => {
            const newFavorites = favorites.filter(c => c !== color);
            saveFavorites(newFavorites);
          },
        },
      ]);
    },
    [favorites]
  );

  // Generate empty slots
  const slots = Array.from({ length: MAX_FAVORITES }, (_, i) => {
    const color = favorites[i];
    return { id: i, color };
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Favori Renkler</Text>
        <Text style={styles.subtitle}>
          {favorites.length}/{MAX_FAVORITES} slot dolu
        </Text>
      </View>

      {/* Color grid */}
      <View style={styles.grid}>
        {slots.map(slot => (
          <ColorSlot
            key={slot.id}
            color={slot.color}
            isSelected={slot.color === currentColor}
            onPress={() => {
              if (slot.color) {
                onColorSelect(slot.color);
              }
            }}
            onLongPress={() => {
              if (slot.color) {
                removeFromFavorites(slot.color);
              }
            }}
          />
        ))}
      </View>

      {/* Add current color button */}
      {currentColor && !favorites.includes(currentColor) && favorites.length < MAX_FAVORITES && (
        <Pressable style={styles.addButton} onPress={addToFavorites}>
          <Text style={styles.addButtonIcon}>⭐</Text>
          <Text style={styles.addButtonText}>Mevcut Rengi Ekle</Text>
          <View style={[styles.addButtonColor, { backgroundColor: currentColor }]} />
        </Pressable>
      )}

      {/* Helper text */}
      <Text style={styles.helperText}>
        💡 İpucu: Favori bir rengi silmek için üzerine uzun basın
      </Text>
    </View>
  );
}

// ============================================================================
// COLOR SLOT COMPONENT
// ============================================================================

interface ColorSlotProps {
  color?: string;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function ColorSlot({ color, isSelected, onPress, onLongPress }: ColorSlotProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.slot, isSelected && styles.slotSelected]}
    >
      <Animated.View style={[styles.slotInner, { transform: [{ scale: scaleAnim }] }]}>
        {color ? (
          <>
            <View style={[styles.colorPreview, { backgroundColor: color }]} />
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedCheck}>✓</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptyIcon}>+</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
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
    color: Colors.neutral.darkest,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.neutral.medium,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    paddingVertical: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  slot: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  slotSelected: {
    borderColor: Colors.primary.sunset,
  },
  slotInner: {
    width: '100%',
    height: '100%',
  },
  colorPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral.lightest,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 24,
    color: Colors.neutral.light,
    fontFamily: typography.family.regular,
  },
  selectedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.sunset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontFamily: typography.family.bold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary.sunset,
  },
  addButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
    marginRight: 8,
  },
  addButtonColor: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  helperText: {
    fontSize: 12,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
});
