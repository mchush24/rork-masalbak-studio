import React, { useState, useMemo, useEffect } from "react";
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
  MessageCircle,
  Sparkles,
  Gift,
  Star,
  Trophy,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Href } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Colors, RenkooColors } from "@/constants/colors";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from "@/constants/design-system";
import { GreetingService } from "@/lib/services/greeting-service";
import { useGamification } from "@/lib/gamification";
import { StreakDisplay, XPProgressBar, NewBadgeModal } from "@/components/gamification";

// New Components
import { IooMascotFinal as IooMascot } from "@/components/IooMascotFinal";
import { OrganicContainer } from "@/components/OrganicContainer";
import { FeatureCard, FeatureCardCompact } from "@/components/FeatureCard";
import { JellyButton } from "@/components/JellyButton";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

type TaskType = "DAP" | "HTP" | "Family" | "Cactus" | "Tree" | "Garden" | "BenderGestalt2" | "ReyOsterrieth" | "Aile" | "Kaktus" | "Agac" | "Bahce" | "Bender" | "Rey" | "Luscher";

// Analysis type for recent analyses list
interface RecentAnalysis {
  id: string;
  task_type: TaskType;
  created_at: string;
  child_age?: number;
  is_favorite?: boolean;
}

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

  // Gamification hook
  const {
    isLoading: gamificationLoading,
    streakData,
    totalXp,
    newlyUnlockedBadge,
    clearNewBadge,
    getUserLevel,
    refreshData: refreshGamification,
  } = useGamification();

  const levelInfo = getUserLevel();

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
    await Promise.all([refetchAnalyses(), refetchStats(), refreshGamification()]);
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
        colors={RenkooColors.gradients.homeScreen}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={RenkooColors.brand.jellyPurple}
            />
          }
        >
          {/* Hero Section with Mascot */}
          <View style={styles.heroSection}>
            <OrganicContainer
              style={styles.heroCard}
              shape="blob"
              glowColor="rgba(255, 203, 164, 0.3)"
              animated
            >
              <View style={styles.heroContent}>
                {/* Mascot - Ioo Dream Guardian - Tıklanabilir */}
                <View style={styles.mascotContainer}>
                  <IooMascot
                    size={isSmallDevice ? "medium" : "large"}
                    animated
                    showGlow
                    showSparkles
                    mood="happy"
                    onPress={() => router.push("/chatbot" as Href)}
                  />
                  <View style={styles.chatHint}>
                    <MessageCircle size={12} color={RenkooColors.brand.jellyPurple} />
                    <Text style={styles.chatHintText}>Yardıma mı ihtiyacınız var?</Text>
                  </View>
                </View>

                {/* Welcome Text */}
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroGreeting}>{greeting.title}</Text>
                  <Text style={styles.heroSubtitle}>{greeting.subtitle}</Text>
                  <View style={styles.mascotIntro}>
                    <Text style={styles.mascotIntroText}>
                      Ben <Text style={styles.mascotName}>Ioo</Text>, çocuğunuzun gelişim yolculuğunda yanınızdayım
                    </Text>
                  </View>
                </View>
              </View>
            </OrganicContainer>
          </View>

          {/* Gamification Section - Streak & XP */}
          {!gamificationLoading && (
            <View style={styles.gamificationSection}>
              <View style={styles.gamificationRow}>
                {/* Streak Display */}
                <StreakDisplay
                  currentStreak={streakData?.currentStreak || 0}
                  longestStreak={streakData?.longestStreak || 0}
                  isActiveToday={streakData?.lastActivityDate === new Date().toISOString().split('T')[0]}
                  streakAtRisk={
                    !streakData?.lastActivityDate ||
                    (streakData?.currentStreak > 0 &&
                      streakData?.lastActivityDate !== new Date().toISOString().split('T')[0] &&
                      streakData?.lastActivityDate !== (() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        return yesterday.toISOString().split('T')[0];
                      })())
                  }
                  hasFreezeAvailable={streakData?.streakFreezeAvailable}
                  size="compact"
                  onPress={() => router.push("/profile" as Href)}
                />

                {/* XP Progress */}
                <View style={styles.xpContainer}>
                  <XPProgressBar
                    level={levelInfo.level}
                    xpProgress={levelInfo.xpProgress}
                    xpNeeded={levelInfo.xpNeeded}
                    totalXp={totalXp}
                    progressPercent={levelInfo.progressPercent}
                    size="compact"
                    onPress={() => router.push("/profile" as Href)}
                  />
                </View>

                {/* Badges Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.badgesButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => router.push("/profile" as Href)}
                >
                  <Trophy size={18} color="#F59E0B" />
                </Pressable>
              </View>
            </View>
          )}

          {/* PRIMARY CTA: Duygu Yansıması - Above the fold */}
          <Pressable
            onPress={() => router.push("/advanced-analysis" as Href)}
            style={({ pressed }) => [
              styles.primaryCtaCard,
              pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
            ]}
          >
            <LinearGradient
              colors={['#A78BFA', '#818CF8', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryCtaGradient}
            >
              <View style={styles.primaryCtaContent}>
                <View style={styles.primaryCtaIconContainer}>
                  <Sparkles size={32} color="#FFF" />
                </View>
                <View style={styles.primaryCtaTextContainer}>
                  <View style={styles.primaryCtaBadge}>
                    <Text style={styles.primaryCtaBadgeText}>ANA ÖZELLİK</Text>
                  </View>
                  <Text style={styles.primaryCtaTitle}>Duygu Yansıması</Text>
                  <Text style={styles.primaryCtaSubtitle}>
                    Çocuğunuzun çizimlerinden duygusal dünyasını keşfedin
                  </Text>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.primaryCtaShine} />
            </LinearGradient>
          </Pressable>

          {/* Secondary CTA */}
          <View style={styles.ctaSection}>
            <JellyButton
              title="Hızlı Analiz"
              onPress={() => router.push("/quick-analysis" as Href)}
              size="medium"
              gradientColors={['#FFB5D8', '#FF9EBF']}
            />
          </View>

          {/* Feature Cards Grid */}
          <View style={styles.featuresSection}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleIcon}>
                <Sparkles size={16} color={RenkooColors.brand.jellyPurple} />
              </View>
              <Text style={styles.sectionTitle}>Keşfet</Text>
            </View>

            <View style={styles.featureCardsGrid}>
              <FeatureCard
                title="Ioo ile Sohbet"
                subtitle="Çocuk gelişimi, boyama önerileri ve sorularınız"
                icon={<MessageCircle size={26} color={RenkooColors.featureCards.chat.icon} />}
                type="chat"
                onPress={() => router.push("/chatbot" as Href)}
                size="medium"
              />
            </View>
          </View>

          {/* Quick Actions - Compact Cards */}
          <View style={styles.quickActionsSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionTitleIcon, { backgroundColor: 'rgba(255, 217, 61, 0.15)' }]}>
                <TrendingUp size={16} color="#FFB347" />
              </View>
              <Text style={styles.sectionTitle}>Hızlı Eylemler</Text>
            </View>

            <View style={styles.compactCardsRow}>
              <FeatureCardCompact
                title="Masal"
                icon={<BookOpen size={22} color={RenkooColors.featureCards.story.icon} />}
                type="story"
                onPress={() => router.push("/hayal-atolyesi" as Href)}
              />
              <FeatureCardCompact
                title="Boyama"
                icon={<Palette size={22} color={RenkooColors.featureCards.coloring.icon} />}
                type="coloring"
                onPress={() => router.push("/hayal-atolyesi" as Href)}
              />
              <FeatureCardCompact
                title="Ödüller"
                icon={<Gift size={22} color={RenkooColors.featureCards.reward.icon} />}
                type="reward"
                onPress={() => router.push("/profile" as Href)}
              />
            </View>
          </View>

          {/* Hayal Atölyesi Section */}
          <View style={styles.atolyeSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionTitleIcon, { backgroundColor: 'rgba(111, 237, 214, 0.15)' }]}>
                  <Palette size={16} color="#4ECDC4" />
                </View>
                <Text style={styles.sectionTitle}>Hayal Atölyesi</Text>
              </View>
              <Pressable
                onPress={() => router.push("/hayal-atolyesi" as Href)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.seeAllText}>{t.home.viewAll} →</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.atolyeCard,
                pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push("/hayal-atolyesi" as Href)}
            >
              <LinearGradient
                colors={['#E8D5FF', '#FFCBA4', '#FFD6E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.atolyeGradient}
              >
                <View style={styles.atolyeContent}>
                  <Text style={styles.atolyeEmoji}>🌟</Text>
                  <View style={styles.atolyeTextContainer}>
                    <Text style={styles.atolyeTitle}>Çiziminden Yarat</Text>
                    <Text style={styles.atolyeSubtitle}>
                      Masal • Boyama • Analiz - Tek yerden tümü
                    </Text>
                  </View>
                  <ChevronRight size={24} color={RenkooColors.text.primary} />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Recent Analyses */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionTitleIcon, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
                  <Brain size={16} color="#A78BFA" />
                </View>
                <Text style={styles.sectionTitle}>Son Analizler</Text>
              </View>
              <Pressable
                onPress={() => router.push("/history" as Href)}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.seeAllText}>{t.home.viewAll} →</Text>
              </Pressable>
            </View>

            {analysesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={RenkooColors.brand.jellyPurple} />
              </View>
            ) : recentAnalyses.length === 0 ? (
              <OrganicContainer style={styles.emptyContainer} shape="rounded">
                <LinearGradient
                  colors={['rgba(185, 142, 255, 0.08)', 'rgba(255, 203, 164, 0.08)']}
                  style={styles.emptyGradient}
                >
                  <View style={styles.emptyIconContainer}>
                    <View style={styles.emptyIconRing}>
                      <Brain size={32} color={RenkooColors.brand.jellyPurple} />
                    </View>
                    <View style={styles.emptySparkle1}>
                      <Sparkles size={14} color="#FFD93D" />
                    </View>
                    <View style={styles.emptySparkle2}>
                      <Star size={12} color="#FF9EBF" />
                    </View>
                  </View>
                  <Text style={styles.emptyText}>Henüz analiz yok</Text>
                  <Text style={styles.emptySubtext}>
                    Çocuğunun çizimlerini keşfetmeye başla!
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.emptyCtaButton,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                    ]}
                    onPress={() => router.push("/quick-analysis" as Href)}
                  >
                    <Text style={styles.emptyCtaText}>İlk Analizi Yap</Text>
                    <ChevronRight size={16} color={RenkooColors.brand.jellyPurple} />
                  </Pressable>
                </LinearGradient>
              </OrganicContainer>
            ) : (
              <View style={styles.recentCardsContainer}>
                {recentAnalyses.map((analysis: RecentAnalysis) => (
                  <OrganicContainer key={analysis.id} style={styles.recentCard} shape="rounded">
                    <Pressable
                      style={styles.recentCardContent}
                      onPress={() => Alert.alert("Analiz Detayı", "Detay ekranı yakında!")}
                    >
                      <View style={styles.recentCardIcon}>
                        <Brain size={20} color={RenkooColors.brand.jellyPurple} />
                      </View>
                      <View style={styles.recentCardInfo}>
                        <Text style={styles.recentCardTitle} numberOfLines={1}>
                          {TASK_TYPE_LABELS[analysis.task_type as TaskType] || analysis.task_type}
                        </Text>
                        <Text style={styles.recentCardDate}>
                          {formatDate(analysis.created_at)}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={RenkooColors.text.tertiary} />
                    </Pressable>
                  </OrganicContainer>
                ))}
              </View>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionTitleIcon, { backgroundColor: 'rgba(126, 217, 156, 0.15)' }]}>
                <Clock size={16} color="#7ED99C" />
              </View>
              <Text style={styles.sectionTitle}>Bu Hafta</Text>
            </View>
            <View style={styles.statsGrid}>
              <OrganicContainer style={styles.statCard} shape="rounded">
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>Analiz</Text>
                </View>
              </OrganicContainer>

              <OrganicContainer style={styles.statCard} shape="rounded">
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalStorybooks || 0}</Text>
                  <Text style={styles.statLabel}>Masal</Text>
                </View>
              </OrganicContainer>

              <OrganicContainer style={styles.statCard} shape="rounded">
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalColorings || 0}</Text>
                  <Text style={styles.statLabel}>Boyama</Text>
                </View>
              </OrganicContainer>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>2035 Organic Biomimicry Design</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* New Badge Modal */}
      <NewBadgeModal
        visible={!!newlyUnlockedBadge}
        badge={newlyUnlockedBadge}
        onClose={clearNewBadge}
      />
    </View>
  );
}

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
  },

  // Hero Section
  heroSection: {
    paddingTop: spacing["4"],
    marginBottom: spacing["4"],
  },
  heroCard: {
    padding: spacing["5"],
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing["4"],
  },
  mascotContainer: {
    alignItems: 'center',
  },
  chatHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 142, 255, 0.15)',
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
    borderRadius: 12,
    marginTop: spacing["2"],
    gap: spacing["1"],
  },
  chatHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: RenkooColors.brand.jellyPurple,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroGreeting: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: RenkooColors.text.primary,
    marginBottom: spacing["1"],
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: RenkooColors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing["2"],
  },
  mascotIntro: {
    backgroundColor: 'rgba(255, 203, 164, 0.15)',
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 213, 255, 0.3)',
  },
  mascotIntroText: {
    fontSize: 13,
    color: RenkooColors.text.secondary,
    textAlign: 'center',
  },
  mascotName: {
    fontWeight: '700',
    color: RenkooColors.brand.jellyPurple,
  },

  // Gamification Section
  gamificationSection: {
    marginBottom: spacing["4"],
  },
  gamificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["3"],
  },
  xpContainer: {
    flex: 1,
  },
  badgesButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },

  // Primary CTA - Duygu Yansıması (Above the fold)
  primaryCtaCard: {
    marginBottom: spacing["4"],
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryCtaGradient: {
    padding: spacing["5"],
    position: 'relative',
  },
  primaryCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["4"],
  },
  primaryCtaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaTextContainer: {
    flex: 1,
  },
  primaryCtaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing["2"],
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: spacing["1"],
  },
  primaryCtaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  primaryCtaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  primaryCtaSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  primaryCtaShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // CTA Section (Secondary)
  ctaSection: {
    alignItems: 'center',
    marginBottom: spacing["6"],
  },

  // Features Section
  featuresSection: {
    marginBottom: spacing["6"],
  },
  featureCardsGrid: {
    gap: spacing["3"],
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: spacing["6"],
  },
  compactCardsRow: {
    flexDirection: 'row',
    gap: spacing["3"],
  },

  // Atolye Section
  atolyeSection: {
    marginBottom: spacing["6"],
  },
  atolyeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#B98EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  atolyeGradient: {
    padding: spacing["5"],
  },
  atolyeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["4"],
  },
  atolyeEmoji: {
    fontSize: 36,
  },
  atolyeTextContainer: {
    flex: 1,
  },
  atolyeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: RenkooColors.text.primary,
    marginBottom: 4,
  },
  atolyeSubtitle: {
    fontSize: 13,
    color: RenkooColors.text.secondary,
  },

  // Section Styles
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing["4"],
    gap: spacing["2"],
  },
  sectionTitleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(185, 142, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: RenkooColors.text.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing["4"],
  },
  seeAllText: {
    fontSize: 14,
    color: RenkooColors.brand.jellyPurple,
    fontWeight: '600',
  },

  // Recent Section
  recentSection: {
    marginBottom: spacing["6"],
  },
  loadingContainer: {
    paddingVertical: spacing["6"],
    alignItems: 'center',
  },
  emptyContainer: {
    overflow: 'hidden',
  },
  emptyGradient: {
    alignItems: 'center',
    padding: spacing["6"],
    gap: spacing["3"],
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: spacing["2"],
  },
  emptyIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(185, 142, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(185, 142, 255, 0.3)',
  },
  emptySparkle1: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  emptySparkle2: {
    position: 'absolute',
    bottom: 4,
    left: -8,
  },
  emptyContent: {
    alignItems: 'center',
    gap: spacing["2"],
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: RenkooColors.text.primary,
  },
  emptySubtext: {
    fontSize: 14,
    color: RenkooColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(185, 142, 255, 0.15)',
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["5"],
    borderRadius: 20,
    marginTop: spacing["2"],
    gap: spacing["1"],
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: RenkooColors.brand.jellyPurple,
  },
  recentCardsContainer: {
    gap: spacing["3"],
  },
  recentCard: {
    padding: spacing["4"],
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["3"],
  },
  recentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(185, 142, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: RenkooColors.text.primary,
  },
  recentCardDate: {
    fontSize: 12,
    color: RenkooColors.text.tertiary,
    marginTop: 2,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing["6"],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing["3"],
  },
  statCard: {
    flex: 1,
    padding: spacing["4"],
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: RenkooColors.brand.jellyPurple,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: RenkooColors.text.secondary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing["4"],
  },
  footerText: {
    fontSize: 11,
    color: RenkooColors.text.muted,
    letterSpacing: 1,
  },
});
