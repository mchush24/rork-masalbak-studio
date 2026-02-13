/**
 * FeatureCardAnimations - Enhanced card animations
 * Phase 10: Feature Card Animations
 *
 * Provides animated wrappers for feature cards with:
 * - Staggered entrance animations
 * - Idle breathing effect
 * - Attention/highlight animations
 * - Premium badge animations
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

import { typography } from '@/constants/design-system';
interface StaggeredEntranceProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Staggered entrance animation wrapper
 * Cards slide up and fade in with a staggered delay based on index
 */
export function StaggeredEntrance({ children, index, delay = 80, style }: StaggeredEntranceProps) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const timeout = setTimeout(() => {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
        mass: 0.8,
      });
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 120,
      });
    }, index * delay);

    return () => clearTimeout(timeout);
  }, [index, delay, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

interface IdleBreathingProps {
  children: React.ReactNode;
  enabled?: boolean;
  intensity?: 'subtle' | 'normal' | 'strong';
  style?: StyleProp<ViewStyle>;
}

/**
 * Idle breathing animation wrapper
 * Adds a subtle scale pulse to indicate interactivity
 */
export function IdleBreathing({
  children,
  enabled = true,
  intensity = 'subtle',
  style,
}: IdleBreathingProps) {
  const scale = useSharedValue(1);

  const intensityValues = {
    subtle: { min: 1, max: 1.008 },
    normal: { min: 1, max: 1.015 },
    strong: { min: 1, max: 1.025 },
  };

  const { min, max } = intensityValues[intensity];

  useEffect(() => {
    if (enabled) {
      scale.value = withRepeat(
        withSequence(
          withTiming(max, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(min, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    }

    return () => cancelAnimation(scale);
  }, [enabled, min, max, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

interface AttentionPulseProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Attention pulse animation
 * Adds a glowing border pulse for highlighting new features
 */
export function AttentionPulse({
  children,
  active = false,
  color = Colors.secondary.lavender,
  style,
}: AttentionPulseProps) {
  const pulseOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.out(Easing.cubic) }),
          withTiming(0.2, { duration: 800, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseOpacity);
      cancelAnimation(pulseScale);
      pulseOpacity.value = withTiming(0, { duration: 200 });
      pulseScale.value = withTiming(1, { duration: 200 });
    }

    return () => {
      cancelAnimation(pulseOpacity);
      cancelAnimation(pulseScale);
    };
  }, [active, pulseOpacity, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={[styles.attentionContainer, style]}>
      <Animated.View
        style={[styles.attentionPulse, { borderColor: color, shadowColor: color }, pulseStyle]}
      />
      {children}
    </View>
  );
}

interface NewBadgeProps {
  visible?: boolean;
}

/**
 * Animated "NEW" badge for new features
 */
export function NewBadge({ visible = true }: NewBadgeProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-10);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      rotation.value = withRepeat(
        withSequence(withTiming(5, { duration: 1500 }), withTiming(-5, { duration: 1500 })),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.newBadge, animatedStyle]}>
      <LinearGradient
        colors={[Colors.emotion.joy, '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.newBadgeGradient}
      >
        <Sparkles size={10} color={Colors.neutral.white} />
        <Animated.Text style={styles.newBadgeText}>YENİ</Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

interface PremiumIndicatorProps {
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Premium/Pro badge with animated gradient border
 */
export function PremiumIndicator({ visible = true, style }: PremiumIndicatorProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [visible, shimmerPosition]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerPosition.value, [0, 1], [-100, 100]) }],
  }));

  if (!visible) return null;

  return (
    <View style={[styles.premiumContainer, style]}>
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FFD700']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumGradient}
      >
        <Animated.View style={[styles.premiumShimmer, shimmerStyle]} />
        <Crown size={12} color={Colors.neutral.white} />
        <Animated.Text style={styles.premiumText}>PRO</Animated.Text>
      </LinearGradient>
    </View>
  );
}

interface RippleEffectProps {
  children: React.ReactNode;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ripple effect on press
 */
export function RippleEffect({
  children,
  onPress,
  color = 'rgba(255, 255, 255, 0.3)',
  style,
}: RippleEffectProps) {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const _triggerRipple = useCallback(() => {
    rippleScale.value = 0;
    rippleOpacity.value = 1;

    rippleScale.value = withTiming(2.5, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    rippleOpacity.value = withDelay(200, withTiming(0, { duration: 200 }));

    if (onPress) {
      setTimeout(onPress, 100);
    }
  }, [onPress, rippleScale, rippleOpacity]);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.rippleContainer, style]}>
      {children}
      <Animated.View style={[styles.ripple, { backgroundColor: color }, rippleStyle]} />
    </Animated.View>
  );
}

interface SuccessFlashProps {
  children: React.ReactNode;
  trigger?: boolean;
  onComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Success flash animation
 * Green glow flash on successful action
 */
export function SuccessFlash({ children, trigger = false, onComplete, style }: SuccessFlashProps) {
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      flashOpacity.value = withSequence(
        withTiming(0.5, { duration: 150 }),
        withTiming(0, { duration: 300 }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }
  }, [trigger, onComplete, flashOpacity]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <View style={[styles.flashContainer, style]}>
      {children}
      <Animated.View style={[styles.successFlash, flashStyle]} />
    </View>
  );
}

interface IconMicroRotationProps {
  children: React.ReactNode;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Icon micro-rotation animation
 * Subtle rotation for idle state
 */
export function IconMicroRotation({ children, enabled = true, style }: IconMicroRotationProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (enabled) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(-3, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
    }

    return () => cancelAnimation(rotation);
  }, [enabled, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  // Attention Pulse
  attentionContainer: {
    position: 'relative',
  },
  attentionPulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  // New Badge
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
  newBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 9,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
    letterSpacing: 0.5,
  },

  // Premium Indicator
  premiumContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    overflow: 'hidden',
    borderRadius: 8,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  premiumShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  premiumText: {
    fontSize: 9,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
    letterSpacing: 0.5,
  },

  // Ripple
  rippleContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },

  // Success Flash
  flashContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  successFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.emotion.trust,
    borderRadius: 24,
  },
});

export default {
  StaggeredEntrance,
  IdleBreathing,
  AttentionPulse,
  NewBadge,
  PremiumIndicator,
  RippleEffect,
  SuccessFlash,
  IconMicroRotation,
};
