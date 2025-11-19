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
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, ImageIcon, X, Sparkles, Zap, BookText, FlaskConical } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { generateText } from "@rork-ai/toolkit-sdk";
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
  const [retrying, setRetrying] = useState(false);
  
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
  }, [analysis]);

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
      setRetrying(false);
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

        {/* Existing code ... */}
        {/* Camera/Image picker UI */}
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
            <Text style={styles.resultsTitle}>{analysis.title}</Text>
            <Text style={styles.resultsDescription}>{analysis.description}</Text>
            {/* Diğer analiz sonuçları ... */}
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
});