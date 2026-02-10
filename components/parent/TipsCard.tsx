/**
 * Tips Card Component
 * Educational tips and guidance for parents
 * Part of #20: Ebeveyn Modu - Rehberli Deneyim UI
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Lightbulb,
  Book,
  Heart,
  Star,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

interface Tip {
  id: string;
  category: 'development' | 'activity' | 'emotional' | 'general';
  title: string;
  content: string;
  actionText?: string;
  actionUrl?: string;
  isBookmarked?: boolean;
}

interface TipsCardProps {
  tips: Tip[];
  onBookmark?: (tipId: string) => void;
  onShare?: (tipId: string) => void;
  onAction?: (tipId: string, actionUrl: string) => void;
  variant?: 'carousel' | 'list' | 'featured';
}

const CATEGORY_CONFIG = {
  development: {
    label: 'Gelişim',
    icon: Star,
    color: Colors.primary.sunset,
    bgColor: Colors.primary.softPeach,
  },
  activity: {
    label: 'Aktivite',
    icon: Lightbulb,
    color: Colors.secondary.mint,
    bgColor: '#ECFDF5',
  },
  emotional: {
    label: 'Duygusal',
    icon: Heart,
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  general: {
    label: 'Genel',
    icon: Book,
    color: Colors.secondary.sky,
    bgColor: '#F0F9FF',
  },
};

export function TipsCard({
  tips,
  onBookmark,
  onShare,
  onAction,
  variant = 'carousel',
}: TipsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const handleNext = () => {
    if (currentIndex < tips.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (tips.length === 0) {
    return null;
  }

  // Featured variant - single highlighted tip
  if (variant === 'featured') {
    const tip = tips[0];
    const categoryConfig = CATEGORY_CONFIG[tip.category];
    const CategoryIcon = categoryConfig.icon;

    return (
      <View style={[styles.featuredCard, { backgroundColor: categoryConfig.bgColor }]}>
        <View style={styles.featuredHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryConfig.color}20` }]}>
            <CategoryIcon size={14} color={categoryConfig.color} />
            <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>
          <Pressable style={styles.bookmarkButton} onPress={() => onBookmark?.(tip.id)}>
            {tip.isBookmarked ? (
              <BookmarkCheck size={20} color={categoryConfig.color} />
            ) : (
              <Bookmark size={20} color={categoryConfig.color} />
            )}
          </Pressable>
        </View>

        <View style={styles.featuredIcon}>
          <Lightbulb size={32} color={categoryConfig.color} />
        </View>

        <Text style={styles.featuredTitle}>{tip.title}</Text>
        <Text style={styles.featuredContent}>{tip.content}</Text>

        <View style={styles.featuredActions}>
          {tip.actionText && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: categoryConfig.color }]}
              onPress={() => tip.actionUrl && onAction?.(tip.id, tip.actionUrl)}
            >
              <Text style={styles.actionButtonText}>{tip.actionText}</Text>
              <ExternalLink size={14} color={Colors.neutral.white} />
            </Pressable>
          )}
          <Pressable style={styles.shareButton} onPress={() => onShare?.(tip.id)}>
            <Share2 size={18} color={categoryConfig.color} />
          </Pressable>
        </View>
      </View>
    );
  }

  // Carousel variant
  if (variant === 'carousel') {
    const tip = tips[currentIndex];
    const categoryConfig = CATEGORY_CONFIG[tip.category];
    const CategoryIcon = categoryConfig.icon;

    return (
      <View style={styles.carouselContainer}>
        <View style={styles.carouselHeader}>
          <View style={styles.carouselTitleRow}>
            <Lightbulb size={20} color={Colors.primary.sunset} />
            <Text style={styles.carouselTitle}>Günün İpucu</Text>
          </View>
          <View style={styles.carouselNav}>
            <Pressable
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft
                size={18}
                color={currentIndex === 0 ? Colors.neutral.light : Colors.neutral.dark}
              />
            </Pressable>
            <Text style={styles.navCounter}>
              {currentIndex + 1}/{tips.length}
            </Text>
            <Pressable
              style={[
                styles.navButton,
                currentIndex === tips.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={currentIndex === tips.length - 1}
            >
              <ChevronRight
                size={18}
                color={
                  currentIndex === tips.length - 1 ? Colors.neutral.light : Colors.neutral.dark
                }
              />
            </Pressable>
          </View>
        </View>

        <View style={[styles.carouselCard, { backgroundColor: categoryConfig.bgColor }]}>
          <View style={styles.carouselCardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: Colors.neutral.white }]}>
              <CategoryIcon size={12} color={categoryConfig.color} />
              <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                {categoryConfig.label}
              </Text>
            </View>
            <Pressable onPress={() => onBookmark?.(tip.id)}>
              {tip.isBookmarked ? (
                <BookmarkCheck size={18} color={categoryConfig.color} />
              ) : (
                <Bookmark size={18} color={categoryConfig.color} />
              )}
            </Pressable>
          </View>

          <Text style={styles.carouselCardTitle}>{tip.title}</Text>
          <Text style={styles.carouselCardContent}>{tip.content}</Text>

          {tip.actionText && (
            <Pressable
              style={styles.carouselAction}
              onPress={() => tip.actionUrl && onAction?.(tip.id, tip.actionUrl)}
            >
              <Text style={[styles.carouselActionText, { color: categoryConfig.color }]}>
                {tip.actionText}
              </Text>
              <ChevronRight size={14} color={categoryConfig.color} />
            </Pressable>
          )}
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {tips.map((_, index) => (
            <View key={index} style={[styles.dot, index === currentIndex && styles.dotActive]} />
          ))}
        </View>
      </View>
    );
  }

  // List variant
  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Lightbulb size={20} color={Colors.primary.sunset} />
        <Text style={styles.listTitle}>Faydalı İpuçları</Text>
      </View>

      {tips.map(tip => {
        const categoryConfig = CATEGORY_CONFIG[tip.category];
        const CategoryIcon = categoryConfig.icon;
        const isExpanded = expandedTip === tip.id;

        return (
          <Pressable
            key={tip.id}
            style={({ pressed }) => [styles.listCard, pressed && styles.listCardPressed]}
            onPress={() => setExpandedTip(isExpanded ? null : tip.id)}
          >
            <View style={styles.listCardHeader}>
              <View style={[styles.listIconContainer, { backgroundColor: categoryConfig.bgColor }]}>
                <CategoryIcon size={18} color={categoryConfig.color} />
              </View>
              <View style={styles.listCardContent}>
                <View
                  style={[styles.categoryBadgeSmall, { backgroundColor: categoryConfig.bgColor }]}
                >
                  <Text style={[styles.categoryTextSmall, { color: categoryConfig.color }]}>
                    {categoryConfig.label}
                  </Text>
                </View>
                <Text style={styles.listCardTitle}>{tip.title}</Text>
              </View>
              <Pressable
                style={styles.listBookmarkButton}
                onPress={e => {
                  e.stopPropagation();
                  onBookmark?.(tip.id);
                }}
              >
                {tip.isBookmarked ? (
                  <BookmarkCheck size={18} color={categoryConfig.color} />
                ) : (
                  <Bookmark size={18} color={Colors.neutral.medium} />
                )}
              </Pressable>
            </View>

            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.expandedText}>{tip.content}</Text>
                {tip.actionText && (
                  <Pressable
                    style={[styles.expandedAction, { backgroundColor: categoryConfig.bgColor }]}
                    onPress={() => tip.actionUrl && onAction?.(tip.id, tip.actionUrl)}
                  >
                    <Text style={[styles.expandedActionText, { color: categoryConfig.color }]}>
                      {tip.actionText}
                    </Text>
                    <ExternalLink size={14} color={categoryConfig.color} />
                  </Pressable>
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Featured variant
  featuredCard: {
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginHorizontal: spacing['4'],
    ...shadows.sm,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  featuredIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing['3'],
    ...shadows.sm,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral.darker,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  featuredContent: {
    fontSize: 15,
    color: Colors.neutral.dark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['4'],
  },
  featuredActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing['3'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButton: {
    padding: 4,
  },

  // Carousel variant
  carouselContainer: {
    marginHorizontal: spacing['4'],
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  carouselTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  carouselTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.darker,
  },
  carouselNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: Colors.neutral.gray50,
  },
  navCounter: {
    fontSize: 12,
    color: Colors.neutral.medium,
    minWidth: 30,
    textAlign: 'center',
  },
  carouselCard: {
    borderRadius: radius.xl,
    padding: spacing['4'],
    ...shadows.sm,
  },
  carouselCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  carouselCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.darker,
    marginBottom: spacing['2'],
  },
  carouselCardContent: {
    fontSize: 14,
    color: Colors.neutral.dark,
    lineHeight: 20,
    marginBottom: spacing['3'],
  },
  carouselAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  carouselActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing['3'],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neutral.gray200,
  },
  dotActive: {
    backgroundColor: Colors.primary.sunset,
    width: 18,
  },

  // List variant
  listContainer: {
    marginHorizontal: spacing['4'],
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.darker,
  },
  listCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['2'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  listCardPressed: {
    backgroundColor: '#FAFAFA',
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  listIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardContent: {
    flex: 1,
  },
  categoryBadgeSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.darker,
  },
  listBookmarkButton: {
    padding: 4,
  },
  expandedContent: {
    marginTop: spacing['3'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
  },
  expandedText: {
    fontSize: 14,
    color: Colors.neutral.dark,
    lineHeight: 20,
    marginBottom: spacing['3'],
  },
  expandedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  expandedActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default TipsCard;
