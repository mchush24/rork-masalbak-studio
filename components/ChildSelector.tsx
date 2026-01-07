/**
 * 👶 Child Selector Component
 *
 * Features:
 * - Select from user's child profiles
 * - Auto-populate age when child is selected
 * - Beautiful card-based selection UI
 * - Option to skip and enter age manually
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Baby, ArrowRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import { AvatarDisplay } from "@/components/AvatarPicker";

type Child = {
  name: string;
  age: number;
  ageRange?: string;
  avatarId?: string;
};

type ChildSelectorProps = {
  visible: boolean;
  children: Child[];
  onSelectChild: (child: Child) => void;
  onSkip: () => void;
  onClose: () => void;
};

export function ChildSelector({
  visible,
  children,
  onSelectChild,
  onSkip,
  onClose,
}: ChildSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Close Button */}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.neutral.dark} />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <Baby size={48} color="#FF9B7A" />
              <Text style={styles.title}>Hangi çocuğunuz için?</Text>
              <Text style={styles.description}>
                Bir çocuk seçin veya yaş girmek için atlayın
              </Text>
            </View>

            {/* Children List */}
            {children && children.length > 0 ? (
              <ScrollView
                style={styles.childrenList}
                contentContainerStyle={styles.childrenListContent}
                showsVerticalScrollIndicator={false}
              >
                {children.map((child, index) => (
                  <Pressable
                    key={index}
                    onPress={() => onSelectChild(child)}
                    style={({ pressed }) => [
                      styles.childCard,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <LinearGradient
                      colors={["#FF9B7A", "#FFB299"]}
                      style={styles.childCardGradient}
                    >
                      <AvatarDisplay
                        avatarId={child.avatarId}
                        size={56}
                      />
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <Text style={styles.childAge}>
                          {child.ageRange ? `${child.ageRange} yaş` : `${child.age} yaş`}
                        </Text>
                      </View>
                      <ArrowRight size={20} color={Colors.neutral.white} />
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Baby size={64} color={Colors.neutral.light} />
                <Text style={styles.emptyText}>Henüz çocuk profili eklenmemiş</Text>
                <Text style={styles.emptySubtext}>
                  Profil sayfasından çocuk ekleyebilirsiniz
                </Text>
              </View>
            )}

            {/* Skip Button */}
            <Pressable onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Atla ve Yaş Gir</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["4"],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: radius["2xl"],
    overflow: "hidden",
    ...shadows.xl,
  },
  cardGradient: {
    padding: spacing["6"],
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
  header: {
    alignItems: "center",
    marginBottom: spacing["6"],
  },
  title: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginTop: spacing["4"],
    marginBottom: spacing["2"],
    textAlign: "center",
  },
  description: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: typography.size.base * 1.5,
  },
  childrenList: {
    maxHeight: 300,
    marginBottom: spacing["4"],
  },
  childrenListContent: {
    gap: spacing["3"],
  },
  childCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  childCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing["4"],
    gap: spacing["3"],
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    marginBottom: spacing["1"],
  },
  childAge: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["8"],
  },
  emptyText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
    marginTop: spacing["4"],
    marginBottom: spacing["2"],
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: "center",
  },
  skipButton: {
    backgroundColor: Colors.neutral.lighter,
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["6"],
    borderRadius: radius.xl,
    alignItems: "center",
    marginTop: spacing["2"],
  },
  skipText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
});
