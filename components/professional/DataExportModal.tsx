/**
 * DataExportModal - Export data to CSV/JSON
 * Phase 18: Professional Tools
 *
 * Modal for exporting analysis data in various formats
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import {
  FileSpreadsheet,
  FileJson,
  Download,
  Share2,
  Calendar,
  FileText,
  Eye,
  X,
  Check,
  Info,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { SavedAnalysis } from '@/types/analysis';
import { dataExportService, ExportOptions, ExportResult } from '@/lib/export';
import { subDays, subMonths, subYears } from 'date-fns';
import { showAlert } from '@/lib/platform';

import { typography } from '@/constants/design-system';
interface DataExportModalProps {
  visible: boolean;
  onClose: () => void;
  analyses: SavedAnalysis[];
}

type ExportFormat = 'csv' | 'json' | 'statistics';
type DateRange = 'all' | 'week' | 'month' | '3months' | 'year';

export function DataExportModal({ visible, onClose, analyses }: DataExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const formatLabels: Record<
    ExportFormat,
    { label: string; description: string; icon: React.ReactNode }
  > = {
    csv: {
      label: 'CSV',
      description: 'Excel ve diğer programlarla uyumlu',
      icon: <FileSpreadsheet size={24} color={Colors.emotion.trust} />,
    },
    json: {
      label: 'JSON',
      description: 'Tam yedekleme (tüm detaylar)',
      icon: <FileJson size={24} color={Colors.emotion.anticipation} />,
    },
    statistics: {
      label: 'İstatistik',
      description: 'Özet istatistikler ve trendler',
      icon: <FileText size={24} color={Colors.secondary.lavender} />,
    },
  };

  const dateRangeLabels: Record<DateRange, string> = {
    all: 'Tümü',
    week: 'Son 7 Gün',
    month: 'Son 30 Gün',
    '3months': 'Son 3 Ay',
    year: 'Son 1 Yıl',
  };

  const getDateRange = (): ExportOptions['dateRange'] | undefined => {
    if (dateRange === 'all') return undefined;

    const now = new Date();
    let start: Date;

    switch (dateRange) {
      case 'week':
        start = subDays(now, 7);
        break;
      case 'month':
        start = subDays(now, 30);
        break;
      case '3months':
        start = subMonths(now, 3);
        break;
      case 'year':
        start = subYears(now, 1);
        break;
      default:
        return undefined;
    }

    return { start, end: now };
  };

  const getFilteredCount = (): number => {
    const range = getDateRange();
    if (!range) return analyses.length;

    return analyses.filter(a => {
      const date = new Date(a.createdAt);
      return date >= range.start && date <= range.end;
    }).length;
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const options: ExportOptions = {
        dateRange: getDateRange(),
        includeNotes,
        includeImages,
      };

      let result: ExportResult;

      switch (exportFormat) {
        case 'csv':
          result = await dataExportService.exportToCsv(analyses, options);
          break;
        case 'json':
          result = await dataExportService.exportToJson(analyses, options);
          break;
        case 'statistics':
          result = await dataExportService.exportStatistics(analyses);
          break;
      }

      setExportResult(result);
    } catch (error) {
      console.error('Export error:', error);
      showAlert('Hata', 'Dışa aktarma sırasında bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!exportResult) return;

    try {
      await dataExportService.shareFile(exportResult);
    } catch (error) {
      console.error('Share error:', error);
      showAlert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  const handleClose = () => {
    if (exportResult) {
      dataExportService.deleteFile(exportResult.uri);
    }
    setExportResult(null);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Download size={24} color={Colors.secondary.lavender} />
          <Text style={styles.title}>Veri Dışa Aktarma</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.neutral.medium} />
          </Pressable>
        </View>

        {exportResult ? (
          // Success State
          <Animated.View entering={SlideInUp} style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Check size={48} color={Colors.emotion.trust} />
            </View>
            <Text style={styles.successTitle}>Dışa Aktarma Tamamlandı!</Text>
            <Text style={styles.successFileName}>{exportResult.fileName}</Text>
            <Text style={styles.successFileSize}>{formatFileSize(exportResult.size)}</Text>

            <View style={styles.successActions}>
              <Pressable style={styles.shareButton} onPress={handleShare}>
                <Share2 size={20} color={Colors.neutral.white} />
                <Text style={styles.shareButtonText}>Paylaş / Kaydet</Text>
              </Pressable>
              <Pressable style={styles.doneButton} onPress={handleClose}>
                <Text style={styles.doneButtonText}>Tamam</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          // Export Options
          <View style={styles.content}>
            {/* Format Selection */}
            <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
              <Text style={styles.sectionTitle}>Format</Text>
              <View style={styles.formatOptions}>
                {(Object.keys(formatLabels) as ExportFormat[]).map(format => (
                  <Pressable
                    key={format}
                    style={[
                      styles.formatOption,
                      exportFormat === format && styles.formatOptionActive,
                    ]}
                    onPress={() => setExportFormat(format)}
                  >
                    {formatLabels[format].icon}
                    <Text
                      style={[
                        styles.formatOptionLabel,
                        exportFormat === format && styles.formatOptionLabelActive,
                      ]}
                    >
                      {formatLabels[format].label}
                    </Text>
                    <Text style={styles.formatOptionDescription}>
                      {formatLabels[format].description}
                    </Text>
                    {exportFormat === format && (
                      <View style={styles.formatCheckmark}>
                        <Check size={14} color={Colors.neutral.white} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Date Range */}
            <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color={Colors.neutral.medium} />
                <Text style={styles.sectionTitle}>Tarih Aralığı</Text>
              </View>
              <View style={styles.dateRangeOptions}>
                {(Object.keys(dateRangeLabels) as DateRange[]).map(range => (
                  <Pressable
                    key={range}
                    style={[
                      styles.dateRangeChip,
                      dateRange === range && styles.dateRangeChipActive,
                    ]}
                    onPress={() => setDateRange(range)}
                  >
                    <Text
                      style={[
                        styles.dateRangeChipText,
                        dateRange === range && styles.dateRangeChipTextActive,
                      ]}
                    >
                      {dateRangeLabels[range]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.countText}>{getFilteredCount()} analiz seçildi</Text>
            </Animated.View>

            {/* Options */}
            {exportFormat !== 'statistics' && (
              <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
                <Text style={styles.sectionTitle}>Seçenekler</Text>

                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <FileText size={18} color={Colors.neutral.medium} />
                    <Text style={styles.optionLabel}>Notları dahil et</Text>
                  </View>
                  <Switch
                    value={includeNotes}
                    onValueChange={setIncludeNotes}
                    trackColor={{
                      false: Colors.neutral.lighter,
                      true: Colors.secondary.lavender + '50',
                    }}
                    thumbColor={includeNotes ? Colors.secondary.lavender : Colors.neutral.medium}
                  />
                </View>

                {exportFormat === 'json' && (
                  <View style={styles.optionRow}>
                    <View style={styles.optionInfo}>
                      <Eye size={18} color={Colors.neutral.medium} />
                      <Text style={styles.optionLabel}>{"Resim URL'lerini dahil et"}</Text>
                    </View>
                    <Switch
                      value={includeImages}
                      onValueChange={setIncludeImages}
                      trackColor={{
                        false: Colors.neutral.lighter,
                        true: Colors.secondary.lavender + '50',
                      }}
                      thumbColor={includeImages ? Colors.secondary.lavender : Colors.neutral.medium}
                    />
                  </View>
                )}
              </Animated.View>
            )}

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Info size={14} color={Colors.neutral.medium} />
              <Text style={styles.infoNoteText}>
                Dışa aktarılan veriler cihazınıza kaydedilecek ve paylaşılabilecektir. Hassas
                verileri korumak için dikkatli olun.
              </Text>
            </View>

            {/* Export Button */}
            <Pressable
              style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
              onPress={handleExport}
              disabled={isExporting || getFilteredCount() === 0}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={Colors.neutral.white} />
              ) : (
                <>
                  <Download size={20} color={Colors.neutral.white} />
                  <Text style={styles.exportButtonText}>Dışa Aktar</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
    marginBottom: 12,
  },
  formatOptions: {
    gap: 10,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  formatOptionActive: {
    borderColor: Colors.secondary.lavender,
    backgroundColor: Colors.secondary.lavender + '08',
  },
  formatOptionLabel: {
    fontSize: 15,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
    marginLeft: 12,
  },
  formatOptionLabelActive: {
    color: Colors.secondary.lavender,
  },
  formatOptionDescription: {
    flex: 1,
    fontSize: 12,
    color: Colors.neutral.medium,
    marginLeft: 8,
    textAlign: 'right',
  },
  formatCheckmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.secondary.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dateRangeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateRangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
  },
  dateRangeChipActive: {
    backgroundColor: Colors.secondary.lavender + '15',
    borderColor: Colors.secondary.lavender,
  },
  dateRangeChipText: {
    fontSize: 13,
    color: Colors.neutral.medium,
  },
  dateRangeChipTextActive: {
    color: Colors.secondary.lavender,
    fontFamily: typography.family.semibold,
  },
  countText: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.neutral.darkest,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 16,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.neutral.medium,
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary.lavender,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },

  // Success State
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.emotion.trust + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: 8,
  },
  successFileName: {
    fontSize: 14,
    fontFamily: typography.family.medium,
    color: Colors.neutral.dark,
    marginBottom: 4,
  },
  successFileSize: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginBottom: 32,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary.lavender,
    borderRadius: 12,
    paddingVertical: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  doneButtonText: {
    fontSize: 15,
    fontFamily: typography.family.medium,
    color: Colors.neutral.medium,
  },
});

export default DataExportModal;
