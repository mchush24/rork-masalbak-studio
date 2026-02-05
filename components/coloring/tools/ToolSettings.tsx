/**
 * 🎛️ Tool Settings Panel
 *
 * Child-friendly UI for adjusting:
 * - Brush size (5-50px)
 * - Opacity (0-100%)
 * - Hardness (soft to hard)
 *
 * Features:
 * - Large touch targets (80x80px minimum)
 * - Live preview
 * - Animated feedback
 * - Emoji indicators
 * - Haptic feedback
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { shadows } from '@/constants/design-system';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useColoring } from '../ColoringContext';

export interface ToolSettingsProps {
  visible: boolean;
  onClose?: () => void;
}

export function ToolSettings({ visible, onClose }: ToolSettingsProps) {
  const {
    brushSettings,
    updateBrushSettings,
    deviceCapabilities,
    triggerHaptic,
    getCurrentColor,
  } = useColoring();

  // Animation
  const [slideAnim] = useState(new Animated.Value(visible ? 0 : 300));

  // Animate panel visibility
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 300,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [visible]);

  // Handle slider changes with haptic feedback
  const handleSizeChange = useCallback((value: number) => {
    updateBrushSettings({ size: value });
  }, [updateBrushSettings]);

  const handleOpacityChange = useCallback((value: number) => {
    updateBrushSettings({ opacity: value });
  }, [updateBrushSettings]);

  const handleHardnessChange = useCallback((value: number) => {
    updateBrushSettings({ hardness: value });
  }, [updateBrushSettings]);

  // Haptic feedback on slider start
  const handleSliderStart = useCallback(() => {
    triggerHaptic();
  }, [triggerHaptic]);

  // Get size range based on device tier
  const sizeRange = deviceCapabilities.recommendedBrushSizes;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Fırça Ayarları</Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Live Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.previewCircleContainer}>
            <View
              style={[
                styles.previewCircle,
                {
                  width: brushSettings.size * 2,
                  height: brushSettings.size * 2,
                  backgroundColor: getCurrentColor(),
                  opacity: brushSettings.opacity,
                },
              ]}
            />
          </View>
        </View>

        {/* Size Slider */}
        <SettingSlider
          label="📏 Boyut"
          emoji="🔸"
          value={brushSettings.size}
          min={sizeRange.min}
          max={sizeRange.max}
          step={1}
          onChange={handleSizeChange}
          onSliderStart={handleSliderStart}
          displayValue={`${Math.round(brushSettings.size)}px`}
        />

        {/* Opacity Slider */}
        <SettingSlider
          label="💧 Şeffaflık"
          emoji="✨"
          value={brushSettings.opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={handleOpacityChange}
          onSliderStart={handleSliderStart}
          displayValue={`${Math.round(brushSettings.opacity * 100)}%`}
        />

        {/* Hardness Slider */}
        <SettingSlider
          label="🎯 Sertlik"
          emoji="🌟"
          value={brushSettings.hardness}
          min={0}
          max={1}
          step={0.01}
          onChange={handleHardnessChange}
          onSliderStart={handleSliderStart}
          displayValue={brushSettings.hardness < 0.3 ? 'Yumuşak' : brushSettings.hardness > 0.7 ? 'Sert' : 'Orta'}
        />

        {/* Pressure Sensitivity Toggle (Premium only) */}
        {deviceCapabilities.tier === 'premium' && deviceCapabilities.supportsPressure && (
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.labelEmoji}>✍️</Text>
              <Text style={styles.labelText}>Basınç Hassasiyeti</Text>
            </View>
            <Pressable
              style={[
                styles.toggle,
                brushSettings.pressureSensitivity && styles.toggleActive,
              ]}
              onPress={() => {
                updateBrushSettings({
                  pressureSensitivity: !brushSettings.pressureSensitivity,
                });
                triggerHaptic();
              }}
            >
              <View
                style={[
                  styles.toggleThumb,
                  brushSettings.pressureSensitivity && styles.toggleThumbActive,
                ]}
              />
            </Pressable>
          </View>
        )}

        {/* Preset Buttons */}
        <View style={styles.presetsContainer}>
          <Text style={styles.presetsTitle}>Hazır Ayarlar</Text>
          <View style={styles.presetsRow}>
            <PresetButton
              emoji="🖍️"
              label="Kalem"
              onPress={() => {
                updateBrushSettings({
                  size: 8,
                  opacity: 1,
                  hardness: 0.9,
                });
                triggerHaptic();
              }}
            />
            <PresetButton
              emoji="🖌️"
              label="Fırça"
              onPress={() => {
                updateBrushSettings({
                  size: 20,
                  opacity: 0.8,
                  hardness: 0.3,
                });
                triggerHaptic();
              }}
            />
            <PresetButton
              emoji="✏️"
              label="İnce"
              onPress={() => {
                updateBrushSettings({
                  size: 5,
                  opacity: 1,
                  hardness: 1,
                });
                triggerHaptic();
              }}
            />
            <PresetButton
              emoji="🎨"
              label="Kalın"
              onPress={() => {
                updateBrushSettings({
                  size: 40,
                  opacity: 0.7,
                  hardness: 0.2,
                });
                triggerHaptic();
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ============================================================================
// SETTING SLIDER COMPONENT
// ============================================================================

interface SettingSliderProps {
  label: string;
  emoji: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onSliderStart?: () => void;
  displayValue: string;
}

function SettingSlider({
  label,
  emoji,
  value,
  min,
  max,
  step,
  onChange,
  onSliderStart,
  displayValue,
}: SettingSliderProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.labelEmoji}>{emoji}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          onSlidingStart={onSliderStart}
          minimumTrackTintColor="#FF9B7A"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#FF9B7A"
        />
        <Text style={styles.valueText}>{displayValue}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// PRESET BUTTON COMPONENT
// ============================================================================

interface PresetButtonProps {
  emoji: string;
  label: string;
  onPress: () => void;
}

function PresetButton({ emoji, label, onPress }: PresetButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.presetButton,
        pressed && styles.presetButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.presetEmoji}>{emoji}</Text>
      <Text style={styles.presetLabel}>{label}</Text>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 100,
    width: 280,
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    ...shadows.xl,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },

  // Preview
  previewContainer: {
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  previewCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCircle: {
    borderRadius: 9999,
  },

  // Settings
  settingRow: {
    marginBottom: 12,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9B7A',
    marginLeft: 8,
    minWidth: 50,
    textAlign: 'right',
  },

  // Toggle
  toggle: {
    width: 60,
    height: 32,
    borderRadius: 9999,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF9B7A',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    ...shadows.xs,
  },
  toggleThumbActive: {
    transform: [{ translateX: 28 }],
  },

  // Presets
  presetsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  presetsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  presetButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#F0F0F0',
  },
  presetEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  presetLabel: {
    fontSize: 10,
    color: '#666',
  },
});
