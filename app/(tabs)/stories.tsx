import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import {
  BookOpen,
  Calendar,
  FileText,
  Sparkles,
  Plus,
  ImagePlus,
  Wand2,
  Trash2,
  Gamepad2,
} from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  textShadows,
  zIndex,
} from '@/constants/design-system';
import { trpc } from '@/lib/trpc';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuotaExceededModal } from '@/components/quota/QuotaExceededModal';
import { useQuota } from '@/hooks/useQuota';
import { useToastHelpers } from '@/components/ui/Toast';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChild } from '@/lib/contexts/ChildContext';
import { ChildSelectorChip } from '@/components/ChildSelectorChip';
import { IooEmptyState, EMPTY_STATE_PRESETS } from '@/components/IooEmptyState';
import { showAlert, showConfirmDialog } from '@/lib/platform';
import { StoryLoadingProgress } from '@/components/stories/StoryLoadingProgress';
import { StoryModeSelector } from '@/components/stories/StoryModeSelector';
import { ThemeSuggestionPanel } from '@/components/stories/ThemeSuggestionPanel';
import { ContentWarningModal } from '@/components/stories/ContentWarningModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

type Storybook = {
  id: string;
  title: string;
  pages: { text: string; img_url: string }[];
  pdf_url?: string | null;
  voice_urls?: string[] | null;
  created_at: string;
  user_id?: string | null;
};

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { selectedChild, setSelectedChild, children: userChildren, hasChildren } = useChild();

  // Get child info with defaults
  const childAge = selectedChild?.age || 5;
  const childGender = selectedChild?.gender; // 'male' | 'female'
  const [refreshing, setRefreshing] = useState(false);

  // Create storybook states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  // Quota
  const { shouldShowLowWarning, refetch: refetchQuota } = useQuota();
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const { warning: showWarningToast } = useToastHelpers();

  // Theme suggestion states
  type ThemeSuggestion = {
    title: string;
    theme: string;
    emoji: string;
  };
  // Comprehensive concern types based on ACEs (Adverse Childhood Experiences) and pediatric psychology
  type ConcernType =
    // Original categories
    | 'war'
    | 'violence'
    | 'disaster'
    | 'loss'
    | 'loneliness'
    | 'fear'
    | 'abuse'
    | 'family_separation'
    | 'death'
    // ACEs Framework categories
    | 'neglect'
    | 'bullying'
    | 'domestic_violence_witness'
    | 'parental_addiction'
    | 'parental_mental_illness'
    // Pediatric psychology categories
    | 'medical_trauma'
    | 'anxiety'
    | 'depression'
    | 'low_self_esteem'
    | 'anger'
    | 'school_stress'
    | 'social_rejection'
    // Additional categories
    | 'displacement'
    | 'poverty'
    | 'cyberbullying'
    | 'other';

  type ContentAnalysis = {
    hasConcerningContent: boolean;
    concernType?: ConcernType | null;
    concernDescription?: string | null;
    therapeuticApproach?: string | null;
  };

  // Human-readable labels for concern types (Turkish) - Based on ACEs framework
  const concernTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
    // Original categories
    war: { label: 'Savaş / Çatışma', emoji: '🕊️', color: Colors.neutral.medium },
    violence: { label: 'Şiddet', emoji: '💪', color: Colors.semantic.errorBold },
    disaster: { label: 'Doğal Afet', emoji: '🌈', color: Colors.semantic.amber },
    loss: { label: 'Kayıp / Ayrılık', emoji: '💝', color: Colors.secondary.violet },
    loneliness: { label: 'Yalnızlık', emoji: '🤗', color: '#3B82F6' },
    fear: { label: 'Korku', emoji: '⭐', color: Colors.semantic.successBold },
    abuse: { label: 'İstismar', emoji: '🛡️', color: '#EC4899' },
    family_separation: { label: 'Aile Ayrılığı', emoji: '❤️', color: '#F97316' },
    death: { label: 'Ölüm / Yas', emoji: '🦋', color: Colors.secondary.indigo },
    // ACEs Framework categories
    neglect: { label: 'İhmal', emoji: '🏠', color: Colors.secondary.violet },
    bullying: { label: 'Akran Zorbalığı', emoji: '🤝', color: Colors.semantic.amber },
    domestic_violence_witness: {
      label: 'Aile İçi Şiddete Tanıklık',
      emoji: '🏡',
      color: Colors.semantic.errorBold,
    },
    parental_addiction: {
      label: 'Ebeveyn Bağımlılığı',
      emoji: '🌱',
      color: Colors.semantic.successBold,
    },
    parental_mental_illness: { label: 'Ebeveyn Ruhsal Hastalığı', emoji: '💙', color: '#3B82F6' },
    // Pediatric psychology categories
    medical_trauma: { label: 'Tıbbi Travma', emoji: '🏥', color: '#06B6D4' },
    anxiety: { label: 'Kaygı', emoji: '🌿', color: '#22C55E' },
    depression: { label: 'Depresyon Belirtileri', emoji: '🌻', color: '#EAB308' },
    low_self_esteem: { label: 'Düşük Öz Saygı', emoji: '✨', color: '#A855F7' },
    anger: { label: 'Öfke', emoji: '🧘', color: '#F97316' },
    school_stress: { label: 'Okul Stresi', emoji: '📚', color: Colors.secondary.indigo },
    social_rejection: { label: 'Sosyal Dışlanma', emoji: '🌟', color: '#EC4899' },
    // Additional categories
    displacement: { label: 'Göç / Yerinden Edilme', emoji: '🏠', color: '#14B8A6' },
    poverty: { label: 'Ekonomik Zorluk', emoji: '💎', color: '#78716C' },
    cyberbullying: { label: 'Siber Zorbalık', emoji: '📱', color: Colors.secondary.violet },
    // Fallback
    other: { label: 'Diğer', emoji: '💜', color: Colors.neutral.gray400 },
  };
  const [themeSuggestions, setThemeSuggestions] = useState<ThemeSuggestion[]>([]);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [contentWarning, setContentWarning] = useState<ContentAnalysis | null>(null);
  const [showContentWarningModal, setShowContentWarningModal] = useState(false);
  // V2: Store visual description from theme suggestions - CRITICAL for story-drawing connection
  const [visualDescription, setVisualDescription] = useState<string | null>(null);

  // Image analysis loading state - show nice animation while analyzing
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<
    'uploading' | 'analyzing' | 'generating' | 'done'
  >('uploading');

  // Story mode: normal or interactive
  type StoryMode = 'normal' | 'interactive';
  const [storyMode, setStoryMode] = useState<StoryMode>('normal');

  // Hayal Atölyesi'nden gelen imageUri'yi otomatik kullan
  useEffect(() => {
    if (params.imageUri && typeof params.imageUri === 'string') {
      setShowCreateForm(true); // Form'u otomatik aç

      // Blob URL için analiz sürecini başlat
      if (params.imageUri.startsWith('blob:')) {
        analyzeAndPrepareImage(params.imageUri);
      } else {
        setStoryImage(params.imageUri);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.imageUri]);

  // Görsel analiz ve tema önerisi akışı
  async function analyzeAndPrepareImage(imageUri: string) {
    try {
      setAnalyzingImage(true);
      setAnalysisStep('uploading');
      console.log('[Stories] 📤 Step 1: Uploading image...');

      // Simulate upload delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisStep('analyzing');
      console.log('[Stories] 🔍 Step 2: Analyzing drawing...');

      // Convert blob to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64String = result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setAnalysisStep('generating');
      console.log('[Stories] ✨ Step 3: Generating theme suggestions...');

      const userLang = (user?.language || 'tr') as 'tr' | 'en';

      const result = await suggestThemesMutation.mutateAsync({
        imageBase64: base64,
        language: userLang,
      });

      console.log('[Stories] ✅ Got', result.suggestions.length, 'theme suggestions');

      // V2: Store visual description for story-drawing connection
      if (result.visualDescription) {
        console.log('[Stories] 🎨 Visual description:', result.visualDescription);
        setVisualDescription(result.visualDescription);
      } else {
        console.log('[Stories] ⚠️ No visual description received');
        setVisualDescription(null);
      }

      // Check for concerning content
      if (result.contentAnalysis?.hasConcerningContent) {
        console.log('[Stories] ⚠️ Concerning content detected:', result.contentAnalysis);
        setContentWarning(result.contentAnalysis);
        setShowContentWarningModal(true);
      }

      setAnalysisStep('done');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Now show everything together
      setStoryImage(imageUri);
      setThemeSuggestions(result.suggestions);
      setSelectedThemeIndex(null);
      setStoryTitle('');
    } catch (error) {
      console.error('[Stories] ❌ Error in image analysis:', error);
      // Still show the image even if suggestions fail
      setStoryImage(imageUri);
      setThemeSuggestions([]);
    } finally {
      setAnalyzingImage(false);
    }
  }

  // Blob URL'den tema önerileri almak için ayrı fonksiyon (galeri için)
  async function _fetchThemeSuggestionsFromBlob(blobUri: string) {
    try {
      setLoadingSuggestions(true);
      console.log('[Stories] 🎨 Fetching theme suggestions from blob...');

      // Convert blob to base64
      const response = await fetch(blobUri);
      const blob = await response.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64String = result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const userLang = (user?.language || 'tr') as 'tr' | 'en';

      const result = await suggestThemesMutation.mutateAsync({
        imageBase64: base64,
        language: userLang,
      });

      console.log('[Stories] ✅ Got', result.suggestions.length, 'theme suggestions from blob');

      // V2: Store visual description for story-drawing connection
      if (result.visualDescription) {
        console.log('[Stories] 🎨 Visual description from blob:', result.visualDescription);
        setVisualDescription(result.visualDescription);
      } else {
        setVisualDescription(null);
      }

      // Check for concerning content
      if (result.contentAnalysis?.hasConcerningContent) {
        console.log('[Stories] ⚠️ Concerning content detected:', result.contentAnalysis);
        setContentWarning(result.contentAnalysis);
        setShowContentWarningModal(true);
      }

      setThemeSuggestions(result.suggestions);
      setSelectedThemeIndex(null);
      setStoryTitle('');
    } catch (error) {
      console.error('[Stories] ❌ Error fetching theme suggestions from blob:', error);
      // Don't show alert, just continue without suggestions
      setThemeSuggestions([]);
      setVisualDescription(null);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  // Progress tracking for multi-step generation
  const [progress, setProgress] = useState({
    step: 0,
    total: 4,
    message: '',
    percentage: 0,
  });

  const normalSteps = [
    { name: 'analyze', message: 'Çizim analiz ediliyor...', icon: '🔍', duration: 5 },
    { name: 'story', message: 'Hikaye yazılıyor...', icon: '✍️', duration: 15 },
    { name: 'images', message: 'Görseller oluşturuluyor...', icon: '🎨', duration: 20 },
    { name: 'finalize', message: 'PDF hazırlanıyor...', icon: '📄', duration: 5 },
  ];

  const interactiveSteps = [
    { name: 'analyze', message: 'Çizim analiz ediliyor...', icon: '🔍', duration: 5 },
    { name: 'branches', message: 'Hikaye dalları oluşturuluyor...', icon: '🎮', duration: 20 },
    { name: 'finalize', message: 'Seçenekler hazırlanıyor...', icon: '✨', duration: 10 },
  ];

  // Use the appropriate steps based on story mode
  const steps = storyMode === 'interactive' ? interactiveSteps : normalSteps;

  const createStorybookMutation = trpc.studio.createStorybook.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setStoryTitle('');
      setStoryImage(null);
      refetch();
    },
  });

  const deleteStorybookMutation = trpc.studio.deleteStorybook.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Mutations for story generation flow
  const analyzeDrawingMutation = trpc.studio.analyzeDrawing.useMutation();
  const generateStoryMutation = trpc.studio.generateStoryFromDrawing.useMutation();
  const suggestThemesMutation = trpc.studio.suggestStoryThemes.useMutation();
  const generateInteractiveStoryMutation = trpc.interactiveStory.generate.useMutation();

  // Fetch storybooks from backend
  const {
    data: storybooks,
    isLoading,
    error,
    refetch,
  } = trpc.studio.listStorybooks.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  async function pickStoryImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.length) {
      const imageUri = res.assets[0].uri;
      setStoryImage(imageUri);

      // Auto-fetch theme suggestions
      await fetchThemeSuggestions(imageUri);
    }
  }

  async function fetchThemeSuggestions(imageUri: string) {
    try {
      setLoadingSuggestions(true);
      console.log('[Stories] 🎨 Fetching theme suggestions...');

      let base64: string;

      // Web: Use fetch + FileReader for blob/http URLs
      if (Platform.OS === 'web' || imageUri.startsWith('blob:') || imageUri.startsWith('http')) {
        console.log('[Stories] 🌐 Using web-compatible base64 conversion...');
        const response = await fetch(imageUri);
        const blob = await response.blob();

        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64String = result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Native: Use FileSystem for file:// URLs
        console.log('[Stories] 📱 Using native FileSystem...');
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const userLang = (user?.language || 'tr') as 'tr' | 'en';

      const result = await suggestThemesMutation.mutateAsync({
        imageBase64: base64,
        language: userLang,
      });

      console.log('[Stories] ✅ Got', result.suggestions.length, 'theme suggestions');

      // V2: Store visual description for story-drawing connection
      if (result.visualDescription) {
        console.log('[Stories] 🎨 Visual description:', result.visualDescription);
        setVisualDescription(result.visualDescription);
      } else {
        setVisualDescription(null);
      }

      // Check for concerning content
      if (result.contentAnalysis?.hasConcerningContent) {
        console.log('[Stories] ⚠️ Concerning content detected:', result.contentAnalysis);
        setContentWarning(result.contentAnalysis);
        setShowContentWarningModal(true);
      }

      setThemeSuggestions(result.suggestions);
      setSelectedThemeIndex(null); // Reset selection
      setStoryTitle(''); // Clear manual title
    } catch (error) {
      console.error('[Stories] ❌ Error fetching theme suggestions:', error);
      showAlert('Hata', 'Tema önerileri alınamadı. Lütfen başlığı kendiniz yazın.');
      setThemeSuggestions([]);
      setVisualDescription(null);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleStorybook() {
    if (!storyImage) {
      showAlert('Lütfen önce bir görsel seç.');
      return;
    }

    // Low quota warning (session-based, once)
    if (shouldShowLowWarning()) {
      showWarningToast('Jetonlarınız azalıyor');
    }

    // Determine final title: selected theme > manual title > auto-generated
    let finalTitle: string;
    if (selectedThemeIndex !== null && themeSuggestions[selectedThemeIndex]) {
      finalTitle = themeSuggestions[selectedThemeIndex].title;
    } else if (storyTitle.trim()) {
      finalTitle = storyTitle.trim();
    } else {
      finalTitle = `Benim Masalım ${new Date().toLocaleDateString('tr-TR')}`;
    }

    // If interactive mode is selected, proceed directly to interactive story creation
    if (storyMode === 'interactive') {
      proceedWithInteractiveStory(finalTitle);
      return;
    }

    // Check for sensitive content in title
    const sensitiveKeywords = [
      'savaş',
      'savaşan',
      'savaştaki',
      'silah',
      'kan',
      'ölüm',
      'öldürme',
      'vurmak',
      'döv',
      'şiddet',
      'kavga',
      'çatışma',
      'bomba',
      'patlama',
      'war',
      'weapon',
      'blood',
      'death',
      'kill',
      'fight',
      'violence',
      'deprem',
      'earthquake',
      'travma',
      'trauma',
      'korkuyor',
      'afraid',
    ];

    // Also check for therapeutic intent keywords
    const therapeuticIndicators = [
      'etkilenmiş',
      'gördü',
      'yaşadı',
      'çok kötü',
      'üzgün',
      'affected',
      'witnessed',
      'experienced',
      'very bad',
      'sad',
    ];

    const titleLower = finalTitle.toLowerCase();
    const hasSensitiveContent = sensitiveKeywords.some(keyword => titleLower.includes(keyword));
    const hasTherapeuticIntent = therapeuticIndicators.some(indicator =>
      titleLower.includes(indicator)
    );

    if (hasSensitiveContent || hasTherapeuticIntent) {
      // Using a custom modal would be better here, but for now we'll use a simplified approach
      // Since showConfirmDialog only supports 2 buttons, we'll default to therapeutic tale
      showConfirmDialog(
        '💛 Özel Masal Önerisi',
        'Başlığınızda hassas konular tespit ettik. Çocuğunuz için özel tasarlanmış iki seçeneğimiz var:\n\n✨ TERAPÖTIK MASAL\nDuyguları işlemeye yardımcı, metaforik anlatım, umut odaklı sonuç\n\n📖 NORMAL MASAL  \nHayal gücü odaklı, eğlenceli macera\n\n💡 İPUCU: Travmatik konularda terapötik masalları öneriyoruz.',
        () => proceedWithStorybook(true, finalTitle),
        () => proceedWithStorybook(false, finalTitle),
        { confirmText: 'Terapötik Masal (Önerilen)', cancelText: 'Normal Masal' }
      );
      return;
    }

    proceedWithStorybook(false, finalTitle);
  }

  // Handle interactive story creation
  async function proceedWithInteractiveStory(title: string) {
    try {
      setLoadingStory(true);
      setProgress({
        step: 1,
        total: 3,
        message: 'İnteraktif hikaye oluşturuluyor...',
        percentage: 33,
      });

      console.log('[Stories] 🎮 Creating interactive story...');

      // Convert image to base64
      let imageBase64 = '';
      if (storyImage!.startsWith('blob:')) {
        const response = await fetch(storyImage!);
        const blob = await response.blob();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64String = result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const cleanUri = storyImage!.replace(/^file:\/\//, '');
        let fileUri = cleanUri;
        if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
          fileUri = `file://${fileUri}`;
        }
        imageBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: 'base64',
        });
      }

      setProgress({
        step: 2,
        total: 3,
        message: 'Hikaye dalları oluşturuluyor...',
        percentage: 66,
      });

      const userLang = (user?.language || 'tr') as 'tr' | 'en';

      // Prepare therapeutic context if content warning exists
      const therapeuticContext =
        contentWarning?.hasConcerningContent && contentWarning?.concernType
          ? {
              concernType: contentWarning.concernType,
              therapeuticApproach: contentWarning.therapeuticApproach || 'Genel terapötik yaklaşım',
            }
          : undefined;

      // Call interactive story generation
      const result = await generateInteractiveStoryMutation.mutateAsync({
        imageBase64,
        childAge: childAge,
        childName: selectedChild?.name,
        language: userLang,
        selectedTheme:
          selectedThemeIndex !== null && themeSuggestions[selectedThemeIndex]
            ? themeSuggestions[selectedThemeIndex].theme
            : title,
        therapeuticContext,
      });

      setProgress({
        step: 3,
        total: 3,
        message: 'Tamamlandı!',
        percentage: 100,
      });

      console.log('[Stories] ✅ Interactive story created:', result.sessionId);

      // Reset form state
      setShowCreateForm(false);
      setStoryTitle('');
      setStoryImage(null);
      setThemeSuggestions([]);
      setSelectedThemeIndex(null);
      setVisualDescription(null);
      setStoryMode('normal');
      await refetch();

      // Navigate to interactive story screen
      router.push({
        pathname: '/interactive-story/[id]',
        params: { id: result.sessionId },
      });
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const trpcCode = (e as any)?.data?.code || (e as any)?.code;
      if (trpcCode === 'FORBIDDEN' || (e instanceof Error && e.message.includes('quota'))) {
        setShowQuotaModal(true);
        refetchQuota();
      } else {
        const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu';
        showConfirmDialog(
          'Hata',
          errorMessage,
          () => proceedWithInteractiveStory(title),
          undefined,
          { confirmText: 'Tekrar Dene', cancelText: 'Vazgeç' }
        );
      }
    } finally {
      setLoadingStory(false);
    }
  }

  async function proceedWithStorybook(therapeuticMode: boolean = false, title: string) {
    try {
      setLoadingStory(true);
      // Reset progress
      setProgress({
        step: 0,
        total: 4,
        message: steps[0].message,
        percentage: 0,
      });

      console.log('[Stories] Creating storybook with therapeutic mode:', therapeuticMode);

      // Get user's language preference for story content
      const userLang = (user?.language || 'tr') as 'tr' | 'en';
      const isTurkish = userLang === 'tr';

      if (therapeuticMode) {
        // Therapeutic stories use special template-based approach
        const CONSISTENT_STYLE =
          "Children's storybook illustration, soft pastel watercolor, simple rounded shapes, warm friendly atmosphere, plain light background, same character design, same art style, VERY IMPORTANT: NO TEXT NO LETTERS NO WORDS on image";
        let pages: { text: string; prompt: string }[];
        // Therapeutic story generation with metaphorical transformation
        console.log('[Stories] Using therapeutic story structure');

        if (isTurkish) {
          pages = [
            // Phase 1: VALIDATION
            {
              text: `${title} başlıyor. Bazen hayat zor olabilir ve bu normal.`,
              prompt: `${CONSISTENT_STYLE}. Opening scene: safe place, understanding characters, accepting atmosphere. Theme: ${title}`,
            },
            {
              text: 'Küçük kahramanımız zor günler geçirdi, ama yalnız değildi.',
              prompt: `${CONSISTENT_STYLE}. Scene: safe space, supportive characters, together, help`,
            },
            // Phase 2: PROCESSING
            {
              text: 'Büyük fırtına geldiğinde, güçlü olmayı öğrendi.',
              prompt: `${CONSISTENT_STYLE}. Nature metaphor: storm, wind, but sunlight visible, transformation, hope`,
            },
            {
              text: 'Arkadaşları yardım etti ve birlikte daha güçlü oldular.',
              prompt: `${CONSISTENT_STYLE}. Scene: friendship, togetherness, support, strength`,
            },
            {
              text: 'Zaman geçtikçe, fırtına sakinleşmeye başladı.',
              prompt: `${CONSISTENT_STYLE}. Scene: peace, calm, transformation, healing`,
            },
            // Phase 3: INTEGRATION
            {
              text: 'Artık gökkuşağı gökyüzünde parlıyordu. Umut hep vardı.',
              prompt: `${CONSISTENT_STYLE}. Scene: rainbow in sky, sun, bright colors, hope, happiness`,
            },
            {
              text: 'Ve böylece, güçlü ve cesur bir kalple yeni günlere hazır oldular.',
              prompt: `${CONSISTENT_STYLE}. Closing scene: happiness, safe future, peace, love, family`,
            },
          ];
        } else {
          pages = [
            // Phase 1: VALIDATION
            {
              text: `${title} begins. Sometimes life can be hard, and that's okay.`,
              prompt: `${CONSISTENT_STYLE}. Opening scene: safe place, understanding characters, accepting atmosphere. Theme: ${title}`,
            },
            {
              text: 'Our little hero had difficult days, but was not alone.',
              prompt: `${CONSISTENT_STYLE}. Scene: safe space, supportive characters, together, help`,
            },
            // Phase 2: PROCESSING
            {
              text: 'When the great storm came, they learned to be strong.',
              prompt: `${CONSISTENT_STYLE}. Nature metaphor: storm, wind, but sunlight visible, transformation, hope`,
            },
            {
              text: 'Friends helped, and together they became stronger.',
              prompt: `${CONSISTENT_STYLE}. Scene: friendship, togetherness, support, strength`,
            },
            {
              text: 'As time passed, the storm began to calm.',
              prompt: `${CONSISTENT_STYLE}. Scene: peace, calm, transformation, healing`,
            },
            // Phase 3: INTEGRATION
            {
              text: 'Now the rainbow shone in the sky. Hope was always there.',
              prompt: `${CONSISTENT_STYLE}. Scene: rainbow in sky, sun, bright colors, hope, happiness`,
            },
            {
              text: 'And so, with a strong and brave heart, they were ready for new days.',
              prompt: `${CONSISTENT_STYLE}. Closing scene: happiness, safe future, peace, love, family`,
            },
          ];
        }

        // Step 1: Analyze (for therapeutic mode, this is instant)
        setProgress({ step: 1, total: 4, message: steps[0].message, percentage: 25 });

        // Step 2: Generate story structure
        setProgress({ step: 2, total: 4, message: steps[1].message, percentage: 50 });

        // Step 3: Generate images (this happens in the mutation)
        setProgress({ step: 3, total: 4, message: steps[2].message, percentage: 75 });

        // For therapeutic mode, use template-based approach
        const therapeuticResult = await createStorybookMutation.mutateAsync({
          title: title,
          pages,
          lang: userLang,
          makePdf: true,
          makeTts: false, // ❌ TTS kapalı (maliyet + süre)
        });

        // Step 4: Finalize
        setProgress({ step: 4, total: 4, message: steps[3].message, percentage: 100 });

        // Reset form state and navigate
        setShowCreateForm(false);
        setStoryTitle('');
        setStoryImage(null);
        setThemeSuggestions([]);
        setSelectedThemeIndex(null);
        setVisualDescription(null); // V2: Reset visual description
        await refetch();

        // Navigate to the new storybook
        router.push({
          pathname: '/storybook',
          params: {
            storybookId: therapeuticResult.record.id,
            title: title,
            pages: JSON.stringify(therapeuticResult.pages),
            pdfUrl: therapeuticResult.pdf_url || '',
            voiceUrls: JSON.stringify(therapeuticResult.voice_urls || []),
          },
        });
        return; // Exit early, don't show duplicate alert
      } else {
        // ✨ NORMAL STORY: Use AI-powered generation with real scenes!
        console.log('[Stories] 🤖 Using AI-powered story generation from drawing...');

        // Step 1: Convert image to base64 and analyze the drawing
        console.log('[Stories] 🔍 Step 1/4: Analyzing drawing...');
        setProgress({ step: 1, total: 4, message: steps[0].message, percentage: 25 });

        // Convert image URI to base64
        let imageBase64 = '';

        // Web: blob URL handling
        if (storyImage!.startsWith('blob:')) {
          console.log('[Stories] 🌐 Converting blob URL to base64...');
          const response = await fetch(storyImage!);
          const blob = await response.blob();

          // Convert blob to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // Remove data URL prefix (data:image/...;base64,)
              const base64String = result.split(',')[1];
              resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          imageBase64 = base64;
        } else {
          // Native: file:// URL handling
          const cleanUri = storyImage!.replace(/^file:\/\//, '');
          let fileUri = cleanUri;
          if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
            fileUri = `file://${fileUri}`;
          }
          imageBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64',
          });
        }

        // Analyze the drawing (using "Family" as taskType for story generation context)
        const analysisResult = await analyzeDrawingMutation.mutateAsync({
          taskType: 'Family', // Use Family drawing analysis for story context
          childAge: childAge, // Use selected child's age
          childGender: childGender, // Use selected child's gender for developmental context
          imageBase64: imageBase64,
          language: userLang,
          userRole: 'parent',
          featuresJson: {},
        });

        console.log('[Stories] ✅ Drawing analyzed!');

        // Step 2: Generate AI-powered story from drawing analysis
        console.log('[Stories] 📝 Step 2/4: Generating AI-powered story...');
        setProgress({ step: 2, total: 4, message: steps[1].message, percentage: 50 });

        // Prepare therapeutic context if content warning exists
        const therapeuticContext =
          contentWarning?.hasConcerningContent && contentWarning?.concernType
            ? {
                concernType: contentWarning.concernType,
                therapeuticApproach:
                  contentWarning.therapeuticApproach || 'Genel terapötik yaklaşım',
              }
            : undefined;

        // V2: Log visual description - this connects story to drawing
        console.log(
          '[Stories] 🎨 Visual description for story:',
          visualDescription?.substring(0, 100) || 'NONE'
        );

        const storyResult = await generateStoryMutation.mutateAsync({
          drawingAnalysis: analysisResult,
          childAge: childAge, // Use selected child's age
          childGender: childGender, // Use selected child's gender for character
          language: userLang,
          drawingTitle: title,
          makePdf: true,
          makeTts: false, // ❌ TTS kapalı (maliyet + süre)
          therapeuticContext, // Pass therapeutic context for trauma-informed storytelling
          // V2: Pass visual description for story-drawing connection
          visualDescription: visualDescription || undefined, // What AI sees in the drawing
        });

        console.log('[Stories] ✅ AI story generated!', {
          title: storyResult.story.title,
          characterName: storyResult.story.mainCharacter.name,
          pagesCount: storyResult.story.pages.length,
        });

        // Step 3: Images (already generated in previous step, but show progress)
        setProgress({ step: 3, total: 4, message: steps[2].message, percentage: 75 });

        // Step 4: Finalize
        setProgress({ step: 4, total: 4, message: steps[3].message, percentage: 100 });

        // Refetch to show the new story in the list
        await refetch();

        // Reset form state
        setShowCreateForm(false);
        setStoryTitle('');
        setStoryImage(null);
        setThemeSuggestions([]);
        setSelectedThemeIndex(null);
        setVisualDescription(null); // V2: Reset visual description

        // Navigate to the new storybook
        router.push({
          pathname: '/storybook',
          params: {
            storybookId: storyResult.id,
            title: storyResult.story.title,
            pages: JSON.stringify(storyResult.storybook.pages),
            pdfUrl: storyResult.storybook.pdf_url || '',
            voiceUrls: JSON.stringify(storyResult.storybook.voice_urls || []),
          },
        });
      }

      // Note: Navigation is handled above for both therapeutic and normal modes
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const trpcCode = (e as any)?.data?.code || (e as any)?.code;
      if (trpcCode === 'FORBIDDEN' || (e instanceof Error && e.message.includes('quota'))) {
        setShowQuotaModal(true);
        refetchQuota();
      } else {
        const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu';
        showConfirmDialog('Hata', errorMessage, handleStorybook, undefined, {
          confirmText: 'Tekrar Dene',
          cancelText: 'Vazgeç',
        });
      }
    } finally {
      setLoadingStory(false);
    }
  }

  const handleStorybookPress = (storybook: Storybook) => {
    console.log('[Stories] Storybook card pressed:', storybook.title);
    console.log('[Stories] Storybook data:', {
      id: storybook.id,
      pagesCount: storybook.pages?.length,
      hasPdf: !!storybook.pdf_url,
      hasVoice: !!storybook.voice_urls?.length,
    });

    // Navigate to storybook viewer with the storybook data
    router.push({
      pathname: '/storybook',
      params: {
        storybookId: storybook.id,
        title: storybook.title,
        pages: JSON.stringify(storybook.pages),
        pdfUrl: storybook.pdf_url || '',
        voiceUrls: JSON.stringify(storybook.voice_urls || []),
      },
    });
  };

  const handleDeleteStorybook = (storybookId: string, storybookTitle: string) => {
    showConfirmDialog(
      'Masalı Sil',
      `"${storybookTitle}" adlı masalı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      () => {
        deleteStorybookMutation.mutate({ storybookId });
      },
      undefined,
      { confirmText: 'Sil', cancelText: 'Vazgeç', destructive: true }
    );
  };

  const renderStoryCard = (storybook: Storybook) => {
    const firstPageImage = storybook.pages?.[0]?.img_url;
    const pageCount = storybook.pages?.length || 0;
    const createdDate = new Date(storybook.created_at).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const renderRightActions = () => (
      <View style={styles.swipeDeleteContainer}>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteStorybook(storybook.id, storybook.title)}
        >
          <Trash2 size={24} color={Colors.neutral.white} />
          <Text style={styles.deleteButtonText}>Sil</Text>
        </Pressable>
      </View>
    );

    return (
      <Swipeable key={storybook.id} renderRightActions={renderRightActions} overshootRight={false}>
        <Pressable
          style={({ pressed }) => [
            styles.storyCard,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => handleStorybookPress(storybook)}
        >
          <LinearGradient
            colors={[...colors.cards.story.bg] as [string, string, ...string[]]}
            style={styles.cardGradient}
          >
            <View
              style={[styles.cardImageContainer, { backgroundColor: colors.background.primary }]}
            >
              {firstPageImage ? (
                <Image
                  source={{ uri: firstPageImage }}
                  style={styles.cardImage}
                  contentFit="contain"
                />
              ) : (
                <View
                  style={[
                    styles.cardImagePlaceholder,
                    { backgroundColor: colors.neutral.lightest },
                  ]}
                >
                  <BookOpen size={layout.icon.large} color={colors.cards.story.icon} />
                </View>
              )}
              {storybook.pdf_url && (
                <LinearGradient
                  colors={[colors.secondary.lavender, colors.secondary.lavenderLight]}
                  style={styles.pdfBadge}
                >
                  <FileText size={14} color={Colors.neutral.white} />
                  <Text style={styles.pdfBadgeText}>PDF</Text>
                </LinearGradient>
              )}
            </View>

            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.neutral.darkest }]} numberOfLines={2}>
                {storybook.title}
              </Text>

              <View style={styles.cardMeta}>
                <View style={styles.cardMetaItem}>
                  <FileText size={14} color={colors.neutral.medium} />
                  <Text style={[styles.cardMetaText, { color: colors.neutral.medium }]}>
                    {pageCount} sayfa
                  </Text>
                </View>

                <View style={styles.cardMetaItem}>
                  <Calendar size={14} color={colors.neutral.medium} />
                  <Text style={[styles.cardMetaText, { color: colors.neutral.medium }]}>
                    {createdDate}
                  </Text>
                </View>
              </View>

              {storybook.voice_urls && storybook.voice_urls.length > 0 && (
                <View style={[styles.featureBadge, { backgroundColor: colors.primary.soft }]}>
                  <Sparkles size={12} color={colors.cards.story.icon} />
                  <Text style={[styles.featureBadgeText, { color: colors.cards.story.icon }]}>
                    Sesli Masal
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <IooEmptyState
      {...EMPTY_STATE_PRESETS.noStories}
      action={{
        label: 'Masal Oluştur',
        onPress: () => setShowCreateForm(true),
      }}
    />
  );

  const renderError = () => (
    <IooEmptyState
      {...EMPTY_STATE_PRESETS.error}
      message={error?.message || 'Masallar yüklenirken bir sorun oluştu.'}
      action={{
        label: 'Tekrar Dene',
        onPress: () => refetch(),
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <LinearGradient
        colors={[...colors.background.stories] as [string, string, ...string[]]}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <LinearGradient
              colors={[colors.secondary.sunshine, colors.cards.story.border]}
              style={styles.headerIcon}
            >
              <BookOpen size={layout.icon.medium} color={Colors.neutral.white} />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.neutral.darkest }]}>Masallar</Text>
              <Text style={[styles.headerSubtitle, { color: colors.neutral.medium }]}>
                {storybooks && storybooks.length > 0
                  ? `${storybooks.length} masal kitabı`
                  : 'Masal koleksiyonunuz'}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                { backgroundColor: colors.primary.sunset },
                pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
              ]}
              onPress={() => {
                console.log('[Stories] + button pressed');
                setShowCreateForm(!showCreateForm);
              }}
            >
              <Plus size={24} color={Colors.neutral.white} />
            </Pressable>
          </View>
        </View>

        {/* Create Story Form / Loading Animation */}
        {showCreateForm && loadingStory ? (
          <StoryLoadingProgress progress={progress} steps={steps} storyMode={storyMode} />
        ) : showCreateForm && analyzingImage ? (
          /* Image Analysis Loading Animation */
          <LinearGradient
            colors={[...colors.cards.story.bg] as [string, string, ...string[]]}
            style={styles.analysisLoadingContainer}
          >
            <View style={styles.analysisLoadingContent}>
              <View style={styles.analysisStepsContainer}>
                {/* Step 1: Uploading */}
                <View
                  style={[
                    styles.analysisStepItem,
                    analysisStep === 'uploading' && styles.analysisStepActive,
                    (analysisStep === 'analyzing' ||
                      analysisStep === 'generating' ||
                      analysisStep === 'done') &&
                      styles.analysisStepCompleted,
                  ]}
                >
                  <Text style={styles.analysisStepIcon}>
                    {analysisStep === 'analyzing' ||
                    analysisStep === 'generating' ||
                    analysisStep === 'done'
                      ? '✓'
                      : '📤'}
                  </Text>
                  <Text style={styles.analysisStepText}>Yükleniyor</Text>
                </View>

                <View style={styles.analysisStepLine} />

                {/* Step 2: Analyzing */}
                <View
                  style={[
                    styles.analysisStepItem,
                    analysisStep === 'analyzing' && styles.analysisStepActive,
                    (analysisStep === 'generating' || analysisStep === 'done') &&
                      styles.analysisStepCompleted,
                  ]}
                >
                  <Text style={styles.analysisStepIcon}>
                    {analysisStep === 'generating' || analysisStep === 'done' ? '✓' : '🔍'}
                  </Text>
                  <Text style={styles.analysisStepText}>Analiz Ediliyor</Text>
                </View>

                <View style={styles.analysisStepLine} />

                {/* Step 3: Generating */}
                <View
                  style={[
                    styles.analysisStepItem,
                    analysisStep === 'generating' && styles.analysisStepActive,
                    analysisStep === 'done' && styles.analysisStepCompleted,
                  ]}
                >
                  <Text style={styles.analysisStepIcon}>
                    {analysisStep === 'done' ? '✓' : '✨'}
                  </Text>
                  <Text style={styles.analysisStepText}>Temalar Hazırlanıyor</Text>
                </View>
              </View>

              <ActivityIndicator
                size="large"
                color={colors.cards.story.icon}
                style={{ marginTop: spacing['4'] }}
              />

              <Text style={[styles.analysisLoadingTitle, { color: colors.neutral.darkest }]}>
                {analysisStep === 'uploading' && '📤 Çizim yükleniyor...'}
                {analysisStep === 'analyzing' && '🔍 Çizim analiz ediliyor...'}
                {analysisStep === 'generating' && '✨ Masal temaları hazırlanıyor...'}
                {analysisStep === 'done' && '🎉 Hazır!'}
              </Text>

              <Text style={[styles.analysisLoadingSubtitle, { color: colors.neutral.medium }]}>
                AI çiziminizi inceleyip size özel masal temaları öneriyor
              </Text>
            </View>
          </LinearGradient>
        ) : showCreateForm ? (
          <>
            <ScrollView
              style={styles.createFormScrollView}
              contentContainerStyle={styles.createFormScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <LinearGradient
                colors={[...colors.cards.story.bg] as [string, string, ...string[]]}
                style={styles.createFormContainer}
              >
                <View style={styles.createFormHeader}>
                  <Wand2 size={24} color={colors.cards.story.icon} />
                  <Text style={[styles.createFormTitle, { color: colors.neutral.darkest }]}>
                    Yeni Masal Oluştur
                  </Text>
                </View>
                <Text style={[styles.createFormDescription, { color: colors.neutral.medium }]}>
                  Çocuğunuzun çizimlerinden ilham alan özel bir masal kitabı oluşturun
                </Text>

                {/* Story Mode Toggle - Normal vs Interactive */}
                <StoryModeSelector
                  storyMode={storyMode}
                  onModeChange={setStoryMode}
                  colors={colors}
                  isDark={isDark}
                />

                {/* Child Selector - Show which child the story is for */}
                <View
                  style={[
                    styles.childSelectorSection,
                    { backgroundColor: isDark ? colors.surface.card : 'rgba(255, 255, 255, 0.6)' },
                  ]}
                >
                  <Text style={[styles.childSelectorLabel, { color: colors.neutral.dark }]}>
                    Bu masal kimin için?
                  </Text>
                  <ChildSelectorChip
                    selectedChild={selectedChild}
                    childrenList={userChildren}
                    onSelectChild={child => setSelectedChild(child)}
                  />
                  {selectedChild && (
                    <Text style={[styles.childSelectorHint, { color: colors.secondary.grass }]}>
                      Hikaye {selectedChild.age} yaş için
                      {selectedChild.gender
                        ? ` (${selectedChild.gender === 'male' ? 'erkek' : 'kız'} karakter)`
                        : ''}{' '}
                      oluşturulacak
                    </Text>
                  )}
                  {!selectedChild && !hasChildren && (
                    <Text style={[styles.childSelectorWarning, { color: colors.neutral.medium }]}>
                      💡 Profil sayfasından çocuk ekleyerek kişiselleştirilmiş hikayeler
                      oluşturabilirsiniz
                    </Text>
                  )}
                </View>

                {/* Image Preview - Show first if image exists */}
                {storyImage && (
                  <View style={styles.imagePreviewWrapper}>
                    <Image
                      source={{ uri: storyImage }}
                      style={styles.imagePreview}
                      contentFit="contain"
                    />
                    <View style={styles.imagePreviewBadge}>
                      <Text style={styles.imagePreviewBadgeText}>✓ Görsel Yüklendi</Text>
                    </View>
                  </View>
                )}

                {/* AI Theme Suggestions - Show prominently when image exists */}
                {loadingSuggestions && (
                  <View
                    style={[
                      styles.suggestionsLoading,
                      { backgroundColor: colors.neutral.lightest },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.cards.story.icon} />
                    <Text style={[styles.suggestionsLoadingText, { color: colors.neutral.medium }]}>
                      🎨 Çizim analiz ediliyor, tema önerileri hazırlanıyor...
                    </Text>
                  </View>
                )}

                {!loadingSuggestions && themeSuggestions.length > 0 && (
                  <ThemeSuggestionPanel
                    suggestions={themeSuggestions}
                    selectedIndex={selectedThemeIndex}
                    onSelect={index => {
                      setSelectedThemeIndex(index);
                      setStoryTitle('');
                    }}
                    storyTitle={storyTitle}
                    colors={colors}
                  />
                )}

                {/* Manual title input - Alternative to theme selection */}
                <View style={styles.manualTitleSection}>
                  <Text style={[styles.manualTitleLabel, { color: colors.neutral.dark }]}>
                    {themeSuggestions.length > 0
                      ? 'Ya da kendi başlığınızı yazın:'
                      : 'Masal başlığı:'}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? colors.surface.card : 'rgba(255, 255, 255, 0.95)',
                        color: colors.neutral.darkest,
                        borderColor: isDark ? colors.border.light : 'rgba(255, 255, 255, 0.8)',
                      },
                      selectedThemeIndex !== null && styles.inputDisabledLook,
                    ]}
                    placeholder="Örn: Orman Macerası, Uzay Yolculuğu..."
                    placeholderTextColor={colors.neutral.light}
                    value={storyTitle}
                    onChangeText={text => {
                      setStoryTitle(text);
                      // Clear theme selection when user types manually
                      if (text.trim() && selectedThemeIndex !== null) {
                        setSelectedThemeIndex(null);
                      }
                    }}
                  />
                </View>

                {/* Status indicator */}
                {storyImage && (
                  <View style={styles.statusIndicator}>
                    {selectedThemeIndex !== null || storyTitle.trim() ? (
                      <Text style={[styles.statusReady, { color: colors.secondary.mint }]}>
                        ✅ Masal oluşturmaya hazır!
                      </Text>
                    ) : (
                      <Text style={[styles.statusWaiting, { color: colors.secondary.sunshine }]}>
                        👆 Yukarıdan bir tema seçin veya başlık yazın
                      </Text>
                    )}
                  </View>
                )}

                <Pressable
                  onPress={() => {
                    console.log('[Stories] Pick image button pressed');
                    pickStoryImage();
                  }}
                  style={({ pressed }) => [
                    styles.pickButton,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <LinearGradient
                    colors={[colors.neutral.medium, colors.neutral.dark]}
                    style={styles.buttonGradient}
                  >
                    <ImagePlus size={20} color={Colors.neutral.white} />
                    <Text style={styles.buttonText}>
                      {storyImage ? 'Farklı Görsel Seç' : 'İlham Görseli Seç'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </LinearGradient>
            </ScrollView>

            {/* Fixed Create Story Button - Always visible at bottom */}
            <View style={styles.fixedButtonContainer}>
              {/* Debug: Show button state */}
              {__DEV__ && (
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.neutral.medium,
                    textAlign: 'center',
                    marginBottom: 4,
                  }}
                >
                  [Debug] Image: {storyImage ? '✓' : '✗'} | Loading: {loadingStory ? '✓' : '✗'} |
                  Disabled: {!storyImage || loadingStory ? '✓' : '✗'}
                </Text>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  console.log('[Stories] 🔴 CREATE BUTTON PRESSED!');
                  console.log('[Stories] storyImage:', !!storyImage, storyImage?.substring(0, 50));
                  console.log('[Stories] storyTitle:', storyTitle);
                  console.log('[Stories] loadingStory:', loadingStory);
                  console.log('[Stories] selectedThemeIndex:', selectedThemeIndex);
                  console.log('[Stories] storyMode:', storyMode);

                  if (!storyImage) {
                    console.log('[Stories] ❌ No storyImage - button should be disabled!');
                    showAlert('Hata', 'Görsel bulunamadı. Lütfen tekrar deneyin.');
                    return;
                  }

                  handleStorybook();
                }}
                disabled={!storyImage || loadingStory}
                style={[
                  styles.createStoryButtonFixed,
                  (!storyImage || loadingStory) && styles.buttonDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    !storyImage || loadingStory
                      ? [colors.neutral.light, colors.neutral.medium]
                      : storyMode === 'interactive'
                        ? ['#9333EA', '#7C3AED']
                        : [colors.secondary.sunshine, colors.cards.story.border]
                  }
                  style={styles.buttonGradientLarge}
                >
                  {loadingStory ? (
                    <ActivityIndicator size="small" color={Colors.neutral.white} />
                  ) : storyMode === 'interactive' ? (
                    <Gamepad2 size={24} color={Colors.neutral.white} />
                  ) : (
                    <Sparkles size={24} color={Colors.neutral.white} />
                  )}
                  <Text style={styles.buttonTextLarge}>
                    {loadingStory
                      ? storyMode === 'interactive'
                        ? 'İnteraktif Masal Oluşturuluyor...'
                        : 'Masal Oluşturuluyor...'
                      : storyMode === 'interactive'
                        ? '🎮 İnteraktif Masal Oluştur'
                        : '✨ Masal Oluştur'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* Content - Hidden when create form is open */}
        {showCreateForm ? null : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.sunset} />
            <Text style={[styles.loadingText, { color: colors.neutral.medium }]}>
              Masallar yükleniyor...
            </Text>
          </View>
        ) : error ? (
          renderError()
        ) : !storybooks || storybooks.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary.sunset}
                colors={[colors.primary.sunset]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {storybooks.map(storybook => renderStoryCard(storybook))}
          </ScrollView>
        )}

        {/* Content Warning Modal for Parents */}
        <ContentWarningModal
          visible={showContentWarningModal}
          contentWarning={contentWarning}
          onClose={() => setShowContentWarningModal(false)}
          colors={colors}
          isDark={isDark}
          concernTypeLabels={concernTypeLabels}
        />
      </LinearGradient>

      <QuotaExceededModal visible={showQuotaModal} onClose={() => setShowQuotaModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing['4'],
    gap: spacing['4'],
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  headerIcon: {
    width: layout.icon.mega,
    height: layout.icon.mega,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
    ...textShadows.sm,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
    marginTop: spacing['1'],
    fontFamily: typography.family.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    gap: spacing['4'],
  },
  storyCard: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...shadows.lg,
  },
  cardGradient: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.primary,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
  },
  pdfBadge: {
    position: 'absolute',
    top: spacing['3'],
    right: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    ...shadows.md,
  },
  pdfBadgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  cardContent: {
    padding: isSmallDevice ? spacing['3'] : spacing['4'],
    gap: spacing['3'],
  },
  cardTitle: {
    fontSize: isSmallDevice ? typography.size.lg : typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    lineHeight:
      typography.lineHeight.snug * (isSmallDevice ? typography.size.lg : typography.size.xl),
    ...textShadows.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    flexWrap: 'wrap',
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  cardMetaText: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.soft,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.lg,
  },
  featureBadgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.cards.story.icon,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing['4'],
    padding: spacing['8'],
  },
  loadingText: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['10'],
  },
  emptyContent: {
    alignItems: 'center',
    gap: spacing['4'],
    maxWidth: 320,
  },
  emptyTitle: {
    fontSize: isSmallDevice ? typography.size.xl : typography.size['2xl'],
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    ...textShadows.sm,
  },
  emptyDescription: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight:
      typography.lineHeight.relaxed * (isSmallDevice ? typography.size.sm : typography.size.base),
  },
  retryButton: {
    marginTop: spacing['2'],
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['3'],
    backgroundColor: Colors.primary.sunset,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  retryButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  createButton: {
    width: layout.icon.huge + 16,
    height: layout.icon.huge + 16,
    borderRadius: radius.full,
    backgroundColor: Colors.primary.sunset,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  createFormScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.65, // Limit height to ensure button is visible
  },
  createFormScrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing['4'],
  },
  createFormContainer: {
    padding: isSmallDevice ? spacing['5'] : spacing['6'],
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.xl,
  },
  createFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['2'],
  },
  createFormTitle: {
    fontSize: isSmallDevice ? typography.size.lg : typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    ...textShadows.sm,
  },
  createFormDescription: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
    marginBottom: spacing['4'],
    lineHeight:
      typography.lineHeight.normal * (isSmallDevice ? typography.size.xs : typography.size.sm),
  },
  // Child Selector Styles
  childSelectorSection: {
    marginBottom: spacing['4'],
    padding: spacing['4'],
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 155, 122, 0.3)',
  },
  childSelectorLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
  },
  childSelectorHint: {
    fontSize: typography.size.xs,
    color: Colors.secondary.grass,
    marginTop: spacing['2'],
    fontFamily: typography.family.medium,
  },
  childSelectorWarning: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    marginTop: spacing['2'],
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.lg,
    padding: isSmallDevice ? spacing['3'] : spacing['4'],
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.darkest,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing['3'],
    fontFamily: typography.family.medium,
  },
  imagePreviewWrapper: {
    marginBottom: spacing['3'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
  },
  imagePreviewBadge: {
    position: 'absolute',
    top: spacing['2'],
    right: spacing['2'],
    backgroundColor: Colors.secondary.mint,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  },
  imagePreviewBadgeText: {
    color: Colors.neutral.white,
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
  },
  manualTitleSection: {
    marginTop: spacing['2'],
    marginBottom: spacing['2'],
  },
  manualTitleLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    fontFamily: typography.family.medium,
    marginBottom: spacing['2'],
  },
  inputDisabledLook: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  statusIndicator: {
    alignItems: 'center',
    paddingVertical: spacing['2'],
    marginBottom: spacing['2'],
  },
  statusReady: {
    fontSize: typography.size.sm,
    color: Colors.secondary.mint,
    fontFamily: typography.family.bold,
  },
  statusWaiting: {
    fontSize: typography.size.sm,
    color: Colors.secondary.sunshine,
    fontFamily: typography.family.medium,
  },
  // ThemeSuggestionPanel title/badge styles moved to @/components/stories/ThemeSuggestionPanel.tsx
  pickButton: {
    marginBottom: spacing['2'],
  },
  createStoryButton: {
    marginBottom: spacing['2'],
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['5'],
    borderRadius: radius.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: isSmallDevice ? typography.size.sm : typography.size.md,
    fontFamily: typography.family.semibold,
    ...textShadows.sm,
  },
  progressContainer: {
    marginTop: spacing['4'],
    padding: spacing['4'],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    gap: spacing['3'],
  },
  progressTitle: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    ...textShadows.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary.sunshine,
    borderRadius: radius.full,
  },
  progressPercentage: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.cards.story.icon,
    textAlign: 'center',
  },
  progressMessage: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.dark,
    textAlign: 'center',
    fontFamily: typography.family.medium,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing['2'],
  },
  progressStepItem: {
    alignItems: 'center',
    gap: spacing['2'],
    flex: 1,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
  },
  stepIconCompleted: {
    backgroundColor: Colors.secondary.mint + '40',
  },
  stepIconActive: {
    backgroundColor: Colors.secondary.sunshine + '40',
  },
  stepIconPending: {
    backgroundColor: Colors.neutral.lightest,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepLabel: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    fontFamily: typography.family.medium,
  },
  stepLabelActive: {
    color: Colors.neutral.darkest,
    fontFamily: typography.family.bold,
  },
  progressFooter: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginTop: spacing['2'],
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing['4'],
  },
  deleteButton: {
    backgroundColor: Colors.semantic.errorBold,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
    borderTopRightRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingHorizontal: spacing['3'],
    gap: spacing['1'],
  },
  deleteButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
  },
  suggestionsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    marginBottom: spacing['3'],
  },
  suggestionsLoadingText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  // ThemeSuggestionPanel card styles moved to @/components/stories/ThemeSuggestionPanel.tsx
  // StoryLoadingProgress styles moved to @/components/stories/StoryLoadingProgress.tsx
  // Analysis Loading Animation Styles
  analysisLoadingContainer: {
    marginHorizontal: layout.screenPadding,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.xl,
  },
  analysisLoadingContent: {
    alignItems: 'center',
    gap: spacing['4'],
  },
  analysisStepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  analysisStepItem: {
    alignItems: 'center',
    gap: spacing['2'],
    opacity: 0.4,
  },
  analysisStepActive: {
    opacity: 1,
  },
  analysisStepCompleted: {
    opacity: 1,
  },
  analysisStepIcon: {
    fontSize: 28,
  },
  analysisStepText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    fontFamily: typography.family.medium,
  },
  analysisStepLine: {
    width: 30,
    height: 2,
    backgroundColor: Colors.neutral.light,
    marginHorizontal: spacing['1'],
  },
  analysisLoadingTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginTop: spacing['2'],
  },
  analysisLoadingSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
  },
  // Fixed button container - always visible at bottom
  fixedButtonContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing['3'],
    paddingBottom: spacing['4'],
    backgroundColor: 'transparent',
    zIndex: zIndex.max,
    position: 'relative',
  },
  createStoryButtonFixed: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursor: 'pointer' as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pointerEvents: 'auto' as any, // Ensure button can receive clicks on web
  },
  buttonGradientLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['5'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.xl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pointerEvents: 'none' as any, // Allow clicks to pass through to parent TouchableOpacity
  },
  buttonTextLarge: {
    color: Colors.neutral.white,
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    ...textShadows.md,
  },
  // ContentWarningModal styles moved to @/components/stories/ContentWarningModal.tsx
  // StoryModeSelector styles moved to @/components/stories/StoryModeSelector.tsx
});
