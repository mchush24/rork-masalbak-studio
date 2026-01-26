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

  const sizeStyles = {
    small: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 20,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 26,
      fontSize: 16,
    },
    large: {
      paddingVertical: 20,
      paddingHorizontal: 40,
      borderRadius: 30,
      fontSize: 18,
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
    shadowColor: RenkooColors.brand.jellyPurple,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: RenkooColors.text.light,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default JellyButton;
