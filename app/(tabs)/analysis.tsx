import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Share,
  Dimensions,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  Camera,
  ImageIcon,
  Sparkles,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  Zap,
  Star,
  FileText,
  AlertTriangle,
  Share2,
  MessageCircle,
  Award,
  Shield,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, Href } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';

import { Colors } from '@/constants/colors';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { PROTOCOLS } from '@/constants/protocols';
import { TEST_CONFIG, TASK_TYPES } from '@/constants/test-config';
import { strings } from '@/i18n/strings';
import { preprocessImage } from '@/utils/imagePreprocess';
import { buildShareText } from '@/services/abTest';
import { pickFromLibrary, captureWithCamera } from '@/services/imagePick';
import type { TaskType } from '@/types/AssessmentSchema';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChild } from '@/lib/contexts/ChildContext';
import { useFirstTimeUser } from '@/lib/hooks/useFirstTimeUser';
import { FirstTimeWelcomeModal } from '@/components/FirstTimeWelcomeModal';
import { useAgeCollection } from '@/lib/hooks/useAgeCollection';
import { AgePickerModal } from '@/components/AgePickerModal';
import { AnalysisStepper, AnalysisStep } from '@/components/analysis/AnalysisStepper';
import { AnalysisLoadingOverlay } from '@/components/analysis/AnalysisLoadingOverlay';
import { QuotaExceededModal } from '@/components/quota/QuotaExceededModal';
import { useQuota } from '@/hooks/useQuota';
import { useToastHelpers } from '@/components/ui/Toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AnalysisInsight {
  title: string;
  summary?: string;
  strength: 'strong' | 'moderate' | 'weak';
  evidence: string[];
}

interface RiskFlag {
  type: string;
  summary?: string;
  severity?: string;
  action?: string;
}

interface HomeTip {
  title?: string;
  steps: string[];
  why?: string;
}

