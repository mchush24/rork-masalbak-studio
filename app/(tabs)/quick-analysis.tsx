import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {
  Camera,
  ImageIcon,
  X,
  Sparkles,
  Zap,
  Lightbulb,
  Brain,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useFirstTimeUser } from '@/lib/hooks/useFirstTimeUser';
import { FirstTimeWelcomeModal } from '@/components/FirstTimeWelcomeModal';
import { showConfirmDialog } from '@/lib/platform';

import { useAgeCollection } from '@/lib/hooks/useAgeCollection';
import { AgePickerModal } from '@/components/AgePickerModal';

import { AnalysisStepper, AnalysisStep } from '@/components/analysis/AnalysisStepper';
import { AnalysisLoadingOverlay } from '@/components/analysis/AnalysisLoadingOverlay';
import { QuotaExceededModal } from '@/components/quota/QuotaExceededModal';
import { useQuota } from '@/hooks/useQuota';
import { useToastHelpers } from '@/components/ui/Toast';

// New schema types matching backend
type AnalysisMeta = {
  testType: string;
  age?: number;
  language: string;
  confidence: number;
  uncertaintyLevel: 'low' | 'mid' | 'high';
  dataQualityNotes: string[];
};

type Insight = {
  title: string;
  summary: string;
  evidence: string[];
  strength: 'weak' | 'moderate' | 'strong';
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
  const { colors, isDark: _isDark } = useTheme();
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

  // Quota
  const { shouldShowLowWarning, refetch: refetchQuota } = useQuota();
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const { warning: showWarningToast } = useToastHelpers();

  // tRPC mutations
  const analyzeMutation = trpc.studio.analyzeDrawing.useMutation();

  // Compute current analysis step for stepper
  const currentAnalysisStep: AnalysisStep = analysis
    ? 'results'
    : analyzing
      ? 'analyzing'
      : 'select';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Show welcome modal for first-time users
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isCheckingFirstTime && isFirstTime) {
      // Small delay for smooth appearance
      timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFirstTime, isCheckingFirstTime]);

  const handleDismissWelcome = () => {
    setShowWelcomeModal(false);
    markAsReturningUser();
  };

  // Show age picker when image is selected for the first time
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (selectedImage && !ageCollected && !isCheckingAge) {
      // Small delay for smooth transition
      timer = setTimeout(() => {
        setShowAgePickerModal(true);
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [selectedImage, ageCollected, isCheckingAge]);

  const handleSelectAge = async (age: number) => {
    try {
      setSelectedAge(age);
      setShowAgePickerModal(false);

      // Mark age as collected
      await markAgeAsCollected();

      // Age selected successfully
    } catch (_error) {
      // Error updating age - silently handle
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
    // Low quota warning (session-based, once)
    if (shouldShowLowWarning()) {
      showWarningToast('Jetonlarınız azalıyor');
    }

    try {
      setError(null); // Önceki hataları temizle
      setAnalyzing(true);

      if (!selectedImage) {
        throw new Error('Lütfen bir görüntü seçin');
      }

      // Use selectedAge if available, otherwise default to 7
      const childAge = selectedAge || 7;

      // Base64 encode the image
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const result = await analyzeMutation.mutateAsync({
        taskType: 'FreeDrawing',
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
      // Check for quota exceeded error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const trpcCode = (err as any)?.data?.code || (err as any)?.code;
      if (trpcCode === 'FORBIDDEN' || (err instanceof Error && err.message.includes('quota'))) {
        setShowQuotaModal(true);
        refetchQuota();
        setAnalyzing(false);
        return;
      }

      const message = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';
      setError(message);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Otomatik retry mantığı
      if (retries < 3) {
        const delay = 2000 * (retries + 1); // 2s, 4s, 6s

        setTimeout(() => {
          setRetries(retries + 1);
          handleAnalysis();
        }, delay);
      } else {
        showConfirmDialog(
          '❌ Analiz Başarısız',
          '3 kez deneme yapıldı ancak başarısız oldu. Lütfen daha sonra tekrar deneyin.',
          () => router.push('/'),
          undefined,
          { confirmText: 'Ana Sayfaya Dön', cancelText: 'Anladım' }
        );
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // ... existing code ...

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* First Time Welcome Modal */}
      <FirstTimeWelcomeModal visible={showWelcomeModal} onDismiss={handleDismissWelcome} />

      {/* Age Picker Modal - shown on first image selection */}
      <AgePickerModal
        visible={showAgePickerModal}
        onSelectAge={handleSelectAge}
        onSkip={handleSkipAge}
      />

      {analyzing ? (
        <AnalysisLoadingOverlay
          message="Çizim gözlemleri hazırlanıyor..."
          estimatedDuration="20-40 saniye"
          testType="Serbest Çizim Analizi"
        />
      ) : (
        <LinearGradient
          colors={[...colors.background.analysis] as [string, string, ...string[]]}
          style={[styles.gradientContainer, { paddingTop: insets.top }]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Error Banner */}
            {error && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: colors.semantic.errorLight,
                    borderLeftColor: colors.semantic.error,
                  },
                ]}
              >
                <View style={styles.errorContent}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.errorTitle, { color: colors.semantic.error }]}>
                      Hata Oluştu
                    </Text>
                    <Text style={[styles.errorText, { color: colors.text.tertiary }]}>{error}</Text>
                    {retries > 0 && <Text style={styles.errorRetryInfo}>Deneme: {retries}/3</Text>}
                  </View>
                  <Pressable onPress={() => setError(null)} style={styles.errorCloseButton}>
                    <X size={20} color="#FFFFFF" />
                  </Pressable>
                </View>

                {/* Retry Button */}
                {retries >= 3 && (
                  <Pressable
                    onPress={() => {
                      setRetries(0);
                      setError(null);
                      handleAnalysis();
                    }}
                    style={[styles.errorRetryButton, { backgroundColor: colors.semantic.error }]}
                  >
                    <Text style={styles.errorRetryButtonText}>🔄 Tekrar Dene</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Header - Compact */}
            <View style={styles.header}>
              <View
                style={[styles.headerIcon, { backgroundColor: colors.secondary.skyLight + '30' }]}
              >
                <Brain
                  size={iconSizes.header}
                  color={colors.secondary.sky}
                  strokeWidth={iconStroke.standard}
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                  Çizim Analizi
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.text.tertiary }]}>
                  AI destekli gelişim değerlendirmesi
                </Text>
              </View>
            </View>

            {/* Analysis Progress Stepper */}
            <View style={styles.stepperContainer}>
              <AnalysisStepper currentStep={currentAnalysisStep} />
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
                    colors={[colors.secondary.sky, colors.secondary.skyLight]}
                    style={styles.primaryButton}
                  >
                    <ImageIcon size={24} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Galeriden Seç</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    if (!cameraPermission) return;
                    if (!cameraPermission.granted) {
                      const { granted } = await requestCameraPermission();
                      if (!granted) {
                        showConfirmDialog(
                          'Kamera İzni Gerekli',
                          'Kamera kullanmak için lütfen ayarlardan izin verin.',
                          () => {
                            if (Platform.OS === 'ios') {
                              Linking.openURL('app-settings:');
                            } else {
                              Linking.openSettings();
                            }
                          },
                          undefined,
                          { confirmText: 'Ayarlar' }
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
                    colors={[colors.neutral.medium, colors.neutral.dark]}
                    style={styles.secondaryButton}
                  >
                    <Camera size={24} color="#FFFFFF" />
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
                  ref={ref => {
                    if (ref) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CameraView ref lacks takePictureAsync type
                      (ref as any).takePictureAsync = async () => {
                        try {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const photo = await (ref as any).takePictureAsync();
                          setSelectedImage(photo.uri);
                          setShowCamera(false);
                          if (Platform.OS !== 'web') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }
                        } catch {
                          // Camera capture failed - silently handle
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
                    <X size={24} color="#FFFFFF" />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      // Trigger camera capture
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                  contentFit="contain"
                />
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
                  <X size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            )}

            {/* Analiz Et Butonu */}
            {selectedImage && !analyzing && !analysis && (
              <Pressable
                onPress={handleAnalysis}
                style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
                disabled={analyzing}
              >
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>Analiz Et</Text>
              </Pressable>
            )}

            {analyzing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.sunset} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                  Çizim analiz ediliyor...
                </Text>
              </View>
            )}

            {analysis && (
              <Animated.View
                style={[
                  styles.resultsContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                    backgroundColor: colors.surface.card,
                  },
                ]}
              >
                {/* Summary Card - Top */}
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                  ]}
                >
                  <Text style={styles.summaryEmoji}>
                    {analysis.meta.confidence >= 0.7
                      ? '✅'
                      : analysis.meta.confidence >= 0.4
                        ? '📊'
                        : '🔍'}
                  </Text>
                  <View style={styles.summaryContent}>
                    <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
                      {analysis.insights?.[0]?.title || 'Analiz Tamamlandı'}
                    </Text>
                    <Text style={[styles.summarySubtitle, { color: colors.text.tertiary }]}>
                      Güven: %{(analysis.meta.confidence * 100).toFixed(0)} •{' '}
                      {analysis.meta.uncertaintyLevel === 'low'
                        ? 'Düşük belirsizlik'
                        : analysis.meta.uncertaintyLevel === 'mid'
                          ? 'Orta belirsizlik'
                          : 'Yüksek belirsizlik'}
                    </Text>
                  </View>
                </View>

                {/* Risk Flags */}
                {analysis.riskFlags && analysis.riskFlags.length > 0 && (
                  <View
                    style={[
                      styles.riskSection,
                      {
                        backgroundColor: colors.semantic.warningBg,
                        borderLeftColor: colors.semantic.warning,
                      },
                    ]}
                  >
                    <Text style={[styles.riskTitle, { color: colors.text.primary }]}>
                      Önemli Notlar
                    </Text>
                    {analysis.riskFlags.map((risk, idx) => (
                      <View key={idx} style={styles.riskItem}>
                        <Text style={[styles.riskSummary, { color: colors.text.secondary }]}>
                          {risk.summary}
                        </Text>
                        <Text style={[styles.riskAction, { color: colors.text.tertiary }]}>
                          Uzman görüşü önerilir
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Insights - Card Based */}
                {analysis.insights && analysis.insights.length > 0 && (
                  <View style={styles.resultSection}>
                    <View style={styles.insightHeader}>
                      <Lightbulb
                        size={iconSizes.action}
                        color={colors.secondary.sunshine}
                        strokeWidth={iconStroke.standard}
                      />
                      <Text style={[styles.resultLabel, { color: colors.text.secondary }]}>
                        Çizim Gözlemleri
                      </Text>
                    </View>
                    {analysis.insights.map((insight, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.insightCard,
                          {
                            backgroundColor: colors.surface.card,
                            borderColor: colors.border.light,
                          },
                        ]}
                      >
                        <Text style={[styles.insightTitle, { color: colors.text.primary }]}>
                          {insight.title}
                        </Text>
                        <Text style={[styles.resultValue, { color: colors.text.secondary }]}>
                          {insight.summary}
                        </Text>
                        <View
                          style={[
                            styles.strengthBadge,
                            { backgroundColor: colors.secondary.sky + '20' },
                          ]}
                        >
                          <Text style={[styles.strengthText, { color: colors.secondary.sky }]}>
                            {insight.strength === 'weak'
                              ? 'Zayıf'
                              : insight.strength === 'moderate'
                                ? 'Orta'
                                : 'Güçlü'}{' '}
                            bulgu
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Home Tips */}
                {analysis.homeTips && analysis.homeTips.length > 0 && (
                  <View style={styles.resultSection}>
                    <View style={styles.insightHeader}>
                      <Sparkles
                        size={iconSizes.action}
                        color={colors.primary.sunset}
                        strokeWidth={iconStroke.standard}
                      />
                      <Text style={[styles.resultLabel, { color: colors.primary.sunset }]}>
                        Birlikte Yapabilecekleriniz
                      </Text>
                    </View>
                    {analysis.homeTips.map((tip, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.tipCard,
                          {
                            backgroundColor: colors.surface.card,
                            borderColor: colors.border.light,
                          },
                        ]}
                      >
                        <Text style={[styles.tipTitle, { color: colors.text.primary }]}>
                          {tip.title}
                        </Text>
                        {tip.steps.map((step, sIdx) => (
                          <Text
                            key={sIdx}
                            style={[styles.tipStep, { color: colors.text.secondary }]}
                          >
                            {sIdx + 1}. {step}
                          </Text>
                        ))}
                        <Text style={[styles.tipWhy, { color: colors.secondary.lavender }]}>
                          {tip.why}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Disclaimer */}
                <View
                  style={[
                    styles.disclaimerSection,
                    {
                      backgroundColor: colors.semantic.infoBg,
                      borderLeftColor: colors.secondary.sky,
                    },
                  ]}
                >
                  <Text style={[styles.disclaimerText, { color: colors.text.secondary }]}>
                    {analysis.disclaimer}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.resultActions}>
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push('/(tabs)/analysis' as Href);
                    }}
                    style={({ pressed }) => [
                      styles.resultActionButton,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Brain
                      size={iconSizes.small}
                      color={colors.secondary.lavender}
                      strokeWidth={iconStroke.standard}
                    />
                    <Text style={[styles.resultActionText, { color: colors.text.primary }]}>
                      Detaylı Analiz
                    </Text>
                    <ChevronRight
                      size={iconSizes.inline}
                      color={colors.neutral.light}
                      strokeWidth={iconStroke.standard}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push('/chatbot' as Href);
                    }}
                    style={({ pressed }) => [
                      styles.resultActionButton,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <MessageCircle
                      size={iconSizes.small}
                      color={colors.secondary.sky}
                      strokeWidth={iconStroke.standard}
                    />
                    <Text style={[styles.resultActionText, { color: colors.text.primary }]}>
                      Ioo ile Konuş
                    </Text>
                    <ChevronRight
                      size={iconSizes.inline}
                      color={colors.neutral.light}
                      strokeWidth={iconStroke.standard}
                    />
                  </Pressable>
                </View>

                {/* New Analysis Button */}
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
                  style={({ pressed }) => [styles.newAnalysisButton, pressed && { opacity: 0.8 }]}
                >
                  <Zap size={iconSizes.action} color="#FFFFFF" strokeWidth={iconStroke.standard} />
                  <Text style={styles.newAnalysisButtonText}>Yeni Analiz</Text>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </LinearGradient>
      )}

      <QuotaExceededModal visible={showQuotaModal} onClose={() => setShowQuotaModal(false)} />
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
    paddingVertical: spacing['6'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['6'],
    gap: spacing['3'],
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: Colors.secondary.skyLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['0.5'],
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  stepperContainer: {
    marginBottom: spacing['6'],
  },

  // ✅ Error Banner Stilleri
  errorBanner: {
    backgroundColor: Colors.semantic.errorLight,
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['6'],
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.error,
    ...shadows.md,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
  },
  errorIcon: {
    fontSize: typography.size['2xl'],
  },
  errorTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.semibold,
    color: Colors.semantic.error,
    marginBottom: spacing['1'],
  },
  errorText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    lineHeight: 24,
  },
  errorRetryInfo: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    marginTop: spacing['1'],
    fontStyle: 'italic',
  },
  errorCloseButton: {
    padding: spacing['2'],
  },
  errorRetryButton: {
    marginTop: spacing['3'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['5'],
    backgroundColor: Colors.semantic.error,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  errorRetryButtonText: {
    color: Colors.neutral.white,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },

  // Analyze Button
  analyzeButton: {
    backgroundColor: Colors.secondary.lavender,
    padding: spacing['5'],
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing['2'],
    marginVertical: spacing['6'],
    ...shadows.lg,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['10'],
  },
  loadingText: {
    marginTop: spacing['3'],
    color: Colors.neutral.dark,
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
  resultsContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['6'],
    marginTop: spacing['6'],
    ...shadows.xl,
  },
  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['5'],
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  summaryEmoji: {
    fontSize: 32,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  summarySubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },

  // Action Buttons
  actionButtons: {
    gap: spacing['3'],
    marginBottom: spacing['6'],
  },
  primaryButtonWrapper: {
    marginBottom: spacing['2'],
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
    padding: spacing['5'],
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  primaryButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
  },
  secondaryButtonWrapper: {
    marginBottom: spacing['2'],
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
    padding: spacing['5'],
    borderRadius: radius.xl,
    ...shadows.md,
  },
  secondaryButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
  },

  // Camera
  cameraContainer: {
    height: 400,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing['6'],
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['8'],
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCaptureButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCaptureInner: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.lavender,
  },

  // Image Preview
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: spacing['6'],
    aspectRatio: 4 / 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing['3'],
    right: spacing['3'],
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: Colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },

  // Results
  resultSection: {
    marginBottom: spacing['6'],
  },
  resultLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
  },
  resultValue: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: 24,
    marginBottom: spacing['2'],
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  tag: {
    backgroundColor: Colors.secondary.sky + '30',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.lg,
  },
  tagText: {
    color: Colors.secondary.sky,
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },
  themeTag: {
    backgroundColor: Colors.secondary.sunshine + '30',
  },
  themeTagText: {
    color: Colors.semantic.amber,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
  },

  riskSection: {
    backgroundColor: Colors.semantic.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.warning,
    padding: spacing['4'],
    borderRadius: radius.lg,
    marginBottom: spacing['5'],
  },
  riskTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['3'],
  },
  riskItem: {
    marginBottom: spacing['3'],
  },
  riskSummary: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
    lineHeight: 22,
  },
  riskAction: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontFamily: typography.family.semibold,
    fontStyle: 'italic',
  },
  insightCard: {
    backgroundColor: Colors.background.card,
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  insightTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
  },
  strengthBadge: {
    backgroundColor: Colors.secondary.sky + '20',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  strengthText: {
    fontSize: typography.size.xs,
    color: Colors.secondary.sky,
    fontFamily: typography.family.semibold,
  },
  tipCard: {
    backgroundColor: Colors.background.card,
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  tipTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['3'],
  },
  tipStep: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    marginLeft: spacing['2'],
    marginBottom: spacing['2'],
    lineHeight: 22,
  },
  tipWhy: {
    fontSize: typography.size.sm,
    color: Colors.secondary.lavender,
    fontStyle: 'italic',
    marginTop: spacing['2'],
  },
  disclaimerSection: {
    backgroundColor: Colors.semantic.infoBg,
    padding: spacing['3'],
    borderRadius: radius.md,
    marginBottom: spacing['5'],
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary.sky,
  },
  disclaimerText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  // Result Action Buttons
  resultActions: {
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  resultActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: radius.lg,
    padding: spacing['4'],
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  resultActionText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
  },
  newAnalysisButton: {
    backgroundColor: Colors.secondary.sky,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  newAnalysisButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },
});
