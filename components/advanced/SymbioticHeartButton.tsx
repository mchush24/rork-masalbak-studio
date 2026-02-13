/**
 * SymbioticHeartButton - Organic Heart-Shaped Button
 *
 * The main CTA button that looks like a glowing, squishy heart
 * Platform-aware: uses Skia on native, SVG on web
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { typography } from '@/constants/design-system';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// ============================================
// TYPES
// ============================================
interface SymbioticHeartButtonProps {
  label?: string;
  subLabel?: string;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
}

// ============================================
// HEART SVG PATH
// ============================================
const createHeartSvgPath = (size: number): string => {
  const _scale = size / 100;
  return `
    M 50 85
    C 25 65, 5 45, 5 30
    C 5 15, 20 5, 35 5
    C 45 5, 50 15, 50 20
    C 50 15, 55 5, 65 5
    C 80 5, 95 15, 95 30
    C 95 45, 75 65, 50 85
    Z
  `;
};

// ============================================
// ANIMATED PRESSABLE
// ============================================
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================
// WEB HEART (SVG-based)
// ============================================
const WebHeart: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="heartGradient" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#FFE4B5" />
          <Stop offset="30%" stopColor="#FFCBA4" />
          <Stop offset="70%" stopColor="#FF9EBF" />
          <Stop offset="100%" stopColor="#FF6B9D" />
        </RadialGradient>
        <RadialGradient id="heartHighlight" cx="35%" cy="30%" r="40%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
          <Stop offset="100%" stopColor="transparent" />
        </RadialGradient>
      </Defs>

      {/* Shadow */}
      <Path d={createHeartSvgPath(100)} fill="rgba(0, 0, 0, 0.2)" transform="translate(2, 4)" />

      {/* Main heart */}
      <Path d={createHeartSvgPath(100)} fill="url(#heartGradient)" />

      {/* Highlight */}
      <Path d={createHeartSvgPath(100)} fill="url(#heartHighlight)" />
    </Svg>
  );
};

