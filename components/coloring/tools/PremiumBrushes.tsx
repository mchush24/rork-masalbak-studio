/**
 * 🖌️ Premium Brushes
 *
 * Advanced brush effects for professional coloring experience.
 *
 * Brush Types:
 * - Watercolor: Soft edges, color blending, transparency variations
 * - Marker: Bold strokes, slight edge texture
 * - Spray: Particle-based airbrush effect
 * - Crayon: Textured, rough strokes
 * - Pencil: Thin, pressure-sensitive lines
 * - Highlighter: Semi-transparent, wide strokes
 *
 * Each brush has unique:
 * - Stroke rendering algorithm
 * - Pressure response curve
 * - Edge characteristics
 * - Opacity behavior
 *
 * Inspired by: Procreate, Lake Coloring App
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { shadows, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: _SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export type BrushType =
  | 'standard'
  | 'watercolor'
  | 'marker'
  | 'spray'
  | 'crayon'
  | 'pencil'
  | 'highlighter';

export interface BrushConfig {
  type: BrushType;
  name: string;
  nameTr: string;
  description: string;
  descriptionTr: string;
  emoji: string;
  isPremium: boolean;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  defaultOpacity: number;
  pressureSensitivity: number; // 0-1
  edgeSoftness: number; // 0-1 (0=hard, 1=soft)
  colorBlending: number; // 0-1
  textureIntensity: number; // 0-1
}

export interface PremiumBrushesProps {
  selectedBrush: BrushType;
  onBrushSelect: (brush: BrushType, config: BrushConfig) => void;
  isPremiumUser?: boolean;
}

// ============================================================================
// BRUSH CONFIGURATIONS
// ============================================================================

export const BRUSH_CONFIGS: Record<BrushType, BrushConfig> = {
  standard: {
    type: 'standard',
    name: 'Standard',
    nameTr: 'Standart',
    description: 'Classic brush for everyday coloring',
    descriptionTr: 'Günlük boyama için klasik fırça',
    emoji: '🖌️',
    isPremium: false,
    defaultSize: 15,
    minSize: 5,
    maxSize: 50,
    defaultOpacity: 1,
    pressureSensitivity: 0.5,
    edgeSoftness: 0.3,
    colorBlending: 0,
    textureIntensity: 0,
  },
  watercolor: {
    type: 'watercolor',
    name: 'Watercolor',
    nameTr: 'Suluboya',
    description: 'Soft, flowing strokes with beautiful blending',
    descriptionTr: 'Güzel karışımlarla yumuşak, akıcı vuruşlar',
    emoji: '💧',
    isPremium: true,
    defaultSize: 25,
    minSize: 10,
    maxSize: 80,
    defaultOpacity: 0.6,
    pressureSensitivity: 0.8,
    edgeSoftness: 0.9,
    colorBlending: 0.7,
    textureIntensity: 0.3,
  },
  marker: {
    type: 'marker',
    name: 'Marker',
    nameTr: 'Keçeli Kalem',
    description: 'Bold, solid strokes with slight texture',
    descriptionTr: 'Hafif doku ile kalın, dolgun vuruşlar',
    emoji: '🖍️',
    isPremium: true,
    defaultSize: 20,
    minSize: 8,
    maxSize: 60,
    defaultOpacity: 0.9,
    pressureSensitivity: 0.3,
    edgeSoftness: 0.1,
    colorBlending: 0.2,
    textureIntensity: 0.2,
  },
  spray: {
    type: 'spray',
    name: 'Spray',
    nameTr: 'Sprey',
    description: 'Airbrush effect with scattered particles',
    descriptionTr: 'Dağılmış parçacıklarla airbrush efekti',
    emoji: '💨',
    isPremium: true,
    defaultSize: 40,
    minSize: 15,
    maxSize: 100,
    defaultOpacity: 0.4,
    pressureSensitivity: 0.7,
    edgeSoftness: 1,
    colorBlending: 0.5,
    textureIntensity: 0.8,
  },
  crayon: {
    type: 'crayon',
    name: 'Crayon',
    nameTr: 'Pastel Boya',
    description: 'Textured strokes like real crayons',
    descriptionTr: 'Gerçek pastel boyalar gibi dokulu vuruşlar',
    emoji: '🖍️',
    isPremium: true,
    defaultSize: 18,
    minSize: 8,
    maxSize: 45,
    defaultOpacity: 0.85,
    pressureSensitivity: 0.6,
    edgeSoftness: 0.4,
    colorBlending: 0.1,
    textureIntensity: 0.9,
  },
  pencil: {
    type: 'pencil',
    name: 'Pencil',
    nameTr: 'Kalem',
    description: 'Thin, precise lines with pressure sensitivity',
    descriptionTr: 'Basınç hassasiyeti ile ince, hassas çizgiler',
    emoji: '✏️',
    isPremium: false,
    defaultSize: 3,
    minSize: 1,
    maxSize: 10,
    defaultOpacity: 1,
    pressureSensitivity: 0.9,
    edgeSoftness: 0,
    colorBlending: 0,
    textureIntensity: 0.1,
  },
  highlighter: {
    type: 'highlighter',
    name: 'Highlighter',
    nameTr: 'Fosforlu Kalem',
    description: 'Wide, semi-transparent highlighting',
    descriptionTr: 'Geniş, yarı saydam vurgulama',
    emoji: '📍',
    isPremium: true,
    defaultSize: 30,
    minSize: 15,
    maxSize: 60,
    defaultOpacity: 0.4,
    pressureSensitivity: 0.2,
    edgeSoftness: 0.2,
    colorBlending: 0.3,
    textureIntensity: 0,
  },
};

// ============================================================================
// BRUSH RENDERING UTILITIES
// ============================================================================

/**
 * Generate spray particles for spray brush
 */
