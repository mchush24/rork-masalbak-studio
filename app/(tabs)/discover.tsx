/**
 * Discover Screen - Social Feed (Keşfet)
 *
 * Premium social feed with:
 * - Daily expert tip (featured)
 * - Activity suggestions carousel
 * - Community gallery grid
 * - Success stories
 *
 * Features:
 * - Pull to refresh
 * - Infinite scroll for gallery
 * - Haptic feedback
 * - Loading skeletons
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Compass, Sparkles, ChevronRight, ImageIcon, Heart, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { trpc } from '@/lib/trpc';
import { Colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/design-system';
import { IooEmptyState } from '@/components/IooEmptyState';
import {
  ExpertTipCard,
  ActivityCard,
  CommunityGalleryCard,
  SuccessStoryCard,
  SocialFeedSkeleton,
} from '@/components/social-feed';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

// Showcase data displayed when backend returns empty results
const SHOWCASE_GALLERY = [
  {
    id: 'showcase-1',
    image_url: '',
    thumbnail_url: null,
    child_age: 5,
    theme: 'family',
    content_type: 'drawing',
    likes_count: 24,
  },
  {
    id: 'showcase-2',
    image_url: '',
    thumbnail_url: null,
    child_age: 7,
    theme: 'nature',
    content_type: 'coloring',
    likes_count: 18,
  },
  {
    id: 'showcase-3',
    image_url: '',
    thumbnail_url: null,
    child_age: 4,
    theme: 'animals',
    content_type: 'drawing',
    likes_count: 31,
  },
  {
    id: 'showcase-4',
    image_url: '',
    thumbnail_url: null,
    child_age: 6,
    theme: 'fantasy',
    content_type: 'coloring',
    likes_count: 15,
  },
  {
    id: 'showcase-5',
    image_url: '',
    thumbnail_url: null,
    child_age: 8,
    theme: 'emotions',
    content_type: 'drawing',
    likes_count: 27,
  },
  {
    id: 'showcase-6',
    image_url: '',
    thumbnail_url: null,
    child_age: 5,
    theme: 'seasons',
    content_type: 'coloring',
    likes_count: 12,
  },
];

const SHOWCASE_STORIES = [
  {
    id: 'showcase-s1',
    title: 'Renklerle İfade',
    content:
      'Kızım boyama yaparken duygularını ifade etmeye başladı. Renk seçimleri ile iç dünyasını anlamamıza yardımcı oldu.',
    child_age: 6,
    author_type: 'parent',
    images: [],
    likes_count: 42,
    is_featured: true,
  },
  {
    id: 'showcase-s2',
    title: 'Masal Dünyası',
    content:
      'Oğlum kendi masallarını oluşturmaya bayılıyor. Her gece yatmadan önce birlikte yeni bir hikaye yazıyoruz.',
    child_age: 5,
    author_type: 'parent',
    images: [],
    likes_count: 35,
    is_featured: false,
  },
  {
    id: 'showcase-s3',
    title: 'Çizimle Gelişim',
    content:
      'Çocuğumun çizimlerindeki gelişimi izlemek çok güzel. Her hafta daha detaylı ve anlamlı çizimler yapıyor.',
    child_age: 7,
    author_type: 'parent',
    images: [],
    likes_count: 29,
    is_featured: false,
  },
];

// Section header component - memoized to prevent unnecessary re-renders
const SectionHeader = memo(function SectionHeader({
  title,
  icon: Icon,
  iconColor = '#8B5CF6',
  onSeeAll,
}: {
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor?: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          style={({ pressed }) => [styles.seeAllButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.seeAllText}>Tümü</Text>
          <ChevronRight size={14} color="#8B5CF6" />
        </Pressable>
      )}
    </View>
  );
});

// Empty state component - memoized, uses unified IooEmptyState
const DiscoverEmptyState = memo(function DiscoverEmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.emptyState}>
      <IooEmptyState title={title} message={message} compact />
    </View>
  );
});

export default function DiscoverScreen() {
  const _router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch discover feed data
  const {
    data: feedData,
    isLoading,
    refetch,
    error: _error,
  } = trpc.socialFeed.getDiscoverFeed.useQuery({});

  // Like mutations
  const likeMutation = trpc.socialFeed.likeGalleryItem.useMutation();
  const storyLikeMutation = trpc.socialFeed.likeStory.useMutation();

  // Track liked items (optimistic UI)
  const [likedGalleryItems, setLikedGalleryItems] = useState<Set<string>>(new Set());
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGalleryLike = useCallback(
    (id: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setLikedGalleryItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
      likeMutation.mutate({ galleryId: id });
    },
    [likeMutation]
  );

  const handleStoryLike = useCallback(
    (id: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setLikedStories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
      storyLikeMutation.mutate({ storyId: id });
    },
    [storyLikeMutation]
  );

  if (isLoading && !feedData) {
    return (
      <LinearGradient colors={Colors.background.pageGradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Compass size={24} color="#8B5CF6" />
              <Text style={styles.headerText}>Keşfet</Text>
            </View>
          </View>
          <SocialFeedSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.background.pageGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerTitle}>
            <Compass size={24} color="#8B5CF6" />
            <Text style={styles.headerText}>Keşfet</Text>
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              if (Platform.OS === 'web') {
                alert('Filtre özelliği yakında eklenecek');
              } else {
                Alert.alert('Yakında', 'Filtre özelliği yakında eklenecek');
              }
            }}
          >
            <Filter size={20} color="#6B7280" />
          </Pressable>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          }
        >
          {/* Daily Expert Tip */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            {feedData?.dailyTip ? (
              <ExpertTipCard tip={feedData.dailyTip} featured />
            ) : (
              <View style={styles.tipPlaceholder}>
                <Sparkles size={24} color="#FFA726" />
                <Text style={styles.tipPlaceholderText}>Günün ilhamı yükleniyor...</Text>
              </View>
            )}
          </Animated.View>

          {/* Activity Suggestions */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
            <SectionHeader title="Bugünkü Aktiviteler" icon={Sparkles} iconColor="#66BB6A" />

            {feedData?.suggestions && feedData.suggestions.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activitiesContainer}
              >
                {feedData.suggestions.map((activity, index) => (
                  <ActivityCard key={activity.id} activity={activity} index={index} />
                ))}
              </ScrollView>
            ) : (
              <DiscoverEmptyState
                title="Aktivite Önerisi Yok"
                message="Henüz aktivite önerisi yok"
              />
            )}
          </Animated.View>

          {/* Community Gallery */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
            <SectionHeader
              title="Topluluk Galerisi"
              icon={ImageIcon}
              iconColor="#AB47BC"
              onSeeAll={() => {
                if (Platform.OS === 'web') {
                  alert('Yakında tüm galeri görüntülenebilecek');
                } else {
                  Alert.alert('Yakında', 'Tüm galeri yakında görüntülenebilecek');
                }
              }}
            />

            {(() => {
              const galleryItems =
                feedData?.gallery && feedData.gallery.length > 0
                  ? feedData.gallery
                  : SHOWCASE_GALLERY;
              const isShowcase = !(feedData?.gallery && feedData.gallery.length > 0);
              return (
                <>
                  {isShowcase && (
                    <View style={styles.showcaseBadge}>
                      <Text style={styles.showcaseBadgeText}>Örnek İçerik</Text>
                    </View>
                  )}
                  <View style={styles.galleryGrid}>
                    {galleryItems.map((item, index) => (
                      <CommunityGalleryCard
                        key={item.id}
                        item={item}
                        index={index}
                        isLiked={likedGalleryItems.has(item.id)}
                        onLike={handleGalleryLike}
                        onPress={() => {}}
                      />
                    ))}
                  </View>
                </>
              );
            })()}
          </Animated.View>

          {/* Success Stories */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <SectionHeader
              title="Başarı Hikayeleri"
              icon={Heart}
              iconColor="#EC407A"
              onSeeAll={() => {
                if (Platform.OS === 'web') {
                  alert('Yakında tüm hikayeler görüntülenebilecek');
                } else {
                  Alert.alert('Yakında', 'Tüm hikayeler yakında görüntülenebilecek');
                }
              }}
            />

            {(() => {
              const storyItems =
                feedData?.stories && feedData.stories.length > 0
                  ? feedData.stories
                  : SHOWCASE_STORIES;
              const isShowcase = !(feedData?.stories && feedData.stories.length > 0);
              return (
                <>
                  {isShowcase && (
                    <View style={styles.showcaseBadge}>
                      <Text style={styles.showcaseBadgeText}>Örnek İçerik</Text>
                    </View>
                  )}
                  <View style={styles.storiesContainer}>
                    {storyItems.map((story, index) => (
                      <SuccessStoryCard
                        key={story.id}
                        story={story}
                        index={index}
                        isLiked={likedStories.has(story.id)}
                        onLike={handleStoryLike}
                        onShare={() => {}}
                      />
                    ))}
                  </View>
                </>
              );
            })()}
          </Animated.View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tipPlaceholder: {
    marginHorizontal: spacing.md,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 167, 38, 0.1)',
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F57C00',
  },
  activitiesContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  storiesContainer: {
    gap: spacing.md,
  },
  showcaseBadge: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  showcaseBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 100,
  },
});
