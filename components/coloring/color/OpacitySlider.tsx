/**
 * 💧 Opacity Slider
 *
 * Vertical slider for adjusting color opacity/transparency.
 *
 * Features:
 * - Vertical orientation (child-friendly)
 * - Checkered background to show transparency
 * - Large touch target (40px wide)
 * - Animated feedback
 * - 0-100% range with visual preview
 * - Emoji indicators (💧 for opacity)
 */

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Pressable } from 'react-native';
import { shadows } from '@/constants/design-system';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Canvas, Rect, LinearGradient as SkiaGradient, vec } from '@shopify/react-native-skia';
import { Colors } from '@/constants/colors';

export interface OpacitySliderProps {
  value: number; // 0-1
  color: string;
  onChange: (value: number) => void;
  height?: number;
}

export function OpacitySlider({ value, color, onChange, height = 200 }: OpacitySliderProps) {
  const thumbAnim = useRef(new Animated.Value(1)).current;

  // Calculate thumb position from value
  const getThumbPosition = useCallback(
    (opacity: number) => {
      return height - 30 - opacity * (height - 60);
    },
    [height]
  );

  // Calculate value from touch position
  const getValueFromPosition = useCallback(
    (y: number) => {
      const minY = 30;
      const maxY = height - 30;
      const clampedY = Math.max(minY, Math.min(maxY, y));
      const normalized = (maxY - clampedY) / (maxY - minY);
      return Math.max(0, Math.min(1, normalized));
    },
    [height]
  );

  // Handle touch
  const handleTouch = useCallback(
    (y: number) => {
      const newValue = getValueFromPosition(y);
      onChange(newValue);

      // Thumb animation
      Animated.sequence([
        Animated.timing(thumbAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(thumbAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [getValueFromPosition, onChange, thumbAnim]
  );

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onBegin(e => {
      handleTouch(e.y);
    })
    .onUpdate(e => {
      handleTouch(e.y);
    });

  // Tap gesture
  const tapGesture = Gesture.Tap().onEnd(e => {
    handleTouch(e.y);
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const thumbPosition = getThumbPosition(value);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>💧</Text>
        <Text style={styles.label}>Şeffaflık</Text>
      </View>

      {/* Slider track */}
      <GestureDetector gesture={composedGesture}>
        <View style={[styles.trackContainer, { height }]}>
          {/* Checkered background pattern */}
          <View style={styles.checkeredBackground}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.checkeredSquare,
                  {
                    backgroundColor: i % 2 === 0 ? '#E0E0E0' : Colors.neutral.white,
                  },
                ]}
              />
            ))}
          </View>

          {/* Gradient overlay using Skia */}
          <Canvas style={StyleSheet.absoluteFill}>
            <Rect x={0} y={0} width={40} height={height}>
              <SkiaGradient
                start={vec(0, height)}
                end={vec(0, 0)}
                colors={[
                  `${color}00`, // Fully transparent
                  color, // Fully opaque
                ]}
              />
            </Rect>
          </Canvas>

          {/* Thumb indicator */}
          <Animated.View
            style={[
              styles.thumb,
              {
                top: thumbPosition,
                transform: [{ scale: thumbAnim }],
              },
            ]}
          >
            <View style={[styles.thumbInner, { backgroundColor: color, opacity: value }]} />
          </Animated.View>

          {/* Border */}
          <View style={[styles.border, { height }]} pointerEvents="none" />
        </View>
      </GestureDetector>

      {/* Value display */}
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{Math.round(value * 100)}%</Text>
      </View>

      {/* Quick presets */}
      <View style={styles.presetsContainer}>
        <OpacityPreset value={1} label="100%" onPress={() => onChange(1)} active={value === 1} />
        <OpacityPreset
          value={0.75}
          label="75%"
          onPress={() => onChange(0.75)}
          active={value === 0.75}
        />
        <OpacityPreset
          value={0.5}
          label="50%"
          onPress={() => onChange(0.5)}
          active={value === 0.5}
        />
        <OpacityPreset
          value={0.25}
          label="25%"
          onPress={() => onChange(0.25)}
          active={value === 0.25}
        />
      </View>
    </View>
  );
}

// ============================================================================
// OPACITY PRESET BUTTON
// ============================================================================

interface OpacityPresetProps {
  value: number;
  label: string;
  onPress: () => void;
  active: boolean;
}

function OpacityPreset({ label, onPress, active }: OpacityPresetProps) {
  return (
    <Pressable onPress={onPress} style={[styles.presetButton, active && styles.presetButtonActive]}>
      <Text style={[styles.presetText, active && styles.presetTextActive]}>{label}</Text>
    </Pressable>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.darkest,
  },
  trackContainer: {
    width: 40,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  checkeredBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkeredSquare: {
    width: 20,
    height: 10,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  thumb: {
    position: 'absolute',
    left: -5,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...shadows.sm,
  },
  valueContainer: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.sunset,
    fontFamily: 'monospace',
  },
  presetsContainer: {
    marginTop: 12,
    gap: 6,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightest,
  },
  presetButtonActive: {
    backgroundColor: Colors.primary.sunset,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },
  presetTextActive: {
    color: Colors.neutral.white,
  },
});
