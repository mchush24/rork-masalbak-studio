/**
 * EndingCelebration - Hikaye bitis kutlamasi
 *
 * Hikaye tamamlandiginda gosterilen kutlama ekrani.
 * Konfeti animasyonu ve ebeveyn raporu secenegi.
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Star, FileText, Share2, Home } from "lucide-react-native";
import { InteractiveCharacter } from "@/types/InteractiveStory";
import { shadows } from "@/constants/design-system";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EndingCelebrationProps {
  character: InteractiveCharacter;
  totalChoices: number;
  onViewReport: () => void;
  onGoHome: () => void;
  onShare?: () => void;
}

export function EndingCelebration({
  character,
  totalChoices,
  onViewReport,
  onGoHome,
  onShare,
}: EndingCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    [...Array(20)].map(() => ({
      translateY: new Animated.Value(-100),
      translateX: new Animated.Value(Math.random() * SCREEN_WIDTH),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    // Haptic feedback
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Ana animasyonlar
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Konfeti animasyonu
    confettiAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: 800,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const getCharacterEmoji = (type: string): string => {
    const emojiMap: Record<string, string> = {
      tilki: "🦊", tavsan: "🐰", ayi: "🐻", kedi: "🐱",
      kopek: "🐶", kus: "🐦", sincap: "🐿️", fil: "🐘",
      fox: "🦊", rabbit: "🐰", bear: "🐻", cat: "🐱",
    };
    return emojiMap[type.toLowerCase()] || "🌟";
  };

  const confettiEmojis = ["🎉", "⭐", "✨", "🎊", "💫", "🌟", "🎈", "💜"];

  return (
    <LinearGradient
      colors={["#7C3AED", "#9333EA", "#A855F7"]}
      style={styles.container}
    >
      {/* Konfeti */}
      <View style={styles.confettiContainer}>
        {confettiAnims.map((anim, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.confetti,
              {
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
                opacity: anim.opacity,
                left: ((i * 5) % 100) / 100 * SCREEN_WIDTH,
              },
            ]}
          >
            {confettiEmojis[i % confettiEmojis.length]}
          </Animated.Text>
        ))}
      </View>

      {/* Ana icerik */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Karakter */}
        <View style={styles.characterContainer}>
          <Text style={styles.characterEmoji}>
            {getCharacterEmoji(character.type)}
          </Text>
        </View>

        {/* Baslik */}
        <Text style={styles.title}>Tebrikler!</Text>
        <Text style={styles.subtitle}>
          {character.name} ile harika bir macera yasadin!
        </Text>

        {/* Istatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Star size={24} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.statValue}>{totalChoices}</Text>
            <Text style={styles.statLabel}>Secim</Text>
          </View>
        </View>

        {/* Mesaj */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            Her secimin seni benzersiz yapan ozelliklerini gosteriyor.
            Ailenle bu deneyimi paylasabilirsin!
          </Text>
        </View>
      </Animated.View>

      {/* Butonlar */}
      <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
        {/* Rapor Gor */}
        <Pressable style={styles.primaryButton} onPress={onViewReport}>
          <FileText size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Raporumu Gor</Text>
        </Pressable>

        {/* Ikincil butonlar */}
        <View style={styles.secondaryButtons}>
          {onShare && (
            <Pressable style={styles.secondaryButton} onPress={onShare}>
              <Share2 size={20} color="#9333EA" />
              <Text style={styles.secondaryButtonText}>Paylas</Text>
            </Pressable>
          )}
          <Pressable style={styles.secondaryButton} onPress={onGoHome}>
            <Home size={20} color="#9333EA" />
            <Text style={styles.secondaryButtonText}>Ana Sayfa</Text>
          </Pressable>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  confetti: {
    position: "absolute",
    fontSize: 24,
  },
  content: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 32,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    ...shadows.lg,
  },
  characterContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  characterEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7C3AED",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  messageBox: {
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    padding: 16,
  },
  messageText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  buttons: {
    width: "100%",
    maxWidth: 340,
    marginTop: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    ...shadows.sm,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9333EA",
  },
  secondaryButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default EndingCelebration;