export function generateSprayParticles(
  x: number,
  y: number,
  radius: number,
  density: number = 20
): { x: number; y: number; size: number; opacity: number }[] {
  const particles = [];
  for (let i = 0; i < density; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    particles.push({
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      size: 1 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
    });
  }
  return particles;
}

/**
 * Apply crayon texture noise to a point
 */
export function applyCrayonTexture(
  x: number,
  y: number,
  intensity: number
): { x: number; y: number } {
  const noise = (Math.random() - 0.5) * intensity * 3;
  return {
    x: x + noise,
    y: y + noise,
  };
}

/**
 * Calculate watercolor edge variation
 */
export function getWatercolorEdge(
  baseRadius: number,
  position: number // 0-1 along stroke
): number {
  // Create organic, flowing edge variations
  const variation = Math.sin(position * Math.PI * 4) * 0.2 + Math.random() * 0.1;
  return baseRadius * (1 + variation);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PremiumBrushes({
  selectedBrush,
  onBrushSelect,
  isPremiumUser = false,
}: PremiumBrushesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const handleOpen = () => {
    setIsOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  };

  const handleBrushSelect = (brushType: BrushType) => {
    const config = BRUSH_CONFIGS[brushType];

    // Check if premium brush and user is not premium
    if (config.isPremium && !isPremiumUser) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Could show premium upgrade prompt here
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBrushSelect(brushType, config);
    handleClose();
  };

  const currentBrush = BRUSH_CONFIGS[selectedBrush];

  return (
    <>
      {/* Brush Selector Button */}
      <TouchableOpacity style={styles.selectorButton} onPress={handleOpen} activeOpacity={0.8}>
        <LinearGradient
          colors={currentBrush.isPremium ? ['#FFD700', '#FFA500'] : ['#9D4EDD', '#6B5BDB']}
          style={styles.selectorGradient}
        >
          <Text style={styles.selectorEmoji}>{currentBrush.emoji}</Text>
          <Text style={styles.selectorText}>{currentBrush.nameTr}</Text>
          {currentBrush.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Brush Selection Modal */}
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={handleClose} activeOpacity={1} />

          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🖌️</Text>
              <Text style={styles.headerTitle}>Fırça Seçimi</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={32} color={Colors.neutral.medium} />
              </TouchableOpacity>
            </View>

            {/* Brush List */}
            <ScrollView style={styles.brushList} showsVerticalScrollIndicator={false}>
              {Object.values(BRUSH_CONFIGS).map(brush => (
                <BrushCard
                  key={brush.type}
                  brush={brush}
                  isSelected={selectedBrush === brush.type}
                  isPremiumUser={isPremiumUser}
                  onSelect={() => handleBrushSelect(brush.type)}
                />
              ))}

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// ============================================================================
// BRUSH CARD COMPONENT
// ============================================================================

function BrushCard({
  brush,
  isSelected,
  isPremiumUser,
  onSelect,
}: {
  brush: BrushConfig;
  isSelected: boolean;
  isPremiumUser: boolean;
  onSelect: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isLocked = brush.isPremium && !isPremiumUser;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.brushCard,
          isSelected && styles.brushCardSelected,
          isLocked && styles.brushCardLocked,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Emoji & Name */}
        <View style={styles.brushCardLeft}>
          <View style={styles.brushCardIcon}>
            <Text style={styles.brushCardEmoji}>{brush.emoji}</Text>
          </View>
          <View>
            <Text style={styles.brushCardName}>{brush.nameTr}</Text>
            <Text style={styles.brushCardDescription} numberOfLines={1}>
              {brush.descriptionTr}
            </Text>
          </View>
        </View>

        {/* Status / Lock */}
        <View style={styles.brushCardRight}>
          {isLocked ? (
            <View style={styles.lockBadge}>
              <Text style={styles.lockEmoji}>🔒</Text>
              <Text style={styles.lockText}>PRO</Text>
            </View>
          ) : isSelected ? (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          ) : (
            <View style={styles.brushPreview}>
              <BrushPreview brush={brush} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// BRUSH PREVIEW COMPONENT
// ============================================================================

function BrushPreview({ brush }: { brush: BrushConfig }) {
  // Simple visual preview of brush stroke characteristics
  const getPreviewStyle = () => {
    switch (brush.type) {
      case 'watercolor':
        return {
          backgroundColor: 'rgba(79, 195, 247, 0.5)',
          borderRadius: 20,
          width: 50,
          height: 10,
        };
      case 'marker':
        return {
          backgroundColor: Colors.secondary.coral,
          borderRadius: 2,
          width: 50,
          height: 12,
        };
      case 'spray':
        return {
          backgroundColor: 'transparent',
        };
      case 'crayon':
        return {
          backgroundColor: '#FFD93D',
          borderRadius: 3,
          width: 50,
          height: 8,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        };
      case 'pencil':
        return {
          backgroundColor: Colors.neutral.darkest,
          borderRadius: 0,
          width: 50,
          height: 2,
        };
      case 'highlighter':
        return {
          backgroundColor: 'rgba(255, 235, 59, 0.5)',
          borderRadius: 2,
          width: 50,
          height: 14,
        };
      default:
        return {
          backgroundColor: '#6BCB77',
          borderRadius: 10,
          width: 50,
          height: 10,
        };
    }
  };

  const style = getPreviewStyle();

  if (brush.type === 'spray') {
    // Render spray dots
    return (
      <View style={styles.sprayPreview}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.sprayDot,
              {
                left: Math.random() * 40,
                top: Math.random() * 20,
                opacity: 0.3 + Math.random() * 0.7,
                width: 2 + Math.random() * 2,
                height: 2 + Math.random() * 2,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return <View style={[styles.strokePreview, style]} />;
}

// ============================================================================
// COMPACT BRUSH SELECTOR
// ============================================================================

export function PremiumBrushesCompact({
  selectedBrush,
  onBrushSelect,
  isPremiumUser = false,
}: PremiumBrushesProps) {
  const handleBrushSelect = (brushType: BrushType) => {
    const config = BRUSH_CONFIGS[brushType];
    if (config.isPremium && !isPremiumUser) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBrushSelect(brushType, config);
  };

  const freeBrushes = Object.values(BRUSH_CONFIGS).filter(b => !b.isPremium);
  const premiumBrushes = Object.values(BRUSH_CONFIGS).filter(b => b.isPremium);

  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactTitle}>🖌️ Fırçalar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactScroll}
      >
        {freeBrushes.map(brush => (
          <TouchableOpacity
            key={brush.type}
            style={[
              styles.compactBrush,
              selectedBrush === brush.type && styles.compactBrushSelected,
            ]}
            onPress={() => handleBrushSelect(brush.type)}
          >
            <Text style={styles.compactBrushEmoji}>{brush.emoji}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.compactDivider} />

        {premiumBrushes.map(brush => (
          <TouchableOpacity
            key={brush.type}
            style={[
              styles.compactBrush,
              selectedBrush === brush.type && styles.compactBrushSelected,
              !isPremiumUser && styles.compactBrushLocked,
            ]}
            onPress={() => handleBrushSelect(brush.type)}
          >
            <Text style={styles.compactBrushEmoji}>{brush.emoji}</Text>
            {!isPremiumUser && (
              <View style={styles.compactLockBadge}>
                <Text style={styles.compactLockText}>🔒</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Selector Button
  selectorButton: {
    marginVertical: 8,
  },
  selectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  selectorEmoji: {
    fontSize: 20,
  },
  selectorText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontFamily: typography.family.bold,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeText: {
    color: Colors.neutral.white,
    fontSize: 9,
    fontFamily: typography.family.extrabold,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    ...shadows.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  headerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    padding: 4,
  },

  // Brush List
  brushList: {
    padding: 16,
  },

  // Brush Card
  brushCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  brushCardSelected: {
    borderColor: '#6BCB77',
    backgroundColor: '#F0FFF4',
  },
  brushCardLocked: {
    opacity: 0.7,
  },
  brushCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  brushCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  brushCardEmoji: {
    fontSize: 24,
  },
  brushCardName: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  brushCardDescription: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  brushCardRight: {
    marginLeft: 12,
  },

  // Lock Badge
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  lockEmoji: {
    fontSize: 12,
  },
  lockText: {
    fontSize: 10,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
  },

  // Selected Badge
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6BCB77',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: Colors.neutral.white,
    fontSize: 18,
    fontFamily: typography.family.bold,
  },

  // Brush Preview
  brushPreview: {
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strokePreview: {
    // Dynamic styles applied inline
  },
  sprayPreview: {
    width: 50,
    height: 24,
    position: 'relative',
  },
  sprayDot: {
    position: 'absolute',
    backgroundColor: '#9D4EDD',
    borderRadius: 5,
  },

  // Compact Version
  compactContainer: {
    marginVertical: 8,
  },
  compactTitle: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.medium,
    marginBottom: 8,
  },
  compactScroll: {
    gap: 8,
    alignItems: 'center',
  },
  compactBrush: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.lightest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  compactBrushSelected: {
    borderColor: '#6BCB77',
    backgroundColor: '#F0FFF4',
  },
  compactBrushLocked: {
    opacity: 0.5,
  },
  compactBrushEmoji: {
    fontSize: 20,
  },
  compactDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  compactLockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactLockText: {
    fontSize: 8,
  },
});

// Note: All exports are defined inline with 'export' keyword above
