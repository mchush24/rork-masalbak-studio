/**
 * 👶 Child Selector Chip Component
 *
 * A beautiful, compact chip that shows the selected child
 * and opens a bottom sheet to switch between children.
 *
 * Features:
 * - Compact avatar + name + age display
 * - Animated bottom sheet for child selection
 * - Empty state with "Add child" prompt
 * - Single child auto-select with edit option
 * - Gender indicator (subtle)
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  Baby,
  Plus,
  Check,
  User,
  UserCircle,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Child = {
  name: string;
  age: number;
  gender?: "male" | "female";
  avatarId?: string;
};

type ChildSelectorChipProps = {
  selectedChild: Child | null;
  children: Child[];
  onSelectChild: (child: Child) => void;
  compact?: boolean; // For smaller displays
};

/**
 * Gender-based gradient colors
 */
const getGenderColors = (gender?: "male" | "female"): [string, string] => {
  if (gender === "male") {
    return [Colors.secondary.sky, Colors.secondary.skyLight];
  }
  if (gender === "female") {
    return [Colors.secondary.rose, Colors.secondary.roseLight];
  }
  return [Colors.primary.sunset, Colors.primary.peach];
};

/**
 * Gender icon
 */
const GenderIcon = ({ gender, size = 12 }: { gender?: "male" | "female"; size?: number }) => {
  if (gender === "male") {
    return <Text style={{ fontSize: size }}>👦</Text>;
  }
  if (gender === "female") {
    return <Text style={{ fontSize: size }}>👧</Text>;
  }
  return null;
};

