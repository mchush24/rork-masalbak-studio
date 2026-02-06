/**
 * Class Report Component
 * Generate and display class-level analysis reports
 * Part of #19: Öğretmen Modu - Sınıf Yönetimi UI
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
  FileText,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { ProfessionalColors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StudentSummary {
  id: string;
  name: string;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
}

interface ClassStats {
  totalStudents: number;
  analyzedStudents: number;
  averagePercentile: number;
  medianPercentile: number;
  highPerformers: number;
  lowPerformers: number;
  needsAttention: number;
}

interface DistributionData {
  range: string;
  count: number;
  percentage: number;
}

interface ClassReportProps {
  className: string;
  grade: string;
  testType: string;
  reportDate: string;
  stats: ClassStats;
  distribution: DistributionData[];
  topPerformers: StudentSummary[];
  needsAttention: StudentSummary[];
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onShare?: () => void;
  onStudentPress?: (studentId: string) => void;
}

const PERCENTILE_RANGES = [
  { min: 0, max: 10, label: '0-10', color: '#DC2626' },
  { min: 10, max: 25, label: '10-25', color: '#F59E0B' },
  { min: 25, max: 50, label: '25-50', color: '#EAB308' },
  { min: 50, max: 75, label: '50-75', color: '#84CC16' },
  { min: 75, max: 90, label: '75-90', color: '#22C55E' },
  { min: 90, max: 100, label: '90-100', color: '#059669' },
];

export function ClassReport({
  className,
  grade,
  testType,
  reportDate,
  stats,
  distribution,
  topPerformers,
  needsAttention,
  onExportPDF,
  onExportExcel,
  onShare,
  onStudentPress,
}: ClassReportProps) {
  const completionRate = stats.totalStudents > 0
    ? Math.round((stats.analyzedStudents / stats.totalStudents) * 100)
    : 0;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const maxDistribution = Math.max(...distribution.map(d => d.count));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[ProfessionalColors.roles.teacher.gradient[0], '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.reportIcon}>
            <FileText size={28} color={ProfessionalColors.roles.teacher.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.reportTitle}>Sınıf Raporu</Text>
            <Text style={styles.className}>{className} • {grade}</Text>
            <Text style={styles.testType}>{testType}</Text>
          </View>
        </View>

        <View style={styles.reportMeta}>
          <Clock size={14} color={ProfessionalColors.text.secondary} />
          <Text style={styles.reportDate}>{reportDate}</Text>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onExportPDF}
        >
          <Download size={18} color={ProfessionalColors.roles.teacher.primary} />
          <Text style={styles.actionButtonText}>PDF</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onExportExcel}
        >
          <BarChart2 size={18} color={ProfessionalColors.roles.teacher.primary} />
          <Text style={styles.actionButtonText}>Excel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={onShare}
        >
          <Share2 size={18} color={ProfessionalColors.roles.teacher.primary} />
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </Pressable>
      </View>

      {/* Summary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Özet İstatistikler</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={20} color={ProfessionalColors.trust.primary} />
            </View>
            <Text style={styles.statValue}>{stats.analyzedStudents}/{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Analiz Edilen</Text>
            <View style={styles.completionBar}>
              <View style={[styles.completionFill, { width: `${completionRate}%` }]} />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <BarChart2 size={20} color="#059669" />
            </View>
            <Text style={styles.statValue}>{stats.averagePercentile}%</Text>
            <Text style={styles.statLabel}>Ortalama</Text>
            <Text style={styles.statSubLabel}>Medyan: {stats.medianPercentile}%</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <AlertTriangle size={20} color="#D97706" />
            </View>
            <Text style={[styles.statValue, stats.needsAttention > 0 && styles.warningValue]}>
              {stats.needsAttention}
            </Text>
            <Text style={styles.statLabel}>Dikkat Gerekli</Text>
            <Text style={styles.statSubLabel}>Düşük performans</Text>
          </View>
        </View>
      </View>

      {/* Distribution Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yüzdelik Dağılımı</Text>

        <View style={styles.distributionChart}>
          {distribution.map((item, index) => {
            const range = PERCENTILE_RANGES[index] || PERCENTILE_RANGES[0];
            const barHeight = maxDistribution > 0 ? (item.count / maxDistribution) * 100 : 0;

            return (
              <View key={item.range} style={styles.distributionBar}>
                <Text style={styles.barCount}>{item.count}</Text>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={[range.color, `${range.color}CC`]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.barFill, { height: `${barHeight}%` }]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.range}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.distributionLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.legendText}>Düşük</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
            <Text style={styles.legendText}>Ortalama</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
            <Text style={styles.legendText}>Yüksek</Text>
          </View>
        </View>
      </View>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>En Başarılı Öğrenciler</Text>
            <View style={styles.badgeSuccess}>
              <CheckCircle size={12} color="#059669" />
              <Text style={styles.badgeSuccessText}>{topPerformers.length}</Text>
            </View>
          </View>

          {topPerformers.map((student, index) => {
            const TrendIcon = getTrendIcon(student.trend);
            const trendColor = getTrendColor(student.trend);

            return (
              <Pressable
                key={student.id}
                style={({ pressed }) => [styles.studentRow, pressed && styles.studentRowPressed]}
                onPress={() => onStudentPress?.(student.id)}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.studentMeta}>
                    <TrendIcon size={12} color={trendColor} />
                    <Text style={[styles.trendText, { color: trendColor }]}>
                      {student.trend === 'up' ? 'Yükseliyor' : student.trend === 'down' ? 'Düşüyor' : 'Stabil'}
                    </Text>
                  </View>
                </View>
                <View style={styles.percentileBadge}>
                  <Text style={styles.percentileValue}>{student.percentile}%</Text>
                </View>
                <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dikkat Gereken Öğrenciler</Text>
            <View style={styles.badgeWarning}>
              <AlertTriangle size={12} color="#D97706" />
              <Text style={styles.badgeWarningText}>{needsAttention.length}</Text>
            </View>
          </View>

          <View style={styles.warningBanner}>
            <AlertTriangle size={16} color="#D97706" />
            <Text style={styles.warningBannerText}>
              Bu öğrenciler ortalamanın altında performans göstermektedir
            </Text>
          </View>

          {needsAttention.map((student) => {
            const TrendIcon = getTrendIcon(student.trend);
            const trendColor = getTrendColor(student.trend);

            return (
              <Pressable
                key={student.id}
                style={({ pressed }) => [styles.studentRow, styles.studentRowWarning, pressed && styles.studentRowPressed]}
                onPress={() => onStudentPress?.(student.id)}
              >
                <View style={styles.alertIcon}>
                  <AlertTriangle size={16} color="#D97706" />
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.studentMeta}>
                    <TrendIcon size={12} color={trendColor} />
                    <Text style={[styles.trendText, { color: trendColor }]}>
                      {student.trend === 'up' ? 'Yükseliyor' : student.trend === 'down' ? 'Düşüyor' : 'Stabil'}
                    </Text>
                  </View>
                </View>
                <View style={styles.percentileBadgeLow}>
                  <Text style={styles.percentileValueLow}>{student.percentile}%</Text>
                </View>
                <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Öneriler</Text>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationIcon}>
            <TrendingUp size={20} color="#059669" />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Genel Değerlendirme</Text>
            <Text style={styles.recommendationText}>
              Sınıf ortalaması {stats.averagePercentile >= 50 ? 'norm üzerinde' : 'norm altında'} seyretmektedir.
              {stats.needsAttention > 0 && ` ${stats.needsAttention} öğrenci için bireysel takip önerilmektedir.`}
            </Text>
          </View>
        </View>

        {stats.needsAttention > 0 && (
          <View style={styles.recommendationCard}>
            <View style={[styles.recommendationIcon, { backgroundColor: '#FEF3C7' }]}>
              <AlertTriangle size={20} color="#D97706" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Bireysel Destek</Text>
              <Text style={styles.recommendationText}>
                Düşük performans gösteren öğrenciler için rehberlik servisi ile işbirliği yapılması önerilir.
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: spacing['4'],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  reportIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ProfessionalColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  className: {
    fontSize: 22,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
    marginTop: 2,
  },
  testType: {
    fontSize: 14,
    color: ProfessionalColors.roles.teacher.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['3'],
  },
  reportDate: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing['2'],
    padding: spacing['4'],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.roles.teacher.primary,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing['4'],
    marginBottom: spacing['3'],
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
    marginBottom: spacing['3'],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ProfessionalColors.trust.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  warningValue: {
    color: '#D97706',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ProfessionalColors.text.secondary,
    marginTop: 2,
  },
  statSubLabel: {
    fontSize: 11,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  completionBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: spacing['2'],
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.trust.primary,
    borderRadius: 2,
  },
  distributionChart: {
    flexDirection: 'row',
    height: 140,
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  distributionBar: {
    flex: 1,
    alignItems: 'center',
  },
  barCount: {
    fontSize: 12,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
    marginBottom: 4,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: ProfessionalColors.text.tertiary,
    marginTop: 4,
  },
  distributionLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['4'],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: ProfessionalColors.text.secondary,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  badgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeWarningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  studentRowWarning: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: -spacing['4'],
    paddingHorizontal: spacing['4'],
    borderBottomColor: '#FDE68A',
  },
  studentRowPressed: {
    opacity: 0.7,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  alertIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  trendText: {
    fontSize: 12,
  },
  percentileBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  percentileValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  percentileBadgeLow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  percentileValueLow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: '#FFFBEB',
    padding: spacing['3'],
    borderRadius: radius.lg,
    marginBottom: spacing['3'],
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  recommendationCard: {
    flexDirection: 'row',
    gap: spacing['3'],
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['2'],
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ClassReport;
