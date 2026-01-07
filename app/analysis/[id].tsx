import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share2,
  Download,
  Brain,
  Smile,
  Frown,
  Meh,
} from 'lucide-react-native';
import { spacing, borderRadius, typography, shadows } from '@/lib/design-tokens';
import { useResponsive } from '@/lib/hooks/useResponsive';
import { AnalysisShareCard } from '@/components/AnalysisShareCard';
import { trpc } from '@/lib/trpc';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnalysisResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isSmallScreen, screenPadding } = useResponsive();
  const [isFavorited, setIsFavorited] = useState(false);

  // Get analysis ID from params
  const analysisId = params.id as string;

  // Fetch analysis from backend
  const { data: analysisData, isLoading, error } = trpc.analysis.get.useQuery(
    { analysisId },
    { enabled: !!analysisId }
  );

  // Update favorite mutation
  const updateAnalysisMutation = trpc.analysis.update.useMutation();

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = async () => {
    if (!analysisData) return;

    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);

    try {
      await updateAnalysisMutation.mutateAsync({
        analysisId: analysisData.id,
        favorited: newFavoritedState,
      });
    } catch (error) {
      console.error('Failed to update favorite:', error);
      setIsFavorited(!newFavoritedState); // Revert on error
      Alert.alert('Hata', 'Favori güncellenemedi');
    }
  };

  const handleShare = async () => {
    if (!analysisData) return;

    try {
      const summary = analysisData.analysis_result?.insights?.[0]?.summary || 'Analiz tamamlandı';
      await Share.share({
        message: `RenkiOO Analiz Sonuçları\n\n${summary}\n\nDetaylar için uygulamayı indirin!`,
        title: 'Analiz Sonuçları',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = () => {
    Alert.alert('İndir', 'PDF olarak indirme özelliği yakında!');
    // TODO: PDF generation and download
  };

  const handleSave = () => {
    // Analysis is already saved in backend
    Alert.alert('Bilgi', 'Analiz zaten kaydedildi!');
  };

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#1A2332', '#2E3F5C', '#3D5A80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Analiz yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error || !analysisData) {
    return (
      <LinearGradient
        colors={['#1A2332', '#2E3F5C', '#3D5A80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Analiz bulunamadı</Text>
            <Pressable onPress={handleBack} style={styles.backToHomeButton}>
              <Text style={styles.backToHomeText}>Geri Dön</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Extract data from analysisData
  const analysisResult = analysisData.analysis_result || {};
  const insights = analysisResult.insights || [];
  const homeTips = analysisResult.homeTips || [];
  const formattedDate = new Date(analysisData.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate emotional indicators from insights
  const emotionalIndicators = insights.slice(0, 4).map((insight: any, index: number) => {
    const colors = ['#7ED99C', '#FFD56B', '#A78BFA', '#78C8E8'];
    const strengthValue = insight.strength === 'strong' ? 85 : insight.strength === 'moderate' ? 70 : 55;
    return {
      label: insight.title || `İçgörü ${index + 1}`,
      value: strengthValue,
      color: colors[index % colors.length],
    };
  });

  const summary = insights[0]?.summary || 'Analiz tamamlandı';

  return (
    <LinearGradient
      colors={['#1A2332', '#2E3F5C', '#3D5A80']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="white" strokeWidth={2} />
          </Pressable>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>RENK<Text style={styles.logoAccent}>İOO</Text></Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: screenPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Analiz Sonuçları</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.taskTypeText}>{analysisData.task_type} Testi</Text>
          </View>

          {/* Summary Card */}
          <View style={[styles.summaryCard, shadows.lg]}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>

          {/* Emotional Indicators */}
          {emotionalIndicators.length > 0 && (
            <View style={styles.indicatorsSection}>
              <Text style={styles.sectionTitle}>Duygusal Göstergeler</Text>
              {emotionalIndicators.map((indicator: any, index: number) => (
                <View key={index} style={styles.indicatorItem}>
                  <View style={styles.indicatorHeader}>
                    <Text style={styles.indicatorLabel}>{indicator.label}</Text>
                    <Text style={styles.indicatorValue}>{indicator.value}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${indicator.value}%`,
                          backgroundColor: indicator.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Insights Card */}
          {insights.length > 0 && (
            <View style={[styles.insightsCard, shadows.lg]}>
              <View style={styles.cardHeader}>
                <Brain size={20} color="#A78BFA" strokeWidth={2} />
                <Text style={styles.cardTitle}>Gözlemler</Text>
              </View>
              {insights.map((insight: any, index: number) => (
                <View key={index} style={styles.insightItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.insightText}>{insight.summary}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations Card */}
          {homeTips.length > 0 && (
            <View style={[styles.insightsCard, shadows.lg, { marginBottom: spacing.xl }]}>
              <View style={styles.cardHeader}>
                <Smile size={20} color="#7ED99C" strokeWidth={2} />
                <Text style={styles.cardTitle}>Öneriler</Text>
              </View>
              {homeTips.map((tip: any, index: number) => (
                <View key={index} style={styles.insightItem}>
                  <View style={[styles.bulletPoint, { backgroundColor: '#7ED99C' }]} />
                  <Text style={styles.insightText}>{tip.title}</Text>
                  {tip.steps?.map((step: string, stepIdx: number) => (
                    <Text key={stepIdx} style={styles.stepText}>  • {step}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Shareable Card Section */}
          <View style={styles.shareCardSection}>
            <Text style={styles.shareCardTitle}>Paylaş veya Kaydet</Text>
            <AnalysisShareCard
              summary={summary}
              mood="happy"
              onSave={handleSave}
            />
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomActions, { paddingHorizontal: screenPadding }]}>
          <View style={styles.iconActions}>
            <Pressable
              onPress={handleFavorite}
              style={[styles.iconButton, isFavorited && styles.iconButtonActive]}
            >
              <Heart
                size={24}
                color={isFavorited ? '#FF6B6B' : 'rgba(255, 255, 255, 0.7)'}
                fill={isFavorited ? '#FF6B6B' : 'none'}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.iconButton}>
              <Share2 size={24} color="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
            </Pressable>
            <Pressable onPress={handleDownload} style={styles.iconButton}>
              <Download size={24} color="rgba(255, 255, 255, 0.7)" strokeWidth={2} />
            </Pressable>
          </View>
          <Pressable onPress={handleSave} style={[styles.saveButton, shadows.lg]}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#FFD56B',
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  titleSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  mainTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  taskTypeText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  backToHomeButton: {
    backgroundColor: 'white',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  backToHomeText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: '#2E3F5C',
  },
  stepText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: typography.fontSize.xs * 1.5,
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.lg,
  },
  summaryText: {
    fontSize: typography.fontSize.md,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.4,
  },
  indicatorsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  indicatorItem: {
    marginBottom: spacing.md,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  indicatorLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  indicatorValue: {
    fontSize: typography.fontSize.sm,
    color: 'white',
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    color: 'white',
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A78BFA',
    marginTop: 7,
    marginRight: spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: typography.fontSize.sm * 1.5,
    fontWeight: '400',
  },
  bottomActions: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: '#2E3F5C',
    letterSpacing: -0.3,
  },
  shareCardSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  shareCardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
