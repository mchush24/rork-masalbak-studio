/**
 * ExpertTipCard - Günün İlhamı / Uzman İpucu Kartı
 *
 * Premium featured card with:
 * - Warm amber gradient background
 * - Animated lightbulb icon
 * - Glassmorphism effect
 * - Expandable content
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeInDown,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Lightbulb, ChevronRight, Quote, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, shadows } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExpertTipCardProps {
  tip: {
    id: string;
    content: string;
    source?: string | null;
    source_title?: string | null;
    category: string;
    icon?: string;
  } | null;
  onPress?: () => void;
  featured?: boolean;
}

// Category colors
const CATEGORY_COLORS: Record<string, { gradient: string[]; accent: string }> = {
  development: { gradient: ['#E3F2FD', '#BBDEFB'], accent: '#1976D2' },
  creativity: { gradient: ['#F3E5F5', '#E1BEE7'], accent: '#7B1FA2' },
  emotions: { gradient: ['#FCE4EC', '#F8BBD0'], accent: '#C2185B' },
  behavior: { gradient: ['#E8F5E9', '#C8E6C9'], accent: '#388E3C' },
  communication: { gradient: ['#FFF3E0', '#FFE0B2'], accent: '#F57C00' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ExpertTipCard({ tip, onPress, featured = true }: ExpertTipCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Pulse animation for icon
  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  if (!tip) {
    return null;
  }

  const categoryStyle = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.emotions;
  const isLongContent = tip.content.length > 150;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isLongContent) {
      setExpanded(!expanded);
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(500).springify()}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        featured && styles.containerFeatured,
        pressed && styles.containerPressed,
      ]}
    >
      <LinearGradient
        colors={featured ? ['#FFF8E1', '#FFECB3', '#FFE082'] : categoryStyle.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative sparkles */}
        {featured && (
          <View style={styles.sparklesContainer}>
            <Sparkles size={14} color="#FFB300" style={styles.sparkle1} />
            <Sparkles size={10} color="#FFC107" style={styles.sparkle2} />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
            <LinearGradient
              colors={featured ? ['#FFB300', '#FFA000'] : [categoryStyle.accent, categoryStyle.accent]}
              style={styles.iconGradient}
            >
              {featured ? (
                <Lightbulb size={20} color="#FFF" fill="#FFF" />
              ) : (
                <Quote size={18} color="#FFF" />
              )}
            </LinearGradient>
          </Animated.View>

          <View style={styles.headerText}>
            <Text style={[styles.title, featured && styles.titleFeatured]}>
              {featured ? "Günün İlhamı" : "Uzman İpucu"}
            </Text>
            {tip.source_title && (
              <Text style={styles.sourceTitle}>{tip.source_title}</Text>
            )}
          </View>

          {isLongContent && (
            <Animated.View
              style={{
                transform: [{ rotate: expanded ? '90deg' : '0deg' }],
              }}
            >
              <ChevronRight size={18} color={featured ? '#F57C00' : categoryStyle.accent} />
            </Animated.View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text
            style={[styles.content, featured && styles.contentFeatured]}
            numberOfLines={expanded ? undefined : 3}
          >
            {tip.content}
          </Text>
        </View>

        {/* Footer */}
        {tip.source && (
          <View style={styles.footer}>
            <Text style={styles.source}>— {tip.source}</Text>
          </View>
        )}

        {/* Category badge */}
        {!featured && (
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryStyle.accent}15` }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.accent }]}>
              {getCategoryLabel(tip.category)}
            </Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    development: 'Gelişim',
    creativity: 'Yaratıcılık',
    emotions: 'Duygular',
    behavior: 'Davranış',
    communication: 'İletişim',
  };
  return labels[category] || category;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    marginHorizontal: spacing.md,
  },
  containerFeatured: {
    marginHorizontal: spacing.md,
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  gradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
  },
  sparkle1: {
    position: 'absolute',
    top: 12,
    right: 16,
    opacity: 0.6,
  },
  sparkle2: {
    position: 'absolute',
    top: 28,
    right: 8,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    ...shadows.md,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D4037',
    letterSpacing: 0.3,
  },
  titleFeatured: {
    fontSize: 15,
    color: '#E65100',
  },
  sourceTitle: {
    fontSize: 11,
    color: '#8D6E63',
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3E2723',
    lineHeight: 24,
  },
  contentFeatured: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4E342E',
    lineHeight: 26,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(121, 85, 72, 0.15)',
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8D6E63',
    fontStyle: 'italic',
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ExpertTipCard;
