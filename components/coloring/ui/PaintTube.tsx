/**
 * 🎨 PaintTube - 3D Paint Tube Component
 *
 * A child-friendly, visually appealing paint tube selector
 * Features:
 * - 3D tube appearance with SVG gradients
 * - Metallic cap with shine effect
 * - Squeeze animation on press
 * - Selection ring/glow effect
 * - Glitter indicator for special colors
 */

import React, { useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Animated, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Ellipse,
  Path,
  G,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { TextureType } from '../effects/TextureShaders';
import { Colors } from '@/constants/colors';
import { hapticImpact } from '@/lib/platform';

// ============================================================================
// TYPES
// ============================================================================

export interface PaintTubeProps {
  color: string;
  isSelected?: boolean;
  onPress?: () => void;
  hasGlitter?: boolean;
  texture?: TextureType;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Lighten a hex color
 */
function lightenColor(hex: string, percent: number): string {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * percent));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color
 */
function darkenColor(hex: string, percent: number): string {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZES = {
  small: { width: 40, height: 70, capHeight: 12 },
  medium: { width: 55, height: 90, capHeight: 16 },
  large: { width: 70, height: 110, capHeight: 20 },
};

// ============================================================================
// PAINT TUBE COMPONENT
// ============================================================================

export function PaintTube({
  color,
  isSelected = false,
  onPress,
  hasGlitter = false,
  texture = 'solid',
  size = 'medium',
  style,
  disabled = false,
}: PaintTubeProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const squeezeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  // Get size configuration
  const { width, height, capHeight } = SIZES[size];

  // Derive colors
  const lightColor = lightenColor(color, 0.3);
  const darkColor = darkenColor(color, 0.3);
  const shadowColor = darkenColor(color, 0.5);

  // Update glow animation when selection changes
  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSelected, glowAnim]);

  // Handle press animations
  const handlePressIn = () => {
    if (disabled) return;

    // Squeeze animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(squeezeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(squeezeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);

    onPress?.();
  };

  // Calculate squeeze transform
  const squeezeTransform = squeezeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  // Calculate glow opacity
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style]}
    >
      {/* Selection glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: width + 16,
            height: height + 16,
            borderRadius: (width + 16) / 4,
            backgroundColor: color,
            opacity: glowOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.tubeContainer,
          {
            transform: [{ scale: scaleAnim }, { scaleX: squeezeTransform }],
          },
        ]}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {/* Tube body gradient (3D effect) */}
            <LinearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={darkColor} />
              <Stop offset="30%" stopColor={color} />
              <Stop offset="50%" stopColor={lightColor} />
              <Stop offset="70%" stopColor={color} />
              <Stop offset="100%" stopColor={darkColor} />
            </LinearGradient>

            {/* Metallic cap gradient */}
            <LinearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#888888" />
              <Stop offset="20%" stopColor={Colors.neutral.lighter} />
              <Stop offset="40%" stopColor={Colors.neutral.white} />
              <Stop offset="60%" stopColor={Colors.neutral.lighter} />
              <Stop offset="80%" stopColor="#AAAAAA" />
              <Stop offset="100%" stopColor="#777777" />
            </LinearGradient>

            {/* Cap top gradient */}
            <RadialGradient id="capTopGradient" cx="50%" cy="30%" r="60%">
              <Stop offset="0%" stopColor={Colors.neutral.white} />
              <Stop offset="50%" stopColor={Colors.neutral.lighter} />
              <Stop offset="100%" stopColor={Colors.neutral.light} />
            </RadialGradient>

            {/* Glitter sparkle pattern */}
            {hasGlitter && (
              <RadialGradient id="sparkle" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={Colors.neutral.white} stopOpacity="1" />
                <Stop offset="100%" stopColor={Colors.neutral.white} stopOpacity="0" />
              </RadialGradient>
            )}
          </Defs>

          {/* Tube body */}
          <G>
            {/* Main tube shape */}
            <Path
              d={`
                M ${width * 0.15} ${capHeight}
                Q ${width * 0.05} ${height * 0.5} ${width * 0.2} ${height - 10}
                Q ${width * 0.5} ${height + 5} ${width * 0.8} ${height - 10}
                Q ${width * 0.95} ${height * 0.5} ${width * 0.85} ${capHeight}
                Z
              `}
              fill="url(#tubeGradient)"
            />

            {/* Tube crimp lines (bottom) */}
            <Path
              d={`M ${width * 0.25} ${height - 15} L ${width * 0.75} ${height - 15}`}
              stroke={shadowColor}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <Path
              d={`M ${width * 0.28} ${height - 12} L ${width * 0.72} ${height - 12}`}
              stroke={shadowColor}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <Path
              d={`M ${width * 0.31} ${height - 9} L ${width * 0.69} ${height - 9}`}
              stroke={shadowColor}
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Glitter sparkles */}
            {hasGlitter && (
              <>
                <Ellipse cx={width * 0.3} cy={height * 0.35} rx="2" ry="2" fill="url(#sparkle)" />
                <Ellipse
                  cx={width * 0.6}
                  cy={height * 0.45}
                  rx="1.5"
                  ry="1.5"
                  fill="url(#sparkle)"
                />
                <Ellipse cx={width * 0.45} cy={height * 0.6} rx="2" ry="2" fill="url(#sparkle)" />
                <Ellipse
                  cx={width * 0.7}
                  cy={height * 0.3}
                  rx="1.5"
                  ry="1.5"
                  fill="url(#sparkle)"
                />
                <Ellipse cx={width * 0.35} cy={height * 0.55} rx="1" ry="1" fill="url(#sparkle)" />
              </>
            )}
          </G>

          {/* Metallic cap */}
          <G>
            {/* Cap body */}
            <Rect
              x={width * 0.1}
              y={0}
              width={width * 0.8}
              height={capHeight}
              rx={3}
              ry={3}
              fill="url(#capGradient)"
            />

            {/* Cap top */}
            <Ellipse
              cx={width * 0.5}
              cy={capHeight * 0.3}
              rx={width * 0.35}
              ry={capHeight * 0.4}
              fill="url(#capTopGradient)"
            />

            {/* Cap highlight line */}
            <Path
              d={`M ${width * 0.25} ${capHeight * 0.5} L ${width * 0.25} ${capHeight * 0.9}`}
              stroke={Colors.neutral.white}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </G>

          {/* Selection ring */}
          {isSelected && (
            <Rect
              x={2}
              y={2}
              width={width - 4}
              height={height - 4}
              rx={width / 5}
              ry={width / 5}
              fill="none"
              stroke={Colors.neutral.white}
              strokeWidth="3"
              opacity="0.8"
            />
          )}
        </Svg>

        {/* Texture indicator badge */}
        {texture !== 'solid' && (
          <View style={[styles.textureBadge, { backgroundColor: lightColor }]}>
            <Svg width={12} height={12} viewBox="0 0 24 24">
              {texture === 'glitter' && (
                <Path
                  d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                  fill="#FFD700"
                />
              )}
              {texture === 'scale' && (
                <Path
                  d="M12 4C8 4 4 8 4 12C4 16 8 20 12 20C16 20 20 16 20 12C20 8 16 4 12 4Z"
                  fill={Colors.neutral.white}
                  opacity="0.8"
                />
              )}
              {texture === 'dots' && (
                <>
                  <Ellipse cx="8" cy="8" rx="3" ry="3" fill={Colors.neutral.white} />
                  <Ellipse cx="16" cy="16" rx="3" ry="3" fill={Colors.neutral.white} />
                </>
              )}
            </Svg>
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
  },
  tubeContainer: {
    position: 'relative',
  },
  textureBadge: {
    position: 'absolute',
    top: 16,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.white,
  },
});

export default PaintTube;
