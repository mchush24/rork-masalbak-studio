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

import React, { useState, useCallback } from 'react';
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
import { Compass, Sparkles, ImageIcon, Heart, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { trpc } from '@/lib/trpc';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, radius, typography } from '@/constants/design-system';
import { SHOWCASE_GALLERY, SHOWCASE_STORIES } from '@/constants/showcase-data';
import { SectionHeader, DiscoverEmptyState } from '@/components/discover';
import {
  ExpertTipCard,
  ActivityCard,
  CommunityGalleryCard,
  SuccessStoryCard,
  SocialFeedSkeleton,
} from '@/components/social-feed';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

// Shape of the discover feed response
interface DiscoverFeedData {
  dailyTip?: {
    id: string;
    title?: string;
    content: string;
    author?: string;
    source?: string | null;
    source_title?: string | null;
    category: string;
    icon?: string;
  };
  suggestions?: { id: string; title: string; [key: string]: unknown }[];
  gallery?: { id: string; [key: string]: unknown }[];
  stories?: { id: string; [key: string]: unknown }[];
}

export default function DiscoverScreen() {
  const _router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch discover feed data
  const {
    data: feedData,
    isLoading,
    refetch,
    error: _error,
  } = trpc.socialFeed.getDiscoverFeed.useQuery({}) as {
    data: DiscoverFeedData | undefined;
    isLoading: boolean;
    refetch: () => void;
    error: unknown;
  };

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
      if (likeMutation.isPending) return;
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
      if (storyLikeMutation.isPending) return;
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
      <LinearGradient
        colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={[styles.header, { borderBottomColor: colors.border.light + '20' }]}>
            <View style={styles.headerTitle}>
              <Compass size={24} color={colors.secondary.violet} />
              <Text style={[styles.headerText, { color: colors.text.primary }]}>Keşfet</Text>
            </View>
          </View>
          <SocialFeedSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.header, { borderBottomColor: colors.border.light + '20' }]}
        >
          <View style={styles.headerTitle}>
            <Compass size={24} color={colors.secondary.violet} />
            <Text style={[styles.headerText, { color: colors.text.primary }]}>Keşfet</Text>
          </View>
          <Pressable
            style={[styles.filterButton, { backgroundColor: colors.neutral.lighter + '30' }]}
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
            <Filter size={20} color={colors.text.secondary} />
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
              tintColor={colors.secondary.violet}
              colors={[colors.secondary.violet]}
            />
          }
        >
          {/* Daily Expert Tip */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            {feedData?.dailyTip ? (
              <ExpertTipCard tip={feedData.dailyTip} featured />
            ) : (
              <View
                style={[
                  styles.tipPlaceholder,
                  { backgroundColor: colors.secondary.sunshine + '1A' },
                ]}
              >
                <Sparkles size={24} color={colors.secondary.sunshine} />
                <Text style={[styles.tipPlaceholderText, { color: colors.secondary.sunshine }]}>
                  Günün ilhamı yükleniyor...
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Activity Suggestions */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
            <SectionHeader
              title="Bugünkü Aktiviteler"
              icon={Sparkles}
              iconColor={Colors.secondary.grass}
            />

            {feedData?.suggestions && feedData.suggestions.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activitiesContainer}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {feedData.suggestions.map((activity: any, index: number) => (
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
              iconColor={Colors.secondary.violet}
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
                    <View
                      style={[
                        styles.showcaseBadge,
                        { backgroundColor: colors.secondary.violet + '1A' },
                      ]}
                    >
                      <Text style={[styles.showcaseBadgeText, { color: colors.secondary.violet }]}>
                        Örnek İçerik
                      </Text>
                    </View>
                  )}
                  <View style={styles.galleryGrid}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {galleryItems.map((item: any, index: number) => (
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
              iconColor={Colors.secondary.rose}
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
                    <View
                      style={[
                        styles.showcaseBadge,
                        { backgroundColor: colors.secondary.violet + '1A' },
                      ]}
                    >
                      <Text style={[styles.showcaseBadgeText, { color: colors.secondary.violet }]}>
                        Örnek İçerik
                      </Text>
                    </View>
                  )}
                  <View style={styles.storiesContainer}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {storyItems.map((story: any, index: number) => (
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
    borderBottomColor: Colors.secondary.lavender + '1A',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    fontSize: 24,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.medium + '1A',
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
  tipPlaceholder: {
    marginHorizontal: spacing.md,
    padding: spacing.xl,
    backgroundColor: Colors.secondary.sunshine + '1A',
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipPlaceholderText: {
    fontSize: 14,
    fontFamily: typography.family.medium,
    color: Colors.secondary.sunshine,
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
    backgroundColor: Colors.secondary.lavender + '1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  showcaseBadgeText: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
    color: Colors.secondary.violet,
  },
  bottomPadding: {
    height: 100,
  },
});
