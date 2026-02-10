import React, { useState, useRef, useEffect } from 'react';
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
  Award,
  CheckCircle,
  ChevronRight,
  Info,
  X,
  Zap,
  Shield,
  Star,
  FileText,
  AlertTriangle,
  Share2,
} from 'lucide-react-native';
import { shadows } from '@/constants/design-system';
import { PROTOCOLS } from '@/constants/protocols';
import { strings } from '@/i18n/strings';
import { preprocessImage } from '@/utils/imagePreprocess';
import { ResultCard } from '@/components/ResultCard';
import { buildShareText } from '@/services/abTest';
import { pickFromLibrary, captureWithCamera } from '@/services/imagePick';
import type { TaskType } from '@/types/AssessmentSchema';
import { trpc } from '@/lib/trpc';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '@/lib/hooks/useAuth';

import { AnalysisStepper, AnalysisStep } from '@/components/analysis/AnalysisStepper';
import { AnalysisLoadingOverlay } from '@/components/analysis/AnalysisLoadingOverlay';

// Type definitions for analysis results
interface ReflectiveHypothesis {
  theme: string;
  confidence: number;
  evidence: string[];
}

interface SafetyFlags {
  self_harm: boolean;
  abuse_concern: boolean;
}

interface AnalysisResult {
  task_type: TaskType;
  reflective_hypotheses: ReflectiveHypothesis[];
  conversation_prompts: string[];
  activity_ideas: string[];
  safety_flags: SafetyFlags;
  disclaimers: string[];
  feature_preview?: unknown;
}

interface AnalysisInsight {
  title: string;
  strength: 'strong' | 'moderate' | 'weak';
  evidence: string[];
  summary?: string;
}

interface RiskFlag {
  type: string;
  severity?: string;
}

interface HomeTip {
  steps: string[];
}

interface BackendAnalysisResult {
  insights: AnalysisInsight[];
  conversationGuide?: {
    openingQuestions?: string[];
  };
  homeTips: HomeTip[];
  riskFlags: RiskFlag[];
  disclaimer: string;
  meta?: {
    confidence?: number;
  };
}

