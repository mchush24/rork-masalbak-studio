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
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PAGE_WIDTH = SCREEN_WIDTH * 0.85;

type StoryPage = {
  text: string;
  img_url: string;
};

type Story = {
  title: string;
  pages: StoryPage[];
};

export default function StorybookScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const [story, setStory] = useState<Story | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pageTransitionAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Check if we're viewing an existing storybook or generating a new one
  const existingPages = params.pages ? JSON.parse(params.pages as string) : null;
  const existingTitle = params.title as string;

  // For new storybook generation (from analysis)
  const imageUri = params.imageUri as string;
  const analysisTitle = params.analysisTitle as string;
  const analysisDescription = params.description as string;
  const themes = params.themes ? JSON.parse(params.themes as string) : [];
  const drawingAnalysis = params.drawingAnalysis ? JSON.parse(params.drawingAnalysis as string) : null;
  const childAge = params.childAge ? parseInt(params.childAge as string, 10) : 5;

  // tRPC mutation
  const generateStoryMutation = trpc.studio.generateStoryFromDrawing.useMutation();

  useEffect(() => {
    if (existingPages && existingTitle) {
      // Load existing storybook
      setStory({
        title: existingTitle,
        pages: existingPages,
      });
    } else if (imageUri && analysisTitle) {
      // Generate new storybook
      generateStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (story) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [story, fadeAnim]);

  // Loading animations
  useEffect(() => {
    if (generating) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      // Step through loading messages
      const stepInterval = setInterval(() => {
        setGenerationStep((prev) => (prev + 1) % 4);
      }, 4000);

      return () => clearInterval(stepInterval);
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      setGenerationStep(0);
    }
  }, [generating]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  async function generateStory() {
    if (!drawingAnalysis) {
      Alert.alert(
        "Eksik Bilgi",
        "Masal oluşturmak için çizim analizi gerekli. Lütfen önce bir çizim analiz edin."
      );
      return;
    }

    setGenerating(true);

    try {
      console.log("[Storybook] Starting story generation...");
      console.log("[Storybook] Child age:", childAge);
      console.log("[Storybook] Drawing analysis:", drawingAnalysis ? "Available" : "Missing");

      const result = await generateStoryMutation.mutateAsync({
        drawingAnalysis: drawingAnalysis,
        childAge: childAge,
        language: "tr",
        drawingTitle: analysisTitle,
        drawingDescription: analysisDescription,
        themes: themes,
        makePdf: true,
        makeTts: false,
      });

      console.log("[Storybook] ✅ Story generated successfully!");
      console.log("[Storybook] Title:", result.story.title);
      console.log("[Storybook] Pages:", result.storybook.pages.length);

      // Set story data
      setStory({
        title: result.story.title,
        pages: result.storybook.pages,
      });

      // Show success haptic feedback
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      console.error("[Storybook] ❌ Story generation error:", error);
      Alert.alert(
        "Hata",
        error.message || "Masal oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setGenerating(false);
    }
  }

  const animatePageTransition = (direction: 'next' | 'prev', callback: () => void) => {
    const slideValue = direction === 'next' ? -30 : 30;

    // Fade out and slide
    Animated.parallel([
      Animated.timing(pageTransitionAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'next' ? 30 : -30);

      // Fade in and slide back
      Animated.parallel([
        Animated.timing(pageTransitionAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  async function nextPage() {
    if (story && currentPage < story.pages.length - 1) {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      animatePageTransition('next', () => setCurrentPage(currentPage + 1));
    }
  }

  async function prevPage() {
    if (currentPage > 0) {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      animatePageTransition('prev', () => setCurrentPage(currentPage - 1));
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
              {/* Animated Sparkles Icon */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }, { rotate: rotateInterpolate }],
                }}
              >
                <Sparkles size={80} color="#9333EA" />
              </Animated.View>

              {/* Loading Steps with Fun Messages */}
              <View style={styles.loadingStepsContainer}>
                <View style={[styles.loadingStep, generationStep >= 0 && styles.loadingStepActive]}>
                  <Text style={styles.loadingStepIcon}>✨</Text>
                  <Text style={styles.loadingStepText}>Çizimini inceliyorum...</Text>
                </View>

                <View style={[styles.loadingStep, generationStep >= 1 && styles.loadingStepActive]}>
                  <Text style={styles.loadingStepIcon}>📝</Text>
                  <Text style={styles.loadingStepText}>Hikaye yazıyorum...</Text>
                </View>

                <View style={[styles.loadingStep, generationStep >= 2 && styles.loadingStepActive]}>
                  <Text style={styles.loadingStepIcon}>🎨</Text>
                  <Text style={styles.loadingStepText}>Görseller hazırlıyorum...</Text>
                </View>

                <View style={[styles.loadingStep, generationStep >= 3 && styles.loadingStepActive]}>
                  <Text style={styles.loadingStepIcon}>✅</Text>
                  <Text style={styles.loadingStepText}>Masalını tamamlıyorum!</Text>
                </View>
              </View>

              <ActivityIndicator size="large" color="#9333EA" style={{ marginTop: 20 }} />

              <Text style={styles.loadingMainText}>Sihirli masalın hazırlanıyor!</Text>
              <Text style={styles.loadingSubtext}>
                Bu işlem 1-2 dakika sürebilir
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

            <Animated.View
              style={[
                styles.pageContainer,
                {
                  opacity: pageTransitionAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={styles.page}>
                <View style={styles.pageImageContainer}>
                  <Image
                    source={{ uri: story.pages[currentPage]?.img_url }}
                    style={styles.pageImage}
                    contentFit="cover"
                  />
                  <View style={styles.pageNumberBadge}>
                    <Text style={styles.pageNumberText}>
                      Sayfa {currentPage + 1} / {story.pages.length}
                    </Text>
                  </View>
                </View>

                {/* Beautiful Story Text Container */}
                <LinearGradient
                  colors={['#FEF3E2', '#FFF8F0', '#FFFBF5']}
                  style={styles.pageTextContainer}
                >
                  {/* Decorative Corner Stars */}
                  <View style={styles.decorativeCornerTopLeft}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                  </View>
                  <View style={styles.decorativeCornerTopRight}>
                    <Star size={12} color="#9333EA" fill="#9333EA" />
                  </View>
                  <View style={styles.decorativeCornerBottomLeft}>
                    <Star size={12} color="#9333EA" fill="#9333EA" />
                  </View>
                  <View style={styles.decorativeCornerBottomRight}>
                    <Star size={16} color="#FFD700" fill="#FFD700" />
                  </View>

                  {/* Story Text with Drop Cap */}
                  <View style={styles.storyTextWrapper}>
                    {story.pages[currentPage]?.text && (
                      <>
                        <Text style={styles.dropCap}>
                          {story.pages[currentPage].text.charAt(0)}
                        </Text>
                        <Text style={styles.pageText}>
                          {story.pages[currentPage].text.slice(1)}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Decorative Divider */}
                  <View style={styles.decorativeDivider}>
                    <View style={styles.dividerLine} />
                    <Sparkles size={20} color="#9333EA" />
                    <View style={styles.dividerLine} />
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

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
  loadingStepsContainer: {
    width: "100%",
    gap: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  loadingStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 16,
    opacity: 0.4,
  },
  loadingStepActive: {
    opacity: 1,
    backgroundColor: "rgba(147, 51, 234, 0.1)",
    borderWidth: 2,
    borderColor: "#9333EA",
  },
  loadingStepIcon: {
    fontSize: 24,
  },
  loadingStepText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.neutral.darkest,
    flex: 1,
  },
  loadingMainText: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#9333EA",
    textAlign: "center",
    marginTop: 16,
    letterSpacing: -0.3,
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
    padding: 24,
    paddingTop: 28,
    paddingBottom: 20,
    minHeight: 180,
    justifyContent: "center",
    position: "relative",
    borderTopWidth: 3,
    borderTopColor: "rgba(147, 51, 234, 0.15)",
  },
  storyTextWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  dropCap: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: "#9333EA",
    lineHeight: 52,
    marginRight: 4,
    marginTop: -4,
    textShadowColor: "rgba(147, 51, 234, 0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  pageText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 28,
    color: "#2D1B4E",
    textAlign: "left",
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
  // Decorative Elements
  decorativeCornerTopLeft: {
    position: "absolute",
    top: 8,
    left: 8,
    opacity: 0.8,
  },
  decorativeCornerTopRight: {
    position: "absolute",
    top: 12,
    right: 12,
    opacity: 0.6,
  },
  decorativeCornerBottomLeft: {
    position: "absolute",
    bottom: 12,
    left: 12,
    opacity: 0.6,
  },
  decorativeCornerBottomRight: {
    position: "absolute",
    bottom: 8,
    right: 8,
    opacity: 0.8,
  },
  decorativeDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 12,
  },
  dividerLine: {
    height: 2,
    width: 40,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    borderRadius: 1,
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
