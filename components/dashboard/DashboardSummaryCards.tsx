/**
 * Dashboard Summary Cards
 * Professional overview cards for experts, teachers, and parents
 * Part of #17: Profesyonel Dashboard Tasarımı
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  Users,
  CalendarDays,
  AlertCircle,
  TrendingUp,
  Clock,
  FileText,
  BarChart3,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';
import { useRole, UserRole } from '@/lib/contexts/RoleContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing['3'];
const CARD_WIDTH = (SCREEN_WIDTH - spacing['4'] * 2 - CARD_GAP) / 2;

interface SummaryStats {
  totalAnalyses: number;
  weeklyAnalyses: number;
  monthlyAnalyses: number;
  childrenCount: number;
  pendingReviews: number;
  recentTrend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

interface DashboardSummaryCardsProps {
  stats: SummaryStats;
  onCardPress?: (cardType: string) => void;
  isLoading?: boolean;
}

// Role-specific card configurations
const getCardConfigsForRole = (role: UserRole, stats: SummaryStats) => {
  const baseCards = {
    parent: [
      {
        id: 'total',
        title: 'Toplam Analiz',
        value: stats.totalAnalyses,
        icon: Brain,
        gradient: [Colors.secondary.lavender, Colors.secondary.violet],
        subtitle: 'Tamamlanan değerlendirme',
      },
      {
        id: 'children',
        title: 'Çocuklarım',
        value: stats.childrenCount,
        icon: Users,
        gradient: ['#F472B6', '#EC4899'],
        subtitle: 'Kayıtlı profil',
      },
      {
        id: 'weekly',
        title: 'Bu Hafta',
        value: stats.weeklyAnalyses,
        icon: CalendarDays,
        gradient: ['#34D399', '#10B981'],
        subtitle: 'Yeni analiz',
      },
      {
        id: 'trend',
        title: 'Gelişim',
        value: `${stats.trendPercent > 0 ? '+' : ''}${stats.trendPercent}%`,
        icon: TrendingUp,
        gradient: ['#60A5FA', '#3B82F6'],
        subtitle:
          stats.recentTrend === 'up'
            ? 'Yükselişte'
            : stats.recentTrend === 'down'
              ? 'Düşüşte'
              : 'Sabit',
        isPercentage: true,
      },
    ],
    teacher: [
      {
        id: 'total',
        title: 'Toplam Değerlendirme',
        value: stats.totalAnalyses,
        icon: FileText,
        gradient: [
          ProfessionalColors.roles.teacher.gradient[0],
          ProfessionalColors.roles.teacher.gradient[1],
        ],
        subtitle: 'Tamamlanan',
      },
      {
        id: 'students',
        title: 'Öğrenciler',
        value: stats.childrenCount,
        icon: Users,
        gradient: ['#34D399', '#10B981'],
        subtitle: 'Kayıtlı öğrenci',
      },
      {
        id: 'monthly',
        title: 'Bu Ay',
        value: stats.monthlyAnalyses,
        icon: BarChart3,
        gradient: [Colors.secondary.lavender, Colors.secondary.violet],
        subtitle: 'Değerlendirme',
      },
      {
        id: 'pending',
        title: 'Bekleyen',
        value: stats.pendingReviews,
        icon: Clock,
        gradient: stats.pendingReviews > 0 ? ['#FBBF24', Colors.semantic.amber] : [Colors.neutral.gray400, '#6B7280'],
        subtitle: 'İnceleme bekliyor',
        highlight: stats.pendingReviews > 0,
      },
    ],
    expert: [
      {
        id: 'cases',
        title: 'Vaka Sayısı',
        value: stats.totalAnalyses,
        icon: FileText,
        gradient: [
          ProfessionalColors.roles.expert.gradient[0],
          ProfessionalColors.roles.expert.gradient[1],
        ],
        subtitle: 'Toplam değerlendirme',
      },
      {
        id: 'clients',
        title: 'Danışanlar',
        value: stats.childrenCount,
        icon: Users,
        gradient: ['#34D399', '#10B981'],
        subtitle: 'Aktif dosya',
      },
      {
        id: 'pending',
        title: 'Bekleyen Vaka',
        value: stats.pendingReviews,
        icon: AlertCircle,
        gradient: stats.pendingReviews > 0 ? ['#F87171', '#EF4444'] : [Colors.neutral.gray400, '#6B7280'],
        subtitle: 'Değerlendirme bekliyor',
        highlight: stats.pendingReviews > 0,
      },
      {
        id: 'weekly',
        title: 'Haftalık',
        value: stats.weeklyAnalyses,
        icon: CalendarDays,
        gradient: ['#60A5FA', '#3B82F6'],
        subtitle: 'Son 7 gün',
      },
    ],
  };

  return baseCards[role];
};

export function DashboardSummaryCards({
  stats,
  onCardPress,
  isLoading = false,
}: DashboardSummaryCardsProps) {
  const { role } = useRole();
  const cards = getCardConfigsForRole(role, stats);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.card, styles.cardLoading]}>
              <View style={styles.loadingPulse} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {cards.map(card => {
          const IconComponent = card.icon;
          return (
            <Pressable
              key={card.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onCardPress?.(card.id)}
            >
              <LinearGradient
                colors={card.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <IconComponent size={20} color={Colors.neutral.white} strokeWidth={2} />
                  </View>
                  {'highlight' in card && card.highlight && <View style={styles.highlightDot} />}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardValue}>
                    {'isPercentage' in card && card.isPercentage
                      ? card.value
                      : typeof card.value === 'number'
                        ? card.value.toLocaleString('tr-TR')
                        : card.value}
                  </Text>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['4'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardLoading: {
    height: 120,
    backgroundColor: Colors.neutral.gray100,
  },
  loadingPulse: {
    flex: 1,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: radius.xl,
  },
  cardGradient: {
    padding: spacing['4'],
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['3'],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.white,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral.white,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
});

export default DashboardSummaryCards;
