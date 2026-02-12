/**
 * SuccessAnimation - Animated success/error/warning states
 *
 * Features:
 * - Checkmark draw animation
 * - Error shake animation
 * - Warning pulse animation
 * - Haptic feedback
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { spring, duration } from '@/constants/animations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const _AnimatedPath = Animated.createAnimatedComponent(Path);

type StateType = 'success' | 'error' | 'warning' | 'info';

interface SuccessAnimationProps {
  type?: StateType;
  size?: number;
  onComplete?: () => void;
  autoPlay?: boolean;
}

const STATE_COLORS: Record<StateType, string> = {
  success: Colors.semantic.success,
  error: Colors.semantic.error,
  warning: Colors.semantic.warning,
  info: Colors.semantic.info,
};

const STATE_ICONS: Record<StateType, string> = {
  success: 'M9 12l2 2 4-4', // Checkmark
  error: 'M15 9l-6 6m0-6l6 6', // X
  warning: 'M12 9v2m0 4h.01', // Exclamation
  info: 'M12 16v-4m0-4h.01', // Info
};

export function SuccessAnimation({
  type = 'success',
  size = 80,
  onComplete,
  autoPlay = true,
}: SuccessAnimationProps) {
  const circleProgress = useSharedValue(0);
  const iconProgress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const shake = useSharedValue(0);

  const color = STATE_COLORS[type];
  const iconPath = STATE_ICONS[type];
  const circumference = 2 * Math.PI * (size / 2 - 4);

  useEffect(() => {
    if (autoPlay) {
      playAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, type]);

  const playAnimation = () => {
    // Reset values
    circleProgress.value = 0;
    iconProgress.value = 0;
    scale.value = 0.8;
    shake.value = 0;

    // Animate circle
    circleProgress.value = withTiming(1, {
      duration: duration.normal,
      easing: Easing.out(Easing.ease),
    });

    // Animate scale
    scale.value = withSpring(1, spring.bouncy);

    // Animate icon with delay
    iconProgress.value = withDelay(150, withTiming(1, { duration: duration.normal }));

    // Trigger haptic
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Add shake for error
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } else if (type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Call onComplete
    if (onComplete) {
      setTimeout(() => {
        runOnJS(onComplete)();
      }, duration.slow);
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - circleProgress.value),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconProgress.value,
    transform: [{ scale: interpolate(iconProgress.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          stroke={color}
          strokeWidth={3}
          fill="none"
          opacity={0.2}
        />
        {/* Animated circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={circleProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Icon */}
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
          <Path
            d={iconPath}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SuccessAnimation;
