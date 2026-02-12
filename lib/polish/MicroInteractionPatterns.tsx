/**
 * MicroInteractionPatterns - Refined micro-interactions
 * Phase 21: Polish & Micro-details
 *
 * Provides polished interaction patterns:
 * - Refined button press effects
 * - Input focus animations
 * - Pull-to-refresh animations
 * - Scroll-based effects
 * - Transition refinements
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInput,
  TextInputProps,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  interpolateColor,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/lib/haptics';
import { shadows } from '@/constants/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const _AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  scaleValue?: number;
  springConfig?: { damping: number; stiffness: number };
  hapticType?: 'TAP_LIGHT' | 'TAP_MEDIUM' | 'TAP_HEAVY' | 'none';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Refined pressable with smooth scale animation
 */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  scaleValue = 0.97,
  springConfig = { damping: 15, stiffness: 400 },
  hapticType = 'TAP_LIGHT',
  disabled = false,
  style,
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const { tapLight, tapMedium, tapHeavy, error: _hapticError } = useHaptics();

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    if (disabled) return;
    if (hapticType === 'TAP_LIGHT') tapLight();
    else if (hapticType === 'TAP_MEDIUM') tapMedium();
    else if (hapticType === 'TAP_HEAVY') tapHeavy();
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}

interface ShimmerButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  colors?: readonly [string, string];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Button with animated shimmer effect
 */
export function ShimmerButton({
  children,
  onPress,
  colors = [Colors.secondary.lavender, Colors.secondary.rose] as const,
  disabled = false,
  style,
}: ShimmerButtonProps) {
  const shimmerPosition = useSharedValue(0);
  const scale = useSharedValue(1);
  const { tapMedium, error: _hapticError } = useHaptics();

  useEffect(() => {
    // Continuous subtle shimmer
    const animate = () => {
      shimmerPosition.value = withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 0 })
      );
    };

    animate();
    const interval = setInterval(animate, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled) return;
    tapMedium();
    onPress?.();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerPosition.value, [0, 1], [-200, SCREEN_WIDTH + 200]),
      },
    ],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.shimmerButton, buttonStyle, style]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerButtonGradient}
        >
          {children}
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

interface RippleButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  rippleColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Button with material-style ripple effect
 */
export function RippleButton({
  children,
  onPress,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  style,
}: RippleButtonProps) {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);
  const { tapLight, error: _hapticError } = useHaptics();

  const handlePress = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = event.nativeEvent;
    rippleX.value = locationX;
    rippleY.value = locationY;

    tapLight();

    rippleScale.value = 0;
    rippleOpacity.value = 1;

    rippleScale.value = withTiming(3, { duration: 400 });
    rippleOpacity.value = withDelay(200, withTiming(0, { duration: 200 }));

    onPress?.();
  };

  const rippleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: rippleColor,
    left: rippleX.value - 50,
    top: rippleY.value - 50,
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <Pressable onPress={handlePress} style={[styles.rippleButton, style]}>
      <Animated.View style={rippleStyle} pointerEvents="none" />
      {children}
    </Pressable>
  );
}

interface ElasticInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Input with elastic focus animation
 */
export function ElasticInput({
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: ElasticInputProps) {
  const borderWidth = useSharedValue(1);
  const borderColor = useSharedValue(0);
  const shadowRadius = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    borderWidth.value = withSpring(2, { damping: 15 });
    borderColor.value = withTiming(1, { duration: 200 });
    shadowRadius.value = withTiming(8, { duration: 200 });
    scale.value = withSequence(
      withSpring(1.01, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 15 })
    );
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    borderWidth.value = withSpring(1, { damping: 15 });
    borderColor.value = withTiming(0, { duration: 200 });
    shadowRadius.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: interpolateColor(
      borderColor.value,
      [0, 1],
      [Colors.neutral.light, Colors.secondary.lavender]
    ),
    shadowRadius: shadowRadius.value,
    shadowOpacity: interpolate(shadowRadius.value, [0, 8], [0, 0.15]),
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.elasticInputContainer, containerAnimatedStyle, containerStyle]}>
      <TextInput
        style={[styles.elasticInput, style]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={Colors.neutral.medium}
        {...props}
      />
    </Animated.View>
  );
}

