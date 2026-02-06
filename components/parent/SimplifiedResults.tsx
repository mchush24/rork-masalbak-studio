/**
 * Simplified Results Component
 * Parent-friendly analysis results display
 * Part of #20: Ebeveyn Modu - Rehberli Deneyim UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  Heart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircle,
  Share2,
  Download,
  Info,
  Check,
  Lightbulb,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StrengthItem {
  id: string;
  title: string;
  description: string;
  icon: 'star' | 'heart' | 'sparkles';
}

interface DevelopmentArea {
  id: string;
  name: string;
  level: 'excellent' | 'good' | 'developing' | 'emerging';
  description: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  activities: string[];
}

interface SimplifiedResultsProps {
  childName: string;
  childAge: number;
  testType: string;
  date: string;
  overallMessage: string;
  strengths: StrengthItem[];
  developmentAreas: DevelopmentArea[];
  recommendations: Recommendation[];
  onShare?: () => void;
  onSaveReport?: () => void;
  onAskQuestion?: () => void;
}

const LEVEL_CONFIG = {
  excellent: { label: 'Mükemmel', color: '#059669', bgColor: '#ECFDF5', emoji: '🌟' },
  good: { label: 'İyi', color: '#3B82F6', bgColor: '#EFF6FF', emoji: '✨' },
  developing: { label: 'Gelişiyor', color: '#F59E0B', bgColor: '#FFFBEB', emoji: '🌱' },
  emerging: { label: 'Başlangıç', color: '#8B5CF6', bgColor: '#F5F3FF', emoji: '🌸' },
};

const ICON_COMPONENTS = {
  star: Star,
  heart: Heart,
  sparkles: Sparkles,
};

export function SimplifiedResults({
  childName,
  childAge,
  testType,
  date,
  overallMessage,
  strengths,
  developmentAreas,
  recommendations,
  onShare,
  onSaveReport,
  onAskQuestion,
}: SimplifiedResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('strengths');
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getTestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DAP: 'İnsan Çizimi Analizi',
      HTP: 'Ev-Ağaç-İnsan Analizi',
      Family: 'Aile Çizimi Analizi',
      Tree: 'Ağaç Çizimi Analizi',
    };
    return labels[type] || type;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.softPeach, '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.resultBadge}>
            <Sparkles size={24} color={Colors.primary.sunset} />
          </View>
          <Text style={styles.headerTitle}>{childName}'ın Sonuçları</Text>
          <Text style={styles.headerSubtitle}>
            {getTestTypeLabel(testType)} • {date}
          </Text>
        </View>
      </LinearGradient>

      {/* Overall Message */}
      <View style={styles.messageCard}>
        <View style={styles.messageIcon}>
          <Heart size={24} color={Colors.primary.sunset} />
        </View>
        <Text style={styles.messageText}>{overallMessage}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onShare}
        >
          <Share2 size={18} color={Colors.primary.sky} />
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onSaveReport}
        >
          <Download size={18} color={Colors.primary.mint} />
          <Text style={styles.actionButtonText}>Kaydet</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onAskQuestion}
        >
          <MessageCircle size={18} color={Colors.primary.sunset} />
          <Text style={styles.actionButtonText}>Soru Sor</Text>
        </Pressable>
      </View>

      {/* Strengths Section */}
      <Pressable
        style={styles.sectionHeader}
        onPress={() => toggleSection('strengths')}
      >
        <View style={styles.sectionTitleContainer}>
          <Star size={20} color={Colors.primary.sunset} />
          <Text style={styles.sectionTitle}>Güçlü Yönler</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{strengths.length}</Text>
          </View>
        </View>
        {expandedSection === 'strengths' ? (
          <ChevronUp size={20} color={Colors.neutral.medium} />
        ) : (
          <ChevronDown size={20} color={Colors.neutral.medium} />
        )}
      </Pressable>

      {expandedSection === 'strengths' && (
        <View style={styles.sectionContent}>
          {strengths.map((strength) => {
            const IconComponent = ICON_COMPONENTS[strength.icon];
            return (
              <View key={strength.id} style={styles.strengthCard}>
                <View style={styles.strengthIcon}>
                  <IconComponent size={20} color={Colors.primary.sunset} />
                </View>
                <View style={styles.strengthContent}>
                  <Text style={styles.strengthTitle}>{strength.title}</Text>
                  <Text style={styles.strengthDescription}>{strength.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Development Areas Section */}
      <Pressable
        style={styles.sectionHeader}
        onPress={() => toggleSection('development')}
      >
        <View style={styles.sectionTitleContainer}>
          <BookOpen size={20} color={Colors.primary.sky} />
          <Text style={styles.sectionTitle}>Gelişim Alanları</Text>
        </View>
        {expandedSection === 'development' ? (
          <ChevronUp size={20} color={Colors.neutral.medium} />
        ) : (
          <ChevronDown size={20} color={Colors.neutral.medium} />
        )}
      </Pressable>

      {expandedSection === 'development' && (
        <View style={styles.sectionContent}>
          {developmentAreas.map((area) => {
            const levelConfig = LEVEL_CONFIG[area.level];
            return (
              <View key={area.id} style={styles.developmentCard}>
                <View style={styles.developmentHeader}>
                  <Text style={styles.developmentName}>{area.name}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: levelConfig.bgColor }]}>
                    <Text style={styles.levelEmoji}>{levelConfig.emoji}</Text>
                    <Text style={[styles.levelText, { color: levelConfig.color }]}>
                      {levelConfig.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.developmentDescription}>{area.description}</Text>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: levelConfig.color,
                          width: area.level === 'excellent' ? '100%'
                               : area.level === 'good' ? '75%'
                               : area.level === 'developing' ? '50%'
                               : '25%'
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Recommendations Section */}
      <Pressable
        style={styles.sectionHeader}
        onPress={() => toggleSection('recommendations')}
      >
        <View style={styles.sectionTitleContainer}>
          <Lightbulb size={20} color={Colors.primary.mint} />
          <Text style={styles.sectionTitle}>Öneriler</Text>
        </View>
        {expandedSection === 'recommendations' ? (
          <ChevronUp size={20} color={Colors.neutral.medium} />
        ) : (
          <ChevronDown size={20} color={Colors.neutral.medium} />
        )}
      </Pressable>

      {expandedSection === 'recommendations' && (
        <View style={styles.sectionContent}>
          {recommendations.map((rec) => {
            const isExpanded = expandedRecommendation === rec.id;
            return (
              <Pressable
                key={rec.id}
                style={styles.recommendationCard}
                onPress={() => setExpandedRecommendation(isExpanded ? null : rec.id)}
              >
                <View style={styles.recommendationHeader}>
                  <View style={styles.recommendationIcon}>
                    <Lightbulb size={18} color={Colors.primary.mint} />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={18} color={Colors.neutral.medium} />
                  ) : (
                    <ChevronDown size={18} color={Colors.neutral.medium} />
                  )}
                </View>

                {isExpanded && (
                  <View style={styles.activitiesList}>
                    <Text style={styles.activitiesTitle}>Önerilen Aktiviteler:</Text>
                    {rec.activities.map((activity, index) => (
                      <View key={index} style={styles.activityItem}>
                        <Check size={14} color={Colors.primary.mint} />
                        <Text style={styles.activityText}>{activity}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Info size={16} color={Colors.primary.sky} />
        <Text style={styles.infoNoteText}>
          Bu sonuçlar yapay zeka destekli analize dayanmaktadır.
          Detaylı değerlendirme için bir uzmana danışmanızı öneririz.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: spacing['6'],
    paddingBottom: spacing['6'],
    paddingHorizontal: spacing['4'],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  resultBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
    ...shadows.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral.darker,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.neutral.dark,
    marginTop: 4,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    marginHorizontal: spacing['4'],
    marginBottom: spacing['4'],
    padding: spacing['4'],
    backgroundColor: Colors.primary.softPeach,
    borderRadius: radius.xl,
  },
  messageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral.darker,
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginHorizontal: spacing['4'],
    marginBottom: spacing['4'],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.darker,
  },
  countBadge: {
    backgroundColor: Colors.primary.softPeach,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.sunset,
  },
  sectionContent: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },
  strengthCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    backgroundColor: '#FFFBEB',
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['2'],
  },
  strengthIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthContent: {
    flex: 1,
  },
  strengthTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.darker,
    marginBottom: 4,
  },
  strengthDescription: {
    fontSize: 13,
    color: Colors.neutral.dark,
    lineHeight: 18,
  },
  developmentCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['2'],
  },
  developmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  developmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.darker,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelEmoji: {
    fontSize: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  developmentDescription: {
    fontSize: 13,
    color: Colors.neutral.dark,
    lineHeight: 18,
    marginBottom: spacing['2'],
  },
  progressContainer: {
    height: 6,
  },
  progressBackground: {
    height: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['2'],
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.darker,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 13,
    color: Colors.neutral.dark,
    lineHeight: 18,
  },
  activitiesList: {
    marginTop: spacing['3'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  activitiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    marginBottom: spacing['1'],
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: Colors.neutral.dark,
    lineHeight: 18,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['4'],
    padding: spacing['3'],
    backgroundColor: '#F0F9FF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary.sky,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SimplifiedResults;
