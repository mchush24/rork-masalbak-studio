/**
 * InteractiveStoryReader - Ana interaktif hikaye okuyucu
 *
 * Hikaye sayfalarini gosterir, secim noktalarinda
 * ChoiceScreen'e gecer, ve hikaye sonunda
 * kutlama ekrani gosterir.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ChevronLeft, ChevronRight, Sparkles, Book } from "lucide-react-native";
import { ChoiceScreen } from "./ChoiceScreen";
import { StoryProgress } from "./StoryProgress";
import {
  StorySegment,
  ChoicePoint,
  InteractiveCharacter,
  StoryPage,
} from "@/types/InteractiveStory";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PAGE_WIDTH = SCREEN_WIDTH * 0.9;

interface InteractiveStoryReaderProps {
  title: string;
  character: InteractiveCharacter;
  currentSegment: StorySegment;
  currentChoicePoint?: ChoicePoint;
  onChoiceMade: (optionId: string) => void;
  onStoryComplete: () => void;
  isLoading: boolean;
  isEnding: boolean;
  progress: {
    currentChoice: number;
    totalChoices: number;
  };
}

export function InteractiveStoryReader({
  title,
  character,
  currentSegment,
  currentChoicePoint,
  onChoiceMade,
  onStoryComplete,
  isLoading,
  isEnding,
  progress,
}: InteractiveStoryReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showChoice, setShowChoice] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const pages = currentSegment?.pages || [];
  const currentPage = pages[currentPageIndex];
  const isLastPageOfSegment = currentPageIndex === pages.length - 1;

  // Segment degistiginde ilk sayfaya don
  useEffect(() => {
    setCurrentPageIndex(0);
    setShowChoice(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentSegment?.id]);

  // Sayfa gecis animasyonu
  const animatePageTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 200);
  };

  const handleNextPage = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isLastPageOfSegment) {
      // Son sayfa - secim mi yoksa bitis mi?
      if (currentChoicePoint && !isEnding) {
        animatePageTransition(() => setShowChoice(true));
      } else if (isEnding) {
        onStoryComplete();
      }
    } else {
      animatePageTransition(() => setCurrentPageIndex(prev => prev + 1));
    }
  };

  const handlePrevPage = async () => {
    if (currentPageIndex === 0) return;

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    animatePageTransition(() => setCurrentPageIndex(prev => prev - 1));
  };

  const handleChoiceMade = (optionId: string) => {
    setShowChoice(false);
    onChoiceMade(optionId);
  };

  // Yukleniyor durumu
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={{
            transform: [{
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              }),
            }],
          }}
        >
          <Sparkles size={48} color="#9333EA" />
        </Animated.View>
        <Text style={styles.loadingText}>Hikaye hazirlaniyor...</Text>
        <ActivityIndicator size="large" color="#9333EA" style={{ marginTop: 16 }} />
      </View>
    );
  }

  // Secim ekrani
  if (showChoice && currentChoicePoint) {
    return (
      <ChoiceScreen
        choicePoint={currentChoicePoint}
        character={character}
        onChoiceMade={handleChoiceMade}
        currentChoice={progress.currentChoice}
        totalChoices={progress.totalChoices}
      />
    );
  }

  // Hikaye okuma ekrani
  return (
    <View style={styles.container}>
      {/* Baslik */}
      <View style={styles.header}>
        <Book size={24} color="#9333EA" />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Ilerleme */}
      <StoryProgress
        currentChoice={progress.currentChoice}
        totalChoices={progress.totalChoices}
        currentPage={currentPageIndex}
        totalPages={pages.length}
        isChoiceTime={false}
      />

      {/* Sayfa icerigi */}
      <Animated.View style={[styles.pageContainer, { opacity: fadeAnim }]}>
        <View style={styles.pageCard}>
          {/* Gorsel */}
          {currentPage?.img_url ? (
            <Image
              source={{ uri: currentPage.img_url }}
              style={styles.pageImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.pageImagePlaceholder}>
              <LinearGradient
                colors={["#E9D5FF", "#F3E8FF", "#FAF5FF"]}
                style={styles.imagePlaceholderGradient}
              >
                <Sparkles size={40} color="#9333EA" />
                <Text style={styles.imagePlaceholderText}>Gorsel yukleniyor...</Text>
              </LinearGradient>
            </View>
          )}

          {/* Sayfa numarasi */}
          <View style={styles.pageBadge}>
            <Text style={styles.pageBadgeText}>
              {currentPageIndex + 1} / {pages.length}
            </Text>
          </View>

          {/* Metin */}
          <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageText}>{currentPage?.text}</Text>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Navigasyon */}
      <View style={styles.navigation}>
        <Pressable
          onPress={handlePrevPage}
          disabled={currentPageIndex === 0}
          style={[
            styles.navButton,
            currentPageIndex === 0 && styles.navButtonDisabled,
          ]}
        >
          <ChevronLeft size={28} color={currentPageIndex === 0 ? "#D1D5DB" : "#9333EA"} />
        </Pressable>

        {/* Sayfa noktalari */}
        <View style={styles.pageDots}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.pageDot,
                i === currentPageIndex && styles.pageDotActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNextPage}
          style={styles.navButton}
        >
          {isLastPageOfSegment ? (
            <View style={styles.nextActionButton}>
              <Text style={styles.nextActionText}>
                {isEnding ? "Bitir" : "Sec"}
              </Text>
              <Sparkles size={20} color="#fff" />
            </View>
          ) : (
            <ChevronRight size={28} color="#9333EA" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5FF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF5FF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#7C3AED",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    maxWidth: SCREEN_WIDTH - 100,
  },
  pageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pageCard: {
    width: PAGE_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: SCREEN_HEIGHT * 0.65,
  },
  pageImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F3E8FF",
  },
  pageImagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
  },
  imagePlaceholderGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: 12,
    color: "#9333EA",
    fontSize: 14,
  },
  pageBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pageBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  textContainer: {
    maxHeight: 120,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9333EA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 6,
  },
  nextActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pageDots: {
    flexDirection: "row",
    gap: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  pageDotActive: {
    backgroundColor: "#9333EA",
    width: 24,
  },
});

export default InteractiveStoryReader;
