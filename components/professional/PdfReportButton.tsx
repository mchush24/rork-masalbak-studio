/**
 * PdfReportButton - Export analysis to PDF
 * Phase 18: Professional Tools
 *
 * Reusable button component for PDF export functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  FileText,
  Download,
  Share2,
  Printer,
  X,
  User,
  Calendar,
  Building2,
  Check,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  buttonSizes,
  buttonStyles,
} from '@/constants/design-system';
import { SavedAnalysis } from '@/types/analysis';
import { pdfService, ClientInfo } from '@/lib/pdf';
import { showAlert } from '@/lib/platform';

interface PdfReportButtonProps {
  analysis: SavedAnalysis;
  variant?: 'button' | 'icon' | 'card';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function PdfReportButton({
  analysis,
  variant = 'button',
  size = 'medium',
  disabled = false,
}: PdfReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [parentName, setParentName] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handleExport = async (action: 'download' | 'share' | 'print') => {
    if (!clientName.trim()) {
      showAlert('Uyarı', 'Lütfen danışan adını girin.');
      return;
    }

    setIsExporting(true);

    try {
      const clientInfo: ClientInfo = {
        name: clientName.trim(),
        age: analysis.childAge,
        gender: analysis.childGender,
        parentName: parentName.trim() || undefined,
        sessionNumber: sessionNumber ? parseInt(sessionNumber) : undefined,
      };

      if (action === 'download' || action === 'share') {
        const pdfUri = await pdfService.exportToPdf(
          analysis,
          clientInfo,
          additionalNotes.trim() || undefined
        );

        if (action === 'share') {
          await pdfService.sharePdf(pdfUri);
        } else {
          showAlert('Başarılı', 'PDF raporu kaydedildi.');
        }
      } else if (action === 'print') {
        await pdfService.printPdf(analysis, clientInfo, additionalNotes.trim() || undefined);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('PDF export error:', error);
      showAlert('Hata', 'Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setClientName('');
    setParentName('');
    setSessionNumber('');
    setAdditionalNotes('');
  };

  const renderButton = () => {
    // Use standardized button sizes from design tokens
    const sizes = {
      small: {
        paddingH: buttonSizes.sm.paddingHorizontal,
        paddingV: buttonSizes.sm.paddingVertical,
        fontSize: buttonSizes.sm.fontSize,
        iconSize: buttonSizes.sm.iconSize,
      },
      medium: {
        paddingH: buttonSizes.md.paddingHorizontal,
        paddingV: buttonSizes.md.paddingVertical,
        fontSize: buttonSizes.md.fontSize,
        iconSize: buttonSizes.md.iconSize,
      },
      large: {
        paddingH: buttonSizes.lg.paddingHorizontal,
        paddingV: buttonSizes.lg.paddingVertical,
        fontSize: buttonSizes.lg.fontSize,
        iconSize: buttonSizes.lg.iconSize,
      },
    };

    const s = sizes[size];

    if (variant === 'icon') {
      return (
        <Animated.View style={animatedStyle}>
          <Pressable
            style={[styles.iconButton, disabled && styles.buttonDisabled]}
            onPress={() => setShowModal(true)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
          >
            <FileText size={s.iconSize} color={Colors.secondary.lavender} />
          </Pressable>
        </Animated.View>
      );
    }

    if (variant === 'card') {
      return (
        <Pressable
          style={[styles.cardButton, disabled && styles.buttonDisabled]}
          onPress={() => setShowModal(true)}
          disabled={disabled}
        >
          <View style={styles.cardIcon}>
            <FileText size={24} color={Colors.secondary.lavender} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>PDF Rapor Oluştur</Text>
            <Text style={styles.cardDescription}>Profesyonel rapor olarak dışa aktar</Text>
          </View>
          <Download size={18} color={Colors.neutral.medium} />
        </Pressable>
      );
    }

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[
            styles.button,
            { paddingHorizontal: s.paddingH, paddingVertical: s.paddingV },
            disabled && styles.buttonDisabled,
          ]}
          onPress={() => setShowModal(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
        >
          <FileText size={s.iconSize} color={Colors.neutral.white} />
          <Text style={[styles.buttonText, { fontSize: s.fontSize }]}>PDF Rapor</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <>
      {renderButton()}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>PDF Rapor Oluştur</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <X size={24} color={Colors.neutral.medium} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Client Info Section */}
            <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={18} color={Colors.secondary.lavender} />
                <Text style={styles.sectionTitle}>Danışan Bilgileri</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Danışan Adı *</Text>
                <TextInput
                  style={styles.input}
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="Örn: Ahmet Yılmaz"
                  placeholderTextColor={Colors.neutral.medium}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Ebeveyn Adı</Text>
                  <TextInput
                    style={styles.input}
                    value={parentName}
                    onChangeText={setParentName}
                    placeholder="Opsiyonel"
                    placeholderTextColor={Colors.neutral.medium}
                  />
                </View>
                <View style={[styles.inputGroup, { width: 100 }]}>
                  <Text style={styles.inputLabel}>Seans No</Text>
                  <TextInput
                    style={styles.input}
                    value={sessionNumber}
                    onChangeText={setSessionNumber}
                    placeholder="#"
                    placeholderTextColor={Colors.neutral.medium}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Analysis Info */}
              <View style={styles.analysisInfo}>
                <View style={styles.infoItem}>
                  <Calendar size={14} color={Colors.neutral.medium} />
                  <Text style={styles.infoText}>
                    Analiz: {new Date(analysis.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <FileText size={14} color={Colors.neutral.medium} />
                  <Text style={styles.infoText}>Test: {analysis.taskType}</Text>
                </View>
                {analysis.childAge && (
                  <View style={styles.infoItem}>
                    <User size={14} color={Colors.neutral.medium} />
                    <Text style={styles.infoText}>Yaş: {analysis.childAge}</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Notes Section */}
            <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building2 size={18} color={Colors.emotion.trust} />
                <Text style={styles.sectionTitle}>Ek Notlar</Text>
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                placeholder="Rapora eklemek istediğiniz klinik notlar..."
                placeholderTextColor={Colors.neutral.medium}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Animated.View>

            {/* Export Options */}
            <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>Dışa Aktarma Seçenekleri</Text>

              <View style={styles.exportOptions}>
                <Pressable
                  style={styles.exportOption}
                  onPress={() => handleExport('download')}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color={Colors.secondary.lavender} />
                  ) : (
                    <Download size={24} color={Colors.secondary.lavender} />
                  )}
                  <Text style={styles.exportOptionText}>Kaydet</Text>
                </Pressable>

                <Pressable
                  style={styles.exportOption}
                  onPress={() => handleExport('share')}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color={Colors.emotion.trust} />
                  ) : (
                    <Share2 size={24} color={Colors.emotion.trust} />
                  )}
                  <Text style={styles.exportOptionText}>Paylaş</Text>
                </Pressable>

                {Platform.OS !== 'web' && (
                  <Pressable
                    style={styles.exportOption}
                    onPress={() => handleExport('print')}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <ActivityIndicator size="small" color={Colors.emotion.joy} />
                    ) : (
                      <Printer size={24} color={Colors.emotion.joy} />
                    )}
                    <Text style={styles.exportOptionText}>Yazdır</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>

            {/* Footer Note */}
            <View style={styles.footerNote}>
              <Check size={14} color={Colors.neutral.medium} />
              <Text style={styles.footerNoteText}>
                Rapor, profesyonel kullanım için optimize edilmiş formatta oluşturulacaktır.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Button Variants - Using standardized button tokens
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.secondary.lavender,
    borderRadius: buttonSizes.md.borderRadius,
    ...buttonStyles.elevated,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontFamily: typography.family.semibold,
  },
  buttonDisabled: {
    opacity: buttonStyles.disabledOpacity,
  },
  iconButton: {
    ...buttonStyles.iconButton.md,
    backgroundColor: Colors.secondary.lavender + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['4'],
    ...shadows.xs,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: Colors.secondary.lavender + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['3'],
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['0.5'] || 2,
  },
  cardDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  modalTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
  },

  // Inputs
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: typography.family.medium,
    color: Colors.neutral.medium,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.neutral.darkest,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Analysis Info
  analysisInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.neutral.medium,
  },

  // Export Options
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  exportOption: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightest,
    minWidth: 80,
  },
  exportOptionText: {
    fontSize: 13,
    fontFamily: typography.family.medium,
    color: Colors.neutral.dark,
  },

  // Footer
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.neutral.medium,
    lineHeight: 18,
  },
});

export default PdfReportButton;
