/**
 * Report Export Button
 * Phase 18: Professional Tools
 *
 * Button component for exporting analysis reports
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import Animated, { SlideInUp } from 'react-native-reanimated';
import {
  FileText,
  Download,
  Share2,
  Check,
  X,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, buttonSizes, buttonStyles } from '@/constants/design-system';
import {
  PdfReportService,
  ReportAnalysis,
  ReportOptions,
} from '@/lib/professional/PdfReportService';
import { DataExportService, ExportFormat } from '@/lib/professional/DataExportService';
import { useFeedback } from '@/hooks/useFeedback';
import { useProfessionalMode } from '@/lib/professional';

interface ReportExportButtonProps {
  analysis: ReportAnalysis;
  variant?: 'icon' | 'button' | 'menu';
  onExportComplete?: (format: string) => void;
  onError?: (error: Error) => void;
}

export function ReportExportButton({
  analysis,
  variant = 'button',
  onExportComplete,
  onError,
}: ReportExportButtonProps) {
  const { feedback } = useFeedback();
  const { settings, features } = useProfessionalMode();
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handlePdfExport = async () => {
    feedback('tap');
    setIsExporting(true);
    try {
      const options: ReportOptions = {
        clinicName: settings.clinicName,
        clinicLogo: settings.clinicLogo,
        professionalName: settings.professionalName,
        professionalTitle: settings.professionalTitle,
        language: settings.defaultReportLanguage,
        includeImage: true,
        includeRecommendations: true,
        includeNotes: true,
      };
      await PdfReportService.generateAndShare(analysis, options);
      setExportSuccess(true);
      feedback('success');
      onExportComplete?.('pdf');
      setTimeout(() => {
        setExportSuccess(false);
        setShowModal(false);
      }, 1500);
    } catch (error) {
      feedback('error');
      onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataExport = async (format: ExportFormat) => {
    feedback('tap');
    setIsExporting(true);
    try {
      const analysisData = [
        {
          id: analysis.id,
          type: analysis.type,
          childName: analysis.childName,
          childAge: analysis.childAge,
          date: analysis.date,
          emotionalTones: analysis.emotionalTones,
          analysis: analysis.analysis,
          notes: analysis.clinicalNotes,
        },
      ];
      await DataExportService.exportAndShare(analysisData, format);
      setExportSuccess(true);
      feedback('success');
      onExportComplete?.(format);
      setTimeout(() => {
        setExportSuccess(false);
        setShowModal(false);
      }, 1500);
    } catch (error) {
      feedback('error');
      onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <Pressable
            onPress={() => {
              feedback('tap');
              setShowModal(true);
            }}
            style={styles.iconButton}
          >
            <Share2 size={20} color={Colors.secondary.lavender} />
          </Pressable>
        );
      case 'menu':
        return (
          <Pressable
            onPress={() => {
              feedback('tap');
              setShowModal(true);
            }}
            style={styles.menuButton}
          >
            <Download size={18} color={Colors.neutral.dark} />
            <Text style={styles.menuButtonText}>Disa Aktar</Text>
          </Pressable>
        );
      default:
        return (
          <Pressable
            onPress={() => {
              feedback('tap');
              setShowModal(true);
            }}
            style={styles.button}
          >
            <FileText size={18} color={Colors.neutral.white} />
            <Text style={styles.buttonText}>Rapor Olustur</Text>
          </Pressable>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Animated.View entering={SlideInUp} style={styles.modalContent}>
            <Pressable onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rapor Olustur</Text>
                <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <X size={20} color={Colors.neutral.medium} />
                </Pressable>
              </View>

              {isExporting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.secondary.lavender} />
                  <Text style={styles.loadingText}>Rapor hazirlaniyor...</Text>
                </View>
              ) : exportSuccess ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <Check size={32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.successText}>Basariyla olusturuldu!</Text>
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  <Pressable onPress={handlePdfExport} style={styles.exportOption}>
                    <View style={[styles.optionIcon, { backgroundColor: '#FFE5E5' }]}>
                      <FileText size={24} color="#E74C3C" />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>PDF Rapor</Text>
                      <Text style={styles.optionDesc}>Profesyonel rapor formati</Text>
                    </View>
                  </Pressable>

                  {features.csvExport && (
                    <Pressable onPress={() => handleDataExport('csv')} style={styles.exportOption}>
                      <View style={[styles.optionIcon, { backgroundColor: '#E5F5E5' }]}>
                        <FileSpreadsheet size={24} color="#27AE60" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>CSV Dosyasi</Text>
                        <Text style={styles.optionDesc}>Excel ile uyumlu</Text>
                      </View>
                    </Pressable>
                  )}

                  {features.jsonExport && (
                    <Pressable onPress={() => handleDataExport('json')} style={styles.exportOption}>
                      <View style={[styles.optionIcon, { backgroundColor: '#FFF5E5' }]}>
                        <FileJson size={24} color="#F39C12" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>JSON Verisi</Text>
                        <Text style={styles.optionDesc}>Ham veri yedekleme</Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Button variants - using standardized tokens
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary.lavender,
    paddingVertical: buttonSizes.md.paddingVertical,
    paddingHorizontal: buttonSizes.md.paddingHorizontal,
    borderRadius: buttonSizes.md.borderRadius,
    gap: spacing['2'],
    ...buttonStyles.elevated,
  },
  buttonText: {
    fontSize: buttonSizes.md.fontSize,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  iconButton: {
    padding: spacing['2.5'],
    backgroundColor: `${Colors.secondary.lavender}15`,
    borderRadius: radius.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
  },
  menuButtonText: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing['5'],
    paddingBottom: spacing['10'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['5'],
  },
  modalTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
  },
  closeButton: {
    padding: spacing['2'],
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['10'],
  },
  loadingText: {
    marginTop: spacing['4'],
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing['10'],
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: Colors.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  successText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.status.success,
  },
  optionsContainer: {
    gap: spacing['3'],
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['4'],
    backgroundColor: Colors.neutral.lighter,
    borderRadius: radius.md,
    gap: spacing['4'],
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
  },
  optionDesc: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginTop: spacing['0.5'] || 2,
  },
});

export default ReportExportButton;
