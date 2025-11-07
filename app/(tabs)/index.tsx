import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Colors } from "@/constants/colors";
import { useState, useRef, useEffect } from "react";
import Constants from "expo-constants";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, ImageIcon, X, Sparkles, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import OpenAI from "openai";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Analysis = {
  title: string;
  description: string;
  emotions: string[];
  themes: string[];
  insights: string;
  encouragement: string;
};

export default function AnalyzeScreen() {
  const insets = useSafeAreaInsets();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (analysis) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [analysis]);

  async function pickImage() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysis(null);
      analyzeImage(result.assets[0].base64!);
    }
  }

  async function openCamera() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          "İzin Gerekli",
          "Kamera kullanmak için izin vermeniz gerekiyor."
        );
        return;
      }
    }
    setShowCamera(true);
  }

  async function takePicture(camera: any) {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (camera) {
      const photo = await camera.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      setSelectedImage(photo.uri);
      setShowCamera(false);
      setAnalysis(null);
      analyzeImage(photo.base64!);
    }
  }

  async function analyzeImage(base64: string) {
    setAnalyzing(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);

    try {
      const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;
      
      if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY_HERE") {
        Alert.alert(
          "API Key Gerekli",
          "Lütfen app.json dosyasında extra.OPENAI_API_KEY değerini ayarlayın.\n\napp.json dosyasına şunu ekleyin:\n\n\"extra\": {\n  \"OPENAI_API_KEY\": \"sk-your-key-here\"\n}"
        );
        setAnalyzing(false);
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `Bu çocuk çizimini analiz et. Çocuğun ne anlatmaya çalıştığını, duygusal durumunu ve yaratıcılığını değerlendir. 

Cevabını şu JSON formatında ver:
{
  "title": "Çizimin kısa başlığı",
  "description": "Çizimde ne görüyoruz, detaylı açıklama",
  "emotions": ["tespit edilen duygular listesi"],
  "themes": ["ana temalar"],
  "insights": "Çocuğun gelişimi ve yaratıcılığı hakkında öğretici gözlemler",
  "encouragement": "Ebeveyn/öğretmen için teşvik edici mesaj"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAnalysis(parsed);
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      Alert.alert("Hata", "Analiz sırasında bir hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  }

  function resetAnalysis() {
    setSelectedImage(null);
    setAnalysis(null);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={(ref) => {
            if (ref) {
              (ref as any).camera = ref;
            }
          }}
        >
          <View style={[styles.cameraControls, { paddingTop: insets.top + 20 }]}>
            <Pressable
              onPress={() => setShowCamera(false)}
              style={styles.closeButton}
            >
              <X size={28} color="#FFFFFF" />
            </Pressable>
          </View>
          <View
            style={[styles.cameraBottom, { paddingBottom: insets.bottom + 20 }]}
          >
            <Pressable
              onPress={(e) => {
                const target = e.currentTarget as any;
                if (target?._internalFiberInstanceHandleDEV?.return?.stateNode) {
                  takePicture(
                    target._internalFiberInstanceHandleDEV.return.stateNode
                  );
                }
              }}
              style={styles.captureButton}
            >
              <View style={styles.captureButtonInner} />
            </Pressable>
          </View>
        </CameraView>
      </View>
    );
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
            <Sparkles size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.headerTitle}>MasalBak</Text>
          <Text style={styles.headerSubtitle}>
            Çocuğunuzun çizimi konuşsun
          </Text>
        </View>

        {!selectedImage ? (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={openCamera}
              style={({ pressed }) => [
                styles.actionButton,
                styles.cameraButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Camera size={32} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Fotoğraf Çek</Text>
            </Pressable>

            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                styles.actionButton,
                styles.galleryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <ImageIcon size={32} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Galeriden Seç</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <Pressable onPress={resetAnalysis} style={styles.removeButton}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {analyzing && (
              <View style={styles.analyzingContainer}>
                <View style={styles.analyzingContent}>
                  <ActivityIndicator size="large" color="#FF6B6B" />
                  <Text style={styles.analyzingText}>Analiz ediliyor...</Text>
                  <View style={styles.pulseContainer}>
                    <Zap size={20} color="#FFB84D" />
                  </View>
                </View>
              </View>
            )}

            {analysis && !analyzing && (
              <Animated.View
                style={[
                  styles.resultContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{analysis.title}</Text>
                </View>

                <View style={styles.resultSection}>
                  <Text style={styles.sectionLabel}>📝 Açıklama</Text>
                  <Text style={styles.sectionText}>{analysis.description}</Text>
                </View>

                {analysis.emotions.length > 0 && (
                  <View style={styles.resultSection}>
                    <Text style={styles.sectionLabel}>💭 Duygular</Text>
                    <View style={styles.tagContainer}>
                      {analysis.emotions.map((emotion, idx) => (
                        <View key={idx} style={styles.tag}>
                          <Text style={styles.tagText}>{emotion}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {analysis.themes.length > 0 && (
                  <View style={styles.resultSection}>
                    <Text style={styles.sectionLabel}>🎨 Temalar</Text>
                    <View style={styles.tagContainer}>
                      {analysis.themes.map((theme, idx) => (
                        <View key={idx} style={[styles.tag, styles.tagTheme]}>
                          <Text style={styles.tagText}>{theme}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.resultSection}>
                  <Text style={styles.sectionLabel}>🔍 Gözlemler</Text>
                  <Text style={styles.sectionText}>{analysis.insights}</Text>
                </View>

                <View style={[styles.resultSection, styles.encouragementSection]}>
                  <Text style={styles.sectionLabel}>✨ Teşvik</Text>
                  <Text style={styles.encouragementText}>
                    {analysis.encouragement}
                  </Text>
                </View>

                <Pressable
                  onPress={resetAnalysis}
                  style={styles.newAnalysisButton}
                >
                  <Text style={styles.newAnalysisText}>Yeni Analiz</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🎨 Çocuğunuzun çizimini analiz edin ve yaratıcılığını keşfedin!
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
    backgroundColor: Colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.primary.coral,
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
  actionButtons: {
    gap: 14,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 22,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cameraButton: {
    backgroundColor: Colors.primary.coral,
  },
  galleryButton: {
    backgroundColor: Colors.secondary.mint,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  imageSection: {
    gap: 20,
    marginBottom: 32,
  },
  imageWrapper: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  removeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  analyzingContent: {
    alignItems: "center",
    gap: 18,
  },
  analyzingText: {
    fontSize: 19,
    fontWeight: "600" as const,
    color: Colors.neutral.darkest,
    letterSpacing: 0.2,
  },
  pulseContainer: {
    marginTop: 8,
  },
  resultContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 24,
    gap: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  resultHeader: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary.coral,
    paddingBottom: 14,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    letterSpacing: -0.3,
  },
  resultSection: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.neutral.medium,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.neutral.dark,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: Colors.primary.soft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  tagTheme: {
    backgroundColor: "#E6F7FF",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.neutral.dark,
  },
  encouragementSection: {
    backgroundColor: "#FFF9F0",
    padding: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.secondary.sunshine,
  },
  encouragementText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#8B5A00",
    fontWeight: "500" as const,
  },
  newAnalysisButton: {
    backgroundColor: Colors.primary.coral,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  newAnalysisText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1E40AF",
    textAlign: "center",
    fontWeight: "500" as const,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary.coral,
  },
});
