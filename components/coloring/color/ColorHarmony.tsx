/**
 * 🎨 Color Harmony Engine
 *
 * Professional color theory implementation for harmonious color suggestions.
 *
 * Features:
 * - Complementary colors (opposite on wheel)
 * - Analogous colors (adjacent on wheel)
 * - Triadic colors (equidistant on wheel)
 * - Split-complementary colors
 * - Tetradic/square colors
 * - Warm/cool color temperature analysis
 * - Real-time harmony visualization
 * - Child-friendly color suggestions
 *
 * Color Theory Reference:
 * - Based on Johannes Itten's color theory
 * - HSL color space for intuitive manipulation
 * - Khroma AI-inspired palette generation
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { shadows, textShadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

// ============================================================================
// TYPES
// ============================================================================

export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic';

export interface HarmonyResult {
  type: HarmonyType;
  name: string;
  nameTr: string;
  description: string;
  descriptionTr: string;
  colors: string[];
  emoji: string;
}

export interface ColorHarmonyProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
  onHarmonySelect?: (harmony: HarmonyResult) => void;
}

// ============================================================================
// COLOR UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hex to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Rotate hue by degrees
 */
function rotateHue(hex: string, degrees: number): string {
  const hsl = hexToHsl(hex);
  const newHue = (hsl.h + degrees + 360) % 360;
  return hslToHex(newHue, hsl.s, hsl.l);
}

/**
 * Adjust saturation
 */
function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  const newSat = Math.max(0, Math.min(100, hsl.s + amount));
  return hslToHex(hsl.h, newSat, hsl.l);
}

/**
 * Adjust lightness
 */
function adjustLightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  const newLight = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex(hsl.h, hsl.s, newLight);
}

/**
 * Determine if color is warm or cool
 */
function isWarmColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  // Warm colors: red, orange, yellow (roughly 0-60 and 300-360)
  return (hsl.h >= 0 && hsl.h <= 60) || hsl.h >= 300;
}

/**
 * Get color temperature label
 */
function getColorTemperature(hex: string): { label: string; labelTr: string; emoji: string } {
  if (isWarmColor(hex)) {
    return { label: 'Warm', labelTr: 'Sıcak', emoji: '🔥' };
  }
  return { label: 'Cool', labelTr: 'Soğuk', emoji: '❄️' };
}

// ============================================================================
// HARMONY GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate complementary colors (180° apart)
 */
function generateComplementary(baseColor: string): HarmonyResult {
  return {
    type: 'complementary',
    name: 'Complementary',
    nameTr: 'Tamamlayıcı',
    description: 'Colors opposite on the wheel create strong contrast',
    descriptionTr: 'Renk tekerleğinde karşıt renkler güçlü kontrast yaratır',
    colors: [baseColor, rotateHue(baseColor, 180)],
    emoji: '🔄',
  };
}

/**
 * Generate analogous colors (30° apart)
 */
function generateAnalogous(baseColor: string): HarmonyResult {
  return {
    type: 'analogous',
    name: 'Analogous',
    nameTr: 'Benzer',
    description: 'Adjacent colors create a harmonious, unified look',
    descriptionTr: 'Yan yana renkler uyumlu ve birleşik bir görünüm yaratır',
    colors: [rotateHue(baseColor, -30), baseColor, rotateHue(baseColor, 30)],
    emoji: '🌈',
  };
}

/**
 * Generate triadic colors (120° apart)
 */
function generateTriadic(baseColor: string): HarmonyResult {
  return {
    type: 'triadic',
    name: 'Triadic',
    nameTr: 'Üçlü',
    description: 'Three colors evenly spaced create vibrant combinations',
    descriptionTr: 'Eşit aralıklı üç renk canlı kombinasyonlar yaratır',
    colors: [baseColor, rotateHue(baseColor, 120), rotateHue(baseColor, 240)],
    emoji: '🔺',
  };
}

/**
 * Generate split-complementary colors
 */
function generateSplitComplementary(baseColor: string): HarmonyResult {
  return {
    type: 'split-complementary',
    name: 'Split-Complementary',
    nameTr: 'Bölünmüş Tamamlayıcı',
    description: 'Base color plus two colors adjacent to its complement',
    descriptionTr: 'Ana renk ve tamamlayıcısının yanındaki iki renk',
    colors: [baseColor, rotateHue(baseColor, 150), rotateHue(baseColor, 210)],
    emoji: '✨',
  };
}

/**
 * Generate tetradic/square colors (90° apart)
 */
