/**
 * 🎈 Floating Child Selector
 *
 * A draggable floating button that shows the selected child
 * and allows quick switching from any screen.
 *
 * Features:
 * - Draggable to any position on screen
 * - Persists position in AsyncStorage
 * - Shows child avatar with gender-based colors
 * - Tap to open child selector bottom sheet
 * - Subtle bounce animation
 * - Snaps to screen edges
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Baby,
  Plus,
  Check,
  X,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography, zIndex } from "@/constants/design-system";
import { AvatarDisplay } from "@/components/AvatarPicker";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 60;
const POSITION_STORAGE_KEY = "@renkioo_floating_child_position";

type Child = {
  name: string;
  age: number;
  gender?: "male" | "female";
  avatarId?: string;
};

type FloatingChildSelectorProps = {
  selectedChild: Child | null;
  children: Child[];
  onSelectChild: (child: Child) => void;
  visible?: boolean;
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
 * Gender emoji
 */
const GenderIcon = ({ gender, size = 20 }: { gender?: "male" | "female"; size?: number }) => {
  if (gender === "male") {
    return <Text style={{ fontSize: size }}>👦</Text>;
  }
  if (gender === "female") {
    return <Text style={{ fontSize: size }}>👧</Text>;
  }
  return <Baby size={size} color={Colors.neutral.white} />;
};

export function FloatingChildSelector({
  selectedChild,
  children,
  onSelectChild,
  visible = true,
}: FloatingChildSelectorProps) {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Safe initial position
  const getInitialPosition = () => {
    const safeWidth = SCREEN_WIDTH > 0 ? SCREEN_WIDTH : 400;
    const safeHeight = SCREEN_HEIGHT > 0 ? SCREEN_HEIGHT : 800;
    return {
      x: safeWidth - BUTTON_SIZE - 20,
      y: safeHeight - BUTTON_SIZE - 150,
    };
  };

  const [position, setPosition] = useState(getInitialPosition);

  // Debug log
  useEffect(() => {
    console.log("[FloatingChildSelector] Mounted, visible:", visible, "position:", position, "screen:", { SCREEN_WIDTH, SCREEN_HEIGHT });
  }, [visible, position]);

  // Load saved position
  useEffect(() => {
    loadPosition();
  }, []);

  const loadPosition = async () => {
    try {
      const saved = await AsyncStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        const pos = JSON.parse(saved);
        setPosition(pos);
        pan.setValue({ x: 0, y: 0 });
      }
    } catch (e) {
      console.log("Failed to load floating button position");
    }
  };

  const savePosition = async (newPos: { x: number; y: number }) => {
    try {
      await AsyncStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPos));
    } catch (e) {
      console.log("Failed to save floating button position");
    }
  };

  // Snap to nearest edge
  const snapToEdge = (x: number, y: number) => {
    const padding = 10;
    const topPadding = Platform.OS === "ios" ? 50 : 30; // Safe area approximation
    const bottomPadding = Platform.OS === "ios" ? 100 : 80;

    const snapLeft = padding;
    const snapRight = SCREEN_WIDTH - BUTTON_SIZE - padding;

    // Snap to nearest horizontal edge
    const newX = x < SCREEN_WIDTH / 2 ? snapLeft : snapRight;

    // Keep within vertical bounds
    const minY = topPadding;
    const maxY = SCREEN_HEIGHT - BUTTON_SIZE - bottomPadding;
    const newY = Math.max(minY, Math.min(maxY, y));

    return { x: newX, y: newY };
  };

  // Pan responder for drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to significant movement
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Scale up slightly when touched
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        // Calculate new position
        const newX = position.x + gestureState.dx;
        const newY = position.y + gestureState.dy;

        // Snap to edge
        const snappedPos = snapToEdge(newX, newY);

        // Animate to snapped position
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: snappedPos.x - position.x, y: snappedPos.y - position.y },
            useNativeDriver: false,
            friction: 5,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Update position state and reset pan
          setPosition(snappedPos);
          pan.setValue({ x: 0, y: 0 });
          savePosition(snappedPos);
        });

        // If minimal movement, treat as tap
        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          setShowSheet(true);
        }
      },
    })
  ).current;

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

  if (!visible) {
    console.log("[FloatingChildSelector] Not visible, returning null");
    return null;
  }

  const gradientColors = getGenderColors(selectedChild?.gender);
  const hasChildren = children && children.length > 0;

  console.log("[FloatingChildSelector] Rendering with position:", position);

  return (
    <>
      {/* Floating Button - positioned directly without full-screen container */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            left: position.x,
            top: position.y,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.floatingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {selectedChild ? (
            selectedChild.avatarId ? (
              <AvatarDisplay avatarId={selectedChild.avatarId} size={40} />
            ) : (
              <GenderIcon gender={selectedChild.gender} size={28} />
            )
          ) : (
            <Baby size={28} color={Colors.neutral.white} />
          )}
        </LinearGradient>

        {/* Age badge */}
        {selectedChild && (
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{selectedChild.age}</Text>
          </View>
        )}

        {/* Child name label */}
        {selectedChild && (
          <View style={styles.nameLabel}>
            <Text style={styles.nameLabelText} numberOfLines={1}>
              {selectedChild.name}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowSheet(false)} />

          <View style={styles.sheetContainer}>
            <LinearGradient
              colors={["#FFFFFF", "#F8F9FA"]}
              style={styles.sheetGradient}
            >
              {/* Handle */}
              <View style={styles.sheetHandle} />

              {/* Close Button */}
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowSheet(false)}
              >
                <X size={20} color={Colors.neutral.dark} />
              </Pressable>

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>👶 Çocuk Seçin</Text>
                <Text style={styles.sheetSubtitle}>
                  Tüm içerikler seçili çocuk için kişiselleştirilecek
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
                                <View style={styles.genderBadge}>
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
                    Profil sayfasından çocuk ekleyerek kişiselleştirilmiş
                    içerikler oluşturabilirsiniz
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

              {/* Drag Hint */}
              <View style={styles.dragHint}>
                <Text style={styles.dragHintText}>
                  💡 Bu butonu ekranda istediğiniz yere sürükleyebilirsiniz
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
  // Floating Button - positioned directly via left/top props
  // Uses design system z-index for consistent layering
  floatingButton: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: zIndex.floating,
    ...shadows.xl,
    elevation: zIndex.floating, // Android z-index - must come after shadows.xl
  },
  floatingGradient: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  ageBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: Colors.neutral.darkest,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  ageBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.neutral.white,
  },
  nameLabel: {
    position: "absolute",
    bottom: -18,
    left: -20,
    right: -20,
    alignItems: "center",
  },
  nameLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.neutral.dark,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
    maxWidth: 100,
    textAlign: "center",
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
  closeButton: {
    position: "absolute",
    top: spacing["4"],
    right: spacing["4"],
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
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

  // Drag Hint
  dragHint: {
    marginHorizontal: spacing["4"],
    marginTop: spacing["4"],
    padding: spacing["3"],
    backgroundColor: Colors.semantic.infoBg,
    borderRadius: radius.lg,
  },
  dragHintText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    textAlign: "center",
  },
});
