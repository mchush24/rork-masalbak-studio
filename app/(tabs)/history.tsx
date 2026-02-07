import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
} from "react-native";
import {
  Brain,
  BookOpen,
  Palette,
  Calendar,
  Heart,
  Trash2,
  Download,
  ChevronRight,
  Clock,
  Share2,
} from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Colors } from "@/constants/colors";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from "@/constants/design-system";
import { Image } from "expo-image";
import { IooEmptyState, EMPTY_STATE_PRESETS } from "@/components/IooEmptyState";
import { HistoryStatsCard, HistorySearchBar, HistoryFilters, type DateFilter, type TestTypeFilter } from "@/components/history";
import type { TypedAnalysis, TypedStorybook, Coloring } from "@/types/history";

type TabType = "analyses" | "stories" | "colorings";

type TaskType = "DAP" | "HTP" | "Family" | "Cactus" | "Tree" | "Garden" | "BenderGestalt2" | "ReyOsterrieth" | "Aile" | "Kaktus" | "Agac" | "Bahce" | "Bender" | "Rey" | "Luscher";

export default function HistoryScreen() {
  // Constants - defined inside component
  const TAB_ANALYSES: TabType = "analyses";
  const TAB_STORIES: TabType = "stories";
  const TAB_COLORINGS: TabType = "colorings";

  const TASK_TYPE_LABELS: Record<TaskType, string> = {
    DAP: "İnsan Çizimi",
    HTP: "Ev-Ağaç-İnsan",
    Family: "Aile Çizimi",
    Aile: "Aile Çizimi",
    Cactus: "Kaktüs Testi",
    Kaktus: "Kaktüs Testi",
    Tree: "Ağaç Testi",
    Agac: "Ağaç Testi",
    Garden: "Bahçe Testi",
    Bahce: "Bahçe Testi",
    BenderGestalt2: "Bender Gestalt",
    Bender: "Bender Gestalt",
    ReyOsterrieth: "Rey Figure",
    Rey: "Rey Figure",
    Luscher: "Luscher Renk",
  };

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>(TAB_ANALYSES);
  const [refreshing, setRefreshing] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [testTypeFilter, setTestTypeFilter] = useState<TestTypeFilter>("all");

  // Fetch analyses
  const {
    data: analysesData,
    isLoading: analysesLoading,
    refetch: refetchAnalyses,
  } = trpc.analysis.list.useQuery(
    {
      limit: 50,
      offset: 0,
      favoritedOnly: filterFavorites || undefined,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    { enabled: !!user?.userId && activeTab === TAB_ANALYSES }
  );

  // Fetch storybooks
  const {
    data: storybooks,
    isLoading: storiesLoading,
    refetch: refetchStories,
  } = trpc.studio.listStorybooks.useQuery(
    undefined,
    { enabled: !!user?.userId && activeTab === TAB_STORIES }
  );

  // Fetch colorings
  const {
    data: colorings,
    isLoading: coloringsLoading,
    refetch: refetchColorings,
  } = trpc.studio.listColorings.useQuery(
    undefined,
    { enabled: !!user?.userId && activeTab === TAB_COLORINGS }
  );

  // Mutations
  const updateAnalysisMutation = trpc.analysis.update.useMutation();
  const deleteAnalysisMutation = trpc.analysis.delete.useMutation();
  const deleteStorybookMutation = trpc.studio.deleteStorybook.useMutation();
  const deleteColoringMutation = trpc.studio.deleteColoring.useMutation();
  const generateColoringPDFMutation = trpc.studio.generateColoringPDF.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === TAB_ANALYSES) await refetchAnalyses();
    else if (activeTab === TAB_STORIES) await refetchStories();
    else if (activeTab === TAB_COLORINGS) await refetchColorings();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Bugün";
    if (diffDays === 1) return "Dün";
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
  };

  // Analysis Handlers
  const handleToggleFavorite = async (analysisId: string, currentFavorited: boolean) => {
    try {
      await updateAnalysisMutation.mutateAsync({
        analysisId,
        favorited: !currentFavorited,
      });
      refetchAnalyses();
    } catch (error) {
      Alert.alert("Hata", "Favori durumu değiştirilemedi");
    }
  };

  const handleDeleteAnalysis = (analysisId: string) => {
    Alert.alert(
      t.history.deleteConfirm,
      "Bu analizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: t.history.delete,
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnalysisMutation.mutateAsync({ analysisId });
              refetchAnalyses();
            } catch (error) {
              Alert.alert("Hata", "Analiz silinemedi");
            }
          },
        },
      ]
    );
  };

  const handleViewAnalysis = (analysisId: string) => {
    Alert.alert("Analiz Detayı", "Analiz detay ekranı yakında eklenecek!");
  };

  const handleShareAnalysis = async (analysis: TypedAnalysis) => {
    try {
      const testLabel = TASK_TYPE_LABELS[analysis.task_type as TaskType] || analysis.task_type;
      const message = `Renkioo - ${testLabel} Analizi\n\nTarih: ${formatDate(analysis.created_at)}${
        analysis.child_age ? `\nYaş: ${analysis.child_age}` : ""
      }${
        analysis.analysis_result?.insights?.[0]
          ? `\n\nÖzet: ${analysis.analysis_result.insights[0].summary}`
          : ""
      }\n\nRenkioo ile çocuğunuzun çizimlerini analiz edin!`;

      await Share.share({
        message,
        title: `${testLabel} Analizi`,
      });
    } catch (error) {
      // User cancelled share
    }
  };

  // Story Handlers
  const handleDeleteStorybook = (storybookId: string, storybookTitle: string) => {
    Alert.alert(
      t.history.deleteConfirm,
      `"${storybookTitle}" adlı masalı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: t.history.delete,
          style: "destructive",
          onPress: async () => {
            await deleteStorybookMutation.mutateAsync({ storybookId });
            refetchStories();
          },
        },
      ]
    );
  };

  const handleStorybookPress = (storybook: TypedStorybook) => {
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

  // Coloring Handlers
  const handleDownloadPDF = async (coloring: Coloring) => {
    try {
      let pdfUrlToOpen = coloring.pdf_url;

      // If PDF doesn't exist, generate it first
      if (!pdfUrlToOpen || pdfUrlToOpen.trim() === "") {
        Alert.alert(
          "PDF Oluşturuluyor",
          "PDF dosyası henüz oluşturulmamış. Şimdi oluşturulacak, biraz zaman alabilir.",
          [
            { text: "İptal", style: "cancel" },
            {
              text: "Oluştur",
              onPress: async () => {
                try {
                  // Show loading indicator
                  Alert.alert("Lütfen Bekleyin", "PDF oluşturuluyor...");

                  const result = await generateColoringPDFMutation.mutateAsync({
                    pages: [coloring.coloring_image_url],
                    title: coloring.title || "Boyama Sayfası",
                    size: "A4",
                  });

                  pdfUrlToOpen = result.pdf_url;

                  // Refresh colorings list to show updated PDF URL
                  await refetchColorings();

                  // Open the newly generated PDF
                  const supported = await Linking.canOpenURL(pdfUrlToOpen);
                  if (supported) {
                    await Linking.openURL(pdfUrlToOpen);
                  } else {
                    Alert.alert("Başarılı", "PDF oluşturuldu ancak otomatik açılamadı. Lütfen geçmişten tekrar deneyin.");
                  }
                } catch (error: unknown) {
                  const errorMessage = error instanceof Error ? error.message : "PDF oluşturulamadı";
                  Alert.alert("Hata", errorMessage);
                }
              },
            },
          ]
        );
        return;
      }

      // PDF already exists, open it directly
      const supported = await Linking.canOpenURL(pdfUrlToOpen);
      if (supported) {
        await Linking.openURL(pdfUrlToOpen);
      } else {
        Alert.alert("Hata", "PDF açılamadı");
      }
    } catch (error) {
      Alert.alert("Hata", "PDF indirilemedi");
    }
  };

  const handleDeleteColoring = (coloringId: string, coloringTitle: string) => {
    Alert.alert(
      t.history.deleteConfirm,
      `"${coloringTitle}" adlı boyamayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: t.history.delete,
          style: "destructive",
          onPress: async () => {
            await deleteColoringMutation.mutateAsync({ coloringId });
            refetchColorings();
          },
        },
      ]
    );
  };

  // Get current data based on active tab
  const rawAnalyses = analysesData?.analyses || [];
  const storybooksList = storybooks || [];
  const coloringsList = colorings || [];

  // Filter analyses based on search, date, and test type
  const filteredAnalyses = useMemo(() => {
    let result = [...rawAnalyses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((analysis) => {
        const testLabel = TASK_TYPE_LABELS[analysis.task_type as TaskType]?.toLowerCase() || "";
        return (
          testLabel.includes(query) ||
          (analysis.task_type?.toLowerCase() || "").includes(query)
        );
      });
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      result = result.filter((analysis) => {
        const analysisDate = new Date(analysis.created_at);
        switch (dateFilter) {
          case "today":
            return analysisDate >= startOfToday;
          case "week":
            return analysisDate >= startOfWeek;
          case "month":
            return analysisDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Test type filter
    if (testTypeFilter !== "all") {
      result = result.filter((analysis) => {
        // Handle both English and Turkish variants
        const type = analysis.task_type || "";
        const normalizedFilter = testTypeFilter;

        // Map Turkish variants to English
        const typeMapping: Record<string, string> = {
          Aile: "Family",
          Kaktus: "Cactus",
          Agac: "Tree",
          Bahce: "Garden",
          Bender: "BenderGestalt2",
          Rey: "ReyOsterrieth",
        };

        const normalizedType = typeMapping[type] || type;
        return normalizedType === normalizedFilter || type === normalizedFilter;
      });
    }

    return result;
  }, [rawAnalyses, searchQuery, dateFilter, testTypeFilter]);

  const analyses = filteredAnalyses;

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekCount = rawAnalyses.filter((a) =>
      new Date(a.created_at) >= startOfWeek
    ).length;

    const thisMonthCount = rawAnalyses.filter((a) =>
      new Date(a.created_at) >= startOfMonth
    ).length;

    const favoriteCount = rawAnalyses.filter((a) => a.favorited).length;

    return {
      totalCount: rawAnalyses.length,
      favoriteCount,
      thisWeekCount,
      thisMonthCount,
    };
  }, [rawAnalyses]);

  // Group analyses by date for timeline view
  const groupedAnalyses = useMemo(() => {
    const groups: { [key: string]: typeof analyses } = {};

    analyses.forEach((analysis) => {
      const date = new Date(analysis.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;

      if (date.toDateString() === today.toDateString()) {
        groupKey = "Bugün";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Dün";
      } else {
        // Format as "15 Ocak 2024"
        groupKey = date.toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(analysis);
    });

    return Object.entries(groups);
  }, [analyses]);

  const isLoading = activeTab === TAB_ANALYSES ? analysesLoading : activeTab === TAB_STORIES ? storiesLoading : coloringsLoading;
  const isEmpty = activeTab === TAB_ANALYSES ? analyses.length === 0 : activeTab === TAB_STORIES ? storybooksList.length === 0 : coloringsList.length === 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.primary.soft, Colors.neutral.lightest]}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <LinearGradient
              colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
              style={styles.headerIcon}
            >
              <Clock size={layout.icon.medium} color={Colors.neutral.white} />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Geçmiş</Text>
              <Text style={styles.headerSubtitle}>
                {activeTab === TAB_ANALYSES && `${analyses.length} analiz`}
                {activeTab === TAB_STORIES && `${storybooksList.length} masal`}
                {activeTab === TAB_COLORINGS && `${coloringsList.length} boyama`}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.tab,
              activeTab === TAB_ANALYSES && styles.tabActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setActiveTab(TAB_ANALYSES)}
          >
            <Brain size={iconSizes.small} color={activeTab === TAB_ANALYSES ? Colors.neutral.white : Colors.neutral.dark} strokeWidth={iconStroke.standard} />
            <Text style={[styles.tabText, activeTab === TAB_ANALYSES && styles.tabTextActive]}>
              {t.history.analyses}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.tab,
              activeTab === TAB_STORIES && styles.tabActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setActiveTab(TAB_STORIES)}
          >
            <BookOpen size={iconSizes.small} color={activeTab === TAB_STORIES ? Colors.neutral.white : Colors.neutral.dark} strokeWidth={iconStroke.standard} />
            <Text style={[styles.tabText, activeTab === TAB_STORIES && styles.tabTextActive]}>
              {t.history.stories}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.tab,
              activeTab === TAB_COLORINGS && styles.tabActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setActiveTab(TAB_COLORINGS)}
          >
            <Palette size={iconSizes.small} color={activeTab === TAB_COLORINGS ? Colors.neutral.white : Colors.neutral.dark} strokeWidth={iconStroke.standard} />
            <Text style={[styles.tabText, activeTab === TAB_COLORINGS && styles.tabTextActive]}>
              {t.history.colorings}
            </Text>
          </Pressable>
        </View>

        {/* Search and Filters (only for analyses) */}
        {activeTab === TAB_ANALYSES && (
          <View style={styles.filtersContainer}>
            <HistorySearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Analiz ara..."
            />
            <HistoryFilters
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              testTypeFilter={testTypeFilter}
              onTestTypeFilterChange={setTestTypeFilter}
              showFavorites={filterFavorites}
              onShowFavoritesChange={setFilterFavorites}
            />
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary.sunset}
            />
          }
        >
          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.sunset} />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          )}

          {/* Stats Card (only for analyses) */}
          {!isLoading && activeTab === TAB_ANALYSES && rawAnalyses.length > 0 && (
            <HistoryStatsCard
              totalCount={stats.totalCount}
              favoriteCount={stats.favoriteCount}
              thisWeekCount={stats.thisWeekCount}
              thisMonthCount={stats.thisMonthCount}
            />
          )}

          {/* Empty State */}
          {!isLoading && isEmpty && (
            <>
              {activeTab === TAB_ANALYSES && (
                <IooEmptyState
                  title={filterFavorites ? "Favori analiz yok" : EMPTY_STATE_PRESETS.noAnalysis.title}
                  message={filterFavorites
                    ? "Analizleri favorilere ekleyerek buradan kolayca ulaşabilirsiniz"
                    : EMPTY_STATE_PRESETS.noAnalysis.message}
                  mood={filterFavorites ? "curious" : EMPTY_STATE_PRESETS.noAnalysis.mood}
                />
              )}
              {activeTab === TAB_STORIES && (
                <IooEmptyState
                  {...EMPTY_STATE_PRESETS.noStories}
                  action={{
                    label: "Masal Oluştur",
                    onPress: () => router.push("/(tabs)/stories"),
                  }}
                />
              )}
              {activeTab === TAB_COLORINGS && (
                <IooEmptyState
                  {...EMPTY_STATE_PRESETS.noColorings}
                  action={{
                    label: "Studio'ya Git",
                    onPress: () => router.push("/(tabs)/studio"),
                  }}
                />
              )}
            </>
          )}

          {/* Analyses List - Timeline Grouped */}
          {!isLoading && activeTab === TAB_ANALYSES && analyses.length > 0 &&
            groupedAnalyses.map(([dateGroup, groupAnalyses]) => (
              <View key={dateGroup} style={styles.timelineGroup}>
                {/* Timeline Date Header */}
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineDot} />
                  <Text style={styles.timelineDate}>{dateGroup}</Text>
                  <View style={styles.timelineLine} />
                </View>

                {/* Analyses in this group */}
                {groupAnalyses.map((analysis) => (
                  <View key={analysis.id} style={styles.analysisCard}>
                    <Pressable
                      onPress={() => handleViewAnalysis(analysis.id)}
                      style={({ pressed }) => [styles.cardPressable, pressed && { opacity: 0.8 }]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                          {/* Thumbnail if available */}
                          {analysis.image_url ? (
                            <View style={styles.cardThumbnail}>
                              <Image
                                source={{ uri: analysis.image_url }}
                                style={styles.cardThumbnailImage}
                                contentFit="cover"
                              />
                            </View>
                          ) : (
                            <LinearGradient
                              colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                              style={styles.cardIcon}
                            >
                              <Brain size={iconSizes.small} color={Colors.neutral.white} strokeWidth={iconStroke.standard} />
                            </LinearGradient>
                          )}
                          <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle}>
                              {TASK_TYPE_LABELS[analysis.task_type as TaskType] || analysis.task_type}
                            </Text>
                            <View style={styles.cardMeta}>
                              <Clock size={iconSizes.inline} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
                              <Text style={styles.cardMetaText}>
                                {new Date(analysis.created_at).toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                              {analysis.child_age && (
                                <>
                                  <Text style={styles.cardMetaDot}>•</Text>
                                  <Text style={styles.cardMetaText}>{analysis.child_age} yaş</Text>
                                </>
                              )}
                            </View>
                          </View>
                        </View>
                        <ChevronRight size={iconSizes.small} color={Colors.neutral.light} strokeWidth={iconStroke.standard} />
                      </View>

                      {analysis.analysis_result?.insights?.length > 0 && analysis.analysis_result.insights[0] && (
                        <View style={styles.insightsPreview}>
                          <Text style={styles.insightText} numberOfLines={2}>
                            {analysis.analysis_result.insights[0]?.title}:{" "}
                            {analysis.analysis_result.insights[0]?.summary}
                          </Text>
                        </View>
                      )}
                    </Pressable>

                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => handleToggleFavorite(analysis.id, analysis.favorited)}
                        style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
                      >
                        <Heart
                          size={iconSizes.small}
                          color={analysis.favorited ? Colors.semantic.error : Colors.neutral.medium}
                          fill={analysis.favorited ? Colors.semantic.error : "none"}
                          strokeWidth={iconStroke.standard}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => handleShareAnalysis(analysis)}
                        style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
                      >
                        <Share2 size={iconSizes.small} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteAnalysis(analysis.id)}
                        style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.6 }]}
                      >
                        <Trash2 size={iconSizes.small} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ))}

          {/* Stories List */}
          {!isLoading && activeTab === TAB_STORIES && storybooksList.length > 0 &&
            (storybooksList as TypedStorybook[]).map((storybook) => {
              const renderRightActions = () => (
                <View style={styles.swipeDeleteContainer}>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteStorybook(storybook.id, storybook.title)}
                  >
                    <Trash2 size={iconSizes.action} color={Colors.neutral.white} strokeWidth={iconStroke.standard} />
                    <Text style={styles.deleteButtonText}>{t.history.delete}</Text>
                  </Pressable>
                </View>
              );

              return (
                <Swipeable key={storybook.id} renderRightActions={renderRightActions} overshootRight={false}>
                  <Pressable
                    style={({ pressed }) => [styles.storyCard, pressed && { opacity: 0.8 }]}
                    onPress={() => handleStorybookPress(storybook)}
                  >
                    <LinearGradient colors={Colors.cards.story.bg} style={styles.cardGradient}>
                      <View style={styles.storyImageContainer}>
                        {storybook.pages?.[0]?.img_url ? (
                          <Image
                            source={{ uri: storybook.pages[0].img_url }}
                            style={styles.storyImage}
                            contentFit="contain"
                          />
                        ) : (
                          <View style={styles.storyImagePlaceholder}>
                            <BookOpen size={layout.icon.large} color={Colors.cards.story.icon} />
                          </View>
                        )}
                      </View>

                      <View style={styles.storyContent}>
                        <Text style={styles.storyTitle} numberOfLines={2}>
                          {storybook.title}
                        </Text>
                        <View style={styles.storyMeta}>
                          <Calendar size={iconSizes.inline} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
                          <Text style={styles.storyMetaText}>{formatDate(storybook.created_at)}</Text>
                          <Text style={styles.cardMetaDot}>•</Text>
                          <Text style={styles.storyMetaText}>{storybook.pages?.length || 0} sayfa</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </Pressable>
                </Swipeable>
              );
            })}

          {/* Colorings Grid */}
          {!isLoading && activeTab === TAB_COLORINGS && coloringsList.length > 0 && (
            <View style={styles.coloringsGrid}>
              {(coloringsList as Coloring[]).map((coloring) => {
                const renderRightActions = () => (
                  <View style={styles.swipeDeleteContainer}>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDeleteColoring(coloring.id, coloring.title)}
                    >
                      <Trash2 size={iconSizes.small} color={Colors.neutral.white} strokeWidth={iconStroke.standard} />
                      <Text style={styles.deleteButtonText}>{t.history.delete}</Text>
                    </Pressable>
                  </View>
                );

                return (
                  <Swipeable key={coloring.id} renderRightActions={renderRightActions} overshootRight={false}>
                    <View style={styles.coloringCard}>
                      <LinearGradient
                        colors={[Colors.neutral.lightest, Colors.neutral.white]}
                        style={styles.coloringGradient}
                      >
                        <View style={styles.coloringImageContainer}>
                          {coloring.coloring_image_url ? (
                            <Image
                              source={{ uri: coloring.coloring_image_url }}
                              style={styles.coloringImage}
                              contentFit="cover"
                            />
                          ) : (
                            <View style={styles.coloringImagePlaceholder}>
                              <Palette size={iconSizes.hero} color={Colors.neutral.light} strokeWidth={iconStroke.thin} />
                            </View>
                          )}
                        </View>

                        <View style={styles.coloringContent}>
                          <Text style={styles.coloringTitle} numberOfLines={2}>
                            {coloring.title}
                          </Text>
                          <View style={styles.cardMeta}>
                            <Calendar size={iconSizes.inline} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
                            <Text style={styles.cardMetaText}>{formatDate(coloring.created_at)}</Text>
                          </View>

                          <Pressable
                            style={({ pressed }) => [styles.downloadButton, pressed && { opacity: 0.7 }]}
                            onPress={() => handleDownloadPDF(coloring)}
                            disabled={generateColoringPDFMutation.isPending}
                          >
                            <LinearGradient
                              colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                              style={styles.downloadButtonGradient}
                            >
                              {generateColoringPDFMutation.isPending ? (
                                <ActivityIndicator size="small" color={Colors.neutral.white} />
                              ) : (
                                <>
                                  <Download size={iconSizes.inline} color={Colors.neutral.white} strokeWidth={iconStroke.bold} />
                                  <Text style={styles.downloadButtonText}>
                                    {coloring.pdf_url ? "İndir" : "PDF Oluştur"}
                                  </Text>
                                </>
                              )}
                            </LinearGradient>
                          </Pressable>
                        </View>
                      </LinearGradient>
                    </View>
                  </Swipeable>
                );
              })}
            </View>
          )}
        </ScrollView>
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: layout.screenPadding,
    gap: spacing["2"],
    marginBottom: spacing["4"],
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["3"],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    ...shadows.sm,
  },
  tabActive: {
    backgroundColor: Colors.primary.sunset,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  tabTextActive: {
    color: Colors.neutral.white,
  },
  filtersContainer: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing["4"],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },
  loadingContainer: {
    paddingVertical: spacing["10"],
    alignItems: "center",
    gap: spacing["3"],
  },
  loadingText: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
  },
  emptyContainer: {
    paddingVertical: spacing["10"],
    alignItems: "center",
    gap: spacing["3"],
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
  },
  emptyText: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: "center",
    paddingHorizontal: spacing["8"],
  },
  // Timeline Styles
  timelineGroup: {
    marginBottom: spacing["4"],
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["3"],
    gap: spacing["2"],
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary.lavender,
  },
  timelineDate: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.secondary.lavender,
  },
  timelineLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  // Analysis Card Styles
  analysisCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    marginBottom: spacing["3"],
    marginLeft: spacing["4"],
    ...shadows.md,
    overflow: "hidden",
  },
  cardThumbnail: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.neutral.lightest,
  },
  cardThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  cardPressable: {
    padding: spacing["5"],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing["3"],
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["1"],
  },
  cardMetaText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  cardMetaDot: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
  },
  insightsPreview: {
    marginBottom: spacing["2"],
  },
  insightText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * 1.5,
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightest,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["3"],
    gap: spacing["4"],
  },
  actionButton: {
    padding: spacing["2"],
  },
  // Story Card Styles
  storyCard: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
    marginBottom: spacing["4"],
    ...shadows.lg,
  },
  cardGradient: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
  },
  storyImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    backgroundColor: Colors.background.primary,
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  storyImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightest,
  },
  storyContent: {
    padding: spacing["4"],
    gap: spacing["2"],
  },
  storyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    lineHeight: typography.lineHeight.snug * typography.size.xl,
  },
  storyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  storyMetaText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  // Coloring Card Styles
  coloringsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["4"],
  },
  coloringCard: {
    width: "48%",
    marginBottom: spacing["2"],
  },
  coloringGradient: {
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  coloringImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.neutral.lightest,
  },
  coloringImage: {
    width: "100%",
    height: "100%",
  },
  coloringImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightest,
  },
  coloringContent: {
    padding: spacing["3"],
  },
  coloringTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    minHeight: typography.size.base * 2 * 1.5,
  },
  downloadButton: {
    marginTop: spacing["2"],
  },
  downloadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    borderRadius: radius.lg,
  },
  downloadButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  // Swipe Delete
  swipeDeleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: spacing["4"],
  },
  deleteButton: {
    backgroundColor: Colors.semantic.error,
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
});