function generateTetradic(baseColor: string): HarmonyResult {
  return {
    type: 'tetradic',
    name: 'Tetradic',
    nameTr: 'Dörtlü',
    description: 'Four colors forming a rectangle on the wheel',
    descriptionTr: 'Renk tekerleğinde dikdörtgen oluşturan dört renk',
    colors: [
      baseColor,
      rotateHue(baseColor, 90),
      rotateHue(baseColor, 180),
      rotateHue(baseColor, 270),
    ],
    emoji: '🔷',
  };
}

/**
 * Generate monochromatic variations
 */
function generateMonochromatic(baseColor: string): HarmonyResult {
  return {
    type: 'monochromatic',
    name: 'Monochromatic',
    nameTr: 'Tek Renk',
    description: 'Different shades and tints of one color',
    descriptionTr: 'Tek rengin farklı tonları ve açıklıkları',
    colors: [
      adjustLightness(baseColor, -20),
      adjustLightness(baseColor, -10),
      baseColor,
      adjustLightness(baseColor, 10),
      adjustLightness(baseColor, 20),
    ],
    emoji: '🎯',
  };
}

/**
 * Get all harmonies for a base color
 */
export function getAllHarmonies(baseColor: string): HarmonyResult[] {
  return [
    generateComplementary(baseColor),
    generateAnalogous(baseColor),
    generateTriadic(baseColor),
    generateSplitComplementary(baseColor),
    generateTetradic(baseColor),
    generateMonochromatic(baseColor),
  ];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ColorHarmony({ baseColor, onColorSelect, onHarmonySelect }: ColorHarmonyProps) {
  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyType>('complementary');
  const harmonies = useMemo(() => getAllHarmonies(baseColor), [baseColor]);
  const temperature = useMemo(() => getColorTemperature(baseColor), [baseColor]);

  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Initialize scale animations
  useEffect(() => {
    harmonies.forEach(harmony => {
      if (!scaleAnims[harmony.type]) {
        scaleAnims[harmony.type] = new Animated.Value(0);
      }
      Animated.spring(scaleAnims[harmony.type], {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [harmonies]);

  // Handle harmony type selection
  const handleHarmonySelect = (harmony: HarmonyResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHarmony(harmony.type);
    onHarmonySelect?.(harmony);
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onColorSelect(color);
  };

  const currentHarmony = harmonies.find(h => h.type === selectedHarmony);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Renk Uyumu</Text>
        <View style={styles.temperatureBadge}>
          <Text style={styles.temperatureEmoji}>{temperature.emoji}</Text>
          <Text style={styles.temperatureText}>{temperature.labelTr}</Text>
        </View>
      </View>

      {/* Base Color Display */}
      <View style={styles.baseColorSection}>
        <Text style={styles.sectionLabel}>Ana Renk</Text>
        <View style={[styles.baseColorBox, { backgroundColor: baseColor }]}>
          <Text style={styles.baseColorHex}>{baseColor.toUpperCase()}</Text>
        </View>
      </View>

      {/* Harmony Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.harmonyTypesScroll}
        contentContainerStyle={styles.harmonyTypesContent}
      >
        {harmonies.map(harmony => (
          <TouchableOpacity
            key={harmony.type}
            style={[
              styles.harmonyTypeButton,
              selectedHarmony === harmony.type && styles.harmonyTypeButtonActive,
            ]}
            onPress={() => handleHarmonySelect(harmony)}
            activeOpacity={0.8}
          >
            <Text style={styles.harmonyTypeEmoji}>{harmony.emoji}</Text>
            <Text
              style={[
                styles.harmonyTypeText,
                selectedHarmony === harmony.type && styles.harmonyTypeTextActive,
              ]}
            >
              {harmony.nameTr}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Harmony Colors */}
      {currentHarmony && (
        <View style={styles.harmonySection}>
          <Text style={styles.harmonyDescription}>{currentHarmony.descriptionTr}</Text>

          <View style={styles.harmonyColors}>
            {currentHarmony.colors.map((color, index) => (
              <Animated.View
                key={`${currentHarmony.type}-${index}`}
                style={{
                  transform: [{ scale: scaleAnims[currentHarmony.type] || new Animated.Value(1) }],
                }}
              >
                <TouchableOpacity
                  style={[styles.harmonyColorBox, { backgroundColor: color }]}
                  onPress={() => handleColorSelect(color)}
                  activeOpacity={0.8}
                >
                  <View style={styles.harmonyColorLabel}>
                    <Text style={styles.harmonyColorHex}>{color.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Suggestions */}
      <View style={styles.suggestionsSection}>
        <Text style={styles.sectionLabel}>💡 Hızlı Öneriler</Text>
        <View style={styles.suggestionsRow}>
          {/* Lighter */}
          <TouchableOpacity
            style={[styles.suggestionBox, { backgroundColor: adjustLightness(baseColor, 15) }]}
            onPress={() => handleColorSelect(adjustLightness(baseColor, 15))}
          >
            <Text style={styles.suggestionText}>Açık</Text>
          </TouchableOpacity>

          {/* Base */}
          <View
            style={[
              styles.suggestionBox,
              styles.suggestionBoxActive,
              { backgroundColor: baseColor },
            ]}
          >
            <Text style={styles.suggestionText}>Ana</Text>
          </View>

          {/* Darker */}
          <TouchableOpacity
            style={[styles.suggestionBox, { backgroundColor: adjustLightness(baseColor, -15) }]}
            onPress={() => handleColorSelect(adjustLightness(baseColor, -15))}
          >
            <Text style={styles.suggestionText}>Koyu</Text>
          </TouchableOpacity>

          {/* More Saturated */}
          <TouchableOpacity
            style={[styles.suggestionBox, { backgroundColor: adjustSaturation(baseColor, 20) }]}
            onPress={() => handleColorSelect(adjustSaturation(baseColor, 20))}
          >
            <Text style={styles.suggestionText}>Canlı</Text>
          </TouchableOpacity>

          {/* Less Saturated */}
          <TouchableOpacity
            style={[styles.suggestionBox, { backgroundColor: adjustSaturation(baseColor, -20) }]}
            onPress={() => handleColorSelect(adjustSaturation(baseColor, -20))}
          >
            <Text style={styles.suggestionText}>Pastel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// COMPACT VERSION FOR INLINE USE
// ============================================================================

export function ColorHarmonyCompact({
  baseColor,
  onColorSelect,
}: Omit<ColorHarmonyProps, 'onHarmonySelect'>) {
  const complementary = rotateHue(baseColor, 180);
  const analogous1 = rotateHue(baseColor, -30);
  const analogous2 = rotateHue(baseColor, 30);
  const triadic1 = rotateHue(baseColor, 120);
  const triadic2 = rotateHue(baseColor, 240);

  const suggestedColors = [complementary, analogous1, analogous2, triadic1, triadic2];

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactTitle}>🎨 Uyumlu Renkler</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactScroll}
      >
        {suggestedColors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.compactColorBox, { backgroundColor: color }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onColorSelect(color);
            }}
            activeOpacity={0.8}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.darkest,
  },
  temperatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  temperatureEmoji: {
    fontSize: 14,
  },
  temperatureText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },

  // Base Color
  baseColorSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.light,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  baseColorBox: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  baseColorHex: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral.white,
    ...textShadows.md,
  },

  // Harmony Types
  harmonyTypesScroll: {
    marginBottom: 16,
    marginHorizontal: -16,
  },
  harmonyTypesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  harmonyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lightest,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  harmonyTypeButtonActive: {
    backgroundColor: Colors.neutral.darkest,
  },
  harmonyTypeEmoji: {
    fontSize: 14,
  },
  harmonyTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },
  harmonyTypeTextActive: {
    color: Colors.neutral.white,
  },

  // Harmony Colors
  harmonySection: {
    marginBottom: 16,
  },
  harmonyDescription: {
    fontSize: 13,
    color: Colors.neutral.medium,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  harmonyColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  harmonyColorBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'flex-end',
    ...shadows.sm,
  },
  harmonyColorLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 4,
    alignItems: 'center',
  },
  harmonyColorHex: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.neutral.darkest,
    fontFamily: 'monospace',
  },

  // Suggestions
  suggestionsSection: {
    marginTop: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  suggestionBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  suggestionBoxActive: {
    borderWidth: 2,
    borderColor: Colors.neutral.darkest,
  },
  suggestionText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.neutral.white,
    ...textShadows.md,
  },

  // Compact Version
  compactContainer: {
    marginVertical: 8,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.medium,
    marginBottom: 8,
  },
  compactScroll: {
    gap: 8,
  },
  compactColorBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    ...shadows.xs,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  hexToHsl,
  hslToHex,
  rotateHue,
  adjustSaturation,
  adjustLightness,
  isWarmColor,
  getColorTemperature,
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateSplitComplementary,
  generateTetradic,
  generateMonochromatic,
};
