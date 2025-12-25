import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Palette, ImagePlus, Sparkles, Download, X, Wand2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { layout, typography, spacing, radius, shadows, cardVariants, badgeStyles } from "@/constants/design-system";
import { useGenerateColoringPage } from "@/lib/hooks/useGenerateColoringPage";
import * as Linking from "expo-linking";
import { ColoringCanvas } from "@/components/ColoringCanvas";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useLocalSearchParams } from "expo-router";

export default function StudioScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallScreen = width < 380;
  const screenPadding = isSmallScreen ? spacing["4"] : layout.screenPadding;

  // AI Boyama Sayfası States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDrawingImage, setAIDrawingImage] = useState<string | null>(null);
  const [showColoringCanvas, setShowColoringCanvas] = useState(false);
  const { generate, isGenerating, coloringPage, reset } = useGenerateColoringPage();

  // 🎯 ÇÖZÜM: Hayal Atölyesi'nden gelen imageUri'yi otomatik kullan
  useEffect(() => {
    if (params.imageUri && typeof params.imageUri === 'string') {
      console.log('[Studio] 🖼️ Image received from Hayal Atölyesi:', params.imageUri);
      setAIDrawingImage(params.imageUri);
      setShowAIModal(true); // Modal'ı otomatik aç
    }
  }, [params.imageUri]);

  // AI Boyama Sayfası Fonksiyonları
  async function pickAIDrawingImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: true,
    });
    if (!res.canceled && res.assets?.length) {
      setAIDrawingImage(res.assets[0].uri);
    }
  }

  async function handleGenerateAIColoring() {
    if (!aiDrawingImage) {
      Alert.alert(t.studio.selectDrawingFirst);
      return;
    }

    try {
      // Convert image to base64
      let imageBase64: string;
      if (Platform.OS === "web") {
        if (aiDrawingImage.startsWith("data:")) {
          imageBase64 = aiDrawingImage.split(",")[1];
        } else {
          const response = await fetch(aiDrawingImage);
          const blob = await response.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(",")[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } else {
        let uri = aiDrawingImage;
        if (!uri.startsWith("file://") && !uri.startsWith("content://")) {
          uri = `file://${uri}`;
        }
        imageBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
      }

      await generate(imageBase64, {
        style: "simple",
        ageGroup: 5,
      });

      Alert.alert(t.studio.success, t.studio.coloringPageCreated);
    } catch (err) {
      console.error("AI Coloring error:", err);
      Alert.alert(t.common.error, t.studio.coloringPageError);
    }
  }

  function handleDownloadColoring() {
    if (coloringPage?.imageUrl) {
      Linking.openURL(coloringPage.imageUrl);
    }
  }

  function handleCloseAIModal() {
    setShowAIModal(false);
    setAIDrawingImage(null);
    reset();
  }

  return (
    <LinearGradient
      colors={Colors.background.studio}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: screenPadding,
            paddingTop: insets.top + (isSmallScreen ? 12 : 16),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[Colors.secondary.mint, Colors.cards.coloring.icon]}
              style={[
                styles.headerIcon,
                isSmallScreen && { width: 64, height: 64 },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Palette size={isSmallScreen ? 28 : 32} color={Colors.neutral.white} />
            </LinearGradient>
          </View>
          <Text style={[
            styles.headerTitle,
            isSmallScreen && { fontSize: typography.size["3xl"] },
          ]}>
            {t.studio.title}
          </Text>
          <Text style={[
            styles.headerSubtitle,
            isSmallScreen && { fontSize: typography.size.sm, paddingHorizontal: spacing["2"] },
          ]}>
            {t.studio.subtitle}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={[
          styles.statsRow,
          isSmallScreen && { gap: spacing["2"] },
        ]}>
          <View style={[
            styles.statCard,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.statNumber,
              isSmallScreen && { fontSize: typography.size.xl },
            ]}>
              ∞
            </Text>
            <Text style={styles.statLabel}>{t.studio.unlimited}</Text>
          </View>
          <View style={[
            styles.statCard,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.statNumber,
              isSmallScreen && { fontSize: typography.size.xl },
            ]}>
              A4
            </Text>
            <Text style={styles.statLabel}>PDF</Text>
          </View>
          <View style={[
            styles.statCard,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.statNumber,
              isSmallScreen && { fontSize: typography.size.xl },
            ]}>
              HD
            </Text>
            <Text style={styles.statLabel}>{t.studio.quality}</Text>
          </View>
        </View>

        {/* AI Coloring Card */}
        <LinearGradient
          colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
          style={styles.aiCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiCardHeader}>
            <View style={styles.aiBadge}>
              <Wand2 size={16} color={Colors.secondary.lavender} />
              <Text style={styles.aiBadgeText}>{t.studio.newFeature}</Text>
            </View>
          </View>

          <View style={[
            styles.aiIconContainer,
            isSmallScreen && { width: 72, height: 72 },
          ]}>
            <Wand2 size={isSmallScreen ? 36 : 48} color={Colors.neutral.white} />
          </View>

          <Text style={[
            styles.aiCardTitle,
            isSmallScreen && { fontSize: typography.size.xl },
          ]}>
            {t.studio.createInteractive}
          </Text>
          <Text style={[
            styles.aiCardDescription,
            isSmallScreen && { fontSize: typography.size.sm },
          ]}>
            {t.studio.createInteractiveDesc}
          </Text>

          <Pressable
            onPress={() => setShowAIModal(true)}
            style={({ pressed }) => [
              styles.aiButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={[Colors.neutral.white, Colors.neutral.lighter]}
              style={styles.buttonGradient}
            >
              <Sparkles size={20} color={Colors.secondary.lavender} />
              <Text style={styles.aiButtonText}>{t.studio.tryNow}</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>💡</Text>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{t.studio.howItWorks}</Text>
            <Text style={styles.infoText}>
              {t.studio.howItWorksDesc}
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={[
          styles.featuresGrid,
          isSmallScreen && { gap: spacing["2"] },
        ]}>
          <View style={[
            styles.featureItem,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.featureEmoji,
              isSmallScreen && { fontSize: 24 },
            ]}>
              🎨
            </Text>
            <Text style={[
              styles.featureLabel,
              isSmallScreen && { fontSize: typography.size.xs },
            ]}>
              {t.studio.preservesLines}
            </Text>
          </View>
          <View style={[
            styles.featureItem,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.featureEmoji,
              isSmallScreen && { fontSize: 24 },
            ]}>
              ✨
            </Text>
            <Text style={[
              styles.featureLabel,
              isSmallScreen && { fontSize: typography.size.xs },
            ]}>
              {t.studio.hdQuality}
            </Text>
          </View>
          <View style={[
            styles.featureItem,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.featureEmoji,
              isSmallScreen && { fontSize: 24 },
            ]}>
              📄
            </Text>
            <Text style={[
              styles.featureLabel,
              isSmallScreen && { fontSize: typography.size.xs },
            ]}>
              {t.studio.a4Format}
            </Text>
          </View>
          <View style={[
            styles.featureItem,
            isSmallScreen && { padding: spacing["3"] },
          ]}>
            <Text style={[
              styles.featureEmoji,
              isSmallScreen && { fontSize: 24 },
            ]}>
              ⚡
            </Text>
            <Text style={[
              styles.featureLabel,
              isSmallScreen && { fontSize: typography.size.xs },
            ]}>
              {t.studio.fastProcessing}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* AI Coloring Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseAIModal}
      >
        {isGenerating ? (
          <LoadingAnimation type="painting" message={t.studio.creating} />
        ) : (
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={Colors.background.studio}
              style={[
                styles.modalContent,
                { padding: isSmallScreen ? spacing["4"] : spacing["6"] },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={[
                  styles.modalTitle,
                  isSmallScreen && { fontSize: typography.size.xl },
                ]}>
                  {t.studio.interactiveColoring}
                </Text>
                <Pressable onPress={handleCloseAIModal} style={styles.modalCloseButton}>
                  <X size={isSmallScreen ? 20 : 24} color={Colors.neutral.darkest} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Instructions */}
              <View style={styles.modalInstructions}>
                <Text style={styles.instructionsTitle}>{t.studio.howItWorks}</Text>
                <Text style={styles.instructionsText}>
                  {t.studio.instructions}
                </Text>
              </View>

              {/* Image Picker */}
              {aiDrawingImage && (
                <View style={styles.modalImagePreview}>
                  <Image
                    source={{ uri: aiDrawingImage }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalImageLabel}>{t.studio.selectedDrawing}</Text>
                </View>
              )}

              <Pressable
                onPress={pickAIDrawingImage}
                style={({ pressed }) => [
                  styles.modalPickButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                  style={styles.buttonGradient}
                >
                  <ImagePlus size={20} color={Colors.neutral.white} />
                  <Text style={styles.buttonTextWhite}>
                    {aiDrawingImage ? t.studio.selectDifferentDrawing : t.studio.selectDrawing}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Generate Button */}
              <Pressable
                onPress={handleGenerateAIColoring}
                disabled={!aiDrawingImage || isGenerating}
                style={({ pressed }) => [
                  styles.modalGenerateButton,
                  (!aiDrawingImage || isGenerating) && styles.buttonDisabled,
                  pressed && !isGenerating && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    !aiDrawingImage || isGenerating
                      ? [Colors.neutral.light, Colors.neutral.medium]
                      : [Colors.secondary.lavender, Colors.secondary.lavenderLight]
                  }
                  style={styles.buttonGradient}
                >
                  {isGenerating ? (
                    <ActivityIndicator color={Colors.neutral.white} />
                  ) : (
                    <Wand2 size={20} color={Colors.neutral.white} />
                  )}
                  <Text style={styles.buttonTextWhite}>
                    {isGenerating ? t.studio.creating : t.studio.generateColoringPage}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Result */}
              {coloringPage && (
                <View style={styles.modalResult}>
                  <View style={styles.modalResultBadge}>
                    <Text style={styles.modalResultBadgeText}>{t.studio.ready}</Text>
                  </View>

                  <Image
                    source={{ uri: coloringPage.imageUrl }}
                    style={styles.modalResultImage}
                    resizeMode="contain"
                  />

                  <Text style={styles.modalResultDescription}>
                    {coloringPage.analysis}
                  </Text>

                  <View style={styles.modalResultButtons}>
                    <Pressable
                      onPress={() => setShowColoringCanvas(true)}
                      style={({ pressed }) => [
                        styles.modalColorButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                        style={styles.buttonGradient}
                      >
                        <Palette size={20} color={Colors.neutral.white} />
                        <Text style={styles.buttonTextWhite}>{t.studio.startColoring}</Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable
                      onPress={handleDownloadColoring}
                      style={({ pressed }) => [
                        styles.modalDownloadButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={[Colors.semantic.success, Colors.secondary.grassLight]}
                        style={styles.buttonGradient}
                      >
                        <Download size={20} color={Colors.neutral.white} />
                        <Text style={styles.buttonTextWhite}>{t.studio.download}</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              )}
              </ScrollView>
            </LinearGradient>
          </View>
        )}
      </Modal>

      {/* Coloring Canvas Modal */}
      <Modal
        visible={showColoringCanvas}
        animationType="slide"
        onRequestClose={() => setShowColoringCanvas(false)}
      >
        <View style={styles.canvasModalContainer}>
          <View style={[
            styles.canvasModalHeader,
            {
              paddingHorizontal: isSmallScreen ? spacing["4"] : spacing["6"],
              paddingVertical: isSmallScreen ? spacing["3"] : spacing["5"],
            },
          ]}>
            <Text style={[
              styles.canvasModalTitle,
              isSmallScreen && { fontSize: typography.size.xl },
            ]}>
              {t.studio.startColoringTitle}
            </Text>
            <Pressable
              onPress={() => setShowColoringCanvas(false)}
              style={styles.modalCloseButton}
            >
              <X size={isSmallScreen ? 20 : 24} color={Colors.neutral.darkest} />
            </Pressable>
          </View>

          {coloringPage && (
            <ColoringCanvas
              backgroundImage={coloringPage.imageUrl}
              onClose={() => setShowColoringCanvas(false)}
              onSave={(paths) => {
                console.log("Saved paths:", paths);
                Alert.alert(t.studio.great, t.studio.coloringSaved);
                setShowColoringCanvas(false);
              }}
            />
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal is now applied dynamically based on screen size
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: spacing["8"],
  },
  headerIconContainer: {
    marginBottom: spacing["4"],
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.xl,
  },
  headerTitle: {
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    letterSpacing: typography.letterSpacing.tight,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["6"],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing["4"],
    alignItems: "center",
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.cards.coloring.icon,
    marginBottom: spacing["1"],
  },
  statLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wider,
  },

  // Main Card
  mainCard: {
    ...cardVariants.hero,
    marginBottom: spacing["6"],
    borderWidth: 2,
    borderColor: Colors.cards.coloring.border,
  },
  featureBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    ...badgeStyles.default,
    backgroundColor: Colors.neutral.white,
    marginBottom: spacing["6"],
  },
  featureBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.cards.coloring.icon,
  },
  cardIconContainer: {
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  cardIcon: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    textAlign: "center",
    letterSpacing: typography.letterSpacing.tight,
  },
  cardDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    textAlign: "center",
    marginBottom: spacing["8"],
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },

  // Input Section
  inputSection: {
    gap: spacing["4"],
  },
  inputContainer: {
    marginBottom: 0,
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing["4"],
  },
  imageLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
  },
  selectImageButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.md,
  },
  createButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["6"],
  },
  buttonTextWhite: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Result Section
  resultSection: {
    marginTop: spacing["6"],
    gap: spacing["4"],
  },
  successBadge: {
    alignSelf: "center",
    backgroundColor: Colors.semantic.successBg,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: Colors.semantic.success,
  },
  successBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.semantic.success,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    backgroundColor: Colors.neutral.white,
    padding: spacing["4"],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  resultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: Colors.semantic.successBg,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
  },
  resultUrl: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    backgroundColor: Colors.primary.soft,
    padding: spacing["5"],
    borderRadius: radius.xl,
    marginBottom: spacing["6"],
    borderWidth: 1,
    borderColor: Colors.primary.blush,
  },
  infoIconContainer: {
    marginRight: spacing["3"],
  },
  infoIcon: {
    fontSize: 32,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
  },
  infoText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },

  // Features Grid
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["3"],
  },
  featureItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.neutral.white,
    padding: spacing["4"],
    borderRadius: radius.lg,
    alignItems: "center",
    ...shadows.sm,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: spacing["2"],
  },
  featureLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
    textAlign: "center",
  },

  // AI Card Styles
  aiCard: {
    ...cardVariants.hero,
    marginBottom: spacing["6"],
    borderWidth: 2,
    borderColor: Colors.secondary.lavenderLight,
  },
  aiCardHeader: {
    marginBottom: spacing["4"],
  },
  aiBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    ...badgeStyles.default,
    backgroundColor: Colors.neutral.white,
  },
  aiBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: Colors.secondary.lavender,
  },
  aiIconContainer: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  aiCardTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
    marginBottom: spacing["2"],
    textAlign: "center",
    letterSpacing: typography.letterSpacing.tight,
  },
  aiCardDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.white,
    textAlign: "center",
    marginBottom: spacing["6"],
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    opacity: 0.95,
  },
  aiButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  aiButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.secondary.lavender,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    // padding is now applied dynamically based on screen size
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["6"],
  },
  modalTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScroll: {
    flex: 1,
  },
  modalInstructions: {
    backgroundColor: Colors.primary.soft,
    padding: spacing["5"],
    borderRadius: radius.xl,
    marginBottom: spacing["6"],
    borderWidth: 1,
    borderColor: Colors.primary.blush,
  },
  instructionsTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
  },
  instructionsText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  modalImagePreview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing["4"],
    ...shadows.md,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalImageLabel: {
    position: "absolute",
    bottom: spacing["3"],
    left: spacing["3"],
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["2"],
    borderRadius: radius.lg,
  },
  modalPickButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing["4"],
    ...shadows.md,
  },
  modalGenerateButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing["6"],
    ...shadows.lg,
  },
  modalResult: {
    backgroundColor: Colors.neutral.white,
    padding: spacing["6"],
    borderRadius: radius.xl,
    ...shadows.xl,
  },
  modalResultBadge: {
    alignSelf: "center",
    backgroundColor: Colors.secondary.lavenderLight,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    marginBottom: spacing["4"],
  },
  modalResultBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.secondary.lavender,
  },
  modalResultImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.xl,
    marginBottom: spacing["4"],
  },
  modalResultDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    marginBottom: spacing["6"],
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
    textAlign: "center",
  },
  modalResultButtons: {
    gap: spacing["3"],
  },
  modalColorButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  modalDownloadButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.md,
  },

  // Canvas Modal Styles
  canvasModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  canvasModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // padding is now applied dynamically based on screen size
    backgroundColor: Colors.neutral.white,
    ...shadows.md,
  },
  canvasModalTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
  },
});