const lang = 'tr';
const { width: _SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Native driver is not supported on web platform
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// Test type icons, colors, duration and difficulty
interface TestConfigItem {
  icon: string;
  gradient: readonly [string, string];
  description: string;
  duration: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  ageRange: string;
  imageCount: number;
}

const TEST_CONFIG: Record<TaskType, TestConfigItem> = {
  DAP: {
    icon: '👤',
    gradient: ['#A78BFA', '#C4B5FD'],
    description: 'Kişi çizimi analizi',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  HTP: {
    icon: '🏠',
    gradient: ['#78C8E8', '#A3DBF0'],
    description: 'Ev-Ağaç-Kişi testi',
    duration: '20-30 dk',
    difficulty: 'Orta',
    ageRange: '5-12 yaş',
    imageCount: 3,
  },
  Aile: {
    icon: '👨‍👩‍👧',
    gradient: ['#FFB5D8', '#FFD6ED'],
    description: 'Aile dinamikleri',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '4-14 yaş',
    imageCount: 1,
  },
  Kaktus: {
    icon: '🌵',
    gradient: ['#7ED99C', '#A8E8BA'],
    description: 'Savunma mekanizmaları',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  Agac: {
    icon: '🌳',
    gradient: ['#68D89B', '#9EE7B7'],
    description: 'Kişilik yapısı',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-14 yaş',
    imageCount: 1,
  },
  Bahce: {
    icon: '🌷',
    gradient: ['#FF9B7A', '#FFB299'],
    description: 'İç dünya analizi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  Bender: {
    icon: '🔷',
    gradient: ['#4FB3D4', '#78C8E8'],
    description: 'Görsel-motor entegrasyon',
    duration: '20-30 dk',
    difficulty: 'Zor',
    ageRange: '5-11 yaş',
    imageCount: 1,
  },
  Rey: {
    icon: '🧩',
    gradient: ['#F59E0B', '#FBBF24'],
    description: 'Görsel bellek testi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '4-14 yaş',
    imageCount: 1,
  },
  Luscher: {
    icon: '🎨',
    gradient: ['#EC4899', '#F472B6'],
    description: 'Renk psikolojisi',
    duration: '5-10 dk',
    difficulty: 'Kolay',
    ageRange: '5-14 yaş',
    imageCount: 0,
  },
};

export default function AdvancedAnalysisScreen() {
  const TASK_TYPES: TaskType[] = [
    'DAP',
    'HTP',
    'Aile',
    'Kaktus',
    'Agac',
    'Bahce',
    'Bender',
    'Rey',
    'Luscher',
  ];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [imageUris, setImageUris] = useState<Record<string, string>>({});
  const [age, setAge] = useState<string>('7');
  const [task, setTask] = useState<TaskType>('DAP');
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // tRPC mutations
  const analyzeMutation = trpc.studio.analyzeDrawing.useMutation();
  const saveAnalysisMutation = trpc.analysis.save.useMutation();

  // Compute current analysis step for stepper (hasRequiredImages defined below)
  const currentAnalysisStep: AnalysisStep = result ? 'results' : loading ? 'analyzing' : 'select';

  const [sheetTask, setSheetTask] = useState<TaskType>('DAP');
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Floating animations
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animations
    const createFloatAnimation = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );
    };

    const float1 = createFloatAnimation(floatAnim1, 3000);
    const float2 = createFloatAnimation(floatAnim2, 4000);
    const float3 = createFloatAnimation(floatAnim3, 3500);

    // Pulse animation for analyze button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    float1.start();
    float2.start();
    float3.start();
    pulse.start();
    glow.start();

    return () => {
      float1.stop();
      float2.stop();
      float3.stop();
      pulse.stop();
      glow.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openSheet(forTask: TaskType) {
    setSheetTask(forTask);
    setSheetOpen(true);
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
      if (finished) setSheetOpen(false);
    });
  }

  async function onPickFromLibrary(slotId: string) {
    const selectedUri = await pickFromLibrary();
    if (selectedUri) {
      setImageUris(prev => ({ ...prev, [slotId]: selectedUri }));
    }
  }

  async function onCaptureWithCamera(slotId: string) {
    const capturedUri = await captureWithCamera();
    if (capturedUri) {
      setImageUris(prev => ({ ...prev, [slotId]: capturedUri }));
    }
  }

  function clearImage(slotId: string) {
    setImageUris(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  }

  function onTaskChange(newTask: TaskType) {
    setTask(newTask);
    setImageUris({});
    setResult(null);
  }

  const requiredImages = PROTOCOLS[task].requiredImages;
  const hasRequiredImages =
    requiredImages.length === 0 ||
    requiredImages.filter(img => !img.optional).every(img => imageUris[img.id]);
  const uploadedCount = Object.keys(imageUris).length;
  const requiredCount = requiredImages.filter(img => !img.optional).length;

  async function convertToBase64(uri: string): Promise<string> {
    const cleanUri = await preprocessImage(uri);
    if (Platform.OS === 'web') {
      if (cleanUri.startsWith('data:')) {
        return cleanUri.split(',')[1];
      } else {
        const response = await fetch(cleanUri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } else {
      let fileUri = cleanUri;
      if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }
      return FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    }
  }

  async function onAnalyze() {
    if (!hasRequiredImages) return;
    setLoading(true);
    try {
      const primaryImageId = requiredImages[0]?.id;
      const primaryUri = primaryImageId ? imageUris[primaryImageId] : Object.values(imageUris)[0];

      const imageEntries = Object.entries(imageUris);
      if (imageEntries.length === 0 && requiredImages.length > 0) {
        Alert.alert('Hata', 'Lütfen en az bir görsel yükleyin.');
        setLoading(false);
        return;
      }

      const images = await Promise.all(
        imageEntries.map(async ([id, uri]) => {
          const imgInfo = requiredImages.find(r => r.id === id);
          return {
            id,
            label: imgInfo?.label || id,
            base64: await convertToBase64(uri),
          };
        })
      );

      const backendResult = await analyzeMutation.mutateAsync({
        taskType: task,
        childAge: Number(age),
        images: images.length > 0 ? images : undefined,
        imageBase64: images.length === 1 ? images[0].base64 : undefined,
        language: 'tr',
        userRole: 'parent',
        featuresJson: {},
      });

      const typedBackendResult = backendResult as BackendAnalysisResult;
      const transformedResult: AnalysisResult = {
        task_type: task,
        reflective_hypotheses: typedBackendResult.insights.map((insight: AnalysisInsight) => ({
          theme: insight.title,
          confidence:
            insight.strength === 'strong' ? 0.8 : insight.strength === 'moderate' ? 0.6 : 0.4,
          evidence: insight.evidence,
        })),
        conversation_prompts: typedBackendResult.conversationGuide?.openingQuestions || [
          'Bu çizimde neler oluyor?',
          'En sevdiğin kısım neresi?',
        ],
        activity_ideas: typedBackendResult.homeTips.flatMap((tip: HomeTip) => tip.steps),
        safety_flags: {
          self_harm: typedBackendResult.riskFlags.some(
            (flag: RiskFlag) => flag.type === 'self_harm'
          ),
          abuse_concern: typedBackendResult.riskFlags.some(
            (flag: RiskFlag) => flag.type === 'harm_others' || flag.type === 'sexual_inappropriate'
          ),
        },
        disclaimers: [typedBackendResult.disclaimer],
        feature_preview: undefined,
      };

      setResult(transformedResult);

      if (user?.userId) {
        try {
          const startTime = Date.now();
          await saveAnalysisMutation.mutateAsync({
            taskType: task,
            childAge: Number(age),
            childName: undefined,
            originalImageUrl: primaryUri || undefined,
            drawingDescription: undefined,
            childQuote: quote || undefined,
            analysisResult: typedBackendResult,
            aiModel: 'gpt-4-vision-preview',
            aiConfidence: typedBackendResult.meta?.confidence,
            processingTimeMs: Date.now() - startTime,
            language: 'tr',
          });
        } catch {
          // Failed to save analysis - silently handle
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu';
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function onSelectTest(t: TaskType) {
    onTaskChange(t);
  }

  async function onShare() {
    if (!result) return;
    try {
      const top = result.reflective_hypotheses?.[0];
      const text = buildShareText(
        top?.confidence || 0.6,
        top?.theme?.replaceAll('_', ' ') || 'nazik ipucu'
      );
      await Share.share({ message: text });
    } catch {
      // Share cancelled or failed
    }
  }

  const sheetHeight = Math.min(650, SCREEN_HEIGHT * 0.8);
  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight + 50, 0],
  });
  const overlayOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  // Floating element transforms
  const float1Y = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const float2Y = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const float3Y = floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.container}>
      {loading ? (
        <AnalysisLoadingOverlay
          message="AI analizi devam ediyor..."
          estimatedDuration={TEST_CONFIG[task]?.duration || '15-30 saniye'}
          testType={`${task} (${TEST_CONFIG[task]?.description || 'Analiz'})`}
        />
      ) : (
        <LinearGradient colors={['#F0F4FF', '#E8EFFF', '#DFE8FF']} style={styles.gradientContainer}>
          {/* Floating Background Elements */}
          <Animated.View
            style={[styles.floatingOrb, styles.orb1, { transform: [{ translateY: float1Y }] }]}
          >
            <LinearGradient colors={['#A78BFA', '#C4B5FD']} style={styles.orbGradient} />
          </Animated.View>
          <Animated.View
            style={[styles.floatingOrb, styles.orb2, { transform: [{ translateY: float2Y }] }]}
          >
            <LinearGradient colors={['#78C8E8', '#A3DBF0']} style={styles.orbGradient} />
          </Animated.View>
          <Animated.View
            style={[styles.floatingOrb, styles.orb3, { transform: [{ translateY: float3Y }] }]}
          >
            <LinearGradient colors={['#FFB5D8', '#FFD6ED']} style={styles.orbGradient} />
          </Animated.View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Premium Header */}
            <View style={styles.premiumHeader}>
              <View style={styles.headerGlassCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.headerGlassGradient}
                >
                  <View style={styles.headerContent}>
                    <View style={styles.headerIconWrapper}>
                      <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        style={styles.headerIconGradient}
                      >
                        <Brain size={32} color="#FFF" strokeWidth={2} />
                      </LinearGradient>
                      <Animated.View style={[styles.headerIconGlow, { opacity: glowOpacity }]} />
                    </View>
                    <View style={styles.headerTextArea}>
                      <Text style={styles.premiumHeaderTitle}>Uzman Analizi</Text>
                      <Text style={styles.premiumHeaderSubtitle}>
                        Yapay zeka destekli projektif test değerlendirmesi
                      </Text>
                    </View>
                  </View>
                  <View style={styles.headerBadges}>
                    <View style={styles.headerBadge}>
                      <Shield size={12} color="#6366F1" />
                      <Text style={styles.headerBadgeText}>KVKK Uyumlu</Text>
                    </View>
                    <View style={styles.headerBadge}>
                      <Zap size={12} color="#F59E0B" />
                      <Text style={styles.headerBadgeText}>GPT-4 Vision</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Process Highlights */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.statIconBg}>
                  <Brain size={18} color="#FFF" />
                </LinearGradient>
                <View style={styles.statTextArea}>
                  <Text style={styles.statValueSmall}>Bilimsel</Text>
                  <Text style={styles.statLabel}>Temelli</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <LinearGradient colors={['#EC4899', '#F472B6']} style={styles.statIconBg}>
                  <FileText size={18} color="#FFF" />
                </LinearGradient>
                <View style={styles.statTextArea}>
                  <Text style={styles.statValueSmall}>Kapsamlı</Text>
                  <Text style={styles.statLabel}>Rapor</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <LinearGradient colors={['#10B981', '#34D399']} style={styles.statIconBg}>
                  <Shield size={18} color="#FFF" />
                </LinearGradient>
                <View style={styles.statTextArea}>
                  <Text style={styles.statValueSmall}>Gizlilik</Text>
                  <Text style={styles.statLabel}>Öncelikli</Text>
                </View>
              </View>
            </View>

            {/* Analysis Progress Stepper */}
            <View style={styles.stepperContainer}>
              <AnalysisStepper currentStep={currentAnalysisStep} />
            </View>

            {/* Test Selector Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Test Seçimi</Text>
              <Pressable onPress={() => openSheet(task)} style={styles.sectionAction}>
                <Info size={16} color="#6366F1" />
                <Text style={styles.sectionActionText}>Protokol</Text>
              </Pressable>
            </View>

            {/* Horizontal Test Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testCarousel}
            >
              {TASK_TYPES.map(t => {
                const config = TEST_CONFIG[t];
                const isActive = task === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => onSelectTest(t)}
                    style={({ pressed }) => [
                      styles.testCard,
                      isActive && styles.testCardActive,
                      pressed && { transform: [{ scale: 0.96 }] },
                    ]}
                  >
                    <LinearGradient
                      colors={isActive ? config.gradient : ['#F8FAFC', '#F1F5F9']}
                      style={styles.testCardGradient}
                    >
                      <Text style={styles.testCardIcon}>{config.icon}</Text>
                      <Text style={[styles.testCardName, isActive && styles.testCardNameActive]}>
                        {t}
                      </Text>
                      <Text
                        style={[styles.testCardDesc, isActive && styles.testCardDescActive]}
                        numberOfLines={1}
                      >
                        {config.description}
                      </Text>
                      {/* Duration & Difficulty Badges */}
                      <View style={styles.testCardBadges}>
                        <View
                          style={[styles.testCardBadge, isActive && styles.testCardBadgeActive]}
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
                            config.difficulty === 'Kolay' && styles.testCardBadgeEasy,
                            config.difficulty === 'Orta' && styles.testCardBadgeMedium,
                            config.difficulty === 'Zor' && styles.testCardBadgeHard,
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
                          <CheckCircle size={16} color="#FFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Selected Test Info Card */}
            <View style={styles.selectedTestCard}>
              <LinearGradient
                colors={TEST_CONFIG[task].gradient}
                style={styles.selectedTestGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.selectedTestContent}>
                  <View style={styles.selectedTestLeft}>
                    <Text style={styles.selectedTestIcon}>{TEST_CONFIG[task].icon}</Text>
                    <View>
                      <Text style={styles.selectedTestName}>{PROTOCOLS[task].title}</Text>
                      <Text style={styles.selectedTestMeta}>
                        {PROTOCOLS[task].ageRange} • {PROTOCOLS[task].duration}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => openSheet(task)} style={styles.selectedTestButton}>
                    <FileText size={16} color="#FFF" />
                    <Text style={styles.selectedTestButtonText}>Protokol</Text>
                    <ChevronRight size={14} color="#FFF" />
                  </Pressable>
                </View>
                <Text style={styles.selectedTestInstruction} numberOfLines={2}>
                  {`"${PROTOCOLS[task].phases[0]?.instruction}"`}
                </Text>
              </LinearGradient>
            </View>

            {/* Child Info Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Çocuk Bilgileri</Text>
            </View>

            <View style={styles.childInfoCard}>
              <View style={styles.childInfoRow}>
                <View style={styles.ageInputContainer}>
                  <Text style={styles.inputLabel}>Yaş</Text>
                  <View style={styles.ageInputWrapper}>
                    <TextInput
                      value={age}
                      onChangeText={setAge}
                      keyboardType="number-pad"
                      style={styles.ageInput}
                      maxLength={2}
                    />
                    <Text style={styles.ageUnit}>yaş</Text>
                  </View>
                </View>
                <View style={styles.quoteInputContainer}>
                  <Text style={styles.inputLabel}>Çocuğun Sözleri (Opsiyonel)</Text>
                  <TextInput
                    value={quote}
                    onChangeText={setQuote}
                    placeholder='"Bu ben ve annem..."'
                    placeholderTextColor="#94A3B8"
                    style={styles.quoteInput}
                    multiline
                  />
                </View>
              </View>
            </View>

            {/* Image Upload Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Görseller</Text>
              {requiredCount > 0 && (
                <View style={styles.uploadProgress}>
                  <Text style={styles.uploadProgressText}>
                    {uploadedCount}/{requiredCount}
                  </Text>
                  <View style={styles.uploadProgressBar}>
                    <View
                      style={[
                        styles.uploadProgressFill,
                        { width: `${Math.min((uploadedCount / requiredCount) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            {requiredImages.length > 0 ? (
              <View style={styles.imageGrid}>
                {requiredImages.map((slot, index) => {
                  const hasImage = !!imageUris[slot.id];
                  return (
                    <View key={slot.id} style={styles.imageCard}>
                      <View style={styles.imageCardHeader}>
                        <View style={styles.imageCardNumber}>
                          <Text style={styles.imageCardNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.imageCardMeta}>
                          <Text style={styles.imageCardLabel}>{slot.label}</Text>
                          {slot.optional ? (
                            <Text style={styles.imageCardOptional}>Opsiyonel</Text>
                          ) : (
                            <Text style={styles.imageCardRequired}>Zorunlu</Text>
                          )}
                        </View>
                        {hasImage && (
                          <Pressable
                            onPress={() => clearImage(slot.id)}
                            style={styles.imageCardClear}
                          >
                            <X size={16} color="#EF4444" />
                          </Pressable>
                        )}
                      </View>

                      {slot.description && (
                        <Text style={styles.imageCardDescription}>{slot.description}</Text>
                      )}

                      {hasImage ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image
                            source={{ uri: imageUris[slot.id] }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          <View style={styles.imagePreviewOverlay}>
                            <CheckCircle size={24} color="#10B981" />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.imageUploadArea}>
                          <View style={styles.uploadDashedBorder}>
                            <ImageIcon size={32} color="#94A3B8" />
                            <Text style={styles.uploadText}>Görsel yükle</Text>
                            <View style={styles.uploadButtons}>
                              <Pressable
                                onPress={() => onPickFromLibrary(slot.id)}
                                style={({ pressed }) => [
                                  styles.uploadButton,
                                  styles.uploadButtonGallery,
                                  pressed && { opacity: 0.8 },
                                ]}
                              >
                                <ImageIcon size={16} color="#6366F1" />
                                <Text style={styles.uploadButtonText}>Galeri</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => onCaptureWithCamera(slot.id)}
                                style={({ pressed }) => [
                                  styles.uploadButton,
                                  styles.uploadButtonCamera,
                                  pressed && { opacity: 0.8 },
                                ]}
                              >
                                <Camera size={16} color="#64748B" />
                                <Text style={styles.uploadButtonTextDark}>Kamera</Text>
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
                <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.noImageGradient}>
                  <View style={styles.noImageIcon}>
                    <Star size={24} color="#10B981" />
                  </View>
                  <Text style={styles.noImageTitle}>Görsel Gerekmiyor</Text>
                  <Text style={styles.noImageText}>
                    Bu test görsel yükleme gerektirmez. Renk seçim sırasını not alarak devam edin.
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Analyze Button */}
            <Animated.View
              style={[styles.analyzeButtonContainer, { transform: [{ scale: pulseAnim }] }]}
            >
              <Pressable
                disabled={!hasRequiredImages || loading}
                onPress={onAnalyze}
                style={({ pressed }) => [
                  styles.analyzeButtonWrapper,
                  (!hasRequiredImages || loading) && styles.analyzeButtonDisabled,
                  pressed && hasRequiredImages && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <LinearGradient
                  colors={hasRequiredImages ? ['#6366F1', '#8B5CF6'] : ['#94A3B8', '#CBD5E1']}
                  style={styles.analyzeButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Sparkles size={24} color="#FFF" />
                      <Text style={styles.analyzeButtonText}>
                        {hasRequiredImages
                          ? 'AI Analizi Başlat'
                          : `${requiredCount - uploadedCount} görsel daha yükle`}
                      </Text>
                    </>
                  )}
                </LinearGradient>
                {hasRequiredImages && <View style={styles.analyzeButtonShine} />}
              </Pressable>
            </Animated.View>

            {/* Results Section */}
            {result && (
              <View style={styles.resultsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Analiz Sonuçları</Text>
                  <Pressable onPress={onShare} style={styles.shareButton}>
                    <Share2 size={16} color="#6366F1" />
                    <Text style={styles.shareButtonText}>Paylaş</Text>
                  </Pressable>
                </View>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <ResultCard data={result as any} onDetails={() => {}} />

                <View style={styles.disclaimerCard}>
                  <View style={styles.disclaimerHeader}>
                    <AlertTriangle size={18} color="#F59E0B" />
                    <Text style={styles.disclaimerTitle}>Önemli Uyarı</Text>
                  </View>
                  <Text style={styles.disclaimerText}>{strings[lang].legacy.disclaimer}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      )}

      {/* Premium Bottom Sheet */}
      {sheetOpen && (
        <>
          <Pressable onPress={closeSheet} style={styles.sheetOverlayTouchable}>
            <Animated.View style={[styles.sheetOverlay, { opacity: overlayOpacity }]} />
          </Pressable>
          <Animated.View
            style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
              style={styles.sheetGradient}
            >
              <View style={styles.sheetHandleContainer}>
                <View style={styles.sheetHandle} />
              </View>

              <View style={styles.sheetHeader}>
                <LinearGradient
                  colors={TEST_CONFIG[sheetTask].gradient}
                  style={styles.sheetHeaderIcon}
                >
                  <Text style={styles.sheetHeaderEmoji}>{TEST_CONFIG[sheetTask].icon}</Text>
                </LinearGradient>
                <View style={styles.sheetHeaderText}>
                  <Text style={styles.sheetTitle}>{PROTOCOLS[sheetTask].title}</Text>
                  <Text style={styles.sheetSubtitle}>
                    {PROTOCOLS[sheetTask].ageRange} • {PROTOCOLS[sheetTask].duration}
                  </Text>
                </View>
                <Pressable onPress={closeSheet} style={styles.sheetCloseIcon}>
                  <X size={20} color="#64748B" />
                </Pressable>
              </View>

              <ScrollView
                style={styles.sheetScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetScrollContent}
              >
                {/* Materials */}
                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>📦 Materyaller</Text>
                  <View style={styles.sheetMaterialsGrid}>
                    {PROTOCOLS[sheetTask].materials.map((m: string, i: number) => (
                      <View key={i} style={styles.materialChip}>
                        <Text style={styles.materialChipText}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Phases */}
                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>📋 Uygulama Aşamaları</Text>
                  {PROTOCOLS[sheetTask].phases.map((phase, i: number) => (
                    <View key={i} style={styles.phaseCard}>
                      <View style={styles.phaseHeader}>
                        <View style={styles.phaseNumber}>
                          <Text style={styles.phaseNumberText}>{i + 1}</Text>
                        </View>
                        <View style={styles.phaseMeta}>
                          <Text style={styles.phaseName}>{phase.name}</Text>
                          {phase.duration && (
                            <Text style={styles.phaseDuration}>{phase.duration}</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.phaseInstruction}>{`"${phase.instruction}"`}</Text>
                      {phase.notes && phase.notes.length > 0 && (
                        <View style={styles.phaseNotes}>
                          {phase.notes.map((note: string, j: number) => (
                            <Text key={j} style={styles.phaseNote}>
                              → {note}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {/* Observations */}
                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>👁️ Gözlem Noktaları</Text>
                  {PROTOCOLS[sheetTask].observations.map((o: string, i: number) => (
                    <View key={i} style={styles.observationItem}>
                      <View style={styles.observationDot} />
                      <Text style={styles.observationText}>{o}</Text>
                    </View>
                  ))}
                </View>

                {/* Don'ts */}
                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>⚠️ Yapılmaması Gerekenler</Text>
                  {PROTOCOLS[sheetTask].donts.map((d: string, i: number) => (
                    <View key={i} style={styles.dontItem}>
                      <X size={14} color="#EF4444" />
                      <Text style={styles.dontText}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Capture Hints */}
                {PROTOCOLS[sheetTask].captureHints?.length > 0 && (
                  <View style={styles.sheetSection}>
                    <Text style={styles.sheetSectionTitle}>📸 Fotoğraf İpuçları</Text>
                    {PROTOCOLS[sheetTask].captureHints.map((c: string, i: number) => (
                      <View key={i} style={styles.hintItem}>
                        <Camera size={14} color="#6366F1" />
                        <Text style={styles.hintText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Scoring Notes */}
                {PROTOCOLS[sheetTask]?.scoringNotes &&
                  PROTOCOLS[sheetTask].scoringNotes.length > 0 && (
                    <View style={styles.sheetSection}>
                      <Text style={styles.sheetSectionTitle}>📊 Skorlama Notları</Text>
                      {PROTOCOLS[sheetTask].scoringNotes?.map((s: string, i: number) => (
                        <View key={i} style={styles.scoringItem}>
                          <Award size={14} color="#F59E0B" />
                          <Text style={styles.scoringText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
              </ScrollView>

              <View style={styles.sheetFooter}>
                <Pressable
                  onPress={() => {
                    onTaskChange(sheetTask);
                    closeSheet();
                  }}
                  style={styles.sheetSelectButton}
                >
                  <LinearGradient
                    colors={TEST_CONFIG[sheetTask].gradient}
                    style={styles.sheetSelectButtonGradient}
                  >
                    <CheckCircle size={18} color="#FFF" />
                    <Text style={styles.sheetSelectButtonText}>Bu Testi Seç</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Floating Orbs
  floatingOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  orb1: {
    width: 200,
    height: 200,
    top: -50,
    right: -60,
  },
  orb2: {
    width: 150,
    height: 150,
    top: 200,
    left: -50,
  },
  orb3: {
    width: 120,
    height: 120,
    bottom: 200,
    right: -30,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 999,
  },

  // Premium Header
  premiumHeader: {
    marginBottom: 20,
  },
  headerGlassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.lg,
  },
  headerGlassGradient: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerIconWrapper: {
    position: 'relative',
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  headerIconGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    opacity: 0.3,
  },
  headerTextArea: {
    flex: 1,
  },
  premiumHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  premiumHeaderSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    ...shadows.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextArea: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  statValueSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  // Analysis Stepper
  stepperContainer: {
    marginTop: 16,
    marginBottom: 8,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sectionActionText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },

  // Test Carousel
  testCarousel: {
    paddingVertical: 4,
    paddingRight: 20,
    gap: 12,
  },
  testCard: {
    width: 125,
    borderRadius: 16,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  testCardNameActive: {
    color: '#FFF',
  },
  testCardDesc: {
    fontSize: 10,
    color: '#64748B',
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
  testCardBadgeEasy: {
    // Green tint for easy
  },
  testCardBadgeMedium: {
    // Orange tint for medium
  },
  testCardBadgeHard: {
    // Red tint for hard
  },
  testCardBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
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
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
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
  },
  selectedTestIcon: {
    fontSize: 36,
  },
  selectedTestName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  selectedTestMeta: {
    fontSize: 12,
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
    borderRadius: 12,
  },
  selectedTestButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  selectedTestInstruction: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Child Info
  childInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  ageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    width: 56,
    textAlign: 'center',
  },
  ageUnit: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  quoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 48,
    fontWeight: '500',
  },

  // Image Upload Section
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadProgressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  uploadProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },

  imageGrid: {
    gap: 14,
  },
  imageCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
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
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCardNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  imageCardMeta: {
    flex: 1,
  },
  imageCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  imageCardOptional: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  imageCardRequired: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
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
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadDashedBorder: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  uploadText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '500',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  uploadButtonGallery: {
    backgroundColor: '#EEF2FF',
  },
  uploadButtonCamera: {
    backgroundColor: '#F1F5F9',
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  uploadButtonTextDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  // No Image Card
  noImageCard: {
    borderRadius: 20,
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
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...shadows.sm,
  },
  noImageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 6,
  },
  noImageText: {
    fontSize: 13,
    color: '#16A34A',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Analyze Button
  analyzeButtonContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  analyzeButtonWrapper: {
    borderRadius: 20,
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
    opacity: 0.7,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  analyzeButtonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  // Results Section
  resultsSection: {
    marginTop: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  disclaimerCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#A16207',
    lineHeight: 18,
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
    backgroundColor: '#0F172A',
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
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sheetCloseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
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
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  sheetMaterialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materialChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  materialChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  phaseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
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
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  phaseMeta: {
    flex: 1,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  phaseDuration: {
    fontSize: 11,
    color: '#6366F1',
    marginTop: 2,
    fontWeight: '500',
  },
  phaseInstruction: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  phaseNotes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  phaseNote: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#6366F1',
    marginTop: 5,
  },
  observationText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  dontItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
  },
  dontText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 20,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 20,
  },
  scoringItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
  },
  scoringText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  sheetFooter: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sheetSelectButton: {
    borderRadius: 16,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
