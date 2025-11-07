import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Colors } from "@/constants/colors";
import { useState, useRef, useEffect } from "react";
import { Image } from "expo-image";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { generateText } from "@rork/toolkit-sdk";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PAGE_WIDTH = SCREEN_WIDTH * 0.85;

type StoryPage = {
  pageNumber: number;
  text: string;
  illustration?: string;
};

type Story = {
  title: string;
  pages: StoryPage[];
};

export default function StorybookScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const [story, setStory] = useState<Story | null>(null);
  const [generating, setGenerating] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const imageUri = params.imageUri as string;
  const analysisTitle = params.title as string;
  const analysisDescription = params.description as string;
  const themes = JSON.parse((params.themes as string) || "[]");

  useEffect(() => {
    generateStory();
  }, []);

  useEffect(() => {
    if (story) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [story]);

  async function generateStory() {
    setGenerating(true);

    try {
      const prompt = `Bu çocuk çiziminden ilham alarak 5 sayfalık kısa bir çocuk masalı oluştur.

Çizim Başlığı: ${analysisTitle}
Çizim Açıklaması: ${analysisDescription}
Temalar: ${themes.join(", ")}

Masal şu JSON formatında olmalı:
{
  "title": "Masalın başlığı",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Sayfa 1'in metni (2-3 cümle, çocuk dostu)"
    },
    {
      "pageNumber": 2,
      "text": "Sayfa 2'nin metni"
    },
    ...5 sayfaya kadar
  ]
}

Her sayfa çocukların anlayabileceği basit, eğlenceli ve öğretici olmalı. Başlangıç-Orta-Son yapısını koru.`;

      const response = await generateText({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setStory(parsed);
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
      }
    } catch (error: any) {
      console.error("Story generation error:", error);
      Alert.alert("Hata", "Masal oluşturulurken bir hata oluştu.");
    } finally {
      setGenerating(false);
    }
  }

  async function nextPage() {
    if (story && currentPage < story.pages.length - 1) {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentPage(currentPage + 1);
    }
  }

  async function prevPage() {
    if (currentPage > 0) {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentPage(currentPage - 1);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Masal Kitabı",
          headerStyle: { backgroundColor: Colors.background.primary },
          headerTintColor: Colors.neutral.darkest,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.content, { paddingTop: 20, paddingBottom: insets.bottom + 20 }]}>
        {generating && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <Sparkles size={64} color="#9333EA" />
              <ActivityIndicator size="large" color="#9333EA" />
              <Text style={styles.loadingText}>Masalınız oluşturuluyor...</Text>
              <Text style={styles.loadingSubtext}>
                Çizimden ilham alan benzersiz bir hikaye yazılıyor
              </Text>
            </View>
          </View>
        )}

        {story && !generating && (
          <Animated.View style={[styles.storyContainer, { opacity: fadeAnim }]}>
            <View style={styles.bookHeader}>
              <BookOpen size={32} color="#9333EA" />
              <Text style={styles.storyTitle}>{story.title}</Text>
            </View>

            <View style={styles.pageContainer}>
              <View style={styles.page}>
                <View style={styles.pageImageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.pageImage} />
                  <View style={styles.pageNumberBadge}>
                    <Text style={styles.pageNumberText}>
                      Sayfa {currentPage + 1} / {story.pages.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.pageTextContainer}>
                  <Text style={styles.pageText}>
                    {story.pages[currentPage]?.text}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.navigationContainer}>
              <Pressable
                onPress={prevPage}
                disabled={currentPage === 0}
                style={[
                  styles.navButton,
                  styles.navButtonPrev,
                  currentPage === 0 && styles.navButtonDisabled,
                ]}
              >
                <ChevronLeft
                  size={28}
                  color={currentPage === 0 ? Colors.neutral.light : "#9333EA"}
                />
              </Pressable>

              <View style={styles.pageIndicator}>
                {story.pages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === currentPage && styles.dotActive,
                    ]}
                  />
                ))}
              </View>

              <Pressable
                onPress={nextPage}
                disabled={currentPage === story.pages.length - 1}
                style={[
                  styles.navButton,
                  styles.navButtonNext,
                  currentPage === story.pages.length - 1 &&
                    styles.navButtonDisabled,
                ]}
              >
                <ChevronRight
                  size={28}
                  color={
                    currentPage === story.pages.length - 1
                      ? Colors.neutral.light
                      : "#9333EA"
                  }
                />
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 32,
    padding: 48,
    alignItems: "center",
    gap: 20,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    maxWidth: 320,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  loadingSubtext: {
    fontSize: 15,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: 22,
  },
  storyContainer: {
    flex: 1,
    gap: 24,
  },
  bookHeader: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  storyTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    letterSpacing: -0.3,
  },
  pageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    width: PAGE_WIDTH,
    backgroundColor: Colors.neutral.white,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  pageImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  pageImage: {
    width: "100%",
    height: "100%",
  },
  pageNumberBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(147, 51, 234, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.5,
  },
  pageTextContainer: {
    padding: 28,
    minHeight: 160,
    justifyContent: "center",
  },
  pageText: {
    fontSize: 18,
    lineHeight: 30,
    color: Colors.neutral.darkest,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonPrev: {},
  navButtonNext: {},
  navButtonDisabled: {
    opacity: 0.3,
  },
  pageIndicator: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.light,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#9333EA",
  },
});
