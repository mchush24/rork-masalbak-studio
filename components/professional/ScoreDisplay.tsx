/**
 * Score Display Component
 * Clinical score visualization with percentile, z-score, and norm comparison
 * Part of #18: Uzman/Klinisyen Modu UI Tasarımı
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from 'lucide-react-native';
import { spacing, radius, shadows, typography } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScoreData {
  rawScore: number;
  maxScore: number;
  percentile: number;
  zScore: number;
  tScore?: number;
  standardScore?: number;
  ageEquivalent?: string;
  gradeEquivalent?: string;
  confidenceInterval?: {
    lower: number;
    upper: number;
    level: number; // e.g., 95 for 95% CI
  };
}

interface NormReference {
  ageGroup: string;
  mean: number;
  standardDeviation: number;
  sampleSize?: number;
}

interface ScoreDisplayProps {
  title: string;
  subtitle?: string;
  scoreData: ScoreData;
  normReference?: NormReference;
  showDetailedView?: boolean;
  showInterpretation?: boolean;
  compact?: boolean;
}

// Interpretation thresholds
const getInterpretation = (percentile: number) => {
  if (percentile >= 98) return { label: 'Çok Üstün', color: '#059669', icon: TrendingUp };
  if (percentile >= 91) return { label: 'Üstün', color: '#10B981', icon: TrendingUp };
  if (percentile >= 75) return { label: 'Ortalamanın Üstü', color: '#34D399', icon: TrendingUp };
  if (percentile >= 25) return { label: 'Ortalama', color: '#6B7280', icon: Minus };
  if (percentile >= 9)
    return { label: 'Ortalamanın Altı', color: Colors.semantic.amber, icon: TrendingDown };
  if (percentile >= 2) return { label: 'Düşük', color: '#EF4444', icon: TrendingDown };
  return { label: 'Çok Düşük', color: '#DC2626', icon: AlertTriangle };
};

// Z-score to percentile conversion for visual
const zScoreToPercentilePosition = (zScore: number): number => {
  // Clamp z-score between -3 and 3 for display
  const clampedZ = Math.max(-3, Math.min(3, zScore));
  // Convert to 0-100 range
  return ((clampedZ + 3) / 6) * 100;
};

export function ScoreDisplay({
  title,
  subtitle,
  scoreData,
  normReference,
  showDetailedView = true,
  showInterpretation = true,
  compact = false,
}: ScoreDisplayProps) {
  const interpretation = useMemo(
    () => getInterpretation(scoreData.percentile),
    [scoreData.percentile]
  );
  const InterpretationIcon = interpretation.icon;
  const normalCurvePosition = useMemo(
    () => zScoreToPercentilePosition(scoreData.zScore),
    [scoreData.zScore]
  );

  // Calculate percentage of max score
  const scorePercentage = (scoreData.rawScore / scoreData.maxScore) * 100;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>{title}</Text>
          <View style={[styles.compactBadge, { backgroundColor: `${interpretation.color}15` }]}>
            <InterpretationIcon size={12} color={interpretation.color} />
            <Text style={[styles.compactBadgeText, { color: interpretation.color }]}>
              {interpretation.label}
            </Text>
          </View>
        </View>
        <View style={styles.compactScores}>
          <View style={styles.compactScoreItem}>
            <Text style={styles.compactScoreValue}>
              {scoreData.rawScore}/{scoreData.maxScore}
            </Text>
            <Text style={styles.compactScoreLabel}>Ham Puan</Text>
          </View>
          <View style={styles.compactDivider} />
          <View style={styles.compactScoreItem}>
            <Text style={styles.compactScoreValue}>{scoreData.percentile}%</Text>
            <Text style={styles.compactScoreLabel}>Yüzdelik</Text>
          </View>
          <View style={styles.compactDivider} />
          <View style={styles.compactScoreItem}>
            <Text style={styles.compactScoreValue}>{scoreData.zScore.toFixed(2)}</Text>
            <Text style={styles.compactScoreLabel}>Z-Skor</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showInterpretation && (
          <View
            style={[styles.interpretationBadge, { backgroundColor: `${interpretation.color}15` }]}
          >
            <InterpretationIcon size={16} color={interpretation.color} />
            <Text style={[styles.interpretationText, { color: interpretation.color }]}>
              {interpretation.label}
            </Text>
          </View>
        )}
      </View>

      {/* Main Score Display */}
      <View style={styles.mainScoreSection}>
        <View style={styles.rawScoreContainer}>
          <Text style={styles.rawScoreValue}>{scoreData.rawScore}</Text>
          <Text style={styles.rawScoreMax}>/ {scoreData.maxScore}</Text>
        </View>

        {/* Score Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <LinearGradient
              colors={[interpretation.color, `${interpretation.color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${scorePercentage}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>{scorePercentage.toFixed(0)}%</Text>
        </View>
      </View>

      {/* Statistical Scores */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{scoreData.percentile}</Text>
          <Text style={styles.statLabel}>Yüzdelik</Text>
          <Text style={styles.statUnit}>percentile</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{scoreData.zScore.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Z-Skor</Text>
          <Text style={styles.statUnit}>standart sapma</Text>
        </View>

        {scoreData.tScore !== undefined && (
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{scoreData.tScore}</Text>
            <Text style={styles.statLabel}>T-Skor</Text>
            <Text style={styles.statUnit}>M=50, SD=10</Text>
          </View>
        )}

        {scoreData.standardScore !== undefined && (
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{scoreData.standardScore}</Text>
            <Text style={styles.statLabel}>Standart Puan</Text>
            <Text style={styles.statUnit}>M=100, SD=15</Text>
          </View>
        )}
      </View>

      {/* Normal Distribution Curve Visualization */}
      {showDetailedView && (
        <View style={styles.curveSection}>
          <Text style={styles.curveSectionTitle}>Normal Dağılım Konumu</Text>
          <View style={styles.curveContainer}>
            {/* Bell curve simplified representation */}
            <View style={styles.curveBackground}>
              {/* Zone indicators */}
              <View style={[styles.curveZone, styles.curveZoneExtremeLow]} />
              <View style={[styles.curveZone, styles.curveZoneLow]} />
              <View style={[styles.curveZone, styles.curveZoneBelowAvg]} />
              <View style={[styles.curveZone, styles.curveZoneAverage]} />
              <View style={[styles.curveZone, styles.curveZoneAboveAvg]} />
              <View style={[styles.curveZone, styles.curveZoneHigh]} />
              <View style={[styles.curveZone, styles.curveZoneExtremeHigh]} />
            </View>

            {/* Position marker */}
            <View style={[styles.positionMarker, { left: `${normalCurvePosition}%` }]}>
              <View style={[styles.markerDot, { backgroundColor: interpretation.color }]} />
              <View style={[styles.markerLine, { backgroundColor: interpretation.color }]} />
            </View>

            {/* Z-score labels */}
            <View style={styles.curveLabels}>
              <Text style={styles.curveLabel}>-3σ</Text>
              <Text style={styles.curveLabel}>-2σ</Text>
              <Text style={styles.curveLabel}>-1σ</Text>
              <Text style={styles.curveLabel}>0</Text>
              <Text style={styles.curveLabel}>+1σ</Text>
              <Text style={styles.curveLabel}>+2σ</Text>
              <Text style={styles.curveLabel}>+3σ</Text>
            </View>
          </View>
        </View>
      )}

      {/* Confidence Interval */}
      {scoreData.confidenceInterval && (
        <View style={styles.ciSection}>
          <View style={styles.ciHeader}>
            <Info size={14} color={ProfessionalColors.text.secondary} />
            <Text style={styles.ciTitle}>%{scoreData.confidenceInterval.level} Güven Aralığı</Text>
          </View>
          <View style={styles.ciRange}>
            <Text style={styles.ciValue}>{scoreData.confidenceInterval.lower}</Text>
            <View style={styles.ciBar}>
              <View style={styles.ciBarFill} />
              <View style={styles.ciBarMarker} />
            </View>
            <Text style={styles.ciValue}>{scoreData.confidenceInterval.upper}</Text>
          </View>
        </View>
      )}

      {/* Age/Grade Equivalents */}
      {(scoreData.ageEquivalent || scoreData.gradeEquivalent) && (
        <View style={styles.equivalentsSection}>
          {scoreData.ageEquivalent && (
            <View style={styles.equivalentItem}>
              <Text style={styles.equivalentLabel}>Yaş Eşdeğeri</Text>
              <Text style={styles.equivalentValue}>{scoreData.ageEquivalent}</Text>
            </View>
          )}
          {scoreData.gradeEquivalent && (
            <View style={styles.equivalentItem}>
              <Text style={styles.equivalentLabel}>Sınıf Eşdeğeri</Text>
              <Text style={styles.equivalentValue}>{scoreData.gradeEquivalent}</Text>
            </View>
          )}
        </View>
      )}

      {/* Norm Reference Info */}
      {normReference && (
        <View style={styles.normSection}>
          <Text style={styles.normTitle}>Norm Referansı</Text>
          <View style={styles.normDetails}>
            <View style={styles.normItem}>
              <Text style={styles.normLabel}>Yaş Grubu</Text>
              <Text style={styles.normValue}>{normReference.ageGroup}</Text>
            </View>
            <View style={styles.normItem}>
              <Text style={styles.normLabel}>Ortalama (M)</Text>
              <Text style={styles.normValue}>{normReference.mean.toFixed(2)}</Text>
            </View>
            <View style={styles.normItem}>
              <Text style={styles.normLabel}>Std. Sapma (SD)</Text>
              <Text style={styles.normValue}>{normReference.standardDeviation.toFixed(2)}</Text>
            </View>
            {normReference.sampleSize && (
              <View style={styles.normItem}>
                <Text style={styles.normLabel}>Örneklem (N)</Text>
                <Text style={styles.normValue}>{normReference.sampleSize}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['4'],
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
    marginTop: 2,
  },
  interpretationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  interpretationText: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
  },
  mainScoreSection: {
    marginBottom: spacing['4'],
  },
  rawScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing['2'],
  },
  rawScoreValue: {
    fontSize: 48,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  rawScoreMax: {
    fontSize: 24,
    fontFamily: typography.family.medium,
    color: ProfessionalColors.text.tertiary,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.secondary,
    width: 40,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - spacing['4'] * 2 - spacing['2'] * 3) / 4,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.trust.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginTop: 2,
  },
  statUnit: {
    fontSize: 10,
    color: ProfessionalColors.text.tertiary,
  },
  curveSection: {
    marginBottom: spacing['4'],
  },
  curveSectionTitle: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginBottom: spacing['2'],
  },
  curveContainer: {
    position: 'relative',
    height: 60,
  },
  curveBackground: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
  },
  curveZone: {
    flex: 1,
  },
  curveZoneExtremeLow: {
    backgroundColor: '#FEE2E2',
  },
  curveZoneLow: {
    backgroundColor: '#FECACA',
  },
  curveZoneBelowAvg: {
    backgroundColor: '#FEF3C7',
  },
  curveZoneAverage: {
    backgroundColor: '#D1FAE5',
  },
  curveZoneAboveAvg: {
    backgroundColor: '#FEF3C7',
  },
  curveZoneHigh: {
    backgroundColor: '#FECACA',
  },
  curveZoneExtremeHigh: {
    backgroundColor: '#FEE2E2',
  },
  positionMarker: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    transform: [{ translateX: -6 }],
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    ...shadows.sm,
  },
  markerLine: {
    width: 2,
    height: 16,
    marginTop: -2,
  },
  curveLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  curveLabel: {
    fontSize: 10,
    color: ProfessionalColors.text.tertiary,
    fontFamily: typography.family.medium,
  },
  ciSection: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  ciHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing['2'],
  },
  ciTitle: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.secondary,
  },
  ciRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  ciValue: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  ciBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: 3,
    position: 'relative',
  },
  ciBarFill: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '100%',
    backgroundColor: ProfessionalColors.trust.primary,
    borderRadius: 3,
  },
  ciBarMarker: {
    position: 'absolute',
    top: -2,
    left: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ProfessionalColors.trust.primary,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    transform: [{ translateX: -5 }],
  },
  equivalentsSection: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginBottom: spacing['4'],
  },
  equivalentItem: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: radius.lg,
    padding: spacing['3'],
    alignItems: 'center',
  },
  equivalentLabel: {
    fontSize: 11,
    color: '#059669',
    fontFamily: typography.family.medium,
  },
  equivalentValue: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: '#047857',
    marginTop: 2,
  },
  normSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
    paddingTop: spacing['3'],
  },
  normTitle: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.secondary,
    marginBottom: spacing['2'],
  },
  normDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
  },
  normItem: {
    minWidth: '45%',
  },
  normLabel: {
    fontSize: 11,
    color: ProfessionalColors.text.tertiary,
  },
  normValue: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  compactBadgeText: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
  },
  compactScores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactScoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  compactScoreValue: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  compactScoreLabel: {
    fontSize: 10,
    color: ProfessionalColors.text.tertiary,
    marginTop: 1,
  },
  compactDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.neutral.gray200,
    marginHorizontal: spacing['2'],
  },
});

export default ScoreDisplay;
