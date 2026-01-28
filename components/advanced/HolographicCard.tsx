/**
 * HolographicCard - Glowing Light Projection Container
 *
 * A futuristic card that looks like a projected light field
 * with pulsing neon border trails and glass morphism
 * Platform-aware: uses Skia on native, CSS on web
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// ============================================
// TYPES
// ============================================
interface HolographicCardProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'pink' | 'gold' | 'rainbow';
  glowIntensity?: number;
  pulsing?: boolean;
  breathing?: boolean;
  blurIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

// ============================================
// COLOR MAPS
// ============================================
const variantColors = {
  cyan: {
    primary: '#00F5FF',
    secondary: '#70FFD6',
    glow: 'rgba(0, 245, 255, 0.6)',
    gradient: ['#00F5FF', '#70FFD6', '#00D4E8'] as const,
  },
  purple: {
    primary: '#B98EFF',
    secondary: '#9B6DFF',
    glow: 'rgba(185, 142, 255, 0.6)',
    gradient: ['#B98EFF', '#9B6DFF', '#7B4DFF'] as const,
  },
  pink: {
    primary: '#FF9EBF',
    secondary: '#FFB6C1',
    glow: 'rgba(255, 158, 191, 0.6)',
    gradient: ['#FF9EBF', '#FFB6C1', '#FF69B4'] as const,
  },
  gold: {
    primary: '#FFD93D',
    secondary: '#FFE066',
    glow: 'rgba(255, 217, 61, 0.6)',
    gradient: ['#FFD93D', '#FFE066', '#FFCBA4'] as const,
  },
  rainbow: {
    primary: '#00F5FF',
    secondary: '#FF9EBF',
    glow: 'rgba(185, 142, 255, 0.5)',
    gradient: ['#00F5FF', '#B98EFF', '#FF9EBF', '#FFD93D'] as const,
  },
};

// ============================================
// WEB ANIMATED BORDER (CSS-based)
// ============================================
interface WebAnimatedBorderProps {
  colors: readonly string[];
  glowIntensity: number;
  pulsing: boolean;
  borderRadius: number;
}

const WebAnimatedBorder: React.FC<WebAnimatedBorderProps> = ({
  colors,
  glowIntensity,
  pulsing,
  borderRadius,
}) => {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(glowIntensity);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    if (pulsing) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(glowIntensity * 1.5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(glowIntensity * 0.7, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [pulsing, glowIntensity]);

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius, overflow: 'hidden' },
        borderAnimatedStyle,
      ]}
      pointerEvents="none"
    >
      {/* Outer glow */}
      <View style={[StyleSheet.absoluteFill, { margin: -4 }]}>
        <Animated.View style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}>
          <LinearGradient
            colors={[colors[0], colors[1], ...colors.slice(2), colors[0]] as [string, string, ...string[]]}
            style={[StyleSheet.absoluteFill, { transform: [{ scale: 2 }] }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </View>

      {/* Inner cut-out */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            margin: 3,
            backgroundColor: 'rgba(10, 14, 26, 0.95)',
            borderRadius: borderRadius - 3,
          },
        ]}
      />
    </Animated.View>
  );
};

// ============================================
// NATIVE SKIA ANIMATED BORDER
// ============================================
interface NativeAnimatedBorderProps {
  width: number;
  height: number;
  borderRadius: number;
  colors: readonly string[];
  glowIntensity: number;
  pulsing: boolean;
}

