/**
 * Home Screen (Ana Sayfa)
 * Role-aware professional home screen for parents, teachers, and professionals
 * Features adapt based on user role: gamification visibility, mascot prominence, tools access
 * Part of #17: Profesyonel Dashboard Tasarımı
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  TrendingUp,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Gift,
  Trophy,
  Camera,
  X,
  Wand2,
  FileText,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Colors, RenkooColors, ProfessionalColors } from '@/constants/colors';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { spacing, shadows } from '@/constants/design-system';
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
import { OrganicContainer } from '@/components/OrganicContainer';
import { FeatureCardCompact } from '@/components/FeatureCard';
import { ChildSelectorChip } from '@/components/ChildSelectorChip';

// Dashboard Components
import {
  DashboardHeader,
  DashboardSummaryCards,
  ProfessionalToolsSection,
  RecentActivityList,
} from '@/components/dashboard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

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
  const { t: _t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

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
  const stats = userStats || {
    totalAnalyses: 0,
    totalStorybooks: 0,
    totalColorings: 0,
    totalActivities: 0,
  };

  // Unified page background for all roles
  const backgroundGradient = Colors.background.pageGradient;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={backgroundGradient}
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
              tintColor={Colors.primary.sunset}
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
              /* Parent Mode - With mascot and gamification flavor */
              <OrganicContainer
                style={styles.heroCard}
                shape="blob"
                glowColor="rgba(255, 203, 164, 0.3)"
                animated
              >
                <View style={styles.heroContent}>
                  {/* Mascot - Only shown if enabled for role */}
                  {mascotSettings.showOnDashboard && (
                    <View style={styles.mascotContainer}>
                      <IooMascot
                        size={isSmallDevice ? 'xs' : 'small'}
                        animated
                        showGlow={mascotSettings.prominence === 'high'}
                        mood="happy"
                        onPress={() => router.push('/chatbot' as Href)}
                      />
                      {mascotSettings.prominence === 'high' && (
                        <View style={styles.chatHint}>
                          <MessageCircle size={12} color={Colors.primary.sunset} />
                          <Text style={styles.chatHintText}>Yardıma mı ihtiyacınız var?</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Welcome Text */}
                  <View
                    style={[
                      styles.heroTextContainer,
                      !mascotSettings.showOnDashboard && { flex: 1 },
                    ]}
                  >
                    <Text style={styles.heroGreeting} numberOfLines={1}>
                      {greeting.title}
                    </Text>
                    <Text style={styles.heroSubtitle} numberOfLines={2}>
                      {greeting.subtitle}
                    </Text>
                    {mascotSettings.showOnDashboard && mascotSettings.prominence === 'high' && (
                      <View style={styles.mascotIntro}>
                        <Text style={styles.mascotIntroText} numberOfLines={3}>
                          Ben <Text style={styles.mascotName}>Ioo</Text>, çocuğunuzun gelişim
                          yolculuğunda yanınızdayım
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </OrganicContainer>
            )}
          </View>

          {/* PRIMARY CTA: Right after Hero for immediate visibility (Parent mode) */}
          {!isProfessional && (
            <Pressable
              onPress={() => setShowActionModal(true)}
              style={({ pressed }) => [
                styles.primaryCtaCard,
                pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
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
                    <Text style={styles.primaryCtaSubtitle} numberOfLines={2} ellipsizeMode="tail">
                      Çocuğunuzun çizimlerinden duygusal dünyasını keşfedin
                    </Text>
                  </View>
                  <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
                </View>
                <View style={styles.primaryCtaShine} />
              </LinearGradient>
            </Pressable>
          )}

          {/* Progress & Stats Combined Section - Parent mode */}
          {!isProfessional && (
            <View style={styles.progressSection}>
              {/* Section Header with Primary Styling */}
              <View style={styles.sectionHeaderPrimary}>
                <View style={styles.sectionTitleRow}>
                  <View
                    style={[
                      styles.sectionTitleIcon,
                      { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                    ]}
                  >
                    <TrendingUp size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.sectionTitlePrimary}>İlerleme</Text>
                </View>
              </View>

              {/* Gamification Row - Compact */}
              {showGamification && !gamificationLoading && (
                <View style={styles.gamificationRow}>
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
                    <Trophy size={18} color="#F59E0B" />
                  </Pressable>
                </View>
              )}

              {/* Mini Stats Row - Combined with Gamification */}
              <View style={styles.miniStatsRow}>
                <View style={styles.miniStatItem}>
                  <Text style={styles.miniStatNumber}>{stats.totalAnalyses || 0}</Text>
                  <Text style={styles.miniStatLabel}>Analiz</Text>
                </View>
                <View style={styles.miniStatDivider} />
                <View style={styles.miniStatItem}>
                  <Text style={styles.miniStatNumber}>
                    {'totalActivities' in stats
                      ? stats.totalActivities
                      : (stats.totalStorybooks || 0) +
                        (stats.totalColorings || 0) +
                        (stats.totalAnalyses || 0)}
                  </Text>
                  <Text style={styles.miniStatLabel}>Aktivite</Text>
                </View>
                <View style={styles.miniStatDivider} />
                <View style={styles.miniStatItem}>
                  <Text style={styles.miniStatNumber}>{stats.totalStorybooks || 0}</Text>
                  <Text style={styles.miniStatLabel}>Masal</Text>
                </View>
              </View>
            </View>
          )}

          {/* Section Divider */}
          {!isProfessional && <View style={styles.sectionDivider} />}

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

          {/* Unified "Keşfet" Section - Combined Features & Quick Actions (Parent mode) */}
          {!isProfessional && (
            <View style={styles.exploreSection}>
              {/* Section Header - Primary */}
              <View style={styles.sectionHeaderPrimary}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionTitleIcon}>
                    <Sparkles size={16} color={Colors.primary.sunset} />
                  </View>
                  <Text style={styles.sectionTitlePrimary}>Keşfet</Text>
                </View>
              </View>

              {/* Hayal Atölyesi - Featured Card */}
              <Pressable
                style={({ pressed }) => [
                  styles.atolyeCard,
                  pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push('/hayal-atolyesi' as Href)}
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
                      <Text style={styles.atolyeTitle}>Hayal Atölyesi</Text>
                      <Text style={styles.atolyeSubtitle}>Çizimden Masal • Boyama • Analiz</Text>
                    </View>
                    <ChevronRight size={24} color={Colors.neutral.darker} />
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Quick Actions Row */}
              <View style={styles.quickActionsRow}>
                <FeatureCardCompact
                  title="Ioo"
                  icon={<MessageCircle size={22} color={RenkooColors.featureCards.chat.icon} />}
                  type="chat"
                  onPress={() => router.push('/chatbot' as Href)}
                />
                <FeatureCardCompact
                  title="Masal"
                  icon={<BookOpen size={22} color={RenkooColors.featureCards.story.icon} />}
                  type="story"
                  onPress={() => router.push('/stories' as Href)}
                />
                <FeatureCardCompact
                  title="Boyama"
                  icon={<Palette size={22} color={RenkooColors.featureCards.coloring.icon} />}
                  type="coloring"
                  onPress={() => router.push('/coloring-history' as Href)}
                />
                <FeatureCardCompact
                  title="Ödüller"
                  icon={
                    <Gift size={22} color={RenkooColors.featureCards.reward?.icon || '#F59E0B'} />
                  }
                  type="reward"
                  onPress={() => router.push('/profile' as Href)}
                />
              </View>
            </View>
          )}

          {/* Section Divider */}
          {!isProfessional && <View style={styles.sectionDivider} />}

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
                    <Clock size={16} color={Colors.primary.sunset} />
                  </View>
                  <Text style={styles.sectionTitleSecondary}>Son Analizler</Text>
                </View>
                {recentAnalyses.length > 0 && (
                  <Pressable
                    onPress={() => router.push('/history' as Href)}
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
                      onPress={() => router.push('/advanced-analysis' as Href)}
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
                      style={({ pressed }) => [styles.recentCard, pressed && { opacity: 0.8 }]}
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
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, isProfessional && styles.footerTextProfessional]}>
              {isProfessional ? 'RENKIOO • PROFESYONEL PLATFORM' : 'RENKIOO • DUYGULARIN RENGİ'}
            </Text>
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

      {/* Action Modal for Duygu Yansıması */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowActionModal(false)}>
          <View style={styles.modalContent}>
            {/* Handle Bar */}
            <View style={styles.modalHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ne yapmak istersiniz?</Text>
              <Pressable onPress={() => setShowActionModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={Colors.neutral.medium} />
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
                  router.push('/advanced-analysis' as Href);
                }}
              >
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.actionOptionGradient}>
                  <View style={styles.actionOptionIcon}>
                    <Brain size={28} color="#FFF" />
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
                <LinearGradient colors={['#EC4899', '#F472B6']} style={styles.actionOptionGradient}>
                  <View style={styles.actionOptionIcon}>
                    <Wand2 size={28} color="#FFF" />
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
                <LinearGradient colors={['#10B981', '#34D399']} style={styles.actionOptionGradient}>
                  <View style={styles.actionOptionIcon}>
                    <FileText size={28} color="#FFF" />
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
                <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.actionOptionGradient}>
                  <View style={styles.actionOptionIcon}>
                    <MessageCircle size={28} color="#FFF" />
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
    backgroundColor: '#FFFFFF',
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
  heroCard: {
    padding: spacing['5'],
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  mascotContainer: {
    alignItems: 'center',
    gap: spacing['1'],
    marginLeft: -spacing['2'],
    marginRight: spacing['2'],
    maxWidth: 110,
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
    overflow: 'hidden',
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
    marginBottom: spacing['3'],
  },
  mascotIntro: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexShrink: 1,
    overflow: 'hidden',
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

  // Progress Section (Gamification + Stats Combined)
  progressSection: {
    marginBottom: spacing['4'],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: spacing['4'],
    ...shadows.xs,
  },
  sectionHeaderPrimary: {
    marginBottom: spacing['3'],
  },
  sectionTitlePrimary: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.darker,
    letterSpacing: -0.3,
  },
  sectionTitleSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  gamificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['3'],
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
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 14,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['2'],
  },
  miniStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary.sunset,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  miniStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.neutral.lighter,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginVertical: spacing['3'],
    marginHorizontal: spacing['2'],
  },

  // Explore Section (Combined Features + Quick Actions)
  exploreSection: {
    marginBottom: spacing['4'],
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['3'],
  },

  // Primary CTA
  primaryCtaCard: {
    marginBottom: spacing['4'],
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.colored('#6366F1'),
  },
  primaryCtaGradient: {
    padding: spacing['5'],
    position: 'relative',
  },
  primaryCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
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
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: spacing['1'],
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

  // Atolye Card (inside Explore Section)
  atolyeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.colored('#B98EFF'),
  },
  atolyeGradient: {
    padding: spacing['5'],
  },
  atolyeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    overflow: 'hidden',
  },
  emptyGradient: {
    alignItems: 'center',
    padding: spacing['6'],
    gap: spacing['3'],
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: spacing['2'],
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
    gap: spacing['2'],
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
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['5'],
    borderRadius: 20,
    marginTop: spacing['2'],
    gap: spacing['2'],
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.sunset,
  },
  recentCardsContainer: {
    gap: spacing['3'],
  },
  recentCard: {
    // Wrapper for pressable
  },
  recentCardInner: {
    padding: spacing['4'],
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
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
    backgroundColor: '#FFFFFF',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionOptionDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
});
