import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { RenkooColors } from '@/constants/colors';
import { textShadows, shadows, typography, spacing, radius } from '@/constants/design-system';
import { buttonSizes, buttonStyles } from '@/constants/tokens';

interface JellyButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradientColors?: readonly [string, string, ...string[]];
  size?: 'small' | 'medium' | 'large';
  /** Custom accessibility label (defaults to title) */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const JellyButton: React.FC<JellyButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  gradientColors = RenkooColors.gradients.jellyPrimary,
  size = 'large',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
      mass: 0.8,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
      mass: 0.6,
    });
  };

  // Map JellyButton sizes to standardized button sizes
  const sizeStyles = {
    small: {
      paddingVertical: buttonSizes.sm.paddingVertical,
      paddingHorizontal: buttonSizes.sm.paddingHorizontal,
      borderRadius: buttonSizes.sm.borderRadius,
      fontSize: buttonSizes.sm.fontSize,
    },
    medium: {
      paddingVertical: buttonSizes.md.paddingVertical,
      paddingHorizontal: buttonSizes.md.paddingHorizontal,
      borderRadius: buttonSizes.md.borderRadius,
      fontSize: buttonSizes.md.fontSize,
    },
    large: {
      paddingVertical: buttonSizes.lg.paddingVertical,
      paddingHorizontal: buttonSizes.lg.paddingHorizontal,
      borderRadius: buttonSizes.lg.borderRadius,
      fontSize: buttonSizes.lg.fontSize,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
            borderRadius: currentSize.borderRadius,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { fontSize: currentSize.fontSize },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    ...shadows.colored(RenkooColors.brand.jellyPurple),
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: RenkooColors.text.light,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
    ...textShadows.sm,
  },
});

export default JellyButton;
