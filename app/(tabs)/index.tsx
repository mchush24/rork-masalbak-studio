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
  Linking,
} from "react-native";
import { Colors } from "@/constants/colors";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from "@/constants/design-system";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, ImageIcon, X, Sparkles, Zap, Lightbulb, Brain, TrendingUp, Award, CheckCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useFirstTimeUser } from "@/lib/hooks/useFirstTimeUser";
import { FirstTimeWelcomeModal } from "@/components/FirstTimeWelcomeModal";
import { useAgeCollection } from "@/lib/hooks/useAgeCollection";
import { AgePickerModal } from "@/components/AgePickerModal";

// New schema types matching backend
type AnalysisMeta = {
  testType: string;
  age?: number;
  language: string;
  confidence: number;
  uncertaintyLevel: "low" | "mid" | "high";
  dataQualityNotes: string[];
};

type Insight = {
  title: string;
  summary: string;
  evidence: string[];
  strength: "weak" | "moderate" | "strong";
};

type HomeTip = {
  title: string;
  steps: string[];
  why: string;
};

type RiskFlag = {
  type: string;
  summary: string;
  action: string;
};

type Analysis = {
  meta: AnalysisMeta;
  insights: Insight[];
  homeTips: HomeTip[];
  riskFlags: RiskFlag[];
  trendNote: string;
  disclaimer: string;
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

  // ✅ YENİ: First time user welcome
  const { isFirstTime, isLoading: isCheckingFirstTime, markAsReturningUser } = useFirstTimeUser();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // ✅ YENİ: Age collection for first analysis
  const { ageCollected, isLoading: isCheckingAge, markAgeAsCollected } = useAgeCollection();
  const [showAgePickerModal, setShowAgePickerModal] = useState(false);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  // tRPC mutations
  const analyzeMutation = trpc.studio.analyzeDrawing.useMutation();
  const updateProfileMutation = trpc.user.updateProfile.useMutation();


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Show welcome modal for first-time users
  useEffect(() => {
    if (!isCheckingFirstTime && isFirstTime) {
      // Small delay for smooth appearance
      setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
    }
  }, [isFirstTime, isCheckingFirstTime]);

  const handleDismissWelcome = () => {
    setShowWelcomeModal(false);
    markAsReturningUser();
  };

  // Show age picker when image is selected for the first time
  useEffect(() => {
    if (selectedImage && !ageCollected && !isCheckingAge) {
      // Small delay for smooth transition
      setTimeout(() => {
        setShowAgePickerModal(true);
      }, 300);
    }
  }, [selectedImage, ageCollected, isCheckingAge]);

  const handleSelectAge = async (age: number) => {
    try {
      setSelectedAge(age);
      setShowAgePickerModal(false);

      // Update user profile with age
      await updateProfileMutation.mutateAsync({ child_age: age });

      // Mark age as collected
      await markAgeAsCollected();

      console.log('[Age] Updated user profile with age:', age);
    } catch (error) {
      console.error('[Age] Error updating age:', error);
      // Still mark as collected to not show modal again
      await markAgeAsCollected();
    }
  };

  const handleSkipAge = async () => {
    setShowAgePickerModal(false);
    // Mark as collected so we don't ask again
    await markAgeAsCollected();
  };

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

      // Use selectedAge if available, otherwise default to 7
      const childAge = selectedAge || 7;

      console.log("[Analysis] Starting analysis with age:", childAge);

      // Base64 encode the image
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const result = await analyzeMutation.mutateAsync({
        taskType: "DAP",
        childAge: childAge,
        imageBase64: base64.split(',')[1], // Remove data:image/...;base64, prefix
        language: 'tr',
        userRole: 'parent',
        featuresJson: {},
      });

      setAnalysis(result as Analysis);
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
    <View style={styles.container}>
      {/* First Time Welcome Modal */}
      <FirstTimeWelcomeModal
        visible={showWelcomeModal}
        onDismiss={handleDismissWelcome}
      />

      {/* Age Picker Modal - shown on first image selection */}
      <AgePickerModal
        visible={showAgePickerModal}
        onSelectAge={handleSelectAge}
        onSkip={handleSkipAge}
      />

      <LinearGradient
        colors={Colors.background.analysis as any}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
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

          {/* Header with gradient icon */}
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.cards.analysis.icon, Colors.secondary.sky]}
              style={styles.headerIcon}
            >
              <Brain size={layout.icon.medium} color={Colors.neutral.white} />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Çizim Analizi</Text>
              <Text style={styles.headerSubtitle}>
                Çocuk psikolojisi uzmanı desteğiyle
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <LinearGradient
              colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
              style={styles.statCard}
            >
              <TrendingUp size={24} color={Colors.neutral.white} />
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Doğruluk</Text>
            </LinearGradient>

            <LinearGradient
              colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
              style={styles.statCard}
            >
              <Award size={24} color={Colors.neutral.white} />
              <Text style={styles.statNumber}>AI</Text>
              <Text style={styles.statLabel}>Destekli</Text>
            </LinearGradient>

            <LinearGradient
              colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
              style={styles.statCard}
            >
              <CheckCircle size={24} color={Colors.neutral.white} />
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Analiz</Text>
            </LinearGradient>
          </View>

        {/* Görsel Seçme Butonları */}
        {!selectedImage && !showCamera && (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status === 'granted') {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
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
              style={({ pressed }) => [
                styles.primaryButtonWrapper,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                style={styles.primaryButton}
              >
                <ImageIcon size={24} color={Colors.neutral.white} />
                <Text style={styles.primaryButtonText}>Galeriden Seç</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={async () => {
                if (!cameraPermission) return;
                if (!cameraPermission.granted) {
                  const { granted } = await requestCameraPermission();
                  if (!granted) {
                    Alert.alert(
                      'Kamera İzni Gerekli',
                      'Kamera kullanmak için lütfen ayarlardan izin verin.',
                      [
                        { text: 'İptal', style: 'cancel' },
                        {
                          text: 'Ayarlar',
                          onPress: () => {
                            if (Platform.OS === 'ios') {
                              Linking.openURL('app-settings:');
                            } else {
                              Linking.openSettings();
                            }
                          }
                        }
                      ]
                    );
                    return;
                  }
                }
                setShowCamera(true);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              style={({ pressed }) => [
                styles.secondaryButtonWrapper,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.neutral.medium, Colors.neutral.dark]}
                style={styles.secondaryButton}
              >
                <Camera size={24} color={Colors.neutral.white} />
                <Text style={styles.secondaryButtonText}>Fotoğraf Çek</Text>
              </LinearGradient>
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
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} contentFit="contain" />
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
            <ActivityIndicator size="large" color={Colors.primary.sunset} />
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

            {/* Meta Info */}
            <View style={styles.metaSection}>
              <Text style={styles.metaText}>
                Güven: {(analysis.meta.confidence * 100).toFixed(0)}% •
                Belirsizlik: {analysis.meta.uncertaintyLevel === 'low' ? 'Düşük' : analysis.meta.uncertaintyLevel === 'mid' ? 'Orta' : 'Yüksek'}
              </Text>
            </View>

            {/* Risk Flags */}
            {analysis.riskFlags && analysis.riskFlags.length > 0 && (
              <View style={styles.riskSection}>
                <Text style={styles.riskTitle}>⚠️ Önemli Notlar</Text>
                {analysis.riskFlags.map((risk, idx) => (
                  <View key={idx} style={styles.riskItem}>
                    <Text style={styles.riskSummary}>{risk.summary}</Text>
                    <Text style={styles.riskAction}>Uzman görüşü önerilir</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Insights */}
            {analysis.insights && analysis.insights.length > 0 && (
              <View style={styles.resultSection}>
                <View style={styles.insightHeader}>
                  <Lightbulb size={20} color={Colors.secondary.sunshine} />
                  <Text style={styles.resultLabel}>İçgörüler</Text>
                </View>
                {analysis.insights.map((insight, idx) => (
                  <View key={idx} style={styles.insightItem}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.resultValue}>{insight.summary}</Text>
                    <View style={styles.strengthBadge}>
                      <Text style={styles.strengthText}>
                        {insight.strength === 'weak' ? 'Zayıf' : insight.strength === 'moderate' ? 'Orta' : 'Güçlü'} bulgu
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Home Tips */}
            {analysis.homeTips && analysis.homeTips.length > 0 && (
              <View style={[styles.resultSection, styles.tipsSection]}>
                <View style={styles.insightHeader}>
                  <Sparkles size={20} color={Colors.primary.sunset} />
                  <Text style={[styles.resultLabel, { color: Colors.primary.sunset }]}>Evde Yapabilecekleriniz</Text>
                </View>
                {analysis.homeTips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    {tip.steps.map((step, sIdx) => (
                      <Text key={sIdx} style={styles.tipStep}>• {step}</Text>
                    ))}
                    <Text style={styles.tipWhy}>💡 {tip.why}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerSection}>
              <Text style={styles.disclaimerText}>{analysis.disclaimer}</Text>
            </View>

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
      </LinearGradient>
    </View>
  );
}

// ✅ YENİ: Stilleri ekle
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing["6"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["8"],
    gap: spacing["4"],
  },
  headerIcon: {
    width: layout.icon.mega,
    height: layout.icon.mega,
    borderRadius: radius.xl,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
    letterSpacing: typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["8"],
  },
  statCard: {
    flex: 1,
    padding: spacing["4"],
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing["2"],
    ...shadows.md,
  },
  statNumber: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  statLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  
  // ✅ Error Banner Stilleri
  errorBanner: {
    backgroundColor: Colors.semantic.errorLight,
    borderRadius: radius.xl,
    padding: spacing["3"],
    marginBottom: spacing["6"],
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.error,
    ...shadows.md,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing["3"],
  },
  errorIcon: {
    fontSize: typography.size["2xl"],
  },
  errorTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.semantic.error,
    marginBottom: spacing["1"],
  },
  errorText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    lineHeight: typography.lineHeight.relaxed,
  },
  errorRetryInfo: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    marginTop: spacing["1"],
    fontStyle: "italic",
  },
  errorCloseButton: {
    padding: spacing["2"],
  },
  errorRetryButton: {
    marginTop: spacing["3"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["5"],
    backgroundColor: Colors.semantic.error,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  errorRetryButtonText: {
    color: Colors.neutral.white,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },

  // Analyze Button
  analyzeButton: {
    backgroundColor: Colors.secondary.lavender,
    padding: spacing["5"],
    borderRadius: radius.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["2"],
    marginVertical: spacing["6"],
    ...shadows.lg,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["10"],
  },
  loadingText: {
    marginTop: spacing["3"],
    color: Colors.neutral.dark,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  resultsContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing["6"],
    marginTop: spacing["6"],
    ...shadows.xl,
  },
  resultsTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["4"],
    letterSpacing: typography.letterSpacing.tight,
  },
  resultsDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: typography.lineHeight.relaxed,
  },
  
  // Action Buttons
  actionButtons: {
    gap: spacing["3"],
    marginBottom: spacing["6"],
  },
  primaryButtonWrapper: {
    marginBottom: spacing["2"],
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3"],
    padding: spacing["5"],
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  primaryButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  secondaryButtonWrapper: {
    marginBottom: spacing["2"],
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3"],
    padding: spacing["5"],
    borderRadius: radius.xl,
    ...shadows.md,
  },
  secondaryButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  
  // Camera
  cameraContainer: {
    height: 400,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing["6"],
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
    padding: spacing["8"],
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cameraCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraCaptureButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraCaptureInner: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.lavender,
  },

  // Image Preview
  imagePreviewContainer: {
    position: "relative",
    marginBottom: spacing["6"],
    aspectRatio: 4 / 3,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: radius.xl,
  },
  removeImageButton: {
    position: "absolute",
    top: spacing["3"],
    right: spacing["3"],
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: Colors.semantic.error,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  
  // Results
  resultSection: {
    marginBottom: spacing["6"],
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.neutral.dark,
    marginBottom: spacing["2"],
    textTransform: "uppercase",
    letterSpacing: 1.2,
    lineHeight: 22,
  },
  resultValue: {
    fontSize: 16,
    color: "#374151", // Darker gray for better readability
    lineHeight: 26, // 1.625x for optimal reading
    marginBottom: spacing["5"],
    letterSpacing: 0.4,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["2"],
  },
  tag: {
    backgroundColor: Colors.secondary.sky + "30",
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["2"],
    borderRadius: radius.lg,
  },
  tagText: {
    color: Colors.secondary.sky,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: 0.3,
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
    gap: spacing["2"],
    marginBottom: spacing["2"],
  },

  // New schema styles
  metaSection: {
    backgroundColor: Colors.neutral.lighter,
    padding: spacing["3"],
    borderRadius: radius.lg,
    marginBottom: spacing["6"],
  },
  metaText: {
    fontSize: 14,
    color: Colors.neutral.dark,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  riskSection: {
    backgroundColor: "#FFF3CD",
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
    padding: spacing["5"],
    borderRadius: radius.xl,
    marginBottom: spacing["6"],
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A65F00",
    marginBottom: spacing["3"],
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  riskItem: {
    marginBottom: spacing["3"],
  },
  riskSummary: {
    fontSize: 14,
    color: "#A65F00",
    marginBottom: spacing["2"],
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  riskAction: {
    fontSize: 12,
    color: "#A65F00",
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  insightItem: {
    marginBottom: spacing["10"],
    paddingBottom: spacing["8"],
    paddingTop: spacing["2"],
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: spacing["4"],
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  strengthBadge: {
    backgroundColor: Colors.secondary.sky + "20",
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: radius.lg,
    alignSelf: "flex-start",
    marginTop: spacing["2"],
  },
  strengthText: {
    fontSize: 12,
    color: Colors.secondary.sky,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  tipsSection: {
    backgroundColor: Colors.secondary.lavender + "10",
    padding: spacing["5"],
    borderRadius: radius.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.lavender,
  },
  tipItem: {
    marginBottom: spacing["10"],
    paddingBottom: spacing["6"],
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: spacing["4"],
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  tipStep: {
    fontSize: 15,
    color: "#4B5563",
    marginLeft: spacing["4"],
    marginBottom: spacing["4"],
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  tipWhy: {
    fontSize: 14,
    color: Colors.secondary.lavender,
    fontStyle: "italic",
    marginTop: spacing["3"],
    lineHeight: 22,
    letterSpacing: 0.3,
    marginBottom: spacing["2"],
  },
  disclaimerSection: {
    backgroundColor: "#F0F9FF",
    padding: spacing["3"],
    borderRadius: radius.lg,
    marginTop: spacing["6"],
    marginBottom: spacing["6"],
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary.sky,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.neutral.dark,
    lineHeight: 20,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  newAnalysisButton: {
    backgroundColor: Colors.secondary.sky,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    padding: spacing["5"],
    borderRadius: radius.xl,
    marginTop: spacing["2"],
    ...shadows.md,
  },
  newAnalysisButtonText: {
    color: Colors.neutral.white,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
    letterSpacing: 0.3,
  },
});