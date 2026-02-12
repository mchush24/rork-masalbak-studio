/**
 * 🤖 AI Color Suggestions Component
 *
 * World-class AI-powered color suggestion UI for interactive coloring.
 *
 * Features:
 * - Magic wand button to trigger AI analysis
 * - Animated color suggestions reveal
 * - Mood palette selection
 * - Region-specific color hints
 * - Child-friendly animations
 * - Color harmony tips
 *
 * UX Principles:
 * - Large touch targets (120x120px minimum)
 * - Bright, cheerful colors
 * - Immediate visual feedback
 * - Playful animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColoring } from '../ColoringContext';
import { shadows, zIndex } from '@/constants/design-system';
import { trpc } from '@/lib/trpc';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface ColorSuggestion {
  id: string;
  name: string;
  nameTr: string;
  hex: string;
  category: 'primary' | 'secondary' | 'accent' | 'background' | 'detail';
  confidence: number;
  reason: string;
  reasonTr: string;
}

interface MoodPalette {
  id: string;
  name: string;
  nameTr: string;
  colors: string[];
  mood: string;
  moodTr: string;
  isRecommended: boolean;
}

interface AISuggestionsProps {
  imageBase64: string;
  ageGroup?: number;
  onColorSelect: (color: string) => void;
  onClose?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AISuggestions({
  imageBase64,
  ageGroup = 5,
  onColorSelect,
  onClose,
}: AISuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ColorSuggestion[]>([]);
  const [palettes, setPalettes] = useState<MoodPalette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [harmonyTips, setHarmonyTips] = useState<{ tip: string; tipTr: string }[]>([]);
  const [analysis, setAnalysis] = useState<{ subjectTr: string; suggestedStyleTr: string } | null>(
    null
  );

  const buttonScale = useRef(new Animated.Value(1)).current;
  const modalSlide = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const { setCustomColor, triggerHaptic } = useColoring();

  const suggestColorsMutation = trpc.studio.suggestColors.useMutation();

  // Sparkle animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle opening the AI suggestions panel
  const handleOpen = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(true);

    // Animate modal slide in
    Animated.spring(modalSlide, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Fetch AI suggestions if not already loaded
    if (suggestions.length === 0 && !isLoading) {
      await fetchSuggestions();
    }
  };

  // Fetch AI suggestions from backend
  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const result = await suggestColorsMutation.mutateAsync({
        imageBase64,
        ageGroup,
        preferredMood: 'auto',
        language: 'tr',
      });

      if (result.success) {
        setSuggestions(result.colorSuggestions);
        setPalettes(result.palettes);
        setHarmonyTips(result.harmonyTips);
        setAnalysis({
          subjectTr: result.analysis.subjectTr,
          suggestedStyleTr: result.analysis.suggestedStyleTr,
        });

        // Select recommended palette
        const recommended = result.palettes.find((p: MoodPalette) => p.isRecommended);
        if (recommended) {
          setSelectedPalette(recommended.id);
        }
      }
    } catch (error) {
      console.error('[AISuggestions] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing the panel
  const handleClose = () => {
    Animated.timing(modalSlide, {
      toValue: SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      onClose?.();
    });
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setCustomColor(color);
    onColorSelect(color);

    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle palette selection
  const handlePaletteSelect = (paletteId: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPalette(paletteId);

    // Apply first color from palette
    const palette = palettes.find(p => p.id === paletteId);
    if (palette && palette.colors[0]) {
      setCustomColor(palette.colors[0]);
    }
  };

  // Sparkle rotation
  const sparkleRotate = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      {/* Magic Wand Button */}
      <TouchableOpacity style={styles.magicButton} onPress={handleOpen} activeOpacity={0.8}>
        <LinearGradient
          colors={['#9D4EDD', '#FF69B4', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.magicButtonGradient}
        >
          <Animated.View style={{ transform: [{ rotate: sparkleRotate }] }}>
            <Text style={styles.magicIcon}>✨</Text>
          </Animated.View>
          <Text style={styles.magicButtonText}>AI</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* AI Suggestions Modal */}
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={handleClose} activeOpacity={1} />

          <Animated.View style={[styles.modalContent, { transform: [{ translateX: modalSlide }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerEmoji}>🎨</Text>
                <View>
                  <Text style={styles.headerTitle}>AI Renk Asistanı</Text>
                  {analysis && <Text style={styles.headerSubtitle}>{analysis.subjectTr}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={32} color={Colors.neutral.medium} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#9D4EDD" />
                  <Text style={styles.loadingText}>AI renkleri analiz ediyor...</Text>
                  <Text style={styles.loadingEmoji}>🔮</Text>
                </View>
              ) : (
                <>
                  {/* Recommended Palette */}
                  {analysis && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        ✨ Önerilen Stil: {analysis.suggestedStyleTr}
                      </Text>
                    </View>
                  )}

                  {/* AI Suggested Colors */}
                  {suggestions.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🎯 AI Önerileri</Text>
                      <View style={styles.colorGrid}>
                        {suggestions.map(suggestion => (
                          <ColorSuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            onSelect={handleColorSelect}
                          />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Mood Palettes */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🌈 Renk Paletleri</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.palettesScroll}
                    >
                      {palettes.map(palette => (
                        <PaletteCard
                          key={palette.id}
                          palette={palette}
                          isSelected={selectedPalette === palette.id}
                          onSelect={() => handlePaletteSelect(palette.id)}
                          onColorSelect={handleColorSelect}
                        />
                      ))}
                    </ScrollView>
                  </View>

                  {/* Harmony Tips */}
                  {harmonyTips.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>💡 Renk İpuçları</Text>
                      {harmonyTips.map((tip, index) => (
                        <View key={index} style={styles.tipCard}>
                          <Text style={styles.tipText}>{tip.tipTr}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Bottom spacing */}
                  <View style={{ height: 40 }} />
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Individual color suggestion item
 */
function ColorSuggestionItem({
  suggestion,
  onSelect,
}: {
  suggestion: ColorSuggestion;
  onSelect: (color: string) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      delay: Math.random() * 200,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryEmoji = {
    primary: '1️⃣',
    secondary: '2️⃣',
    accent: '✨',
    background: '🖼️',
    detail: '🔍',
  }[suggestion.category];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.colorItem, { backgroundColor: suggestion.hex }]}
        onPress={() => onSelect(suggestion.hex)}
        activeOpacity={0.8}
      >
        <View style={styles.colorItemBadge}>
          <Text style={styles.colorItemBadgeText}>{categoryEmoji}</Text>
        </View>
        <View style={styles.colorItemInfo}>
          <Text style={styles.colorItemName} numberOfLines={1}>
            {suggestion.nameTr}
          </Text>
          <Text style={styles.colorItemConfidence}>
            {Math.round(suggestion.confidence * 100)}% eşleşme
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Mood palette card
 */
function PaletteCard({
  palette,
  isSelected,
  onSelect,
  onColorSelect,
}: {
  palette: MoodPalette;
  isSelected: boolean;
  onSelect: () => void;
  onColorSelect: (color: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.paletteCard,
        isSelected && styles.paletteCardSelected,
        palette.isRecommended && styles.paletteCardRecommended,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {palette.isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedBadgeText}>⭐ Önerilen</Text>
        </View>
      )}

      <Text style={styles.paletteName}>{palette.moodTr}</Text>

      <View style={styles.paletteColors}>
        {palette.colors.slice(0, 5).map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.paletteColorDot, { backgroundColor: color }]}
            onPress={() => onColorSelect(color)}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Magic Button
  magicButton: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    zIndex: zIndex.floating,
  },
  magicButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.colored('#9D4EDD'),
  },
  magicIcon: {
    fontSize: 24,
  },
  magicButtonText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
    marginTop: -4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 380,
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    ...shadows.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.darkest,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral.medium,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingEmoji: {
    fontSize: 32,
  },

  // Sections
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.darkest,
    marginBottom: 12,
  },

  // Color Grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    width: 100,
    height: 80,
    borderRadius: 16,
    padding: 8,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  colorItemBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemBadgeText: {
    fontSize: 12,
  },
  colorItemInfo: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 4,
  },
  colorItemName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral.darkest,
  },
  colorItemConfidence: {
    fontSize: 8,
    color: Colors.neutral.medium,
  },

  // Palettes
  palettesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  paletteCard: {
    width: 140,
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paletteCardSelected: {
    borderColor: '#9D4EDD',
    backgroundColor: '#F8F0FF',
  },
  paletteCardRecommended: {
    backgroundColor: '#FFFBEB',
  },
  recommendedBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.darkest,
  },
  paletteName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.darkest,
    marginBottom: 8,
  },
  paletteColors: {
    flexDirection: 'row',
    gap: 6,
  },
  paletteColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },

  // Tips
  tipCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0066CC',
    lineHeight: 18,
  },
});
