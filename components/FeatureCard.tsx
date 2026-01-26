import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight } from 'lucide-react-native';
import { RenkooColors } from '@/constants/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type FeatureType = 'analysis' | 'chat' | 'story' | 'emotion' | 'reward' | 'coloring';

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  type?: FeatureType;
  style?: StyleProp<ViewStyle>;
  showArrow?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  comingSoon?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  type = 'analysis',
  style,
  showArrow = true,
  size = 'medium',
  disabled = false,
  comingSoon = false,
}) => {
  const scale = useSharedValue(1);

  const cardConfig = RenkooColors.featureCards[type];
  const isDisabled = disabled || comingSoon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isDisabled) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const sizeStyles = {
    small: {
      padding: 14,
      iconSize: 40,
      titleSize: 14,
      subtitleSize: 11,
      borderRadius: 20,
    },
    medium: {
      padding: 18,
      iconSize: 52,
      titleSize: 16,
      subtitleSize: 13,
      borderRadius: 24,
    },
    large: {
      padding: 22,
      iconSize: 64,
      titleSize: 18,
      subtitleSize: 14,
      borderRadius: 28,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle, isDisabled && styles.containerDisabled, style]}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <LinearGradient
        colors={isDisabled ? ['#F3F4F6', '#E5E7EB'] : cardConfig.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            padding: currentSize.padding,
            borderRadius: currentSize.borderRadius,
          },
        ]}
      >
        {/* Glassmorphism overlay */}
        <View style={[styles.glassOverlay, { borderRadius: currentSize.borderRadius }]} />

        {/* Holographic shimmer effect */}
        {!isDisabled && (
          <LinearGradient
            colors={RenkooColors.holographic.shimmer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.shimmer, { borderRadius: currentSize.borderRadius }]}
          />
        )}

        {/* Coming Soon Badge */}
        {comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Yakında</Text>
          </View>
        )}

        <View style={[styles.content, isDisabled && styles.contentDisabled]}>
          {/* Icon container */}
          <View
            style={[
              styles.iconContainer,
              {
                width: currentSize.iconSize,
                height: currentSize.iconSize,
                borderRadius: currentSize.iconSize / 2.5,
                borderColor: isDisabled ? '#D1D5DB' : cardConfig.border,
              },
              isDisabled && styles.iconContainerDisabled,
            ]}
          >
            {icon}
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { fontSize: currentSize.titleSize },
                isDisabled && styles.titleDisabled,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { fontSize: currentSize.subtitleSize },
                  isDisabled && styles.subtitleDisabled,
                ]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Arrow */}
          {showArrow && !comingSoon && (
            <View style={styles.arrowContainer}>
              <ChevronRight size={20} color={isDisabled ? '#9CA3AF' : RenkooColors.text.secondary} />
            </View>
          )}
        </View>

        {/* Border */}
        <View
          style={[
            styles.border,
            {
              borderRadius: currentSize.borderRadius,
              borderColor: isDisabled ? '#D1D5DB' : cardConfig.border,
            },
          ]}
        />
      </LinearGradient>
    </AnimatedPressable>
  );
};

// Compact version for grid layouts
export const FeatureCardCompact: React.FC<{
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
  type?: FeatureType;
  style?: StyleProp<ViewStyle>;
}> = ({ title, icon, onPress, type = 'analysis', style }) => {
  const scale = useSharedValue(1);
  const cardConfig = RenkooColors.featureCards[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      style={[styles.compactContainer, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <BlurView intensity={70} tint="light" style={styles.compactBlur}>
        <LinearGradient
          colors={[...cardConfig.gradient, 'rgba(255,255,255,0.5)']}
          style={styles.compactGradient}
        >
          <View style={styles.compactIconContainer}>{icon}</View>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {title}
          </Text>
        </LinearGradient>
      </BlurView>
      <View style={[styles.compactBorder, { borderColor: cardConfig.border }]} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  containerDisabled: {
    opacity: 0.7,
  },
  contentDisabled: {
    opacity: 0.6,
  },
  iconContainerDisabled: {
    backgroundColor: 'rgba(229, 231, 235, 0.7)',
  },
  titleDisabled: {
    color: '#6B7280',
  },
  subtitleDisabled: {
    color: '#9CA3AF',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    color: RenkooColors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    color: RenkooColors.text.secondary,
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  // Compact styles
  compactContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  compactBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  compactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: RenkooColors.text.primary,
    textAlign: 'center',
  },
  compactBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});

export default FeatureCard;
