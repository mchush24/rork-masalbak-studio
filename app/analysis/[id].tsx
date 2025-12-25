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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data - gerçekte tRPC'den gelecek
const MOCK_ANALYSIS = {
  id: '1',
  title: 'Analiz Sonuçları',
  date: '11 Aralık 2025',
  taskType: 'DAP',
  summary: 'Çocuğun genel ruh hali olumlu',
  emotionalIndicators: [
    { label: 'Mutluluk', value: 85, color: '#7ED99C' },
    { label: 'Güven', value: 70, color: '#FFD56B' },
    { label: 'Yaratıcılık', value: 90, color: '#A78BFA' },
    { label: 'Sosyallik', value: 75, color: '#78C8E8' },
  ],
  insights: [
    'Çocuğunuz çiziminde parlak renkler kullanmış, bu olumlu duygusal durumu gösteriyor.',
    'Figürlerin dengeli yerleşimi iyi bir benlik algısına işaret ediyor.',
    'Detaylı çizimler, dikkat ve konsantrasyon becerisinin geliştiğini gösteriyor.',
  ],
  recommendations: [
    'Yaratıcı aktivitelere devam edin',
    'Sosyal etkileşimleri destekleyin',
    'Pozitif geri bildirim vermeye devam edin',
  ],
};

export default function AnalysisResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isSmallScreen, screenPadding } = useResponsive();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: tRPC mutation to toggle favorite
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `RenkiOO Analiz Sonuçları\n\n${MOCK_ANALYSIS.summary}\n\nDetaylar için uygulamayı indirin!`,
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
    Alert.alert('Kaydedildi', 'Analiz sonuçları kaydedildi!');
    // TODO: tRPC mutation to save
  };

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
            <Text style={styles.mainTitle}>{MOCK_ANALYSIS.title}</Text>
            <Text style={styles.dateText}>{MOCK_ANALYSIS.date}</Text>
          </View>

          {/* Summary Card */}
          <View style={[styles.summaryCard, shadows.lg]}>
            <Text style={styles.summaryText}>{MOCK_ANALYSIS.summary}</Text>
          </View>

          {/* Emotional Indicators */}
          <View style={styles.indicatorsSection}>
            <Text style={styles.sectionTitle}>Duygusal Göstergeler</Text>
            {MOCK_ANALYSIS.emotionalIndicators.map((indicator, index) => (
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

          {/* Insights Card */}
          <View style={[styles.insightsCard, shadows.lg]}>
            <View style={styles.cardHeader}>
              <Brain size={20} color="#A78BFA" strokeWidth={2} />
              <Text style={styles.cardTitle}>Gözlemler</Text>
            </View>
            {MOCK_ANALYSIS.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          {/* Recommendations Card */}
          <View style={[styles.insightsCard, shadows.lg, { marginBottom: spacing.xl }]}>
            <View style={styles.cardHeader}>
              <Smile size={20} color="#7ED99C" strokeWidth={2} />
              <Text style={styles.cardTitle}>Öneriler</Text>
            </View>
            {MOCK_ANALYSIS.recommendations.map((rec, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={[styles.bulletPoint, { backgroundColor: '#7ED99C' }]} />
                <Text style={styles.insightText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Shareable Card Section */}
          <View style={styles.shareCardSection}>
            <Text style={styles.shareCardTitle}>Paylaş veya Kaydet</Text>
            <AnalysisShareCard
              summary={MOCK_ANALYSIS.summary}
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
