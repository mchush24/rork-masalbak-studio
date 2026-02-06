/**
 * HistoryFilters - Filter chips for history screen
 *
 * Features:
 * - Date range filters (Today, Week, Month, All)
 * - Test type filters
 * - Favorites filter
 * - Horizontal scrollable
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Star, Calendar, Filter, Brain } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, iconSizes, iconStroke } from '@/constants/design-system';

export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type TestTypeFilter = 'all' | 'DAP' | 'HTP' | 'Family' | 'Cactus' | 'Tree' | 'Garden' | 'BenderGestalt2' | 'ReyOsterrieth' | 'Luscher';

interface HistoryFiltersProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  testTypeFilter: TestTypeFilter;
  onTestTypeFilterChange: (filter: TestTypeFilter) => void;
  showFavorites: boolean;
  onShowFavoritesChange: (show: boolean) => void;
}

const DATE_FILTERS: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'today', label: 'Bugün' },
  { id: 'week', label: 'Bu Hafta' },
  { id: 'month', label: 'Bu Ay' },
];

const TEST_TYPE_FILTERS: { id: TestTypeFilter; label: string }[] = [
  { id: 'all', label: 'Tüm Testler' },
  { id: 'DAP', label: 'İnsan Çizimi' },
  { id: 'HTP', label: 'Ev-Ağaç-İnsan' },
  { id: 'Family', label: 'Aile' },
  { id: 'Cactus', label: 'Kaktüs' },
  { id: 'Tree', label: 'Ağaç' },
  { id: 'Garden', label: 'Bahçe' },
  { id: 'Luscher', label: 'Luscher' },
];

export function HistoryFilters({
  dateFilter,
  onDateFilterChange,
  testTypeFilter,
  onTestTypeFilterChange,
  showFavorites,
  onShowFavoritesChange,
}: HistoryFiltersProps) {
  return (
    <View style={styles.container}>
      {/* Date Filters */}
      <View style={styles.filterSection}>
        <View style={styles.sectionHeader}>
          <Calendar size={iconSizes.inline} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
          <Text style={styles.sectionLabel}>Tarih</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {DATE_FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              style={({ pressed }) => [
                styles.chip,
                dateFilter === filter.id && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onDateFilterChange(filter.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  dateFilter === filter.id && styles.chipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Test Type & Favorites Row */}
      <View style={styles.secondaryFilters}>
        {/* Favorites Toggle */}
        <Pressable
          style={({ pressed }) => [
            styles.chip,
            showFavorites && styles.chipFavoriteActive,
            pressed && styles.chipPressed,
          ]}
          onPress={() => onShowFavoritesChange(!showFavorites)}
        >
          <Star
            size={iconSizes.inline}
            color={showFavorites ? Colors.neutral.white : Colors.secondary.sunshine}
            fill={showFavorites ? Colors.neutral.white : 'transparent'}
            strokeWidth={iconStroke.standard}
          />
          <Text
            style={[
              styles.chipText,
              showFavorites && styles.chipTextActive,
            ]}
          >
            Favoriler
          </Text>
        </Pressable>

        {/* Test Type Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {TEST_TYPE_FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              style={({ pressed }) => [
                styles.chip,
                testTypeFilter === filter.id && styles.chipTestActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => onTestTypeFilterChange(filter.id)}
            >
              {filter.id === 'all' ? (
                <Filter
                  size={iconSizes.inline}
                  color={testTypeFilter === filter.id ? Colors.neutral.white : Colors.secondary.lavender}
                  strokeWidth={iconStroke.standard}
                />
              ) : (
                <Brain
                  size={iconSizes.inline}
                  color={testTypeFilter === filter.id ? Colors.neutral.white : Colors.secondary.grass}
                  strokeWidth={iconStroke.standard}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  testTypeFilter === filter.id && styles.chipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterSection: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral.lighter,
  },
  chipActive: {
    backgroundColor: Colors.secondary.sky,
    borderColor: Colors.secondary.sky,
  },
  chipFavoriteActive: {
    backgroundColor: Colors.secondary.sunshine,
    borderColor: Colors.secondary.sunshine,
  },
  chipTestActive: {
    backgroundColor: Colors.secondary.lavender,
    borderColor: Colors.secondary.lavender,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  chipTextActive: {
    color: Colors.neutral.white,
  },
});

export default HistoryFilters;