interface ParallaxScrollProps {
  children: React.ReactNode;
  parallaxElement: React.ReactNode;
  parallaxHeight?: number;
  parallaxSpeed?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Scroll view with parallax header effect
 */
export function ParallaxScroll({
  children,
  parallaxElement,
  parallaxHeight = 200,
  parallaxSpeed = 0.5,
  style,
}: ParallaxScrollProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const parallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-parallaxHeight, 0, parallaxHeight],
      [-parallaxHeight * parallaxSpeed, 0, parallaxHeight * parallaxSpeed],
      Extrapolation.CLAMP
    );

    const scale = interpolate(scrollY.value, [-parallaxHeight, 0], [1.5, 1], Extrapolation.CLAMP);

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, parallaxHeight * 0.5],
      [0, 0.6],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={[styles.parallaxContainer, style]}>
      <Animated.View style={[styles.parallaxElement, { height: parallaxHeight }, parallaxStyle]}>
        {parallaxElement}
        <Animated.View style={[styles.parallaxOverlay, overlayStyle]} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: parallaxHeight }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

interface BouncyCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Card with bouncy entrance and press animation
 */
export function BouncyCard({ children, onPress, style }: BouncyCardProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(-2);
  const { tapLight, error: _hapticError } = useHaptics();

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
    rotation.value = withSpring(0, { damping: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    rotation.value = withSpring(-1, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    rotation.value = withSpring(0, { damping: 15 });
  };

  const handlePress = () => {
    tapLight();
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  if (onPress) {
    return (
      <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.bouncyCard, animatedStyle, style]}>{children}</Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={[styles.bouncyCard, animatedStyle, style]}>{children}</Animated.View>
  );
}

interface GlowingBorderProps {
  children: React.ReactNode;
  glowColor?: string;
  intensity?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Container with animated glowing border
 */
export function GlowingBorder({
  children,
  glowColor = Colors.secondary.lavender,
  intensity = 0.5,
  animated = true,
  style,
}: GlowingBorderProps) {
  const glowOpacity = useSharedValue(intensity);

  useEffect(() => {
    if (animated) {
      glowOpacity.value = withSequence(
        withTiming(intensity * 0.5, { duration: 1500 }),
        withTiming(intensity, { duration: 1500 })
      );

      const interval = setInterval(() => {
        glowOpacity.value = withSequence(
          withTiming(intensity * 0.5, { duration: 1500 }),
          withTiming(intensity, { duration: 1500 })
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [animated, intensity, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.glowingBorder,
        {
          shadowColor: glowColor,
          borderColor: glowColor + '40',
        },
        glowStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: StyleProp<TextStyle>;
}

/**
 * Typewriter text reveal effect
 */
export function TypewriterText({ text, speed = 50, onComplete, style }: TypewriterTextProps) {
  const [displayText, setDisplayText] = React.useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayText('');

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <Animated.Text style={style}>
      {displayText}
      <Animated.Text style={styles.cursor}>|</Animated.Text>
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  // Shimmer Button
  shimmerButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  shimmerButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },

  // Ripple Button
  rippleButton: {
    overflow: 'hidden',
    position: 'relative',
  },

  // Elastic Input
  elasticInputContainer: {
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    shadowColor: Colors.secondary.lavender,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  elasticInput: {
    padding: 16,
    fontSize: 16,
    color: Colors.neutral.dark,
  },

  // Parallax
  parallaxContainer: {
    flex: 1,
  },
  parallaxElement: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  parallaxOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.neutral.darkest,
  },

  // Bouncy Card
  bouncyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 20,
    ...shadows.md,
  },

  // Glowing Border
  glowingBorder: {
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: Colors.neutral.white,
  },

  // Typewriter
  cursor: {
    opacity: 0.7,
  },
});

export default {
  PressableScale,
  ShimmerButton,
  RippleButton,
  ElasticInput,
  ParallaxScroll,
  BouncyCard,
  GlowingBorder,
  TypewriterText,
};
