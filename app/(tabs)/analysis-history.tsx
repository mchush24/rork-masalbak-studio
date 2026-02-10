import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {
  Brain,
  Calendar,
  Heart,
  Trash2,
  ChevronRight,
  Filter,
  Star,
  ArrowLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Colors } from '@/constants/colors';
import { layout, typography, spacing, radius, shadows } from '@/constants/design-system';
import { IooEmptyState, EMPTY_STATE_PRESETS } from '@/components/IooEmptyState';

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

interface AnalysisInsightPreview {
  title: string;
  summary: string;
}

interface AnalysisResultPreview {
  insights?: AnalysisInsightPreview[];
}

interface Analysis {
  id: string;
  task_type: TaskType;
  created_at: string;
  child_age?: number;
  child_name?: string;
  favorited?: boolean;
  analysis_result?: AnalysisResultPreview;
  tags?: string[];
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

export default function AnalysisHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  const [selectedTaskType, _setSelectedTaskType] = useState<TaskType | undefined>();

  // Responsive breakpoints
  const isSmallScreen = width < 380;
  const screenPadding = isSmallScreen ? spacing['4'] : layout.screenPadding;

  // Fetch analyses list
  const {
    data: analysesData,
    isLoading,
    refetch,
  } = trpc.analysis.list.useQuery(
    {
      limit: 50,
      offset: 0,
      favoritedOnly: filterFavorites || undefined,
      taskType: selectedTaskType,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    { enabled: !!user?.userId }
  );

  // Mutations
  const updateAnalysisMutation = trpc.analysis.update.useMutation();
  const deleteAnalysisMutation = trpc.analysis.delete.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (analysisId: string, currentFavorited: boolean) => {
    try {
      await updateAnalysisMutation.mutateAsync({
        analysisId,
        favorited: !currentFavorited,
      });
      refetch();
    } catch (_error) {
      Alert.alert('Hata', 'Favori durumu değiştirilemedi');
    }
  };

  const handleDelete = (analysisId: string) => {
    Alert.alert(
      'Analizi Sil',
      'Bu analizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnalysisMutation.mutateAsync({ analysisId });
              refetch();
            } catch (_error) {
              Alert.alert('Hata', 'Analiz silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleViewAnalysis = (analysisId: string) => {
    router.push(`/analysis/${analysisId}` as Href);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
  };

  const analyses = analysesData?.analyses || [];

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.background.analysis} style={styles.gradientContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: screenPadding,
              paddingTop: insets.top + (isSmallScreen ? 16 : 20),
              paddingBottom: insets.bottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                isSmallScreen && { width: 36, height: 36 },
                pressed && { opacity: 0.6 },
              ]}
            >
              <ArrowLeft size={isSmallScreen ? 20 : 24} color={Colors.neutral.darkest} />
            </Pressable>
            <View style={[styles.header, isSmallScreen && { gap: spacing['3'] }]}>
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={[styles.headerIcon, isSmallScreen && { width: 56, height: 56 }]}
              >
                <Brain
                  size={isSmallScreen ? 28 : layout.icon.medium}
                  color={Colors.neutral.white}
                />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text
                  style={[styles.headerTitle, isSmallScreen && { fontSize: typography.size.xl }]}
                >
                  Analiz Geçmişi
                </Text>
                <Text
                  style={[styles.headerSubtitle, isSmallScreen && { fontSize: typography.size.xs }]}
                >
                  {analyses.length} analiz kayıtlı
                </Text>
              </View>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.filterChip,
                isSmallScreen && {
                  paddingVertical: spacing['1.5'],
                  paddingHorizontal: spacing['2.5'],
                },
                filterFavorites && styles.filterChipActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setFilterFavorites(!filterFavorites)}
            >
              <Star
                size={isSmallScreen ? 14 : 16}
                color={filterFavorites ? Colors.neutral.white : Colors.secondary.sunshine}
                fill={filterFavorites ? Colors.neutral.white : 'none'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  isSmallScreen && { fontSize: typography.size.xs },
                  filterFavorites && styles.filterChipTextActive,
                ]}
              >
                Favoriler
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.filterChip,
                isSmallScreen && {
                  paddingVertical: spacing['1.5'],
                  paddingHorizontal: spacing['2.5'],
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => Alert.alert('Filtre', 'Test tipi filtreleme yakında!')}
            >
              <Filter size={isSmallScreen ? 14 : 16} color={Colors.neutral.dark} />
              <Text
                style={[styles.filterChipText, isSmallScreen && { fontSize: typography.size.xs }]}
              >
                Test Tipi
              </Text>
            </Pressable>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.secondary.grass} />
              <Text style={styles.loadingText}>Analizler yükleniyor...</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && analyses.length === 0 && (
            <IooEmptyState
              title={filterFavorites ? 'Favori analiz yok' : EMPTY_STATE_PRESETS.noAnalysis.title}
              message={
                filterFavorites
                  ? 'Analizleri favorilere ekleyerek buradan kolayca ulaşabilirsiniz'
                  : EMPTY_STATE_PRESETS.noAnalysis.message
              }
              mood={filterFavorites ? 'curious' : EMPTY_STATE_PRESETS.noAnalysis.mood}
              action={
                !filterFavorites
                  ? {
                      label: 'Analiz Yap',
                      onPress: () => router.push('/(tabs)/quick-analysis'),
                    }
                  : undefined
              }
            />
          )}

          {/* Analysis List */}
          {!isLoading &&
            analyses.map((analysis: Analysis) => (
              <View key={analysis.id} style={styles.analysisCard}>
                <Pressable
                  onPress={() => handleViewAnalysis(analysis.id)}
                  style={({ pressed }) => [
                    styles.cardPressable,
                    isSmallScreen && { padding: spacing['4'] },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardHeaderLeft, isSmallScreen && { gap: spacing['2'] }]}>
                      <LinearGradient
                        colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                        style={[styles.cardIcon, isSmallScreen && { width: 36, height: 36 }]}
                      >
                        <Brain size={isSmallScreen ? 18 : 20} color={Colors.neutral.white} />
                      </LinearGradient>
                      <View style={styles.cardHeaderText}>
                        <Text
                          style={[
                            styles.cardTitle,
                            isSmallScreen && { fontSize: typography.size.sm },
                          ]}
                        >
                          {TASK_TYPE_LABELS[analysis.task_type as TaskType] || analysis.task_type}
                        </Text>
                        <View style={styles.cardMeta}>
                          <Calendar size={isSmallScreen ? 10 : 12} color={Colors.neutral.medium} />
                          <Text style={styles.cardMetaText}>{formatDate(analysis.created_at)}</Text>
                          {analysis.child_age && (
                            <>
                              <Text style={styles.cardMetaDot}>•</Text>
                              <Text style={styles.cardMetaText}>{analysis.child_age} yaş</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={isSmallScreen ? 18 : 20} color={Colors.neutral.light} />
                  </View>

                  {/* Insights Preview */}
                  {(analysis.analysis_result?.insights?.length ?? 0) > 0 && (
                    <View style={styles.insightsPreview}>
                      <Text
                        style={[
                          styles.insightText,
                          isSmallScreen && { fontSize: typography.size.xs },
                        ]}
                        numberOfLines={2}
                      >
                        {analysis.analysis_result?.insights?.[0]?.title}:{' '}
                        {analysis.analysis_result?.insights?.[0]?.summary}
                      </Text>
                    </View>
                  )}

                  {/* Tags */}
                  {(analysis.tags?.length ?? 0) > 0 && (
                    <View style={[styles.tagsContainer, isSmallScreen && { gap: spacing['1.5'] }]}>
                      {analysis.tags?.slice(0, 3).map((tag: string, index: number) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>

                {/* Actions */}
                <View
                  style={[
                    styles.cardActions,
                    isSmallScreen && {
                      paddingHorizontal: spacing['4'],
                      paddingVertical: spacing['2'],
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => handleToggleFavorite(analysis.id, !!analysis.favorited)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      isSmallScreen && { padding: spacing['1.5'] },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Heart
                      size={isSmallScreen ? 18 : 20}
                      color={analysis.favorited ? Colors.semantic.error : Colors.neutral.medium}
                      fill={analysis.favorited ? Colors.semantic.error : 'none'}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(analysis.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      isSmallScreen && { padding: spacing['1.5'] },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Trash2 size={isSmallScreen ? 18 : 20} color={Colors.neutral.medium} />
                  </Pressable>
                </View>
              </View>
            ))}
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
    // paddingHorizontal is now applied dynamically based on screen size
  },
  headerContainer: {
    marginBottom: spacing['6'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3'],
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  headerIcon: {
    width: layout.icon.mega,
    height: layout.icon.mega,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
    letterSpacing: typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginBottom: spacing['5'],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  filterChipActive: {
    backgroundColor: Colors.secondary.sunshine,
    borderColor: Colors.secondary.sunshine,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  filterChipTextActive: {
    color: Colors.neutral.white,
  },
  loadingContainer: {
    paddingVertical: spacing['10'],
    alignItems: 'center',
    gap: spacing['3'],
  },
  loadingText: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
  },
  emptyContainer: {
    paddingVertical: spacing['10'],
    alignItems: 'center',
    gap: spacing['3'],
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
  },
  emptyText: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    paddingHorizontal: spacing['8'],
  },
  analysisCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    marginBottom: spacing['4'],
    ...shadows.md,
    overflow: 'hidden',
  },
  cardPressable: {
    padding: spacing['5'],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3'],
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
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
    marginBottom: spacing['3'],
  },
  insightText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * 1.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: spacing['2'],
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.secondary.skyLight,
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['2'],
    borderRadius: radius.md,
  },
  tagText: {
    fontSize: typography.size.xs,
    color: Colors.secondary.sky,
    fontWeight: typography.weight.semibold,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightest,
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    gap: spacing['4'],
  },
  actionButton: {
    padding: spacing['2'],
  },
});
