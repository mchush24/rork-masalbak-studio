import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { RenkooColors } from '@/constants/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface OrganicContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'glass' | 'gradient' | 'solid';
  gradientColors?: readonly [string, string, ...string[]];
  intensity?: number;
  animated?: boolean;
  glowColor?: string;
  shape?: 'blob' | 'cloud' | 'heart' | 'rounded';
}

export const OrganicContainer: React.FC<OrganicContainerProps> = ({
  children,
  style,
  variant = 'glass',
  gradientColors,
  intensity = 60,
  animated = false,
  glowColor,
  shape = 'rounded',
}) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (!animated) return;

    pulseScale.value = withRepeat(
      withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Different border radius configurations for organic shapes
  const getShapeStyle = (): ViewStyle => {
    switch (shape) {
      case 'blob':
        return {
          borderTopLeftRadius: 60,
          borderTopRightRadius: 40,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 70,
        };
      case 'cloud':
        return {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        };
      case 'heart':
        return {
          borderTopLeftRadius: 45,
          borderTopRightRadius: 45,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
        };
      case 'rounded':
      default:
        return {
          borderRadius: 32,
        };
    }
  };

  const shapeStyle = getShapeStyle();

  const renderContent = () => {
    if (variant === 'gradient' && gradientColors) {
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientFill, shapeStyle]}
        >
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      );
    }

    if (variant === 'solid') {
      return (
        <View style={[styles.solidFill, shapeStyle]}>
          <View style={styles.content}>{children}</View>
        </View>
      );
    }

    // Glass variant (default)
    return (
      <>
        <BlurView intensity={intensity} tint="light" style={[styles.blurView, shapeStyle]} />
        <View style={[styles.glassBorder, shapeStyle]} />
        <View style={[styles.glassOverlay, shapeStyle]} />
        <View style={styles.content}>{children}</View>
      </>
    );
  };

  const Container = animated ? Animated.View : View;
  const containerAnimStyle = animated ? animatedContainerStyle : undefined;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Glow effect */}
      {glowColor && (
        <Animated.View
          style={[styles.glow, animatedGlowStyle, shapeStyle, { backgroundColor: glowColor }]}
        />
      )}

      <Container style={[styles.container, shapeStyle, containerAnimStyle]}>
        {renderContent()}
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    opacity: 0.3,
  },
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RenkooColors.glass.surface,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: RenkooColors.glass.borderStrong,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientFill: {
    flex: 1,
  },
  solidFill: {
    flex: 1,
    backgroundColor: RenkooColors.glass.surfaceLight,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default OrganicContainer;
