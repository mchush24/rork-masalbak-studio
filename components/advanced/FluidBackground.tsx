/**
 * FluidBackground - Bioluminescent Swirling Energy Vortex
 *
 * Uses React Native Skia for GPU-accelerated shader effects on native
 * Falls back to animated gradients on web platform
 */

import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Check if we're on web platform
const isWeb = Platform.OS === 'web';

// ============================================
// COMPONENT PROPS
// ============================================
interface FluidBackgroundProps {
  intensity?: number;
  speed?: number;
  showOrbs?: boolean;
  style?: object;
}

// ============================================
// WEB FALLBACK - Animated Gradient Orbs
// ============================================
interface WebOrbProps {
  colors: readonly string[];
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const WebFloatingOrb: React.FC<WebOrbProps> = ({ colors, size, x, y, delay, duration }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(30, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: duration * 0.7, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: duration * 0.7, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration * 0.8, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.9, { duration: duration * 0.8, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          left: x,
          top: y,
          borderRadius: size / 2,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={colors as unknown as [string, string, ...string[]]}
        style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </Animated.View>
  );
};

// ============================================
// WEB FALLBACK COMPONENT
// ============================================
const WebFluidBackground: React.FC<FluidBackgroundProps> = ({ style }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.canvas, style]}>
      {/* Base dark gradient */}
      <LinearGradient
        colors={['#0A0E1A', '#1A1E3A', '#2A2E4A', '#1A2E3A', '#0A1E2A']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated rotating gradient overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, rotatingStyle]}>
        <LinearGradient
          colors={[
            'rgba(0, 245, 255, 0.15)',
            'rgba(185, 142, 255, 0.1)',
            'transparent',
            'rgba(255, 158, 191, 0.1)',
            'rgba(112, 255, 214, 0.15)',
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { transform: [{ scale: 2 }] }]}
        />
      </Animated.View>

      {/* Floating orbs */}
      <WebFloatingOrb
        colors={['rgba(0, 245, 255, 0.5)', 'rgba(0, 245, 255, 0.1)', 'transparent']}
        size={120}
        x={SCREEN_WIDTH * 0.1}
        y={SCREEN_HEIGHT * 0.1}
        delay={0}
        duration={4000}
      />
      <WebFloatingOrb
        colors={['rgba(185, 142, 255, 0.5)', 'rgba(185, 142, 255, 0.1)', 'transparent']}
        size={90}
        x={SCREEN_WIDTH * 0.7}
        y={SCREEN_HEIGHT * 0.2}
        delay={500}
        duration={3500}
      />
      <WebFloatingOrb
        colors={['rgba(255, 158, 191, 0.5)', 'rgba(255, 158, 191, 0.1)', 'transparent']}
        size={100}
        x={SCREEN_WIDTH * 0.05}
        y={SCREEN_HEIGHT * 0.5}
        delay={1000}
        duration={4500}
      />
      <WebFloatingOrb
        colors={['rgba(112, 255, 214, 0.4)', 'rgba(112, 255, 214, 0.1)', 'transparent']}
        size={80}
        x={SCREEN_WIDTH * 0.75}
        y={SCREEN_HEIGHT * 0.6}
        delay={750}
        duration={3800}
      />
      <WebFloatingOrb
        colors={['rgba(255, 217, 61, 0.4)', 'rgba(255, 217, 61, 0.1)', 'transparent']}
        size={70}
        x={SCREEN_WIDTH * 0.4}
        y={SCREEN_HEIGHT * 0.8}
        delay={250}
        duration={4200}
      />

      {/* Top vignette */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.4)', 'transparent']}
        style={[styles.vignette, { height: SCREEN_HEIGHT * 0.3 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
        style={[styles.vignetteBottom, { height: SCREEN_HEIGHT * 0.3 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
};

// ============================================
// NATIVE SKIA COMPONENT
// ============================================
const NativeFluidBackground: React.FC<FluidBackgroundProps> = ({
  intensity = 1.0,
  speed = 1.0,
  showOrbs = true,
  style,
}) => {
  // Dynamically import Skia for native
  const {
    Canvas,
    Rect,
    Skia,
    vec,
    Fill,
    LinearGradient: SkiaLinearGradient,
    RadialGradient,
    Group,
    Circle,
    useClock,
    Shader,
  } = require('@shopify/react-native-skia');

  // Try to create shader
  let fluidPlasmaShader: any = null;
  try {
    fluidPlasmaShader = Skia.RuntimeEffect.Make(`
      uniform float2 iResolution;
      uniform float iTime;
      uniform float intensity;

      float hash(float2 p) {
        return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
      }

      float noise(float2 p) {
        float2 i = floor(p);
        float2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + float2(1.0, 0.0));
        float c = hash(i + float2(0.0, 1.0));
        float d = hash(i + float2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(float2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      half4 main(float2 fragCoord) {
        float2 uv = fragCoord / iResolution;
        float2 center = float2(0.5, 0.5);
        float time = iTime * 0.15;
        float2 q = uv;

        float flow1 = fbm(q * 3.0 + float2(time * 0.5, time * 0.3));
        float flow2 = fbm(q * 4.0 - float2(time * 0.4, time * 0.2) + flow1 * 0.5);
        float flow3 = fbm(q * 2.0 + float2(time * 0.3, -time * 0.4) + flow2 * 0.3);

        float combined = (flow1 + flow2 * 0.5 + flow3 * 0.25) / 1.75;

        float3 col1 = float3(0.0, 0.96, 1.0);
        float3 col2 = float3(0.73, 0.56, 1.0);
        float3 col3 = float3(1.0, 0.62, 0.75);
        float3 col4 = float3(1.0, 0.84, 0.0);
        float3 col5 = float3(0.44, 1.0, 0.84);

        float t = combined * intensity;
        float3 color;

        if (t < 0.25) {
          color = mix(col1, col2, t * 4.0);
        } else if (t < 0.5) {
          color = mix(col2, col3, (t - 0.25) * 4.0);
        } else if (t < 0.75) {
          color = mix(col3, col4, (t - 0.5) * 4.0);
        } else {
          color = mix(col4, col5, (t - 0.75) * 4.0);
        }

        float glow = pow(flow2, 2.0) * 0.5;
        color += float3(glow * 0.5, glow * 0.3, glow * 0.2);

        float vignette = 1.0 - length(uv - center) * 0.4;
        color *= vignette;

        float gray = dot(color, float3(0.299, 0.587, 0.114));
        color = mix(float3(gray), color, 0.85);

        return half4(color, 1.0);
      }
    `);
  } catch (e) {
    // Shader compilation failed, will use fallback
  }

  // Animation time value
  const clock = useClock();
  const time = require('react-native-reanimated').useDerivedValue(() => clock.value * 0.001 * speed);

  // Shader uniforms
  const uniforms = require('react-native-reanimated').useDerivedValue(() => ({
    iResolution: vec(SCREEN_WIDTH, SCREEN_HEIGHT),
    iTime: time.value,
    intensity: intensity,
  }));

  // Orb configurations for native
  const orbs = [
    { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.15, radius: 60, colors: ['#00F5FF80', '#00F5FF20', 'transparent'] },
    { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.25, radius: 45, colors: ['#B98EFF80', '#B98EFF20', 'transparent'] },
    { x: SCREEN_WIDTH * 0.15, y: SCREEN_HEIGHT * 0.6, radius: 55, colors: ['#FF9EBF80', '#FF9EBF20', 'transparent'] },
    { x: SCREEN_WIDTH * 0.85, y: SCREEN_HEIGHT * 0.7, radius: 40, colors: ['#70FFD680', '#70FFD620', 'transparent'] },
  ];

  // If shader failed, use gradient fallback
  if (!fluidPlasmaShader) {
    return (
      <Canvas style={[styles.canvas, style]}>
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(SCREEN_WIDTH, SCREEN_HEIGHT)}
            colors={['#1A1E2E', '#2A2E4E', '#3A2E5E', '#2A3E4E']}
          />
        </Rect>
        {showOrbs && orbs.map((orb, i) => (
          <Circle key={i} cx={orb.x} cy={orb.y} r={orb.radius}>
            <RadialGradient c={vec(orb.x, orb.y)} r={orb.radius} colors={orb.colors} />
          </Circle>
        ))}
      </Canvas>
    );
  }

  return (
    <Canvas style={[styles.canvas, style]}>
      {/* Main fluid shader background */}
      <Fill>
        <Shader source={fluidPlasmaShader} uniforms={uniforms} />
      </Fill>

      {/* Overlay gradient */}
      <Group>
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <SkiaLinearGradient
            start={vec(0, 0)}
            end={vec(0, SCREEN_HEIGHT)}
            colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.15)']}
          />
        </Rect>
      </Group>

      {/* Floating energy orbs */}
      {showOrbs && orbs.map((orb, i) => (
        <Group key={i} opacity={0.6}>
          <Circle cx={orb.x} cy={orb.y} r={orb.radius}>
            <RadialGradient c={vec(orb.x, orb.y)} r={orb.radius} colors={orb.colors} />
          </Circle>
        </Group>
      ))}

      {/* Top vignette */}
      <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.3}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, SCREEN_HEIGHT * 0.3)}
          colors={['rgba(0,0,0,0.3)', 'transparent']}
        />
      </Rect>

      {/* Bottom vignette */}
      <Rect x={0} y={SCREEN_HEIGHT * 0.7} width={SCREEN_WIDTH} height={SCREEN_HEIGHT * 0.3}>
        <SkiaLinearGradient
          start={vec(0, SCREEN_HEIGHT * 0.7)}
          end={vec(0, SCREEN_HEIGHT)}
          colors={['transparent', 'rgba(0,0,0,0.25)']}
        />
      </Rect>
    </Canvas>
  );
};

// ============================================
// MAIN EXPORT - Platform Switch
// ============================================
export const FluidBackground: React.FC<FluidBackgroundProps> = (props) => {
  if (isWeb) {
    return <WebFluidBackground {...props} />;
  }
  return <NativeFluidBackground {...props} />;
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default FluidBackground;
