/**
 * Home Screen (Ana Sayfa)
 * Professional home screen for parents, teachers, and professionals
 * Includes Ioo mascot, gamification, and all key features
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
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
  Trophy,
  Camera,
  Image as ImageIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Href } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Colors, RenkooColors, EtherealColors } from "@/constants/colors";
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

// Components
import { Ioo as IooMascot } from "@/components/Ioo";
import { OrganicContainer } from "@/components/OrganicContainer";
import { FeatureCard, FeatureCardCompact } from "@/components/FeatureCard";
import { JellyButton } from "@/components/JellyButton";
import { ChildSelectorChip } from "@/components/ChildSelectorChip";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

type TaskType = "DAP" | "HTP" | "Family" | "Cactus" | "Tree" | "Garden" | "BenderGestalt2" | "ReyOsterrieth" | "Aile" | "Kaktus" | "Agac" | "Bahce" | "Bender" | "Rey" | "Luscher";

interface RecentAnalysis {
  id: string;
  task_type: TaskType;
  created_at: string;
  child_name?: string;
  child_age?: number;
  is_favorite?: boolean;
}

interface ChildData {
  id?: string;
  name: string;
  avatar_url?: string;
  age?: number;
}

interface ProcessedChild {
  id: string;
  name: string;
  avatarUrl?: string;
  age?: number;
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
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

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

  // Fetch children
  const {
    data: childrenData,
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = trpc.user.getChildren.useQuery(undefined, {
    enabled: !!user?.userId,
  });

  // Process children data
  const children: ProcessedChild[] = useMemo(() => {
    return (childrenData || []).map((child: ChildData) => ({
      id: child.id || `child-${child.name}`,
      name: child.name,
      avatarUrl: child.avatar_url,
      age: child.age,
    }));
  }, [childrenData]);

  const selectedChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId);
  }, [children, selectedChildId]);

  // Set initial selected child
  useEffect(() => {
    if (children.length && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fetch recent analyses
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
      childName: selectedChild?.name,
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

  // Get dynamic greeting
  const greeting = useMemo(() => {
    return GreetingService.getFormattedGreeting();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchChildren(),
      refetchAnalyses(),
      refetchStats(),
      refreshGamification(),
    ]);
    setRefreshing(false);
  }, [refetchChildren, refetchAnalyses, refetchStats, refreshGamification]);

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
  const stats = userStats || { totalAnalyses: 0, totalStorybooks: 0, totalColorings: 0, totalActivities: 0 };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={[EtherealColors.core.celestial, '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
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
              tintColor={Colors.primary.sunset}
            />
          }
        >
          {/* Child Selector */}
          <View style={styles.childSelectorSection}>
            <ChildSelectorChip
              selectedChild={selectedChild ? {
                name: selectedChild.name,
                age: selectedChild.age || 0,
                avatarId: selectedChild.avatarUrl,
              } : null}
              childrenList={children.map(c => ({
                name: c.name,
                age: c.age || 0,
                avatarId: c.avatarUrl,
              }))}
              onSelectChild={(child) => {
                const found = children.find(c => c.name === child.name);
                if (found) setSelectedChildId(found.id);
              }}
              compact
            />
          </View>

          {/* Hero Section with Mascot */}
          <View style={styles.heroSection}>
            <OrganicContainer
              style={styles.heroCard}
              shape="blob"
              glowColor="rgba(255, 203, 164, 0.3)"
              animated
            >
              <View style={styles.heroContent}>
                {/* Mascot - New Ioo Light Drop */}
                <View style={styles.mascotContainer}>
                  <IooMascot
                    size={isSmallDevice ? "medium" : "large"}
                    animated
                    showGlow
                    mood="happy"
                    onPress={() => router.push("/chatbot" as Href)}
                  />
                  <View style={styles.chatHint}>
                    <MessageCircle size={12} color={Colors.primary.sunset} />
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

          {/* PRIMARY CTA: Duygu Yansıması - Detailed Analysis */}
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

          {/* Feature Cards - Ioo Chat */}
          <View style={styles.featuresSection}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleIcon}>
                <Sparkles size={16} color={Colors.primary.sunset} />
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
                onPress={() => router.push("/stories" as Href)}
              />
              <FeatureCardCompact
                title="Boyama"
                icon={<Palette size={22} color={RenkooColors.featureCards.coloring.icon} />}
                type="coloring"
                onPress={() => router.push("/coloring-history" as Href)}
              />
              <FeatureCardCompact
                title="Ödüller"
                icon={<Gift size={22} color={RenkooColors.featureCards.reward?.icon || '#F59E0B'} />}
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
                <Text style={styles.seeAllText}>Tümünü Gör →</Text>
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
                  <ChevronRight size={24} color={Colors.neutral.darker} />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Recent Analyses Section */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionTitleIcon, { backgroundColor: 'rgba(185, 142, 255, 0.15)' }]}>
                  <Clock size={16} color={Colors.primary.sunset} />
                </View>
                <Text style={styles.sectionTitle}>Son Analizler</Text>
              </View>
              {recentAnalyses.length > 0 && (
                <Pressable
                  onPress={() => router.push("/history" as Href)}
                  style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                >
                  <Text style={styles.seeAllText}>Tümünü Gör →</Text>
                </Pressable>
              )}
            </View>

            {analysesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary.sunset} />
              </View>
            ) : recentAnalyses.length === 0 ? (
              <OrganicContainer style={styles.emptyContainer}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.95)']}
                  style={styles.emptyGradient}
                >
                  <View style={styles.emptyIconContainer}>
                    <View style={styles.emptyIconRing}>
                      <Brain size={28} color={Colors.primary.sunset} />
                    </View>
                    <View style={styles.emptySparkle1}>
                      <Sparkles size={14} color="#FFD700" />
                    </View>
                  </View>
                  <View style={styles.emptyContent}>
                    <Text style={styles.emptyText}>Henüz analiz yok</Text>
                    <Text style={styles.emptySubtext}>
                      Çizim yükleyerek ilk analizinizi yapın
                    </Text>
                  </View>
                  <Pressable
                    style={styles.emptyCtaButton}
                    onPress={() => router.push("/advanced-analysis" as Href)}
                  >
                    <Camera size={16} color={Colors.primary.sunset} />
                    <Text style={styles.emptyCtaText}>İlk Analizi Başlat</Text>
                  </Pressable>
                </LinearGradient>
              </OrganicContainer>
            ) : (
              <View style={styles.recentCardsContainer}>
                {recentAnalyses.map((analysis: RecentAnalysis) => (
                  <Pressable
                    key={analysis.id}
                    style={({ pressed }) => [
                      styles.recentCard,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => router.push(`/analysis/${analysis.id}` as Href)}
                  >
                    <OrganicContainer style={styles.recentCardInner}>
                      <View style={styles.recentCardContent}>
                        <View style={styles.recentCardIcon}>
                          <Brain size={20} color={Colors.primary.sunset} />
                        </View>
                        <View style={styles.recentCardInfo}>
                          <Text style={styles.recentCardTitle}>
                            {TASK_TYPE_LABELS[analysis.task_type] || analysis.task_type}
                          </Text>
                          <Text style={styles.recentCardDate}>
                            {formatDate(analysis.created_at)}
                            {analysis.child_name && ` • ${analysis.child_name}`}
                          </Text>
                        </View>
                        <ChevronRight size={18} color={Colors.neutral.medium} />
                      </View>
                    </OrganicContainer>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionTitleIcon, { backgroundColor: 'rgba(111, 237, 214, 0.15)' }]}>
                <TrendingUp size={16} color="#4ECDC4" />
              </View>
              <Text style={styles.sectionTitle}>Bu Ay</Text>
            </View>

            <View style={styles.statsGrid}>
              <OrganicContainer style={styles.statCard}>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>ANALİZ</Text>
                </View>
              </OrganicContainer>
              <OrganicContainer style={styles.statCard}>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalActivities || 0}</Text>
                  <Text style={styles.statLabel}>AKTİVİTE</Text>
                </View>
              </OrganicContainer>
              <OrganicContainer style={styles.statCard}>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalStorybooks || 0}</Text>
                  <Text style={styles.statLabel}>MASAL</Text>
                </View>
              </OrganicContainer>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>RENKIOO • DUYGULARIN RENGİ</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* New Badge Modal */}
      {newlyUnlockedBadge && (
        <NewBadgeModal
          badge={newlyUnlockedBadge}
          visible={!!newlyUnlockedBadge}
          onClose={clearNewBadge}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["4"],
    paddingTop: spacing["3"],
  },

  // Child Selector
  childSelectorSection: {
    marginBottom: spacing["4"],
    paddingHorizontal: spacing["2"],
  },

  // Hero Section
  heroSection: {
    marginBottom: spacing["4"],
  },
  heroCard: {
    padding: spacing["5"],
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["4"],
  },
  mascotContainer: {
    alignItems: 'center',
    gap: spacing["1"],
    marginLeft: -spacing["2"],
    marginRight: spacing["2"],
  },
  chatHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chatHintText: {
    fontSize: 10,
    color: Colors.primary.sunset,
    fontWeight: '500',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral.darker,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.neutral.dark,
    marginBottom: spacing["3"],
  },
  mascotIntro: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  mascotIntroText: {
    fontSize: 12,
    color: Colors.neutral.dark,
    lineHeight: 18,
  },
  mascotName: {
    fontWeight: '700',
    color: Colors.primary.sunset,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Primary CTA
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

  // Features Section
  featuresSection: {
    marginBottom: spacing["4"],
  },
  featureCardsGrid: {
    gap: spacing["3"],
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: spacing["4"],
  },
  compactCardsRow: {
    flexDirection: 'row',
    gap: spacing["3"],
  },

  // Atolye Section
  atolyeSection: {
    marginBottom: spacing["4"],
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
    color: Colors.neutral.darker,
    marginBottom: 4,
  },
  atolyeSubtitle: {
    fontSize: 13,
    color: Colors.neutral.dark,
  },

  // Section Styles
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing["3"],
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
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.darker,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing["3"],
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary.sunset,
    fontWeight: '600',
  },

  // Recent Section
  recentSection: {
    marginBottom: spacing["4"],
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
  emptyContent: {
    alignItems: 'center',
    gap: spacing["2"],
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.darker,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral.medium,
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
    gap: spacing["2"],
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.sunset,
  },
  recentCardsContainer: {
    gap: spacing["3"],
  },
  recentCard: {
    // Wrapper for pressable
  },
  recentCardInner: {
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
    color: Colors.neutral.darker,
  },
  recentCardDate: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 2,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing["4"],
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
    color: Colors.primary.sunset,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral.medium,
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing["4"],
  },
  footerText: {
    fontSize: 11,
    color: Colors.neutral.medium,
    letterSpacing: 1,
  },
});
