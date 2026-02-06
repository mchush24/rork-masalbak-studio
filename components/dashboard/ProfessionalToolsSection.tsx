/**
 * Professional Tools Section
 * Quick access to professional features for experts and teachers
 * Part of #17: Profesyonel Dashboard Tasarımı
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FileText,
  Download,
  FolderOpen,
  BarChart2,
  Users,
  ClipboardList,
  Calendar,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { ProfessionalColors } from '@/constants/colors';
import { useRole, UserRole } from '@/lib/contexts/RoleContext';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  route?: string;
  badge?: string;
}

// Role-specific tool configurations
const getToolsForRole = (role: UserRole): ToolItem[] => {
  const expertTools: ToolItem[] = [
    {
      id: 'new-assessment',
      title: 'Yeni Değerlendirme',
      description: 'Klinik test başlat',
      icon: ClipboardList,
      color: ProfessionalColors.roles.expert.primary,
      route: '/advanced-analysis',
    },
    {
      id: 'reports',
      title: 'Rapor Oluştur',
      description: 'PDF klinik rapor',
      icon: FileText,
      color: '#10B981',
      route: '/reports',
    },
    {
      id: 'clients',
      title: 'Danışan Yönetimi',
      description: 'Vaka dosyaları',
      icon: FolderOpen,
      color: '#3B82F6',
      route: '/clients',
    },
    {
      id: 'export',
      title: 'Veri Dışa Aktar',
      description: 'Excel/CSV çıktısı',
      icon: Download,
      color: '#F59E0B',
      route: '/export',
    },
    {
      id: 'norms',
      title: 'Norm Referansları',
      description: 'Yaş normları tablosu',
      icon: BarChart2,
      color: '#8B5CF6',
      route: '/norms',
      badge: 'Pro',
    },
    {
      id: 'schedule',
      title: 'Randevu Takvimi',
      description: 'Değerlendirme planla',
      icon: Calendar,
      color: '#EC4899',
      route: '/schedule',
      badge: 'Yakında',
    },
  ];

  const teacherTools: ToolItem[] = [
    {
      id: 'new-assessment',
      title: 'Öğrenci Değerlendir',
      description: 'Yeni değerlendirme',
      icon: ClipboardList,
      color: ProfessionalColors.roles.teacher.primary,
      route: '/advanced-analysis',
    },
    {
      id: 'batch',
      title: 'Toplu Değerlendirme',
      description: 'Sınıf bazlı analiz',
      icon: Users,
      color: '#10B981',
      route: '/batch-analysis',
    },
    {
      id: 'reports',
      title: 'Sınıf Raporu',
      description: 'Özet rapor oluştur',
      icon: FileText,
      color: '#3B82F6',
      route: '/class-report',
    },
    {
      id: 'students',
      title: 'Öğrenci Listesi',
      description: 'Öğrenci yönetimi',
      icon: FolderOpen,
      color: '#8B5CF6',
      route: '/students',
    },
    {
      id: 'compare',
      title: 'Karşılaştırmalı Analiz',
      description: 'Sınıf ortalaması',
      icon: BarChart2,
      color: '#F59E0B',
      route: '/compare',
    },
    {
      id: 'export',
      title: 'Dışa Aktar',
      description: 'Veri çıktısı',
      icon: Download,
      color: '#EC4899',
      route: '/export',
    },
  ];

  const parentTools: ToolItem[] = [
    {
      id: 'new-analysis',
      title: 'Çizim Analiz Et',
      description: 'Yeni analiz başlat',
      icon: ClipboardList,
      color: ProfessionalColors.roles.parent.primary,
      route: '/advanced-analysis',
    },
    {
      id: 'children',
      title: 'Çocuklarım',
      description: 'Profilleri yönet',
      icon: Users,
      color: '#10B981',
      route: '/profile',
    },
    {
      id: 'history',
      title: 'Geçmiş Analizler',
      description: 'Önceki sonuçlar',
      icon: FolderOpen,
      color: '#3B82F6',
      route: '/history',
    },
    {
      id: 'reports',
      title: 'Raporlarım',
      description: 'PDF raporlar',
      icon: FileText,
      color: '#8B5CF6',
      route: '/reports',
    },
  ];

  switch (role) {
    case 'expert':
      return expertTools;
    case 'teacher':
      return teacherTools;
    default:
      return parentTools;
  }
};

interface ProfessionalToolsSectionProps {
  onToolPress?: (toolId: string, route?: string) => void;
}

export function ProfessionalToolsSection({
  onToolPress,
}: ProfessionalToolsSectionProps) {
  const { role, config } = useRole();
  const tools = getToolsForRole(role);

  // Get section title based on role
  const getSectionTitle = () => {
    switch (role) {
      case 'expert':
        return 'Klinik Araçlar';
      case 'teacher':
        return 'Öğretmen Araçları';
      default:
        return 'Hızlı İşlemler';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>
      </View>

      <View style={styles.toolsGrid}>
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Pressable
              key={tool.id}
              style={({ pressed }) => [
                styles.toolCard,
                pressed && styles.toolCardPressed,
              ]}
              onPress={() => onToolPress?.(tool.id, tool.route)}
            >
              <View style={styles.toolCardContent}>
                <View
                  style={[
                    styles.toolIconContainer,
                    { backgroundColor: `${tool.color}15` },
                  ]}
                >
                  <IconComponent size={22} color={tool.color} strokeWidth={2} />
                </View>
                <View style={styles.toolTextContainer}>
                  <View style={styles.toolTitleRow}>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    {tool.badge && (
                      <View
                        style={[
                          styles.toolBadge,
                          tool.badge === 'Yakında' && styles.toolBadgeComingSoon,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toolBadgeText,
                            tool.badge === 'Yakında' && styles.toolBadgeTextComingSoon,
                          ]}
                        >
                          {tool.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  toolsGrid: {
    gap: spacing['2'],
  },
  toolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  toolCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
    backgroundColor: '#FAFAFA',
  },
  toolCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    gap: spacing['3'],
  },
  toolIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: 2,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
  },
  toolDescription: {
    fontSize: 12,
    color: ProfessionalColors.text.secondary,
  },
  toolBadge: {
    backgroundColor: ProfessionalColors.trust.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toolBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
  },
  toolBadgeComingSoon: {
    backgroundColor: '#FEF3C7',
  },
  toolBadgeTextComingSoon: {
    color: '#D97706',
  },
});

export default ProfessionalToolsSection;
