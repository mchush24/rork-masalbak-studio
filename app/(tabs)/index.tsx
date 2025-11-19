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
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, ImageIcon, X, Sparkles, Zap, Lightbulb } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { analyzeDrawingRemote } from "@/services/aiClient";

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
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  
  // ✅ YENİ: Error handling state'leri
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);

  
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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [analysis, fadeAnim, scaleAnim]);

  // ✅ YENİ: İyileştirilmiş handleAnalysis
  const handleAnalysis = async () => {
    try {
      setError(null); // Önceki hataları temizle
      setAnalyzing(true);
      
      if (!selectedImage) {
        throw new Error("Lütfen bir görüntü seçin");
      }

      // Payload oluştur
      const payload = {
        app_version: "1.0.0",
        schema_version: "1.0.0",
        child: { age: 7 },
        task_type: "DAP" as const,
        image_uri: selectedImage,
      };

      console.log("[Analysis] Starting analysis...");
      const result = await analyzeDrawingRemote(payload);
      
      setAnalysis(result as unknown as Analysis);
      setRetries(0); // Reset retry counter
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata oluştu";
      setError(message);
      console.error("[Analysis Error]", err);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // ✅ YENİ: Otomatik retry mantığı
      if (retries < 3) {
        const delay = 2000 * (retries + 1); // 2s, 4s, 6s
        console.log(`[Analysis] Retrying in ${delay}ms (${retries + 1}/3)...`);
        
        setTimeout(() => {
          setRetries(retries + 1);
          handleAnalysis();
        }, delay);
      } else {
        console.error("[Analysis] Max retries exceeded");
        Alert.alert(
          "❌ Analiz Başarısız",
          "3 kez deneme yapıldı ancak başarısız oldu. Lütfen daha sonra tekrar deneyin.",
          [
            { text: "Anladım", style: "default" },
            { text: "Ana Sayfaya Dön", onPress: () => router.push("/") },
          ]
        );
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // ... existing code ...

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ✅ YENİ: Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <View style={styles.errorContent}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.errorTitle}>Hata Oluştu</Text>
                <Text style={styles.errorText}>{error}</Text>
                {retries > 0 && (
                  <Text style={styles.errorRetryInfo}>
                    Deneme: {retries}/3
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => setError(null)}
                style={styles.errorCloseButton}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* ✅ YENİ: Retry Button */}
            {retries >= 3 && (
              <Pressable
                onPress={() => {
                  setRetries(0);
                  setError(null);
                  handleAnalysis();
                }}
                style={styles.errorRetryButton}
              >
                <Text style={styles.errorRetryButtonText}>
                  🔄 Tekrar Dene
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Çizim Analizi</Text>
          <Text style={styles.headerSubtitle}>
            Çocuğunuzun çizimini analiz edin ve içgörüler elde edin
          </Text>
        </View>

        {/* Görsel Seçme Butonları */}
        {!selectedImage && !showCamera && (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status === 'granted') {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                  });
                  if (!result.canceled && result.assets[0]) {
                    setSelectedImage(result.assets[0].uri);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                  }
                }
              }}
              style={styles.primaryButton}
            >
              <ImageIcon size={24} color={Colors.neutral.white} />
              <Text style={styles.primaryButtonText}>Galeriden Seç</Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                if (!cameraPermission) return;
                if (!cameraPermission.granted) {
                  const { granted } = await requestCameraPermission();
                  if (!granted) {
                    Alert.alert('Kamera İzni', 'Kamera kullanmak için izin gerekli');
                    return;
                  }
                }
                setShowCamera(true);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              style={styles.secondaryButton}
            >
              <Camera size={24} color={Colors.primary.coral} />
              <Text style={styles.secondaryButtonText}>Fotoğraf Çek</Text>
            </Pressable>
          </View>
        )}

        {/* Kamera Görünümü */}
        {showCamera && (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              ref={(ref) => {
                if (ref) {
                  (ref as any).takePictureAsync = async () => {
                    try {
                      const photo = await (ref as any).takePictureAsync();
                      setSelectedImage(photo.uri);
                      setShowCamera(false);
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    } catch (err) {
                      console.error('Camera error:', err);
                    }
                  };
                }
              }}
            />
            <View style={styles.cameraControls}>
              <Pressable
                onPress={() => {
                  setShowCamera(false);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={styles.cameraCloseButton}
              >
                <X size={24} color={Colors.neutral.white} />
              </Pressable>
              <Pressable
                onPress={() => {
                  // Trigger camera capture
                  const cameraRef = (CameraView as any)._ref;
                  if (cameraRef?.takePictureAsync) {
                    cameraRef.takePictureAsync();
                  }
                }}
                style={styles.cameraCaptureButton}
              >
                <View style={styles.cameraCaptureInner} />
              </Pressable>
              <View style={{ width: 40 }} />
            </View>
          </View>
        )}

        {/* Seçilen Görsel */}
        {selectedImage && !showCamera && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} contentFit="cover" />
            <Pressable
              onPress={() => {
                setSelectedImage(null);
                setAnalysis(null);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.removeImageButton}
            >
              <X size={20} color={Colors.neutral.white} />
            </Pressable>
          </View>
        )}

        {/* Analiz Et Butonu */}
        {selectedImage && !analyzing && !analysis && (
          <Pressable
            onPress={handleAnalysis}
            style={[
              styles.analyzeButton,
              analyzing && styles.analyzeButtonDisabled,
            ]}
            disabled={analyzing}
          >
            <Sparkles size={20} color={Colors.neutral.white} />
            <Text style={styles.analyzeButtonText}>Analiz Et</Text>
          </Pressable>
        )}

        {analyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.coral} />
            <Text style={styles.loadingText}>Çizim analiz ediliyor...</Text>
          </View>
        )}

        {analysis && (
          <Animated.View
            style={[
              styles.resultsContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.resultsTitle}>Analiz Sonuçları</Text>
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Başlık</Text>
              <Text style={styles.resultValue}>{analysis.title}</Text>
            </View>
            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Açıklama</Text>
              <Text style={styles.resultValue}>{analysis.description}</Text>
            </View>
            {analysis.emotions && analysis.emotions.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Duygular</Text>
                <View style={styles.tagContainer}>
                  {analysis.emotions.map((emotion, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{emotion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {analysis.themes && analysis.themes.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Temalar</Text>
                <View style={styles.tagContainer}>
                  {analysis.themes.map((theme, idx) => (
                    <View key={idx} style={[styles.tag, styles.themeTag]}>
                      <Text style={[styles.tagText, styles.themeTagText]}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {analysis.insights && (
              <View style={styles.resultSection}>
                <View style={styles.insightHeader}>
                  <Lightbulb size={20} color={Colors.secondary.sunshine} />
                  <Text style={styles.resultLabel}>İçgörüler</Text>
                </View>
                <Text style={styles.resultValue}>{analysis.insights}</Text>
              </View>
            )}
            {analysis.encouragement && (
              <View style={[styles.resultSection, styles.encouragementSection]}>
                <View style={styles.insightHeader}>
                  <Sparkles size={20} color={Colors.primary.coral} />
                  <Text style={[styles.resultLabel, { color: Colors.primary.coral }]}>Teşvik</Text>
                </View>
                <Text style={[styles.resultValue, styles.encouragementText]}>
                  {analysis.encouragement}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => {
                setSelectedImage(null);
                setAnalysis(null);
                setError(null);
                setRetries(0);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              style={styles.newAnalysisButton}
            >
              <Zap size={20} color={Colors.neutral.white} />
              <Text style={styles.newAnalysisButtonText}>Yeni Analiz</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ✅ YENİ: Stilleri ekle
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  scrollContent: {
    padding: 16,
  },
  
  // ✅ Error Banner Stilleri
  errorBanner: {
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.coral,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.coral,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  errorRetryInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  errorCloseButton: {
    padding: 8,
  },
  errorRetryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary.coral,
    borderRadius: 8,
    alignItems: "center",
  },
  errorRetryButtonText: {
    color: Colors.neutral.white,
    fontWeight: "600",
    fontSize: 14,
  },

  // Existing styles ...
  analyzeButton: {
    backgroundColor: Colors.primary.coral,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginVertical: 16,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.neutral.dark,
    fontSize: 14,
  },
  resultsContainer: {
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.neutral.darkest,
    marginBottom: 8,
  },
  resultsDescription: {
    fontSize: 14,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  
  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.neutral.darkest,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.neutral.dark,
    lineHeight: 22,
  },
  
  // Action Buttons
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary.coral,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.neutral.white,
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Colors.neutral.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary.coral,
  },
  secondaryButtonText: {
    color: Colors.primary.coral,
    fontSize: 17,
    fontWeight: "700",
  },
  
  // Camera
  cameraContainer: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cameraCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraCaptureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraCaptureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.coral,
  },
  
  // Image Preview
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.coral,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Results
  resultSection: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.neutral.dark,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 16,
    color: Colors.neutral.darkest,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.secondary.sky + "30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: Colors.secondary.sky,
    fontSize: 14,
    fontWeight: "600",
  },
  themeTag: {
    backgroundColor: Colors.secondary.sunshine + "30",
  },
  themeTagText: {
    color: "#D97706",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  encouragementSection: {
    backgroundColor: Colors.primary.coral + "10",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.coral,
  },
  encouragementText: {
    fontWeight: "500",
  },
  newAnalysisButton: {
    backgroundColor: Colors.secondary.sky,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  newAnalysisButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "700",
  },
});