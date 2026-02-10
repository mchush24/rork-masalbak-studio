/**
 * ArtworkGallery - Eser Galerisi
 *
 * Phase 2: Social Gallery
 * - Tamamlanmış boyamaların gösterimi
 * - Paylaşım özellikleri
 * - Beğeni ve yorum sistemi (opsiyonel)
 * - Filtreleme ve sıralama
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
  Share,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - ITEM_SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

// ============================================
// TYPES
// ============================================

export interface Artwork {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  childName: string;
  childAge?: number;
  createdAt: Date;
  colorsUsed?: number;
  timeSpent?: number; // in minutes
  likes?: number;
  isLiked?: boolean;
  isFeatured?: boolean;
}

interface ArtworkGalleryProps {
  artworks: Artwork[];
  onArtworkPress?: (artwork: Artwork) => void;
  onLikePress?: (artwork: Artwork) => void;
  onSharePress?: (artwork: Artwork) => void;
  onDeletePress?: (artwork: Artwork) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  showChildInfo?: boolean;
  showActions?: boolean;
  title?: string;
}

// ============================================
// ARTWORK CARD COMPONENT
// ============================================

interface ArtworkCardProps {
  artwork: Artwork;
  onPress?: () => void;
  onLikePress?: () => void;
  onSharePress?: () => void;
  showChildInfo?: boolean;
  showActions?: boolean;
  index: number;
}

// Memoized to prevent unnecessary re-renders in FlatList
const ArtworkCard = memo(function ArtworkCard({
  artwork,
  onPress,
  onLikePress,
  onSharePress,
  showChildInfo = true,
  showActions = true,
  index,
}: ArtworkCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLikePress = () => {
    // Heart bounce animation
    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    onLikePress?.();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Featured Badge */}
        {artwork.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Öne Çıkan</Text>
          </View>
        )}

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: artwork.thumbnailUrl || artwork.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Overlay Stats */}
          <View style={styles.imageOverlay}>
            {artwork.colorsUsed && (
              <View style={styles.statBadge}>
                <Text style={styles.statText}>🎨 {artwork.colorsUsed}</Text>
              </View>
            )}
            {artwork.timeSpent && (
              <View style={styles.statBadge}>
                <Text style={styles.statText}>⏱️ {artwork.timeSpent}dk</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {artwork.title}
          </Text>

          {/* Child Info */}
          {showChildInfo && (
            <View style={styles.childInfo}>
              <Text style={styles.childName}>
                {artwork.childName}
                {artwork.childAge && ` (${artwork.childAge} yaş)`}
              </Text>
              <Text style={styles.date}>{formatDate(artwork.createdAt)}</Text>
            </View>
          )}

          {/* Actions */}
          {showActions && (
            <View style={styles.actions}>
              {/* Like Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLikePress}
              >
                <Animated.Text
                  style={[
                    styles.actionIcon,
                    { transform: [{ scale: likeAnim }] },
                  ]}
                >
                  {artwork.isLiked ? '❤️' : '🤍'}
                </Animated.Text>
                {artwork.likes !== undefined && artwork.likes > 0 && (
                  <Text style={styles.likeCount}>{artwork.likes}</Text>
                )}
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSharePress}
              >
                <Text style={styles.actionIcon}>📤</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================
// ARTWORK DETAIL MODAL
// ============================================

interface ArtworkDetailProps {
  artwork: Artwork | null;
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

function ArtworkDetail({
  artwork,
  visible,
  onClose,
  onShare,
  onDelete,
}: ArtworkDetailProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!artwork) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: artwork.title,
        message: `${artwork.childName} tarafından boyanan "${artwork.title}" eserine göz at!`,
        url: artwork.imageUrl,
      });
      onShare?.();
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          {/* Full Image */}
          <Image
            source={{ uri: artwork.imageUrl }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          {/* Info */}
          <View style={styles.modalInfo}>
            <Text style={styles.modalTitle}>{artwork.title}</Text>
            <Text style={styles.modalArtist}>
              🎨 {artwork.childName}
              {artwork.childAge && ` • ${artwork.childAge} yaş`}
            </Text>

            {/* Stats */}
            <View style={styles.modalStats}>
              {artwork.colorsUsed && (
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatIcon}>🎨</Text>
                  <Text style={styles.modalStatText}>
                    {artwork.colorsUsed} renk
                  </Text>
                </View>
              )}
              {artwork.timeSpent && (
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatIcon}>⏱️</Text>
                  <Text style={styles.modalStatText}>
                    {artwork.timeSpent} dakika
                  </Text>
                </View>
              )}
              {artwork.likes !== undefined && (
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatIcon}>❤️</Text>
                  <Text style={styles.modalStatText}>
                    {artwork.likes} beğeni
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>📤 Paylaş</Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={onDelete}
              >
                <Text style={styles.deleteButtonText}>🗑️ Sil</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================
// MAIN GALLERY COMPONENT
// ============================================

export function ArtworkGallery({
  artworks,
  onArtworkPress,
  onLikePress,
  onSharePress,
  onDeletePress,
  isLoading = false,
  emptyMessage = 'Henüz eser yok',
  showChildInfo = true,
  showActions = true,
  title = 'Galeri',
}: ArtworkGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleArtworkPress = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setDetailVisible(true);
    onArtworkPress?.(artwork);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setSelectedArtwork(null), 300);
  };

  const renderArtwork = ({ item, index }: { item: Artwork; index: number }) => (
    <ArtworkCard
      artwork={item}
      index={index}
      onPress={() => handleArtworkPress(item)}
      onLikePress={() => onLikePress?.(item)}
      onSharePress={() => onSharePress?.(item)}
      showChildInfo={showChildInfo}
      showActions={showActions}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🖼️</Text>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      <Text style={styles.emptySubtext}>
        Boyama tamamladığında eserler burada görünecek
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerCount}>
        {artworks.length} eser
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary.indigo} />
        <Text style={styles.loadingText}>Eserler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={artworks}
        renderItem={renderArtwork}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Detail Modal */}
      <ArtworkDetail
        artwork={selectedArtwork}
        visible={detailVisible}
        onClose={handleCloseDetail}
        onShare={() => onSharePress?.(selectedArtwork!)}
        onDelete={onDeletePress ? () => {
          onDeletePress?.(selectedArtwork!);
          handleCloseDetail();
        } : undefined}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: ITEM_SPACING,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerCount: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },

  // Card Styles
  cardContainer: {
    width: ITEM_WIDTH,
    marginBottom: ITEM_SPACING,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  statBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: '600',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.darkest,
  },
  infoSection: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  childInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  childName: {
    fontSize: 12,
    color: Colors.neutral.medium,
  },
  date: {
    fontSize: 10,
    color: Colors.neutral.light,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 18,
  },
  likeCount: {
    fontSize: 12,
    color: Colors.neutral.medium,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.darkest,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.neutral.medium,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 32,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    color: Colors.neutral.white,
    fontSize: 18,
    fontWeight: '600',
  },
  modalImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.neutral.lightest,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalArtist: {
    fontSize: 14,
    color: Colors.neutral.medium,
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 16,
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalStatIcon: {
    fontSize: 16,
  },
  modalStatText: {
    fontSize: 13,
    color: Colors.neutral.medium,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: Colors.secondary.indigo,
  },
  shareButtonText: {
    color: Colors.neutral.white,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
});