export function ChildSelectorChip({
  selectedChild,
  children,
  onSelectChild,
  compact = false,
}: ChildSelectorChipProps) {
  const [showSheet, setShowSheet] = useState(false);
  const router = useRouter();

  const handleOpenSheet = useCallback(() => {
    setShowSheet(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setShowSheet(false);
  }, []);

  const handleSelectChild = useCallback(
    (child: Child) => {
      onSelectChild(child);
      setShowSheet(false);
    },
    [onSelectChild]
  );

  const handleAddChild = useCallback(() => {
    setShowSheet(false);
    router.push("/(tabs)/profile");
  }, [router]);

  const hasChildren = children && children.length > 0;
  const gradientColors = getGenderColors(selectedChild?.gender);

  return (
    <>
      {/* Chip Button */}
      <Pressable
        onPress={handleOpenSheet}
        style={({ pressed }) => [
          styles.chipContainer,
          pressed && styles.chipPressed,
        ]}
      >
        <LinearGradient
          colors={hasChildren ? gradientColors : ["#E2E8F0", "#F7FAFC"]}
          style={[styles.chipGradient, compact && styles.chipCompact]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {selectedChild ? (
            <>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {selectedChild.avatarId ? (
                  <AvatarDisplay avatarId={selectedChild.avatarId} size={compact ? 24 : 32} />
                ) : (
                  <View style={[styles.defaultAvatar, compact && styles.defaultAvatarCompact]}>
                    <GenderIcon gender={selectedChild.gender} size={compact ? 14 : 18} />
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text
                  style={[styles.childName, compact && styles.childNameCompact]}
                  numberOfLines={1}
                >
                  {selectedChild.name}
                </Text>
                <Text style={[styles.childAge, compact && styles.childAgeCompact]}>
                  {selectedChild.age} yaş
                </Text>
              </View>

              {/* Dropdown Icon */}
              <ChevronDown
                size={compact ? 14 : 18}
                color={Colors.neutral.white}
                style={styles.dropdownIcon}
              />
            </>
          ) : (
            <>
              {/* No child selected */}
              <View style={[styles.defaultAvatar, compact && styles.defaultAvatarCompact]}>
                <Baby size={compact ? 14 : 18} color={Colors.neutral.medium} />
              </View>
              <Text style={[styles.placeholderText, compact && styles.placeholderTextCompact]}>
                Çocuk Seç
              </Text>
              <ChevronDown
                size={compact ? 14 : 18}
                color={Colors.neutral.medium}
                style={styles.dropdownIcon}
              />
            </>
          )}
        </LinearGradient>
      </Pressable>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={handleCloseSheet}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseSheet} />

          <View style={styles.sheetContainer}>
            <LinearGradient
              colors={["#FFFFFF", "#F8F9FA"]}
              style={styles.sheetGradient}
            >
              {/* Handle */}
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Çocuk Seçin</Text>
                <Text style={styles.sheetSubtitle}>
                  Hikaye bu çocuğun yaşına ve cinsiyetine göre oluşturulacak
                </Text>
              </View>

              {/* Children List */}
              {hasChildren ? (
                <ScrollView
                  style={styles.childrenList}
                  contentContainerStyle={styles.childrenListContent}
                  showsVerticalScrollIndicator={false}
                >
                  {children.map((child, index) => {
                    const isSelected =
                      selectedChild?.name === child.name &&
                      selectedChild?.age === child.age;
                    const childGradient = getGenderColors(child.gender);

                    return (
                      <Pressable
                        key={`${child.name}-${index}`}
                        onPress={() => handleSelectChild(child)}
                        style={({ pressed }) => [
                          styles.childCard,
                          isSelected && styles.childCardSelected,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <LinearGradient
                          colors={childGradient}
                          style={styles.childCardGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          {/* Avatar */}
                          <View style={styles.cardAvatarContainer}>
                            {child.avatarId ? (
                              <AvatarDisplay avatarId={child.avatarId} size={48} />
                            ) : (
                              <View style={styles.cardDefaultAvatar}>
                                <GenderIcon gender={child.gender} size={24} />
                              </View>
                            )}
                          </View>

                          {/* Info */}
                          <View style={styles.cardInfoContainer}>
                            <View style={styles.cardNameRow}>
                              <Text style={styles.cardChildName}>{child.name}</Text>
                              {child.gender && (
                                <View
                                  style={[
                                    styles.genderBadge,
                                    child.gender === "male"
                                      ? styles.genderBadgeMale
                                      : styles.genderBadgeFemale,
                                  ]}
                                >
                                  <Text style={styles.genderBadgeText}>
                                    {child.gender === "male" ? "Erkek" : "Kız"}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.cardChildAge}>{child.age} yaş</Text>
                          </View>

                          {/* Selected Check */}
                          {isSelected && (
                            <View style={styles.selectedCheck}>
                              <Check size={20} color={Colors.neutral.white} />
                            </View>
                          )}
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Baby size={48} color={Colors.neutral.light} />
                  </View>
                  <Text style={styles.emptyTitle}>Henüz çocuk eklenmemiş</Text>
                  <Text style={styles.emptySubtitle}>
                    Profil sayfasından çocuk ekleyerek kişiselleştirilmiş hikayeler
                    oluşturabilirsiniz
                  </Text>
                </View>
              )}

              {/* Add Child Button */}
              <Pressable
                onPress={handleAddChild}
                style={({ pressed }) => [
                  styles.addChildButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                  style={styles.addChildButtonGradient}
                >
                  <Plus size={20} color={Colors.neutral.white} />
                  <Text style={styles.addChildButtonText}>Yeni Çocuk Ekle</Text>
                </LinearGradient>
              </Pressable>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Text style={styles.infoNoteText}>
                  💡 Seçili çocuğun yaşına göre hikaye karmaşıklığı ve cinsiyetine göre
                  karakter otomatik ayarlanır
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Chip Styles
  chipContainer: {
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.sm,
  },
  chipPressed: {
    transform: [{ scale: 0.98 }],
  },
  chipGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    gap: spacing["2"],
  },
  chipCompact: {
    paddingVertical: spacing["1.5"],
    paddingHorizontal: spacing["2"],
  },
  avatarContainer: {
    borderRadius: radius.full,
    overflow: "hidden",
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarCompact: {
    width: 24,
    height: 24,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
  },
  childName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  childNameCompact: {
    fontSize: typography.size.xs,
  },
  childAge: {
    fontSize: typography.size.xs,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  childAgeCompact: {
    fontSize: 10,
  },
  dropdownIcon: {
    opacity: 0.9,
  },
  placeholderText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
    flex: 1,
  },
  placeholderTextCompact: {
    fontSize: typography.size.xs,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheetContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    overflow: "hidden",
    ...shadows.xl,
  },
  sheetGradient: {
    paddingTop: spacing["2"],
    paddingBottom: spacing["6"],
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: radius.full,
    alignSelf: "center",
    marginBottom: spacing["4"],
  },
  sheetHeader: {
    paddingHorizontal: spacing["6"],
    marginBottom: spacing["4"],
  },
  sheetTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
  },
  sheetSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    lineHeight: typography.size.sm * 1.5,
  },

  // Children List
  childrenList: {
    maxHeight: SCREEN_HEIGHT * 0.35,
    paddingHorizontal: spacing["4"],
  },
  childrenListContent: {
    gap: spacing["3"],
    paddingBottom: spacing["2"],
  },
  childCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  childCardSelected: {
    borderWidth: 3,
    borderColor: Colors.neutral.white,
  },
  childCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing["4"],
    gap: spacing["3"],
  },
  cardAvatarContainer: {
    borderRadius: radius.full,
    overflow: "hidden",
  },
  cardDefaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfoContainer: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    marginBottom: spacing["1"],
  },
  cardChildName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  cardChildAge: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  genderBadge: {
    paddingHorizontal: spacing["2"],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  genderBadgeMale: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  genderBadgeFemale: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  genderBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.white,
  },
  selectedCheck: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["8"],
    paddingHorizontal: spacing["6"],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
    marginBottom: spacing["2"],
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: typography.size.sm * 1.5,
  },

  // Add Child Button
  addChildButton: {
    marginHorizontal: spacing["4"],
    marginTop: spacing["4"],
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.sm,
  },
  addChildButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["4"],
    gap: spacing["2"],
  },
  addChildButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
  },

  // Info Note
  infoNote: {
    marginHorizontal: spacing["4"],
    marginTop: spacing["4"],
    padding: spacing["3"],
    backgroundColor: Colors.semantic.infoBg,
    borderRadius: radius.lg,
  },
  infoNoteText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    textAlign: "center",
    lineHeight: typography.size.xs * 1.5,
  },
});
