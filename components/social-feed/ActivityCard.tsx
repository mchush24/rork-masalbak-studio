/**
 * ActivityCard - Aktivite Öneri Kartı
 *
 * Compact card for activity suggestions with:
 * - Category-based gradient
 * - Icon with animated glow
 * - Duration badge
 * - Action button
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import {
  Palette,
  BookOpen,
  Gamepad2,
  TreeDeciduous,
  Sparkles,
  Brain,
  Clock,
  Play,
  Heart,
  Music,
  Target,
  Cloud,
  Flower2,
  Users,
  Book,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, Href } from 'expo-router';
import { spacing, borderRadius, shadows } from '@/lib/design-tokens';

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    description?: string | null;
    duration?: string | null;
    category: string;
    icon?: string;
    action_url?: string | null;
    gradient_colors?: string[];
  };
  index?: number;
  onPress?: () => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  palette: Palette,
  'book-open': BookOpen,
  gamepad: Gamepad2,
  tree: TreeDeciduous,
  sparkles: Sparkles,
  brain: Brain,
  heart: Heart,
  music: Music,
  target: Target,
  cloud: Cloud,
  flower: Flower2,
  users: Users,
  book: Book,
};

// Category defaults
const CATEGORY_DEFAULTS: Record<string, { colors: string[]; icon: string; iconColor: string }> = {
  coloring: {
    colors: ['#FCE4EC', '#F8BBD0'],
    icon: 'palette',
    iconColor: '#EC407A',
  },
  story: {
    colors: ['#FFF3E0', '#FFE0B2'],
    icon: 'book-open',
    iconColor: '#FB8C00',
  },
  game: {
    colors: ['#E3F2FD', '#BBDEFB'],
    icon: 'gamepad',
    iconColor: '#1E88E5',
  },
  outdoor: {
    colors: ['#E8F5E9', '#C8E6C9'],
    icon: 'tree',
    iconColor: '#43A047',
  },
  creative: {
    colors: ['#F3E5F5', '#E1BEE7'],
    icon: 'sparkles',
    iconColor: '#8E24AA',
  },
  mindfulness: {
    colors: ['#E0F7FA', '#B2EBF2'],
    icon: 'brain',
    iconColor: '#00ACC1',
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActivityCard({ activity, index = 0, onPress }: ActivityCardProps) {
  const router = useRouter();

  // Subtle glow animation
  const glowAnim = useSharedValue(0.3);

  React.useEffect(() => {
    glowAnim.value = withRepeat(
      withTiming(0.6, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  const categoryDefaults = CATEGORY_DEFAULTS[activity.category] || CATEGORY_DEFAULTS.creative;
  const gradientColors = activity.gradient_colors?.length === 2
    ? activity.gradient_colors
    : categoryDefaults.colors;
  const iconName = activity.icon || categoryDefaults.icon;
  const IconComponent = ICON_MAP[iconName] || Sparkles;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (activity.action_url) {
      router.push(activity.action_url as Href);
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      entering={FadeIn.delay(index * 100).duration(400)}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Glow effect */}
        <Animated.View style={[styles.glowOverlay, glowStyle]}>
          <LinearGradient
            colors={['transparent', `${categoryDefaults.iconColor}20`, 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${categoryDefaults.iconColor}20` }]}>
          <IconComponent size={28} color={categoryDefaults.iconColor} />
        </View>

        {/* Content */}
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        {activity.description && (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {activity.duration && (
            <View style={styles.durationBadge}>
              <Clock size={10} color="#6B7280" />
              <Text style={styles.durationText}>{activity.duration}</Text>
            </View>
          )}

          <View style={[styles.actionButton, { backgroundColor: categoryDefaults.iconColor }]}>
            <Play size={12} color="#FFF" fill="#FFF" />
          </View>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 190,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  containerPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  gradient: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});

export default ActivityCard;
