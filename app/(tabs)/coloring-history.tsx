import React, { useState } from "react";
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
} from "react-native";
import {
  Palette,
  Calendar,
  Download,
  Trash2,
  ChevronRight,
  Star,
  ExternalLink,
  ArrowLeft,
} from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Colors } from "@/constants/colors";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from "@/constants/design-system";
import { Image } from "expo-image";

export default function ColoringHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch colorings list
  const {
    data: colorings,
    isLoading,
    refetch,
  } = trpc.studio.listColorings.useQuery(
    undefined,
    { enabled: !!user?.userId }
  );

  const deleteColoringMutation = trpc.studio.deleteColoring.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDownloadPDF = async (pdfUrl: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert("Hata", "PDF açılamadı");
      }
    } catch (error) {
      Alert.alert("Hata", "PDF indirilemedi");
    }
  };

  const handleViewColoring = (coloringId: string, pdfUrl: string, title: string) => {
    Alert.alert(
      title,
      "PDF'i açmak ister misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "PDF Aç",
          onPress: () => handleDownloadPDF(pdfUrl, title),
        },
      ]
    );
  };

  const handleDeleteColoring = (coloringId: string, coloringTitle: string) => {
    Alert.alert(
      "Boyamayı Sil",
      `"${coloringTitle}" adlı boyamayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteColoringMutation.mutate({ coloringId });
          },
        },
      ]
    );
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

  const coloringsList = colorings || [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.background.studio}
        style={styles.gradientContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <ArrowLeft size={24} color={Colors.neutral.darkest} />
            </Pressable>
            <View style={styles.header}>
              <LinearGradient
                colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                style={styles.headerIcon}
              >
                <Palette size={layout.icon.medium} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Boyama Geçmişi</Text>
                <Text style={styles.headerSubtitle}>
                  {coloringsList.length} boyama sayfası
                </Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <LinearGradient
              colors={[Colors.secondary.sunshine, Colors.secondary.sunshineLight]}
              style={styles.infoCardGradient}
            >
              <Text style={styles.infoCardText}>
                💡 Boyama sayfalarınızı PDF olarak indirebilir ve yazdırabilirsiniz
              </Text>
            </LinearGradient>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.secondary.sky} />
              <Text style={styles.loadingText}>Boyamalar yükleniyor...</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && coloringsList.length === 0 && (
            <View style={styles.emptyContainer}>
              <Palette size={64} color={Colors.neutral.light} />
              <Text style={styles.emptyTitle}>Henüz boyama yok</Text>
              <Text style={styles.emptyText}>
                Studio sekmesinden çizimlerinizi boyama sayfasına dönüştürebilirsiniz
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push("/(tabs)/studio")}
              >
                <LinearGradient
                  colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                  style={styles.emptyButtonGradient}
                >
                  <Text style={styles.emptyButtonText}>Studio'ya Git</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Colorings Grid */}
          {!isLoading && coloringsList.length > 0 && (
            <View style={styles.grid}>
              {coloringsList.map((coloring: any) => {
                const renderRightActions = () => (
                  <View style={styles.swipeDeleteContainer}>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDeleteColoring(coloring.id, coloring.title)}
                    >
                      <Trash2 size={20} color={Colors.neutral.white} />
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </Pressable>
                  </View>
                );

                return (
                  <Swipeable
                    key={coloring.id}
                    renderRightActions={renderRightActions}
                    overshootRight={false}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.coloringCard,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={() => handleViewColoring(coloring.id, coloring.pdf_url, coloring.title)}
                    >
                      <LinearGradient
                        colors={[Colors.neutral.lightest, Colors.neutral.white]}
                        style={styles.cardGradient}
                      >
                        {/* Image Preview Placeholder */}
                        <View style={styles.imageContainer}>
                          {coloring.coloring_image_url ? (
                            <Image
                              source={{ uri: coloring.coloring_image_url }}
                              style={styles.image}
                              contentFit="cover"
                            />
                          ) : (
                            <View style={styles.imagePlaceholder}>
                              <Palette size={48} color={Colors.neutral.light} />
                            </View>
                          )}
                        </View>

                        {/* Card Content */}
                        <View style={styles.cardContent}>
                          <Text style={styles.cardTitle} numberOfLines={2}>
                            {coloring.title}
                          </Text>

                          <View style={styles.cardMeta}>
                            <Calendar size={12} color={Colors.neutral.medium} />
                            <Text style={styles.cardMetaText}>
                              {formatDate(coloring.created_at)}
                            </Text>
                          </View>

                          {coloring.page_count > 1 && (
                            <View style={styles.pageCountBadge}>
                              <Text style={styles.pageCountText}>
                                {coloring.page_count} sayfa
                              </Text>
                            </View>
                          )}

                          {/* Tags */}
                          {coloring.tags?.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {coloring.tags.slice(0, 2).map((tag: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                  <Text style={styles.tagText}>{tag}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Favorite Badge */}
                          {coloring.favorited && (
                            <View style={styles.favoriteBadge}>
                              <Star size={12} color={Colors.secondary.sunshine} fill={Colors.secondary.sunshine} />
                            </View>
                          )}
                        </View>

                        {/* Download Button */}
                        <Pressable
                          style={({ pressed }) => [
                            styles.downloadButton,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => handleDownloadPDF(coloring.pdf_url, coloring.title)}
                        >
                          <LinearGradient
                            colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                            style={styles.downloadButtonGradient}
                          >
                            <Download size={16} color={Colors.neutral.white} />
                            <Text style={styles.downloadButtonText}>İndir</Text>
                          </LinearGradient>
                        </Pressable>
                      </LinearGradient>
                    </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },
  headerContainer: {
    marginBottom: spacing["6"],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["3"],
    ...shadows.md,
  },
  header: {
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
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
    letterSpacing: typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  infoCard: {
    marginBottom: spacing["6"],
  },
  infoCardGradient: {
    padding: spacing["4"],
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  infoCardText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.darkest,
    fontWeight: typography.weight.medium,
    textAlign: "center",
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
    marginBottom: spacing["4"],
  },
  emptyButton: {
    width: "80%",
  },
  emptyButtonGradient: {
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["6"],
    borderRadius: radius.xl,
    alignItems: "center",
  },
  emptyButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["4"],
    marginBottom: spacing["6"],
  },
  coloringCard: {
    width: "48%",
    marginBottom: spacing["2"],
  },
  cardGradient: {
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.neutral.lightest,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.lightest,
  },
  cardContent: {
    padding: spacing["4"],
    position: "relative",
  },
  cardTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    minHeight: typography.size.base * 2 * 1.5,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["1"],
    marginBottom: spacing["2"],
  },
  cardMetaText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  pageCountBadge: {
    backgroundColor: Colors.secondary.skyLight,
    paddingVertical: spacing["1"],
    paddingHorizontal: spacing["2"],
    borderRadius: radius.md,
    alignSelf: "flex-start",
    marginBottom: spacing["2"],
  },
  pageCountText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.sky,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: spacing["1"],
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Colors.neutral.lightest,
    paddingVertical: spacing["1"],
    paddingHorizontal: spacing["2"],
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  favoriteBadge: {
    position: "absolute",
    top: spacing["2"],
    right: spacing["2"],
    backgroundColor: Colors.neutral.white,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },
  downloadButton: {
    margin: spacing["4"],
    marginTop: 0,
  },
  downloadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["4"],
    borderRadius: radius.lg,
  },
  downloadButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  swipeDeleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    width: 80,
    marginBottom: spacing["2"],
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: spacing["2"],
    gap: spacing["1"],
  },
  deleteButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
});