const NativeAnimatedBorder: React.FC<NativeAnimatedBorderProps> = ({
  width,
  height,
  borderRadius,
  colors,
  glowIntensity,
  pulsing,
}) => {
  // Dynamically import Skia
  const { Canvas, RoundedRect, vec, LinearGradient: SkiaGradient, Group } = require('@shopify/react-native-skia');
  const { useDerivedValue } = require('react-native-reanimated');

  const animationProgress = useSharedValue(0);
  const pulseOpacity = useSharedValue(glowIntensity);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    if (pulsing) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(glowIntensity * 1.5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(glowIntensity * 0.7, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [pulsing, glowIntensity]);

  const gradientStart = useDerivedValue(() => {
    const angle = animationProgress.value * Math.PI * 2;
    return vec(
      width / 2 + Math.cos(angle) * width,
      height / 2 + Math.sin(angle) * height
    );
  });

  const gradientEnd = useDerivedValue(() => {
    const angle = animationProgress.value * Math.PI * 2 + Math.PI;
    return vec(
      width / 2 + Math.cos(angle) * width,
      height / 2 + Math.sin(angle) * height
    );
  });

  const opacity = useDerivedValue(() => pulseOpacity.value);

  return (
    <Canvas style={[StyleSheet.absoluteFill, { borderRadius }]}>
      <Group opacity={opacity}>
        <RoundedRect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          r={borderRadius + 4}
          style="stroke"
          strokeWidth={8}
        >
          <SkiaGradient
            start={gradientStart}
            end={gradientEnd}
            colors={[...colors, colors[0]]}
          />
        </RoundedRect>
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={borderRadius}
          style="stroke"
          strokeWidth={2}
        >
          <SkiaGradient
            start={gradientStart}
            end={gradientEnd}
            colors={[...colors, colors[0]]}
          />
        </RoundedRect>
      </Group>
    </Canvas>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  variant = 'cyan',
  glowIntensity = 0.6,
  pulsing = true,
  breathing = false,
  blurIntensity = 50,
  borderRadius = 32,
  style,
  onPress,
}) => {
  const colors = variantColors[variant];
  const breathScale = useSharedValue(1);

  useEffect(() => {
    if (breathing) {
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.98, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [breathing]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const [layout, setLayout] = React.useState({ width: SCREEN_WIDTH - 48, height: 200 });

  return (
    <Animated.View
      style={[
        styles.container,
        { borderRadius },
        animatedContainerStyle,
        style,
      ]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      {/* Animated neon border */}
      <View style={[StyleSheet.absoluteFill, { borderRadius }]} pointerEvents="none">
        {isWeb ? (
          <WebAnimatedBorder
            colors={colors.gradient}
            glowIntensity={glowIntensity}
            pulsing={pulsing}
            borderRadius={borderRadius}
          />
        ) : (
          <NativeAnimatedBorder
            width={layout.width}
            height={layout.height}
            borderRadius={borderRadius}
            colors={colors.gradient}
            glowIntensity={glowIntensity}
            pulsing={pulsing}
          />
        )}
      </View>

      {/* Glass background */}
      <View style={[styles.glassContainer, { borderRadius: borderRadius - 2 }]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={blurIntensity}
            tint="dark"
            style={[styles.blurView, { borderRadius: borderRadius - 2 }]}
          >
            <View style={styles.glassOverlay}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.15)',
                  'rgba(255, 255, 255, 0.05)',
                  'rgba(255, 255, 255, 0.1)',
                ]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {children}
            </View>
          </BlurView>
        ) : (
          <View style={[styles.androidGlass, { borderRadius: borderRadius - 2 }]}>
            <LinearGradient
              colors={[
                'rgba(30, 34, 53, 0.85)',
                'rgba(30, 34, 53, 0.75)',
                'rgba(30, 34, 53, 0.8)',
              ]}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.12)',
                'rgba(255, 255, 255, 0.03)',
                'rgba(255, 255, 255, 0.08)',
              ]}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.glassOverlay}>{children}</View>
          </View>
        )}
      </View>

      {/* Inner highlight */}
      <View
        style={[
          styles.innerHighlight,
          { borderTopLeftRadius: borderRadius - 2, borderTopRightRadius: borderRadius - 2 },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.25)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </Animated.View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    margin: 4,
  },
  glassContainer: {
    overflow: 'hidden',
    flex: 1,
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
  },
  glassOverlay: {
    flex: 1,
    padding: 20,
  },
  androidGlass: {
    flex: 1,
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 60,
    overflow: 'hidden',
  },
});

export default HolographicCard;
