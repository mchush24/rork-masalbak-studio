/**
 * Report Export Button
 * Phase 18: Professional Tools
 *
 * Button component for exporting analysis reports
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import {
  FileText,
  Download,
  Share2,
  Check,
  X,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { PdfReportService, ReportAnalysis, ReportOptions } from '@/lib/professional/PdfReportService';
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
      const analysisData = [{
        id: analysis.id,
        type: analysis.type,
        childName: analysis.childName,
        childAge: analysis.childAge,
        date: analysis.date,
        emotionalTones: analysis.emotionalTones,
        analysis: analysis.analysis,
        notes: analysis.clinicalNotes,
      }];
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
            onPress={() => { feedback('tap'); setShowModal(true); }}
            style={styles.iconButton}
          >
            <Share2 size={20} color={Colors.primary.purple} />
          </Pressable>
        );
      case 'menu':
        return (
          <Pressable
            onPress={() => { feedback('tap'); setShowModal(true); }}
            style={styles.menuButton}
          >
            <Download size={18} color={Colors.neutral.dark} />
            <Text style={styles.menuButtonText}>Disa Aktar</Text>
          </Pressable>
        );
      default:
        return (
          <Pressable
            onPress={() => { feedback('tap'); setShowModal(true); }}
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
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rapor Olustur</Text>
                <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
                  <X size={20} color={Colors.neutral.medium} />
                </Pressable>
              </View>

              {isExporting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary.purple} />
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
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary.purple,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  buttonText: { fontSize: 15, fontWeight: '600', color: Colors.neutral.white },
  iconButton: { padding: 10, backgroundColor: \`\${Colors.primary.purple}15\`, borderRadius: 10 },
  menuButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  menuButtonText: { fontSize: 15, color: Colors.neutral.dark },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.neutral.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral.dark },
  closeButton: { padding: 8 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 16, fontSize: 15, color: Colors.neutral.medium },
  successContainer: { alignItems: 'center', paddingVertical: 40 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.status.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successText: { fontSize: 16, fontWeight: '600', color: Colors.status.success },
  optionsContainer: { gap: 12 },
  exportOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.neutral.lighter,
    borderRadius: 12, gap: 16 },
  optionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: Colors.neutral.dark },
  optionDesc: { fontSize: 13, color: Colors.neutral.medium, marginTop: 2 },
});

export default ReportExportButton;
