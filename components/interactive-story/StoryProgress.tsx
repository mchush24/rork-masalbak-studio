/**
 * StoryProgress - Hikaye ilerleme gostergesi
 *
 * Cocugun hikayede nerede oldugunu gosterir.
 * Yildizlar ve renkli noktalarla gorsel geri bildirim.
 */

import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

interface StoryProgressProps {
  currentChoice: number;
  totalChoices: number;
  currentPage: number;
  totalPages: number;
  isChoiceTime: boolean;
}

export function StoryProgress({
  currentChoice,
  totalChoices,
  currentPage,
  totalPages,
  isChoiceTime,
}: StoryProgressProps) {
  return (
    <View style={styles.container}>
      {/* Secim ilerleme */}
      <View style={styles.choiceProgress}>
        {Array.from({ length: totalChoices }).map((_, i) => (
          <View key={i} style={styles.choiceItem}>
            <View
              style={[
                styles.choiceStar,
                i < currentChoice && styles.choiceStarCompleted,
                i === currentChoice && isChoiceTime && styles.choiceStarCurrent,
              ]}
            >
              <Text style={styles.choiceStarText}>
                {i < currentChoice ? "⭐" : i === currentChoice && isChoiceTime ? "✨" : "☆"}
              </Text>
            </View>
            {i < totalChoices - 1 && (
              <View
                style={[
                  styles.choiceLine,
                  i < currentChoice && styles.choiceLineCompleted,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Sayfa ilerleme (secim zamani degilse) */}
      {!isChoiceTime && (
        <View style={styles.pageProgress}>
          <View style={styles.pageBar}>
            <View
              style={[
                styles.pageBarFill,
                { width: `${((currentPage + 1) / totalPages) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.pageText}>
            {currentPage + 1} / {totalPages}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  choiceProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  choiceItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  choiceStar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceStarCompleted: {
    backgroundColor: "#FEF3C7",
  },
  choiceStarCurrent: {
    backgroundColor: "#FDE68A",
    transform: [{ scale: 1.1 }],
  },
  choiceStarText: {
    fontSize: 18,
  },
  choiceLine: {
    width: 24,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  choiceLineCompleted: {
    backgroundColor: "#F59E0B",
  },
  pageProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pageBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  pageBarFill: {
    height: "100%",
    backgroundColor: "#9333EA",
    borderRadius: 3,
  },
  pageText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
});

export default StoryProgress;
