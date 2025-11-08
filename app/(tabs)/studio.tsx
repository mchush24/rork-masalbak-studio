import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Wand2, BookText, Palette } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { createStorybook, generateColoringPDF } from "@/services/studio";

export default function StudioScreen() {
  const insets = useSafeAreaInsets();

  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const [storyTitle, setStoryTitle] = useState("Küçük Kuşun Masalı");
  const [storyResult, setStoryResult] = useState<{
    pages: { text: string; img_url: string }[];
    pdf_url?: string;
    voice_urls?: string[];
    record?: any;
  } | null>(null);

  const [coloringTitle, setColoringTitle] = useState("Benim Boyama Sayfam");
  const [coloringImage, setColoringImage] = useState<string | null>(null);
  const [coloringResult, setColoringResult] = useState<string | null>(null);

  async function handleStorybook() {
    try {
      setLoadingStory(true);
      const pages = [
        {
          text: "Küçük bir kuş sabah güneşiyle uyanır.",
          prompt: "soft pastel, çocuk kitabı illüstrasyonu",
        },
        { text: "Arkadaşlarını bulmak için yola çıkar." },
        { text: "Bir ağacın dallarında mola verir." },
        { text: "Rüzgârla birlikte şarkı söyler." },
        { text: "Akşam güneşinde yuvasına döner." },
      ];
      const res = await createStorybook(pages, { makePdf: true, makeTts: true });
      setStoryResult(res);
      Alert.alert("Masal hazır!", "PDF ve ses dosyaları üretildi.");
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu";
      Alert.alert("Hata", errorMessage, [
        { text: "Vazgeç", style: "cancel" },
        { text: "Tekrar Dene", onPress: handleStorybook },
      ]);
    } finally {
      setLoadingStory(false);
    }
  }

  async function pickImage() {
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
      const result = await generateColoringPDF(coloringImage, coloringTitle);
      setColoringResult(result.pdf_url);
      Alert.alert("Boyama PDF hazır!", "PDF başarıyla oluşturuldu.");
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
      await Share.share({ message: `MasalBak: ${url}` });
    } catch {
      console.log("Share failed");
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Wand2 size={32} color="#9333EA" />
          </View>
          <Text style={styles.headerTitle}>Stüdyo</Text>
          <Text style={styles.headerSubtitle}>
            Çizimden yaratıcı içerikler oluştur
          </Text>
        </View>

        <View style={styles.features}>
          {/* Masal Kitabı */}
          <View style={[styles.featureCard, styles.featureStory]}>
            <View style={styles.featureIcon}>
              <BookText size={40} color="#FF6B6B" />
            </View>
            <Text style={styles.featureTitle}>Masal Kitabı</Text>
            <Text style={styles.featureDescription}>
              Çizimden özel masal kitabı oluştur
            </Text>

            <TextInput
              placeholder="Masal başlığı"
              value={storyTitle}
              onChangeText={setStoryTitle}
              style={styles.input}
            />

            <Pressable
              onPress={handleStorybook}
              disabled={loadingStory}
              style={[
                styles.actionButton,
                styles.storyButton,
                loadingStory && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {loadingStory ? "Oluşturuluyor..." : "Masal Kitabı Oluştur"}
              </Text>
            </Pressable>

            {storyResult?.pdf_url && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>📘 PDF:</Text>
                <Text selectable style={styles.resultLink}>
                  {storyResult.pdf_url}
                </Text>
                <Pressable
                  onPress={() => shareLink(storyResult.pdf_url!)}
                  style={[styles.actionButton, styles.shareButton]}
                >
                  <Text style={styles.buttonText}>Paylaş</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Boyama PDF */}
          <View style={[styles.featureCard, styles.featureColoring]}>
            <View style={styles.featureIcon}>
              <Palette size={40} color="#4ECDC4" />
            </View>
            <Text style={styles.featureTitle}>Boyama PDF</Text>
            <Text style={styles.featureDescription}>
              Çizimden boyama sayfası oluştur
            </Text>

            <TextInput
              placeholder="Başlık"
              value={coloringTitle}
              onChangeText={setColoringTitle}
              style={styles.input}
            />

            <Pressable
              onPress={pickImage}
              style={[styles.actionButton, styles.pickButton]}
            >
              <Text style={styles.buttonText}>
                {coloringImage ? "🎨 Farklı Görsel Seç" : "📷 Görsel Seç"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleColoringPDF}
              disabled={!coloringImage || loadingPDF}
              style={[
                styles.actionButton,
                styles.coloringButton,
                (!coloringImage || loadingPDF) && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {loadingPDF ? "Oluşturuluyor..." : "Boyama PDF Oluştur"}
              </Text>
            </Pressable>

            {(loadingStory || loadingPDF) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1C8DF2" />
                <Text style={styles.loadingText}>Lütfen bekleyin...</Text>
              </View>
            )}

            {coloringResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>🖼️ PDF Link:</Text>
                <Text selectable style={styles.resultLink}>
                  {coloringResult}
                </Text>
                <Pressable
                  onPress={() => shareLink(coloringResult)}
                  style={[styles.actionButton, styles.shareButton]}
                >
                  <Text style={styles.buttonText}>Paylaş</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            ✨ Çizimlerinizden benzersiz içerikler oluşturun
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.secondary.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 17,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    gap: 18,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  featureStory: {
    borderTopWidth: 5,
    borderTopColor: Colors.primary.coral,
  },
  featureColoring: {
    borderTopWidth: 5,
    borderTopColor: Colors.secondary.mint,
  },
  featureIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.neutral.medium,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  comingSoonBadge: {
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.secondary.sunshine,
  },
  comingSoonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#8B5A00",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#F3E8FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B21A8",
    textAlign: "center",
    fontWeight: "500" as const,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: Colors.neutral.white,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  storyButton: {
    backgroundColor: "#FF6B6B",
  },
  pickButton: {
    backgroundColor: "#eab308",
  },
  coloringButton: {
    backgroundColor: "#4ECDC4",
  },
  shareButton: {
    backgroundColor: "#22C55E",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontWeight: "700" as const,
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 6,
    color: Colors.neutral.darkest,
  },
  resultLink: {
    fontSize: 13,
    color: "#2563eb",
    marginBottom: 8,
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.neutral.medium,
  },
});
