/**
 * Norm Reference Modal
 * Display normative data tables for clinical tests
 * Part of #18: Uzman/Klinisyen Modu UI Tasarımı
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { X, BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';

const { height: _SCREEN_HEIGHT } = Dimensions.get('window');

interface NormDataPoint {
  ageRange: string;
  mean: number;
  standardDeviation: number;
  percentile10?: number;
  percentile25?: number;
  percentile50?: number;
  percentile75?: number;
  percentile90?: number;
  sampleSize: number;
}

interface NormTable {
  id: string;
  testName: string;
  subtest?: string;
  normType: 'age' | 'grade' | 'gender';
  population: string;
  year: number;
  source: string;
  data: NormDataPoint[];
}

interface NormReferenceModalProps {
  visible: boolean;
  onClose: () => void;
  testType?: string;
  childAge?: number;
  onSelectNorm?: (norm: NormDataPoint, table: NormTable) => void;
}

// Sample norm data for different tests
const NORM_TABLES: NormTable[] = [
  {
    id: 'bender-2-age',
    testName: 'Bender Gestalt II',
    subtest: 'Kopya',
    normType: 'age',
    population: 'Türkiye Standardizasyonu',
    year: 2020,
    source: 'Türk Psikologlar Derneği',
    data: [
      {
        ageRange: '4:0 - 4:11',
        mean: 4.2,
        standardDeviation: 2.1,
        percentile10: 1,
        percentile25: 2,
        percentile50: 4,
        percentile75: 6,
        percentile90: 7,
        sampleSize: 120,
      },
      {
        ageRange: '5:0 - 5:11',
        mean: 6.8,
        standardDeviation: 2.4,
        percentile10: 3,
        percentile25: 5,
        percentile50: 7,
        percentile75: 9,
        percentile90: 10,
        sampleSize: 145,
      },
      {
        ageRange: '6:0 - 6:11',
        mean: 9.2,
        standardDeviation: 2.6,
        percentile10: 5,
        percentile25: 7,
        percentile50: 9,
        percentile75: 11,
        percentile90: 13,
        sampleSize: 168,
      },
      {
        ageRange: '7:0 - 7:11',
        mean: 11.5,
        standardDeviation: 2.3,
        percentile10: 8,
        percentile25: 10,
        percentile50: 12,
        percentile75: 13,
        percentile90: 15,
        sampleSize: 152,
      },
      {
        ageRange: '8:0 - 8:11',
        mean: 13.1,
        standardDeviation: 2.1,
        percentile10: 10,
        percentile25: 12,
        percentile50: 13,
        percentile75: 15,
        percentile90: 16,
        sampleSize: 140,
      },
      {
        ageRange: '9:0 - 9:11',
        mean: 14.3,
        standardDeviation: 1.9,
        percentile10: 11,
        percentile25: 13,
        percentile50: 14,
        percentile75: 16,
        percentile90: 17,
        sampleSize: 135,
      },
      {
        ageRange: '10:0 - 10:11',
        mean: 15.2,
        standardDeviation: 1.7,
        percentile10: 12,
        percentile25: 14,
        percentile50: 15,
        percentile75: 17,
        percentile90: 18,
        sampleSize: 128,
      },
      {
        ageRange: '11:0 - 11:11',
        mean: 15.8,
        standardDeviation: 1.5,
        percentile10: 13,
        percentile25: 15,
        percentile50: 16,
        percentile75: 17,
        percentile90: 18,
        sampleSize: 118,
      },
      {
        ageRange: '12:0 - 12:11',
        mean: 16.2,
        standardDeviation: 1.4,
        percentile10: 14,
        percentile25: 15,
        percentile50: 16,
        percentile75: 17,
        percentile90: 18,
        sampleSize: 112,
      },
    ],
  },
  {
    id: 'dap-age',
    testName: 'İnsan Çizimi Testi (DAP)',
    normType: 'age',
    population: 'Türkiye Standardizasyonu',
    year: 2019,
    source: 'Koppitz Puanlama Sistemi - TR Uyarlama',
    data: [
      {
        ageRange: '5:0 - 5:11',
        mean: 5.3,
        standardDeviation: 2.8,
        percentile10: 1,
        percentile25: 3,
        percentile50: 5,
        percentile75: 7,
        percentile90: 9,
        sampleSize: 95,
      },
      {
        ageRange: '6:0 - 6:11',
        mean: 8.7,
        standardDeviation: 3.2,
        percentile10: 4,
        percentile25: 6,
        percentile50: 9,
        percentile75: 11,
        percentile90: 13,
        sampleSize: 112,
      },
      {
        ageRange: '7:0 - 7:11',
        mean: 12.4,
        standardDeviation: 3.5,
        percentile10: 7,
        percentile25: 10,
        percentile50: 12,
        percentile75: 15,
        percentile90: 17,
        sampleSize: 128,
      },
      {
        ageRange: '8:0 - 8:11',
        mean: 15.8,
        standardDeviation: 3.8,
        percentile10: 10,
        percentile25: 13,
        percentile50: 16,
        percentile75: 19,
        percentile90: 21,
        sampleSize: 134,
      },
      {
        ageRange: '9:0 - 9:11',
        mean: 18.6,
        standardDeviation: 4.1,
        percentile10: 12,
        percentile25: 15,
        percentile50: 19,
        percentile75: 22,
        percentile90: 24,
        sampleSize: 118,
      },
      {
        ageRange: '10:0 - 10:11',
        mean: 21.2,
        standardDeviation: 4.3,
        percentile10: 15,
        percentile25: 18,
        percentile50: 21,
        percentile75: 24,
        percentile90: 27,
        sampleSize: 105,
      },
      {
        ageRange: '11:0 - 11:11',
        mean: 23.5,
        standardDeviation: 4.5,
        percentile10: 17,
        percentile25: 20,
        percentile50: 24,
        percentile75: 27,
        percentile90: 29,
        sampleSize: 98,
      },
      {
        ageRange: '12:0 - 12:11',
        mean: 25.1,
        standardDeviation: 4.2,
        percentile10: 19,
        percentile25: 22,
        percentile50: 25,
        percentile75: 28,
        percentile90: 31,
        sampleSize: 92,
      },
    ],
  },
  {
    id: 'htp-emotional',
    testName: 'Ev-Ağaç-İnsan (HTP)',
    subtest: 'Duygusal Göstergeler',
    normType: 'age',
    population: 'Türkiye Standardizasyonu',
    year: 2021,
    source: 'HTP Türkiye Norm Çalışması',
    data: [
      {
        ageRange: '5:0 - 6:11',
        mean: 2.1,
        standardDeviation: 1.4,
        percentile10: 0,
        percentile25: 1,
        percentile50: 2,
        percentile75: 3,
        percentile90: 4,
        sampleSize: 85,
      },
      {
        ageRange: '7:0 - 8:11',
        mean: 1.8,
        standardDeviation: 1.2,
        percentile10: 0,
        percentile25: 1,
        percentile50: 2,
        percentile75: 3,
        percentile90: 4,
        sampleSize: 102,
      },
      {
        ageRange: '9:0 - 10:11',
        mean: 1.5,
        standardDeviation: 1.1,
        percentile10: 0,
        percentile25: 1,
        percentile50: 1,
        percentile75: 2,
        percentile90: 3,
        sampleSize: 95,
      },
      {
        ageRange: '11:0 - 12:11',
        mean: 1.3,
        standardDeviation: 1.0,
        percentile10: 0,
        percentile25: 0,
        percentile50: 1,
        percentile75: 2,
        percentile90: 3,
        sampleSize: 88,
      },
    ],
  },
  {
    id: 'family-drawing',
    testName: 'Aile Çizimi Testi',
    subtest: 'Corman Puanlama',
    normType: 'age',
    population: 'Türkiye Standardizasyonu',
    year: 2018,
    source: 'Corman Aile Çizimi - TR Uyarlama',
    data: [
      {
        ageRange: '5:0 - 6:11',
        mean: 12.4,
        standardDeviation: 4.2,
        percentile10: 6,
        percentile25: 9,
        percentile50: 12,
        percentile75: 15,
        percentile90: 18,
        sampleSize: 78,
      },
      {
        ageRange: '7:0 - 8:11',
        mean: 16.8,
        standardDeviation: 4.8,
        percentile10: 10,
        percentile25: 13,
        percentile50: 17,
        percentile75: 21,
        percentile90: 24,
        sampleSize: 92,
      },
      {
        ageRange: '9:0 - 10:11',
        mean: 20.5,
        standardDeviation: 5.1,
        percentile10: 13,
        percentile25: 17,
        percentile50: 20,
        percentile75: 24,
        percentile90: 28,
        sampleSize: 86,
      },
      {
        ageRange: '11:0 - 12:11',
        mean: 23.2,
        standardDeviation: 5.4,
        percentile10: 16,
        percentile25: 19,
        percentile50: 23,
        percentile75: 27,
        percentile90: 31,
        sampleSize: 81,
      },
    ],
  },
];

export function NormReferenceModal({
  visible,
  onClose,
  testType,
  childAge,
  onSelectNorm,
}: NormReferenceModalProps) {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(null);

  // Filter tables based on test type if provided
  const filteredTables = useMemo(() => {
    if (!testType) return NORM_TABLES;

    const testTypeMap: Record<string, string[]> = {
      BenderGestalt2: ['bender-2-age'],
      Bender: ['bender-2-age'],
      DAP: ['dap-age'],
      HTP: ['htp-emotional'],
      Family: ['family-drawing'],
      Aile: ['family-drawing'],
    };

    const relevantIds = testTypeMap[testType] || [];
    if (relevantIds.length === 0) return NORM_TABLES;

    return NORM_TABLES.filter(t => relevantIds.includes(t.id));
  }, [testType]);

  // Find matching age range for child
  const findMatchingAgeRange = (data: NormDataPoint[]): string | null => {
    if (!childAge) return null;

    for (const point of data) {
      const [start, end] = point.ageRange.split(' - ');
      const [startYear] = start.split(':').map(Number);
      const [endYear] = end.split(':').map(Number);

      if (childAge >= startYear && childAge <= endYear) {
        return point.ageRange;
      }
    }
    return null;
  };

  const toggleTable = (tableId: string) => {
    setExpandedTable(expandedTable === tableId ? null : tableId);
  };

  const handleSelectNorm = (norm: NormDataPoint, table: NormTable) => {
    setSelectedAgeRange(norm.ageRange);
    onSelectNorm?.(norm, table);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BookOpen size={24} color={ProfessionalColors.trust.primary} />
            <View>
              <Text style={styles.headerTitle}>Norm Referansları</Text>
              <Text style={styles.headerSubtitle}>Yaş normları ve standart değerler</Text>
            </View>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={24} color={ProfessionalColors.text.secondary} />
          </Pressable>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Info size={16} color={ProfessionalColors.trust.primary} />
          <Text style={styles.infoText}>
            {childAge
              ? `${childAge} yaş için ilgili normlar vurgulanmıştır`
              : 'Danışanın yaş grubuna göre uygun normu seçin'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredTables.map(table => {
            const isExpanded = expandedTable === table.id;
            const matchingAge = findMatchingAgeRange(table.data);

            return (
              <View key={table.id} style={styles.tableContainer}>
                {/* Table Header */}
                <Pressable
                  style={({ pressed }) => [
                    styles.tableHeader,
                    pressed && styles.tableHeaderPressed,
                  ]}
                  onPress={() => toggleTable(table.id)}
                >
                  <View style={styles.tableHeaderContent}>
                    <Text style={styles.tableName}>{table.testName}</Text>
                    {table.subtest && <Text style={styles.tableSubtest}>{table.subtest}</Text>}
                    <View style={styles.tableMetaRow}>
                      <Text style={styles.tableMeta}>{table.population}</Text>
                      <Text style={styles.tableMetaDot}>•</Text>
                      <Text style={styles.tableMeta}>{table.year}</Text>
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color={ProfessionalColors.text.secondary} />
                  ) : (
                    <ChevronDown size={20} color={ProfessionalColors.text.secondary} />
                  )}
                </Pressable>

                {/* Expanded Content */}
                {isExpanded && (
                  <View style={styles.tableContent}>
                    {/* Source Citation */}
                    <View style={styles.sourceRow}>
                      <Text style={styles.sourceLabel}>Kaynak:</Text>
                      <Text style={styles.sourceValue}>{table.source}</Text>
                    </View>

                    {/* Column Headers */}
                    <View style={styles.dataHeader}>
                      <Text style={[styles.dataHeaderCell, styles.ageCell]}>Yaş</Text>
                      <Text style={[styles.dataHeaderCell, styles.statCell]}>M</Text>
                      <Text style={[styles.dataHeaderCell, styles.statCell]}>SD</Text>
                      <Text style={[styles.dataHeaderCell, styles.statCell]}>P50</Text>
                      <Text style={[styles.dataHeaderCell, styles.sampleCell]}>N</Text>
                    </View>

                    {/* Data Rows */}
                    {table.data.map((point, index) => {
                      const isMatching = matchingAge === point.ageRange;
                      const isSelected = selectedAgeRange === point.ageRange;

                      return (
                        <Pressable
                          key={index}
                          style={({ pressed }) => [
                            styles.dataRow,
                            isMatching && styles.dataRowMatching,
                            isSelected && styles.dataRowSelected,
                            pressed && styles.dataRowPressed,
                          ]}
                          onPress={() => handleSelectNorm(point, table)}
                        >
                          <Text
                            style={[
                              styles.dataCell,
                              styles.ageCell,
                              isMatching && styles.dataCellMatching,
                            ]}
                          >
                            {point.ageRange}
                          </Text>
                          <Text
                            style={[
                              styles.dataCell,
                              styles.statCell,
                              isMatching && styles.dataCellMatching,
                            ]}
                          >
                            {point.mean.toFixed(1)}
                          </Text>
                          <Text
                            style={[
                              styles.dataCell,
                              styles.statCell,
                              isMatching && styles.dataCellMatching,
                            ]}
                          >
                            {point.standardDeviation.toFixed(1)}
                          </Text>
                          <Text
                            style={[
                              styles.dataCell,
                              styles.statCell,
                              isMatching && styles.dataCellMatching,
                            ]}
                          >
                            {point.percentile50 ?? '-'}
                          </Text>
                          <Text
                            style={[
                              styles.dataCell,
                              styles.sampleCell,
                              isMatching && styles.dataCellMatching,
                            ]}
                          >
                            {point.sampleSize}
                          </Text>
                        </Pressable>
                      );
                    })}

                    {/* Percentile Detail */}
                    <View style={styles.percentileInfo}>
                      <Text style={styles.percentileTitle}>Yüzdelik Değerler</Text>
                      <View style={styles.percentileHeader}>
                        <Text style={[styles.percentileHeaderCell, styles.ageCell]}>Yaş</Text>
                        <Text style={styles.percentileHeaderCell}>P10</Text>
                        <Text style={styles.percentileHeaderCell}>P25</Text>
                        <Text style={styles.percentileHeaderCell}>P50</Text>
                        <Text style={styles.percentileHeaderCell}>P75</Text>
                        <Text style={styles.percentileHeaderCell}>P90</Text>
                      </View>
                      {table.data.map((point, index) => {
                        const isMatching = matchingAge === point.ageRange;
                        return (
                          <View
                            key={index}
                            style={[styles.percentileRow, isMatching && styles.dataRowMatching]}
                          >
                            <Text
                              style={[
                                styles.percentileCell,
                                styles.ageCell,
                                isMatching && styles.dataCellMatching,
                              ]}
                            >
                              {point.ageRange}
                            </Text>
                            <Text
                              style={[styles.percentileCell, isMatching && styles.dataCellMatching]}
                            >
                              {point.percentile10 ?? '-'}
                            </Text>
                            <Text
                              style={[styles.percentileCell, isMatching && styles.dataCellMatching]}
                            >
                              {point.percentile25 ?? '-'}
                            </Text>
                            <Text
                              style={[styles.percentileCell, isMatching && styles.dataCellMatching]}
                            >
                              {point.percentile50 ?? '-'}
                            </Text>
                            <Text
                              style={[styles.percentileCell, isMatching && styles.dataCellMatching]}
                            >
                              {point.percentile75 ?? '-'}
                            </Text>
                            <Text
                              style={[styles.percentileCell, isMatching && styles.dataCellMatching]}
                            >
                              {point.percentile90 ?? '-'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Kısaltmalar</Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>M</Text>
                <Text style={styles.legendValue}>Ortalama (Mean)</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>SD</Text>
                <Text style={styles.legendValue}>Standart Sapma</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>P</Text>
                <Text style={styles.legendValue}>Yüzdelik (Percentile)</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendKey}>N</Text>
                <Text style={styles.legendValue}>Örneklem Büyüklüğü</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['4'],
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: ProfessionalColors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: ProfessionalColors.trust.background,
    padding: spacing['3'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['3'],
    borderRadius: radius.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: ProfessionalColors.trust.primary,
  },
  content: {
    flex: 1,
    padding: spacing['4'],
  },
  tableContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    marginBottom: spacing['3'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    ...shadows.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['4'],
  },
  tableHeaderPressed: {
    backgroundColor: '#FAFAFA',
  },
  tableHeaderContent: {
    flex: 1,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  tableSubtest: {
    fontSize: 14,
    color: ProfessionalColors.trust.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  tableMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tableMeta: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
  },
  tableMetaDot: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    marginHorizontal: 6,
  },
  tableContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
    padding: spacing['3'],
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
    backgroundColor: Colors.neutral.gray50,
    padding: spacing['2'],
    borderRadius: radius.md,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ProfessionalColors.text.secondary,
  },
  sourceValue: {
    flex: 1,
    fontSize: 12,
    color: ProfessionalColors.text.primary,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['2'],
    backgroundColor: Colors.neutral.gray100,
    borderRadius: radius.md,
    marginBottom: spacing['1'],
  },
  dataHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: ProfessionalColors.text.secondary,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  dataRowMatching: {
    backgroundColor: '#EFF6FF',
  },
  dataRowSelected: {
    backgroundColor: ProfessionalColors.trust.background,
    borderColor: ProfessionalColors.trust.primary,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  dataRowPressed: {
    opacity: 0.7,
  },
  dataCell: {
    fontSize: 13,
    color: ProfessionalColors.text.primary,
    textAlign: 'center',
  },
  dataCellMatching: {
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
  },
  ageCell: {
    flex: 2,
    textAlign: 'left',
  },
  statCell: {
    flex: 1,
  },
  sampleCell: {
    flex: 1,
  },
  percentileInfo: {
    marginTop: spacing['4'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
  },
  percentileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
    marginBottom: spacing['2'],
  },
  percentileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['2'],
    backgroundColor: Colors.neutral.gray100,
    borderRadius: radius.md,
    marginBottom: spacing['1'],
  },
  percentileHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: ProfessionalColors.text.secondary,
    textAlign: 'center',
  },
  percentileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  percentileCell: {
    flex: 1,
    fontSize: 12,
    color: ProfessionalColors.text.primary,
    textAlign: 'center',
  },
  legend: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginTop: spacing['2'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
    marginBottom: spacing['3'],
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    width: '48%',
  },
  legendKey: {
    fontSize: 12,
    fontWeight: '700',
    color: ProfessionalColors.trust.primary,
    backgroundColor: ProfessionalColors.trust.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  legendValue: {
    fontSize: 12,
    color: ProfessionalColors.text.secondary,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default NormReferenceModal;
