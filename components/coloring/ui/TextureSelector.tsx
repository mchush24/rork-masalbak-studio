/**
 * 🎨 TextureSelector - Texture Effect Chooser
 *
 * UI component for selecting texture effects:
 * - Solid (plain color)
 * - Glitter (sparkle effect)
 * - Scale (fish-scale pattern)
 * - Dots (polka-dot pattern)
 */

import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { TEXTURE_OPTIONS } from '../effects/TexturedFill';
import { TextureType } from '../effects/TextureShaders';
import { Colors } from '@/constants/colors';
import { spacing, typography, radius, shadows, createTextShadow } from '@/constants/design-system';

// ============================================================================
// TYPES
// ============================================================================

export interface TextureSelectorProps {
  selectedTexture: TextureType;
  onTextureSelect: (texture: TextureType) => void;
  currentColor?: string;
  disabled?: boolean;
  compact?: boolean;
}

// ============================================================================
// TEXTURE SELECTOR COMPONENT
// ============================================================================

export function TextureSelector({
  selectedTexture,
  onTextureSelect,
  currentColor = Colors.secondary.coral,
  disabled = false,
  compact = false,
}: TextureSelectorProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!compact && <Text style={styles.title}>Doku Efekti</Text>}

      <View style={[styles.optionsContainer, compact && styles.optionsCompact]}>
        {TEXTURE_OPTIONS.map(option => {
          const isSelected = selectedTexture === option.type;

          return (
            <Pressable
              key={option.type}
              onPress={() => onTextureSelect(option.type)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.optionButton,
                compact && styles.optionButtonCompact,
                isSelected && styles.optionButtonSelected,
                pressed && !disabled && styles.optionButtonPressed,
                disabled && styles.optionButtonDisabled,
              ]}
            >
              {/* Color preview with texture indicator */}
              <View
                style={[
                  styles.previewContainer,
                  compact && styles.previewCompact,
                  { backgroundColor: currentColor },
                ]}
              >
                {/* Texture pattern overlay */}
                {option.type === 'glitter' && (
                  <View style={styles.glitterOverlay}>
                    <Text style={styles.sparkleText}>✦</Text>
                    <Text style={[styles.sparkleText, styles.sparkle2]}>✧</Text>
                    <Text style={[styles.sparkleText, styles.sparkle3]}>✦</Text>
                  </View>
                )}
                {option.type === 'scale' && (
                  <View style={styles.scaleOverlay}>
                    <View style={styles.scaleRow}>
                      <View style={styles.scaleCircle} />
                      <View style={styles.scaleCircle} />
                    </View>
                    <View style={[styles.scaleRow, styles.scaleRowOffset]}>
                      <View style={styles.scaleCircle} />
                      <View style={styles.scaleCircle} />
                    </View>
                  </View>
                )}
                {option.type === 'dots' && (
                  <View style={styles.dotsOverlay}>
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                )}
              </View>

              {/* Emoji */}
              <Text style={[styles.emoji, compact && styles.emojiCompact]}>{option.emoji}</Text>

              {/* Label (only in full mode) */}
              {!compact && (
                <Text style={[styles.label, isSelected && styles.labelSelected]}>
                  {option.name}
                </Text>
              )}

              {/* Selection indicator */}
              {isSelected && <View style={styles.selectedBadge} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================================
// INLINE TEXTURE TOGGLE (for quick access)
// ============================================================================

export interface TextureToggleProps {
  isGlitterEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  color?: string;
  disabled?: boolean;
}

export function GlitterToggle({
  isGlitterEnabled,
  onToggle,
  _color = '#FFD700',
  disabled = false,
}: TextureToggleProps) {
  return (
    <Pressable
      onPress={() => onToggle(!isGlitterEnabled)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.toggleButton,
        isGlitterEnabled && styles.toggleButtonActive,
        pressed && !disabled && styles.toggleButtonPressed,
        disabled && styles.toggleButtonDisabled,
      ]}
    >
      <Text style={styles.toggleEmoji}>✨</Text>
      <Text style={[styles.toggleLabel, isGlitterEnabled && styles.toggleLabelActive]}>
        {isGlitterEnabled ? 'Simli' : 'Sim'}
      </Text>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: spacing['3'],
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: radius.lg,
  },
  containerCompact: {
    padding: spacing['2'],
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: typography.size.md,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
    marginBottom: spacing['2'],
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    justifyContent: 'center',
  },
  optionsCompact: {
    gap: spacing['1'],
  },
  optionButton: {
    alignItems: 'center',
    padding: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 70,
    position: 'relative',
  },
  optionButtonCompact: {
    padding: spacing['1'],
    minWidth: 50,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  optionButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  optionButtonDisabled: {
    opacity: 0.4,
  },
  previewContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: spacing['1'],
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  previewCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 2,
  },
  glitterOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleText: {
    position: 'absolute',
    color: Colors.neutral.white,
    fontSize: 10,
    fontFamily: typography.family.bold,
    ...createTextShadow(0, 0, 4, 'rgba(255, 255, 255, 0.8)'),
  },
  sparkle2: {
    top: 5,
    right: 8,
    fontSize: 8,
  },
  sparkle3: {
    bottom: 8,
    left: 6,
    fontSize: 6,
  },
  scaleOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 2,
  },
  scaleRowOffset: {
    marginLeft: 6,
    marginTop: -2,
  },
  scaleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  dotsOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    top: 8,
    left: 8,
  },
  dot2: {
    top: 20,
    left: 18,
    width: 4,
    height: 4,
  },
  dot3: {
    top: 12,
    left: 28,
    width: 5,
    height: 5,
  },
  emoji: {
    fontSize: 20,
    marginBottom: spacing['1'],
  },
  emojiCompact: {
    fontSize: 16,
    marginBottom: 0,
  },
  label: {
    fontSize: typography.size.xs,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  labelSelected: {
    fontFamily: typography.family.bold,
    opacity: 1,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: Colors.neutral.white,
  },
  // Toggle button styles
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: spacing['1'],
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  toggleButtonPressed: {
    opacity: 0.7,
  },
  toggleButtonDisabled: {
    opacity: 0.4,
  },
  toggleEmoji: {
    fontSize: 16,
  },
  toggleLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  toggleLabelActive: {
    fontFamily: typography.family.semibold,
    opacity: 1,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default TextureSelector;
