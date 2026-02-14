import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronRight } from 'lucide-react-native';
import { RenkooColors, Colors } from '@/constants/colors';
import { shadows, createShadow, typography } from '@/constants/design-system';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useFeedback } from '@/hooks/useFeedback';
import { hapticImpact } from '@/lib/platform';

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
  /** Show "NEW" badge with attention animation */
  isNew?: boolean;
  /** Index for staggered entrance animation (0-based) */
  entranceIndex?: number;
  /** Delay between staggered items in ms */
  entranceDelay?: number;
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
  isNew = false,
  entranceIndex = 0,
  entranceDelay = 100,
}) => {
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);
  const { feedback } = useFeedback();

  const cardConfig = RenkooColors.featureCards[type] || RenkooColors.featureCards.analysis;
  const isDisabled = disabled || comingSoon;

  // Attention animation for new features
  React.useEffect(() => {
    if (isNew && !isDisabled) {
      borderGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite repeat
        true
      );
    }

    // Cleanup: reset animation when component unmounts or conditions change
    return () => {
      borderGlow.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, isDisabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => {
    if (!isNew) return {};
    return {
      shadowOpacity: 0.2 + borderGlow.value * 0.3,
      shadowRadius: 8 + borderGlow.value * 8,
    };
  });

  const handlePressIn = () => {
    if (isDisabled) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    feedback('tap');
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

  // Calculate entrance delay
  const entranceAnimationDelay = entranceIndex * entranceDelay;

  return (
    <Animated.View
      entering={FadeInDown.delay(entranceAnimationDelay).springify().damping(15)}
      style={style}
    >
      <AnimatedPressable
        style={[
          styles.container,
          animatedStyle,
          borderAnimatedStyle,
          isDisabled && styles.containerDisabled,
          isNew && styles.containerNew,
        ]}
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={
            isDisabled ? [Colors.neutral.gray100, Colors.neutral.gray200] : cardConfig.gradient
          }
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

          {/* NEW Badge */}
          {isNew && !comingSoon && (
            <Animated.View
              entering={FadeInDown.delay(entranceAnimationDelay + 200).springify()}
              style={styles.newBadge}
            >
              <Text style={styles.newBadgeText}>YENİ</Text>
            </Animated.View>
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
                  borderColor: isDisabled ? Colors.neutral.gray300 : cardConfig.border,
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
                ellipsizeMode="tail"
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
                  ellipsizeMode="tail"
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Arrow */}
            {showArrow && !comingSoon && (
              <View style={styles.arrowContainer}>
                <ChevronRight
                  size={20}
                  color={isDisabled ? Colors.neutral.gray400 : RenkooColors.text.secondary}
                />
              </View>
            )}
          </View>

          {/* Border */}
          <View
            style={[
              styles.border,
              {
                borderRadius: currentSize.borderRadius,
                borderColor: isDisabled ? Colors.neutral.gray300 : cardConfig.border,
              },
            ]}
          />
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
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
  const cardConfig = RenkooColors.featureCards[type] || RenkooColors.featureCards.analysis;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
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
    ...shadows.md,
  },
  containerDisabled: {
    opacity: 0.7,
  },
  containerNew: {
    ...shadows.colored('#B98EFF'),
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#B98EFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    ...createShadow(2, 4, 0.4, 4, '#B98EFF'),
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    color: Colors.neutral.gray400,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.semantic.amber,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
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
    overflow: 'hidden',
  },
  title: {
    fontFamily: typography.family.bold,
    color: RenkooColors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    color: RenkooColors.text.secondary,
    lineHeight: 18,
    flexShrink: 1,
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
    ...shadows.sm,
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
    fontFamily: typography.family.semibold,
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