// ============================================
// NATIVE HEART (Skia-based)
// ============================================
const NativeHeart: React.FC<{ size: number }> = ({ size }) => {
  const {
    Canvas,
    Path,
    Skia,
    RadialGradient,
    vec,
    Group,
    Blur,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require('@shopify/react-native-skia');

  const heartPath = Skia.Path.MakeFromSVGString(`
    M ${size / 2} ${size * 0.85}
    C ${size * 0.25} ${size * 0.65}, ${size * 0.05} ${size * 0.45}, ${size * 0.05} ${size * 0.3}
    C ${size * 0.05} ${size * 0.15}, ${size * 0.2} ${size * 0.05}, ${size * 0.35} ${size * 0.05}
    C ${size * 0.45} ${size * 0.05}, ${size * 0.5} ${size * 0.15}, ${size * 0.5} ${size * 0.2}
    C ${size * 0.5} ${size * 0.15}, ${size * 0.55} ${size * 0.05}, ${size * 0.65} ${size * 0.05}
    C ${size * 0.8} ${size * 0.05}, ${size * 0.95} ${size * 0.15}, ${size * 0.95} ${size * 0.3}
    C ${size * 0.95} ${size * 0.45}, ${size * 0.75} ${size * 0.65}, ${size * 0.5} ${size * 0.85}
    Z
  `);

  if (!heartPath) {
    return <WebHeart size={size} />;
  }

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Shadow */}
      <Group transform={[{ translateY: 8 }]}>
        <Path path={heartPath} color="rgba(0, 0, 0, 0.2)">
          <Blur blur={10} />
        </Path>
      </Group>

      {/* Main heart */}
      <Path path={heartPath}>
        <RadialGradient
          c={vec(size / 2, size / 2 - 10)}
          r={size * 0.5}
          colors={['#FFE4B5', '#FFCBA4', '#FF9EBF', '#FF6B9D']}
          positions={[0, 0.3, 0.7, 1]}
        />
      </Path>

      {/* Inner glow */}
      <Group opacity={0.6}>
        <Path path={heartPath} style="stroke" strokeWidth={3}>
          <RadialGradient
            c={vec(size / 2, size / 2 - 20)}
            r={size * 0.4}
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0)']}
          />
        </Path>
      </Group>

      {/* Specular highlight */}
      <Group opacity={0.4} transform={[{ translateX: -size * 0.1 }, { translateY: -size * 0.1 }]}>
        <Path path={heartPath}>
          <RadialGradient
            c={vec(size * 0.35, size * 0.35)}
            r={size * 0.25}
            colors={['rgba(255, 255, 255, 0.7)', 'transparent']}
          />
        </Path>
      </Group>
    </Canvas>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const SymbioticHeartButton: React.FC<SymbioticHeartButtonProps> = ({
  label = 'Dokun ve Hisset',
  subLabel,
  size = SCREEN_WIDTH * 0.45,
  onPress,
  disabled = false,
  style,
}) => {
  // Animation values
  const heartbeatScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.6);
  const pressScale = useSharedValue(1);
  const lightPulse = useSharedValue(0);

  // Platform-safe haptics
  const triggerHaptic = useCallback((feedbackStyle: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(feedbackStyle).catch(() => {});
    }
  }, []);

  // Heartbeat animation
  useEffect(() => {
    heartbeatScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 150, easing: Easing.in(Easing.quad) }),
        withDelay(
          100,
          withSequence(
            withTiming(1.05, { duration: 120, easing: Easing.out(Easing.quad) }),
            withTiming(1.0, { duration: 150, easing: Easing.in(Easing.quad) })
          )
        ),
        withTiming(1.0, { duration: 800 })
      ),
      -1,
      false
    );

    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    pressScale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
    lightPulse.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
  }, [disabled, triggerHaptic, pressScale, lightPulse]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [pressScale]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    onPress?.();
  }, [disabled, onPress]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeatScale.value * pressScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
    transform: [{ scale: 1 + glowIntensity.value * 0.1 }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: lightPulse.value,
    transform: [{ scale: 1 + lightPulse.value * 0.3 }],
  }));

  return (
    <AnimatedPressable
      style={[styles.container, { width: size, height: size }, style, containerAnimatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {/* Outer glow layers */}
      <Animated.View style={[styles.glowLayer, styles.glowOuter, glowAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(255, 158, 191, 0.3)', 'rgba(255, 228, 181, 0.2)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.glowLayer, styles.glowMiddle, glowAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(255, 203, 164, 0.4)', 'rgba(255, 158, 191, 0.3)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Press pulse effect */}
      <Animated.View style={[styles.pulseLayer, pulseAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 228, 181, 0.6)', 'transparent']}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.3 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Heart shape */}
      <View style={styles.heartContainer}>
        {isWeb ? <WebHeart size={size} /> : <NativeHeart size={size} />}
      </View>

      {/* Label overlay */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
      </View>

      {/* Disabled overlay */}
      {disabled && <View style={styles.disabledOverlay} />}
    </AnimatedPressable>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  glowLayer: {
    position: 'absolute',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  glowOuter: {
    width: '150%',
    height: '150%',
    left: '-25%',
    top: '-25%',
  },
  glowMiddle: {
    width: '130%',
    height: '130%',
    left: '-15%',
    top: '-15%',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  pulseLayer: {
    position: 'absolute',
    width: '160%',
    height: '160%',
    left: '-30%',
    top: '-30%',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  heartContainer: {
    width: '100%',
    height: '100%',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 17,
    fontFamily: typography.family.extrabold,
    color: '#3D1A1A',
    textAlign: 'center',
    letterSpacing: 0.3,
    ...Platform.select({
      web: {
        textShadow: '0px 1px 2px rgba(255, 255, 255, 0.5), 0px -1px 0px rgba(0, 0, 0, 0.1)',
      },
      default: {
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  subLabel: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: 'rgba(61, 26, 26, 0.85)',
    textAlign: 'center',
    marginTop: 2,
    ...Platform.select({
      web: {
        textShadow: '0px 1px 1px rgba(255, 255, 255, 0.4)',
      },
      default: {
        textShadowColor: 'rgba(255, 255, 255, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
      },
    }),
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 1000,
  },
});

export default SymbioticHeartButton;
