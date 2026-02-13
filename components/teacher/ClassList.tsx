/**
 * Class List Component
 * Display and manage classes for teachers
 * Part of #19: Öğretmen Modu - Sınıf Yönetimi UI
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import {
  Users,
  ChevronRight,
  Plus,
  Search,
  BookOpen,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  BarChart2,
} from 'lucide-react-native';
import { spacing, radius, shadows, zIndex, typography } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';

interface ClassData {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  lastActivityDate: string;
  pendingAnalyses: number;
  completedAnalyses: number;
  averageScore?: number;
  isArchived?: boolean;
}

interface ClassListProps {
  classes: ClassData[];
  onClassPress?: (classId: string) => void;
  onAddClass?: () => void;
  onEditClass?: (classId: string) => void;
  onDeleteClass?: (classId: string) => void;
  onArchiveClass?: (classId: string) => void;
  showArchived?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  '1': '#EF4444',
  '2': Colors.semantic.amber,
  '3': '#10B981',
  '4': '#3B82F6',
  '5': Colors.secondary.violet,
  '6': '#EC4899',
  '7': '#14B8A6',
  '8': Colors.secondary.indigo,
  Anaokulu: '#F97316',
  default: ProfessionalColors.trust.primary,
};

export function ClassList({
  classes,
  onClassPress,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onArchiveClass,
  showArchived = false,
}: ClassListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? cls.isArchived : !cls.isArchived;
    return matchesSearch && matchesArchive;
  });

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

  const getGradeColor = (grade: string) => {
    const key = grade.replace(/[^0-9]/g, '') || grade;
    return GRADE_COLORS[key] || GRADE_COLORS.default;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sınıflarım</Text>
          <Text style={styles.subtitle}>
            {filteredClasses.length} sınıf • {classes.reduce((sum, c) => sum + c.studentCount, 0)}{' '}
            öğrenci
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={onAddClass}
        >
          <Plus size={20} color={Colors.neutral.white} />
          <Text style={styles.addButtonText}>Sınıf Ekle</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color={ProfessionalColors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sınıf ara..."
          placeholderTextColor={ProfessionalColors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Class List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={ProfessionalColors.text.tertiary} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Sınıf bulunamadı' : 'Henüz sınıf yok'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Farklı arama kriterleri deneyin' : 'Yeni sınıf ekleyerek başlayın'}
            </Text>
          </View>
        ) : (
          filteredClasses.map(cls => {
            const gradeColor = getGradeColor(cls.grade);
            const isMenuOpen = activeMenu === cls.id;

            return (
              <Pressable
                key={cls.id}
                style={({ pressed }) => [
                  styles.classCard,
                  pressed && !isMenuOpen && styles.classCardPressed,
                  cls.isArchived && styles.classCardArchived,
                ]}
                onPress={() => onClassPress?.(cls.id)}
              >
                <View style={styles.cardContent}>
                  {/* Grade Badge */}
                  <View style={[styles.gradeBadge, { backgroundColor: `${gradeColor}15` }]}>
                    <Text style={[styles.gradeText, { color: gradeColor }]}>{cls.grade}</Text>
                  </View>

                  {/* Class Info */}
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <View style={styles.metaRow}>
                      <Users size={12} color={ProfessionalColors.text.tertiary} />
                      <Text style={styles.metaText}>{cls.studentCount} öğrenci</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Clock size={12} color={ProfessionalColors.text.tertiary} />
                      <Text style={styles.metaText}>{formatDate(cls.lastActivityDate)}</Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    {cls.pendingAnalyses > 0 && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>{cls.pendingAnalyses}</Text>
                      </View>
                    )}
                    {cls.averageScore !== undefined && (
                      <View style={styles.scoreBadge}>
                        <BarChart2 size={12} color={ProfessionalColors.trust.primary} />
                        <Text style={styles.scoreText}>{cls.averageScore}%</Text>
                      </View>
                    )}
                  </View>

                  {/* Menu Button */}
                  <Pressable
                    style={styles.menuButton}
                    onPress={e => {
                      e.stopPropagation();
                      setActiveMenu(isMenuOpen ? null : cls.id);
                    }}
                  >
                    <MoreVertical size={18} color={ProfessionalColors.text.tertiary} />
                  </Pressable>

                  <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(cls.completedAnalyses / (cls.completedAnalyses + cls.pendingAnalyses)) * 100 || 0}%`,
                          backgroundColor: gradeColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {cls.completedAnalyses}/{cls.completedAnalyses + cls.pendingAnalyses} tamamlandı
                  </Text>
                </View>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <View style={styles.menuDropdown}>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setActiveMenu(null);
                        onEditClass?.(cls.id);
                      }}
                    >
                      <Edit2 size={16} color={ProfessionalColors.text.primary} />
                      <Text style={styles.menuItemText}>Düzenle</Text>
                    </Pressable>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setActiveMenu(null);
                        onArchiveClass?.(cls.id);
                      }}
                    >
                      <Archive size={16} color={ProfessionalColors.text.primary} />
                      <Text style={styles.menuItemText}>
                        {cls.isArchived ? 'Arşivden Çıkar' : 'Arşivle'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.menuItem, styles.menuItemDanger]}
                      onPress={() => {
                        setActiveMenu(null);
                        onDeleteClass?.(cls.id);
                      }}
                    >
                      <Trash2 size={16} color="#DC2626" />
                      <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Sil</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  title: {
    fontSize: 22,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ProfessionalColors.roles.teacher.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.neutral.gray50,
    borderRadius: radius.lg,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    marginBottom: spacing['4'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: ProfessionalColors.text.primary,
    padding: 0,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginTop: spacing['3'],
  },
  emptySubtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.tertiary,
    marginTop: spacing['1'],
  },
  classCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['3'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    ...shadows.sm,
  },
  classCardPressed: {
    backgroundColor: '#FAFAFA',
    transform: [{ scale: 0.99 }],
  },
  classCardArchived: {
    opacity: 0.7,
    backgroundColor: Colors.neutral.gray50,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 14,
    fontFamily: typography.family.bold,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
    marginBottom: 4,
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: '#D97706',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ProfessionalColors.trust.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.trust.primary,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: spacing['3'],
    gap: 6,
  },
  progressBackground: {
    height: 4,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: ProfessionalColors.text.tertiary,
  },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: 40,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    ...shadows.lg,
    zIndex: zIndex.floating,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  menuItemText: {
    fontSize: 14,
    color: ProfessionalColors.text.primary,
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuItemTextDanger: {
    color: '#DC2626',
  },
});

export default ClassList;
