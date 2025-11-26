import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  Share,
  Image,
  Pressable,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Palette, ImagePlus, Sparkles, Download, X, Wand2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { layout, typography, spacing, radius, shadows, cardVariants, badgeStyles } from "@/constants/design-system";
import { trpc } from "@/lib/trpc";
import { Platform } from "react-native";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useGenerateColoringPage } from "@/lib/hooks/useGenerateColoringPage";
import * as Linking from "expo-linking";
import { ColoringCanvas } from "@/components/ColoringCanvas";

export default function StudioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loadingPDF, setLoadingPDF] = useState(false);
  const [coloringTitle, setColoringTitle] = useState("Benim Boyama Sayfam");
  const [coloringImage, setColoringImage] = useState<string | null>(null);
  const [coloringResult, setColoringResult] = useState<string | null>(null);

  // AI Boyama Sayfası States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDrawingImage, setAIDrawingImage] = useState<string | null>(null);
  const [showColoringCanvas, setShowColoringCanvas] = useState(false);
  const { generate, isGenerating, coloringPage, reset } = useGenerateColoringPage();

  const generateColoringMutation = trpc.studio.generateColoringPDF.useMutation();

  async function pickColoringImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.length) {
      setColoringImage(res.assets[0].uri);
    }
  }

  async function handleColoringPDF() {
    if (!coloringImage) {
      Alert.alert("Lütfen önce bir çizim seç.");
      return;
    }
    try {
      setLoadingPDF(true);

      let imageBase64: string;
      if (Platform.OS === "web") {
        if (coloringImage.startsWith("data:")) {
          imageBase64 = coloringImage.split(",")[1];
        } else {
          const response = await fetch(coloringImage);
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
        let uri = coloringImage;
        if (!uri.startsWith("file://") && !uri.startsWith("content://")) {
          uri = `file://${uri}`;
        }
        imageBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
      }

      const result = await generateColoringMutation.mutateAsync({
        title: coloringTitle,
        pages: [imageBase64],
        size: "A4",
        user_id: user?.userId || null,
      });

      setColoringResult(result.pdf_url);
      Alert.alert("🎉 Boyama PDF Hazır!", "PDF başarıyla oluşturuldu. Şimdi paylaşabilir veya indirebilirsiniz.");
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu";
      Alert.alert("Hata", errorMessage, [
        { text: "Vazgeç", style: "cancel" },
        { text: "Tekrar Dene", onPress: handleColoringPDF },
      ]);
    } finally {
      setLoadingPDF(false);
    }
  }

  async function shareLink(url: string) {
    try {
      await Share.share({ message: `MasalBak Boyama PDF: ${url}` });
    } catch {
      console.log("Share failed");
    }
  }

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
      Alert.alert("Lütfen önce bir çizim seç.");
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

      Alert.alert("✨ Başarılı!", "Boyama sayfası oluşturuldu! Şimdi indirebilir veya uygulamada boyayabilirsiniz.");
    } catch (err) {
      console.error("AI Coloring error:", err);
      Alert.alert("Hata", "Boyama sayfası oluşturulamadı. Lütfen tekrar deneyin.");
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
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[Colors.secondary.mint, Colors.cards.coloring.icon]}
              style={styles.headerIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Palette size={32} color={Colors.neutral.white} />
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>Boyama Stüdyosu</Text>
          <Text style={styles.headerSubtitle}>
            Çizimlerden sihirli boyama sayfaları ✨
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>Sınırsız</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>A4</Text>
            <Text style={styles.statLabel}>PDF</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>HD</Text>
            <Text style={styles.statLabel}>Kalite</Text>
          </View>
        </View>

        {/* Main Feature Card */}
        <LinearGradient
          colors={Colors.cards.coloring.bg}
          style={styles.mainCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Feature Badge */}
          <View style={styles.featureBadge}>
            <Sparkles size={14} color={Colors.cards.coloring.icon} />
            <Text style={styles.featureBadgeText}>Yapay Zeka Destekli</Text>
          </View>

          {/* Icon & Title */}
          <View style={styles.cardIconContainer}>
            <View style={styles.cardIcon}>
              <Palette size={48} color={Colors.cards.coloring.icon} />
            </View>
          </View>

          <Text style={styles.cardTitle}>Boyama Sayfası Oluştur</Text>
          <Text style={styles.cardDescription}>
            Çocuğunuzun çizimini profesyonel boyama sayfasına dönüştürün
          </Text>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Input
              placeholder="Başlık (ör: Benim Boyama Sayfam)"
              value={coloringTitle}
              onChangeText={setColoringTitle}
              size="md"
              fullWidth
              containerStyle={styles.inputContainer}
            />

            {coloringImage && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: coloringImage }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.6)"]}
                  style={styles.imageOverlay}
                >
                  <Text style={styles.imageLabel}>Seçilen Görsel</Text>
                </LinearGradient>
              </View>
            )}

            <Pressable
              onPress={pickColoringImage}
              style={({ pressed }) => [
                styles.selectImageButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={[Colors.neutral.medium, Colors.neutral.dark]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ImagePlus size={20} color={Colors.neutral.white} />
                <Text style={styles.buttonTextWhite}>
                  {coloringImage ? "Farklı Görsel Seç" : "Görsel Seç"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleColoringPDF}
              disabled={!coloringImage || loadingPDF}
              style={({ pressed }) => [
                styles.createButton,
                (!coloringImage || loadingPDF) && styles.buttonDisabled,
                pressed && !loadingPDF && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={
                  !coloringImage || loadingPDF
                    ? [Colors.neutral.light, Colors.neutral.medium]
                    : [Colors.cards.coloring.icon, Colors.secondary.grass]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Sparkles size={20} color={Colors.neutral.white} />
                <Text style={styles.buttonTextWhite}>
                  {loadingPDF ? "Oluşturuluyor..." : "Boyama PDF Oluştur"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Result Section */}
          {coloringResult && (
            <View style={styles.resultSection}>
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeText}>✓ Başarıyla Oluşturuldu</Text>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultIconContainer}>
                  <Download size={24} color={Colors.cards.coloring.icon} />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>PDF Hazır</Text>
                  <Text style={styles.resultUrl} numberOfLines={1}>
                    {coloringResult}
                  </Text>
                </View>
              </View>

              <Button
                variant="success"
                size="lg"
                onPress={() => shareLink(coloringResult)}
                fullWidth
                icon={<Share size={20} color={Colors.neutral.white} />}
              >
                Paylaş
              </Button>
            </View>
          )}
        </LinearGradient>

        {/* AI Coloring Card - NEW */}
        <LinearGradient
          colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
          style={styles.aiCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiCardHeader}>
            <View style={styles.aiBadge}>
              <Wand2 size={16} color={Colors.secondary.lavender} />
              <Text style={styles.aiBadgeText}>YENİ ÖZELLIK</Text>
            </View>
          </View>

          <View style={styles.aiIconContainer}>
            <Wand2 size={48} color={Colors.neutral.white} />
          </View>

          <Text style={styles.aiCardTitle}>İnteraktif Boyama Faaliyeti Oluştur</Text>
          <Text style={styles.aiCardDescription}>
            Çocuğunuzun çiziminden esinlenilerek, yapay zeka ile interaktif bir boyama faaliyeti oluşturun!
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
              <Text style={styles.aiButtonText}>Hemen Dene</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>💡</Text>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
            <Text style={styles.infoText}>
              Çizimi seçin, yapay zeka otomatik olarak arka planı temizler ve profesyonel boyama sayfası oluşturur.
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎨</Text>
            <Text style={styles.featureLabel}>Çizgiyi Korur</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>✨</Text>
            <Text style={styles.featureLabel}>HD Kalite</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📄</Text>
            <Text style={styles.featureLabel}>A4 Format</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>⚡</Text>
            <Text style={styles.featureLabel}>Hızlı İşlem</Text>
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
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={Colors.background.studio}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İnteraktif Boyama Faaliyeti</Text>
              <Pressable onPress={handleCloseAIModal} style={styles.modalCloseButton}>
                <X size={24} color={Colors.neutral.darkest} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Instructions */}
              <View style={styles.modalInstructions}>
                <Text style={styles.instructionsTitle}>Nasıl çalışır?</Text>
                <Text style={styles.instructionsText}>
                  1. Çocuğunuzun çizimini seçin{"\n"}
                  2. AI, çizimi analiz edip yeni bir boyama sayfası oluşturur{"\n"}
                  3. İndirebilir veya uygulamada boyayabilirsiniz!
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
                  <Text style={styles.modalImageLabel}>Seçilen Çizim</Text>
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
                    {aiDrawingImage ? "Farklı Çizim Seç" : "Çizim Seç"}
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
                    {isGenerating ? "Oluşturuluyor..." : "Boyama Sayfası Oluştur"}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Result */}
              {coloringPage && (
                <View style={styles.modalResult}>
                  <View style={styles.modalResultBadge}>
                    <Text style={styles.modalResultBadgeText}>✨ Hazır!</Text>
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
                        <Text style={styles.buttonTextWhite}>Boyamaya Başla</Text>
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
                        <Text style={styles.buttonTextWhite}>İndir</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      {/* Coloring Canvas Modal */}
      <Modal
        visible={showColoringCanvas}
        animationType="slide"
        onRequestClose={() => setShowColoringCanvas(false)}
      >
        <View style={styles.canvasModalContainer}>
          <View style={styles.canvasModalHeader}>
            <Text style={styles.canvasModalTitle}>Boyamaya Başla! 🎨</Text>
            <Pressable
              onPress={() => setShowColoringCanvas(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={Colors.neutral.darkest} />
            </Pressable>
          </View>

          {coloringPage && (
            <ColoringCanvas
              backgroundImage={coloringPage.imageUrl}
              onSave={(paths) => {
                console.log("Saved paths:", paths);
                Alert.alert("✨ Harika!", "Boyanmış sayfanız kaydedildi!");
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
    paddingHorizontal: layout.screenPadding,
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
    padding: spacing["6"],
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
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["5"],
    backgroundColor: Colors.neutral.white,
    ...shadows.md,
  },
  canvasModalTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
  },
});
