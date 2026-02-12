/**
 * ParentReport - Ebeveyn raporu bileseni
 *
 * Cocugun interaktif hikayedeki secimlerini analiz eden
 * ve pozitif icgoruler sunan ebeveyn raporu.
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Heart,
  Lightbulb,
  MessageCircle,
  Star,
  TrendingUp,
  ChevronRight,
  Download,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import {
  ParentReport as ParentReportType,
  TraitCount,
  ChoiceTimelineItem,
  ActivitySuggestion,
  TRAIT_DEFINITIONS,
  TherapeuticReportSection,
} from '@/types/InteractiveStory';
import { shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

interface ParentReportProps {
  report: ParentReportType;
  onClose: () => void;
  onDownload?: () => void;
}

export function ParentReport({ report, onClose, onDownload }: ParentReportProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Baslik */}
      <LinearGradient colors={['#7C3AED', '#9333EA']} style={styles.header}>
        <Award size={40} color="#FCD34D" />
        <Text style={styles.headerTitle}>Ebeveyn Raporu</Text>
        <Text style={styles.headerSubtitle}>
          {report.childName ? `${report.childName}'in` : 'Cocugunuzun'} &ldquo;{report.storyTitle}
          &rdquo; hikayesindeki yolculugu
        </Text>
      </LinearGradient>

      {/* Baskin ozellikler */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={24} color={Colors.semantic.amber} />
          <Text style={styles.sectionTitle}>One Cikan Ozellikler</Text>
        </View>

        <View style={styles.traitsContainer}>
          {report.dominantTraits.slice(0, 3).map((tc, index) => (
            <TraitCard key={tc.trait} traitCount={tc} rank={index + 1} />
          ))}
        </View>

        {/* Basit pasta grafik */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBar}>
            {report.dominantTraits.map(tc => {
              const def = TRAIT_DEFINITIONS[tc.trait];
              return (
                <View
                  key={tc.trait}
                  style={[
                    styles.chartSegment,
                    { width: `${tc.percentage}%`, backgroundColor: def.color },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            {report.dominantTraits.map(tc => {
              const def = TRAIT_DEFINITIONS[tc.trait];
              return (
                <View key={tc.trait} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: def.color }]} />
                  <Text style={styles.legendText}>{def.name_tr}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Secim zaman cizelgesi */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={24} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Secim Yolculugu</Text>
        </View>

        {report.choiceTimeline.map((item, index) => (
          <TimelineItem
            key={index}
            item={item}
            isLast={index === report.choiceTimeline.length - 1}
          />
        ))}
      </View>

      {/* Aktivite onerileri */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lightbulb size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Aktivite Onerileri</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Cocugunuzun one cikan ozelliklerini desteklemek icin aktiviteler
        </Text>

        {report.activitySuggestions.map((activity, index) => (
          <ActivityCard key={index} activity={activity} />
        ))}
      </View>

      {/* Sohbet baslangıclari */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MessageCircle size={24} color="#EC4899" />
          <Text style={styles.sectionTitle}>Sohbet Baslaticlari</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Bu sorularla cocugunuzla hikaye hakkinda konusabilirsiniz
        </Text>

        {report.conversationStarters.map((question, index) => (
          <View key={index} style={styles.conversationItem}>
            <Text style={styles.conversationNumber}>{index + 1}</Text>
            <Text style={styles.conversationText}>{question}</Text>
          </View>
        ))}
      </View>

      {/* Terapötik Bölüm (varsa) */}
      {report.therapeuticSection && <TherapeuticSection section={report.therapeuticSection} />}

      {/* Pozitif mesaj */}
      <View style={styles.positiveMessage}>
        <Heart size={32} color="#EC4899" />
        <Text style={styles.positiveMessageText}>
          Her cocuk benzersizdir ve her secim degerlidir. Bu rapor sadece pozitif guclu yanlari
          vurgulamak icindir.
        </Text>
      </View>

      {/* Butonlar */}
      <View style={styles.buttons}>
        {onDownload && (
          <Pressable style={styles.downloadButton} onPress={onDownload}>
            <Download size={20} color={Colors.neutral.white} />
            <Text style={styles.downloadButtonText}>PDF Indir</Text>
          </Pressable>
        )}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Kapat</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </Animated.ScrollView>
  );
}

// Trait Card bileseni
function TraitCard({ traitCount, rank }: { traitCount: TraitCount; rank: number }) {
  const def = TRAIT_DEFINITIONS[traitCount.trait];

  return (
    <View style={[styles.traitCard, { borderLeftColor: def.color }]}>
      <View style={styles.traitRank}>
        <Text style={styles.traitRankText}>{rank}</Text>
      </View>
      <View style={styles.traitInfo}>
        <View style={styles.traitHeader}>
          <Text style={styles.traitEmoji}>{def.emoji}</Text>
          <Text style={styles.traitName}>{def.name_tr}</Text>
          <Text style={styles.traitPercentage}>{traitCount.percentage}%</Text>
        </View>
        <Text style={styles.traitDescription}>{def.positive_description_tr}</Text>
      </View>
    </View>
  );
}

// Timeline Item bileseni
function TimelineItem({ item, isLast }: { item: ChoiceTimelineItem; isLast: boolean }) {
  const def = TRAIT_DEFINITIONS[item.trait];

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: def.color }]}>
          <Text style={styles.timelineDotText}>{item.choiceNumber}</Text>
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineQuestion}>{item.question}</Text>
        <View style={styles.timelineAnswer}>
          <ChevronRight size={16} color={Colors.neutral.gray400} />
          <Text style={styles.timelineAnswerText}>{item.chosenOption}</Text>
        </View>
        <View style={[styles.timelineTraitBadge, { backgroundColor: def.color + '20' }]}>
          <Text style={styles.timelineTraitEmoji}>{def.emoji}</Text>
          <Text style={[styles.timelineTraitText, { color: def.color }]}>{def.name_tr}</Text>
        </View>
      </View>
    </View>
  );
}

// Activity Card bileseni
function ActivityCard({ activity }: { activity: ActivitySuggestion }) {
  const def = TRAIT_DEFINITIONS[activity.forTrait];

  return (
    <View style={styles.activityCard}>
      <View style={[styles.activityIcon, { backgroundColor: def.color + '20' }]}>
        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
      </View>
    </View>
  );
}

// Terapötik Bölüm bileseni
function TherapeuticSection({ section }: { section: TherapeuticReportSection }) {
  return (
    <View style={styles.therapeuticContainer}>
      {/* Başlık */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.therapeuticHeader}>
        <Shield size={28} color={Colors.neutral.white} />
        <Text style={styles.therapeuticTitle}>Terapötik Destek Rehberi</Text>
        <Text style={styles.therapeuticSubtitle}>
          {section.concernName_tr} teması için özel rehberlik
        </Text>
      </LinearGradient>

      {/* Cesaretlendirici Mesaj */}
      <View style={styles.therapeuticEncouraging}>
        <CheckCircle size={24} color="#10B981" />
        <Text style={styles.therapeuticEncouragingText}>{section.encouragingMessage}</Text>
      </View>

      {/* Çocuğun Güçlü Yanları */}
      <View style={styles.therapeuticSection}>
        <Text style={styles.therapeuticSectionTitle}>Çocuğunuzun Güçlü Yanları</Text>
        {section.childStrengths.map((strength, index) => (
          <View key={index} style={styles.therapeuticItem}>
            <Text style={styles.therapeuticItemBullet}>✨</Text>
            <Text style={styles.therapeuticItemText}>{strength}</Text>
          </View>
        ))}
      </View>

      {/* Terapötik Yaklaşım */}
      <View style={styles.therapeuticSection}>
        <Text style={styles.therapeuticSectionTitle}>Terapötik Yaklaşım</Text>
        <View style={styles.therapeuticInfoBox}>
          <Text style={styles.therapeuticInfoText}>{section.therapeuticApproach}</Text>
        </View>
      </View>

      {/* Başa Çıkma Mekanizması */}
      <View style={styles.therapeuticSection}>
        <Text style={styles.therapeuticSectionTitle}>Başa Çıkma Mekanizması</Text>
        <View style={styles.therapeuticInfoBox}>
          <Text style={styles.therapeuticInfoText}>{section.copingMechanism}</Text>
        </View>
      </View>

      {/* Ebeveyn Rehberliği */}
      <View style={styles.therapeuticSection}>
        <Text style={styles.therapeuticSectionTitle}>Ebeveyn Rehberliği</Text>
        {section.parentGuidance.map((guidance, index) => (
          <View key={index} style={styles.therapeuticItem}>
            <Text style={styles.therapeuticItemBullet}>💡</Text>
            <Text style={styles.therapeuticItemText}>{guidance}</Text>
          </View>
        ))}
      </View>

      {/* Kaçınılması Gerekenler */}
      {section.avoidTopics.length > 0 && (
        <View style={styles.therapeuticSection}>
          <View style={styles.therapeuticWarningHeader}>
            <AlertCircle size={18} color={Colors.semantic.amber} />
            <Text style={styles.therapeuticWarningTitle}>Kaçınılması Gereken Konular</Text>
          </View>
          {section.avoidTopics.map((topic, index) => (
            <View key={index} style={styles.therapeuticItem}>
              <Text style={styles.therapeuticItemBullet}>⚠️</Text>
              <Text style={styles.therapeuticItemText}>{topic}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Önerilen Özellikler */}
      <View style={styles.therapeuticSection}>
        <Text style={styles.therapeuticSectionTitle}>Önerilen Terapötik Özellikler</Text>
        <View style={styles.therapeuticTraitsRow}>
          {section.recommendedTraits.map(trait => {
            const def = TRAIT_DEFINITIONS[trait];
            return (
              <View
                key={trait}
                style={[styles.therapeuticTraitBadge, { backgroundColor: def.color + '20' }]}
              >
                <Text style={styles.therapeuticTraitEmoji}>{def.emoji}</Text>
                <Text style={[styles.therapeuticTraitName, { color: def.color }]}>
                  {def.name_tr}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Profesyonel Destek Hatırlatması */}
      <View style={styles.therapeuticDisclaimer}>
        <Text style={styles.therapeuticDisclaimerText}>
          Bu rapor genel rehberlik amaçlıdır. Ciddi endişeler için profesyonel destek almanızı
          öneririz.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.neutral.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...shadows.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  traitsContainer: {
    gap: 12,
  },
  traitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  traitRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  traitRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  traitInfo: {
    flex: 1,
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  traitEmoji: {
    fontSize: 20,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  traitPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  traitDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  chartContainer: {
    marginTop: 20,
  },
  chartBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.neutral.gray200,
  },
  chartSegment: {
    height: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.neutral.gray200,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 12,
    padding: 12,
  },
  timelineQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  timelineAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineAnswerText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  timelineTraitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timelineTraitEmoji: {
    fontSize: 14,
  },
  timelineTraitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  conversationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  conversationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.gray700,
    lineHeight: 20,
  },
  positiveMessage: {
    flexDirection: 'row',
    backgroundColor: '#FDF2F8',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  positiveMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#9D174D',
    lineHeight: 20,
  },
  buttons: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9333EA',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  // Terapötik Bölüm Stilleri
  therapeuticContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.white,
    ...shadows.xs,
  },
  therapeuticHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  therapeuticTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    marginTop: 8,
  },
  therapeuticSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  therapeuticEncouraging: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    padding: 16,
    alignItems: 'flex-start',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  therapeuticEncouragingText: {
    flex: 1,
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  therapeuticSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  therapeuticSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  therapeuticItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  therapeuticItemBullet: {
    fontSize: 14,
    marginTop: 2,
  },
  therapeuticItemText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  therapeuticInfoBox: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 12,
    padding: 14,
  },
  therapeuticInfoText: {
    fontSize: 14,
    color: Colors.neutral.gray700,
    lineHeight: 20,
  },
  therapeuticWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  therapeuticWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B45309',
  },
  therapeuticTraitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  therapeuticTraitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  therapeuticTraitEmoji: {
    fontSize: 16,
  },
  therapeuticTraitName: {
    fontSize: 13,
    fontWeight: '600',
  },
  therapeuticDisclaimer: {
    backgroundColor: Colors.neutral.gray50,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  therapeuticDisclaimerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ParentReport;
