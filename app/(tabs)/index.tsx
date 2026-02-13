/**
 * Home Screen (Ana Sayfa)
 * Role-aware professional home screen for parents, teachers, and professionals
 * Features adapt based on user role: gamification visibility, mascot prominence, tools access
 * Part of #17: Profesyonel Dashboard Tasarımı
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Modal,
} from 'react-native';
import {
  BookOpen,
  Palette,
  Brain,
  Clock,
  ChevronRight,
  Trophy,
  Camera,
  X,
  Wand2,
  FileText,
  MessageCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Colors, ProfessionalColors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { spacing, shadows, radius, typography } from '@/constants/design-system';
import { GreetingService } from '@/lib/services/greeting-service';
import { useGamification } from '@/lib/gamification';
import { StreakDisplay, XPProgressBar, NewBadgeModal } from '@/components/gamification';

// Role Context
import {
  useRole,
  useGamification as useGamificationSettings,
  useMascotSettings,
  useRoleText,
  useIsProfessional,
} from '@/lib/contexts/RoleContext';

// Components
import { Ioo as IooMascot } from '@/components/Ioo';
import { ChildSelectorChip } from '@/components/ChildSelectorChip';
import { FeatureTour, isFeatureDiscovered } from '@/components/tutorial/FeatureDiscovery';

// Dashboard Components
import {
  DashboardHeader,
  DashboardSummaryCards,
  ProfessionalToolsSection,
  RecentActivityList,
} from '@/components/dashboard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const _isSmallDevice = SCREEN_HEIGHT < 700;

type TaskType =
  | 'DAP'
  | 'HTP'
  | 'Family'
  | 'Cactus'
  | 'Tree'
  | 'Garden'
  | 'BenderGestalt2'
  | 'ReyOsterrieth'
  | 'Aile'
  | 'Kaktus'
  | 'Agac'
  | 'Bahce'
  | 'Bender'
  | 'Rey'
  | 'Luscher';

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
  DAP: 'İnsan Çizimi',
  HTP: 'Ev-Ağaç-İnsan',
  Family: 'Aile Çizimi',
  Aile: 'Aile Çizimi',
  Cactus: 'Kaktüs Testi',
  Kaktus: 'Kaktüs Testi',
  Tree: 'Ağaç Testi',
  Agac: 'Ağaç Testi',
  Garden: 'Bahçe Testi',
  Bahce: 'Bahçe Testi',
  BenderGestalt2: 'Bender Gestalt',
  Bender: 'Bender Gestalt',
  ReyOsterrieth: 'Rey Figure',
  Rey: 'Rey Figure',
  Luscher: 'Luscher Renk',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t: _t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Tour target refs
  const heroRef = useRef<View>(null);
  const analysisRef = useRef<View>(null);
  const storyRef = useRef<View>(null);
  const coloringRef = useRef<View>(null);

  // Role Context hooks
  const { role: _role, config: _roleConfig } = useRole();
  const gamificationSettings = useGamificationSettings();
  const mascotSettings = useMascotSettings();
  const isProfessional = useIsProfessional();
  const _ctaText = useRoleText('cta_new_analysis');
  const _childrenTitle = useRoleText('children_title');

  // Gamification hook (only active for non-professionals)
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

  // Should show gamification elements based on role
  const showGamification = gamificationSettings.isEnabled && !isProfessional;

  // Fetch children
  const {
    data: childrenData,
    isLoading: _childrenLoading,
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
      sortBy: 'created_at',
      sortOrder: 'desc',
      childName: selectedChild?.name,
    },
    { enabled: !!user?.userId }
  );

  // Fetch user stats
  const { data: userStats, refetch: refetchStats } = trpc.user.getUserStats.useQuery(undefined, {
    enabled: !!user?.userId,
  });

  // Get dynamic greeting
  const greeting = useMemo(() => {
    return GreetingService.getFormattedGreeting();
  }, []);

  // Check if home tour has been completed
  useEffect(() => {
    const checkTour = async () => {
      const discovered = await isFeatureDiscovered('tour_home_intro');
      if (!discovered && !isProfessional) {
        // Small delay to let layout settle before measuring
        setTimeout(() => setShowTour(true), 800);
      }
    };
    checkTour();
  }, [isProfessional]);

  // Tour steps
  const tourSteps = useMemo(
    () => [
      {
        id: 'home_ioo',
        title: 'Merhaba, ben Ioo!',
        description:
          'Çocuğunuzun gelişim yolculuğunda size rehberlik edeceğim. Bana her zaman sorularınızı sorabilirsiniz.',
        targetRef: heroRef,
        position: 'bottom' as const,
      },
      {
        id: 'home_analysis',
        title: 'Çizim Analizi',
        description:
          'Çocuğunuzun çizimlerini fotoğraflayın, yapay zeka ile derinlemesine psikolojik analiz alın.',
        targetRef: analysisRef,
        position: 'bottom' as const,
      },
      {
        id: 'home_story',
        title: 'AI Masal',
        description: 'Çocuğunuza özel, kişiselleştirilmiş masallar oluşturun. Her masal benzersiz!',
        targetRef: storyRef,
        position: 'bottom' as const,
      },
      {
        id: 'home_coloring',
        title: 'Boyama Kitabı',
        description:
          'Dijital boyama kitabı ile çocuğunuzun yaratıcılığını ve renk algısını destekleyin.',
        targetRef: coloringRef,
        position: 'bottom' as const,
      },
    ],
    []
  );

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
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  const recentAnalyses = recentAnalysesData?.analyses || [];
  const stats = useMemo(
    () =>
      userStats || {
        totalAnalyses: 0,
        totalStorybooks: 0,
        totalColorings: 0,
        totalActivities: 0,
      },
    [userStats]
  );

  // Smart suggestion based on user activity
  const suggestion = useMemo(() => {
    const { totalAnalyses, totalStorybooks, totalColorings } = stats;
    if (totalAnalyses === 0) {
      return {
        icon: Camera,
        color: colors.secondary.lavender,
        title: 'İlk adımı atın',
        text: 'Bir çizim fotoğraflayarak çocuğunuzun iç dünyasını keşfedin.',
        cta: 'Analiz Başlat',
        route: '/(tabs)/analysis' as Href,
      };
    }
    if (totalStorybooks === 0) {
      return {
        icon: BookOpen,
        color: colors.secondary.sunshine,
        title: 'Masal dünyasını keşfedin',
        text: 'Çocuğunuza özel yapay zeka destekli masallar oluşturun.',
        cta: 'Masal Oluştur',
        route: '/stories' as Href,
      };
    }
    if (totalColorings === 0) {
      return {
        icon: Palette,
        color: colors.secondary.grass,
        title: 'Boyama kitabını deneyin',
        text: 'Dijital boyama ile yaratıcılığı ve renk algısını destekleyin.',
        cta: 'Boyamaya Başla',
        route: '/coloring-history' as Href,
      };
    }
    return null; // No suggestion needed — user has tried everything
  }, [stats, colors]);

  // Unified page background for all roles
  const backgroundGradient = colors.background.pageGradient;

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral.white }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <LinearGradient
        colors={[...backgroundGradient] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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
              tintColor={colors.primary.sunset}
            />
          }
        >
          {/* Child/Client Selector - Only show if there are children */}
          {children.length > 0 && (
            <View style={styles.childSelectorSection}>
              <ChildSelectorChip
                selectedChild={
                  selectedChild
                    ? {
                        name: selectedChild.name,
                        age: selectedChild.age || 0,
                        avatarId: selectedChild.avatarUrl,
                      }
                    : null
                }
                childrenList={children.map(c => ({
                  name: c.name,
                  age: c.age || 0,
                  avatarId: c.avatarUrl,
                }))}
                onSelectChild={child => {
                  const found = children.find(c => c.name === child.name);
                  if (found) setSelectedChildId(found.id);
                }}
                compact
              />
            </View>
          )}

          {/* Hero Section with Role-aware content */}
          <View style={styles.heroSection}>
            {isProfessional ? (
              /* Professional Header - Simpler, no mascot prominence */
              <DashboardHeader
                userName={user?.name}
                onMascotPress={() => router.push('/chatbot' as Href)}
                onSettingsPress={() => router.push('/profile' as Href)}
                notificationCount={0}
              />
            ) : (
              /* Parent Mode - Clean, minimal greeting card */
              <View
                ref={heroRef}
                collapsable={false}
                style={[styles.heroCardClean, { backgroundColor: colors.surface.card }]}
              >
                <View style={styles.heroContent}>
                  {/* Mascot - Compact */}
                  {mascotSettings.showOnDashboard && (
                    <Pressable
                      style={styles.mascotContainerCompact}
                      onPress={() => router.push('/chatbot' as Href)}
                    >
                      <IooMascot size="xs" animated showGlow={false} mood="happy" />
                    </Pressable>
                  )}

                  {/* Welcome Text */}
                  <View style={styles.heroTextContainer}>
                    <Text
                      style={[styles.heroGreeting, { color: colors.text.primary }]}
                      numberOfLines={1}
                    >
                      {greeting.title}
                    </Text>
                    <Text
                      style={[styles.heroSubtitle, { color: colors.text.tertiary }]}
                      numberOfLines={1}
                    >
                      {greeting.subtitle}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions — 3-item horizontal row (Parent mode) */}
          {!isProfessional && (
            <View style={styles.quickActionRow}>
              <View ref={analysisRef} collapsable={false} style={styles.quickActionRefWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.quickActionItem,
                    { backgroundColor: colors.surface.card },
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => router.push('/(tabs)/analysis' as Href)}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: colors.secondary.lavender + '1F' },
                    ]}
                  >
                    <Brain size={22} color={colors.secondary.lavender} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.text.primary }]}>
                    Analiz
                  </Text>
                </Pressable>
              </View>
              <View ref={storyRef} collapsable={false} style={styles.quickActionRefWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.quickActionItem,
                    { backgroundColor: colors.surface.card },
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => router.push('/stories' as Href)}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: colors.secondary.sunshine + '1F' },
                    ]}
                  >
                    <BookOpen size={22} color={colors.secondary.sunshine} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.text.primary }]}>
                    Masal
                  </Text>
                </Pressable>
              </View>
              <View ref={coloringRef} collapsable={false} style={styles.quickActionRefWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.quickActionItem,
                    { backgroundColor: colors.surface.card },
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => router.push('/coloring-history' as Href)}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: colors.secondary.grass + '1F' },
                    ]}
                  >
                    <Palette size={22} color={colors.secondary.grass} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: colors.text.primary }]}>
                    Boyama
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Smart Suggestion Card — contextual based on user activity */}
          {!isProfessional && suggestion && (
            <Pressable
              style={({ pressed }) => [
                styles.suggestionCard,
                { backgroundColor: colors.surface.card },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push(suggestion.route)}
            >
              <View style={[styles.suggestionIcon, { backgroundColor: suggestion.color + '1F' }]}>
                <suggestion.icon size={20} color={suggestion.color} />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: colors.text.primary }]}>
                  {suggestion.title}
                </Text>
                <Text
                  style={[styles.suggestionText, { color: colors.text.tertiary }]}
                  numberOfLines={2}
                >
                  {suggestion.text}
                </Text>
              </View>
              <View style={[styles.suggestionCta, { backgroundColor: suggestion.color }]}>
                <Text style={styles.suggestionCtaText}>{suggestion.cta}</Text>
                <ChevronRight size={14} color={Colors.neutral.white} />
              </View>
            </Pressable>
          )}

          {/* Compact Progress Row - Only show when user has activity */}
          {!isProfessional &&
            showGamification &&
            !gamificationLoading &&
            (streakData?.currentStreak > 0 || totalXp > 0) && (
              <View style={[styles.progressRowCompact, { backgroundColor: colors.surface.card }]}>
                <StreakDisplay
                  currentStreak={streakData?.currentStreak || 0}
                  longestStreak={streakData?.longestStreak || 0}
                  isActiveToday={
                    streakData?.lastActivityDate === new Date().toISOString().split('T')[0]
                  }
                  streakAtRisk={
                    !streakData?.lastActivityDate ||
                    (streakData?.currentStreak > 0 &&
                      streakData?.lastActivityDate !== new Date().toISOString().split('T')[0] &&
                      streakData?.lastActivityDate !==
                        (() => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return yesterday.toISOString().split('T')[0];
                        })())
                  }
                  hasFreezeAvailable={streakData?.streakFreezeAvailable}
                  size="compact"
                  onPress={() => router.push('/profile' as Href)}
                />
                <View style={styles.xpContainer}>
                  <XPProgressBar
                    level={levelInfo.level}
                    xpProgress={levelInfo.xpProgress}
                    xpNeeded={levelInfo.xpNeeded}
                    totalXp={totalXp}
                    progressPercent={levelInfo.progressPercent}
                    size="compact"
                    onPress={() => router.push('/profile' as Href)}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.badgesButton, pressed && { opacity: 0.8 }]}
                  onPress={() => router.push('/profile' as Href)}
                >
                  <Trophy size={18} color={colors.semantic.amber} />
                </Pressable>
              </View>
            )}

          {/* Professional Summary Cards - For experts and teachers */}
          {isProfessional && (
            <DashboardSummaryCards
              stats={{
                totalAnalyses: stats.totalAnalyses || 0,
                weeklyAnalyses: ('totalActivities' in stats ? stats.totalActivities : 0) || 0,
                monthlyAnalyses: (stats.totalAnalyses || 0) + (stats.totalStorybooks || 0),
                childrenCount: children.length,
                pendingReviews: 0,
                recentTrend: 'up',
                trendPercent: 12,
              }}
              onCardPress={cardType => {
                if (cardType === 'total' || cardType === 'cases') {
                  router.push('/history' as Href);
                } else if (
                  cardType === 'children' ||
                  cardType === 'clients' ||
                  cardType === 'students'
                ) {
                  router.push('/profile' as Href);
                }
              }}
              isLoading={analysesLoading}
            />
          )}

          {/* Professional Tools Section - For experts and teachers */}
          {isProfessional && (
            <ProfessionalToolsSection
              onToolPress={(toolId, route) => {
                if (route) {
                  router.push(route as Href);
                }
              }}
            />
          )}

          {/* Section Divider */}
          {!isProfessional && (
            <View
              style={[styles.sectionDivider, { backgroundColor: colors.border.light + '40' }]}
            />
          )}

          {/* Recent Analyses Section - Role-aware */}
          {isProfessional ? (
            /* Professional view with RecentActivityList */
            <RecentActivityList
              analyses={recentAnalyses.map((a: RecentAnalysis) => ({
                id: a.id,
                taskType: a.task_type,
                createdAt: a.created_at,
                childName: a.child_name,
                childAge: a.child_age,
                status: 'completed' as const,
              }))}
              isLoading={analysesLoading}
              onAnalysisPress={id => router.push(`/analysis/${id}` as Href)}
              onSeeAllPress={() => router.push('/history' as Href)}
              maxItems={5}
            />
          ) : (
            /* Parent view - Organic containers with playful design */
            <View style={styles.recentSection}>
              {/* Section Header - Secondary */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View
                    style={[
                      styles.sectionTitleIcon,
                      { backgroundColor: 'rgba(185, 142, 255, 0.15)' },
                    ]}
                  >
                    <Clock size={16} color={colors.primary.sunset} />
                  </View>
                  <Text style={[styles.sectionTitleSecondary, { color: colors.text.secondary }]}>
                    Son Analizler
                  </Text>
                </View>
                {recentAnalyses.length > 0 && (
                  <Pressable
                    onPress={() => router.push('/history' as Href)}
                    style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                  >
                    <Text style={[styles.seeAllText, { color: colors.primary.sunset }]}>
                      Tümünü Gör →
                    </Text>
                  </Pressable>
                )}
              </View>

              {analysesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.sunset} />
                </View>
              ) : recentAnalyses.length === 0 ? (
                <View
                  style={[
                    styles.emptyContainer,
                    { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                  ]}
                >
                  <IooMascot size="sm" mood="curious" animated showGlow={false} />
                  <Text style={[styles.emptyText, { color: colors.text.primary }]}>
                    Henüz bir analiz yapmadınız
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
                    Çocuğunuzun bir çizimini fotoğraflayın,{'\n'}yapay zeka ile analiz edin
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.emptyCtaButton,
                      { backgroundColor: colors.secondary.lavender },
                      pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={() => router.push('/(tabs)/analysis' as Href)}
                  >
                    <Camera size={16} color={Colors.neutral.white} />
                    <Text style={[styles.emptyCtaText, { color: Colors.neutral.white }]}>
                      İlk Analizi Başlat
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentHorizontalScroll}
                >
                  {recentAnalyses.map((analysis: RecentAnalysis) => (
                    <Pressable
                      key={analysis.id}
                      style={({ pressed }) => [
                        styles.recentCardHorizontal,
                        { backgroundColor: colors.surface.card },
                        pressed && { opacity: 0.8 },
                      ]}
                      onPress={() => router.push(`/analysis/${analysis.id}` as Href)}
                    >
                      <View
                        style={[
                          styles.recentCardIcon,
                          { backgroundColor: colors.secondary.lavender + '1F' },
                        ]}
                      >
                        <Brain size={20} color={colors.primary.sunset} />
                      </View>
                      <Text
                        style={[styles.recentCardTitle, { color: colors.text.primary }]}
                        numberOfLines={1}
                      >
                        {TASK_TYPE_LABELS[analysis.task_type] || analysis.task_type}
                      </Text>
                      <Text
                        style={[styles.recentCardDate, { color: colors.text.tertiary }]}
                        numberOfLines={1}
                      >
                        {formatDate(analysis.created_at)}
                      </Text>
                      {analysis.child_name && (
                        <Text
                          style={[styles.recentCardChild, { color: colors.primary.sunset }]}
                          numberOfLines={1}
                        >
                          {analysis.child_name}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: colors.text.tertiary },
                isProfessional && styles.footerTextProfessional,
              ]}
            >
              {isProfessional
                ? 'RENKIOO • PROFESYONEL PLATFORM'
                : 'RENKIOO • GELİŞİM TAKİP PLATFORMU'}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Home Feature Tour */}
      {!isProfessional && (
        <FeatureTour
          tourId="home_intro"
          steps={tourSteps}
          visible={showTour}
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}

      {/* New Badge Modal */}
      {newlyUnlockedBadge && (
        <NewBadgeModal
          badge={newlyUnlockedBadge}
          visible={!!newlyUnlockedBadge}
          onClose={clearNewBadge}
        />
      )}

      {/* Action Modal for Duygu Yansıması */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowActionModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface.card }]}>
            {/* Handle Bar */}
            <View style={[styles.modalHandle, { backgroundColor: colors.border.light }]} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Ne yapmak istersiniz?
              </Text>
              <Pressable
                onPress={() => setShowActionModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.neutral.lightest }]}
              >
                <X size={20} color={colors.text.tertiary} />
              </Pressable>
            </View>

            {/* Action Options */}
            <View style={styles.actionOptionsContainer}>
              {/* Detaylı Analiz */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionOption,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setShowActionModal(false);
                  router.push('/(tabs)/analysis' as Href);
                }}
              >
                <LinearGradient
                  colors={[colors.secondary.indigo, colors.secondary.violet]}
                  style={styles.actionOptionGradient}
                >
                  <View style={styles.actionOptionIcon}>
                    <Brain size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionOptionTextContainer}>
                    <Text style={styles.actionOptionTitle}>Detaylı Analiz</Text>
                    <Text style={styles.actionOptionDesc} numberOfLines={2}>
                      Projektif testler ile kapsamlı değerlendirme
                    </Text>
                  </View>
                  <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </Pressable>

              {/* Hızlı Analiz */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionOption,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setShowActionModal(false);
                  router.push('/hayal-atolyesi' as Href);
                }}
              >
                <LinearGradient
                  colors={[colors.secondary.rose, colors.secondary.roseLight]}
                  style={styles.actionOptionGradient}
                >
                  <View style={styles.actionOptionIcon}>
                    <Wand2 size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionOptionTextContainer}>
                    <Text style={styles.actionOptionTitle}>Hayal Atölyesi</Text>
                    <Text style={styles.actionOptionDesc} numberOfLines={2}>
                      Çizimden masal, boyama ve analiz
                    </Text>
                  </View>
                  <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </Pressable>

              {/* Geçmiş Analizler */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionOption,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setShowActionModal(false);
                  router.push('/history' as Href);
                }}
              >
                <LinearGradient
                  colors={[colors.secondary.grass, colors.secondary.grassLight]}
                  style={styles.actionOptionGradient}
                >
                  <View style={styles.actionOptionIcon}>
                    <FileText size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionOptionTextContainer}>
                    <Text style={styles.actionOptionTitle}>Geçmiş Analizler</Text>
                    <Text style={styles.actionOptionDesc} numberOfLines={2}>
                      Önceki analizlerinizi görüntüleyin
                    </Text>
                  </View>
                  <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </Pressable>

              {/* Ioo ile Sohbet */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionOption,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setShowActionModal(false);
                  router.push('/chatbot' as Href);
                }}
              >
                <LinearGradient
                  colors={[colors.semantic.amber, colors.semantic.amberLight]}
                  style={styles.actionOptionGradient}
                >
                  <View style={styles.actionOptionIcon}>
                    <MessageCircle size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionOptionTextContainer}>
                    <Text style={styles.actionOptionTitle}>{"Ioo'ya Sor"}</Text>
                    <Text style={styles.actionOptionDesc} numberOfLines={2}>
                      Analiz hakkında sorularınızı sorun
                    </Text>
                  </View>
                  <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
  },

  // Child Selector
  childSelectorSection: {
    marginBottom: spacing['4'],
    paddingHorizontal: spacing['2'],
  },

  // Hero Section
  heroSection: {
    marginBottom: spacing['4'],
  },
  heroCardClean: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: spacing['4'],
    ...shadows.xs,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  mascotContainerCompact: {
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darker,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },

  // Quick Action Row — 3 items, single horizontal line
  quickActionRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginBottom: spacing['4'],
  },
  quickActionRefWrap: {
    flex: 1,
  },
  quickActionItem: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['2'],
    alignItems: 'center',
    gap: spacing['2'],
    ...shadows.xs,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darker,
  },

  // Smart Suggestion Card
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: spacing['3'],
    marginBottom: spacing['4'],
    gap: spacing['3'],
    ...shadows.xs,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
    gap: 2,
  },
  suggestionTitle: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darker,
  },
  suggestionText: {
    fontSize: 12,
    color: Colors.neutral.medium,
    lineHeight: 16,
  },
  suggestionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.full,
    gap: 2,
  },
  suggestionCtaText: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },

  // Compact Progress Row
  progressRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['4'],
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: spacing['3'],
    ...shadows.xs,
  },
  sectionTitleSecondary: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
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
    ...shadows.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginVertical: spacing['3'],
    marginHorizontal: spacing['2'],
  },

  // Section Styles
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['3'],
    gap: spacing['2'],
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
    fontFamily: typography.family.bold,
    color: Colors.neutral.darker,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary.sunset,
    fontFamily: typography.family.semibold,
  },

  // Recent Section
  recentSection: {
    marginBottom: spacing['4'],
  },
  loadingContainer: {
    paddingVertical: spacing['6'],
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['6'],
    paddingHorizontal: spacing['5'],
    gap: spacing['2'],
    backgroundColor: Colors.background.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  emptyText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary.lavender,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.full,
    marginTop: spacing['3'],
    gap: spacing['2'],
    ...shadows.sm,
  },
  emptyCtaText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  recentHorizontalScroll: {
    paddingRight: spacing['4'],
    gap: spacing['3'],
  },
  recentCardHorizontal: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: spacing['4'],
    width: 140,
    alignItems: 'center',
    gap: spacing['2'],
    ...shadows.xs,
  },
  recentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(185, 142, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardTitle: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darker,
    textAlign: 'center',
  },
  recentCardDate: {
    fontSize: 11,
    color: Colors.neutral.medium,
  },
  recentCardChild: {
    fontSize: 11,
    color: Colors.primary.sunset,
    fontFamily: typography.family.medium,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['4'],
  },
  footerText: {
    fontSize: 11,
    color: Colors.neutral.medium,
    letterSpacing: 1,
  },
  footerTextProfessional: {
    color: ProfessionalColors.text.tertiary,
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['8'],
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing['3'],
    marginBottom: spacing['4'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['5'],
    paddingHorizontal: spacing['2'],
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darker,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.lightest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOptionsContainer: {
    gap: spacing['3'],
  },
  actionOption: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['4'],
    gap: spacing['4'],
  },
  actionOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOptionTextContainer: {
    flex: 1,
  },
  actionOptionTitle: {
    fontSize: 17,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    marginBottom: 2,
  },
  actionOptionDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
});
