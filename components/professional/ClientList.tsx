/**
 * ClientList - Client management list with search/filter
 * Phase 18: Professional Tools
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import {
  Search,
  Plus,
  Filter,
  Users,
  Archive,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { ClientCard, Client } from './ClientCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface ClientListProps {
  clients: Client[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onClientPress: (client: Client) => void;
  onClientLongPress?: (client: Client) => void;
  onAddClient: () => void;
}

type SortField = 'name' | 'lastAnalysis' | 'analysisCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ClientList({
  clients,
  isLoading = false,
  onRefresh,
  onClientPress,
  onClientLongPress,
  onAddClient,
}: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortField, setSortField] = useState<SortField>('lastAnalysis');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Filter by archived status
    if (!showArchived) {
      result = result.filter((c) => !c.isArchived);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.parentName?.toLowerCase().includes(query) ||
          c.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastAnalysis':
          const dateA = a.lastAnalysisDate
            ? new Date(a.lastAnalysisDate).getTime()
            : 0;
          const dateB = b.lastAnalysisDate
            ? new Date(b.lastAnalysisDate).getTime()
            : 0;
          comparison = dateA - dateB;
          break;
        case 'analysisCount':
          comparison = a.analysisCount - b.analysisCount;
          break;
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, showArchived, sortField, sortOrder]);

  const activeClientCount = clients.filter((c) => !c.isArchived).length;
  const archivedClientCount = clients.filter((c) => c.isArchived).length;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Client; index: number }) => (
      <Animated.View entering={SlideInRight.delay(index * 50).springify()}>
        <ClientCard
          client={item}
          onPress={() => onClientPress(item)}
          onLongPress={() => onClientLongPress?.(item)}
        />
      </Animated.View>
    ),
    [onClientPress, onClientLongPress]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Users size={16} color={Colors.primary.purple} />
          <Text style={styles.statValue}>{activeClientCount}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Archive size={16} color={Colors.neutral.gray} />
          <Text style={styles.statValue}>{archivedClientCount}</Text>
          <Text style={styles.statLabel}>Arşiv</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={Colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Danışan ara..."
            placeholderTextColor={Colors.neutral.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.neutral.gray} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter
            size={18}
            color={showFilters ? Colors.neutral.white : Colors.primary.purple}
          />
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.filtersContainer}>
          {/* Archived toggle */}
          <Pressable
            style={[styles.filterChip, showArchived && styles.filterChipActive]}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Archive
              size={14}
              color={showArchived ? Colors.neutral.white : Colors.neutral.gray}
            />
            <Text
              style={[
                styles.filterChipText,
                showArchived && styles.filterChipTextActive,
              ]}
            >
              Arşivi Göster
            </Text>
          </Pressable>

          {/* Sort options */}
          <View style={styles.sortOptions}>
            <Text style={styles.sortLabel}>Sırala:</Text>
            {[
              { field: 'lastAnalysis' as SortField, label: 'Son Analiz' },
              { field: 'name' as SortField, label: 'İsim' },
              { field: 'analysisCount' as SortField, label: 'Analiz Sayısı' },
            ].map((option) => (
              <Pressable
                key={option.field}
                style={[
                  styles.sortChip,
                  sortField === option.field && styles.sortChipActive,
                ]}
                onPress={() => toggleSort(option.field)}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortField === option.field && styles.sortChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortField === option.field &&
                  (sortOrder === 'asc' ? (
                    <SortAsc size={12} color={Colors.neutral.white} />
                  ) : (
                    <SortDesc size={12} color={Colors.neutral.white} />
                  ))}
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          illustration="search-empty"
          title="Sonuç Bulunamadı"
          description={`"${searchQuery}" ile eşleşen danışan yok.`}
          mascotMood="curious"
        />
      );
    }

    return (
      <EmptyState
        illustration="welcome"
        title="Henüz Danışan Yok"
        description="İlk danışanınızı ekleyerek başlayın."
        actionLabel="Danışan Ekle"
        onAction={onAddClient}
        mascotMood="happy"
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor={Colors.primary.purple}
            />
          ) : undefined
        }
      />

      {/* FAB - Add Client */}
      <Pressable style={styles.fab} onPress={onAddClient}>
        <Plus size={24} color={Colors.neutral.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightest,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral.darkest,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.neutral.light,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.neutral.darkest,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary.purple,
  },
  filtersContainer: {
    marginTop: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lighter,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.purple,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.neutral.gray,
  },
  filterChipTextActive: {
    color: Colors.neutral.white,
  },
  sortOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    color: Colors.neutral.gray,
    marginRight: 4,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral.lighter,
  },
  sortChipActive: {
    backgroundColor: Colors.primary.purple,
  },
  sortChipText: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  sortChipTextActive: {
    color: Colors.neutral.white,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default ClientList;
