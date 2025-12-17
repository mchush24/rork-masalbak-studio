import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { BookOpen, Calendar, FileText, Sparkles, Plus, ImagePlus, Wand2, Trash2 } from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from "@/constants/design-system";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuth } from "@/lib/hooks/useAuth";

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
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Create storybook states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  // Theme suggestion states
  type ThemeSuggestion = {
    title: string;
    theme: string;
    emoji: string;
  };
  const [themeSuggestions, setThemeSuggestions] = useState<ThemeSuggestion[]>([]);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 🎯 ÇÖZÜM: Hayal Atölyesi'nden gelen imageUri'yi otomatik kullan
  useEffect(() => {
    if (params.imageUri && typeof params.imageUri === 'string') {
      console.log('[Stories] 🖼️ Image received from Hayal Atölyesi:', params.imageUri);
      setStoryImage(params.imageUri);
      setShowCreateForm(true); // Form'u otomatik aç
    }
  }, [params.imageUri]);

  // Progress tracking for multi-step generation
  const [progress, setProgress] = useState({
    step: 0,
    total: 4,
    message: '',
    percentage: 0,
  });

  const steps = [
    { name: 'analyze', message: 'Çizim analiz ediliyor...', icon: '🔍', duration: 5 },
    { name: 'story', message: 'Hikaye yazılıyor...', icon: '✍️', duration: 15 },
    { name: 'images', message: 'Görseller oluşturuluyor...', icon: '🎨', duration: 20 },
    { name: 'finalize', message: 'PDF hazırlanıyor...', icon: '📄', duration: 5 },
  ];

  const createStorybookMutation = trpc.studio.createStorybook.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setStoryTitle("");
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

  // Fetch storybooks from backend
  const {
    data: storybooks,
    isLoading,
    error,
    refetch,
  } = trpc.studio.listStorybooks.useQuery(
    { user_id: user?.userId || null },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  async function pickStoryImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const userLang = (user?.language || 'tr') as 'tr' | 'en';

      const result = await suggestThemesMutation.mutateAsync({
        imageBase64: base64,
        language: userLang,
      });

      console.log('[Stories] ✅ Got', result.suggestions.length, 'theme suggestions');
      setThemeSuggestions(result.suggestions);
      setSelectedThemeIndex(null); // Reset selection
      setStoryTitle(""); // Clear manual title
    } catch (error) {
      console.error('[Stories] ❌ Error fetching theme suggestions:', error);
      Alert.alert("Hata", "Tema önerileri alınamadı. Lütfen başlığı kendiniz yazın.");
      setThemeSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleStorybook() {
    if (!storyImage) {
      Alert.alert("Lütfen önce bir görsel seç.");
      return;
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

    // Check for sensitive content in title
    const sensitiveKeywords = [
      "savaş", "savaşan", "savaştaki", "silah", "kan", "ölüm", "öldürme",
      "vurmak", "döv", "şiddet", "kavga", "çatışma", "bomba", "patlama",
      "war", "weapon", "blood", "death", "kill", "fight", "violence",
      "deprem", "earthquake", "travma", "trauma", "korkuyor", "afraid"
    ];

    // Also check for therapeutic intent keywords
    const therapeuticIndicators = [
      "etkilenmiş", "gördü", "yaşadı", "çok kötü", "üzgün",
      "affected", "witnessed", "experienced", "very bad", "sad"
    ];

    const titleLower = finalTitle.toLowerCase();
    const hasSensitiveContent = sensitiveKeywords.some(keyword =>
      titleLower.includes(keyword)
    );
    const hasTherapeuticIntent = therapeuticIndicators.some(indicator =>
      titleLower.includes(indicator)
    );

    if (hasSensitiveContent || hasTherapeuticIntent) {
      Alert.alert(
        "💛 Özel Masal Önerisi",
        "Başlığınızda hassas konular tespit ettik. Çocuğunuz için özel tasarlanmış iki seçeneğimiz var:\n\n✨ TERAPÖTIK MASAL\nDuyguları işlemeye yardımcı, metaforik anlatım, umut odaklı sonuç\n\n📖 NORMAL MASAL  \nHayal gücü odaklı, eğlenceli macera\n\n💡 İPUCU: Travmatik konularda terapötik masalları öneriyoruz.\n\nHangi masal türünü oluşturalım?",
        [
          {
            text: "Vazgeç",
            style: "cancel",
          },
          {
            text: "Normal Masal",
            onPress: () => proceedWithStorybook(false, finalTitle),
          },
          {
            text: "Terapötik Masal (Önerilen)",
            onPress: () => proceedWithStorybook(true, finalTitle),
          },
        ]
      );
      return;
    }

    proceedWithStorybook(false, finalTitle);
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
        const CONSISTENT_STYLE = "Children's storybook illustration, soft pastel watercolor, simple rounded shapes, warm friendly atmosphere, plain light background, same character design, same art style, VERY IMPORTANT: NO TEXT NO LETTERS NO WORDS on image";
        let pages: Array<{ text: string; prompt: string }>;
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
              text: "Küçük kahramanımız zor günler geçirdi, ama yalnız değildi.",
              prompt: `${CONSISTENT_STYLE}. Scene: safe space, supportive characters, together, help`,
            },
            // Phase 2: PROCESSING
            {
              text: "Büyük fırtına geldiğinde, güçlü olmayı öğrendi.",
              prompt: `${CONSISTENT_STYLE}. Nature metaphor: storm, wind, but sunlight visible, transformation, hope`,
            },
            {
              text: "Arkadaşları yardım etti ve birlikte daha güçlü oldular.",
              prompt: `${CONSISTENT_STYLE}. Scene: friendship, togetherness, support, strength`,
            },
            {
              text: "Zaman geçtikçe, fırtına sakinleşmeye başladı.",
              prompt: `${CONSISTENT_STYLE}. Scene: peace, calm, transformation, healing`,
            },
            // Phase 3: INTEGRATION
            {
              text: "Artık gökkuşağı gökyüzünde parlıyordu. Umut hep vardı.",
              prompt: `${CONSISTENT_STYLE}. Scene: rainbow in sky, sun, bright colors, hope, happiness`,
            },
            {
              text: "Ve böylece, güçlü ve cesur bir kalple yeni günlere hazır oldular.",
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
              text: "Our little hero had difficult days, but was not alone.",
              prompt: `${CONSISTENT_STYLE}. Scene: safe space, supportive characters, together, help`,
            },
            // Phase 2: PROCESSING
            {
              text: "When the great storm came, they learned to be strong.",
              prompt: `${CONSISTENT_STYLE}. Nature metaphor: storm, wind, but sunlight visible, transformation, hope`,
            },
            {
              text: "Friends helped, and together they became stronger.",
              prompt: `${CONSISTENT_STYLE}. Scene: friendship, togetherness, support, strength`,
            },
            {
              text: "As time passed, the storm began to calm.",
              prompt: `${CONSISTENT_STYLE}. Scene: peace, calm, transformation, healing`,
            },
            // Phase 3: INTEGRATION
            {
              text: "Now the rainbow shone in the sky. Hope was always there.",
              prompt: `${CONSISTENT_STYLE}. Scene: rainbow in sky, sun, bright colors, hope, happiness`,
            },
            {
              text: "And so, with a strong and brave heart, they were ready for new days.",
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
        await createStorybookMutation.mutateAsync({
          title: title,
          pages,
          lang: userLang,
          makePdf: true,
          makeTts: false, // ❌ TTS kapalı (maliyet + süre)
          user_id: user?.userId || null,
        });

        // Step 4: Finalize
        setProgress({ step: 4, total: 4, message: steps[3].message, percentage: 100 });
      } else {
        // ✨ NORMAL STORY: Use AI-powered generation with real scenes!
        console.log('[Stories] 🤖 Using AI-powered story generation from drawing...');

        // Step 1: Convert image to base64 and analyze the drawing
        console.log('[Stories] 🔍 Step 1/4: Analyzing drawing...');
        setProgress({ step: 1, total: 4, message: steps[0].message, percentage: 25 });

        // Convert image URI to base64
        let imageBase64 = "";
        let cleanUri = storyImage!.replace(/^file:\/\//, "");
        let fileUri = cleanUri;
        if (!fileUri.startsWith("file://") && !fileUri.startsWith("content://")) {
          fileUri = `file://${fileUri}`;
        }
        imageBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: "base64",
        });

        // Analyze the drawing (using "Family" as taskType for story generation context)
        const analysisResult = await analyzeDrawingMutation.mutateAsync({
          taskType: "Family", // Use Family drawing analysis for story context
          childAge: 5, // Default age, can be made configurable
          imageBase64: imageBase64,
          language: userLang,
          userRole: "parent",
          featuresJson: {},
        });

        console.log('[Stories] ✅ Drawing analyzed!');

        // Step 2: Generate AI-powered story from drawing analysis
        console.log('[Stories] 📝 Step 2/4: Generating AI-powered story...');
        setProgress({ step: 2, total: 4, message: steps[1].message, percentage: 50 });

        const storyResult = await generateStoryMutation.mutateAsync({
          drawingAnalysis: analysisResult,
          childAge: 5, // Default age
          language: userLang,
          drawingTitle: title,
          useV2Generator: true, // Use the advanced generator with few-shot examples!
          makePdf: true,
          makeTts: false, // ❌ TTS kapalı (maliyet + süre)
          user_id: user?.userId || null,
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

        Alert.alert(
          "Masal Hazır! 🎉",
          `"${storyResult.story.title}" adlı masal kitabınız oluşturuldu! Ana karakter: ${storyResult.story.mainCharacter.name}`
        );
      }

      if (therapeuticMode) {
        Alert.alert(
          "Terapötik Masal Hazır!",
          "Özel olarak hazırlanan masal kitabınız oluşturuldu. Bu masal çocuğunuzun duygularını işlemesine yardımcı olacak şekilde tasarlanmıştır."
        );
        await refetch();
      }
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
      pathname: "/storybook",
      params: {
        storybookId: storybook.id,
        title: storybook.title,
        pages: JSON.stringify(storybook.pages),
        pdfUrl: storybook.pdf_url || "",
        voiceUrls: JSON.stringify(storybook.voice_urls || []),
      },
    });
  };

  const handleDeleteStorybook = (storybookId: string, storybookTitle: string) => {
    Alert.alert(
      "Masalı Sil",
      `"${storybookTitle}" adlı masalı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteStorybookMutation.mutate({ storybookId });
          },
        },
      ]
    );
  };

  const renderStoryCard = (storybook: Storybook) => {
    const firstPageImage = storybook.pages?.[0]?.img_url;
    const pageCount = storybook.pages?.length || 0;
    const createdDate = new Date(storybook.created_at).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
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
      <Swipeable
        key={storybook.id}
        renderRightActions={renderRightActions}
        overshootRight={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.storyCard,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => handleStorybookPress(storybook)}
        >
          <LinearGradient
            colors={Colors.cards.story.bg}
            style={styles.cardGradient}
          >
            <View style={styles.cardImageContainer}>
              {firstPageImage ? (
                <Image source={{ uri: firstPageImage }} style={styles.cardImage} contentFit="contain" />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <BookOpen size={layout.icon.large} color={Colors.cards.story.icon} />
                </View>
              )}
              {storybook.pdf_url && (
                <LinearGradient
                  colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                  style={styles.pdfBadge}
                >
                  <FileText size={14} color={Colors.neutral.white} />
                  <Text style={styles.pdfBadgeText}>PDF</Text>
                </LinearGradient>
              )}
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {storybook.title}
              </Text>

              <View style={styles.cardMeta}>
                <View style={styles.cardMetaItem}>
                  <FileText size={14} color={Colors.neutral.medium} />
                  <Text style={styles.cardMetaText}>{pageCount} sayfa</Text>
                </View>

                <View style={styles.cardMetaItem}>
                  <Calendar size={14} color={Colors.neutral.medium} />
                  <Text style={styles.cardMetaText}>{createdDate}</Text>
                </View>
              </View>

              {storybook.voice_urls && storybook.voice_urls.length > 0 && (
                <View style={styles.featureBadge}>
                  <Sparkles size={12} color={Colors.cards.story.icon} />
                  <Text style={styles.featureBadgeText}>Sesli Masal</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <BookOpen size={80} color={Colors.neutral.light} />
        <Text style={styles.emptyTitle}>Henüz masal oluşturulmamış</Text>
        <Text style={styles.emptyDescription}>
          Yukarıdaki + butonuna tıklayarak çocuğunuzun çizimlerinden ilham alan masallar oluşturabilirsiniz.
        </Text>
      </View>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>Bir hata oluştu</Text>
        <Text style={styles.emptyDescription}>
          {error?.message || "Masallar yüklenirken bir sorun oluştu."}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.background.stories}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <LinearGradient
              colors={[Colors.secondary.sunshine, Colors.cards.story.border]}
              style={styles.headerIcon}
            >
              <BookOpen size={layout.icon.medium} color={Colors.neutral.white} />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Masallar</Text>
              <Text style={styles.headerSubtitle}>
                {storybooks && storybooks.length > 0
                  ? `${storybooks.length} masal kitabı`
                  : "Masal koleksiyonunuz"}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
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

        {/* Create Story Form */}
        {showCreateForm && (
          <LinearGradient
            colors={Colors.cards.story.bg}
            style={styles.createFormContainer}
          >
            <View style={styles.createFormHeader}>
              <Wand2 size={24} color={Colors.cards.story.icon} />
              <Text style={styles.createFormTitle}>Yeni Masal Oluştur</Text>
            </View>
            <Text style={styles.createFormDescription}>
              Çocuğunuzun çizimlerinden ilham alan özel bir masal kitabı oluşturun
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Masal başlığı (ör: Orman Macerası)"
              placeholderTextColor={Colors.neutral.light}
              value={storyTitle}
              onChangeText={(text) => {
                setStoryTitle(text);
                // Clear theme selection when user types manually
                if (text.trim() && selectedThemeIndex !== null) {
                  setSelectedThemeIndex(null);
                }
              }}
            />

            {/* AI Theme Suggestions */}
            {loadingSuggestions && (
              <View style={styles.suggestionsLoading}>
                <ActivityIndicator size="small" color={Colors.cards.story.icon} />
                <Text style={styles.suggestionsLoadingText}>AI tema önerileri hazırlanıyor...</Text>
              </View>
            )}

            {!loadingSuggestions && themeSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>💡 AI Tema Önerileri (Seç ya da kendi başlığını yaz)</Text>
                {themeSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setSelectedThemeIndex(index);
                      setStoryTitle(""); // Clear manual title
                    }}
                    style={({ pressed }) => [
                      styles.suggestionCard,
                      selectedThemeIndex === index && styles.suggestionCardSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionTheme}>{suggestion.theme}</Text>
                    </View>
                    {selectedThemeIndex === index && (
                      <Text style={styles.suggestionCheck}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {storyImage && (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: storyImage }} style={styles.imagePreview} contentFit="contain" />
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
                colors={[Colors.neutral.medium, Colors.neutral.dark]}
                style={styles.buttonGradient}
              >
                <ImagePlus size={20} color={Colors.neutral.white} />
                <Text style={styles.buttonText}>
                  {storyImage ? "Farklı Görsel Seç" : "İlham Görseli Seç"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => {
                console.log('[Stories] Create story button pressed');
                console.log('[Stories] storyImage:', !!storyImage);
                console.log('[Stories] storyTitle:', storyTitle);
                console.log('[Stories] loadingStory:', loadingStory);
                handleStorybook();
              }}
              disabled={!storyImage || loadingStory}
              style={({ pressed }) => [
                styles.createStoryButton,
                (!storyImage || loadingStory) && styles.buttonDisabled,
                pressed && !(!storyImage || loadingStory) && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.sunshine, Colors.cards.story.border]}
                style={styles.buttonGradient}
              >
                <Sparkles size={20} color={Colors.neutral.white} />
                <Text style={styles.buttonText}>
                  {loadingStory ? "Masal Oluşturuluyor..." : "Masal Oluştur"}
                </Text>
              </LinearGradient>
            </Pressable>

            {loadingStory && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Masal Oluşturuluyor...</Text>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>{progress.percentage}%</Text>

                {/* Current Step Message */}
                <Text style={styles.progressMessage}>{progress.message}</Text>

                {/* Steps Indicators */}
                <View style={styles.progressSteps}>
                  {steps.map((step, i) => {
                    const stepNumber = i + 1;
                    const isCompleted = stepNumber < progress.step;
                    const isActive = stepNumber === progress.step;
                    const isPending = stepNumber > progress.step;

                    return (
                      <View key={i} style={styles.progressStepItem}>
                        <View style={[
                          styles.stepIconContainer,
                          isCompleted && styles.stepIconCompleted,
                          isActive && styles.stepIconActive,
                          isPending && styles.stepIconPending
                        ]}>
                          <Text style={styles.stepIcon}>
                            {isCompleted ? '✅' : isActive ? step.icon : '⏸️'}
                          </Text>
                        </View>
                        <Text style={[
                          styles.stepLabel,
                          isActive && styles.stepLabelActive
                        ]}>{step.name}</Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.progressFooter}>
                  Bu işlem birkaç dakika sürebilir...
                </Text>
              </View>
            )}
          </LinearGradient>
        )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.sunset} />
          <Text style={styles.loadingText}>Masallar yükleniyor...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : !storybooks || storybooks.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary.sunset}
              colors={[Colors.primary.sunset]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {storybooks.map((storybook) => renderStoryCard(storybook))}
        </ScrollView>
      )}
      </LinearGradient>
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
    paddingVertical: spacing["4"],
    gap: spacing["4"],
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginTop: spacing["1"],
    fontWeight: typography.weight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    gap: spacing["4"],
  },
  storyCard: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
    ...shadows.lg,
  },
  cardGradient: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    backgroundColor: Colors.background.primary,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightest,
  },
  pdfBadge: {
    position: "absolute",
    top: spacing["3"],
    right: spacing["3"],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    ...shadows.md,
  },
  pdfBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  cardContent: {
    padding: spacing["4"],
    gap: spacing["3"],
  },
  cardTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    lineHeight: typography.lineHeight.snug * typography.size.xl,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
    flexWrap: "wrap",
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  cardMetaText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    alignSelf: "flex-start",
    backgroundColor: Colors.primary.soft,
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["2"],
    borderRadius: radius.lg,
  },
  featureBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.cards.story.icon,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["4"],
    padding: spacing["8"],
  },
  loadingText: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing["10"],
  },
  emptyContent: {
    alignItems: "center",
    gap: spacing["4"],
    maxWidth: 320,
  },
  emptyTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.size.base,
  },
  retryButton: {
    marginTop: spacing["2"],
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["3"],
    backgroundColor: Colors.primary.sunset,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  retryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
  },
  createButton: {
    width: layout.icon.huge + 16,
    height: layout.icon.huge + 16,
    borderRadius: radius.full,
    backgroundColor: Colors.primary.sunset,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  createFormContainer: {
    margin: layout.screenPadding,
    padding: spacing["6"],
    borderRadius: radius["2xl"],
    ...shadows.xl,
  },
  createFormHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    marginBottom: spacing["2"],
  },
  createFormTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  createFormDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginBottom: spacing["4"],
    lineHeight: typography.lineHeight.normal * typography.size.sm,
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing["4"],
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
    borderWidth: 2,
    borderColor: Colors.cards.story.border,
    marginBottom: spacing["3"],
    fontWeight: typography.weight.medium,
  },
  imagePreviewWrapper: {
    marginBottom: spacing["3"],
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: radius.lg,
  },
  pickButton: {
    marginBottom: spacing["2"],
  },
  createStoryButton: {
    marginBottom: spacing["2"],
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["5"],
    borderRadius: radius.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  progressContainer: {
    marginTop: spacing["4"],
    padding: spacing["4"],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    gap: spacing["3"],
  },
  progressTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.secondary.sunshine,
    borderRadius: radius.full,
  },
  progressPercentage: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.cards.story.icon,
    textAlign: "center",
  },
  progressMessage: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    textAlign: "center",
    fontWeight: typography.weight.medium,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: spacing["2"],
  },
  progressStepItem: {
    alignItems: "center",
    gap: spacing["2"],
    flex: 1,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightest,
  },
  stepIconCompleted: {
    backgroundColor: Colors.secondary.mint + "40",
  },
  stepIconActive: {
    backgroundColor: Colors.secondary.sunshine + "40",
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
    textAlign: "center",
    fontWeight: typography.weight.medium,
  },
  stepLabelActive: {
    color: Colors.neutral.darkest,
    fontWeight: typography.weight.bold,
  },
  progressFooter: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: "center",
    marginTop: spacing["2"],
  },
  swipeDeleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: spacing["4"],
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
    borderTopRightRadius: radius["2xl"],
    borderBottomRightRadius: radius["2xl"],
    paddingHorizontal: spacing["3"],
    gap: spacing["1"],
  },
  deleteButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  suggestionsLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    padding: spacing["3"],
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    marginBottom: spacing["3"],
  },
  suggestionsLoadingText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  suggestionsContainer: {
    gap: spacing["2"],
    marginBottom: spacing["3"],
  },
  suggestionsTitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing["1"],
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    padding: spacing["3"],
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  suggestionCardSelected: {
    borderColor: Colors.cards.story.border,
    backgroundColor: Colors.cards.story.bg[0] + "20",
  },
  suggestionEmoji: {
    fontSize: 32,
  },
  suggestionContent: {
    flex: 1,
    gap: spacing["1"],
  },
  suggestionTitle: {
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
    fontWeight: typography.weight.bold,
  },
  suggestionTheme: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.normal,
  },
  suggestionCheck: {
    fontSize: 24,
    color: Colors.cards.story.border,
    fontWeight: typography.weight.bold,
  },
});
