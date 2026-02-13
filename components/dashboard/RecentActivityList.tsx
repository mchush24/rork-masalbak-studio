/**
 * Recent Activity List
 * Shows recent analyses/assessments with role-specific styling
 * Part of #17: Profesyonel Dashboard Tasarımı
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import {
  Brain,
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react-native';
import { spacing, radius, typography } from '@/constants/design-system';
import { ProfessionalColors, Colors } from '@/constants/colors';
import { useRole, UserRole } from '@/lib/contexts/RoleContext';
import { TASK_TYPE_LABELS } from '@/constants/task-labels';

interface RecentAnalysis {
  id: string;
  taskType: string;
  createdAt: string;
  childName?: string;
  childAge?: number;
  status?: 'completed' | 'pending' | 'review';
  score?: number;
}

interface RecentActivityListProps {
  analyses: RecentAnalysis[];
  isLoading?: boolean;
  onAnalysisPress?: (analysisId: string) => void;
  onSeeAllPress?: () => void;
  maxItems?: number;
}

// Role-specific labels
const getRoleLabels = (role: UserRole) => {
  switch (role) {
    case 'expert':
      return {
        sectionTitle: 'Son Değerlendirmeler',
        emptyTitle: 'Değerlendirme bulunmuyor',
        emptySubtitle: 'Yeni bir değerlendirme başlatarak başlayın',
        childLabel: 'Danışan',
        seeAll: 'Tüm Vakalar',
      };
    case 'teacher':
      return {
        sectionTitle: 'Son Öğrenci Değerlendirmeleri',
        emptyTitle: 'Değerlendirme bulunmuyor',
        emptySubtitle: 'Öğrenci değerlendirmesi başlatın',
        childLabel: 'Öğrenci',
        seeAll: 'Tüm Değerlendirmeler',
      };
    default:
      return {
        sectionTitle: 'Son Analizler',
        emptyTitle: 'Henüz analiz yok',
        emptySubtitle: 'Çizim yükleyerek başlayın',
        childLabel: 'Çocuk',
        seeAll: 'Tümünü Gör',
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const getStatusInfo = (status?: string) => {
  switch (status) {
    case 'pending':
      return { icon: Clock, color: Colors.semantic.amber, text: 'Bekliyor' };
    case 'review':
      return { icon: AlertCircle, color: '#EF4444', text: 'İnceleme' };
    case 'completed':
    default:
      return { icon: CheckCircle, color: '#10B981', text: 'Tamamlandı' };
  }
};

export function RecentActivityList({
  analyses,
  isLoading = false,
  onAnalysisPress,
  onSeeAllPress,
  maxItems = 5,
}: RecentActivityListProps) {
  const { role } = useRole();
  const labels = getRoleLabels(role);
  const displayedAnalyses = analyses.slice(0, maxItems);
  const isProfessional = role === 'expert' || role === 'teacher';

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>{labels.sectionTitle}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ProfessionalColors.trust.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{labels.sectionTitle}</Text>
        {analyses.length > 0 && (
          <Pressable onPress={onSeeAllPress} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.seeAllText}>{labels.seeAll} →</Text>
          </Pressable>
        )}
      </View>

      {displayedAnalyses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FileText size={32} color={ProfessionalColors.text.tertiary} />
          </View>
          <Text style={styles.emptyTitle}>{labels.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{labels.emptySubtitle}</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {displayedAnalyses.map((analysis, index) => {
            const statusInfo = getStatusInfo(analysis.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Pressable
                key={analysis.id}
                style={({ pressed }) => [
                  styles.analysisCard,
                  index === displayedAnalyses.length - 1 && styles.lastCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => onAnalysisPress?.(analysis.id)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Brain size={20} color={ProfessionalColors.trust.primary} />
                  </View>

                  <View style={styles.infoContainer}>
                    <Text style={styles.taskType}>
                      {TASK_TYPE_LABELS[analysis.taskType as keyof typeof TASK_TYPE_LABELS] ||
                        analysis.taskType}
                    </Text>
                    <View style={styles.metaRow}>
                      {analysis.childName && (
                        <>
                          <User size={12} color={ProfessionalColors.text.tertiary} />
                          <Text style={styles.metaText}>
                            {analysis.childName}
                            {analysis.childAge && ` (${analysis.childAge})`}
                          </Text>
                          <Text style={styles.metaDot}>•</Text>
                        </>
                      )}
                      <Clock size={12} color={ProfessionalColors.text.tertiary} />
                      <Text style={styles.metaText}>{formatDate(analysis.createdAt)}</Text>
                    </View>
                  </View>

                  {/* Status indicator for professionals */}
                  {isProfessional && analysis.status && (
                    <View
                      style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}
                    >
                      <StatusIcon size={12} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  )}

                  {/* Score for experts */}
                  {role === 'expert' && analysis.score !== undefined && (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreValue}>{analysis.score}</Text>
                      <Text style={styles.scoreLabel}>Skor</Text>
                    </View>
                  )}

                  <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['4'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.trust.primary,
  },
  loadingContainer: {
    paddingVertical: spacing['8'],
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.xl,
    padding: spacing['6'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginBottom: spacing['1'],
  },
  emptySubtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    overflow: 'hidden',
  },
  analysisCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  lastCard: {
    borderBottomWidth: 0,
  },
  cardPressed: {
    backgroundColor: '#FAFAFA',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    gap: spacing['3'],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ProfessionalColors.trust.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  taskType: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
  },
  metaDot: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.trust.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: ProfessionalColors.text.tertiary,
  },
});

export default RecentActivityList;
