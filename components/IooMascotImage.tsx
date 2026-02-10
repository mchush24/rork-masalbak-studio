/**
 * IooMascotImage - Custom Designed Mascot with 3D Effects
 *
 * Uses the user's custom designed fluffy cloud mascot image
 * with rainbow glasses and green sparkly hair.
 *
 * 3D-like Features:
 * - Layered shadows for depth
 * - Breathing animation with scale
 * - Floating animation
 * - Subtle tilt/rotation for dynamism
 * - Multiple glow layers
 * - Parallax-like shadow movement
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { IooMood, IooSize, getPixelSize } from '@/constants/ioo-config';
import { Colors } from '@/constants/colors';

// Re-export types for backwards compatibility
export type { IooMood, IooSize } from '@/constants/ioo-config';

interface IooProps {
  size?: IooSize | number;
  mood?: IooMood;
  animated?: boolean;
  showGlow?: boolean;
  showSparkles?: boolean;
  onPress?: () => void;
}

export const IooMascotImage = memo(function IooMascotImage({
  size = 'medium',
  mood: _mood = 'happy',
  animated = true,
  showGlow = true,
  onPress,
}: IooProps) {
  const dimensions = getPixelSize(size);

  // Animation values
  const breathe = useSharedValue(1);
  const float = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);
  const shadowOffset = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

    // Gentle breathing animation - 3D scale effect
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.97, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Floating animation - up and down
    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle tilt animation for 3D feel - X axis
    tiltX.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.ease) })),
        withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle tilt animation - Y axis (slightly offset timing)
    tiltY.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shadow parallax - moves opposite to float for depth
    shadowOffset.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse
    if (showGlow) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.25, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, showGlow]);

  // Main container animation - breathing + floating + tilt
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathe.value },
      { translateY: float.value },
      { perspective: 800 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
    ],
  }));

  // Outer glow animation
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0.25, 0.6], [1, 1.1]) }],
  }));

  // Shadow animation - moves opposite for parallax depth effect
  const shadowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: shadowOffset.value + 8 },
      { scaleX: interpolate(float.value, [-6, 6], [0.9, 1.1]) },
    ],
    opacity: interpolate(float.value, [-6, 6], [0.3, 0.15]),
  }));

  const Content = (
    <View style={[styles.wrapper, { width: dimensions + 20, height: dimensions + 30 }]}>
      {/* Ground shadow - subtle for 3D grounding */}
      <Animated.View
        style={[
          styles.groundShadow,
          {
            width: dimensions * 0.5,
            height: dimensions * 0.1,
            bottom: 5,
            left: (dimensions + 20 - dimensions * 0.5) / 2,
          },
          shadowStyle,
        ]}
      />

      <Animated.View
        style={[styles.container, { width: dimensions, height: dimensions, overflow: 'hidden', borderRadius: dimensions / 2 }, containerStyle]}
      >
        {/* Subtle ambient glow behind the 3D model */}
        {showGlow && (
          <Animated.View
            style={[
              styles.ambientGlow,
              {
                width: dimensions * 1.1,
                height: dimensions * 1.1,
                borderRadius: dimensions * 0.55,
              },
              glowStyle,
            ]}
          />
        )}

        {/* 3D Mascot image - already has built-in lighting */}
        <Image
          source={require('@/assets/images/ioo-mascot.png')}
          style={[
            styles.mascotImage,
            {
              width: dimensions,
              height: dimensions,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {Content}
      </Pressable>
    );
  }

  return Content;
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  // Ground shadow for 3D grounding effect
  groundShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(150, 120, 180, 0.25)',
    borderRadius: 100,
    ...Platform.select({
      ios: {
        shadowColor: Colors.secondary.violet,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  // Subtle ambient glow - complements the 3D model's lighting
  ambientGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(180, 160, 220, 0.2)',
  },
  mascotImage: {
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

// Re-exports for compatibility
export { IooMascotImage as Ioo };
export default IooMascotImage;
