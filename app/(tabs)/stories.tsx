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
      "war", "weapon", "blood", "death", "kill", "fight", "violence"
    ];

    const titleLower = storyTitle.toLowerCase();
    const hasSensitiveContent = sensitiveKeywords.some(keyword =>
      titleLower.includes(keyword)
    );

    if (hasSensitiveContent) {
      Alert.alert(
        "Hassas İçerik Tespit Edildi",
        "Masal başlığınızda savaş veya şiddet içerikli kelimeler tespit ettik. Çocuğunuz bu tür konularda çizimler yapıyorsa, 'İleri Analiz' bölümündeki 'Çizim Analizi' özelliğini kullanmanızı öneriyoruz.\n\nYine de masal oluşturmak ister misiniz?",
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
            text: "Devam Et",
            style: "destructive",
            onPress: () => proceedWithStorybook(),
          },
        ]
      );
      return;
    }

    proceedWithStorybook();
  }

  async function proceedWithStorybook() {
    try {
      setLoadingStory(true);

      // TODO: In the future, convert and use the uploaded image for AI story generation
      // Currently using template-based story generation
      // const imageBase64 = await convertImageToBase64(storyImage!);

      // Generate story pages using the uploaded image as inspiration
      // For now, using a simple template. TODO: Integrate with AI to analyze image and generate story
      const pages = [
        {
          text: `${storyTitle} adlı macera başlıyor.`,
          prompt: `soft pastel, çocuk kitabı illüstrasyonu, ${storyTitle}, based on child drawing`,
        },
        {
          text: "Kahramanımız yeni arkadaşlar buldu.",
          prompt: `soft pastel, çocuk kitabı illüstrasyonu, ${storyTitle}, colorful characters`
        },
        {
          text: "Birlikte eğlenceli bir keşfe çıktılar.",
          prompt: `soft pastel, çocuk kitabı illüstrasyonu, ${storyTitle}, adventure scene`
        },
        {
          text: "Harika anılar biriktirdiler.",
          prompt: `soft pastel, çocuk kitabı illüstrasyonu, ${storyTitle}, happy moment`
        },
        {
          text: "Ve mutlu bir şekilde eve döndüler.",
          prompt: `soft pastel, çocuk kitabı illüstrasyonu, ${storyTitle}, ending scene`
        },
      ];

      await createStorybookMutation.mutateAsync({
        title: storyTitle || "Benim Masalım",
        pages,
        lang: "tr",
        makePdf: true,
        makeTts: true,
        user_id: user?.userId || null,
      });

      Alert.alert("Masal hazır!", "Masal kitabınız oluşturuldu.");
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
              onPress={() => setShowCreateForm(!showCreateForm)}
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
              onPress={pickStoryImage}
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
              onPress={handleStorybook}
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