interface BackendAnalysisResult {
  insights: AnalysisInsight[];
  conversationGuide?: {
    openingQuestions?: string[];
  };
  homeTips: HomeTip[];
  riskFlags: RiskFlag[];
  disclaimer: string;
  trendNote?: string;
  meta?: {
    confidence?: number;
    uncertaintyLevel?: 'low' | 'mid' | 'high';
  };
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface State {
  mode: 'quick' | 'advanced';
  advancedExpanded: boolean;
  testType: TaskType;
  childAge: number;
  childQuote: string;
  imageUris: Record<string, string>;
  step: 'select' | 'analyzing' | 'results';
  error: string | null;
  retryCount: number;
  analysisResult: BackendAnalysisResult | null;
  resultLayer: 1 | 2 | 3;
  showProtocolSheet: boolean;
  protocolSheetTask: TaskType;
  showQuotaModal: boolean;
}

type Action =
  | { type: 'SET_MODE'; mode: 'quick' | 'advanced' }
  | { type: 'TOGGLE_ADVANCED' }
  | { type: 'SET_TEST_TYPE'; testType: TaskType }
  | { type: 'SET_CHILD_AGE'; age: number }
  | { type: 'SET_CHILD_QUOTE'; quote: string }
  | { type: 'SET_IMAGE'; slotId: string; uri: string }
  | { type: 'CLEAR_IMAGE'; slotId: string }
  | { type: 'CLEAR_ALL_IMAGES' }
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_SUCCESS'; result: BackendAnalysisResult }
  | { type: 'ANALYSIS_ERROR'; error: string; retryCount: number }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_RESULT_LAYER'; layer: 1 | 2 | 3 }
  | { type: 'OPEN_PROTOCOL_SHEET'; task: TaskType }
  | { type: 'CLOSE_PROTOCOL_SHEET' }
  | { type: 'SHOW_QUOTA_MODAL'; show: boolean }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'TOGGLE_ADVANCED':
      return {
        ...state,
        advancedExpanded: !state.advancedExpanded,
        mode: !state.advancedExpanded ? 'advanced' : 'quick',
        // Reset test type to DAP when collapsing
        ...(state.advancedExpanded ? { testType: 'DAP' as TaskType, imageUris: {} } : {}),
      };
    case 'SET_TEST_TYPE':
      return {
        ...state,
        testType: action.testType,
        imageUris: {},
        analysisResult: null,
        step: 'select',
      };
    case 'SET_CHILD_AGE':
      return { ...state, childAge: action.age };
    case 'SET_CHILD_QUOTE':
      return { ...state, childQuote: action.quote };
    case 'SET_IMAGE':
      return { ...state, imageUris: { ...state.imageUris, [action.slotId]: action.uri } };
    case 'CLEAR_IMAGE': {
      const updated = { ...state.imageUris };
      delete updated[action.slotId];
      return { ...state, imageUris: updated };
    }
    case 'CLEAR_ALL_IMAGES':
      return { ...state, imageUris: {} };
    case 'START_ANALYSIS':
      return { ...state, step: 'analyzing', error: null };
    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        step: 'results',
        analysisResult: action.result,
        retryCount: 0,
        resultLayer: 1,
      };
    case 'ANALYSIS_ERROR':
      return { ...state, step: 'select', error: action.error, retryCount: action.retryCount };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_RESULT_LAYER':
      return { ...state, resultLayer: action.layer };
    case 'OPEN_PROTOCOL_SHEET':
      return { ...state, showProtocolSheet: true, protocolSheetTask: action.task };
    case 'CLOSE_PROTOCOL_SHEET':
      return { ...state, showProtocolSheet: false };
    case 'SHOW_QUOTA_MODAL':
      return { ...state, showQuotaModal: action.show };
    case 'RESET':
      return {
        ...state,
        imageUris: {},
        step: 'select',
        error: null,
        retryCount: 0,
        analysisResult: null,
        resultLayer: 1,
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const MAX_RETRIES = 3;
const lang = 'tr';

// Strength indicator colors
const STRENGTH_COLORS: Record<string, { bg: string; text: string }> = {
  strong: { bg: '#DCFCE7', text: '#166534' },
  moderate: { bg: '#FEF9C3', text: '#854D0E' },
  weak: { bg: '#FFEDD5', text: '#9A3412' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function UnifiedAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { selectedChild } = useChild();

  // First time + age collection
  const { isFirstTime, isLoading: isCheckingFirstTime, markAsReturningUser } = useFirstTimeUser();
  const { ageCollected, isLoading: isCheckingAge, markAgeAsCollected } = useAgeCollection();
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
  const [showAgePickerModal, setShowAgePickerModal] = React.useState(false);

  // Quota
  const { shouldShowLowWarning, refetch: refetchQuota } = useQuota();
  const { warning: showWarningToast } = useToastHelpers();

  // tRPC mutations
  const analyzeMutation = trpc.studio.analyzeDrawing.useMutation();
  const saveAnalysisMutation = trpc.analysis.save.useMutation();

  // Initial child age from context
  const initialAge = selectedChild?.age ?? 7;

  const [state, dispatch] = useReducer(reducer, {
    mode: 'quick',
    advancedExpanded: false,
    testType: 'DAP',
    childAge: initialAge,
    childQuote: '',
    imageUris: {},
    step: 'select',
    error: null,
    retryCount: 0,
    analysisResult: null,
    resultLayer: 1,
    showProtocolSheet: false,
    protocolSheetTask: 'DAP',
    showQuotaModal: false,
  });

  // Update age when child changes
  useEffect(() => {
    if (selectedChild?.age) {
      dispatch({ type: 'SET_CHILD_AGE', age: selectedChild.age });
    }
  }, [selectedChild]);

  // Sheet animation
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Results fade in
  const resultsFadeAnim = useRef(new Animated.Value(0)).current;
  const resultsScaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (state.step === 'results') {
      Animated.parallel([
        Animated.timing(resultsFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(resultsScaleAnim, {
          toValue: 1,
          useNativeDriver: USE_NATIVE_DRIVER,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    } else {
      resultsFadeAnim.setValue(0);
      resultsScaleAnim.setValue(0.95);
    }
  }, [state.step, resultsFadeAnim, resultsScaleAnim]);

  // First-time welcome
  useEffect(() => {
    if (!isCheckingFirstTime && isFirstTime) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstTime, isCheckingFirstTime]);

  // Age picker on first image
  const hasAnyImage = Object.keys(state.imageUris).length > 0;
  useEffect(() => {
    if (hasAnyImage && !ageCollected && !isCheckingAge) {
      const timer = setTimeout(() => setShowAgePickerModal(true), 300);
      return () => clearTimeout(timer);
    }
  }, [hasAnyImage, ageCollected, isCheckingAge]);

  // Protocol required images
  const requiredImages = PROTOCOLS[state.testType].requiredImages;
  const hasRequiredImages =
    requiredImages.length === 0 ||
    requiredImages.filter(img => !img.optional).every(img => state.imageUris[img.id]);
  const uploadedCount = Object.keys(state.imageUris).length;
  const requiredCount = requiredImages.filter(img => !img.optional).length;

  // Quick mode: single image
  const quickImageUri = state.imageUris['quick'] || null;

  // Stepper
  const currentAnalysisStep: AnalysisStep =
    state.step === 'results' ? 'results' : state.step === 'analyzing' ? 'analyzing' : 'select';

  // Sheet open/close
  function openSheet(task: TaskType) {
    dispatch({ type: 'OPEN_PROTOCOL_SHEET', task });
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: USE_NATIVE_DRIVER,
      tension: 65,
      friction: 11,
    }).start();
  }

  function closeSheet() {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: USE_NATIVE_DRIVER,
      easing: Easing.out(Easing.cubic),
    }).start(({ finished }) => {
      if (finished) dispatch({ type: 'CLOSE_PROTOCOL_SHEET' });
    });
  }

  // Image handling
  async function onPickImage(slotId: string) {
    const uri = await pickFromLibrary();
    if (uri) {
      dispatch({ type: 'SET_IMAGE', slotId, uri });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }

  async function onCaptureImage(slotId: string) {
    const uri = await captureWithCamera();
    if (uri) {
      dispatch({ type: 'SET_IMAGE', slotId, uri });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }

  // Base64 conversion
  async function convertToBase64(uri: string): Promise<string> {
    const cleanUri = await preprocessImage(uri);
    if (Platform.OS === 'web') {
      if (cleanUri.startsWith('data:')) {
        return cleanUri.split(',')[1];
      }
      const response = await fetch(cleanUri);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    let fileUri = cleanUri;
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
      fileUri = `file://${fileUri}`;
    }
    return FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
  }

  // Main analysis handler with retry
  const handleAnalysis = useCallback(
    async (retryAttempt = 0) => {
      // Low quota warning
      if (retryAttempt === 0 && shouldShowLowWarning()) {
        showWarningToast('Jetonlarınız azalıyor');
      }

      dispatch({ type: 'START_ANALYSIS' });

      try {
        const isQuick = state.mode === 'quick';
        const taskType = isQuick ? 'DAP' : state.testType;
        const currentRequiredImages = PROTOCOLS[taskType].requiredImages;

        // Build images array
        const imageEntries = Object.entries(state.imageUris);
        if (imageEntries.length === 0 && currentRequiredImages.length > 0) {
          if (Platform.OS === 'web') {
            alert('Lütfen en az bir görsel yükleyin.');
          } else {
            Alert.alert('Hata', 'Lütfen en az bir görsel yükleyin.');
          }
          dispatch({
            type: 'ANALYSIS_ERROR',
            error: 'Görsel yüklenmedi',
            retryCount: retryAttempt,
          });
          return;
        }

        const images = await Promise.all(
          imageEntries.map(async ([id, uri]) => {
            const imgInfo = currentRequiredImages.find(r => r.id === id);
            return {
              id,
              label: imgInfo?.label || id,
              base64: await convertToBase64(uri),
            };
          })
        );

        const primaryImageId = currentRequiredImages[0]?.id;
        const primaryUri = primaryImageId
          ? state.imageUris[primaryImageId]
          : Object.values(state.imageUris)[0];

        const backendResult = await analyzeMutation.mutateAsync({
          taskType,
          childAge: state.childAge,
          images: images.length > 0 ? images : undefined,
          imageBase64: images.length === 1 ? images[0].base64 : undefined,
          language: 'tr',
          userRole: 'parent',
          featuresJson: {},
        });

        const typedResult = backendResult as BackendAnalysisResult;
        dispatch({ type: 'ANALYSIS_SUCCESS', result: typedResult });

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Save to DB
        if (user?.userId) {
          const startTime = Date.now();
          try {
            await saveAnalysisMutation.mutateAsync({
              taskType,
              childAge: state.childAge,
              childName: selectedChild?.name,
              originalImageUrl: primaryUri || undefined,
              drawingDescription: undefined,
              childQuote: state.childQuote || undefined,
              analysisResult: typedResult,
              aiModel: 'gpt-4-vision-preview',
              aiConfidence: typedResult.meta?.confidence,
              processingTimeMs: Date.now() - startTime,
              language: 'tr',
            });
          } catch {
            // Save failed silently
          }
        }
      } catch (err) {
        // Check quota exceeded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trpcCode = (err as any)?.data?.code || (err as any)?.code;
        if (trpcCode === 'FORBIDDEN' || (err instanceof Error && err.message.includes('quota'))) {
          dispatch({ type: 'SHOW_QUOTA_MODAL', show: true });
          dispatch({ type: 'ANALYSIS_ERROR', error: 'Kota aşıldı', retryCount: 0 });
          refetchQuota();
          return;
        }

        const message = err instanceof Error ? err.message : 'Bilinmeyen hata oluştu';

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        if (retryAttempt < MAX_RETRIES) {
          const delay = 2000 * (retryAttempt + 1);
          dispatch({
            type: 'ANALYSIS_ERROR',
            error: `${message} (Deneme ${retryAttempt + 1}/${MAX_RETRIES})`,
            retryCount: retryAttempt + 1,
          });
          setTimeout(() => handleAnalysis(retryAttempt + 1), delay);
        } else {
          dispatch({ type: 'ANALYSIS_ERROR', error: message, retryCount: retryAttempt });
          if (Platform.OS === 'web') {
            alert('3 kez deneme yapıldı ancak başarısız oldu. Lütfen daha sonra tekrar deneyin.');
          } else {
            Alert.alert(
              'Analiz Başarısız',
              '3 kez deneme yapıldı ancak başarısız oldu. Lütfen daha sonra tekrar deneyin.',
              [
                { text: 'Anladım', style: 'default' },
                { text: 'Ana Sayfaya Dön', onPress: () => router.push('/') },
              ]
            );
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.mode,
      state.testType,
      state.childAge,
      state.childQuote,
      state.imageUris,
      user?.userId,
      selectedChild?.name,
    ]
  );

  // Share
  async function onShare() {
    if (!state.analysisResult) return;
    try {
      const top = state.analysisResult.insights?.[0];
      const confidence =
        top?.strength === 'strong' ? 0.8 : top?.strength === 'moderate' ? 0.6 : 0.4;
      const text = buildShareText(confidence, top?.title || 'Analiz sonucu');
      await Share.share({ message: text });
    } catch {
      // Share cancelled
    }
  }

  // Reset
  function onNewAnalysis() {
    dispatch({ type: 'RESET' });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Sheet animations
  const sheetHeight = Math.min(650, SCREEN_HEIGHT * 0.8);
  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight + 50, 0],
  });
  const overlayOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  // Determine what can be analyzed
  const canAnalyze = state.mode === 'quick' ? !!quickImageUri : hasRequiredImages;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Modals */}
      <FirstTimeWelcomeModal
        visible={showWelcomeModal}
        onDismiss={() => {
          setShowWelcomeModal(false);
          markAsReturningUser();
        }}
      />
      <AgePickerModal
        visible={showAgePickerModal}
        onSelectAge={async (age: number) => {
          dispatch({ type: 'SET_CHILD_AGE', age });
          setShowAgePickerModal(false);
          await markAgeAsCollected();
        }}
        onSkip={async () => {
          setShowAgePickerModal(false);
          await markAgeAsCollected();
        }}
      />
      <QuotaExceededModal
        visible={state.showQuotaModal}
        onClose={() => dispatch({ type: 'SHOW_QUOTA_MODAL', show: false })}
      />

      {state.step === 'analyzing' ? (
        <AnalysisLoadingOverlay
          message="Çizim analiz ediliyor..."
          estimatedDuration={TEST_CONFIG[state.testType]?.duration || '15-30 saniye'}
          testType={`${state.testType} (${TEST_CONFIG[state.testType]?.description || 'Analiz'})`}
        />
      ) : (
        <LinearGradient
          colors={[...colors.background.analysis] as [string, string, ...string[]]}
          style={[styles.gradientContainer, { paddingTop: insets.top }]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* ============ ERROR BANNER ============ */}
            {state.error && (
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
                  <Text style={styles.errorIcon}>&#x26A0;&#xFE0F;</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.errorTitle, { color: colors.semantic.error }]}>
                      Hata Oluştu
                    </Text>
                    <Text style={[styles.errorText, { color: colors.text.tertiary }]}>
                      {state.error}
                    </Text>
                    {state.retryCount > 0 && state.retryCount < MAX_RETRIES && (
                      <Text style={[styles.errorRetryInfo, { color: colors.neutral.light }]}>
                        Yeniden deneniyor...
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => dispatch({ type: 'CLEAR_ERROR' })}
                    style={styles.errorCloseButton}
                  >
                    <X size={18} color={colors.neutral.medium} />
                  </Pressable>
                </View>
                {state.retryCount >= MAX_RETRIES && (
                  <Pressable
                    onPress={() => handleAnalysis(0)}
                    style={[styles.errorRetryButton, { backgroundColor: colors.semantic.error }]}
                  >
                    <Text style={styles.errorRetryButtonText}>Tekrar Dene</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* ============ HEADER ============ */}
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

            {/* ============ STEPPER ============ */}
            <View style={styles.stepperContainer}>
              <AnalysisStepper currentStep={currentAnalysisStep} />
            </View>

            {/* ============ RESULTS (shown when step=results) ============ */}
            {state.step === 'results' && state.analysisResult && (
              <Animated.View
                style={{ opacity: resultsFadeAnim, transform: [{ scale: resultsScaleAnim }] }}
              >
                {renderResults()}
              </Animated.View>
            )}

            {/* ============ IMAGE INPUT (shown when step=select) ============ */}
            {state.step === 'select' && (
              <>
                {/* Quick mode: intro + single image upload */}
                {!state.advancedExpanded && (
                  <View style={styles.quickImageSection}>
                    {/* Quick mode intro card */}
                    <View style={[styles.quickIntroCard, { backgroundColor: colors.surface.card }]}>
                      <Text style={[styles.quickIntroTitle, { color: colors.text.primary }]}>
                        {quickImageUri ? 'Harika, çizim hazır!' : 'Çocuğunuzun çizimini yükleyin'}
                      </Text>
                      <Text style={[styles.quickIntroDesc, { color: colors.text.tertiary }]}>
                        {quickImageUri
                          ? 'Aşağıdaki butona basarak AI analizini başlatabilirsiniz.'
                          : 'Bir kişi çizimi (DAP) yükleyin, AI birkaç saniye içinde gelişimsel değerlendirme sunacak.'}
                      </Text>
                    </View>

                    {!quickImageUri ? (
                      <View style={styles.quickUploadArea}>
                        <View
                          style={[
                            styles.uploadDashedBorder,
                            {
                              borderColor: colors.secondary.indigo + '40',
                              backgroundColor: isDark ? colors.surface.elevated : '#F8F9FF',
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.uploadIconCircle,
                              { backgroundColor: colors.secondary.indigo + '15' },
                            ]}
                          >
                            <ImageIcon size={32} color={colors.secondary.indigo} />
                          </View>
                          <Text style={[styles.uploadMainText, { color: colors.text.primary }]}>
                            Çizim Ekle
                          </Text>
                          <Text style={[styles.uploadHint, { color: colors.text.tertiary }]}>
                            Kağıt üzerindeki çizimin fotoğrafı
                          </Text>
                          <View style={styles.uploadButtons}>
                            <Pressable
                              onPress={() => onPickImage('quick')}
                              style={({ pressed }) => [
                                styles.uploadButton,
                                styles.uploadButtonGallery,
                                { backgroundColor: colors.secondary.indigo + '15' },
                                pressed && { opacity: 0.8 },
                              ]}
                            >
                              <ImageIcon size={16} color={colors.secondary.indigo} />
                              <Text
                                style={[
                                  styles.uploadButtonText,
                                  { color: colors.secondary.indigo },
                                ]}
                              >
                                Galeriden Seç
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => onCaptureImage('quick')}
                              style={({ pressed }) => [
                                styles.uploadButton,
                                styles.uploadButtonCamera,
                                { backgroundColor: colors.neutral.lighter },
                                pressed && { opacity: 0.8 },
                              ]}
                            >
                              <Camera size={16} color={colors.neutral.medium} />
                              <Text
                                style={[styles.uploadButtonText, { color: colors.neutral.medium }]}
                              >
                                Fotoğraf Çek
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.quickPreviewContainer}>
                        <Image
                          source={{ uri: quickImageUri }}
                          style={styles.quickPreview}
                          resizeMode="cover"
                        />
                        <Pressable
                          onPress={() => dispatch({ type: 'CLEAR_IMAGE', slotId: 'quick' })}
                          style={styles.quickPreviewRemove}
                        >
                          <X size={18} color={Colors.neutral.white} />
                        </Pressable>
                        <View style={styles.quickPreviewCheck}>
                          <CheckCircle size={24} color={Colors.status.success} />
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* ============ ADVANCED TOGGLE ============ */}
                <Pressable
                  onPress={() => dispatch({ type: 'TOGGLE_ADVANCED' })}
                  style={({ pressed }) => [
                    styles.advancedToggle,
                    {
                      backgroundColor: colors.surface.card,
                      borderColor: state.advancedExpanded
                        ? colors.secondary.indigo + '40'
                        : 'transparent',
                      borderWidth: 1,
                    },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <View
                    style={[
                      styles.advancedToggleIcon,
                      { backgroundColor: colors.secondary.indigo + '15' },
                    ]}
                  >
                    <Sparkles size={18} color={colors.secondary.indigo} />
                  </View>
                  <View style={styles.advancedToggleText}>
                    <Text style={[styles.advancedToggleTitle, { color: colors.text.primary }]}>
                      {state.advancedExpanded
                        ? 'Detaylı Test Modu'
                        : 'Farklı bir test mi yapmak istiyorsunuz?'}
                    </Text>
                    <Text style={[styles.advancedToggleDesc, { color: colors.text.tertiary }]}>
                      {state.advancedExpanded
                        ? `${state.testType} seçili`
                        : 'HTP, Aile, Kaktüs ve 6 test daha'}
                    </Text>
                  </View>
                  <Animated.View
                    style={{ transform: [{ rotate: state.advancedExpanded ? '180deg' : '0deg' }] }}
                  >
                    <ChevronDown size={20} color={colors.secondary.indigo} />
                  </Animated.View>
                </Pressable>

                {/* Advanced section content */}
                {state.advancedExpanded && (
                  <View style={styles.advancedContent}>
                    {/* Step guide */}
                    <View
                      style={[
                        styles.advancedGuide,
                        { backgroundColor: isDark ? colors.surface.elevated : '#F0F4FF' },
                      ]}
                    >
                      <View style={styles.guideSteps}>
                        <View style={styles.guideStep}>
                          <View
                            style={[
                              styles.guideStepNumber,
                              { backgroundColor: colors.secondary.indigo },
                            ]}
                          >
                            <Text style={styles.guideStepNumberText}>1</Text>
                          </View>
                          <Text style={[styles.guideStepText, { color: colors.text.secondary }]}>
                            Aşağıdan test seçin
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.guideStepLine,
                            { backgroundColor: colors.secondary.indigo + '30' },
                          ]}
                        />
                        <View style={styles.guideStep}>
                          <View
                            style={[
                              styles.guideStepNumber,
                              {
                                backgroundColor:
                                  uploadedCount > 0 ? Colors.status.success : colors.neutral.light,
                              },
                            ]}
                          >
                            <Text style={styles.guideStepNumberText}>2</Text>
                          </View>
                          <Text style={[styles.guideStepText, { color: colors.text.secondary }]}>
                            Çizim(ler)i yükleyin
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.guideStepLine,
                            { backgroundColor: colors.secondary.indigo + '30' },
                          ]}
                        />
                        <View style={styles.guideStep}>
                          <View
                            style={[
                              styles.guideStepNumber,
                              { backgroundColor: colors.neutral.light },
                            ]}
                          >
                            <Text style={styles.guideStepNumberText}>3</Text>
                          </View>
                          <Text style={[styles.guideStepText, { color: colors.text.secondary }]}>
                            Analiz Et
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Test Carousel */}
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Test Seçin
                      </Text>
                      <Pressable
                        onPress={() => openSheet(state.testType)}
                        style={styles.sectionAction}
                      >
                        <Info size={16} color={colors.secondary.indigo} />
                        <Text
                          style={[styles.sectionActionText, { color: colors.secondary.indigo }]}
                        >
                          Protokol
                        </Text>
                      </Pressable>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.testCarousel}
                    >
                      {TASK_TYPES.map(t => {
                        const config = TEST_CONFIG[t];
                        const isActive = state.testType === t;
                        return (
                          <Pressable
                            key={t}
                            onPress={() => dispatch({ type: 'SET_TEST_TYPE', testType: t })}
                            style={({ pressed }) => [
                              styles.testCard,
                              isActive && styles.testCardActive,
                              pressed && { transform: [{ scale: 0.96 }] },
                            ]}
                          >
                            <LinearGradient
                              colors={
                                isActive
                                  ? config.gradient
                                  : isDark
                                    ? [colors.surface.card, colors.surface.elevated]
                                    : ['#F8FAFC', '#F1F5F9']
                              }
                              style={styles.testCardGradient}
                            >
                              <Text style={styles.testCardIcon}>{config.icon}</Text>
                              <Text
                                style={[
                                  styles.testCardName,
                                  { color: colors.text.primary },
                                  isActive && styles.testCardNameActive,
                                ]}
                              >
                                {t}
                              </Text>
                              <Text
                                style={[
                                  styles.testCardDesc,
                                  { color: colors.neutral.medium },
                                  isActive && styles.testCardDescActive,
                                ]}
                                numberOfLines={1}
                              >
                                {config.description}
                              </Text>
                              <View style={styles.testCardBadges}>
                                <View
                                  style={[
                                    styles.testCardBadge,
                                    isActive && styles.testCardBadgeActive,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.testCardBadgeText,
                                      isActive && styles.testCardBadgeTextActive,
                                    ]}
                                  >
                                    {config.duration}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.testCardBadge,
                                    isActive && styles.testCardBadgeActive,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.testCardBadgeText,
                                      isActive && styles.testCardBadgeTextActive,
                                    ]}
                                  >
                                    {config.difficulty}
                                  </Text>
                                </View>
                              </View>
                              {isActive && (
                                <View style={styles.testCardCheck}>
                                  <CheckCircle size={16} color={Colors.neutral.white} />
                                </View>
                              )}
                            </LinearGradient>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    {/* Selected Test Info Card — with guidance */}
                    <View style={styles.selectedTestCard}>
                      <LinearGradient
                        colors={TEST_CONFIG[state.testType].gradient}
                        style={styles.selectedTestGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={styles.selectedTestContent}>
                          <View style={styles.selectedTestLeft}>
                            <Text style={styles.selectedTestIcon}>
                              {TEST_CONFIG[state.testType].icon}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.selectedTestName}>
                                {PROTOCOLS[state.testType].title}
                              </Text>
                              <Text style={styles.selectedTestMeta}>
                                {PROTOCOLS[state.testType].ageRange} -{' '}
                                {PROTOCOLS[state.testType].duration}
                              </Text>
                            </View>
                          </View>
                          <Pressable
                            onPress={() => openSheet(state.testType)}
                            style={styles.selectedTestButton}
                          >
                            <FileText size={16} color={Colors.neutral.white} />
                            <Text style={styles.selectedTestButtonText}>Nasıl uygulanır?</Text>
                          </Pressable>
                        </View>
                        <Text style={styles.selectedTestInstruction} numberOfLines={2}>
                          {`Çocuğa söyleyin: \u201C${PROTOCOLS[state.testType].phases[0]?.instruction}\u201D`}
                        </Text>
                        {/* Quick tips for the selected test */}
                        <View style={styles.selectedTestTips}>
                          <View style={styles.selectedTestTipItem}>
                            <Text style={styles.selectedTestTipIcon}>{'\u23F1\uFE0F'}</Text>
                            <Text style={styles.selectedTestTipText}>
                              {TEST_CONFIG[state.testType].duration}
                            </Text>
                          </View>
                          <View style={styles.selectedTestTipItem}>
                            <Text style={styles.selectedTestTipIcon}>
                              {TEST_CONFIG[state.testType].imageCount === 0
                                ? '\u2705'
                                : '\u{1F5BC}\uFE0F'}
                            </Text>
                            <Text style={styles.selectedTestTipText}>
                              {TEST_CONFIG[state.testType].imageCount === 0
                                ? 'Görsel gerekmiyor'
                                : `${TEST_CONFIG[state.testType].imageCount} çizim gerekli`}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>

                    {/* Child Info */}
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Çocuk Bilgileri
                      </Text>
                    </View>
                    <View style={[styles.childInfoCard, { backgroundColor: colors.surface.card }]}>
                      <View style={styles.childInfoRow}>
                        <View style={styles.ageInputContainer}>
                          <Text style={[styles.inputLabel, { color: colors.neutral.medium }]}>
                            Yaş
                          </Text>
                          <View style={styles.ageInputWrapper}>
                            <TextInput
                              value={String(state.childAge)}
                              onChangeText={text => {
                                const n = parseInt(text, 10);
                                if (!isNaN(n)) dispatch({ type: 'SET_CHILD_AGE', age: n });
                                else if (text === '') dispatch({ type: 'SET_CHILD_AGE', age: 0 });
                              }}
                              keyboardType="number-pad"
                              style={[
                                styles.ageInput,
                                {
                                  backgroundColor: colors.neutral.lightest,
                                  borderColor: colors.neutral.lighter,
                                  color: colors.text.primary,
                                },
                              ]}
                              maxLength={2}
                            />
                            <Text style={[styles.ageUnit, { color: colors.neutral.light }]}>
                              yaş
                            </Text>
                          </View>
                        </View>
                        <View style={styles.quoteInputContainer}>
                          <Text style={[styles.inputLabel, { color: colors.neutral.medium }]}>
                            Çocuğun Sözleri (Opsiyonel)
                          </Text>
                          <TextInput
                            value={state.childQuote}
                            onChangeText={text =>
                              dispatch({ type: 'SET_CHILD_QUOTE', quote: text })
                            }
                            placeholder='"Bu ben ve annem..."'
                            placeholderTextColor={colors.neutral.light}
                            style={[
                              styles.quoteInput,
                              {
                                backgroundColor: colors.neutral.lightest,
                                borderColor: colors.neutral.lighter,
                                color: colors.text.primary,
                              },
                            ]}
                            multiline
                          />
                        </View>
                      </View>
                    </View>

                    {/* Image Upload - Multi-slot */}
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Görseller
                      </Text>
                      {requiredCount > 0 && (
                        <View style={styles.uploadProgress}>
                          <Text
                            style={[styles.uploadProgressText, { color: colors.secondary.indigo }]}
                          >
                            {uploadedCount}/{requiredCount}
                          </Text>
                          <View style={styles.uploadProgressBar}>
                            <View
                              style={[
                                styles.uploadProgressFill,
                                {
                                  width: `${Math.min((uploadedCount / requiredCount) * 100, 100)}%`,
                                  backgroundColor: colors.secondary.indigo,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      )}
                    </View>

                    {requiredImages.length > 0 ? (
                      <View style={styles.imageGrid}>
                        {requiredImages.map((slot, index) => {
                          const hasImage = !!state.imageUris[slot.id];
                          return (
                            <View
                              key={slot.id}
                              style={[styles.imageCard, { backgroundColor: colors.surface.card }]}
                            >
                              <View style={styles.imageCardHeader}>
                                <View
                                  style={[
                                    styles.imageCardNumber,
                                    { backgroundColor: colors.secondary.indigo },
                                  ]}
                                >
                                  <Text style={styles.imageCardNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.imageCardMeta}>
                                  <Text
                                    style={[styles.imageCardLabel, { color: colors.text.primary }]}
                                  >
                                    {slot.label}
                                  </Text>
                                  {slot.optional ? (
                                    <Text
                                      style={[
                                        styles.imageCardOptional,
                                        { color: colors.neutral.light },
                                      ]}
                                    >
                                      Opsiyonel
                                    </Text>
                                  ) : (
                                    <Text
                                      style={[
                                        styles.imageCardRequired,
                                        { color: colors.secondary.indigo },
                                      ]}
                                    >
                                      Zorunlu
                                    </Text>
                                  )}
                                </View>
                                {hasImage && (
                                  <Pressable
                                    onPress={() =>
                                      dispatch({ type: 'CLEAR_IMAGE', slotId: slot.id })
                                    }
                                    style={styles.imageCardClear}
                                  >
                                    <X size={16} color={Colors.status.error} />
                                  </Pressable>
                                )}
                              </View>
                              {slot.description && (
                                <Text
                                  style={[
                                    styles.imageCardDescription,
                                    { color: colors.neutral.medium },
                                  ]}
                                >
                                  {slot.description}
                                </Text>
                              )}
                              {hasImage ? (
                                <View style={styles.imagePreviewContainer}>
                                  <Image
                                    source={{ uri: state.imageUris[slot.id] }}
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.imagePreviewOverlay}>
                                    <CheckCircle size={24} color={Colors.status.success} />
                                  </View>
                                </View>
                              ) : (
                                <View style={styles.imageUploadArea}>
                                  <View
                                    style={[
                                      styles.uploadDashedBorder,
                                      {
                                        borderColor: colors.neutral.lighter,
                                        backgroundColor: isDark
                                          ? colors.surface.elevated
                                          : '#FAFBFC',
                                      },
                                    ]}
                                  >
                                    <ImageIcon size={32} color={colors.neutral.light} />
                                    <Text
                                      style={[styles.uploadText, { color: colors.neutral.light }]}
                                    >
                                      Görsel yükle
                                    </Text>
                                    <View style={styles.uploadButtons}>
                                      <Pressable
                                        onPress={() => onPickImage(slot.id)}
                                        style={({ pressed }) => [
                                          styles.uploadButton,
                                          styles.uploadButtonGallery,
                                          { backgroundColor: colors.secondary.indigo + '1A' },
                                          pressed && { opacity: 0.8 },
                                        ]}
                                      >
                                        <ImageIcon size={16} color={colors.secondary.indigo} />
                                        <Text
                                          style={[
                                            styles.uploadButtonText,
                                            { color: colors.secondary.indigo },
                                          ]}
                                        >
                                          Galeri
                                        </Text>
                                      </Pressable>
                                      <Pressable
                                        onPress={() => onCaptureImage(slot.id)}
                                        style={({ pressed }) => [
                                          styles.uploadButton,
                                          styles.uploadButtonCamera,
                                          { backgroundColor: colors.neutral.lighter },
                                          pressed && { opacity: 0.8 },
                                        ]}
                                      >
                                        <Camera size={16} color={colors.neutral.medium} />
                                        <Text
                                          style={[
                                            styles.uploadButtonText,
                                            { color: colors.neutral.medium },
                                          ]}
                                        >
                                          Kamera
                                        </Text>
                                      </Pressable>
                                    </View>
                                  </View>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <View style={styles.noImageCard}>
                        <LinearGradient
                          colors={
                            isDark
                              ? [colors.surface.elevated, colors.surface.card]
                              : ['#F0FDF4', '#DCFCE7']
                          }
                          style={styles.noImageGradient}
                        >
                          <View style={styles.noImageIcon}>
                            <Star size={24} color={Colors.status.success} />
                          </View>
                          <Text
                            style={[
                              styles.noImageTitle,
                              { color: isDark ? colors.text.primary : '#166534' },
                            ]}
                          >
                            Görsel Gerekmiyor
                          </Text>
                          <Text
                            style={[
                              styles.noImageText,
                              { color: isDark ? colors.text.secondary : '#16A34A' },
                            ]}
                          >
                            Bu test görsel yükleme gerektirmez. Renk seçim sırasını not alarak devam
                            edin.
                          </Text>
                        </LinearGradient>
                      </View>
                    )}
                  </View>
                )}

                {/* ============ ANALYZE BUTTON ============ */}
                <View style={styles.analyzeButtonContainer}>
                  <Pressable
                    disabled={!canAnalyze}
                    onPress={() => handleAnalysis(0)}
                    style={({ pressed }) => [
                      styles.analyzeButtonWrapper,
                      !canAnalyze && styles.analyzeButtonDisabled,
                      pressed && canAnalyze && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        canAnalyze
                          ? [colors.secondary.indigo, colors.secondary.violet]
                          : ['#94A3B8', '#CBD5E1']
                      }
                      style={styles.analyzeButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Sparkles size={22} color={Colors.neutral.white} />
                      <Text style={styles.analyzeButtonText}>
                        {canAnalyze
                          ? 'AI Analizi Başlat'
                          : state.advancedExpanded
                            ? requiredCount === 0
                              ? 'AI Analizi Başlat'
                              : `Önce ${requiredCount - uploadedCount} çizim yükleyin`
                            : 'Önce çizim yükleyin'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </LinearGradient>
      )}

      {/* ============ PROTOCOL BOTTOM SHEET ============ */}
      {state.showProtocolSheet && renderProtocolSheet()}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render: 3-Layer Results
  // ---------------------------------------------------------------------------
  function renderResults() {
    const result = state.analysisResult!;
    const confidence = result.meta?.confidence ?? 0.5;
    const summaryEmoji =
      confidence >= 0.7 ? '\u2705' : confidence >= 0.4 ? '\u{1F4CA}' : '\u{1F50D}';

    return (
      <View style={[styles.resultsContainer, { backgroundColor: colors.surface.card }]}>
        {/* ---- Layer 1: Summary Card ---- */}
        <View style={[styles.summaryCard, { borderColor: colors.border.light }]}>
          <Text style={styles.summaryEmoji}>{summaryEmoji}</Text>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
              {result.insights?.[0]?.title || 'Analiz Tamamlandı'}
            </Text>
            <Text style={[styles.summarySubtitle, { color: colors.text.tertiary }]}>
              {result.insights?.[0]?.summary || 'Detaylı sonuçları aşağıda görebilirsiniz'}
            </Text>
          </View>
        </View>

        {/* Layer expand button */}
        {state.resultLayer < 2 && (
          <Pressable
            onPress={() => dispatch({ type: 'SET_RESULT_LAYER', layer: 2 })}
            style={[styles.layerExpandButton, { borderColor: colors.border.light }]}
          >
            <Text style={[styles.layerExpandText, { color: colors.secondary.indigo }]}>
              Detayları Gör
            </Text>
            <ChevronDown size={16} color={colors.secondary.indigo} />
          </Pressable>
        )}

        {/* ---- Layer 2: Insight Cards ---- */}
        {state.resultLayer >= 2 && result.insights && result.insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={[styles.insightsSectionTitle, { color: colors.text.primary }]}>
              İçgörüler
            </Text>
            {result.insights.map((insight, idx) => {
              const strengthColor = STRENGTH_COLORS[insight.strength] || STRENGTH_COLORS.weak;
              return (
                <View
                  key={idx}
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: isDark ? colors.surface.elevated : Colors.neutral.white,
                      borderColor: colors.border.light,
                    },
                  ]}
                >
                  <View style={styles.insightCardHeader}>
                    <Text style={[styles.insightTitle, { color: colors.text.primary }]}>
                      {insight.title}
                    </Text>
                    <View style={[styles.strengthBadge, { backgroundColor: strengthColor.bg }]}>
                      <Text style={[styles.strengthText, { color: strengthColor.text }]}>
                        {insight.strength === 'strong'
                          ? 'Güçlü'
                          : insight.strength === 'moderate'
                            ? 'Orta'
                            : 'Zayıf'}
                      </Text>
                    </View>
                  </View>
                  {insight.summary && (
                    <Text style={[styles.insightSummary, { color: colors.text.secondary }]}>
                      {insight.summary}
                    </Text>
                  )}
                </View>
              );
            })}

            {state.resultLayer < 3 && (
              <Pressable
                onPress={() => dispatch({ type: 'SET_RESULT_LAYER', layer: 3 })}
                style={[styles.layerExpandButton, { borderColor: colors.border.light }]}
              >
                <Text style={[styles.layerExpandText, { color: colors.secondary.indigo }]}>
                  Kanıt ve İpuçlarını Gör
                </Text>
                <ChevronDown size={16} color={colors.secondary.indigo} />
              </Pressable>
            )}
          </View>
        )}

        {/* ---- Layer 3: Evidence + Home Tips + Conversation Guide ---- */}
        {state.resultLayer >= 3 && (
          <View style={styles.detailSection}>
            {/* Evidence per insight */}
            {result.insights?.map((insight, idx) =>
              insight.evidence && insight.evidence.length > 0 ? (
                <View
                  key={`ev-${idx}`}
                  style={[
                    styles.evidenceCard,
                    {
                      backgroundColor: isDark ? colors.surface.elevated : '#F8FAFC',
                      borderColor: colors.border.light,
                    },
                  ]}
                >
                  <Text style={[styles.evidenceTitle, { color: colors.text.primary }]}>
                    {insight.title} - Kanıtlar
                  </Text>
                  {insight.evidence.map((ev, eidx) => (
                    <View key={eidx} style={styles.evidenceItem}>
                      <View
                        style={[styles.evidenceDot, { backgroundColor: colors.secondary.indigo }]}
                      />
                      <Text style={[styles.evidenceText, { color: colors.text.secondary }]}>
                        {ev}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null
            )}

            {/* Home Tips */}
            {result.homeTips && result.homeTips.length > 0 && (
              <View style={styles.homeTipsSection}>
                <View style={styles.sectionHeaderRow}>
                  <Sparkles size={18} color={colors.primary.sunset} />
                  <Text style={[styles.homeTipsSectionTitle, { color: colors.text.primary }]}>
                    Evde Yapabilecekleriniz
                  </Text>
                </View>
                {result.homeTips.map((tip, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.tipCard,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                    ]}
                  >
                    {tip.title && (
                      <Text style={[styles.tipTitle, { color: colors.text.primary }]}>
                        {tip.title}
                      </Text>
                    )}
                    {tip.steps.map((step, sIdx) => (
                      <Text key={sIdx} style={[styles.tipStep, { color: colors.text.secondary }]}>
                        {sIdx + 1}. {step}
                      </Text>
                    ))}
                    {tip.why && (
                      <Text style={[styles.tipWhy, { color: colors.secondary.lavender }]}>
                        {tip.why}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Conversation Guide */}
            {result.conversationGuide?.openingQuestions &&
              result.conversationGuide.openingQuestions.length > 0 && (
                <View style={styles.conversationSection}>
                  <View style={styles.sectionHeaderRow}>
                    <MessageCircle size={18} color={colors.secondary.sky} />
                    <Text style={[styles.homeTipsSectionTitle, { color: colors.text.primary }]}>
                      Konuşma Rehberi
                    </Text>
                  </View>
                  {result.conversationGuide.openingQuestions.map((q, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.conversationItem,
                        {
                          backgroundColor: isDark ? colors.surface.elevated : '#EFF6FF',
                          borderColor: colors.border.light,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.conversationText, { color: colors.text.secondary }]}
                      >{`\u201C${q}\u201D`}</Text>
                    </View>
                  ))}
                </View>
              )}
          </View>
        )}

        {/* ---- Risk Flags ---- */}
        {result.riskFlags && result.riskFlags.length > 0 && (
          <View
            style={[
              styles.riskSection,
              {
                backgroundColor: isDark ? colors.surface.elevated : '#FEF2F2',
                borderLeftColor: colors.semantic.error,
              },
            ]}
          >
            <View style={styles.riskHeader}>
              <AlertTriangle size={18} color={colors.semantic.error} />
              <Text style={[styles.riskTitle, { color: colors.text.primary }]}>
                Dikkat Edilmesi Gerekenler
              </Text>
            </View>
            {result.riskFlags.map((flag, idx) => (
              <View key={idx} style={styles.riskItem}>
                <Text style={[styles.riskSummary, { color: colors.text.secondary }]}>
                  {flag.summary || flag.type}
                </Text>
                {flag.action && (
                  <Text style={[styles.riskAction, { color: colors.text.tertiary }]}>
                    {flag.action}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ---- Disclaimer ---- */}
        <View
          style={[
            styles.disclaimerCard,
            {
              backgroundColor: isDark ? colors.surface.elevated : '#FFFBEB',
              borderColor: isDark ? colors.border.light : '#FEF3C7',
            },
          ]}
        >
          <View style={styles.disclaimerHeader}>
            <Shield size={16} color={colors.semantic.amber} />
            <Text
              style={[styles.disclaimerTitle, { color: isDark ? colors.text.primary : '#92400E' }]}
            >
              Önemli Uyarı
            </Text>
          </View>
          <Text
            style={[styles.disclaimerText, { color: isDark ? colors.text.secondary : '#A16207' }]}
          >
            {result.disclaimer || strings[lang].legacy.disclaimer}
          </Text>
        </View>

        {/* ---- Action Buttons ---- */}
        <View style={styles.resultActions}>
          <Pressable
            onPress={onShare}
            style={({ pressed }) => [
              styles.resultActionButton,
              { backgroundColor: colors.surface.card, borderColor: colors.border.light },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Share2
              size={iconSizes.small}
              color={colors.secondary.indigo}
              strokeWidth={iconStroke.standard}
            />
            <Text style={[styles.resultActionText, { color: colors.text.primary }]}>Paylaş</Text>
            <ChevronRight size={iconSizes.inline} color={colors.neutral.light} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/chatbot' as Href)}
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
              {"Ioo'ya Sor"}
            </Text>
            <ChevronRight size={iconSizes.inline} color={colors.neutral.light} />
          </Pressable>
        </View>

        {/* New Analysis */}
        <Pressable
          onPress={onNewAnalysis}
          style={({ pressed }) => [styles.newAnalysisButton, pressed && { opacity: 0.8 }]}
        >
          <LinearGradient
            colors={[colors.secondary.sky, colors.secondary.skyLight]}
            style={styles.newAnalysisGradient}
          >
            <Zap size={20} color={Colors.neutral.white} />
            <Text style={styles.newAnalysisButtonText}>Yeni Analiz</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Protocol Bottom Sheet
  // ---------------------------------------------------------------------------
  function renderProtocolSheet() {
    const task = state.protocolSheetTask;
    const protocol = PROTOCOLS[task];
    const config = TEST_CONFIG[task];

    return (
      <>
        <Pressable onPress={closeSheet} style={styles.sheetOverlayTouchable}>
          <Animated.View style={[styles.sheetOverlay, { opacity: overlayOpacity }]} />
        </Pressable>
        <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}>
          <LinearGradient
            colors={
              isDark
                ? [colors.surface.card, colors.surface.elevated]
                : ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']
            }
            style={styles.sheetGradient}
          >
            <View style={styles.sheetHandleContainer}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border.light }]} />
            </View>

            <View style={[styles.sheetHeader, { borderBottomColor: colors.neutral.lighter }]}>
              <LinearGradient colors={config.gradient} style={styles.sheetHeaderIcon}>
                <Text style={styles.sheetHeaderEmoji}>{config.icon}</Text>
              </LinearGradient>
              <View style={styles.sheetHeaderText}>
                <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>
                  {protocol.title}
                </Text>
                <Text style={[styles.sheetSubtitle, { color: colors.neutral.medium }]}>
                  {protocol.ageRange} - {protocol.duration}
                </Text>
              </View>
              <Pressable
                onPress={closeSheet}
                style={[styles.sheetCloseIcon, { backgroundColor: colors.neutral.lighter }]}
              >
                <X size={20} color={colors.neutral.medium} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScrollContent}
            >
              {/* Materials */}
              <View style={styles.sheetSection}>
                <Text style={[styles.sheetSectionTitle, { color: colors.text.primary }]}>
                  Materyaller
                </Text>
                <View style={styles.sheetMaterialsGrid}>
                  {protocol.materials.map((m: string, i: number) => (
                    <View
                      key={i}
                      style={[styles.materialChip, { backgroundColor: colors.neutral.lighter }]}
                    >
                      <Text style={[styles.materialChipText, { color: colors.text.secondary }]}>
                        {m}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Phases */}
              <View style={styles.sheetSection}>
                <Text style={[styles.sheetSectionTitle, { color: colors.text.primary }]}>
                  Uygulama Aşamaları
                </Text>
                {protocol.phases.map((phase, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.phaseCard,
                      {
                        backgroundColor: colors.neutral.lightest,
                        borderLeftColor: colors.secondary.indigo,
                      },
                    ]}
                  >
                    <View style={styles.phaseHeader}>
                      <View
                        style={[styles.phaseNumber, { backgroundColor: colors.secondary.indigo }]}
                      >
                        <Text style={styles.phaseNumberText}>{i + 1}</Text>
                      </View>
                      <View style={styles.phaseMeta}>
                        <Text style={[styles.phaseName, { color: colors.text.primary }]}>
                          {phase.name}
                        </Text>
                        {phase.duration && (
                          <Text style={[styles.phaseDuration, { color: colors.secondary.indigo }]}>
                            {phase.duration}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text
                      style={[styles.phaseInstruction, { color: colors.text.secondary }]}
                    >{`\u201C${phase.instruction}\u201D`}</Text>
                    {phase.notes && phase.notes.length > 0 && (
                      <View style={styles.phaseNotes}>
                        {phase.notes.map((note: string, j: number) => (
                          <Text
                            key={j}
                            style={[styles.phaseNote, { color: colors.neutral.medium }]}
                          >
                            &#x2192; {note}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Observations */}
              <View style={styles.sheetSection}>
                <Text style={[styles.sheetSectionTitle, { color: colors.text.primary }]}>
                  Gözlem Noktaları
                </Text>
                {protocol.observations.map((o: string, i: number) => (
                  <View key={i} style={styles.observationItem}>
                    <View
                      style={[styles.observationDot, { backgroundColor: colors.secondary.indigo }]}
                    />
                    <Text style={[styles.observationText, { color: colors.text.secondary }]}>
                      {o}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Don'ts */}
              <View style={styles.sheetSection}>
                <Text style={[styles.sheetSectionTitle, { color: colors.text.primary }]}>
                  Yapılmaması Gerekenler
                </Text>
                {protocol.donts.map((d: string, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.dontItem,
                      { backgroundColor: isDark ? colors.surface.elevated : '#FEF2F2' },
                    ]}
                  >
                    <X size={14} color={Colors.status.error} />
                    <Text
                      style={[
                        styles.dontText,
                        { color: isDark ? colors.text.secondary : '#991B1B' },
                      ]}
                    >
                      {d}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Capture Hints */}
              {protocol.captureHints?.length > 0 && (
                <View style={styles.sheetSection}>
                  <Text style={[styles.sheetSectionTitle, { color: colors.text.primary }]}>
                    Fotoğraf İpuçları
                  </Text>
                  {protocol.captureHints.map((c: string, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.hintItem,
                        { backgroundColor: isDark ? colors.surface.elevated : '#EEF2FF' },
                      ]}
                    >
                      <Camera size={14} color={colors.secondary.indigo} />
                      <Text
                        style={[
                          styles.hintText,
                          { color: isDark ? colors.text.secondary : '#4338CA' },
                        ]}
                      >
                        {c}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Scoring Notes */}
              {protocol.scoringNotes && protocol.scoringNotes.length > 0 && (
                <View style={styles.sheetSection}>
                  <Text style={[styles.sheetSectionTitle, { color: colors.text.primary }]}>
                    Skorlama Notları
                  </Text>
                  {protocol.scoringNotes.map((s: string, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.scoringItem,
                        { backgroundColor: isDark ? colors.surface.elevated : '#FFFBEB' },
                      ]}
                    >
                      <Award size={14} color={colors.semantic.amber} />
                      <Text
                        style={[
                          styles.scoringText,
                          { color: isDark ? colors.text.secondary : '#92400E' },
                        ]}
                      >
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={[styles.sheetFooter, { borderTopColor: colors.neutral.lighter }]}>
              <Pressable
                onPress={() => {
                  dispatch({ type: 'SET_TEST_TYPE', testType: task });
                  if (!state.advancedExpanded) dispatch({ type: 'TOGGLE_ADVANCED' });
                  closeSheet();
                }}
                style={styles.sheetSelectButton}
              >
                <LinearGradient colors={config.gradient} style={styles.sheetSelectButtonGradient}>
                  <CheckCircle size={18} color={Colors.neutral.white} />
                  <Text style={styles.sheetSelectButtonText}>Bu Testi Seç</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>
      </>
    );
  }
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing['4'],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['4'],
    gap: spacing['3'],
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.bold,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },

  // Stepper
  stepperContainer: {
    marginBottom: spacing['4'],
  },

  // Error Banner
  errorBanner: {
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['4'],
    borderLeftWidth: 4,
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
    fontSize: typography.size.md,
    fontFamily: typography.family.semibold,
    marginBottom: spacing['1'],
  },
  errorText: {
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  errorRetryInfo: {
    fontSize: typography.size.xs,
    marginTop: spacing['1'],
    fontStyle: 'italic',
  },
  errorCloseButton: {
    padding: spacing['1'],
  },
  errorRetryButton: {
    marginTop: spacing['3'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['5'],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  errorRetryButtonText: {
    color: Colors.neutral.white,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },

  // Quick Intro Card
  quickIntroCard: {
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    ...shadows.sm,
  },
  quickIntroTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    marginBottom: spacing['1'],
  },
  quickIntroDesc: {
    fontSize: typography.size.sm,
    lineHeight: 20,
  },

  // Quick Image Section
  quickImageSection: {
    marginBottom: spacing['4'],
  },
  quickUploadArea: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  uploadDashedBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: spacing['8'],
    alignItems: 'center',
  },
  uploadMainText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    marginTop: spacing['2'],
  },
  uploadHint: {
    fontSize: typography.size.sm,
    marginTop: spacing['1'],
    marginBottom: spacing['4'],
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
  },
  uploadButtonGallery: {},
  uploadButtonCamera: {},
  uploadButtonText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },
  uploadText: {
    fontSize: typography.size.sm,
    marginTop: spacing['3'],
    marginBottom: spacing['4'],
    fontFamily: typography.family.medium,
  },

  // Quick Preview
  quickPreviewContainer: {
    position: 'relative',
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  quickPreview: {
    width: '100%',
    height: 220,
    borderRadius: radius.xl,
  },
  quickPreviewRemove: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  quickPreviewCheck: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },

  // Advanced Toggle
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    gap: spacing['3'],
    ...shadows.sm,
  },
  advancedToggleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedToggleText: {
    flex: 1,
  },
  advancedToggleTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
  },
  advancedToggleDesc: {
    fontSize: typography.size.xs,
    marginTop: 2,
  },

  // Advanced Content
  advancedContent: {
    marginBottom: spacing['2'],
  },

  // Advanced Guide Steps
  advancedGuide: {
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginBottom: spacing['4'],
  },
  guideSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStep: {
    alignItems: 'center',
    gap: 6,
  },
  guideStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideStepNumberText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  guideStepText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.medium,
  },
  guideStepLine: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 8,
    marginBottom: 22,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
    marginTop: spacing['2'],
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sectionActionText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },

  // Test Carousel
  testCarousel: {
    paddingVertical: 4,
    paddingRight: 20,
    gap: 12,
  },
  testCard: {
    width: 125,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  testCardActive: {
    ...shadows.lg,
  },
  testCardGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 135,
    justifyContent: 'center',
  },
  testCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  testCardName: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    marginBottom: 2,
  },
  testCardNameActive: {
    color: Colors.neutral.white,
  },
  testCardDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  testCardDescActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  testCardBadges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  testCardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  testCardBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  testCardBadgeText: {
    fontSize: 9,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.medium,
  },
  testCardBadgeTextActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  testCardCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Selected Test Card
  selectedTestCard: {
    marginTop: spacing['4'],
    marginBottom: spacing['2'],
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  selectedTestGradient: {
    padding: 18,
  },
  selectedTestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedTestIcon: {
    fontSize: 36,
  },
  selectedTestName: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  selectedTestMeta: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  selectedTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  selectedTestButtonText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  selectedTestInstruction: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  selectedTestTips: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  selectedTestTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedTestTipIcon: {
    fontSize: 14,
  },
  selectedTestTipText: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: typography.family.medium,
  },

  // Child Info
  childInfoCard: {
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: spacing['4'],
    ...shadows.sm,
  },
  childInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ageInputContainer: {
    width: 90,
  },
  quoteInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    marginBottom: 8,
  },
  ageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageInput: {
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    width: 56,
    textAlign: 'center',
  },
  ageUnit: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
  quoteInput: {
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.size.sm,
    minHeight: 48,
    fontFamily: typography.family.medium,
  },

  // Upload Progress
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadProgressText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },
  uploadProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 3,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Image Grid
  imageGrid: {
    gap: 14,
  },
  imageCard: {
    borderRadius: radius.xl,
    padding: 16,
    ...shadows.sm,
  },
  imageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  imageCardNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCardNumberText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  imageCardMeta: {
    flex: 1,
  },
  imageCardLabel: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
  },
  imageCardOptional: {
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  imageCardRequired: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    marginTop: 2,
  },
  imageCardClear: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCardDescription: {
    fontSize: typography.size.xs,
    marginBottom: 12,
    lineHeight: 18,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: radius.xl,
  },
  imagePreviewOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  imageUploadArea: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },

  // No Image Card
  noImageCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  noImageGradient: {
    padding: 24,
    alignItems: 'center',
  },
  noImageIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...shadows.sm,
  },
  noImageTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    marginBottom: 6,
  },
  noImageText: {
    fontSize: typography.size.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Analyze Button
  analyzeButtonContainer: {
    marginTop: spacing['4'],
    marginBottom: spacing['2'],
  },
  analyzeButtonWrapper: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },

  // Results Container
  resultsContainer: {
    borderRadius: radius.xl,
    padding: spacing['5'],
    ...shadows.xl,
  },

  // Summary Card (Layer 1)
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    gap: spacing['3'],
    borderWidth: 1,
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
    marginBottom: spacing['1'],
  },
  summarySubtitle: {
    fontSize: typography.size.sm,
    lineHeight: 20,
  },

  // Layer expand
  layerExpandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing['3'],
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing['4'],
  },
  layerExpandText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },

  // Insights Section (Layer 2)
  insightsSection: {
    marginBottom: spacing['2'],
  },
  insightsSectionTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    marginBottom: spacing['3'],
  },
  insightCard: {
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderWidth: 1,
  },
  insightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  insightTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    flex: 1,
    marginRight: spacing['2'],
  },
  insightSummary: {
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  strengthBadge: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  },
  strengthText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
  },

  // Detail Section (Layer 3)
  detailSection: {
    marginBottom: spacing['2'],
  },
  evidenceCard: {
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderWidth: 1,
  },
  evidenceTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    marginBottom: spacing['2'],
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing['2'],
  },
  evidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  evidenceText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },

  // Home Tips
  homeTipsSection: {
    marginBottom: spacing['3'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  homeTipsSectionTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },
  tipCard: {
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['3'],
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    marginBottom: spacing['2'],
  },
  tipStep: {
    fontSize: typography.size.sm,
    marginLeft: spacing['2'],
    marginBottom: spacing['2'],
    lineHeight: 22,
  },
  tipWhy: {
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    marginTop: spacing['2'],
  },

  // Conversation Guide
  conversationSection: {
    marginBottom: spacing['3'],
  },
  conversationItem: {
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['2'],
    borderWidth: 1,
  },
  conversationText: {
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Risk Section
  riskSection: {
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    borderLeftWidth: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing['3'],
  },
  riskTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
  },
  riskItem: {
    marginBottom: spacing['2'],
  },
  riskSummary: {
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  riskAction: {
    fontSize: typography.size.xs,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Disclaimer
  disclaimerCard: {
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    borderWidth: 1,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing['2'],
  },
  disclaimerTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
  },
  disclaimerText: {
    fontSize: typography.size.xs,
    lineHeight: 18,
  },

  // Result Actions
  resultActions: {
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  resultActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing['4'],
    gap: spacing['3'],
    borderWidth: 1,
  },
  resultActionText: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
  },

  // New Analysis
  newAnalysisButton: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  newAnalysisGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['4'],
  },
  newAnalysisButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },

  // Bottom Sheet
  sheetOverlayTouchable: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: Colors.neutral.darkest,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    ...shadows.xl,
  },
  sheetGradient: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sheetHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sheetHeaderEmoji: {
    fontSize: 26,
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.extrabold,
  },
  sheetSubtitle: {
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  sheetCloseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sheetSection: {
    marginBottom: 24,
  },
  sheetSectionTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    marginBottom: 12,
  },
  sheetMaterialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materialChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  materialChipText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
  phaseCard: {
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  phaseNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumberText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  phaseMeta: {
    flex: 1,
  },
  phaseName: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
  },
  phaseDuration: {
    fontSize: typography.size.xs,
    marginTop: 2,
    fontFamily: typography.family.medium,
  },
  phaseInstruction: {
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  phaseNotes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  phaseNote: {
    fontSize: typography.size.xs,
    marginBottom: 4,
    paddingLeft: 4,
  },
  observationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  observationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  observationText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  dontItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.lg,
  },
  dontText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.lg,
  },
  hintText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  scoringItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.lg,
  },
  scoringText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  sheetFooter: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sheetSelectButton: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  sheetSelectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  sheetSelectButtonText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
});
