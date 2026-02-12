/**
 * Student List Component
 * Display and manage students within a class
 * Part of #19: Öğretmen Modu - Sınıf Yönetimi UI
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import {
  User,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Check,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';

interface StudentData {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  totalAnalyses: number;
  pendingAnalyses: number;
  lastAnalysisDate?: string;
  averagePercentile?: number;
  trend?: 'up' | 'down' | 'stable';
  notes?: string;
  hasAlert?: boolean;
}

interface StudentListProps {
  students: StudentData[];
  className?: string;
  onStudentPress?: (studentId: string) => void;
  onAddStudent?: () => void;
  onBatchAnalysis?: (studentIds: string[]) => void;
  selectable?: boolean;
}

type SortOption = 'name' | 'age' | 'analyses' | 'score';
type FilterOption = 'all' | 'pending' | 'alerts' | 'noAnalysis';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'name', label: 'İsim' },
  { id: 'age', label: 'Yaş' },
  { id: 'analyses', label: 'Analiz Sayısı' },
  { id: 'score', label: 'Ortalama Skor' },
];

const FILTER_OPTIONS: { id: FilterOption; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'pending', label: 'Bekleyen' },
  { id: 'alerts', label: 'Dikkat Gereken' },
  { id: 'noAnalysis', label: 'Analiz Yok' },
];

export function StudentList({
  students,
  className,
  onStudentPress,
  onAddStudent,
  onBatchAnalysis,
  selectable = false,
}: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Filter by search
    if (searchQuery) {
      result = result.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by status
    switch (filterBy) {
      case 'pending':
        result = result.filter(s => s.pendingAnalyses > 0);
        break;
      case 'alerts':
        result = result.filter(s => s.hasAlert);
        break;
      case 'noAnalysis':
        result = result.filter(s => s.totalAnalyses === 0);
        break;
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr');
        case 'age':
          return a.age - b.age;
        case 'analyses':
          return b.totalAnalyses - a.totalAnalyses;
        case 'score':
          return (b.averagePercentile ?? 0) - (a.averagePercentile ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [students, searchQuery, sortBy, filterBy]);

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAll = () => {
    if (selectedStudents.size === filteredAndSortedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredAndSortedStudents.map(s => s.id)));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Henüz yok';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{className ? `${className} Öğrencileri` : 'Öğrenciler'}</Text>
          <Text style={styles.subtitle}>
            {filteredAndSortedStudents.length} öğrenci
            {filterBy !== 'all' && ` (${FILTER_OPTIONS.find(f => f.id === filterBy)?.label})`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {selectable && selectedStudents.size > 0 && (
            <Pressable
              style={styles.batchButton}
              onPress={() => onBatchAnalysis?.(Array.from(selectedStudents))}
            >
              <FileText size={16} color={Colors.neutral.white} />
              <Text style={styles.batchButtonText}>Toplu Analiz ({selectedStudents.size})</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={onAddStudent}
          >
            <Plus size={20} color={Colors.neutral.white} />
          </Pressable>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Search size={18} color={ProfessionalColors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Öğrenci ara..."
            placeholderTextColor={ProfessionalColors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter
            size={18}
            color={
              showFilters ? ProfessionalColors.trust.primary : ProfessionalColors.text.secondary
            }
          />
        </Pressable>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filtersSection}>
          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filtre:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FILTER_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  style={[styles.filterChip, filterBy === option.id && styles.filterChipActive]}
                  onPress={() => setFilterBy(option.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterBy === option.id && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Sort Chips */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sırala:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SORT_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  style={[styles.filterChip, sortBy === option.id && styles.filterChipActive]}
                  onPress={() => setSortBy(option.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      sortBy === option.id && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Select All (when in selectable mode) */}
      {selectable && filteredAndSortedStudents.length > 0 && (
        <Pressable style={styles.selectAllRow} onPress={selectAll}>
          <View
            style={[
              styles.checkbox,
              selectedStudents.size === filteredAndSortedStudents.length && styles.checkboxChecked,
            ]}
          >
            {selectedStudents.size === filteredAndSortedStudents.length && (
              <Check size={14} color={Colors.neutral.white} />
            )}
          </View>
          <Text style={styles.selectAllText}>
            {selectedStudents.size === filteredAndSortedStudents.length
              ? 'Seçimi Kaldır'
              : 'Tümünü Seç'}
          </Text>
        </Pressable>
      )}

      {/* Student List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredAndSortedStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color={ProfessionalColors.text.tertiary} />
            <Text style={styles.emptyTitle}>
              {searchQuery || filterBy !== 'all' ? 'Öğrenci bulunamadı' : 'Henüz öğrenci yok'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || filterBy !== 'all'
                ? 'Farklı filtre veya arama kriterleri deneyin'
                : 'Yeni öğrenci ekleyerek başlayın'}
            </Text>
          </View>
        ) : (
          filteredAndSortedStudents.map(student => {
            const TrendIcon = getTrendIcon(student.trend);
            const trendColor = getTrendColor(student.trend);
            const isSelected = selectedStudents.has(student.id);

            return (
              <Pressable
                key={student.id}
                style={({ pressed }) => [
                  styles.studentCard,
                  pressed && styles.studentCardPressed,
                  isSelected && styles.studentCardSelected,
                ]}
                onPress={() => {
                  if (selectable) {
                    toggleStudent(student.id);
                  } else {
                    onStudentPress?.(student.id);
                  }
                }}
              >
                {/* Checkbox (selectable mode) */}
                {selectable && (
                  <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <Check size={14} color={Colors.neutral.white} />}
                  </View>
                )}

                {/* Avatar */}
                <View
                  style={[
                    styles.avatar,
                    student.gender === 'female' ? styles.avatarFemale : styles.avatarMale,
                  ]}
                >
                  <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
                </View>

                {/* Info */}
                <View style={styles.studentInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    {student.hasAlert && <AlertCircle size={14} color="#EF4444" />}
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{student.age} yaş</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{student.totalAnalyses} analiz</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Clock size={12} color={ProfessionalColors.text.tertiary} />
                    <Text style={styles.metaText}>{formatDate(student.lastAnalysisDate)}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  {student.pendingAnalyses > 0 && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>{student.pendingAnalyses}</Text>
                    </View>
                  )}
                  {student.averagePercentile !== undefined && (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreValue}>{student.averagePercentile}%</Text>
                      <TrendIcon size={14} color={trendColor} />
                    </View>
                  )}
                </View>

                {!selectable && <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />}
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
    marginBottom: spacing['3'],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ProfessionalColors.trust.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  batchButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ProfessionalColors.roles.teacher.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.neutral.gray50,
    borderRadius: radius.lg,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: ProfessionalColors.text.primary,
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: ProfessionalColors.trust.background,
    borderColor: ProfessionalColors.trust.primary,
  },
  filtersSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['3'],
    gap: spacing['3'],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: ProfessionalColors.text.secondary,
    width: 50,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginRight: spacing['2'],
  },
  filterChipActive: {
    backgroundColor: ProfessionalColors.trust.background,
    borderColor: ProfessionalColors.trust.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
  },
  filterChipTextActive: {
    color: ProfessionalColors.trust.primary,
    fontWeight: '600',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['2'],
    marginBottom: spacing['2'],
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: ProfessionalColors.trust.primary,
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
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
    marginTop: spacing['3'],
  },
  emptySubtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.tertiary,
    marginTop: spacing['1'],
    textAlign: 'center',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['3'],
    marginBottom: spacing['2'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  studentCardPressed: {
    backgroundColor: '#FAFAFA',
  },
  studentCardSelected: {
    borderColor: ProfessionalColors.trust.primary,
    backgroundColor: ProfessionalColors.trust.background,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: ProfessionalColors.trust.primary,
    borderColor: ProfessionalColors.trust.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMale: {
    backgroundColor: '#DBEAFE',
  },
  avatarFemale: {
    backgroundColor: '#FCE7F3',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
  },
  studentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
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
    fontWeight: '700',
    color: '#D97706',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ProfessionalColors.trust.primary,
  },
});

export default StudentList;
