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
  Dimensions,
} from "react-native";
import {
  BookOpen,
  Palette,
  Brain,
  Clock,
  TrendingUp,
  ChevronRight,
  Zap,
} from "lucide-react-native";
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
} from "@/constants/design-system";
import { GreetingService } from "@/lib/services/greeting-service";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

type TaskType = "DAP" | "HTP" | "Family" | "Cactus" | "Tree" | "Garden" | "BenderGestalt2" | "ReyOsterrieth" | "Aile" | "Kaktus" | "Agac" | "Bahce" | "Bender" | "Rey" | "Luscher";

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recent analyses (last 3)
  const {
    data: recentAnalysesData,
    isLoading: analysesLoading,
    refetch: refetchAnalyses,
  } = trpc.analysis.list.useQuery(
    {
      limit: 3,
      offset: 0,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    { enabled: !!user?.userId }
  );

  // Fetch user stats
  const {
    data: userStats,
    refetch: refetchStats,
  } = trpc.user.getUserStats.useQuery(
    undefined,
    { enabled: !!user?.userId }
  );

  // Get dynamic greeting based on time, special days, and user activity
  const greeting = useMemo(() => {
    return GreetingService.getFormattedGreeting();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAnalyses(), refetchStats()]);
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
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  };

  const recentAnalyses = recentAnalysesData?.analyses || [];
  const stats = userStats || { totalAnalyses: 0, totalStorybooks: 0, totalColorings: 0 };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.primary.soft, Colors.neutral.lightest]}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
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
          {/* Welcome Header */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeGreeting}>{greeting.title}</Text>
            <Text style={styles.welcomeSubtitle}>{greeting.subtitle}</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Hızlı Eylemler</Text>

            {/* Quick Analysis */}
            <Pressable
              style={({ pressed }) => [
                styles.quickActionCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push("/quick-analysis" as any)}
            >
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Zap size={32} color={Colors.neutral.white} />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>🎨 {t.home.quickAnalysis}</Text>
                  {!isSmallDevice && (
                    <Text style={styles.quickActionDescription}>
                      Çizimi yükle, saniyeler içinde sonuç al
                    </Text>
                  )}
                </View>
                <ChevronRight size={24} color={Colors.neutral.white} />
              </LinearGradient>
            </Pressable>

            {/* Advanced Analysis */}
            <Pressable
              style={({ pressed }) => [
                styles.quickActionCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push("/advanced-analysis" as any)}
            >
              <LinearGradient
                colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Brain size={32} color={Colors.neutral.white} />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>🔬 {t.home.advancedAnalysis}</Text>
                  {!isSmallDevice && (
                    <Text style={styles.quickActionDescription}>
                      9 farklı projektif test ile derinlemesine analiz
                    </Text>
                  )}
                </View>
                <ChevronRight size={24} color={Colors.neutral.white} />
              </LinearGradient>
            </Pressable>
          </View>

          {/* Creative Actions - Hayal Atölyesi */}
          <View style={styles.creativeActionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ {t.home.dreamWorkshop}</Text>
              <Pressable
                onPress={() => router.push("/hayal-atolyesi" as any)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.seeAllText}>{t.home.viewAll} →</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.hayalAtolyesiCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push("/hayal-atolyesi" as any)}
            >
              <LinearGradient
                colors={[Colors.secondary.mint, Colors.secondary.mintLight]}
                style={styles.hayalAtolyesiGradient}
              >
                <View style={styles.hayalAtolyesiIcon}>
                  <Text style={styles.hayalAtolyesiIconText}>🌟</Text>
                </View>
                <View style={styles.hayalAtolyesiContent}>
                  <Text style={styles.hayalAtolyesiTitle}>Çiziminden Yarat</Text>
                  <Text style={styles.hayalAtolyesiDescription}>
                    Masal • Boyama • Analiz - Tek yerden tümü
                  </Text>
                </View>
                <ChevronRight size={24} color={Colors.neutral.white} />
              </LinearGradient>
            </Pressable>

            <View style={styles.hayalAtolyesiPreviewGrid}>
              <View style={styles.hayalAtolyesiPreviewItem}>
                <BookOpen size={24} color={Colors.cards.story.icon} />
                <Text style={styles.hayalAtolyesiPreviewText}>Masal</Text>
              </View>
              <View style={styles.hayalAtolyesiPreviewItem}>
                <Palette size={24} color={Colors.secondary.sky} />
                <Text style={styles.hayalAtolyesiPreviewText}>Boyama</Text>
              </View>
              <View style={styles.hayalAtolyesiPreviewItem}>
                <Brain size={24} color={Colors.secondary.lavender} />
                <Text style={styles.hayalAtolyesiPreviewText}>Analiz</Text>
              </View>
            </View>
          </View>

          {/* Recent Analyses */}
          <View style={styles.recentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 Son Analizler</Text>
              <Pressable
                onPress={() => router.push("/history" as any)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.seeAllText}>{t.home.viewAll} →</Text>
              </Pressable>
            </View>

            {analysesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary.sunset} />
              </View>
            ) : recentAnalyses.length === 0 ? (
              <View style={styles.emptyRecentContainer}>
                <Brain size={48} color={Colors.neutral.light} />
                <Text style={styles.emptyRecentText}>Henüz analiz yok</Text>
                <Text style={styles.emptyRecentSubtext}>
                  {t.home.quickAnalysisDesc}
                </Text>
              </View>
            ) : (
              <View style={styles.recentCardsContainer}>
                {recentAnalyses.map((analysis: any) => (
                  <Pressable
                    key={analysis.id}
                    style={({ pressed }) => [
                      styles.recentCard,
                      pressed && { opacity: 0.9 },
                    ]}
                    onPress={() => Alert.alert("Analiz Detayı", "Detay ekranı yakında!")}
                  >
                    <View style={styles.recentCardHeader}>
                      <View style={styles.recentCardIconContainer}>
                        <Brain size={20} color={Colors.secondary.grass} />
                      </View>
                      <View style={styles.recentCardInfo}>
                        <Text style={styles.recentCardTitle} numberOfLines={1}>
                          {TASK_TYPE_LABELS[analysis.task_type as TaskType] || analysis.task_type}
                        </Text>
                        <Text style={styles.recentCardDate}>
                          {formatDate(analysis.created_at)}
                        </Text>
                      </View>
                    </View>
                    {analysis.analysis_result?.insights?.[0] && (
                      <Text style={styles.recentCardSnippet} numberOfLines={2}>
                        {analysis.analysis_result.insights[0].title}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>📊 Bu Hafta</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                  style={styles.statCardGradient}
                >
                  <Text style={styles.statNumber}>{stats.totalAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>Analiz</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={Colors.cards.story.bg}
                  style={styles.statCardGradient}
                >
                  <Text style={styles.statNumber}>{stats.totalStorybooks || 0}</Text>
                  <Text style={styles.statLabel}>Masal</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                  style={styles.statCardGradient}
                >
                  <Text style={styles.statNumber}>{stats.totalColorings || 0}</Text>
                  <Text style={styles.statLabel}>Boyama</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinksContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.quickLink,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push("/history" as any)}
            >
              <Clock size={20} color={Colors.neutral.dark} />
              <Text style={styles.quickLinkText}>Tüm Geçmiş</Text>
              <ChevronRight size={16} color={Colors.neutral.medium} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickLink,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push("/profile" as any)}
            >
              <TrendingUp size={20} color={Colors.neutral.dark} />
              <Text style={styles.quickLinkText}>İlerleme Takibi</Text>
              <ChevronRight size={16} color={Colors.neutral.medium} />
            </Pressable>
          </View>
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
  welcomeContainer: {
    paddingVertical: isSmallDevice ? spacing["4"] : spacing["6"],
  },
  welcomeGreeting: {
    fontSize: isSmallDevice ? typography.size["2xl"] : typography.size["3xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["4"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  seeAllText: {
    fontSize: typography.size.sm,
    color: Colors.primary.sunset,
    fontWeight: typography.weight.semibold,
  },
  // Quick Actions
  quickActionsContainer: {
    marginBottom: spacing["6"],
  },
  quickActionCard: {
    marginBottom: spacing["3"],
    borderRadius: radius.xl,
    ...shadows.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: isSmallDevice ? spacing["4"] : spacing["5"],
    borderRadius: radius.xl,
    gap: isSmallDevice ? spacing["3"] : spacing["4"],
  },
  quickActionIcon: {
    width: isSmallDevice ? 48 : 56,
    height: isSmallDevice ? 48 : 56,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    marginBottom: spacing["1"],
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quickActionDescription: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.95,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Creative Actions - Hayal Atölyesi
  creativeActionsContainer: {
    marginBottom: spacing["6"],
  },
  hayalAtolyesiCard: {
    borderRadius: radius.xl,
    ...shadows.lg,
    marginBottom: spacing["4"],
  },
  hayalAtolyesiGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing["5"],
    borderRadius: radius.xl,
    gap: spacing["4"],
  },
  hayalAtolyesiIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  hayalAtolyesiIconText: {
    fontSize: typography.size["2xl"],
  },
  hayalAtolyesiContent: {
    flex: 1,
  },
  hayalAtolyesiTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    marginBottom: spacing["1"],
  },
  hayalAtolyesiDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  hayalAtolyesiPreviewGrid: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  hayalAtolyesiPreviewItem: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    padding: spacing["4"],
    borderRadius: radius.lg,
    alignItems: "center",
    gap: spacing["2"],
    ...shadows.sm,
  },
  hayalAtolyesiPreviewText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  // Recent Analyses
  recentContainer: {
    marginBottom: spacing["6"],
  },
  loadingContainer: {
    paddingVertical: spacing["6"],
    alignItems: "center",
  },
  emptyRecentContainer: {
    paddingVertical: spacing["8"],
    alignItems: "center",
    gap: spacing["2"],
  },
  emptyRecentText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  emptyRecentSubtext: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  recentCardsContainer: {
    gap: spacing["3"],
  },
  recentCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing["4"],
    ...shadows.sm,
  },
  recentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    marginBottom: spacing["2"],
  },
  recentCardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: Colors.secondary.grassLight,
    justifyContent: "center",
    alignItems: "center",
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  recentCardDate: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    marginTop: spacing["1"],
  },
  recentCardSnippet: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * 1.5,
  },
  // Stats
  statsContainer: {
    marginBottom: spacing["6"],
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  statCardGradient: {
    padding: spacing["4"],
    borderRadius: radius.lg,
    alignItems: "center",
  },
  statNumber: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
    marginBottom: spacing["1"],
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: Colors.neutral.white,
    opacity: 0.9,
    fontWeight: typography.weight.semibold,
  },
  // Quick Links
  quickLinksContainer: {
    gap: spacing["2"],
    marginBottom: spacing["4"],
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    backgroundColor: Colors.neutral.white,
    padding: spacing["4"],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  quickLinkText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
});
