/**
 * SuccessStoryCard - Basari Hikayesi Karti
 *
 * Full-width card for success stories with:
 * - Quote icon and styled content
 * - Anonymous author (privacy-first)
 * - Optional image gallery
 * - Like and share actions
 * - Expandable content
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import {
  Quote,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  Star,
  ImageIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, shadows } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuccessStoryCardProps {
  story: {
    id: string;
    title?: string | null;
    content: string;
    child_age?: number | null;
    author_type: string;
    images?: string[];
    likes_count: number;
    is_featured?: boolean;
  };
  index?: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
}

// Author type labels
const AUTHOR_LABELS: Record<string, string> = {
  parent: 'Bir Ebeveyn',
  teacher: 'Bir Ogretmen',
  therapist: 'Bir Terapist',
  caregiver: 'Bir Bakim Veren',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SuccessStoryCard({
  story,
  index = 0,
  isLiked = false,
  onLike,
  onShare,
}: SuccessStoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(story.likes_count);

  const isLongContent = story.content.length > 200;
  const heartScale = useSharedValue(1);

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    heartScale.value = withSequence(
      withSpring(1.4, { damping: 4 }),
      withSpring(1, { damping: 4 })
    );

    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike?.(story.id);
  };

  const handleShare = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onShare?.(story.id);
  };

  const handleToggleExpand = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setExpanded(!expanded);
  };

  const authorLabel = AUTHOR_LABELS[story.author_type] || AUTHOR_LABELS.parent;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(500).springify()}
      layout={Layout.springify()}
      style={styles.container}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FEFCFB']}
        style={styles.gradient}
      >
        {/* Featured badge */}
        {story.is_featured && (
          <View style={styles.featuredBadge}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.featuredText}>One Cikan</Text>
          </View>
        )}

        {/* Quote icon */}
        <View style={styles.quoteContainer}>
          <LinearGradient
            colors={['#FCE4EC', '#F8BBD0']}
            style={styles.quoteGradient}
          >
            <Quote size={18} color="#EC407A" />
          </LinearGradient>
        </View>

        {/* Title (if any) */}
        {story.title && (
          <Text style={styles.title}>{story.title}</Text>
        )}

        {/* Content */}
        <Text
          style={styles.content}
          numberOfLines={expanded || !isLongContent ? undefined : 4}
        >
          {story.content}
        </Text>

        {/* Expand button */}
        {isLongContent && (
          <Pressable onPress={handleToggleExpand} style={styles.expandButton}>
            {expanded ? (
              <>
                <Text style={styles.expandText}>Daha az goster</Text>
                <ChevronUp size={14} color="#EC407A" />
              </>
            ) : (
              <>
                <Text style={styles.expandText}>Devamini oku</Text>
                <ChevronDown size={14} color="#EC407A" />
              </>
            )}
          </Pressable>
        )}

        {/* Images gallery */}
        {story.images && story.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          >
            {story.images.slice(0, 3).map((imageUrl, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {/* Author info */}
          <View style={styles.authorInfo}>
            <Text style={styles.authorLabel}>— {authorLabel}</Text>
            {story.child_age && (
              <Text style={styles.childAge}>({story.child_age} yasinda cocugu var)</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AnimatedPressable
              onPress={handleLike}
              style={styles.actionButton}
            >
              <Animated.View style={[styles.actionContent, heartAnimStyle]}>
                <Heart
                  size={18}
                  color={liked ? '#EC4899' : '#9CA3AF'}
                  fill={liked ? '#EC4899' : 'transparent'}
                />
              </Animated.View>
              <Text style={[styles.actionCount, liked && styles.actionCountActive]}>
                {likesCount}
              </Text>
            </AnimatedPressable>

            <Pressable onPress={handleShare} style={styles.actionButton}>
              <Share2 size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Decorative border */}
      <View style={styles.decorativeBorder} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    position: 'relative',
  },
  gradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(236, 64, 122, 0.15)',
    backgroundColor: '#FFF',
  },
  decorativeBorder: {
    position: 'absolute',
    top: -1,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#F8BBD0',
    borderTopLeftRadius: borderRadius.full,
    borderTopRightRadius: borderRadius.full,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  quoteContainer: {
    marginBottom: spacing.md,
  },
  quoteGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  content: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EC407A',
  },
  imagesContainer: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(236, 64, 122, 0.1)',
  },
  authorInfo: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  childAge: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  actionContent: {
    // For animation
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  actionCountActive: {
    color: '#EC4899',
  },
});

export default SuccessStoryCard;
