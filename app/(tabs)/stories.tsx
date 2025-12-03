import React, { useState } from "react";
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
import { BookOpen, Calendar, FileText, Sparkles, Plus, ImagePlus, Wand2 } from "lucide-react-native";
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
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Create storybook states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const createStorybookMutation = trpc.studio.createStorybook.useMutation({
    onSuccess: () => {
      setShowCreateForm(false);
      setStoryTitle("");
      setStoryImage(null);
      refetch();
    },
  });

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
      setStoryImage(res.assets[0].uri);
    }
  }

  async function handleStorybook() {
    if (!storyImage) {
      Alert.alert("Lütfen önce bir görsel seç.");
      return;
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

    const titleLower = storyTitle.toLowerCase();
    const hasSensitiveContent = sensitiveKeywords.some(keyword =>
      titleLower.includes(keyword)
    );
    const hasTherapeuticIntent = therapeuticIndicators.some(indicator =>
      titleLower.includes(indicator)
    );

    if (hasSensitiveContent || hasTherapeuticIntent) {
      Alert.alert(
        "Terapötik Masal Önerisi",
        "Başlığınızda travmatik konular tespit ettik. Bu durumda:\n\n✅ ÖNERİLEN: Size özel, psikolojik destek odaklı bir masal oluşturabiliriz. Bu masallar çocuğunuzun duygularını işlemesine yardımcı olur.\n\n⚠️ VEYA: 'İleri Analiz' bölümünde profesyonel çizim analizi yapabilirsiniz.\n\nNasıl devam etmek istersiniz?",
        [
          {
            text: "İleri Analiz'e Git",
            onPress: () => {
              router.push("/(tabs)/advanced-analysis");
            },
          },
          {
            text: "Vazgeç",
            style: "cancel",
          },
          {
            text: "Terapötik Masal Oluştur",
            onPress: () => proceedWithStorybook(true), // therapeutic mode
          },
        ]
      );
      return;
    }

    proceedWithStorybook(false);
  }

  async function proceedWithStorybook(therapeuticMode: boolean = false) {
    try {
      setLoadingStory(true);

      console.log('[Stories] Creating storybook with therapeutic mode:', therapeuticMode);

      // TODO: In the future, convert and use the uploaded image for AI story generation
      // Currently using template-based story generation
      // const imageBase64 = await convertImageToBase64(storyImage!);

      let pages: Array<{ text: string; prompt: string }>;

      // Get user's language preference for story content
      const userLang = (user?.language || 'tr') as 'tr' | 'en';
      const isTurkish = userLang === 'tr';

      // Consistent style prompt (ALWAYS in English for DALL-E)
      const CONSISTENT_STYLE = "Children's storybook illustration, soft pastel watercolor, simple rounded shapes, warm friendly atmosphere, plain light background, same character design, same art style, VERY IMPORTANT: NO TEXT NO LETTERS NO WORDS on image";

      if (therapeuticMode) {
        // Therapeutic story generation with metaphorical transformation
        console.log('[Stories] Using therapeutic story structure');

        if (isTurkish) {
          pages = [
            // Phase 1: VALIDATION
            {
              text: `${storyTitle} başlıyor. Bazen hayat zor olabilir ve bu normal.`,
              prompt: `${CONSISTENT_STYLE}. Opening scene: safe place, understanding characters, accepting atmosphere. Theme: ${storyTitle}`,
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
              text: `${storyTitle} begins. Sometimes life can be hard, and that's okay.`,
              prompt: `${CONSISTENT_STYLE}. Opening scene: safe place, understanding characters, accepting atmosphere. Theme: ${storyTitle}`,
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
      } else {
        // Normal story generation
        if (isTurkish) {
          pages = [
            {
              text: `${storyTitle} adlı macera başlıyor.`,
              prompt: `${CONSISTENT_STYLE}. Opening scene: adventure begins, child character, ${storyTitle} theme`,
            },
            {
              text: "Kahramanımız yeni arkadaşlar buldu.",
              prompt: `${CONSISTENT_STYLE}. Scene: making new friends, colorful characters, joyful meeting`,
            },
            {
              text: "Birlikte eğlenceli bir keşfe çıktılar.",
              prompt: `${CONSISTENT_STYLE}. Scene: fun exploration together, discovery, adventure`,
            },
            {
              text: "Harika anılar biriktirdiler.",
              prompt: `${CONSISTENT_STYLE}. Scene: happy moments, wonderful memories, joy`,
            },
            {
              text: "Ve mutlu bir şekilde eve döndüler.",
              prompt: `${CONSISTENT_STYLE}. Closing scene: happy return home, peaceful ending`,
            },
          ];
        } else {
          pages = [
            {
              text: `The adventure of ${storyTitle} begins.`,
              prompt: `${CONSISTENT_STYLE}. Opening scene: adventure begins, child character, ${storyTitle} theme`,
            },
            {
              text: "Our hero found new friends.",
              prompt: `${CONSISTENT_STYLE}. Scene: making new friends, colorful characters, joyful meeting`,
            },
            {
              text: "Together they went on a fun exploration.",
              prompt: `${CONSISTENT_STYLE}. Scene: fun exploration together, discovery, adventure`,
            },
            {
              text: "They created wonderful memories.",
              prompt: `${CONSISTENT_STYLE}. Scene: happy moments, wonderful memories, joy`,
            },
            {
              text: "And they happily returned home.",
              prompt: `${CONSISTENT_STYLE}. Closing scene: happy return home, peaceful ending`,
            },
          ];
        }
      }

      // Get user's language preference, default to Turkish
      const userLanguage = (user?.language || 'tr') as 'tr' | 'en';

      await createStorybookMutation.mutateAsync({
        title: storyTitle || (userLanguage === 'tr' ? "Benim Masalım" : "My Story"),
        pages,
        lang: userLanguage,
        makePdf: true,
        makeTts: true,
        user_id: user?.userId || null,
      });

      if (therapeuticMode) {
        Alert.alert(
          "Terapötik Masal Hazır!",
          "Özel olarak hazırlanan masal kitabınız oluşturuldu. Bu masal çocuğunuzun duygularını işlemesine yardımcı olacak şekilde tasarlanmıştır."
        );
      } else {
        Alert.alert("Masal hazır!", "Masal kitabınız oluşturuldu.");
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

  const renderStoryCard = (storybook: Storybook) => {
    const firstPageImage = storybook.pages?.[0]?.img_url;
    const pageCount = storybook.pages?.length || 0;
    const createdDate = new Date(storybook.created_at).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <Pressable
        key={storybook.id}
        style={({ pressed }) => [
          styles.storyCard,
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => handleStorybookPress(storybook)}
      >
        <LinearGradient
          colors={Colors.cards.story.bg as any}
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
        colors={Colors.background.stories as any}
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
            colors={Colors.cards.story.bg as any}
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
              onChangeText={setStoryTitle}
            />

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
              disabled={!storyImage || !storyTitle || loadingStory}
              style={({ pressed }) => [
                styles.createStoryButton,
                (!storyImage || !storyTitle || loadingStory) && styles.buttonDisabled,
                pressed && !(!storyImage || !storyTitle || loadingStory) && { opacity: 0.8, transform: [{ scale: 0.98 }] },
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
              <View style={styles.loadingInfo}>
                <ActivityIndicator size="small" color={Colors.cards.story.icon} />
                <Text style={styles.loadingInfoText}>
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
  loadingInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    marginTop: spacing["2"],
  },
  loadingInfoText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
});
