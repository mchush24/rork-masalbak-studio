/**
 * DiscoverSection - Collapsible "Kesfet" preview for the Home screen
 *
 * Renders a compact, space-efficient snapshot of the Discover feed
 * inside a CollapsibleSection. Designed to live inside the main
 * home ScrollView so vertical real-estate is at a premium.
 *
 * Sections:
 * 1. Expert Tip (single compact card)
 * 2. Activity Suggestions (horizontal scroll)
 * 3. Community Gallery (2-column mini grid, max 4 items)
 * 4. Featured Success Story (1 card)
 *
 * Falls back to SHOWCASE_GALLERY / SHOWCASE_STORIES when the
 * backend returns empty data.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Compass, Sparkles, ImageIcon, Heart } from 'lucide-react-native';

import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import {
  SectionHeader,
  ExpertTipCard,
  ActivityCard,
  CommunityGalleryCard,
  SuccessStoryCard,
  SHOWCASE_GALLERY,
  SHOWCASE_STORIES,
} from '@/components/discover';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, radius, typography } from '@/constants/design-system';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscoverSectionProps {
  discoverData?: {
    /** Daily expert tip — matches ExpertTipCard `tip` prop */
    dailyTip?: {
      id: string;
      content: string;
      source?: string | null;
      source_title?: string | null;
      category: string;
      icon?: string;
    } | null;
    /** Activity suggestions — matches ActivityCard `activity` prop */
    suggestions?: {
      id: string;
      title: string;
      description?: string | null;
      duration?: string | null;
      category: string;
      icon?: string;
      action_url?: string | null;
      gradient_colors?: string[];
    }[];
    /** Community gallery items — matches CommunityGalleryCard `item` prop */
    gallery?: {
      id: string;
      image_url: string;
      thumbnail_url?: string | null;
      child_age?: number | null;
      theme?: string | null;
      content_type: string;
      likes_count: number;
    }[];
    /** Success stories — matches SuccessStoryCard `story` prop */
    stories?: {
      id: string;
      title?: string | null;
      content: string;
      child_age?: number | null;
      author_type: string;
      images?: string[];
      likes_count: number;
      is_featured?: boolean;
    }[];
  };
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max items shown in the gallery preview */
const MAX_GALLERY_ITEMS = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiscoverSection({ discoverData, isLoading = false }: DiscoverSectionProps) {
  const { colors } = useTheme();

  // Resolve gallery items — use fallback when empty
  const galleryItems = useMemo(() => {
    if (discoverData?.gallery && discoverData.gallery.length > 0) {
      return discoverData.gallery.slice(0, MAX_GALLERY_ITEMS);
    }
    return [...SHOWCASE_GALLERY].slice(0, MAX_GALLERY_ITEMS);
  }, [discoverData?.gallery]);

  // Resolve featured story — pick first featured or first available, fallback to showcase
  const featuredStory = useMemo(() => {
    if (discoverData?.stories && discoverData.stories.length > 0) {
      return discoverData.stories.find(s => s.is_featured) ?? discoverData.stories[0];
    }
    const showcase = SHOWCASE_STORIES[0];
    // Ensure mutable copy so the card can mutate likes_count locally
    return { ...showcase, images: [...showcase.images] };
  }, [discoverData?.stories]);

  const hasActivities = discoverData?.suggestions && discoverData.suggestions.length > 0;

  const isShowcaseGallery = !(discoverData?.gallery && discoverData.gallery.length > 0);
  const isShowcaseStory = !(discoverData?.stories && discoverData.stories.length > 0);

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
  if (isLoading) {
    return (
      <CollapsibleSection
        id="home_discover"
        title="Kesfet"
        icon={<Compass size={18} color={Colors.secondary.violet} />}
        defaultExpanded={false}
        persistState
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.secondary.violet} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Icerik yukleniyor...
          </Text>
        </View>
      </CollapsibleSection>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <CollapsibleSection
      id="home_discover"
      title="Kesfet"
      icon={<Compass size={18} color={Colors.secondary.violet} />}
      defaultExpanded={false}
      persistState
    >
      {/* ---- Expert Tip ---- */}
      {discoverData?.dailyTip && (
        <View style={styles.subSection}>
          <ExpertTipCard tip={discoverData.dailyTip} featured={false} />
        </View>
      )}

      {/* ---- Activity Suggestions (horizontal scroll) ---- */}
      {hasActivities && (
        <View style={styles.subSection}>
          <SectionHeader title="Aktiviteler" icon={Sparkles} iconColor={Colors.secondary.grass} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activitiesScroll}
          >
            {discoverData!.suggestions!.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ---- Community Gallery (2-col mini grid) ---- */}
      <View style={styles.subSection}>
        <SectionHeader
          title="Topluluk Galerisi"
          icon={ImageIcon}
          iconColor={Colors.secondary.violet}
        />
        {isShowcaseGallery && (
          <View style={[styles.showcaseBadge, { backgroundColor: Colors.secondary.violet + '1A' }]}>
            <Text style={[styles.showcaseBadgeText, { color: Colors.secondary.violet }]}>
              Ornek Icerik
            </Text>
          </View>
        )}
        <View style={styles.miniGalleryGrid}>
          {galleryItems.map((item, index) => (
            <CommunityGalleryCard
              key={item.id}
              item={item as CommunityGalleryCardItem}
              index={index}
              onPress={() => {}}
            />
          ))}
        </View>
      </View>

      {/* ---- Featured Success Story ---- */}
      {featuredStory && (
        <View style={styles.subSection}>
          <SectionHeader title="Basari Hikayesi" icon={Heart} iconColor={Colors.secondary.rose} />
          {isShowcaseStory && (
            <View
              style={[styles.showcaseBadge, { backgroundColor: Colors.secondary.violet + '1A' }]}
            >
              <Text style={[styles.showcaseBadgeText, { color: Colors.secondary.violet }]}>
                Ornek Icerik
              </Text>
            </View>
          )}
          <SuccessStoryCard
            story={featuredStory as SuccessStoryCardStory}
            index={0}
            onShare={() => {}}
          />
        </View>
      )}
    </CollapsibleSection>
  );
}

// ---------------------------------------------------------------------------
// Internal type aliases to satisfy strict casts from readonly showcase data
// ---------------------------------------------------------------------------
type CommunityGalleryCardItem = {
  id: string;
  image_url: string;
  thumbnail_url?: string | null;
  child_age?: number | null;
  theme?: string | null;
  content_type: string;
  likes_count: number;
};

type SuccessStoryCardStory = {
  id: string;
  title?: string | null;
  content: string;
  child_age?: number | null;
  author_type: string;
  images?: string[];
  likes_count: number;
  is_featured?: boolean;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  subSection: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },

  // Activities horizontal scroll
  activitiesScroll: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },

  // Gallery 2-column mini grid — cards size themselves via CARD_WIDTH
  miniGalleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },

  // Showcase badge
  showcaseBadge: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  showcaseBadgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
  },
});

export default DiscoverSection;
