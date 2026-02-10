import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { X, Check, Camera, ImageIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { AVATARS, CATEGORY_NAMES, getAvatarById, type AvatarCategory } from '@/constants/avatars';
import { Colors } from '@/constants/colors';
import { layout, typography, spacing, radius, shadows } from '@/constants/design-system';
import { pickAvatarFromLibrary, captureAvatarWithCamera } from '@/services/imagePick';

type PickerTab = 'photo' | AvatarCategory;

const TAB_NAMES: Record<PickerTab, string> = {
  photo: 'Fotoğraf',
  ...CATEGORY_NAMES,
};

interface AvatarPickerProps {
  visible: boolean;
  selectedAvatarId?: string;
  onSelect: (avatarIdOrUrl: string) => void;
  onPhotoSelected?: (uri: string) => void;
  onClose: () => void;
}

export function AvatarPicker({
  visible,
  selectedAvatarId,
  onSelect,
  onPhotoSelected,
  onClose,
}: AvatarPickerProps) {
  const [selectedTab, setSelectedTab] = useState<PickerTab>('photo');
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const tabs: PickerTab[] = ['photo', 'characters', 'animals', 'objects', 'emojis'];

  const filteredAvatars =
    selectedTab !== 'photo' ? AVATARS.filter(avatar => avatar.category === selectedTab) : [];

  const handleSelectAvatar = (avatarId: string) => {
    onSelect(avatarId);
    onClose();
  };

  const handlePickFromGallery = async () => {
    setPickingPhoto(true);
    try {
      const uri = await pickAvatarFromLibrary();
      if (uri) {
        if (onPhotoSelected) {
          onPhotoSelected(uri);
        }
        onClose();
      }
    } finally {
      setPickingPhoto(false);
    }
  };

  const handleCaptureFromCamera = async () => {
    setPickingPhoto(true);
    try {
      const uri = await captureAvatarWithCamera();
      if (uri) {
        if (onPhotoSelected) {
          onPhotoSelected(uri);
        }
        onClose();
      }
    } finally {
      setPickingPhoto(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Avatar Seç</Text>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <X size={24} color={Colors.neutral.dark} />
            </Pressable>
          </View>

          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map(tab => {
                const isSelected = tab === selectedTab;
                return (
                  <Pressable
                    key={tab}
                    style={({ pressed }) => [
                      styles.categoryTab,
                      isSelected && styles.categoryTabSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => setSelectedTab(tab)}
                  >
                    <Text
                      style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]}
                    >
                      {TAB_NAMES[tab]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Content */}
          {selectedTab === 'photo' ? (
            <View style={styles.photoTabContent}>
              {pickingPhoto ? (
                <ActivityIndicator size="large" color={Colors.secondary.grass} />
              ) : (
                <>
                  <Text style={styles.photoTabDescription}>
                    Galeriden veya kameradan bir fotoğraf seçin
                  </Text>
                  <View style={styles.photoButtons}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.photoButton,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={handlePickFromGallery}
                    >
                      <LinearGradient
                        colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                        style={styles.photoButtonGradient}
                      >
                        <ImageIcon size={28} color={Colors.neutral.white} />
                        <Text style={styles.photoButtonText}>Galeri</Text>
                      </LinearGradient>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.photoButton,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={handleCaptureFromCamera}
                    >
                      <LinearGradient
                        colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                        style={styles.photoButtonGradient}
                      >
                        <Camera size={28} color={Colors.neutral.white} />
                        <Text style={styles.photoButtonText}>Kamera</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ) : (
            <ScrollView style={styles.avatarGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarGridContent}>
                {filteredAvatars.map(avatar => {
                  const isSelected = avatar.id === selectedAvatarId;
                  return (
                    <Pressable
                      key={avatar.id}
                      style={({ pressed }) => [
                        styles.avatarItem,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                      ]}
                      onPress={() => handleSelectAvatar(avatar.id)}
                    >
                      <LinearGradient
                        colors={avatar.gradientColors}
                        style={[styles.avatarCircle, isSelected && styles.avatarCircleSelected]}
                      >
                        <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Check size={16} color={Colors.neutral.white} />
                          </View>
                        )}
                      </LinearGradient>
                      <Text style={styles.avatarName} numberOfLines={1}>
                        {avatar.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Avatar Display Component - Seçili avatar'ı göstermek için
 * avatarUrl prop ile fotoğraf URL desteği
 */
interface AvatarDisplayProps {
  avatarId?: string;
  avatarUrl?: string;
  size?: number;
  showName?: boolean;
}

export function AvatarDisplay({
  avatarId,
  avatarUrl,
  size = 72,
  showName = false,
}: AvatarDisplayProps) {
  // Check if either prop is a photo URL (http or file)
  const photoUrl = [avatarUrl, avatarId].find(
    v => v && (v.startsWith('http') || v.startsWith('file'))
  );

  if (photoUrl) {
    return (
      <View style={styles.avatarDisplayContainer}>
        <Image
          source={{ uri: photoUrl }}
          style={[
            styles.avatarDisplayCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          contentFit="cover"
        />
      </View>
    );
  }

  // Try to resolve avatarId (which might also be stored in avatarUrl field)
  const resolveId = avatarUrl || avatarId;
  const avatar = resolveId ? getAvatarById(resolveId) : null;

  if (!avatar) {
    // Fallback: Default gradient + User icon
    return (
      <View style={[styles.avatarDisplayContainer, { width: size, height: size }]}>
        <LinearGradient
          colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
          style={[
            styles.avatarDisplayCircle,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.avatarDisplayEmoji, { fontSize: size * 0.5 }]}>👤</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.avatarDisplayContainer}>
      <LinearGradient
        colors={avatar.gradientColors}
        style={[styles.avatarDisplayCircle, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.avatarDisplayEmoji, { fontSize: size * 0.5 }]}>{avatar.emoji}</Text>
      </LinearGradient>
      {showName && <Text style={styles.avatarDisplayName}>{avatar.name}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  modalCloseButton: {
    padding: spacing['2'],
  },

  // Category Tabs
  categoryTabs: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  categoryTab: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    marginRight: spacing['2'],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lightest,
  },
  categoryTabSelected: {
    backgroundColor: Colors.secondary.grassLight,
  },
  categoryTabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
  },
  categoryTabTextSelected: {
    color: Colors.neutral.darkest,
  },

  // Photo Tab
  photoTabContent: {
    padding: spacing['6'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  photoTabDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginBottom: spacing['6'],
    fontWeight: typography.weight.medium,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing['4'],
  },
  photoButton: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  photoButtonGradient: {
    paddingVertical: spacing['6'],
    alignItems: 'center',
    gap: spacing['3'],
    borderRadius: radius.xl,
    ...shadows.md,
  },
  photoButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },

  // Avatar Grid
  avatarGrid: {
    flex: 1,
  },
  avatarGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing['4'],
    gap: spacing['3'],
  },
  avatarItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    position: 'relative',
  },
  avatarCircleSelected: {
    borderWidth: 3,
    borderColor: Colors.secondary.grass,
    ...shadows.lg,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  selectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.grass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  avatarName: {
    marginTop: spacing['2'],
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    fontWeight: typography.weight.medium,
  },

  // Avatar Display Component
  avatarDisplayContainer: {
    alignItems: 'center',
  },
  avatarDisplayCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.neutral.white,
    ...shadows.lg,
    overflow: 'hidden',
  },
  avatarDisplayEmoji: {
    textAlign: 'center',
  },
  avatarDisplayName: {
    marginTop: spacing['2'],
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
});
