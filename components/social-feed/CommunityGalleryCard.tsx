/**
 * CommunityGalleryCard - Topluluk Galerisi Kartı
 *
 * Grid item for community gallery with:
 * - Image with gradient overlay
 * - Age badge
 * - Theme tag
 * - Like button with count
 * - Anonymous (privacy-first)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, shadows } from '@/lib/design-tokens';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface CommunityGalleryCardProps {
  item: {
    id: string;
    image_url: string;
    thumbnail_url?: string | null;
    child_age?: number | null;
    theme?: string | null;
    content_type: string;
    likes_count: number;
  };
  index?: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onPress?: (id: string) => void;
}

// Theme labels with emoji for fallback placeholders
const THEME_LABELS: Record<
  string,
  { label: string; color: string; emoji: string; gradient: [string, string] }
> = {
  family: { label: 'Aile', color: '#EC407A', emoji: '👨‍👩‍👧', gradient: ['#FCE4EC', '#F8BBD0'] },
  nature: { label: 'Doga', color: '#66BB6A', emoji: '🌿', gradient: ['#E8F5E9', '#C8E6C9'] },
  animals: { label: 'Hayvanlar', color: '#FB8C00', emoji: '🐾', gradient: ['#FFF3E0', '#FFE0B2'] },
  fantasy: { label: 'Hayal', color: '#AB47BC', emoji: '🦄', gradient: ['#F3E5F5', '#E1BEE7'] },
  emotions: { label: 'Duygular', color: '#5C6BC0', emoji: '🎭', gradient: ['#E8EAF6', '#C5CAE9'] },
  seasons: { label: 'Mevsimler', color: '#26A69A', emoji: '🍂', gradient: ['#E0F2F1', '#B2DFDB'] },
  holidays: { label: 'Tatil', color: '#EF5350', emoji: '🎉', gradient: ['#FFEBEE', '#FFCDD2'] },
  other: { label: 'Diger', color: '#78909C', emoji: '🎨', gradient: ['#ECEFF1', '#CFD8DC'] },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CommunityGalleryCard({
  item,
  index = 0,
  isLiked = false,
  onLike,
  onPress,
}: CommunityGalleryCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(item.likes_count);
  const imageSource = item.thumbnail_url || item.image_url;
  const [imageError, setImageError] = useState(!imageSource);

  // Heart animation
  const heartScale = useSharedValue(1);

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    heartScale.value = withSequence(withSpring(1.3, { damping: 5 }), withSpring(1, { damping: 5 }));

    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : prev - 1));
    onLike?.(item.id);
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(item.id);
  };

  const themeStyle = item.theme ? THEME_LABELS[item.theme] : THEME_LABELS.other;

  return (
    <AnimatedPressable
      entering={FadeInUp.delay(index * 50)
        .duration(400)
        .springify()}
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {imageError ? (
          <LinearGradient colors={themeStyle.gradient} style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{themeStyle.emoji}</Text>
          </LinearGradient>
        ) : (
          <Image
            source={{ uri: imageSource }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.5)']}
          style={styles.imageOverlay}
        />

        {/* Age badge */}
        {item.child_age && (
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{item.child_age} yas</Text>
          </View>
        )}

        {/* Theme tag */}
        <View style={[styles.themeTag, { backgroundColor: `${themeStyle.color}E6` }]}>
          <Text style={styles.themeTagText}>{themeStyle.label}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleLike}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.likeButton}
        >
          <Animated.View style={heartAnimStyle}>
            <Heart
              size={18}
              color={liked ? '#EC4899' : Colors.neutral.gray400}
              fill={liked ? '#EC4899' : 'transparent'}
            />
          </Animated.View>
          <Text style={[styles.likesCount, liked && styles.likesCountActive]}>{likesCount}</Text>
        </Pressable>

        {/* Content type indicator */}
        <View style={styles.contentTypeIndicator}>
          <View
            style={[
              styles.contentTypeDot,
              { backgroundColor: item.content_type === 'coloring' ? Colors.secondary.lavender : '#60A5FA' },
            ]}
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.lg,
    backgroundColor: Colors.neutral.white,
    overflow: 'hidden',
    ...shadows.md,
  },
  containerPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ageBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  ageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.gray700,
  },
  themeTag: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  themeTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: Colors.neutral.white,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  likesCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.gray400,
  },
  likesCountActive: {
    color: '#EC4899',
  },
  contentTypeIndicator: {
    padding: 4,
  },
  contentTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default CommunityGalleryCard;
